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

  // Get deal info (including vehicle_id for document association)
  console.log('🔍 [NDA HANDLER] Fetching deal information for vehicle association')
  const { data: deal } = await supabase
    .from('deals')
    .select('id, name, vehicle_id')
    .eq('id', dealInterest.deal_id)
    .single()

  console.log('✅ [NDA HANDLER] Deal information retrieved:', {
    deal_id: deal?.id,
    deal_name: deal?.name,
    vehicle_id: deal?.vehicle_id
  })

  // Look up the NDAs folder for this vehicle
  let ndaFolderId: string | null = null
  if (deal?.vehicle_id) {
    const { data: ndaFolder } = await supabase
      .from('document_folders')
      .select('id')
      .eq('vehicle_id', deal.vehicle_id)
      .eq('name', 'NDAs')
      .single()

    ndaFolderId = ndaFolder?.id || null
    console.log('📁 [NDA HANDLER] NDAs folder lookup:', {
      vehicle_id: deal.vehicle_id,
      folder_id: ndaFolderId
    })
  }

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
      vehicle_id: deal?.vehicle_id || null,
      folder_id: ndaFolderId,
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
    // deal info already fetched earlier for vehicle_id association

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
        event_type: 'deal',
        action: 'grant_data_room_access',
        entity_type: 'deal_data_room_access',
        entity_id: newAccess.id,
        actor_id: null, // System-generated
        action_details: {
          description: 'Automatically granted data room access upon NDA execution',
          deal_id: dealInterest.deal_id,
          investor_id: dealInterest.investor_id,
          nda_document_id: document.id,
          workflow_run_id: signatureRequest.workflow_run_id,
          auto_granted: true
        },
        timestamp: new Date().toISOString()
      })

      console.log('✅ [NDA HANDLER] Audit log entry created successfully')
    }

    // Update journey tracking in deal_memberships for all investor users
    console.log('📊 [NDA HANDLER] Updating deal_memberships journey tracking')
    try {
      const { data: investorUsers } = await supabase
        .from('investor_users')
        .select('user_id')
        .eq('investor_id', dealInterest.investor_id)

      if (investorUsers && investorUsers.length > 0) {
        const journeyNow = new Date().toISOString()
        for (const iu of investorUsers) {
          await supabase
            .from('deal_memberships')
            .update({
              nda_signed_at: journeyNow,
              data_room_granted_at: journeyNow
            })
            .eq('deal_id', dealInterest.deal_id)
            .eq('user_id', iu.user_id)
        }
        console.log('✅ [NDA HANDLER] Updated deal_memberships journey tracking for', investorUsers.length, 'user(s)')
      }
    } catch (journeyError) {
      console.error('❌ [NDA HANDLER] Failed to update journey tracking:', journeyError)
      // Non-blocking - don't fail NDA completion if journey tracking fails
    }

    // Log NDA completion event for analytics KPIs
    try {
      await supabase.from('deal_activity_events').insert({
        deal_id: dealInterest.deal_id,
        investor_id: dealInterest.investor_id,
        event_type: 'nda_completed',
        payload: {
          signature_request_id: signatureRequest.id,
          workflow_run_id: signatureRequest.workflow_run_id,
          document_id: document.id
        }
      })
      console.log('✅ [NDA HANDLER] Analytics event logged: nda_completed')
    } catch (eventError) {
      console.error('❌ [NDA HANDLER] Failed to log analytics event:', eventError)
      // Non-blocking - don't fail NDA completion if analytics fails
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
    // Error is logged above - continue without throwing
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
      fee_plan_id,
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
      published_at: new Date().toISOString(),
      status: 'published',
      vehicle_id: subscription.vehicle_id,
      owner_investor_id: subscription.investor_id
    })
    .eq('id', document.id)

  if (docUpdateError) {
    console.error('❌ [SUBSCRIPTION HANDLER] Failed to update document record:', docUpdateError)
    throw docUpdateError
  }

  console.log('✅ [SUBSCRIPTION HANDLER] Document record updated to executed status with vehicle_id:', subscription.vehicle_id)

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
  const now = new Date().toISOString()
  const { data: updatedSubscription, error: subUpdateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'committed',
      committed_at: now,
      signed_at: now, // Set signed_at for journey stage tracking
      contract_date: now.split('T')[0], // Set contract date when signed
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
    // IDEMPOTENCY CHECK: Verify fee events don't already exist for this subscription commitment
    // Check for any fee events that are NOT cancelled/deleted
    const { data: existingFeeEvents } = await supabase
      .from('fee_events')
      .select('id, fee_type, status, computed_amount')
      .eq('allocation_id', subscriptionId)
      .in('status', ['accrued', 'invoiced', 'paid'])  // Only count active fee events

    if (existingFeeEvents && existingFeeEvents.length > 0) {
      console.log('✅ [SUBSCRIPTION HANDLER] Active fee events already exist for this subscription, skipping creation:', {
        count: existingFeeEvents.length,
        types: existingFeeEvents.map((fe: any) => fe.fee_type).join(', ')
      })
    } else {
      // Check if subscription was previously committed
      if (subscription.committed_at && new Date(subscription.committed_at) < new Date(Date.now() - 60000)) {
        console.warn('⚠️ [SUBSCRIPTION HANDLER] Subscription was previously committed but has no active fee events')
        console.warn('⚠️ [SUBSCRIPTION HANDLER] This may indicate deleted or cancelled fee events')
        console.warn('⚠️ [SUBSCRIPTION HANDLER] Proceeding with fee event creation, but review may be needed')
      }
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
          subscription.fee_plan_id || null,
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
        investor_id: subscription.investor_id,
        title: 'Investment Commitment Confirmed',
        message: `Your subscription agreement for ${subscription.vehicle?.name || 'the investment'} has been fully executed. Your commitment of ${subscription.commitment} ${subscription.currency} is now confirmed.`,
        link: `/versotech_main/portfolio`,
      })

    if (notifError) {
      console.error('❌ [SUBSCRIPTION HANDLER] Failed to create notification:', notifError)
      // Don't throw - notification failure shouldn't fail the whole process
    } else {
      console.log('✅ [SUBSCRIPTION HANDLER] Created notification for investor')
    }
  }

  // 6b. NOTIFY ASSIGNED LAWYERS
  console.log('\n👨‍⚖️ [SUBSCRIPTION HANDLER] Step 6b: Notifying assigned lawyers')

  if (subscription.deal_id) {
    const signerRole = signatureRequest.signer_role as string
    const isAdminSigner = signerRole === 'admin' || signerRole === 'arranger'
    const signerLabel = signerRole === 'arranger' ? 'Arranger' : 'CEO/Admin'

    // Get lawyers assigned to this deal via deal_lawyer_assignments
    const { data: assignments } = await supabase
      .from('deal_lawyer_assignments')
      .select('lawyer_id')
      .eq('deal_id', subscription.deal_id)

    const lawyerIds = (assignments || []).map((a: { lawyer_id: string }) => a.lawyer_id).filter(Boolean)

    if (lawyerIds.length > 0) {
      // Get lawyer users for notification
      const { data: lawyerUsers } = await supabase
        .from('lawyer_users')
        .select('user_id, lawyer_id')
        .in('lawyer_id', lawyerIds)

      if (lawyerUsers && lawyerUsers.length > 0) {
        const lawyerNotifications = lawyerUsers.map((lu: { user_id: string; lawyer_id: string }) => ({
          user_id: lu.user_id,
          investor_id: null,
          title: isAdminSigner ? 'Subscription Pack Countersigned' : 'Subscription Pack Signed',
          message: isAdminSigner
            ? `${signerLabel} countersigned the subscription pack for ${subscription.investor?.display_name || subscription.investor?.legal_name || 'Investor'} (${subscription.vehicle?.name || 'the deal'}).`
            : `${subscription.investor?.display_name || subscription.investor?.legal_name || 'Investor'} has signed the subscription pack for ${subscription.vehicle?.name || 'the deal'}.`,
          link: '/versotech_main/subscription-packs'
        }))

        const { error: lawyerNotifError } = await supabase
          .from('investor_notifications')
          .insert(lawyerNotifications)

        if (lawyerNotifError) {
          console.error('❌ [SUBSCRIPTION HANDLER] Failed to notify lawyers:', lawyerNotifError)
        } else {
          console.log(`✅ [SUBSCRIPTION HANDLER] Notified ${lawyerUsers.length} lawyer(s)`)
        }
      } else {
        console.log('ℹ️ [SUBSCRIPTION HANDLER] No lawyer users found for assigned lawyers')
      }
    } else {
      console.log('ℹ️ [SUBSCRIPTION HANDLER] No lawyers assigned to this deal')
    }
  } else {
    console.log('⚠️ [SUBSCRIPTION HANDLER] No deal_id - skipping lawyer notifications')
  }

  // 7. CREATE AUDIT LOG ENTRY
  console.log('\n📝 [SUBSCRIPTION HANDLER] Step 7: Creating audit log entry')
  await supabase.from('audit_logs').insert({
    event_type: 'subscription',
    action: 'subscription_committed',
    entity_type: 'subscription',
    entity_id: subscriptionId,
    actor_id: null, // System-generated
    action_details: {
      description: 'Subscription agreement fully executed and status changed to committed',
      subscription_id: subscriptionId,
      investor_id: subscription.investor_id,
      vehicle_id: subscription.vehicle_id,
      commitment: subscription.commitment,
      document_id: document.id,
      workflow_run_id: signatureRequest.workflow_run_id,
      previous_status: previousStatus,
      new_status: 'committed'
    },
    timestamp: new Date().toISOString()
  })

  console.log('✅ [SUBSCRIPTION HANDLER] Audit log entry created')

  // Log subscription completion event for analytics KPIs
  if (subscription.deal_id) {
    try {
      await supabase.from('deal_activity_events').insert({
        deal_id: subscription.deal_id,
        investor_id: subscription.investor_id,
        event_type: 'subscription_completed',
        payload: {
          subscription_id: subscriptionId,
          signature_request_id: signatureRequest.id,
          commitment: subscription.commitment,
          currency: subscription.currency,
          document_id: document.id,
          vehicle_id: subscription.vehicle_id
        }
      })
      console.log('✅ [SUBSCRIPTION HANDLER] Analytics event logged: subscription_completed')
    } catch (eventError) {
      console.error('❌ [SUBSCRIPTION HANDLER] Failed to log analytics event:', eventError)
      // Non-blocking - don't fail subscription completion if analytics fails
    }
  } else {
    console.warn('⚠️ [SUBSCRIPTION HANDLER] Skipping analytics event - no deal_id on subscription')
  }

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
 * Introducer Agreement Post-Signature Handler
 *
 * Executes when an introducer agreement is signed. This handler:
 * - For Arranger/CEO signature (party_a): Updates status, creates signature request for introducer
 * - For Introducer signature (party_b): Activates agreement, notifies relevant parties
 *
 * Flow options:
 * - With arranger: Arranger (party_a) → Introducer (party_b)
 * - Without arranger: CEO (party_a) → Introducer (party_b)
 */
export async function handleIntroducerAgreementSignature(
  params: PostSignatureHandlerParams
): Promise<void> {
  console.log('\n🔵 [INTRODUCER AGREEMENT HANDLER] handleIntroducerAgreementSignature() called')
  const { signatureRequest, signedPdfPath, signedPdfBytes, supabase } = params

  console.log('📋 [INTRODUCER AGREEMENT HANDLER] Signature request details:', {
    id: signatureRequest.id,
    introducer_agreement_id: signatureRequest.introducer_agreement_id,
    introducer_id: signatureRequest.introducer_id,
    signature_position: signatureRequest.signature_position,
    signer_role: signatureRequest.signer_role,
    signed_pdf_path: signedPdfPath
  })

  const agreementId = signatureRequest.introducer_agreement_id

  if (!agreementId) {
    console.error('❌ [INTRODUCER AGREEMENT HANDLER] No introducer_agreement_id found')
    throw new Error('No introducer_agreement_id in signature request')
  }

  // Get the agreement with introducer and arranger info
  const { data: agreement, error: agreementError } = await supabase
    .from('introducer_agreements')
    .select(`
      *,
      introducer:introducer_id (
        id,
        legal_name,
        email,
        user_id
      )
    `)
    .eq('id', agreementId)
    .single()

  if (agreementError || !agreement) {
    console.error('❌ [INTRODUCER AGREEMENT HANDLER] Agreement not found:', agreementError)
    throw new Error('Introducer agreement not found')
  }

  // Get arranger info if applicable
  let arrangerEntity = null
  if (agreement.arranger_id) {
    const { data: arranger } = await supabase
      .from('arranger_entities')
      .select('id, legal_name, company_name')
      .eq('id', agreement.arranger_id)
      .single()
    arrangerEntity = arranger
  }

  const hasArranger = !!agreement.arranger_id
  const isArrangerSigner = signatureRequest.signer_role === 'arranger'

  console.log('✅ [INTRODUCER AGREEMENT HANDLER] Agreement found:', {
    agreement_id: agreement.id,
    introducer_id: agreement.introducer_id,
    arranger_id: agreement.arranger_id,
    has_arranger: hasArranger,
    current_status: agreement.status
  })

  // Check which signer just signed
  if (signatureRequest.signature_position === 'party_a') {
    // Party A signed (either Arranger or CEO)
    const signerType = isArrangerSigner ? 'Arranger' : 'CEO'
    console.log(`👔 [INTRODUCER AGREEMENT HANDLER] ${signerType} (party_a) signed - updating status`)

    // Update agreement status based on who signed
    const updateData: any = {
      status: 'pending_introducer_signature',
      updated_at: new Date().toISOString()
    }

    if (isArrangerSigner) {
      updateData.arranger_signature_request_id = signatureRequest.id
    } else {
      updateData.ceo_signature_request_id = signatureRequest.id
    }

    const { error: updateError } = await supabase
      .from('introducer_agreements')
      .update(updateData)
      .eq('id', agreementId)

    if (updateError) {
      console.error('❌ [INTRODUCER AGREEMENT HANDLER] Failed to update agreement status:', updateError)
      throw updateError
    }

    console.log('✅ [INTRODUCER AGREEMENT HANDLER] Status updated to pending_introducer_signature')

    // Create signature request for introducer (party_b)
    const introducer = agreement.introducer as any
    if (introducer?.user_id) {
      // Generate token for introducer's signature
      const crypto = await import('crypto')
      const signingToken = crypto.randomBytes(32).toString('hex')
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 14) // 14 days to sign

      const { data: introducerSignatureRequest, error: sigReqError } = await supabase
        .from('signature_requests')
        .insert({
          document_type: 'introducer_agreement',
          introducer_agreement_id: agreementId,
          introducer_id: agreement.introducer_id,
          investor_id: null, // Not an investor signature
          signer_user_id: introducer.user_id,
          signer_email: introducer.email || '',
          signer_name: introducer.legal_name || '',
          signer_role: 'introducer',
          signature_position: 'party_b',
          status: 'pending',
          signing_token: signingToken,
          token_expires_at: expiryDate.toISOString(),
          unsigned_pdf_path: signedPdfPath, // Signed PDF becomes unsigned for introducer
        })
        .select()
        .single()

      if (sigReqError) {
        console.error('❌ [INTRODUCER AGREEMENT HANDLER] Failed to create introducer signature request:', sigReqError)
        // CRITICAL: Roll back agreement status since signature request failed
        const rollbackStatus = isArrangerSigner ? 'pending_arranger_signature' : 'approved'
        await supabase
          .from('introducer_agreements')
          .update({
            status: rollbackStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', agreementId)
        console.log(`⚠️ [INTRODUCER AGREEMENT HANDLER] Rolled back agreement status to ${rollbackStatus} due to signature request failure`)
        throw new Error(`Failed to create introducer signature request: ${sigReqError.message}`)
      } else {
        console.log('✅ [INTRODUCER AGREEMENT HANDLER] Created signature request for introducer:', introducerSignatureRequest.id)

        // Update agreement with introducer signature request ID
        await supabase
          .from('introducer_agreements')
          .update({ introducer_signature_request_id: introducerSignatureRequest.id })
          .eq('id', agreementId)

        // Create notification for introducer
        const notificationMessage = isArrangerSigner
          ? `Your fee agreement has been signed by ${arrangerEntity?.company_name || arrangerEntity?.legal_name || 'the Arranger'} and is ready for your signature.`
          : 'Your fee agreement has been signed by the CEO and is ready for your signature.'

        await supabase.from('investor_notifications').insert({
          user_id: introducer.user_id,
          investor_id: null, // Introducer notification, not investor
          title: 'Agreement Ready for Signature',
          message: notificationMessage,
          link: `/versotech_main/introducer-agreements/${agreementId}`,
        })

        console.log('✅ [INTRODUCER AGREEMENT HANDLER] Notification sent to introducer')
      }
    } else {
      console.warn('⚠️ [INTRODUCER AGREEMENT HANDLER] Introducer has no user_id - cannot create signature request')
    }
  } else {
    // Introducer signed (party_b) - agreement is now active
    console.log('✍️ [INTRODUCER AGREEMENT HANDLER] Introducer (party_b) signed - activating agreement')

    const { error: updateError } = await supabase
      .from('introducer_agreements')
      .update({
        status: 'active',
        signed_date: new Date().toISOString(),
        introducer_signature_request_id: signatureRequest.id,
        signed_pdf_url: signedPdfPath, // Store fully signed PDF path
        updated_at: new Date().toISOString()
      })
      .eq('id', agreementId)

    if (updateError) {
      console.error('❌ [INTRODUCER AGREEMENT HANDLER] Failed to activate agreement:', updateError)
      throw updateError
    }

    console.log('✅ [INTRODUCER AGREEMENT HANDLER] Agreement activated')

    const introducer = agreement.introducer as any

    // Notify relevant parties based on signing flow
    if (hasArranger && arrangerEntity) {
      // Notify arranger users
      const { data: arrangerUsers } = await supabase
        .from('arranger_users')
        .select('user_id')
        .eq('arranger_id', agreement.arranger_id)
        .limit(5)

      if (arrangerUsers && arrangerUsers.length > 0) {
        const notifications = arrangerUsers.map((au: any) => ({
          user_id: au.user_id,
          investor_id: null,
          title: 'Introducer Agreement Fully Signed',
          message: `${introducer?.legal_name || 'Introducer'}'s fee agreement has been fully executed and is now active.`,
          link: `/versotech_main/my-introducers`,
        }))

        await supabase.from('investor_notifications').insert(notifications)
        console.log('✅ [INTRODUCER AGREEMENT HANDLER] Notifications sent to arranger users')
      }
    }

    // Always notify CEO/staff_admin users
    const { data: ceoUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'staff_admin')
      .limit(5)

    if (ceoUsers && ceoUsers.length > 0) {
      const notifications = ceoUsers.map((ceo: any) => ({
        user_id: ceo.id,
        investor_id: null,
        title: 'Introducer Agreement Fully Signed',
        message: `${introducer?.legal_name || 'Introducer'}'s fee agreement has been fully executed and is now active.`,
        link: `/versotech_main/introducers/${agreement.introducer_id}?tab=agreements`,
      }))

      await supabase.from('investor_notifications').insert(notifications)
      console.log('✅ [INTRODUCER AGREEMENT HANDLER] Notifications sent to CEO/staff')
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      event_type: 'introducer',
      action: 'agreement_activated',
      entity_type: 'introducer_agreement',
      entity_id: agreementId,
      actor_id: null, // System-generated
      action_details: {
        description: 'Introducer agreement fully executed and activated',
        introducer_id: agreement.introducer_id,
        arranger_id: agreement.arranger_id,
        signed_by_arranger: hasArranger,
        agreement_id: agreementId,
        signature_request_id: signatureRequest.id
      },
      timestamp: new Date().toISOString()
    })

    console.log('✅ [INTRODUCER AGREEMENT HANDLER] Audit log created')
  }

  console.log('\n🎉 [INTRODUCER AGREEMENT HANDLER] handleIntroducerAgreementSignature() completed')
}

/**
 * Placement Agreement Post-Signature Handler
 *
 * Executes when a placement agreement is signed. This handler:
 * - For CEO signature (party_a): Updates status, creates signature request for commercial partner
 * - For Commercial Partner signature (party_b): Activates agreement, notifies CEO
 */
export async function handlePlacementAgreementSignature(
  params: PostSignatureHandlerParams
): Promise<void> {
  console.log('\n🔵 [PLACEMENT AGREEMENT HANDLER] handlePlacementAgreementSignature() called')
  const { signatureRequest, signedPdfPath, signedPdfBytes, supabase } = params

  console.log('📋 [PLACEMENT AGREEMENT HANDLER] Signature request details:', {
    id: signatureRequest.id,
    placement_agreement_id: signatureRequest.placement_agreement_id,
    placement_id: signatureRequest.placement_id,
    signature_position: signatureRequest.signature_position,
    signed_pdf_path: signedPdfPath
  })

  const agreementId = signatureRequest.placement_agreement_id

  if (!agreementId) {
    console.error('❌ [PLACEMENT AGREEMENT HANDLER] No placement_agreement_id found')
    throw new Error('No placement_agreement_id in signature request')
  }

  // Get the agreement with commercial partner info
  const { data: agreement, error: agreementError } = await supabase
    .from('placement_agreements')
    .select(`
      *,
      commercial_partner:commercial_partner_id (
        id,
        legal_name,
        display_name,
        email
      )
    `)
    .eq('id', agreementId)
    .single()

  if (agreementError || !agreement) {
    console.error('❌ [PLACEMENT AGREEMENT HANDLER] Agreement not found:', agreementError)
    throw new Error('Placement agreement not found')
  }

  console.log('✅ [PLACEMENT AGREEMENT HANDLER] Agreement found:', {
    agreement_id: agreement.id,
    commercial_partner_id: agreement.commercial_partner_id,
    current_status: agreement.status
  })

  // Check which signer just signed
  if (signatureRequest.signature_position === 'party_a') {
    // CEO signed first
    console.log('👔 [PLACEMENT AGREEMENT HANDLER] CEO (party_a) signed - updating status')

    // Update agreement status and store CEO signature request ID
    const { error: updateError } = await supabase
      .from('placement_agreements')
      .update({
        status: 'pending_cp_signature',
        ceo_signature_request_id: signatureRequest.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', agreementId)

    if (updateError) {
      console.error('❌ [PLACEMENT AGREEMENT HANDLER] Failed to update agreement status:', updateError)
      throw updateError
    }

    console.log('✅ [PLACEMENT AGREEMENT HANDLER] Status updated to pending_cp_signature')

    // Get commercial partner user(s) to create signature request
    const { data: cpUsers } = await supabase
      .from('commercial_partner_users')
      .select('user_id')
      .eq('commercial_partner_id', agreement.commercial_partner_id)

    const cp = agreement.commercial_partner as any
    if (cpUsers && cpUsers.length > 0) {
      const primaryCpUser = cpUsers[0]

      // Get user email from profiles
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', primaryCpUser.user_id)
        .single()

      // Generate token for CP's signature
      const crypto = await import('crypto')
      const signingToken = crypto.randomBytes(32).toString('hex')
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 14) // 14 days to sign

      const { data: cpSignatureRequest, error: sigReqError } = await supabase
        .from('signature_requests')
        .insert({
          document_type: 'placement_agreement',
          placement_agreement_id: agreementId,
          placement_id: agreement.commercial_partner_id,
          investor_id: null, // Not an investor signature
          signer_user_id: primaryCpUser.user_id,
          signer_email: userProfile?.email || cp?.email || '',
          signer_name: userProfile?.full_name || cp?.display_name || cp?.legal_name || '',
          signer_role: 'commercial_partner',
          signature_position: 'party_b',
          status: 'pending',
          signing_token: signingToken,
          token_expires_at: expiryDate.toISOString(),
          unsigned_pdf_path: signedPdfPath, // CEO-signed PDF becomes unsigned for CP
        })
        .select()
        .single()

      if (sigReqError) {
        console.error('❌ [PLACEMENT AGREEMENT HANDLER] Failed to create CP signature request:', sigReqError)
        // Roll back agreement status
        await supabase
          .from('placement_agreements')
          .update({
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', agreementId)
        console.log('⚠️ [PLACEMENT AGREEMENT HANDLER] Rolled back agreement status to approved')
        throw new Error(`Failed to create CP signature request: ${sigReqError.message}`)
      } else {
        console.log('✅ [PLACEMENT AGREEMENT HANDLER] Created signature request for CP:', cpSignatureRequest.id)

        // Update agreement with CP signature request ID
        await supabase
          .from('placement_agreements')
          .update({ cp_signature_request_id: cpSignatureRequest.id })
          .eq('id', agreementId)

        // Create notifications for all CP users
        const notifications = cpUsers.map((cpUser: any) => ({
          user_id: cpUser.user_id,
          investor_id: null,
          title: 'Placement Agreement Ready for Signature',
          message: 'Your placement agreement has been signed by the CEO and is ready for your signature.',
          link: `/versotech_main/placement-agreements/${agreementId}`,
        }))

        await supabase.from('investor_notifications').insert(notifications)
        console.log('✅ [PLACEMENT AGREEMENT HANDLER] Notifications sent to CP users')
      }
    } else {
      console.warn('⚠️ [PLACEMENT AGREEMENT HANDLER] Commercial partner has no users - cannot create signature request')
    }
  } else {
    // Commercial Partner signed (party_b) - agreement is now active
    console.log('✍️ [PLACEMENT AGREEMENT HANDLER] CP (party_b) signed - activating agreement')

    const { error: updateError } = await supabase
      .from('placement_agreements')
      .update({
        status: 'active',
        signed_at: new Date().toISOString(),
        cp_signature_request_id: signatureRequest.id,
        signed_pdf_url: signedPdfPath,
        updated_at: new Date().toISOString()
      })
      .eq('id', agreementId)

    if (updateError) {
      console.error('❌ [PLACEMENT AGREEMENT HANDLER] Failed to activate agreement:', updateError)
      throw updateError
    }

    console.log('✅ [PLACEMENT AGREEMENT HANDLER] Agreement activated')

    // Notify CEO/staff_admin users
    const { data: ceoUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'staff_admin')
      .limit(5)

    const cp = agreement.commercial_partner as any
    if (ceoUsers && ceoUsers.length > 0) {
      const notifications = ceoUsers.map((ceo: any) => ({
        user_id: ceo.id,
        investor_id: null,
        title: 'Placement Agreement Fully Signed',
        message: `${cp?.display_name || cp?.legal_name || 'Commercial Partner'}'s placement agreement has been fully executed and is now active.`,
        link: `/versotech_main/commercial-partners/${agreement.commercial_partner_id}?tab=agreements`,
      }))

      await supabase.from('investor_notifications').insert(notifications)
      console.log('✅ [PLACEMENT AGREEMENT HANDLER] Notifications sent to CEO/staff')
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
        signature_request_id: signatureRequest.id
      },
      timestamp: new Date().toISOString()
    })

    console.log('✅ [PLACEMENT AGREEMENT HANDLER] Audit log created')
  }

  console.log('\n🎉 [PLACEMENT AGREEMENT HANDLER] handlePlacementAgreementSignature() completed')
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
    case 'introducer_agreement':
      return handleIntroducerAgreementSignature(params)
    case 'placement_agreement':
      return handlePlacementAgreementSignature(params)
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
