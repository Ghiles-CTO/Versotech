/**
 * Post-signature handlers for different document types
 *
 * These handlers execute business logic after a document is fully signed,
 * such as storing documents, granting access, or triggering workflows.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PostSignatureHandlerParams } from './types'

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
 * 3. Updates subscription status to 'executed'
 * 4. Triggers subscription pack workflow (if applicable)
 */
export async function handleSubscriptionSignature(
  params: PostSignatureHandlerParams
): Promise<void> {
  const { signatureRequest, signedPdfPath, signedPdfBytes, supabase } = params

  // TODO: Implement subscription post-signature logic
  // This will be implemented when subscription signing is added
  console.log('⚠️ Subscription post-signature handler not yet implemented')

  throw new Error(
    'Subscription signature handling is not yet implemented. ' +
      'This feature is planned for future release.'
  )
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
