import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { submitSignature } from '@/lib/signature/client'
import type { SubmitSignatureParams } from '@/lib/signature/types'

export async function POST(req: NextRequest) {
  try {
    const body: SubmitSignatureParams = await req.json()
    const { token, signature_data_url } = body

    if (!token || !signature_data_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get client IP address for audit trail
    const ipAddress =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'

    // Call main business logic function
    const result = await submitSignature(body, supabase, ipAddress)

    if (!result.success) {
      // Map error messages to appropriate status codes
      let statusCode = 500

      if (result.error?.includes('expired')) {
        statusCode = 410
      } else if (
        result.error?.includes('already been signed') ||
        result.error?.includes('not found')
      ) {
        statusCode = 400
      }

      return NextResponse.json({ error: result.error }, { status: statusCode })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      signed_pdf_path: result.signed_pdf_path
    })
  } catch (error) {
    console.error('Signature submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
