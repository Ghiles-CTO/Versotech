import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

interface SignatureRequestBody {
  workflow_run_id: string
  investor_id: string
  signer_email: string
  signer_name: string
  document_type: 'nda' | 'subscription' | 'amendment' | 'other'
  google_drive_file_id?: string
  google_drive_url?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: SignatureRequestBody = await req.json()

    const {
      workflow_run_id,
      investor_id,
      signer_email,
      signer_name,
      document_type,
      google_drive_file_id,
      google_drive_url
    } = body

    // Validate required fields
    if (!workflow_run_id || !investor_id || !signer_email || !signer_name || !document_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Generate secure signing token (32 bytes = 64 hex characters)
    const signing_token = crypto.randomBytes(32).toString('hex')

    // Token expires in 7 days
    const token_expires_at = new Date()
    token_expires_at.setDate(token_expires_at.getDate() + 7)

    // Download PDF from Google Drive if URL provided
    let unsigned_pdf_path: string | null = null
    let unsigned_pdf_size: number | null = null

    if (google_drive_url) {
      try {
        // Download PDF from Google Drive
        const driveResponse = await fetch(google_drive_url)

        if (!driveResponse.ok) {
          console.error('Failed to download PDF from Google Drive:', driveResponse.statusText)
        } else {
          const pdfBuffer = await driveResponse.arrayBuffer()
          const uint8Array = new Uint8Array(pdfBuffer)

          // Upload to Supabase Storage
          const fileName = `${investor_id}/${signing_token}_unsigned.pdf`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(process.env.SIGNATURES_BUCKET || 'signatures')
            .upload(fileName, uint8Array, {
              contentType: 'application/pdf',
              metadata: {
                workflow_run_id,
                investor_id,
                document_type,
                google_drive_file_id: google_drive_file_id || ''
              }
            })

          if (uploadError) {
            console.error('Failed to upload unsigned PDF:', uploadError)
          } else {
            unsigned_pdf_path = uploadData.path
            unsigned_pdf_size = uint8Array.length
          }
        }
      } catch (downloadError) {
        console.error('Error downloading/uploading PDF:', downloadError)
      }
    }

    // Create signature request record
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
        status: 'pending'
      })
      .select()
      .single()

    if (insertError || !signatureRequest) {
      console.error('Failed to create signature request:', insertError)
      return NextResponse.json(
        { error: 'Failed to create signature request' },
        { status: 500 }
      )
    }

    // Generate signing URL
    const signing_url = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${signing_token}`

    // TODO: Send email with signing link using Resend
    // This will be implemented once Resend API key is configured
    console.log('📧 Signature request created:', {
      id: signatureRequest.id,
      signer_email,
      signing_url
    })

    // Mark email as sent (placeholder until Resend is configured)
    await supabase
      .from('signature_requests')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', signatureRequest.id)

    return NextResponse.json({
      success: true,
      signature_request_id: signatureRequest.id,
      signing_url,
      expires_at: token_expires_at.toISOString()
    })

  } catch (error) {
    console.error('Signature request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
