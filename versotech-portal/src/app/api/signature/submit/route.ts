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

    // Download unsigned PDF
    let pdfBytes: Uint8Array

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

    // Load PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes)

    // Convert base64 signature to PNG image
    const signatureImageBytes = Uint8Array.from(
      atob(signature_data_url.split(',')[1]),
      c => c.charCodeAt(0)
    )

    // Embed signature image
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

    // Get last page (typically signature page)
    const pages = pdfDoc.getPages()
    const lastPage = pages[pages.length - 1]
    const { width, height } = lastPage.getSize()

    // Signature dimensions and position
    const signatureWidth = 200
    const signatureHeight = 80
    const signatureX = 100 // Left margin
    const signatureY = 150 // Bottom margin

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
      size: 8,
      color: rgb(0.3, 0.3, 0.3)
    })

    lastPage.drawText(`Signer: ${signatureRequest.signer_name}`, {
      x: signatureX,
      y: signatureY - 30,
      size: 8,
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

    // Update signature request record
    const { error: updateError } = await supabase
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

    if (updateError) {
      console.error('Failed to update signature request:', updateError)
      return NextResponse.json(
        { error: 'Failed to update signature status' },
        { status: 500 }
      )
    }

    // TODO: Send email with signed PDF using Resend
    // This will be implemented once Resend API key is configured
    console.log('✅ Document signed successfully:', {
      id: signatureRequest.id,
      signer_email: signatureRequest.signer_email,
      signed_pdf_path: uploadData.path
    })

    // Update workflow_runs status if applicable
    if (signatureRequest.workflow_run_id) {
      await supabase
        .from('workflow_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          output_data: {
            signed_pdf_path: uploadData.path,
            signed_at: new Date().toISOString()
          }
        })
        .eq('id', signatureRequest.workflow_run_id)
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
