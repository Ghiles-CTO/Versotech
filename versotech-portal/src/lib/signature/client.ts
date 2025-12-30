/**
 * Main signature system client
 *
 * This module provides the core business logic for signature request management.
 * All API routes should use these functions instead of implementing logic directly.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  generateSignatureToken,
  calculateTokenExpiry,
  isTokenExpired,
  generateSigningUrl,
  getAppUrl
} from './token'
import { SignatureStorageManager, downloadPDFFromUrl } from './storage'
import { embedSignatureInPDF } from './pdf-processor'
import { routeSignatureHandler } from './handlers'
import { sendSignatureRequestEmail } from '@/lib/email/resend-service'
import type {
  CreateSignatureRequestParams,
  CreateSignatureRequestResult,
  SignatureRequestPublicView,
  SubmitSignatureParams,
  SubmitSignatureResult,
  SignatureRequestRecord
} from './types'

/**
 * Create a new signature request
 *
 * This function:
 * 1. Generates a secure signing token
 * 2. Downloads PDF from Google Drive if provided
 * 3. Uploads unsigned PDF to storage
 * 4. Creates signature_requests database record
 * 5. Returns signing URL for the signer
 */
export async function createSignatureRequest(
  params: CreateSignatureRequestParams,
  supabase: SupabaseClient
): Promise<CreateSignatureRequestResult> {
  console.log('\n🔵 [SIGNATURE] createSignatureRequest() called')
  console.log('📋 [SIGNATURE] Params:', {
    workflow_run_id: params.workflow_run_id,
    investor_id: params.investor_id,
    signer_email: params.signer_email,
    signer_name: params.signer_name,
    document_type: params.document_type,
    signer_role: params.signer_role,
    signature_position: params.signature_position,
    has_google_drive_url: !!params.google_drive_url
  })

  try {
    const {
      workflow_run_id,
      investor_id,
      signer_email,
      signer_name,
      document_type,
      google_drive_file_id,
      google_drive_url,
      signer_role,
      signature_position
    } = params

    // Validate required fields
    // Note: workflow_run_id is optional for manually uploaded documents
    if (
      !investor_id ||
      !signer_email ||
      !signer_name ||
      !document_type ||
      !signer_role ||
      !signature_position
    ) {
      console.log('❌ [SIGNATURE] Validation failed: Missing required fields')
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    console.log('✅ [SIGNATURE] Validation passed')

    // Validate app URL is configured BEFORE creating any database records
    try {
      getAppUrl()
      console.log('✅ [SIGNATURE] App URL configured')
    } catch (error) {
      console.error('❌ [SIGNATURE] App URL not configured:', error)
      return {
        success: false,
        error: 'Application URL not configured. Cannot generate signing links.'
      }
    }

    // DUPLICATE PREVENTION: Check for existing signature request before any operations
    // This protects ALL code paths that create signature requests (ready-for-signature, NDA approvals, direct API)
    console.log('🔍 [SIGNATURE] Checking for duplicate signature requests...')

    if (params.workflow_run_id) {
      // For n8n workflows: check (workflow_run_id, signer_role) pair
      const { data: existingWorkflow } = await supabase
        .from('signature_requests')
        .select('id, status')
        .eq('workflow_run_id', params.workflow_run_id)
        .eq('signer_role', signer_role)
        .in('status', ['pending', 'signed'])
        .limit(1)

      if (existingWorkflow && existingWorkflow.length > 0) {
        console.warn(`⚠️ [SIGNATURE] Duplicate prevention: Found existing ${signer_role} signature request for workflow ${params.workflow_run_id}`)
        return {
          success: false,
          error: `A signature request already exists for ${signer_role} on this workflow (status: ${existingWorkflow[0].status})`
        }
      }
    }

    if (params.document_id) {
      // For manual uploads: check (document_id, signer_role) pair
      const { data: existingDocument } = await supabase
        .from('signature_requests')
        .select('id, status')
        .eq('document_id', params.document_id)
        .eq('signer_role', signer_role)
        .in('status', ['pending', 'signed'])
        .limit(1)

      if (existingDocument && existingDocument.length > 0) {
        console.warn(`⚠️ [SIGNATURE] Duplicate prevention: Found existing ${signer_role} signature request for document ${params.document_id}`)
        return {
          success: false,
          error: `A signature request already exists for ${signer_role} on this document (status: ${existingDocument[0].status})`
        }
      }
    }

    console.log('✅ [SIGNATURE] No duplicate signature requests found')

    // Generate signing token and expiry
    const signing_token = generateSignatureToken()
    const token_expires_at = calculateTokenExpiry()
    console.log('🔑 [SIGNATURE] Generated token:', {
      token_length: signing_token.length,
      expires_at: token_expires_at.toISOString()
    })

    // Initialize storage manager
    const storage = new SignatureStorageManager(supabase)

    // Download and upload unsigned PDF if Google Drive URL provided
    let unsigned_pdf_path: string | null = null
    let unsigned_pdf_size: number | null = null

    if (google_drive_url) {
      console.log('📥 [SIGNATURE] Downloading PDF from Google Drive:', google_drive_url)
      try {
        const pdfBytes = await downloadPDFFromUrl(google_drive_url)
        console.log('✅ [SIGNATURE] PDF downloaded:', {
          size_bytes: pdfBytes.length,
          size_mb: (pdfBytes.length / 1024 / 1024).toFixed(2)
        })

        console.log('📤 [SIGNATURE] Uploading unsigned PDF to storage')
        const path = await storage.uploadUnsignedPDF(
          investor_id,
          signing_token,
          pdfBytes,
          {
            workflow_run_id: workflow_run_id || '',
            investor_id,
            document_type,
            google_drive_file_id: google_drive_file_id || ''
          }
        )

        unsigned_pdf_path = path
        unsigned_pdf_size = pdfBytes.length
        console.log('✅ [SIGNATURE] Unsigned PDF uploaded:', { path, size: pdfBytes.length })
      } catch (uploadError) {
        console.error('❌ [SIGNATURE] Error downloading/uploading PDF:', uploadError)
        // Continue without unsigned PDF - it will be downloaded from Google Drive at signing time
      }
    } else {
      console.log('⚠️ [SIGNATURE] No Google Drive URL provided, PDF will be fetched at signing time')
    }

    // Create signature request record
    console.log('💾 [SIGNATURE] Creating signature_requests database record')
    const insertData: any = {
      investor_id,
      signer_email,
      signer_name,
      document_type,
      signing_token,
      token_expires_at: token_expires_at.toISOString(),
      google_drive_file_id,
      google_drive_url,
      unsigned_pdf_path,
      unsigned_pdf_size,
      signer_role,
      signature_position,
      status: 'pending'
    }

    // Only include workflow_run_id if provided (not all docs have workflow runs)
    if (workflow_run_id) {
      insertData.workflow_run_id = workflow_run_id
    }

    // Include subscription_id and document_id if provided (for manual uploads)
    // Also look up deal_id from subscription for task linking
    let deal_id: string | null = params.deal_id ?? null

    // If deal_id provided directly, use it
    if (params.deal_id) {
      insertData.deal_id = params.deal_id
      console.log('📋 [SIGNATURE] Using provided deal_id:', deal_id)
    }

    if (params.subscription_id) {
      insertData.subscription_id = params.subscription_id

      // Look up deal_id from subscription if not already provided
      if (!deal_id) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('deal_id')
          .eq('id', params.subscription_id)
          .single()

        if (subscription?.deal_id) {
          deal_id = subscription.deal_id
          insertData.deal_id = deal_id  // Also set on signature_request
          console.log('📋 [SIGNATURE] Found deal_id from subscription:', deal_id)
        }
      }
    }
    if (params.document_id) {
      insertData.document_id = params.document_id
    }

    const { data: signatureRequest, error: insertError } = await supabase
      .from('signature_requests')
      .insert(insertData)
      .select()
      .single()

    if (insertError || !signatureRequest) {
      console.error('❌ [SIGNATURE] Failed to create signature request:', insertError)
      return {
        success: false,
        error: 'Failed to create signature request'
      }
    }

    console.log('✅ [SIGNATURE] Signature request record created:', {
      id: signatureRequest.id,
      status: signatureRequest.status
    })

    // Generate signing URL
    const signing_url = generateSigningUrl(signing_token)
    console.log('🔗 [SIGNATURE] Generated signing URL:', signing_url)

    // Send email with signing link using Resend
    console.log('📧 [SIGNATURE] Sending signature request email to:', signer_email)

    const emailResult = await sendSignatureRequestEmail({
      email: signer_email,
      signerName: signer_name,
      documentType: document_type,
      signingUrl: signing_url,
      expiresAt: token_expires_at.toISOString()
    })

    if (emailResult.success) {
      console.log('✅ [SIGNATURE] Email sent successfully:', emailResult.messageId)

      // Mark email as sent
      await supabase
        .from('signature_requests')
        .update({
          email_sent_at: new Date().toISOString()
        })
        .eq('id', signatureRequest.id)
    } else {
      console.error('❌ [SIGNATURE] Email send failed:', emailResult.error)

      // Don't fail the signature request creation, but log the error
      // Email failure is non-critical since users can access via tasks portal
      await supabase
        .from('signature_requests')
        .update({
          email_sent_at: null // Explicitly mark as not sent
        })
        .eq('id', signatureRequest.id)
    }

    // Create task for staff signatures (admin, arranger roles) to appear in VERSOSign
    if (signer_role === 'admin' || signer_role === 'arranger') {
      console.log('📋 [SIGNATURE] Creating task for staff signature in VERSOSign')

      // Find the staff user by email
      const { data: staffProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('email', signer_email)
        .single()

      if (staffProfile && !profileError) {
        const { error: taskError } = await supabase.from('tasks').insert({
          owner_user_id: staffProfile.id,
          kind: 'countersignature',
          category: 'compliance',
          title: `Countersign ${document_type.toUpperCase()} for ${signer_name}`,
          description: `Review and countersign the ${document_type} document`,
          status: 'pending',
          priority: 'high',
          related_entity_type: 'signature_request',
          related_entity_id: signatureRequest.id,
          related_deal_id: deal_id,  // Link task to deal for VERSOSign queries
          instructions: {
            type: 'signature',
            action_url: signing_url,
            signature_request_id: signatureRequest.id,
            document_type: document_type,
            investor_name: signer_name,
            workflow_run_id: workflow_run_id
          }
        })

        if (taskError) {
          console.error('⚠️ [SIGNATURE] Failed to create task:', taskError)
        } else {
          console.log('✅ [SIGNATURE] Task created for VERSOSign:', {
            assignee: staffProfile.display_name,
            title: `Countersign ${document_type.toUpperCase()} for ${signer_name}`
          })
        }
      } else {
        console.warn('⚠️ [SIGNATURE] Could not find staff profile for:', signer_email)
      }
    }

    // Create task for investor signatures to appear in investor portal
    if (signer_role === 'investor') {
      console.log('📋 [SIGNATURE] Creating task for investor signature in investor portal')

      // Get investor's user account from investor_users table
      const { data: investorUsers, error: investorUserError } = await supabase
        .from('investor_users')
        .select('user_id')
        .eq('investor_id', investor_id)
        .limit(1)

      const ownerUserId = investorUsers?.[0]?.user_id ?? null

      if (ownerUserId && !investorUserError) {
        // Investor has user account - create task in their portal
        console.log('✅ [SIGNATURE] Found investor user account:', ownerUserId)

        // Determine task kind and category based on document type
        const taskKind = document_type === 'nda'
          ? 'deal_nda_signature'
          : document_type === 'subscription'
          ? 'subscription_pack_signature'
          : 'other'

        const category = document_type === 'nda'
          ? 'compliance'
          : 'investment_setup'

        const title = document_type === 'nda'
          ? 'Sign Non-Disclosure Agreement'
          : document_type === 'subscription'
          ? 'Sign Subscription Agreement'
          : `Sign ${document_type.toUpperCase()} Document`

        const { error: taskError } = await supabase.from('tasks').insert({
          owner_user_id: ownerUserId,
          owner_investor_id: investor_id,
          kind: taskKind,
          category: category,
          title: title,
          description: `Please review and sign the ${document_type} document`,
          status: 'pending',
          priority: 'high',
          related_entity_type: 'signature_request',
          related_entity_id: signatureRequest.id,
          related_deal_id: deal_id,  // Link task to deal for VERSOSign queries
          due_at: token_expires_at.toISOString(),
          instructions: {
            type: 'signature',
            action_url: signing_url,
            signature_request_id: signatureRequest.id,
            document_type: document_type,
            workflow_run_id: workflow_run_id,
            steps: [
              'Click "Start Task" to open the signature page',
              'Review the document carefully',
              'Draw or upload your signature',
              'Click "Submit Signature" to complete'
            ],
            requirements: [
              'Valid signature required',
              'Must be completed before expiration'
            ],
            estimated_time: '5-10 minutes'
          }
        })

        if (taskError) {
          console.error('⚠️ [SIGNATURE] Failed to create investor task:', taskError)
        } else {
          console.log('✅ [SIGNATURE] Investor task created:', {
            owner_user_id: ownerUserId,
            title: title,
            kind: taskKind
          })

          // Create notification for investor
          const { error: notificationError } = await supabase.from('investor_notifications').insert({
            user_id: ownerUserId,
            type: 'signature_required',
            title: `${document_type.toUpperCase()} Ready for Signature`,
            message: `Your ${document_type} document is ready for signature. Please sign within ${Math.floor((token_expires_at.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days.`,
            action_url: `/versotech_main/tasks`,
            metadata: {
              signature_request_id: signatureRequest.id,
              document_type: document_type
            }
          })

          if (notificationError) {
            console.error('⚠️ [SIGNATURE] Failed to create notification:', notificationError)
          } else {
            console.log('✅ [SIGNATURE] Notification created for investor')
          }
        }
      } else {
        // Investor has NO user account - create manual follow-up task for staff
        console.log('⚠️ [SIGNATURE] Investor has no user account - creating manual follow-up task for staff')

        // Find a staff user to assign the follow-up task to (get first admin)
        const { data: adminUsers, error: adminError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .eq('role', 'staff_admin')
          .limit(1)

        const adminUserId = adminUsers?.[0]?.id

        if (adminUserId && !adminError) {
          const { error: followUpError } = await supabase.from('tasks').insert({
            owner_user_id: adminUserId,
            kind: 'other',
            category: 'compliance',
            title: `Manual Follow-up: Send ${document_type.toUpperCase()} Signature Link`,
            description: `Investor ${signer_name} does not have a user account. Manually send them the signature link.`,
            status: 'pending',
            priority: 'high',
            related_entity_type: 'signature_request',
            related_entity_id: signatureRequest.id,
            related_deal_id: deal_id,  // Link task to deal for VERSOSign queries
            instructions: {
              type: 'manual_follow_up',
              action_url: signing_url,
              investor_name: signer_name,
              investor_email: signer_email,
              document_type: document_type,
              signature_request_id: signatureRequest.id,
              action_required: 'Send the signature link to the investor via email or other communication channel'
            }
          })

          if (followUpError) {
            console.error('⚠️ [SIGNATURE] Failed to create manual follow-up task:', followUpError)
            throw new Error(`Failed to create manual follow-up task: ${followUpError.message}`)
          } else {
            console.log('✅ [SIGNATURE] Manual follow-up task created for staff')
          }
        } else {
          console.error('⚠️ [SIGNATURE] Could not find admin user for manual follow-up task assignment')
          throw new Error('No admin user available to assign manual follow-up task. Signature request cannot be created without a way to notify staff.')
        }
      }
    }

    console.log('✅ [SIGNATURE] createSignatureRequest() completed successfully')
    console.log('📊 [SIGNATURE] Result:', {
      signature_request_id: signatureRequest.id,
      signer_email,
      signer_role,
      signature_position,
      signing_url,
      expires_at: token_expires_at.toISOString()
    })

    return {
      success: true,
      signature_request_id: signatureRequest.id,
      signing_url,
      expires_at: token_expires_at.toISOString()
    }
  } catch (error) {
    console.error('Signature request error:', error)
    return {
      success: false,
      error: 'Internal server error'
    }
  }
}

/**
 * Get signature request by token (public endpoint for signers)
 *
 * This function:
 * 1. Fetches signature request by token
 * 2. Validates token expiry and status
 * 3. Generates temporary signed URL for unsigned PDF
 * 4. Returns public view (no sensitive fields)
 */
export async function getSignatureRequest(
  token: string,
  supabase: SupabaseClient
): Promise<SignatureRequestPublicView | null> {
  try {
    if (!token) {
      throw new Error('Token is required')
    }

    // Fetch signature request by token
    const { data: signatureRequest, error } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('signing_token', token)
      .single()

    if (error || !signatureRequest) {
      throw new Error('Signature request not found')
    }

    // Check if token is expired
    if (isTokenExpired(signatureRequest.token_expires_at)) {
      // Update status to expired
      await supabase
        .from('signature_requests')
        .update({ status: 'expired' })
        .eq('id', signatureRequest.id)

      throw new Error('Signature token has expired')
    }

    // Check if already signed
    if (signatureRequest.status === 'signed') {
      throw new Error('Document has already been signed')
    }

    // Check if cancelled
    if (signatureRequest.status === 'cancelled') {
      throw new Error('Signature request has been cancelled')
    }

    // Get unsigned PDF URL if it exists
    let unsigned_pdf_url: string | null = null

    if (signatureRequest.unsigned_pdf_path) {
      const storage = new SignatureStorageManager(supabase)
      unsigned_pdf_url = await storage.getSignedUrl(
        signatureRequest.unsigned_pdf_path,
        3600
      ) // 1 hour expiry
    }

    // Return public view
    return {
      id: signatureRequest.id,
      signer_name: signatureRequest.signer_name,
      signer_email: signatureRequest.signer_email,
      document_type: signatureRequest.document_type,
      unsigned_pdf_url,
      google_drive_url: signatureRequest.google_drive_url,
      status: signatureRequest.status,
      expires_at: signatureRequest.token_expires_at
    }
  } catch (error) {
    console.error('Error fetching signature request:', error)
    return null
  }
}

/**
 * Submit signature (sign document)
 *
 * This function implements the complete signature submission flow:
 * 1. Validates token and status
 * 2. Implements progressive signing (multi-party documents)
 * 3. Downloads base PDF (unsigned or already-signed)
 * 4. Embeds signature using pdf-lib
 * 5. Uploads signed PDF
 * 6. Updates database with optimistic locking
 * 7. Checks if all signatures complete
 * 8. Executes post-signature handler if fully signed
 */
export async function submitSignature(
  params: SubmitSignatureParams,
  supabase: SupabaseClient,
  ipAddress: string = 'unknown'
): Promise<SubmitSignatureResult> {
  console.log('\n🟢 [SIGNATURE] submitSignature() called')
  console.log('📋 [SIGNATURE] Params:', {
    token_length: params.token?.length || 0,
    has_signature_data: !!params.signature_data_url,
    ip_address: ipAddress
  })

  // Declare at function scope so catch block can access for lock cleanup
  let signatureRequest: any = null
  let lockAcquired = false

  try {
    const { token, signature_data_url } = params

    if (!token || !signature_data_url) {
      console.log('❌ [SIGNATURE] Validation failed: Missing token or signature data')
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    // Fetch signature request
    console.log('🔍 [SIGNATURE] Fetching signature request by token')
    const { data: fetchedRequest, error: fetchError } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('signing_token', token)
      .single()

    if (fetchError || !fetchedRequest) {
      console.log('❌ [SIGNATURE] Signature request not found:', fetchError)
      return {
        success: false,
        error: 'Signature request not found'
      }
    }

    // Assign to function-scoped variable
    signatureRequest = fetchedRequest

    console.log('✅ [SIGNATURE] Signature request found:', {
      id: signatureRequest.id,
      signer_email: signatureRequest.signer_email,
      signer_role: signatureRequest.signer_role,
      signature_position: signatureRequest.signature_position,
      status: signatureRequest.status,
      workflow_run_id: signatureRequest.workflow_run_id
    })

    // Validate token not expired
    if (isTokenExpired(signatureRequest.token_expires_at)) {
      console.log('❌ [SIGNATURE] Token expired:', signatureRequest.token_expires_at)
      await supabase
        .from('signature_requests')
        .update({ status: 'expired' })
        .eq('id', signatureRequest.id)

      return {
        success: false,
        error: 'Signature token has expired'
      }
    }

    // Validate not already signed
    if (signatureRequest.status === 'signed') {
      console.log('❌ [SIGNATURE] Document already signed')
      return {
        success: false,
        error: 'Document has already been signed'
      }
    }

    console.log('✅ [SIGNATURE] Validation passed - token valid and not yet signed')

    // PROGRESSIVE SIGNING: Acquire workflow-level lock to prevent race conditions
    let lockAttempts = 0
    const maxLockAttempts = 20  // Increased from 10 to 20 for better UX
    const baseRetryDelayMs = 500
    const maxRetryDelayMs = 3000  // Cap at 3 seconds

    if (signatureRequest.workflow_run_id) {
      console.log('🔒 [SIGNATURE] Attempting to acquire workflow lock for:', signatureRequest.workflow_run_id)

      while (!lockAcquired && lockAttempts < maxLockAttempts) {
        lockAttempts++

        // Try to acquire lock by updating a lock field
        const { data: lockResult, error: lockError } = await supabase
          .from('workflow_runs')
          .update({
            signing_in_progress: true,
            signing_locked_by: signatureRequest.id,
            signing_locked_at: new Date().toISOString()
          })
          .eq('id', signatureRequest.workflow_run_id)
          .is('signing_in_progress', null)  // Only acquire if not already locked
          .select('id')
          .single()

        if (lockResult && !lockError) {
          lockAcquired = true
          console.log(`✅ [SIGNATURE] Workflow lock acquired (attempt ${lockAttempts})`)
        } else {
          // Exponential backoff: 500ms, 1000ms, 1500ms, 2000ms, 2500ms, 3000ms, 3000ms...
          // Total max wait time: ~30 seconds (much better for concurrent signing UX)
          const delay = Math.min(baseRetryDelayMs * lockAttempts, maxRetryDelayMs)
          console.log(`⏳ [SIGNATURE] Workflow locked by another signer, waiting ${delay}ms... (attempt ${lockAttempts}/${maxLockAttempts})`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      if (!lockAcquired) {
        console.error('❌ [SIGNATURE] Failed to acquire workflow lock after', maxLockAttempts, 'attempts')
        return {
          success: false,
          error: 'Another party is currently signing this document. Please wait a moment and try again.'
        }
      }
    }

    // PROGRESSIVE SIGNING: Check if another signer has already signed
    let pdfBytes: Uint8Array | null = null
    const storage = new SignatureStorageManager(supabase)

    if (signatureRequest.workflow_run_id) {
      console.log('🔄 [SIGNATURE] Checking for progressive signing in workflow:', signatureRequest.workflow_run_id)
      // Get all other signature requests for this workflow
      const { data: otherSignatures } = await supabase
        .from('signature_requests')
        .select('id, status, signed_pdf_path, signer_role')
        .eq('workflow_run_id', signatureRequest.workflow_run_id)
        .neq('id', signatureRequest.id)
        .eq('status', 'signed')
        .order('created_at', { ascending: true })

      // If another party already signed, use their signed PDF as base
      if (otherSignatures && otherSignatures.length > 0) {
        const firstSigned = otherSignatures[0]

        console.log('✅ [SIGNATURE] Found existing signature - progressive signing active')
        console.log('📥 [SIGNATURE] Loading already-signed PDF from', firstSigned.signer_role)

        if (firstSigned.signed_pdf_path) {
          pdfBytes = await storage.downloadPDF(firstSigned.signed_pdf_path)
          console.log('✅ [SIGNATURE] Downloaded already-signed PDF:', {
            size_bytes: pdfBytes.length,
            from_signer: firstSigned.signer_role
          })
        }
      } else {
        console.log('ℹ️ [SIGNATURE] No other signatures found - this is the first signature')
      }
    }

    // If no other signature exists, download unsigned PDF
    if (!pdfBytes) {
      console.log('📄 [SIGNATURE] Loading unsigned PDF')

      if (signatureRequest.unsigned_pdf_path) {
        console.log('📥 [SIGNATURE] Downloading from Supabase Storage:', signatureRequest.unsigned_pdf_path)
        pdfBytes = await storage.downloadPDF(signatureRequest.unsigned_pdf_path)
        console.log('✅ [SIGNATURE] Downloaded unsigned PDF from storage:', {
          size_bytes: pdfBytes.length
        })
      } else if (signatureRequest.google_drive_url) {
        console.log('📥 [SIGNATURE] Downloading from Google Drive:', signatureRequest.google_drive_url)
        pdfBytes = await downloadPDFFromUrl(signatureRequest.google_drive_url)
        console.log('✅ [SIGNATURE] Downloaded unsigned PDF from Google Drive:', {
          size_bytes: pdfBytes.length
        })
      } else {
        console.log('❌ [SIGNATURE] No PDF source available')

        // Release lock before returning
        if (lockAcquired && signatureRequest.workflow_run_id) {
          await supabase
            .from('workflow_runs')
            .update({ signing_in_progress: null, signing_locked_by: null, signing_locked_at: null })
            .eq('id', signatureRequest.workflow_run_id)
            .eq('signing_locked_by', signatureRequest.id)
        }

        return {
          success: false,
          error: 'No PDF source available'
        }
      }
    }

    // Embed signature in PDF
    console.log('✍️ [SIGNATURE] Embedding signature into PDF')
    console.log('📐 [SIGNATURE] Signature details:', {
      signer_name: signatureRequest.signer_name,
      signature_position: signatureRequest.signature_position,
      pdf_size_before: pdfBytes.length
    })
    const signedPdfBytes = await embedSignatureInPDF({
      pdfBytes,
      signatureDataUrl: signature_data_url,
      signerName: signatureRequest.signer_name,
      signaturePosition: signatureRequest.signature_position,
      timestamp: new Date()
    })
    console.log('✅ [SIGNATURE] Signature embedded successfully:', {
      pdf_size_after: signedPdfBytes.length
    })

    // Upload signed PDF to storage
    console.log('📤 [SIGNATURE] Uploading signed PDF to storage')
    const signedPdfPath = await storage.uploadSignedPDF(
      signatureRequest.investor_id,
      token,
      signedPdfBytes,
      {
        workflow_run_id: signatureRequest.workflow_run_id || '',
        investor_id: signatureRequest.investor_id,
        document_type: signatureRequest.document_type,
        signed_at: new Date().toISOString(),
        signer_name: signatureRequest.signer_name,
        signer_email: signatureRequest.signer_email
      }
    )
    console.log('✅ [SIGNATURE] Signed PDF uploaded:', signedPdfPath)

    // Update signature request with optimistic locking
    console.log('💾 [SIGNATURE] Updating signature_requests record with optimistic lock')
    const { error: updateError, count } = await supabase
      .from('signature_requests')
      .update({
        status: 'signed',
        signature_data_url,
        signature_timestamp: new Date().toISOString(),
        signature_ip_address: ipAddress,
        signed_pdf_path: signedPdfPath,
        signed_pdf_size: signedPdfBytes.length
      }, { count: 'exact' })
      .eq('id', signatureRequest.id)
      .eq('status', 'pending') // Optimistic lock
      .select('id')

    if (updateError) {
      console.error('❌ [SIGNATURE] Failed to update signature request:', updateError)

      // Release lock before returning
      if (lockAcquired && signatureRequest.workflow_run_id) {
        await supabase
          .from('workflow_runs')
          .update({ signing_in_progress: null, signing_locked_by: null, signing_locked_at: null })
          .eq('id', signatureRequest.workflow_run_id)
          .eq('signing_locked_by', signatureRequest.id)
      }

      return {
        success: false,
        error: 'Failed to update signature status'
      }
    }

    // Check if update succeeded (race condition detection)
    if (count === 0) {
      console.error('❌ [SIGNATURE] Race condition: Signature request was already signed')

      // Release lock before returning
      if (lockAcquired && signatureRequest.workflow_run_id) {
        await supabase
          .from('workflow_runs')
          .update({ signing_in_progress: null, signing_locked_by: null, signing_locked_at: null })
          .eq('id', signatureRequest.workflow_run_id)
          .eq('signing_locked_by', signatureRequest.id)
      }

      return {
        success: false,
        error: 'This document has already been signed'
      }
    }

    console.log('✅ [SIGNATURE] Database record updated successfully - status set to "signed"')
    console.log('📊 [SIGNATURE] Signature submission complete:', {
      id: signatureRequest.id,
      signer_email: signatureRequest.signer_email,
      signer_role: signatureRequest.signer_role,
      signed_pdf_path: signedPdfPath,
      workflow_run_id: signatureRequest.workflow_run_id
    })

    // Auto-complete any related tasks
    console.log('🔍 [SIGNATURE] Looking for related tasks to auto-complete')
    const { data: relatedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, owner_user_id')
      .eq('related_entity_type', 'signature_request')
      .eq('related_entity_id', signatureRequest.id)
      .neq('status', 'completed')

    if (relatedTasks && relatedTasks.length > 0) {
      console.log(`✅ [SIGNATURE] Found ${relatedTasks.length} task(s) to complete`)

      const { error: completeError } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('related_entity_type', 'signature_request')
        .eq('related_entity_id', signatureRequest.id)
        .neq('status', 'completed')

      if (completeError) {
        console.error('⚠️ [SIGNATURE] Failed to auto-complete tasks:', completeError)
      } else {
        console.log('✅ [SIGNATURE] Tasks auto-completed:', relatedTasks.map(t => t.title))
      }
    } else {
      console.log('ℹ️ [SIGNATURE] No pending tasks found for this signature request')
    }

    // Check if all signatures for this document/workflow are complete
    console.log('🔍 [SIGNATURE] Checking if all signatures are complete')
    await checkAndCompleteSignatures(
      signatureRequest,
      signedPdfPath,
      signedPdfBytes,
      supabase
    )

    // Release workflow lock
    if (lockAcquired && signatureRequest.workflow_run_id) {
      console.log('🔓 [SIGNATURE] Releasing workflow lock')
      await supabase
        .from('workflow_runs')
        .update({
          signing_in_progress: null,
          signing_locked_by: null,
          signing_locked_at: null
        })
        .eq('id', signatureRequest.workflow_run_id)
        .eq('signing_locked_by', signatureRequest.id)  // Only release if we own the lock
    }

    console.log('✅ [SIGNATURE] submitSignature() completed successfully\n')
    return {
      success: true,
      message: 'Signature submitted successfully',
      signed_pdf_path: signedPdfPath
    }
  } catch (error) {
    console.error('Signature submit error:', error)

    // Release workflow lock on error
    if (lockAcquired && signatureRequest?.workflow_run_id) {
      console.log('🔓 [SIGNATURE] Releasing workflow lock (error path)')
      await supabase
        .from('workflow_runs')
        .update({
          signing_in_progress: null,
          signing_locked_by: null,
          signing_locked_at: null
        })
        .eq('id', signatureRequest.workflow_run_id)
        .eq('signing_locked_by', signatureRequest.id)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Check if all signatures are complete and execute post-signature handler
 *
 * This function handles BOTH n8n-generated documents (with workflow_run_id)
 * and manually uploaded documents (with document_id)
 */
async function checkAndCompleteSignatures(
  signatureRequest: SignatureRequestRecord,
  signedPdfPath: string,
  signedPdfBytes: Uint8Array,
  supabase: SupabaseClient
): Promise<void> {
  try {
    let allSignatureRequests
    let fetchAllError
    let groupingType: 'workflow' | 'document' | 'unknown' = 'unknown'

    // Determine how to group signature requests
    if (signatureRequest.workflow_run_id) {
      // n8n-generated documents: group by workflow_run_id
      groupingType = 'workflow'
      console.log('🔍 [SIGNATURE] Grouping by workflow_run_id:', signatureRequest.workflow_run_id)

      const result = await supabase
        .from('signature_requests')
        .select('id, status, signer_role, signed_pdf_path')
        .eq('workflow_run_id', signatureRequest.workflow_run_id)
        .order('created_at', { ascending: true })

      allSignatureRequests = result.data
      fetchAllError = result.error
    } else if (signatureRequest.document_id) {
      // Manually uploaded documents: group by document_id
      groupingType = 'document'
      console.log('🔍 [SIGNATURE] Grouping by document_id:', signatureRequest.document_id)

      const result = await supabase
        .from('signature_requests')
        .select('id, status, signer_role, signed_pdf_path')
        .eq('document_id', signatureRequest.document_id)
        .order('created_at', { ascending: true })

      allSignatureRequests = result.data
      fetchAllError = result.error
    } else {
      console.error('❌ [SIGNATURE] Cannot determine signature grouping - no workflow_run_id or document_id')
      return
    }

    if (fetchAllError || !allSignatureRequests) {
      console.error('❌ [SIGNATURE] Failed to fetch all signature requests:', fetchAllError)
      return
    }

    console.log('📊 [SIGNATURE] Found signature requests:', {
      total: allSignatureRequests.length,
      signed: allSignatureRequests.filter(req => req.status === 'signed').length,
      pending: allSignatureRequests.filter(req => req.status === 'pending').length,
      grouping_type: groupingType
    })

    const allSigned = allSignatureRequests.every((req) => req.status === 'signed')

    if (!allSigned) {
      console.log('⏳ [SIGNATURE] Not all signatures complete yet - waiting for remaining signatures')
      return
    }

    // All signatures collected!
    console.log('🎉 [SIGNATURE] All signatures collected!')

    const signedPaths = allSignatureRequests
      .filter((req) => req.signed_pdf_path)
      .reduce(
        (acc, req) => {
          acc[req.signer_role] = req.signed_pdf_path
          return acc
        },
        {} as Record<string, string>
      )

    // Update workflow_runs table if this is an n8n workflow
    if (groupingType === 'workflow' && signatureRequest.workflow_run_id) {
      console.log('📝 [SIGNATURE] Marking workflow as complete')
      await supabase
        .from('workflow_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          output_data: {
            all_signed: true,
            signed_pdf_paths: signedPaths,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', signatureRequest.workflow_run_id)

      console.log('✅ [SIGNATURE] Workflow marked complete:', {
        workflow_run_id: signatureRequest.workflow_run_id,
        signed_paths: signedPaths
      })
    } else {
      console.log('ℹ️ [SIGNATURE] No workflow to mark complete (manual upload)')
    }

    // Execute post-signature handler based on document_type
    console.log('🚀 [SIGNATURE] Executing post-signature handler for document_type:', signatureRequest.document_type)
    try {
      await routeSignatureHandler({
        signatureRequest,
        signedPdfPath,
        signedPdfBytes,
        supabase
      })

      console.log('✅ [SIGNATURE] Post-signature handler completed successfully')
    } catch (handlerError) {
      console.error('❌ [SIGNATURE] Post-signature handler failed:', handlerError)
      console.error('❌ [SIGNATURE] Handler error details:', handlerError instanceof Error ? handlerError.message : 'Unknown error')
      // Don't fail the signature submission if handler fails
    }
  } catch (error) {
    console.error('❌ [SIGNATURE] Error checking signature completion:', error)
  }
}
