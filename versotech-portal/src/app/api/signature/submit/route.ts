import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { PDFDocument, rgb } from 'pdf-lib'

interface SignatureSubmitBody {
  token: string
  signature_data_url: string // Base64 encoded signature image
}

export async function POST(req: NextRequest) {
  try {
    const body: SignatureSubmitBody = await req.json()
    const { token, signature_data_url } = body

    if (!token || !signature_data_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Fetch signature request
    const { data: signatureRequest, error: fetchError } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('signing_token', token)
      .single()

    if (fetchError || !signatureRequest) {
      return NextResponse.json(
        { error: 'Signature request not found' },
        { status: 404 }
      )
    }

    // Validate token not expired
    const now = new Date()
    const expiresAt = new Date(signatureRequest.token_expires_at)

    if (now > expiresAt) {
      await supabase
        .from('signature_requests')
        .update({ status: 'expired' })
        .eq('id', signatureRequest.id)

      return NextResponse.json(
        { error: 'Signature token has expired' },
        { status: 410 }
      )
    }

    // Validate not already signed
    if (signatureRequest.status === 'signed') {
      return NextResponse.json(
        { error: 'Document has already been signed' },
        { status: 400 }
      )
    }

    // Get client IP address for audit trail
    const ip_address = req.headers.get('x-forwarded-for') ||
                       req.headers.get('x-real-ip') ||
                       'unknown'

    // Check if another signer has already signed (progressive signing)
    let pdfBytes: Uint8Array
    let basePdfPath: string | null = null

    if (signatureRequest.workflow_run_id) {
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
        basePdfPath = firstSigned.signed_pdf_path

        console.log('🔄 Progressive signing: Loading already-signed PDF from', firstSigned.signer_role)

        if (basePdfPath) {
          const { data: pdfData, error: downloadError } = await supabase.storage
            .from(process.env.SIGNATURES_BUCKET || 'signatures')
            .download(basePdfPath)

          if (downloadError || !pdfData) {
            console.error('Failed to download first signed PDF:', downloadError)
            return NextResponse.json(
              { error: 'Failed to retrieve first signed PDF' },
              { status: 500 }
            )
          }

          pdfBytes = new Uint8Array(await pdfData.arrayBuffer())
        }
      }
    }

    // If no other signature exists, download unsigned PDF
    if (!pdfBytes) {
      console.log('📄 First signature: Loading unsigned PDF')

      if (signatureRequest.unsigned_pdf_path) {
        // Download from Supabase Storage
        const { data: pdfData, error: downloadError } = await supabase.storage
          .from(process.env.SIGNATURES_BUCKET || 'signatures')
          .download(signatureRequest.unsigned_pdf_path)

        if (downloadError || !pdfData) {
          console.error('Failed to download unsigned PDF:', downloadError)
          return NextResponse.json(
            { error: 'Failed to retrieve unsigned PDF' },
            { status: 500 }
          )
        }

        pdfBytes = new Uint8Array(await pdfData.arrayBuffer())
      } else if (signatureRequest.google_drive_url) {
        // Download from Google Drive
        const driveResponse = await fetch(signatureRequest.google_drive_url)

        if (!driveResponse.ok) {
          console.error('Failed to download PDF from Google Drive')
          return NextResponse.json(
            { error: 'Failed to retrieve PDF from Google Drive' },
            { status: 500 }
          )
        }

        pdfBytes = new Uint8Array(await driveResponse.arrayBuffer())
      } else {
        return NextResponse.json(
          { error: 'No PDF source available' },
          { status: 500 }
        )
      }
    }

    // Load PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes)

    // Convert base64 signature to PNG image (Node.js Buffer API)
    const base64Data = signature_data_url.split(',')[1]
    const signatureImageBytes = Buffer.from(base64Data, 'base64')

    // Embed signature image
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

    // Get last page (typically signature page)
    const pages = pdfDoc.getPages()
    const lastPage = pages[pages.length - 1]
    const { width, height } = lastPage.getSize()

    // Signature dimensions and position
    const signatureWidth = 180
    const signatureHeight = 70

    // Calculate Y position for signature table (180pt high, ~50pt from bottom)
    // Standard PDF: 792pt tall, signature space: 50-230pt from bottom
    // Center signatures vertically in signature space
    const signatureTableBottom = 50
    const signatureTableHeight = 180
    const signatureY = signatureTableBottom + (signatureTableHeight / 2) - (signatureHeight / 2) // ~105pt

    // Calculate X position based on signature_position (two-column table)
    // PARTY A (left column): centered at 25% of page width
    // PARTY B (right column): centered at 75% of page width
    const signatureX = signatureRequest.signature_position === 'party_a'
      ? (width * 0.25) - (signatureWidth / 2)
      : (width * 0.75) - (signatureWidth / 2)

    // Draw signature on last page
    lastPage.drawImage(signatureImage, {
      x: signatureX,
      y: signatureY,
      width: signatureWidth,
      height: signatureHeight
    })

    // Add signature timestamp text below signature
    const signatureDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    lastPage.drawText(`Signed: ${signatureDate}`, {
      x: signatureX,
      y: signatureY - 15,
      size: 7,
      color: rgb(0.3, 0.3, 0.3)
    })

    lastPage.drawText(`Signer: ${signatureRequest.signer_name}`, {
      x: signatureX,
      y: signatureY - 27,
      size: 7,
      color: rgb(0.3, 0.3, 0.3)
    })

    // Save modified PDF
    const signedPdfBytes = await pdfDoc.save()

    // Upload signed PDF to Supabase Storage
    const signedFileName = `${signatureRequest.investor_id}/${token}_signed.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(process.env.SIGNATURES_BUCKET || 'signatures')
      .upload(signedFileName, signedPdfBytes, {
        contentType: 'application/pdf',
        metadata: {
          workflow_run_id: signatureRequest.workflow_run_id || '',
          investor_id: signatureRequest.investor_id,
          document_type: signatureRequest.document_type,
          signed_at: new Date().toISOString(),
          signer_name: signatureRequest.signer_name,
          signer_email: signatureRequest.signer_email
        }
      })

    if (uploadError) {
      console.error('Failed to upload signed PDF:', uploadError)
      return NextResponse.json(
        { error: 'Failed to save signed PDF' },
        { status: 500 }
      )
    }

    // Update signature request record with optimistic locking
    // Use status check to prevent race condition: only update if still 'pending'
    const { error: updateError, count } = await supabase
      .from('signature_requests')
      .update({
        status: 'signed',
        signature_data_url,
        signature_timestamp: new Date().toISOString(),
        signature_ip_address: ip_address,
        signed_pdf_path: uploadData.path,
        signed_pdf_size: signedPdfBytes.length
      })
      .eq('id', signatureRequest.id)
      .eq('status', 'pending')  // Only update if still pending (optimistic lock)
      .select('id', { count: 'exact' })

    if (updateError) {
      console.error('Failed to update signature request:', updateError)
      return NextResponse.json(
        { error: 'Failed to update signature status' },
        { status: 500 }
      )
    }

    // Check if update succeeded (race condition detection)
    if (count === 0) {
      console.error('❌ Race condition: Signature request was already signed')
      return NextResponse.json(
        { error: 'This document has already been signed' },
        { status: 409 }
      )
    }

    // TODO: Send email with signed PDF using Resend
    // This will be implemented once Resend API key is configured
    console.log('✅ Document signed successfully:', {
      id: signatureRequest.id,
      signer_email: signatureRequest.signer_email,
      signer_role: signatureRequest.signer_role,
      signed_pdf_path: uploadData.path
    })

    // Check if all signatures for this workflow are complete
    if (signatureRequest.workflow_run_id) {
      // Get all signature requests for this workflow
      const { data: allSignatureRequests, error: fetchAllError } = await supabase
        .from('signature_requests')
        .select('id, status, signer_role, signed_pdf_path')
        .eq('workflow_run_id', signatureRequest.workflow_run_id)

      if (!fetchAllError && allSignatureRequests) {
        const allSigned = allSignatureRequests.every(req => req.status === 'signed')

        if (allSigned) {
          // All signatures collected - mark workflow complete
          const signedPaths = allSignatureRequests
            .filter(req => req.signed_pdf_path)
            .reduce((acc, req) => {
              acc[req.signer_role] = req.signed_pdf_path
              return acc
            }, {} as Record<string, string>)

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

          // Store fully-signed NDA in documents table
          try {
            // Get workflow_run data to find deal_id and investor_id
            const { data: workflowRun } = await supabase
              .from('workflow_runs')
              .select('entity_id, entity_type, input_params')
              .eq('id', signatureRequest.workflow_run_id)
              .single()

            if (workflowRun && workflowRun.entity_type === 'deal_interest_nda') {
              // Get deal interest to find deal_id and investor_id
              const { data: dealInterest } = await supabase
                .from('investor_deal_interest')
                .select('deal_id, investor_id')
                .eq('id', workflowRun.entity_id)
                .single()

              if (dealInterest) {
                // Copy fully-signed PDF to documents bucket for portal access
                const { data: signaturesPdfData } = await supabase.storage
                  .from(process.env.SIGNATURES_BUCKET || 'signatures')
                  .download(uploadData.path)

                if (!signaturesPdfData) {
                  throw new Error('Failed to download signed PDF for copying')
                }

                // Generate document storage path
                const timestamp = Date.now()
                const documentFileName = `ndas/${dealInterest.deal_id}/${dealInterest.investor_id}_nda_${timestamp}.pdf`

                // Upload to documents bucket
                const { data: docUploadData, error: docUploadError } = await supabase.storage
                  .from(process.env.STORAGE_BUCKET_NAME || 'documents')
                  .upload(documentFileName, signaturesPdfData, {
                    contentType: 'application/pdf',
                    upsert: false
                  })

                if (docUploadError) {
                  console.error('Failed to copy PDF to documents bucket:', docUploadError)
                  throw docUploadError
                }

                console.log('📦 Copied signed PDF to documents bucket:', docUploadData.path)

                // Create document record pointing to documents bucket
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
                  console.error('Failed to create document record:', docError)
                } else {
                  console.log('📄 Fully-signed NDA stored in documents:', {
                    document_id: document.id,
                    deal_id: dealInterest.deal_id,
                    investor_id: dealInterest.investor_id
                  })

                  // 🔑 AUTOMATIC DATA ROOM ACCESS GRANT
                  // Now that NDA is fully executed, grant investor access to deal's data room
                  try {
                    // Get deal's close date for access expiry
                    const { data: deal } = await supabase
                      .from('deals')
                      .select('close_at, name')
                      .eq('id', dealInterest.deal_id)
                      .single()

                    // Check if access already exists
                    const { data: existingAccess } = await supabase
                      .from('deal_data_room_access')
                      .select('id, revoked_at')
                      .eq('deal_id', dealInterest.deal_id)
                      .eq('investor_id', dealInterest.investor_id)
                      .single()

                    if (existingAccess && !existingAccess.revoked_at) {
                      console.log('ℹ️ Data room access already exists for this investor')
                    } else {
                      // Grant new access
                      const { data: newAccess, error: accessError } = await supabase
                        .from('deal_data_room_access')
                        .insert({
                          deal_id: dealInterest.deal_id,
                          investor_id: dealInterest.investor_id,
                          granted_at: new Date().toISOString(),
                          expires_at: deal?.close_at || null,
                          auto_granted: true,
                          notes: `Automatically granted upon NDA execution for ${deal?.name || 'deal'}`
                        })
                        .select()
                        .single()

                      if (accessError) {
                        console.error('❌ Failed to grant data room access:', accessError)
                      } else {
                        console.log('✅ Data room access automatically granted:', {
                          access_id: newAccess.id,
                          deal_id: dealInterest.deal_id,
                          investor_id: dealInterest.investor_id,
                          expires_at: deal?.close_at
                        })

                        // Create audit log entry
                        await supabase
                          .from('audit_logs')
                          .insert({
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
                      }
                    }
                  } catch (accessError) {
                    console.error('❌ Error granting automatic data room access:', accessError)
                    // Don't fail the signature submission if access grant fails
                  }
                }
              }
            }
          } catch (docStoreError) {
            console.error('Error storing signed NDA in documents:', docStoreError)
            // Don't fail the signature submission if document storage fails
          }
        } else {
          console.log('⏳ Waiting for additional signatures:', {
            workflow_run_id: signatureRequest.workflow_run_id,
            signed: allSignatureRequests.filter(r => r.status === 'signed').length,
            total: allSignatureRequests.length
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Document signed successfully',
      signed_pdf_path: uploadData.path
    })

  } catch (error) {
    console.error('Signature submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
