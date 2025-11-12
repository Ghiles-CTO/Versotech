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
  generateSigningUrl
} from './token'
import { SignatureStorageManager, downloadPDFFromUrl } from './storage'
import { embedSignatureInPDF } from './pdf-processor'
import { routeSignatureHandler } from './handlers'
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
    if (
      !workflow_run_id ||
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
            workflow_run_id,
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
    const { data: signatureRequest, error: insertError } = await supabase
      .from('signature_requests')
      .insert({
        workflow_run_id,
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
      })
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

    // TODO: Send email with signing link using Resend
    console.log('📧 [SIGNATURE] Email notification (TODO - not implemented yet)')

    // Mark email as sent (placeholder until email service is configured)
    await supabase
      .from('signature_requests')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', signatureRequest.id)

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
    const { data: signatureRequest, error: fetchError } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('signing_token', token)
      .single()

    if (fetchError || !signatureRequest) {
      console.log('❌ [SIGNATURE] Signature request not found:', fetchError)
      return {
        success: false,
        error: 'Signature request not found'
      }
    }

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
      return {
        success: false,
        error: 'Failed to update signature status'
      }
    }

    // Check if update succeeded (race condition detection)
    if (count === 0) {
      console.error('❌ [SIGNATURE] Race condition: Signature request was already signed')
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

    // Check if all signatures for this workflow are complete
    if (signatureRequest.workflow_run_id) {
      console.log('🔍 [SIGNATURE] Checking if workflow is complete')
      await checkAndCompleteWorkflow(
        signatureRequest,
        signedPdfPath,
        signedPdfBytes,
        supabase
      )
    } else {
      console.log('ℹ️ [SIGNATURE] No workflow_run_id - skipping workflow completion check')
    }

    console.log('✅ [SIGNATURE] submitSignature() completed successfully\n')
    return {
      success: true,
      message: 'Signature submitted successfully',
      signed_pdf_path: signedPdfPath
    }
  } catch (error) {
    console.error('Signature submit error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Check if all signatures are complete and execute post-signature handler
 */
async function checkAndCompleteWorkflow(
  signatureRequest: SignatureRequestRecord,
  signedPdfPath: string,
  signedPdfBytes: Uint8Array,
  supabase: SupabaseClient
): Promise<void> {
  try {
    // Get all signature requests for this workflow
    const { data: allSignatureRequests, error: fetchAllError } = await supabase
      .from('signature_requests')
      .select('id, status, signer_role, signed_pdf_path')
      .eq('workflow_run_id', signatureRequest.workflow_run_id)

    if (fetchAllError || !allSignatureRequests) {
      console.error('Failed to fetch all signature requests:', fetchAllError)
      return
    }

    const allSigned = allSignatureRequests.every((req) => req.status === 'signed')

    if (allSigned) {
      // All signatures collected - mark workflow complete
      const signedPaths = allSignatureRequests
        .filter((req) => req.signed_pdf_path)
        .reduce(
          (acc, req) => {
            acc[req.signer_role] = req.signed_pdf_path
            return acc
          },
          {} as Record<string, string>
        )

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

      console.log('✅ All signatures collected - workflow marked complete:', {
        workflow_run_id: signatureRequest.workflow_run_id,
        signed_paths: signedPaths
      })

      // Execute post-signature handler based on document_type
      try {
        await routeSignatureHandler({
          signatureRequest,
          signedPdfPath,
          signedPdfBytes,
          supabase
        })

        console.log('✅ Post-signature handler completed successfully')
      } catch (handlerError) {
        console.error('❌ Post-signature handler failed:', handlerError)
        // Don't fail the signature submission if handler fails
      }
    }
  } catch (error) {
    console.error('Error checking workflow completion:', error)
  }
}
