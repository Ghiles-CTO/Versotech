import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface RouteParams {
  params: {
    token: string
  }
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Fetch signature request by token
    const { data: signatureRequest, error } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('signing_token', token)
      .single()

    if (error || !signatureRequest) {
      return NextResponse.json(
        { error: 'Signature request not found' },
        { status: 404 }
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(signatureRequest.token_expires_at)

    if (now > expiresAt) {
      // Update status to expired
      await supabase
        .from('signature_requests')
        .update({ status: 'expired' })
        .eq('id', signatureRequest.id)

      return NextResponse.json(
        { error: 'Signature token has expired' },
        { status: 410 }
      )
    }

    // Check if already signed
    if (signatureRequest.status === 'signed') {
      return NextResponse.json(
        { error: 'Document has already been signed' },
        { status: 400 }
      )
    }

    // Check if cancelled
    if (signatureRequest.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Signature request has been cancelled' },
        { status: 400 }
      )
    }

    // Get unsigned PDF URL if it exists
    let unsigned_pdf_url: string | null = null

    if (signatureRequest.unsigned_pdf_path) {
      const { data: urlData } = await supabase.storage
        .from(process.env.SIGNATURES_BUCKET || 'signatures')
        .createSignedUrl(signatureRequest.unsigned_pdf_path, 3600) // 1 hour expiry

      unsigned_pdf_url = urlData?.signedUrl || null
    }

    // Return signature request details (excluding sensitive fields)
    return NextResponse.json({
      id: signatureRequest.id,
      signer_name: signatureRequest.signer_name,
      signer_email: signatureRequest.signer_email,
      document_type: signatureRequest.document_type,
      unsigned_pdf_url,
      google_drive_url: signatureRequest.google_drive_url,
      status: signatureRequest.status,
      expires_at: signatureRequest.token_expires_at
    })

  } catch (error) {
    console.error('Error fetching signature request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
