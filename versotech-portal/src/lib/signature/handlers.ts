/**
 * Post-signature handlers for different document types
 *
 * These handlers execute business logic after a document is fully signed,
 * such as storing documents, granting access, or triggering workflows.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PostSignatureHandlerParams } from './types'
import { calculateSubscriptionFeeEvents, createFeeEvents } from '../fees/subscription-fee-calculator'

/**
 * NDA Post-Signature Handler
 *
 * Executes when an NDA is fully signed. This handler:
 * 1. Copies the signed PDF from signatures bucket to documents bucket
 * 2. Creates a document record for portal access
 * 3. Automatically grants 7-day data room access to the investor
 * 4. Creates an audit log entry
 */
export async function handleNDASignature(
  params: PostSignatureHandlerParams
): Promise<void> {
  console.log('\n🔵 [NDA HANDLER] handleNDASignature() called')
  const { signatureRequest, signedPdfPath, signedPdfBytes, supabase } = params

  console.log('📋 [NDA HANDLER] Signature request details:', {
    id: signatureRequest.id,
    workflow_run_id: signatureRequest.workflow_run_id,
    investor_id: signatureRequest.investor_id,
    document_type: signatureRequest.document_type,
    signed_pdf_path: signedPdfPath,
    signed_pdf_size: signedPdfBytes.length
  })

  // Fetch workflow run to get entity details
  console.log('🔍 [NDA HANDLER] Fetching workflow run details')
  const { data: workflowRun } = await supabase
    .from('workflow_runs')
    .select('entity_id, entity_type, input_params')
    .eq('id', signatureRequest.workflow_run_id)
    .single()

  // Only proceed if this is an NDA workflow
  if (!workflowRun || workflowRun.entity_type !== 'deal_interest_nda') {
    console.log('⏭️ [NDA HANDLER] Skipping - not a deal_interest_nda workflow')
    console.log('ℹ️ [NDA HANDLER] Workflow entity_type:', workflowRun?.entity_type || 'null')
    return
  }

  console.log('✅ [NDA HANDLER] Confirmed NDA workflow:', {
    entity_id: workflowRun.entity_id,
    entity_type: workflowRun.entity_type
  })

  // Get deal interest to find deal_id and investor_id
  console.log('🔍 [NDA HANDLER] Fetching deal interest details')
  const { data: dealInterest } = await supabase
    .from('investor_deal_interest')
    .select('deal_id, investor_id')
    .eq('id', workflowRun.entity_id)
    .single()

  if (!dealInterest) {
    console.error('❌ [NDA HANDLER] Deal interest not found for entity_id:', workflowRun.entity_id)
    throw new Error('Deal interest not found for NDA workflow')
  }

  console.log('✅ [NDA HANDLER] Deal interest found:', {
    deal_id: dealInterest.deal_id,
    investor_id: dealInterest.investor_id
  })

  // 1. COPY SIGNED PDF TO DOCUMENTS BUCKET
  console.log('\n📦 [NDA HANDLER] Step 1: Copying signed PDF to documents bucket')
  console.log('📥 [NDA HANDLER] Downloading from signatures bucket:', signedPdfPath)
  const { data: signaturesPdfData } = await supabase.storage
    .from(process.env.SIGNATURES_BUCKET || 'signatures')
    .download(signedPdfPath)

  if (!signaturesPdfData) {
    console.error('❌ [NDA HANDLER] Failed to download signed PDF for copying')
    throw new Error('Failed to download signed PDF for copying')
  }

  console.log('✅ [NDA HANDLER] Downloaded signed PDF from signatures bucket')

  // Generate document storage path
  const timestamp = Date.now()
  const documentFileName = `ndas/${dealInterest.deal_id}/${dealInterest.investor_id}_nda_${timestamp}.pdf`
  console.log('📤 [NDA HANDLER] Uploading to documents bucket:', documentFileName)

  // Upload to documents bucket
  const { data: docUploadData, error: docUploadError } = await supabase.storage
    .from(process.env.STORAGE_BUCKET_NAME || 'documents')
    .upload(documentFileName, signaturesPdfData, {
      contentType: 'application/pdf',
      upsert: false
    })

  if (docUploadError) {
    console.error('❌ [NDA HANDLER] Failed to copy PDF to documents bucket:', docUploadError)
    throw docUploadError
  }

  console.log('✅ [NDA HANDLER] Signed PDF copied to documents bucket:', docUploadData.path)

  // 2. CREATE DOCUMENT RECORD
  console.log('\n📄 [NDA HANDLER] Step 2: Creating document record')
  console.log('💾 [NDA HANDLER] Inserting into documents table with metadata:', {
    owner_investor_id: dealInterest.investor_id,
    deal_id: dealInterest.deal_id,
    type: 'nda',
    file_key: docUploadData.path,
    file_size_bytes: signedPdfBytes.length,
    status: 'published'
  })

  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert({
      owner_investor_id: dealInterest.investor_id,
      deal_id: dealInterest.deal_id,
      type: 'nda',
      file_key: docUploadData.path,
      name: `NDA - Signed.pdf`,
      description: 'Fully executed Non-Disclosure Agreement',
      tags: ['nda', 'signed', 'executed'],
      mime_type: 'application/pdf',
      file_size_bytes: signedPdfBytes.length,
      is_published: true,
      published_at: new Date().toISOString(),
      status: 'published',
      current_version: 1
    })
    .select()
    .single()

  if (docError) {
    console.error('❌ [NDA HANDLER] Failed to create document record:', docError)
    throw docError
  }

  console.log('✅ [NDA HANDLER] Document record created successfully:', {
    document_id: document.id,
    deal_id: dealInterest.deal_id,
    investor_id: dealInterest.investor_id,
    file_key: document.file_key
  })

  // 3. AUTOMATIC DATA ROOM ACCESS GRANT
  // Now that NDA is fully executed, grant investor access to deal's data room
  console.log('\n🔓 [NDA HANDLER] Step 3: Granting automatic data room access')
  try {
    // Get deal info
    console.log('🔍 [NDA HANDLER] Fetching deal information for access grant')
    const { data: deal } = await supabase
      .from('deals')
      .select('id, name')
      .eq('id', dealInterest.deal_id)
      .single()

    console.log('✅ [NDA HANDLER] Deal information retrieved:', {
      deal_id: deal?.id,
      deal_name: deal?.name
    })

    // Check if access already exists
    console.log('🔍 [NDA HANDLER] Checking for existing data room access')
    const { data: existingAccess } = await supabase
      .from('deal_data_room_access')
      .select('id, revoked_at')
      .eq('deal_id', dealInterest.deal_id)
      .eq('investor_id', dealInterest.investor_id)
      .single()

    if (existingAccess && !existingAccess.revoked_at) {
      console.log('ℹ️ [NDA HANDLER] Data room access already exists for this investor')
      console.log('📊 [NDA HANDLER] Existing access details:', {
        access_id: existingAccess.id,
        revoked_at: existingAccess.revoked_at
      })
    } else {
      // Calculate expiry: 7 days from now
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)

      console.log('⏰ [NDA HANDLER] Calculated access expiry:', {
        granted_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
        duration_days: 7
      })

      // Grant new access (7 days only)
      console.log('💾 [NDA HANDLER] Inserting new data room access record')
      const { data: newAccess, error: accessError } = await supabase
        .from('deal_data_room_access')
        .insert({
          deal_id: dealInterest.deal_id,
          investor_id: dealInterest.investor_id,
          granted_at: new Date().toISOString(),
          expires_at: expiryDate.toISOString(),
          auto_granted: true,
          notes: `Automatically granted upon NDA execution for ${deal?.name || 'deal'}. Initial 7-day access period.`
        })
        .select()
        .single()

      if (accessError) {
        console.error('❌ [NDA HANDLER] Failed to grant data room access:', accessError)
        throw accessError
      }

      console.log('✅ [NDA HANDLER] Data room access successfully granted:', {
        access_id: newAccess.id,
        deal_id: dealInterest.deal_id,
        investor_id: dealInterest.investor_id,
        granted_at: newAccess.granted_at,
        expires_at: newAccess.expires_at,
        auto_granted: newAccess.auto_granted
      })

      // 4. CREATE AUDIT LOG ENTRY
      console.log('\n📝 [NDA HANDLER] Step 4: Creating audit log entry')
      console.log('💾 [NDA HANDLER] Logging data room access grant to audit_logs')
      await supabase.from('audit_logs').insert({
        action: 'grant_data_room_access',
        entity_type: 'deal_data_room_access',
        entity_id: newAccess.id,
        actor_id: null, // System-generated
        description: `Automatically granted data room access upon NDA execution`,
        metadata: {
          deal_id: dealInterest.deal_id,
          investor_id: dealInterest.investor_id,
          nda_document_id: document.id,
          workflow_run_id: signatureRequest.workflow_run_id,
          auto_granted: true
        }
      })

      console.log('✅ [NDA HANDLER] Audit log entry created successfully')
    }

    console.log('\n🎉 [NDA HANDLER] handleNDASignature() completed successfully')
    console.log('📊 [NDA HANDLER] Final summary:', {
      signature_request_id: signatureRequest.id,
      workflow_run_id: signatureRequest.workflow_run_id,
      deal_id: dealInterest.deal_id,
      investor_id: dealInterest.investor_id,
      document_id: document.id,
      signed_pdf_path: signedPdfPath,
      data_room_access_granted: !existingAccess || !!existingAccess.revoked_at
    })
  } catch (accessError) {
    console.error('❌ [NDA HANDLER] Error granting automatic data room access:', accessError)
    console.error('❌ [NDA HANDLER] Error details:', {
      error_message: accessError instanceof Error ? accessError.message : 'Unknown error',
      signature_request_id: signatureRequest.id,
      deal_id: dealInterest.deal_id,
      investor_id: dealInterest.investor_id
    })
    // Don't fail the signature submission if access grant fails
    throw accessError
  }
}

/**
 * Subscription Agreement Post-Signature Handler
 *
 * Executes when a subscription agreement is fully signed. This handler:
 * 1. Copies the signed PDF to documents bucket
 * 2. Creates a document record
 * 3. Updates subscription status to 'committed' (triggers automatic fee event creation)
 * 4. Completes the investor's signature task
 * 5. Creates notifications
 */
export async function handleSubscriptionSignature(
  params: PostSignatureHandlerParams
): Promise<void> {
  console.log('\n🔵 [SUBSCRIPTION HANDLER] handleSubscriptionSignature() called')
  const { signatureRequest, signedPdfPath, signedPdfBytes, supabase } = params

  console.log('📋 [SUBSCRIPTION HANDLER] Signature request details:', {
    id: signatureRequest.id,
    workflow_run_id: signatureRequest.workflow_run_id,
    investor_id: signatureRequest.investor_id,
    document_type: signatureRequest.document_type,
    signed_pdf_path: signedPdfPath,
    signed_pdf_size: signedPdfBytes.length
  })

  // Get document ID - either from document_id field (manual uploads) or workflow_run_id (n8n generated)
  const documentId = signatureRequest.document_id || signatureRequest.workflow_run_id

  if (!documentId) {
    console.error('❌ [SUBSCRIPTION HANDLER] No document_id or workflow_run_id found in signature request')
    throw new Error('Cannot identify document for this signature')
  }

  console.log('🔍 [SUBSCRIPTION HANDLER] Fetching document details for document_id:', documentId)
  const { data: document } = await supabase
    .from('documents')
    .select('id, subscription_id')
    .eq('id', documentId)
    .single()

  if (!document?.subscription_id) {
    console.error('❌ [SUBSCRIPTION HANDLER] No subscription_id found in document')
    throw new Error('Subscription not found for this document')
  }

  const subscriptionId = document.subscription_id
  console.log('✅ [SUBSCRIPTION HANDLER] Found subscription_id:', subscriptionId)

  // Get subscription details with proper investor_users join
  console.log('🔍 [SUBSCRIPTION HANDLER] Fetching subscription details')
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(`
      *,
      investor:investors(
        id,
        legal_name,
        display_name,
        email,
        investor_users!inner(user_id)
      ),
      vehicle:vehicles(id, name)
    `)
    .eq('id', subscriptionId)
    .single()

  if (!subscription) {
    console.error('❌ [SUBSCRIPTION HANDLER] Subscription not found:', subscriptionId)
    throw new Error('Subscription not found')
  }

  console.log('✅ [SUBSCRIPTION HANDLER] Subscription found:', {
    subscription_id: subscription.id,
    investor_id: subscription.investor_id,
    vehicle_id: subscription.vehicle_id,
    commitment: subscription.commitment,
    current_status: subscription.status
  })

  // 1. COPY SIGNED PDF TO DOCUMENTS BUCKET
  console.log('\n📦 [SUBSCRIPTION HANDLER] Step 1: Copying signed PDF to documents bucket')
  console.log('📥 [SUBSCRIPTION HANDLER] Downloading from signatures bucket:', signedPdfPath)
  const { data: signaturesPdfData } = await supabase.storage
    .from(process.env.SIGNATURES_BUCKET || 'signatures')
    .download(signedPdfPath)

  if (!signaturesPdfData) {
    console.error('❌ [SUBSCRIPTION HANDLER] Failed to download signed PDF for copying')
    throw new Error('Failed to download signed PDF for copying')
  }

  console.log('✅ [SUBSCRIPTION HANDLER] Downloaded signed PDF from signatures bucket')

  // Generate document storage path
  const timestamp = Date.now()
  const documentFileName = `subscriptions/${subscription.vehicle_id}/${subscription.investor_id}_subscription_${timestamp}.pdf`
  console.log('📤 [SUBSCRIPTION HANDLER] Uploading to documents bucket:', documentFileName)

  // Upload to documents bucket
  const { data: docUploadData, error: docUploadError } = await supabase.storage
    .from(process.env.STORAGE_BUCKET_NAME || 'documents')
    .upload(documentFileName, signaturesPdfData, {
      contentType: 'application/pdf',
      upsert: false
    })

  if (docUploadError) {
    console.error('❌ [SUBSCRIPTION HANDLER] Failed to copy PDF to documents bucket:', docUploadError)
    throw docUploadError
  }

  console.log('✅ [SUBSCRIPTION HANDLER] Signed PDF copied to documents bucket:', docUploadData.path)

  // 2. UPDATE DOCUMENT RECORD WITH SIGNED PDF PATH
  console.log('\n📄 [SUBSCRIPTION HANDLER] Step 2: Updating document record')
  const { error: docUpdateError } = await supabase
    .from('documents')
    .update({
      file_key: docUploadData.path,
      is_published: true,
      published_at: new Date().toISOString()
    })
    .eq('id', document.id)

  if (docUpdateError) {
    console.error('❌ [SUBSCRIPTION HANDLER] Failed to update document record:', docUpdateError)
    throw docUpdateError
  }

  console.log('✅ [SUBSCRIPTION HANDLER] Document record updated to executed status')

  // 3. UPDATE SUBSCRIPTION STATUS TO 'COMMITTED'
  // This will automatically trigger fee event creation due to existing logic
  console.log('\n💼 [SUBSCRIPTION HANDLER] Step 3: Updating subscription status to committed')
  const previousStatus = subscription.status

  // Validate current status before updating
  const validStatusesForCommit = ['pending', 'draft']
  if (!validStatusesForCommit.includes(subscription.status)) {
    console.warn(`⚠️ [SUBSCRIPTION HANDLER] Subscription ${subscriptionId} has status '${subscription.status}' - cannot transition to 'committed'`)

    // If already committed or active, just update the signed doc reference
    if (['committed', 'active', 'partially_funded'].includes(subscription.status)) {
      const { error: docUpdateError } = await supabase
        .from('subscriptions')
        .update({
          signed_doc_id: document.id,
          acknowledgement_notes: `Subscription agreement re-signed. Previous status maintained: ${subscription.status}`
        })
        .eq('id', subscriptionId)

      if (docUpdateError) {
        console.error('❌ [SUBSCRIPTION HANDLER] Failed to update signed doc reference:', docUpdateError)
      } else {
        console.log('✅ [SUBSCRIPTION HANDLER] Updated signed doc reference, status unchanged')
      }

      // Skip the rest of the handler - subscription already processed
      console.log('ℹ️ [SUBSCRIPTION HANDLER] Subscription already in advanced status, skipping further processing')
      return
    }

    // For cancelled or closed subscriptions, throw error
    throw new Error(`Cannot commit subscription with status '${subscription.status}'`)
  }

  // Update with race condition detection
  const { data: updatedSubscription, error: subUpdateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'committed',
      committed_at: new Date().toISOString(),
      signed_doc_id: document.id,
      acknowledgement_notes: 'Subscription agreement fully executed by both parties.'
    })
    .eq('id', subscriptionId)
    .eq('status', subscription.status) // Only update if status hasn't changed
    .select()
    .single()

  // Check for race condition
  if (!updatedSubscription && !subUpdateError) {
    // No rows matched - status must have changed
    console.error('⚠️ [SUBSCRIPTION HANDLER] Race condition detected - status changed during update')

    // Get current status
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('id', subscriptionId)
      .single()

    if (currentSub) {
      const errorMsg = `Cannot commit subscription: status changed from '${subscription.status}' to '${currentSub.status}' during processing`
      console.error('❌ [SUBSCRIPTION HANDLER]', errorMsg)
      throw new Error(errorMsg)
    }
  }

  if (subUpdateError) {
    console.error('❌ [SUBSCRIPTION HANDLER] Failed to update subscription status:', subUpdateError)
    throw subUpdateError
  }

  if (!updatedSubscription) {
    throw new Error('Failed to update subscription status - unknown error')
  }

  console.log('✅ [SUBSCRIPTION HANDLER] Subscription status updated:', {
    subscription_id: subscriptionId,
    previous_status: previousStatus,
    new_status: 'committed'
  })

  // 4. CREATE FEE EVENTS FOR COMMITTED SUBSCRIPTION
  console.log('\n💰 [SUBSCRIPTION HANDLER] Step 4: Creating fee events for committed subscription')

  try {
    // Calculate fee events based on subscription commitment
    const feeCalcResult = await calculateSubscriptionFeeEvents(supabase, subscriptionId)

    if (!feeCalcResult.success || !feeCalcResult.feeEvents || feeCalcResult.feeEvents.length === 0) {
      console.warn('⚠️ [SUBSCRIPTION HANDLER] No fee events calculated:', feeCalcResult.error)
    } else {
      console.log('📊 [SUBSCRIPTION HANDLER] Calculated fee events:', {
        count: feeCalcResult.feeEvents.length,
        types: feeCalcResult.feeEvents.map(fe => fe.fee_type).join(', '),
        total: feeCalcResult.feeEvents.reduce((sum, fe) => sum + fe.computed_amount, 0)
      })

      // Create the fee events in the database
      const createResult = await createFeeEvents(
        supabase,
        subscriptionId,
        subscription.investor_id,
        subscription.deal_id || null,
        feeCalcResult.feeEvents
      )

      if (createResult.success) {
        console.log('✅ [SUBSCRIPTION HANDLER] Fee events created successfully:', {
          count: createResult.feeEventIds?.length,
          ids: createResult.feeEventIds
        })
      } else {
        console.error('❌ [SUBSCRIPTION HANDLER] Failed to create fee events:', createResult.error)
        // Don't throw - fee event creation failure shouldn't fail signature completion
      }
    }
  } catch (feeError) {
    console.error('❌ [SUBSCRIPTION HANDLER] Error creating fee events:', feeError)
    // Don't throw - continue with rest of process even if fee creation fails
  }

  // 5. COMPLETE INVESTOR'S SIGNATURE TASK
  console.log('\n✅ [SUBSCRIPTION HANDLER] Step 5: Completing investor signature task')

  // Find the task related to this subscription signature
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('owner_investor_id', subscription.investor_id)
    .eq('kind', 'subscription_pack_signature')
    .eq('related_entity_id', subscriptionId)
    .in('status', ['pending', 'in_progress'])

  if (tasks && tasks.length > 0) {
    console.log('📝 [SUBSCRIPTION HANDLER] Found signature task(s) to complete:', tasks.length)

    for (const task of tasks) {
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_notes: 'Subscription agreement signed by both parties.'
        })
        .eq('id', task.id)

      if (taskError) {
        console.error('❌ [SUBSCRIPTION HANDLER] Failed to complete task:', task.id, taskError)
      } else {
        console.log('✅ [SUBSCRIPTION HANDLER] Task completed:', task.id)
      }
    }
  } else {
    console.log('ℹ️ [SUBSCRIPTION HANDLER] No pending signature tasks found for investor')
  }

  // 5.5. COMPLETE STAFF SIGNATURE TASK
  console.log('\n✅ [SUBSCRIPTION HANDLER] Step 5.5: Completing staff signature task')

  // Find staff tasks for this subscription (kind = 'countersignature')
  const { data: staffTasks } = await supabase
    .from('tasks')
    .select('id, owner_user_id')
    .eq('kind', 'countersignature')
    .eq('related_entity_id', subscriptionId)
    .in('status', ['pending', 'in_progress'])

  if (staffTasks && staffTasks.length > 0) {
    console.log('📝 [SUBSCRIPTION HANDLER] Found staff signature task(s) to complete:', staffTasks.length)

    for (const task of staffTasks) {
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_notes: 'Subscription agreement countersigned and fully executed.'
        })
        .eq('id', task.id)

      if (taskError) {
        console.error('❌ [SUBSCRIPTION HANDLER] Failed to complete staff task:', task.id, taskError)
      } else {
        console.log('✅ [SUBSCRIPTION HANDLER] Staff task completed:', task.id)
      }
    }
  } else {
    console.log('ℹ️ [SUBSCRIPTION HANDLER] No pending signature tasks found for staff')
  }

  // 6. CREATE NOTIFICATIONS
  console.log('\n📬 [SUBSCRIPTION HANDLER] Step 6: Creating notifications')

  // Get investor user_id from investor_users join table
  const investorUserId = subscription.investor?.investor_users?.[0]?.user_id

  if (!investorUserId) {
    console.warn('⚠️ [SUBSCRIPTION HANDLER] No user_id found for investor - skipping notification')
  } else {
    // Notification for investor
    const { error: notifError } = await supabase
      .from('investor_notifications')
      .insert({
        user_id: investorUserId,
        type: 'subscription_committed',
        title: 'Investment Commitment Confirmed',
        message: `Your subscription agreement for ${subscription.vehicle?.name || 'the investment'} has been fully executed. Your commitment of ${subscription.commitment} ${subscription.currency} is now confirmed.`,
        action_url: `/versoholdings/holdings`,
        metadata: {
          subscription_id: subscriptionId,
          vehicle_id: subscription.vehicle_id,
          commitment: subscription.commitment,
          currency: subscription.currency
        }
      })

    if (notifError) {
      console.error('❌ [SUBSCRIPTION HANDLER] Failed to create notification:', notifError)
      // Don't throw - notification failure shouldn't fail the whole process
    } else {
      console.log('✅ [SUBSCRIPTION HANDLER] Created notification for investor')
    }
  }

  // 7. CREATE AUDIT LOG ENTRY
  console.log('\n📝 [SUBSCRIPTION HANDLER] Step 7: Creating audit log entry')
  await supabase.from('audit_logs').insert({
    action: 'subscription_committed',
    entity_type: 'subscription',
    entity_id: subscriptionId,
    actor_id: null, // System-generated
    description: `Subscription agreement fully executed and status changed to committed`,
    metadata: {
      subscription_id: subscriptionId,
      investor_id: subscription.investor_id,
      vehicle_id: subscription.vehicle_id,
      commitment: subscription.commitment,
      document_id: document.id,
      workflow_run_id: signatureRequest.workflow_run_id,
      previous_status: previousStatus,
      new_status: 'committed'
    }
  })

  console.log('✅ [SUBSCRIPTION HANDLER] Audit log entry created')

  console.log('\n🎉 [SUBSCRIPTION HANDLER] handleSubscriptionSignature() completed successfully')
  console.log('📊 [SUBSCRIPTION HANDLER] Final summary:', {
    signature_request_id: signatureRequest.id,
    subscription_id: subscriptionId,
    investor_id: subscription.investor_id,
    vehicle_id: subscription.vehicle_id,
    commitment: subscription.commitment,
    document_id: document.id,
    signed_pdf_path: signedPdfPath,
    status_changed: `${previousStatus} → committed`,
    fee_events_will_auto_create: true
  })

  console.log('💡 [SUBSCRIPTION HANDLER] Note: Fee events will be automatically created by the subscription status change trigger')
}

/**
 * Amendment Post-Signature Handler
 *
 * Executes when an amendment is fully signed. This handler:
 * 1. Copies the signed PDF to documents bucket
 * 2. Creates a document record
 * 3. Updates the related entity (subscription, investor, etc.)
 */
export async function handleAmendmentSignature(
  params: PostSignatureHandlerParams
): Promise<void> {
  const { signatureRequest, signedPdfPath, signedPdfBytes, supabase } = params

  // TODO: Implement amendment post-signature logic
  console.log('⚠️ Amendment post-signature handler not yet implemented')

  throw new Error(
    'Amendment signature handling is not yet implemented. ' +
      'This feature is planned for future release.'
  )
}

/**
 * Generic document handler (fallback for 'other' document types)
 */
export async function handleGenericSignature(
  params: PostSignatureHandlerParams
): Promise<void> {
  const { signatureRequest, signedPdfPath, signedPdfBytes, supabase } = params

  console.log('⚠️ Using generic signature handler - no specific post-processing')

  // For generic documents, we just log that the signature was completed
  // No additional business logic is executed
}

/**
 * Route signature requests to the appropriate handler based on document_type
 */
export async function routeSignatureHandler(
  params: PostSignatureHandlerParams
): Promise<void> {
  const { signatureRequest } = params

  switch (signatureRequest.document_type) {
    case 'nda':
      return handleNDASignature(params)
    case 'subscription':
      return handleSubscriptionSignature(params)
    case 'amendment':
      return handleAmendmentSignature(params)
    case 'other':
      return handleGenericSignature(params)
    default:
      console.warn(
        `Unknown document_type: ${signatureRequest.document_type}, using generic handler`
      )
      return handleGenericSignature(params)
  }
}
