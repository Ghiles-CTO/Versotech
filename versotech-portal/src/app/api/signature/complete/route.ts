import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

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

  // Calculate expected signature using HMAC-SHA256
  const webhookSecret = process.env.ESIGN_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('❌ ESIGN_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex')

  // Compare signatures (constant-time comparison to prevent timing attacks)
  const signatureValid = crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  )

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

  // Handle NDA signature completion (Direct Subscribe flow)
  if (document_type === 'nda') {
    await handleNDACompletion(supabase, signature_request_id, workflow_run_id)
  }

  // Handle subscription signature completion
  if (document_type === 'subscription') {
    await handleSubscriptionCompletion(supabase, signature_request_id, workflow_run_id)
  }

  return NextResponse.json({ success: true })
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

      await supabase.from('investor_notifications').insert({
        user_id: investorUsers[0].user_id,
        investor_id: investorId,
        title: 'Data room unlocked',
        message: `Your NDA for ${deal?.name || 'the deal'} is complete. The data room is now available.`,
        link: `/versotech_main/opportunities/${dealId}`,
        metadata: { type: 'nda_complete', deal_id: dealId }
      })
      console.log('✅ [NDA] Notification created')
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

      await supabase.from('investor_notifications').insert({
        user_id: investorUsers[0].user_id,
        investor_id: investorId,
        title: 'NDA signed',
        message: `Your NDA for ${deal?.name || 'the deal'} is complete. Please complete the subscription pack signing.`,
        link: `/versotech_main/opportunities/${dealId}`,
        metadata: { type: 'nda_complete_direct_subscribe', deal_id: dealId }
      })
      console.log('✅ [NDA] Direct Subscribe notification created')
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
      console.log('✅ [SUBSCRIPTION] Notification created')
    }
  }

  console.log('🎉 [SUBSCRIPTION] Subscription completion processing finished')
}
