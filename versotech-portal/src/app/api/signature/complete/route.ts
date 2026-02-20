import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resolveAgentIdForTask } from '@/lib/agents'
import { buildExecutedDocumentName, formatCounterpartyName } from '@/lib/documents/executed-document-name'
import crypto from 'crypto'

function normalizeWebhookSignature(rawSignature: string): string | null {
  const trimmed = rawSignature.trim()
  if (!trimmed) return null

  // Accept either plain hex or provider-style "sha256=<hex>" header value.
  const value = trimmed.includes('=') ? trimmed.split('=').pop() || '' : trimmed
  if (!/^[a-f0-9]{64}$/i.test(value)) return null

  return value.toLowerCase()
}

function verifyWebhookSignature(
  rawBody: string,
  receivedSignature: string,
  webhookSecret: string
): boolean {
  const normalized = normalizeWebhookSignature(receivedSignature)
  if (!normalized) return false

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex')

  const receivedBuffer = Buffer.from(normalized, 'hex')
  const expectedBuffer = Buffer.from(expectedSignature, 'hex')

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
}

/**
 * Handle signature completion webhook
 * Supports both workflow-based signatures and Direct Subscribe flow signatures
 */
export async function POST(request: NextRequest) {
  // Get raw body for signature verification
  const rawBody = await request.text()

  // Verify webhook signature for security
  const receivedSignature = request.headers.get('x-signature-verification') ||
                           request.headers.get('x-dropbox-signature') ||
                           request.headers.get('x-docusign-signature-1')

  if (!receivedSignature) {
    console.error('⚠️ Webhook signature missing in headers')
    return NextResponse.json({ error: 'Unauthorized - no signature' }, { status: 401 })
  }

  const webhookSecret = process.env.ESIGN_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('❌ ESIGN_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  // Compare signatures (constant-time comparison after safe normalization/length check)
  const signatureValid = verifyWebhookSignature(rawBody, receivedSignature, webhookSecret)

  if (!signatureValid) {
    console.error('❌ Invalid webhook signature')
    return NextResponse.json({ error: 'Unauthorized - invalid signature' }, { status: 401 })
  }

  // Parse the verified body
  const body = JSON.parse(rawBody)
  const { signature_request_id, workflow_run_id, document_type, status } = body

  console.log('✅ Signature webhook verified and received:', {
    signature_request_id,
    workflow_run_id,
    document_type,
    status
  })

  const supabase = createServiceClient()

  // Check for countersignature notifications (CEO/Arranger)
  if (document_type === 'subscription') {
    const { data: sigRequest } = await supabase
      .from('signature_requests')
      .select('id, subscription_id, deal_id, signer_role')
      .eq('id', signature_request_id)
      .maybeSingle()

    const signerRole = sigRequest?.signer_role as string | undefined
    const isCountersign = signerRole === 'admin' || signerRole === 'arranger'

    if (isCountersign && sigRequest?.subscription_id) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
          id,
          deal_id,
          investor_id,
          investors (display_name, legal_name),
          deals (name)
        `)
        .eq('id', sigRequest.subscription_id)
        .single()

      const dealName = (subscription?.deals as any)?.name || 'the deal'
      const investorName = (subscription?.investors as any)?.display_name || (subscription?.investors as any)?.legal_name || 'Investor'
      const signerLabel = signerRole === 'arranger' ? 'Arranger' : 'CEO/Admin'

      if (subscription?.deal_id) {
        await notifyAssignedLawyers(supabase, subscription.deal_id, {
          title: 'Subscription Pack Countersigned',
          message: `${signerLabel} countersigned the subscription pack for ${investorName} (${dealName}).`,
          link: '/versotech_main/subscription-packs'
        })
      }
    }
  }

  // Handle NDA signature completion (Direct Subscribe flow)
  if (document_type === 'nda') {
    await handleNDACompletion(supabase, signature_request_id, workflow_run_id)
  }

  // Handle subscription signature completion
  if (document_type === 'subscription') {
    await handleSubscriptionCompletion(supabase, signature_request_id, workflow_run_id)
  }

  // Handle placement agreement signature completion
  if (document_type === 'placement_agreement') {
    await handlePlacementAgreementCompletion(supabase, signature_request_id)
  }

  // Handle introducer agreement signature completion
  if (document_type === 'introducer_agreement') {
    await handleIntroducerAgreementCompletion(supabase, signature_request_id)
  }

  return NextResponse.json({ success: true })
}

type LawyerNotificationPayload = {
  title: string
  message: string
  link?: string | null
}

async function notifyAssignedLawyers(
  supabase: ReturnType<typeof createServiceClient>,
  dealId: string,
  payload: LawyerNotificationPayload
) {
  // Primary: deal_lawyer_assignments
  const { data: assignments } = await supabase
    .from('deal_lawyer_assignments')
    .select('lawyer_id')
    .eq('deal_id', dealId)

  let lawyerIds = (assignments || []).map((a: any) => a.lawyer_id).filter(Boolean)

  // Fallback: lawyers.assigned_deals contains dealId
  if (lawyerIds.length === 0) {
    const { data: fallbackLawyers } = await supabase
      .from('lawyers')
      .select('id, assigned_deals')
      .contains('assigned_deals', [dealId])

    lawyerIds = (fallbackLawyers || []).map((lawyer: any) => lawyer.id).filter(Boolean)
  }

  if (lawyerIds.length === 0) return

  const { data: lawyerUsers } = await supabase
    .from('lawyer_users')
    .select('user_id')
    .in('lawyer_id', lawyerIds)

  if (!lawyerUsers || lawyerUsers.length === 0) return

  const notifications = lawyerUsers.map((lu: any) => ({
    user_id: lu.user_id,
    investor_id: null,
    title: payload.title,
    message: payload.message,
    link: payload.link || '/versotech_main/subscription-packs'
  }))

  await supabase.from('investor_notifications').insert(notifications)
}

/**
 * Handle NDA signature completion for Direct Subscribe flow
 * Updates deal_memberships and grants data room access
 */
async function handleNDACompletion(
  supabase: ReturnType<typeof createServiceClient>,
  signatureRequestId: string,
  workflowRunId?: string
) {
  console.log('🔵 [NDA] Handling NDA completion for signature:', signatureRequestId)

  // Get the signature request to find deal_id and investor_id
  const { data: sigRequest } = await supabase
    .from('signature_requests')
    .select('id, deal_id, investor_id, member_id, status')
    .eq('id', signatureRequestId)
    .single()

  if (!sigRequest) {
    console.error('❌ [NDA] Signature request not found:', signatureRequestId)
    return
  }

  // Direct Subscribe flow: deal_id is set directly on signature_request
  const dealId = sigRequest.deal_id
  const investorId = sigRequest.investor_id

  if (!dealId || !investorId) {
    console.log('⏭️ [NDA] No deal_id or investor_id - not a Direct Subscribe flow')
    return
  }

  console.log('📋 [NDA] Processing for deal:', dealId, 'investor:', investorId)

  // Check if ALL NDA signatories for this investor/deal have signed
  const { data: allNdaSignatures } = await supabase
    .from('signature_requests')
    .select('id, status, signer_role')
    .eq('deal_id', dealId)
    .eq('investor_id', investorId)
    .eq('document_type', 'nda')
    .in('signer_role', ['investor', 'authorized_signatory'])

  const investorSignatures = allNdaSignatures || []
  const allSigned = investorSignatures.length > 0 &&
                    investorSignatures.every(sig => sig.status === 'signed')

  console.log('📊 [NDA] Signature status:', {
    total: investorSignatures.length,
    all_signed: allSigned
  })

  if (!allSigned) {
    console.log('⏳ [NDA] Not all investor signatories have signed yet')
    return
  }

  const now = new Date().toISOString()

  // Archive executed NDA into Documents (if not already archived)
  try {
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('owner_investor_id', investorId)
      .eq('deal_id', dealId)
      .eq('type', 'nda')
      .limit(1)
      .maybeSingle()

    if (!existingDoc) {
      const { data: signedRequest } = await supabase
        .from('signature_requests')
        .select('signed_pdf_path, signed_pdf_size, updated_at')
        .eq('deal_id', dealId)
        .eq('investor_id', investorId)
        .eq('document_type', 'nda')
        .not('signed_pdf_path', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (signedRequest?.signed_pdf_path) {
        const { data: signedPdfData } = await supabase.storage
          .from(process.env.SIGNATURES_BUCKET || 'signatures')
          .download(signedRequest.signed_pdf_path)

        if (signedPdfData) {
          const { data: deal } = await supabase
            .from('deals')
            .select('id, name, vehicle_id')
            .eq('id', dealId)
            .single()

          const { data: investor } = await supabase
            .from('investors')
            .select('id, legal_name, display_name, first_name, last_name, type')
            .eq('id', investorId)
            .single()

          const investorName = formatCounterpartyName({
            type: investor?.type,
            firstName: investor?.first_name,
            lastName: investor?.last_name,
            legalName: investor?.legal_name,
            displayName: investor?.display_name
          })

          const { data: vehicle } = deal?.vehicle_id
            ? await supabase
                .from('vehicles')
                .select('entity_code')
                .eq('id', deal.vehicle_id)
                .maybeSingle()
            : { data: null }

          const vehicleCode = vehicle?.entity_code || 'VCXXX'
          const { displayName: executedDocumentName, storageFileName } = buildExecutedDocumentName({
            vehicleCode,
            documentLabel: 'NDA NDNC',
            counterpartyName: investorName
          })

          let ndaFolderId: string | null = null
          if (deal?.vehicle_id) {
            const { data: ndaFolder } = await supabase
              .from('document_folders')
              .select('id')
              .eq('vehicle_id', deal.vehicle_id)
              .eq('name', 'NDAs')
              .single()

            ndaFolderId = ndaFolder?.id || null
          }

          const timestamp = Date.now()
          const documentFileName = `ndas/${dealId}/${timestamp}-${storageFileName}`
          const { data: docUploadData, error: docUploadError } = await supabase.storage
            .from(process.env.STORAGE_BUCKET_NAME || 'documents')
            .upload(documentFileName, signedPdfData, {
              contentType: 'application/pdf',
              upsert: false
            })

          if (docUploadError) {
            console.error('❌ [NDA] Failed to archive NDA PDF:', docUploadError)
          } else {
            await supabase
              .from('documents')
              .insert({
                owner_investor_id: investorId,
                deal_id: dealId,
                vehicle_id: deal?.vehicle_id || null,
                folder_id: ndaFolderId,
                type: 'nda',
                file_key: docUploadData.path,
                name: executedDocumentName,
                description: `Fully executed Non-Disclosure Agreement for ${deal?.name || 'deal'}`.substring(0, 500),
                tags: ['nda', 'signed', 'executed'],
                mime_type: 'application/pdf',
                file_size_bytes: signedRequest?.signed_pdf_size || null,
                is_published: true,
                published_at: now,
                status: 'published',
                current_version: 1,
                signature_workflow_run_id: workflowRunId || null
              })
          }
        }
      }
    }
  } catch (archiveError) {
    console.error('❌ [NDA] Failed to archive executed NDA:', archiveError)
  }

  // Check if this is a Direct Subscribe NDA (has associated pending subscription)
  // If yes, skip data room access grant - Direct Subscribe doesn't get data room
  const { data: associatedSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('deal_id', dealId)
    .eq('investor_id', investorId)
    .in('status', ['pending', 'committed'])
    .limit(1)
    .maybeSingle()

  const isDirectSubscribe = !!associatedSub
  console.log('📋 [NDA] Is Direct Subscribe path:', isDirectSubscribe, 'subscription:', associatedSub?.id)

  // Get investor users for membership updates
  const { data: investorUsers } = await supabase
    .from('investor_users')
    .select('user_id')
    .eq('investor_id', investorId)

  const agentId = await resolveAgentIdForTask(supabase, 'V001')

  if (investorUsers && investorUsers.length > 0) {
    // For Direct Subscribe: update only nda_signed_at (no data_room_granted_at)
    // For Interest Path: update both nda_signed_at and data_room_granted_at
    const membershipUpdate = isDirectSubscribe
      ? { nda_signed_at: now }
      : { nda_signed_at: now, data_room_granted_at: now }

    for (const iu of investorUsers) {
      await supabase
        .from('deal_memberships')
        .update(membershipUpdate)
        .eq('deal_id', dealId)
        .eq('user_id', iu.user_id)
    }
    console.log('✅ [NDA] Updated deal_memberships for', investorUsers.length, 'user(s)')
  }

  // Only grant data room access for Interest Path (not Direct Subscribe)
  if (!isDirectSubscribe) {
    // Grant data room access (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error: accessError } = await supabase
      .from('deal_data_room_access')
      .upsert({
        deal_id: dealId,
        investor_id: investorId,
        granted_at: now,
        expires_at: expiresAt,
        auto_granted: true,
        revoked_at: null
      }, { onConflict: 'deal_id,investor_id' })

    if (accessError) {
      console.error('❌ [NDA] Failed to grant data room access:', accessError)
    } else {
      console.log('✅ [NDA] Data room access granted until:', expiresAt)
    }

    // Create notification for investor (data room unlocked)
    if (investorUsers && investorUsers.length > 0) {
      const { data: deal } = await supabase
        .from('deals')
        .select('name')
        .eq('id', dealId)
        .single()

      const { data: existingNotification } = await supabase
        .from('investor_notifications')
        .select('id')
        .eq('user_id', investorUsers[0].user_id)
        .eq('investor_id', investorId)
        .contains('metadata', { type: 'nda_complete', deal_id: dealId })
        .limit(1)
        .maybeSingle()

      if (!existingNotification) {
        await supabase.from('investor_notifications').insert({
          user_id: investorUsers[0].user_id,
          investor_id: investorId,
          title: 'Data room unlocked',
          message: `Your NDA for ${deal?.name || 'the deal'} is complete. The data room is now available.`,
          link: `/versotech_main/opportunities/${dealId}`,
          metadata: { type: 'nda_complete', deal_id: dealId },
          agent_id: agentId
        })
        console.log('✅ [NDA] Notification created')
      } else {
        console.log('⏭️ [NDA] Data-room notification already exists, skipping duplicate')
      }
    }
  } else {
    console.log('⏭️ [NDA] Direct Subscribe path - skipping data room access grant')

    // Create a different notification for Direct Subscribe (NDA signed, awaiting subscription)
    if (investorUsers && investorUsers.length > 0) {
      const { data: deal } = await supabase
        .from('deals')
        .select('name')
        .eq('id', dealId)
        .single()

      const { data: existingNotification } = await supabase
        .from('investor_notifications')
        .select('id')
        .eq('user_id', investorUsers[0].user_id)
        .eq('investor_id', investorId)
        .contains('metadata', { type: 'nda_complete_direct_subscribe', deal_id: dealId })
        .limit(1)
        .maybeSingle()

      if (!existingNotification) {
        await supabase.from('investor_notifications').insert({
          user_id: investorUsers[0].user_id,
          investor_id: investorId,
          title: 'NDA signed',
          message: `Your NDA for ${deal?.name || 'the deal'} is complete. Please complete the subscription pack signing.`,
          link: `/versotech_main/opportunities/${dealId}`,
          metadata: { type: 'nda_complete_direct_subscribe', deal_id: dealId },
          agent_id: agentId
        })
        console.log('✅ [NDA] Direct Subscribe notification created')
      } else {
        console.log('⏭️ [NDA] Direct-subscribe notification already exists, skipping duplicate')
      }
    }
  }

  console.log('🎉 [NDA] NDA completion processing finished')
}

/**
 * Handle subscription signature completion
 * Updates subscription status and timestamps
 */
async function handleSubscriptionCompletion(
  supabase: ReturnType<typeof createServiceClient>,
  signatureRequestId: string,
  workflowRunId?: string
) {
  console.log('🔵 [SUBSCRIPTION] Handling completion for signature:', signatureRequestId)

  // Get the signature request to find subscription_id
  const { data: sigRequest } = await supabase
    .from('signature_requests')
    .select('id, subscription_id, investor_id, deal_id, status')
    .eq('id', signatureRequestId)
    .single()

  if (!sigRequest?.subscription_id) {
    // Fall back to workflow_run_id based lookup (legacy flow)
    if (workflowRunId) {
      const { data: signatures } = await supabase
        .from('signature_requests')
        .select('*')
        .eq('workflow_run_id', workflowRunId)
        .order('created_at', { ascending: true })

      const allSigned = signatures?.every(sig => sig.status === 'signed')

      if (allSigned && workflowRunId) {
        await supabase
          .from('documents')
          .update({ status: 'signed' })
          .eq('id', workflowRunId)

        const { data: document } = await supabase
          .from('documents')
          .select('subscription_id')
          .eq('id', workflowRunId)
          .single()

        if (document?.subscription_id) {
          const now = new Date().toISOString()
          await supabase
            .from('subscriptions')
            .update({
              status: 'committed',
              signed_at: now,
              signed_doc_id: workflowRunId,
              committed_at: now
            })
            .eq('id', document.subscription_id)

          console.log('✅ [SUBSCRIPTION] Subscription committed (legacy flow):', document.subscription_id)
        }
      }
    }
    return
  }

  const subscriptionId = sigRequest.subscription_id

  // Check if ALL subscription signatories have signed (investor role only)
  const { data: allSubSignatures } = await supabase
    .from('signature_requests')
    .select('id, status, signer_role')
    .eq('subscription_id', subscriptionId)
    .eq('document_type', 'subscription')
    .in('signer_role', ['investor', 'authorized_signatory'])

  const investorSignatures = allSubSignatures || []
  const allSigned = investorSignatures.length > 0 &&
                    investorSignatures.every(sig => sig.status === 'signed')

  console.log('📊 [SUBSCRIPTION] Signature status:', {
    subscription_id: subscriptionId,
    total: investorSignatures.length,
    all_signed: allSigned
  })

  if (!allSigned) {
    console.log('⏳ [SUBSCRIPTION] Not all investor signatories have signed yet')
    return
  }

  const { data: existingSubscriptionState } = await supabase
    .from('subscriptions')
    .select('id, status, signed_at')
    .eq('id', subscriptionId)
    .maybeSingle()

  const alreadyCommitted = !!existingSubscriptionState &&
    existingSubscriptionState.status === 'committed' &&
    !!existingSubscriptionState.signed_at

  if (alreadyCommitted) {
    console.log('⏭️ [SUBSCRIPTION] Duplicate completion webhook - subscription already committed')
    await checkAndPublishSubscriptionDocument(supabase, subscriptionId)
    return
  }

  const now = new Date().toISOString()

  // Update subscription with signed_at and status
  // Note: pack_generated_at and pack_sent_at are set by subscribe route
  const { data: subscription, error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'committed',
      signed_at: now,
      committed_at: now
    })
    .eq('id', subscriptionId)
    .select('id, investor_id, deal_id, commitment, currency, vehicle_id')
    .single()

  if (updateError) {
    console.error('❌ [SUBSCRIPTION] Failed to update subscription:', updateError)
    return
  }

  console.log('✅ [SUBSCRIPTION] Subscription committed:', subscriptionId)

  // Create notification for investor
  if (subscription) {
    const { data: investorUsers } = await supabase
      .from('investor_users')
      .select('user_id')
      .eq('investor_id', subscription.investor_id)
      .limit(1)

    if (investorUsers && investorUsers.length > 0) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('name')
        .eq('id', subscription.vehicle_id)
        .single()

      await supabase.from('investor_notifications').insert({
        user_id: investorUsers[0].user_id,
        investor_id: subscription.investor_id,
        title: 'Investment Commitment Confirmed',
        message: `Your subscription for ${vehicle?.name || 'the investment'} of ${subscription.commitment} ${subscription.currency} is now confirmed.`,
        link: '/versotech_main/portfolio',
        metadata: {
          type: 'subscription_committed',
          subscription_id: subscriptionId,
          deal_id: subscription.deal_id
        }
      })
      console.log('✅ [SUBSCRIPTION] Investor notification created')
    }

    // Notify lawyers assigned to this deal
    const { data: investor } = await supabase
      .from('investors')
      .select('display_name, legal_name')
      .eq('id', subscription.investor_id)
      .single()

    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('name')
      .eq('id', subscription.vehicle_id)
      .single()

    const investorName = investor?.display_name || investor?.legal_name || 'An investor'

    if (subscription.deal_id) {
      await notifyAssignedLawyers(supabase, subscription.deal_id, {
        title: 'Subscription Pack Signed',
        message: `${investorName} has signed the subscription pack for ${vehicle?.name || 'the deal'}. Commitment: ${subscription.commitment.toLocaleString()} ${subscription.currency}`,
        link: '/versotech_main/subscription-packs'
      })
    }
  }

  // Check if ALL parties (investor + CEO + arranger) have signed the subscription pack
  // If so, publish the document so it's visible to investors
  await checkAndPublishSubscriptionDocument(supabase, subscriptionId)

  console.log('🎉 [SUBSCRIPTION] Subscription completion processing finished')
}

/**
 * Check if ALL signature requests for a subscription are complete
 * If so, publish the document (is_published=true, status='published')
 *
 * This is called after EVERY signature completion to check if the pack is fully signed.
 * For subscription packs, we need ALL parties to sign:
 * - party_a (investor/authorized_signatory)
 * - party_b (CEO/admin)
 * - party_c (arranger)
 */
async function checkAndPublishSubscriptionDocument(
  supabase: ReturnType<typeof createServiceClient>,
  subscriptionId: string
) {
  console.log('📋 [PUBLISH CHECK] Checking if subscription pack is fully signed:', subscriptionId)

  // Get ALL signature requests for this subscription (all roles, all parties)
  const { data: allSignatures, error: sigError } = await supabase
    .from('signature_requests')
    .select('id, status, signer_role, signature_position, document_id')
    .eq('subscription_id', subscriptionId)
    .eq('document_type', 'subscription')

  if (sigError || !allSignatures || allSignatures.length === 0) {
    console.log('⏭️ [PUBLISH CHECK] No signature requests found for subscription')
    return
  }

  // Check if ALL signatures are complete
  const allComplete = allSignatures.every(sig => sig.status === 'signed')
  const signedCount = allSignatures.filter(sig => sig.status === 'signed').length

  console.log(`📊 [PUBLISH CHECK] Signature status: ${signedCount}/${allSignatures.length} signed, all_complete=${allComplete}`)

  if (!allComplete) {
    console.log('⏳ [PUBLISH CHECK] Not all parties have signed yet')
    return
  }

  // Get the document_id from any signature request (they all reference the same document)
  const documentId = allSignatures[0]?.document_id
  if (!documentId) {
    console.warn('⚠️ [PUBLISH CHECK] No document_id found on signature requests')
    return
  }

  // Update the document to be published
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      is_published: true,
      status: 'published',
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId)

  if (updateError) {
    console.error('❌ [PUBLISH CHECK] Failed to publish document:', updateError)
  } else {
    console.log('✅ [PUBLISH CHECK] Document published! Investors can now see the signed subscription pack:', documentId)

    // Safety net: Ensure signed_at is set when ALL parties have signed
    // This handles cases where the investor-only flow didn't set it
    const { error: signedAtError } = await supabase
      .from('subscriptions')
      .update({ signed_at: new Date().toISOString() })
      .eq('id', subscriptionId)
      .is('signed_at', null)  // Only update if not already set

    if (signedAtError) {
      console.error('❌ [PUBLISH CHECK] Failed to set signed_at:', signedAtError)
    } else {
      console.log('✅ [PUBLISH CHECK] Subscription signed_at ensured for:', subscriptionId)
    }
  }
}

/**
 * Handle placement agreement signature completion
 * Updates agreement status to active when all parties have signed
 */
async function handlePlacementAgreementCompletion(
  supabase: ReturnType<typeof createServiceClient>,
  signatureRequestId: string
) {
  console.log('🔵 [PLACEMENT AGREEMENT] Handling completion for signature:', signatureRequestId)

  // Get the signature request with placement agreement details
  const { data: sigRequest } = await supabase
    .from('signature_requests')
    .select('id, placement_agreement_id, placement_id, signature_position, status')
    .eq('id', signatureRequestId)
    .single()

  if (!sigRequest?.placement_agreement_id) {
    console.log('⏭️ [PLACEMENT AGREEMENT] No placement_agreement_id - skipping')
    return
  }

  const agreementId = sigRequest.placement_agreement_id
  console.log('📋 [PLACEMENT AGREEMENT] Processing for agreement:', agreementId)

  // Get the placement agreement with commercial partner
  const { data: agreement } = await supabase
    .from('placement_agreements')
    .select(`
      *,
      commercial_partner:commercial_partner_id (
        id,
        legal_name,
        display_name
      )
    `)
    .eq('id', agreementId)
    .single()

  if (!agreement) {
    console.error('❌ [PLACEMENT AGREEMENT] Agreement not found:', agreementId)
    return
  }

  // Check which party signed
  if (sigRequest.signature_position === 'party_a') {
    // CEO signed - update status to pending CP signature
    console.log('👔 [PLACEMENT AGREEMENT] CEO (party_a) signed')

    await supabase
      .from('placement_agreements')
      .update({
        status: 'pending_cp_signature',
        ceo_signature_request_id: signatureRequestId,
        updated_at: new Date().toISOString()
      })
      .eq('id', agreementId)

    // Notify commercial partner users
    const { data: cpUsers } = await supabase
      .from('commercial_partner_users')
      .select('user_id')
      .eq('commercial_partner_id', agreement.commercial_partner_id)

    if (cpUsers && cpUsers.length > 0) {
      const notifications = cpUsers.map((cpu: any) => ({
        user_id: cpu.user_id,
        investor_id: null,
        title: 'Placement Agreement Ready for Signature',
        message: 'Your placement agreement has been signed by VERSO and is ready for your signature.',
        link: `/versotech_main/placement-agreements/${agreementId}`,
        type: 'placement_agreement',
        deal_id: null
      }))

      await supabase.from('investor_notifications').insert(notifications)
      console.log('✅ [PLACEMENT AGREEMENT] Notified CP users')
    }

  } else if (sigRequest.signature_position === 'party_b') {
    // Commercial Partner signed - agreement is now active
    console.log('🏢 [PLACEMENT AGREEMENT] CP (party_b) signed - activating agreement')

    const now = new Date().toISOString()

    await supabase
      .from('placement_agreements')
      .update({
        status: 'active',
        cp_signature_request_id: signatureRequestId,
        signed_date: now.split('T')[0], // date type, not timestamptz
        updated_at: now
      })
      .eq('id', agreementId)

    // Notify CP users that agreement is active
    const { data: cpUsers } = await supabase
      .from('commercial_partner_users')
      .select('user_id')
      .eq('commercial_partner_id', agreement.commercial_partner_id)

    const cpName = (agreement.commercial_partner as any)?.legal_name ||
                   (agreement.commercial_partner as any)?.display_name ||
                   'Commercial Partner'

    if (cpUsers && cpUsers.length > 0) {
      const notifications = cpUsers.map((cpu: any) => ({
        user_id: cpu.user_id,
        investor_id: null,
        title: 'Placement Agreement Active',
        message: 'Your placement agreement is now fully executed and active.',
        link: `/versotech_main/placement-agreements/${agreementId}`,
        type: 'placement_agreement',
        deal_id: null
      }))

      await supabase.from('investor_notifications').insert(notifications)
      console.log('✅ [PLACEMENT AGREEMENT] Notified CP users of activation')
    }

    // Notify staff_admin/CEO users
    const { data: staffUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'staff_admin')
      .limit(5)

    if (staffUsers && staffUsers.length > 0) {
      const staffNotifications = staffUsers.map((staff: any) => ({
        user_id: staff.id,
        investor_id: null,
        title: 'Placement Agreement Executed',
        message: `Placement agreement with ${cpName} has been fully executed and is now active.`,
        link: `/versotech_main/placement-agreements/${agreementId}`,
        type: 'placement_agreement',
        deal_id: null
      }))

      await supabase.from('investor_notifications').insert(staffNotifications)
      console.log('✅ [PLACEMENT AGREEMENT] Notified staff users')
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      event_type: 'commercial_partner',
      action: 'placement_agreement_activated',
      entity_type: 'placement_agreement',
      entity_id: agreementId,
      actor_id: null,
      action_details: {
        description: 'Placement agreement fully executed and activated',
        commercial_partner_id: agreement.commercial_partner_id,
        agreement_id: agreementId,
        signature_request_id: signatureRequestId
      },
      timestamp: now
    })
  }

  console.log('🎉 [PLACEMENT AGREEMENT] Completion processing finished')
}

/**
 * Handle introducer agreement signature completion
 * Supports multi-party signature chain: Arranger (optional) → CEO → Introducer
 * Updates agreement status to active when all parties have signed
 */
async function handleIntroducerAgreementCompletion(
  supabase: ReturnType<typeof createServiceClient>,
  signatureRequestId: string
) {
  console.log('🔵 [INTRODUCER AGREEMENT] Handling completion for signature:', signatureRequestId)

  // Get the signature request with introducer agreement details
  const { data: sigRequest } = await supabase
    .from('signature_requests')
    .select('id, introducer_agreement_id, introducer_id, signer_role, signature_position, status, signed_pdf_path')
    .eq('id', signatureRequestId)
    .single()

  if (!sigRequest?.introducer_agreement_id) {
    console.log('⏭️ [INTRODUCER AGREEMENT] No introducer_agreement_id - skipping')
    return
  }

  const agreementId = sigRequest.introducer_agreement_id
  console.log('📋 [INTRODUCER AGREEMENT] Processing for agreement:', agreementId, 'signer_role:', sigRequest.signer_role)

  // Get the introducer agreement with introducer, arranger, and deal info
  const { data: agreement } = await supabase
    .from('introducer_agreements')
    .select(`
      *,
      introducer:introducer_id (
        id,
        legal_name,
        display_name,
        first_name,
        last_name,
        type,
        email
      ),
      arranger:arranger_id (
        id,
        legal_name
      ),
      deal:deal_id (
        id,
        name,
        company_name,
        vehicle_id
      )
    `)
    .eq('id', agreementId)
    .single()

  if (!agreement) {
    console.error('❌ [INTRODUCER AGREEMENT] Agreement not found:', agreementId)
    return
  }

  const now = new Date().toISOString()
  const introducerName = (agreement.introducer as any)?.legal_name || 'Introducer'
  const introducerEmail = (agreement.introducer as any)?.email || null
  const arrangerName = (agreement.arranger as any)?.legal_name || 'Arranger'
  const dealName = (agreement.deal as any)?.company_name || (agreement.deal as any)?.name || 'Investment Opportunity'
  const hasArranger = !!agreement.arranger_id
  const isArrangerSigner = sigRequest.signer_role === 'arranger'

  // Handle based on who signed
  // Flow: Either (Arranger → Introducer) OR (CEO → Introducer), NOT both
  if (sigRequest.signer_role === 'arranger' || sigRequest.signer_role === 'admin') {
    // Party A signed (either Arranger or CEO) - move to pending introducer signature
    const signerType = isArrangerSigner ? 'Arranger' : 'CEO/Admin'
    console.log(`👔 [INTRODUCER AGREEMENT] ${signerType} (party_a) signed`)

    const updateData: Record<string, any> = {
      status: 'pending_introducer_signature',
      updated_at: now
    }

    if (isArrangerSigner) {
      updateData.arranger_signature_request_id = signatureRequestId
    } else {
      updateData.ceo_signature_request_id = signatureRequestId
    }

    const { error: updateError } = await supabase
      .from('introducer_agreements')
      .update(updateData)
      .eq('id', agreementId)

    if (updateError) {
      console.error('❌ [INTRODUCER AGREEMENT] Failed to update agreement status:', updateError)
    } else {
      console.log('✅ [INTRODUCER AGREEMENT] Agreement status updated to pending_introducer_signature')
    }

    // Mark the CEO/Arranger task as completed
    const { error: taskCompleteError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: now,
      })
      .eq('related_entity_type', 'signature_request')
      .eq('related_entity_id', signatureRequestId)

    if (taskCompleteError) {
      console.warn('⚠️ [INTRODUCER AGREEMENT] Failed to complete CEO/Arranger task:', taskCompleteError)
    } else {
      console.log('✅ [INTRODUCER AGREEMENT] CEO/Arranger task marked as completed')
    }

    // Get introducer users for signature request and task creation (include user email as fallback)
    const { data: introducerUsers } = await supabase
      .from('introducer_users')
      .select('user_id, user:user_id(email)')
      .eq('introducer_id', agreement.introducer_id)

    if (introducerUsers && introducerUsers.length > 0) {
      const signerLabel = isArrangerSigner ? arrangerName : 'VERSO'
      const primaryIntroducerUserId = introducerUsers[0].user_id
      // Use entity email, or fall back to the primary user's email
      const primaryUserEmail = (introducerUsers[0] as any).user?.email
      const finalSignerEmail = introducerEmail || primaryUserEmail || 'no-email@placeholder.com'

      // Create signature request for introducer
      const signingToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days

      const { data: introducerSignatureRequest, error: sigReqError } = await supabase
        .from('signature_requests')
        .insert({
          introducer_id: agreement.introducer_id,
          introducer_agreement_id: agreementId,
          deal_id: agreement.deal_id,
          signer_email: finalSignerEmail,
          signer_name: introducerName,
          document_type: 'introducer_agreement',
          signer_role: 'introducer',
          signature_position: 'party_b',
          signing_token: signingToken,
          token_expires_at: expiresAt.toISOString(),
          // IMPORTANT: Use CEO-signed PDF as the base for introducer to sign
          // This ensures the final PDF has both signatures
          unsigned_pdf_path: sigRequest.signed_pdf_path,
          status: 'pending',
        })
        .select('id')
        .single()

      if (sigReqError || !introducerSignatureRequest) {
        console.error('❌ [INTRODUCER AGREEMENT] Failed to create introducer signature request:', sigReqError)
      } else {
        console.log('✅ [INTRODUCER AGREEMENT] Introducer signature request created:', introducerSignatureRequest.id)

        // Update agreement with introducer signature request ID
        await supabase
          .from('introducer_agreements')
          .update({
            introducer_signature_request_id: introducerSignatureRequest.id,
          })
          .eq('id', agreementId)

        // Build fee description for task
        const subscriptionFeePercent = agreement.default_commission_bps ? (agreement.default_commission_bps / 100).toFixed(2) : '0'
        const performanceFeePercent = agreement.performance_fee_bps ? (agreement.performance_fee_bps / 100).toFixed(2) : null
        const feeDescription = performanceFeePercent
          ? `${subscriptionFeePercent}% subscription fee, ${performanceFeePercent}% performance fee`
          : `${subscriptionFeePercent}% subscription fee`

        // Create VERSOSign task for introducer with detailed info
        const signingUrl = `/sign/${signingToken}`
        const { error: taskError } = await supabase.from('tasks').insert({
          owner_user_id: primaryIntroducerUserId,
          kind: 'countersignature',
          category: 'compliance',
          title: `Sign Your Introducer Agreement: ${dealName}`,
          description: `Please review and sign your introducer fee agreement.\n\n` +
            `• Deal: ${dealName}\n` +
            `• Your Commission: ${feeDescription}\n` +
            `• Reference: ${agreement.reference_number || 'N/A'}\n\n` +
            `${signerLabel} has already signed. After you sign, the agreement becomes active.`,
          status: 'pending',
          priority: 'high',
          related_entity_type: 'signature_request',
          related_entity_id: introducerSignatureRequest.id,
          related_deal_id: agreement.deal_id,
          due_at: expiresAt.toISOString(),
          action_url: signingUrl,
          instructions: {
            type: 'signature',
            action_url: signingUrl,
            signature_request_id: introducerSignatureRequest.id,
            document_type: 'introducer_agreement',
            introducer_id: agreement.introducer_id,
            introducer_name: introducerName,
            deal_name: dealName,
            agreement_id: agreementId,
            reference_number: agreement.reference_number,
            fee_summary: feeDescription,
          },
        })

        if (taskError) {
          console.error('⚠️ [INTRODUCER AGREEMENT] Failed to create introducer task:', taskError)
        } else {
          console.log('✅ [INTRODUCER AGREEMENT] Introducer task created in VERSOSign')
        }
      }

      // Also send notification
      const notifications = introducerUsers.map((iu: any) => ({
        user_id: iu.user_id,
        investor_id: null,
        title: 'Introducer Agreement Ready for Your Signature',
        message: `Your introducer agreement for ${dealName} has been signed by ${signerLabel} and is ready for your signature.`,
        link: `/versotech_main/versosign`,
        type: 'action_required'
      }))

      await supabase.from('investor_notifications').insert(notifications)
      console.log('✅ [INTRODUCER AGREEMENT] Notified introducer users')
    }

  } else if (sigRequest.signer_role === 'introducer') {
    // Introducer signed - agreement is now active!
    console.log('🎉 [INTRODUCER AGREEMENT] Introducer signed - activating agreement:', agreementId)

    const introducerCounterpartyName = formatCounterpartyName({
      type: (agreement.introducer as any)?.type,
      firstName: (agreement.introducer as any)?.first_name,
      lastName: (agreement.introducer as any)?.last_name,
      legalName: (agreement.introducer as any)?.legal_name,
      displayName: (agreement.introducer as any)?.display_name
    })

    let vehicleCode = 'VCXXX'
    if ((agreement.deal as any)?.vehicle_id) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('entity_code')
        .eq('id', (agreement.deal as any)?.vehicle_id)
        .maybeSingle()
      vehicleCode = vehicle?.entity_code || vehicleCode
    }

    const { storageFileName } = buildExecutedDocumentName({
      vehicleCode,
      documentLabel: 'INTRODUCER AGREEMENT',
      counterpartyName: introducerCounterpartyName
    })

    let finalSignedPath = sigRequest.signed_pdf_path
    try {
      if (sigRequest.signed_pdf_path) {
        const signedBucket = process.env.SIGNATURES_BUCKET || 'signatures'
        const targetBucket = 'deal-documents'

        const { data: signedPdfData } = await supabase.storage
          .from(signedBucket)
          .download(sigRequest.signed_pdf_path)

        if (signedPdfData) {
          const signedBuffer = Buffer.from(await signedPdfData.arrayBuffer())
          const copyPath = `introducer-agreements/${agreement.deal_id || agreement.id}/${storageFileName}`

          await supabase.storage
            .from(targetBucket)
            .upload(copyPath, signedBuffer, {
              contentType: 'application/pdf',
              upsert: true
            })

          finalSignedPath = copyPath
        }
      }
    } catch (copyError) {
      console.error('⚠️ [INTRODUCER AGREEMENT] Failed to copy signed PDF to deal-documents:', copyError)
    }

    const { error: activateError } = await supabase
      .from('introducer_agreements')
      .update({
        status: 'active',
        introducer_signature_request_id: signatureRequestId,
        signed_date: now.split('T')[0], // date type
        signed_pdf_url: finalSignedPath,
        pdf_url: finalSignedPath,
        updated_at: now
      })
      .eq('id', agreementId)

    if (activateError) {
      console.error('❌ [INTRODUCER AGREEMENT] Failed to activate agreement:', activateError)
    } else {
      console.log('✅ [INTRODUCER AGREEMENT] Agreement activated successfully')
    }

    // Mark linked fee plan as accepted when agreement becomes active
    if (agreement.fee_plan_id) {
      console.log('📋 [INTRODUCER AGREEMENT] Updating linked fee plan to accepted:', agreement.fee_plan_id)

      const { data: feePlan, error: feePlanFetchError } = await supabase
        .from('fee_plans')
        .select('id, status')
        .eq('id', agreement.fee_plan_id)
        .maybeSingle()

      if (feePlanFetchError) {
        console.error('❌ [INTRODUCER AGREEMENT] Failed to fetch fee plan:', feePlanFetchError)
      } else if (feePlan && feePlan.status !== 'accepted') {
        // Get introducer user for accepted_by field
        const { data: introducerUser } = await supabase
          .from('introducer_users')
          .select('user_id')
          .eq('introducer_id', agreement.introducer_id)
          .limit(1)
          .maybeSingle()

        const { error: feePlanUpdateError } = await supabase
          .from('fee_plans')
          .update({
            status: 'accepted',
            accepted_at: now,
            accepted_by: introducerUser?.user_id || null,
            updated_at: now
          })
          .eq('id', agreement.fee_plan_id)

        if (feePlanUpdateError) {
          console.error('❌ [INTRODUCER AGREEMENT] Failed to update fee plan status:', feePlanUpdateError)
        } else {
          console.log('✅ [INTRODUCER AGREEMENT] Fee plan marked as accepted')

          // Create audit log for fee plan acceptance
          await supabase.from('audit_logs').insert({
            event_type: 'fee_plan',
            action: 'accepted',
            entity_type: 'fee_plans',
            entity_id: agreement.fee_plan_id,
            actor_id: introducerUser?.user_id || null,
            action_details: {
              description: 'Fee plan accepted via introducer agreement signature',
              introducer_id: agreement.introducer_id,
              agreement_id: agreementId
            },
            timestamp: now
          })
        }
      } else if (feePlan) {
        console.log('ℹ️ [INTRODUCER AGREEMENT] Fee plan already accepted, skipping update')
      }
    }

    // Mark the introducer's task as completed
    const { error: taskCompleteError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: now,
      })
      .eq('related_entity_type', 'signature_request')
      .eq('related_entity_id', signatureRequestId)

    if (taskCompleteError) {
      console.warn('⚠️ [INTRODUCER AGREEMENT] Failed to complete introducer task:', taskCompleteError)
    } else {
      console.log('✅ [INTRODUCER AGREEMENT] Introducer task marked as completed')
    }

    // Notify introducer users that agreement is active
    const { data: introducerUsers } = await supabase
      .from('introducer_users')
      .select('user_id')
      .eq('introducer_id', agreement.introducer_id)

    if (introducerUsers && introducerUsers.length > 0) {
      const notifications = introducerUsers.map((iu: any) => ({
        user_id: iu.user_id,
        investor_id: null,
        title: 'Introducer Agreement Active',
        message: 'Your introducer agreement is now fully executed and active. You can now receive investor referrals.',
        link: `/versotech_main/introducer-agreements/${agreementId}`,
        type: 'success'
      }))

      await supabase.from('investor_notifications').insert(notifications)
      console.log('✅ [INTRODUCER AGREEMENT] Notified introducer users of activation')
    }

    // Notify arranger users (if arranger exists)
    if (agreement.arranger_id) {
      const { data: arrangerUsers } = await supabase
        .from('arranger_users')
        .select('user_id')
        .eq('arranger_id', agreement.arranger_id)

      if (arrangerUsers && arrangerUsers.length > 0) {
        const arrangerNotifications = arrangerUsers.map((au: any) => ({
          user_id: au.user_id,
          investor_id: null,
          title: 'Introducer Agreement Executed',
          message: `Introducer agreement with ${introducerName} is now fully executed and active.`,
          link: `/versotech_main/my-introducers`,
          type: 'success'
        }))

        await supabase.from('investor_notifications').insert(arrangerNotifications)
        console.log('✅ [INTRODUCER AGREEMENT] Notified arranger users')
      }
    }

    // Notify staff_admin/CEO users
    const { data: staffUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'staff_admin')
      .limit(5)

    if (staffUsers && staffUsers.length > 0) {
      const staffNotifications = staffUsers.map((staff: any) => ({
        user_id: staff.id,
        investor_id: null,
        title: 'Introducer Agreement Executed',
        message: `Introducer agreement with ${introducerName} has been fully executed and is now active.`,
        link: `/versotech_main/staff/introducers`,
        type: 'info'
      }))

      await supabase.from('investor_notifications').insert(staffNotifications)
      console.log('✅ [INTRODUCER AGREEMENT] Notified staff users')
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      event_type: 'introducer',
      action: 'agreement_activated',
      entity_type: 'introducer_agreement',
      entity_id: agreementId,
      actor_id: null,
      action_details: {
        description: 'Introducer agreement fully executed and activated',
        introducer_id: agreement.introducer_id,
        introducer_name: introducerName,
        arranger_id: agreement.arranger_id,
        agreement_id: agreementId,
        signature_request_id: signatureRequestId
      },
      timestamp: now
    })
  }

  console.log('🎉 [INTRODUCER AGREEMENT] Completion processing finished')
}
