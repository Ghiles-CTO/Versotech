import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
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

    // Get current authenticated user (if any) for signer verification
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    const currentUserId = user?.id || null

    const supabase = createServiceClient()

    // Get client IP address for audit trail
    const ipAddress =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'

    // Call main business logic function with current user for verification
    const result = await submitSignature(body, supabase, ipAddress, currentUserId)

    if (!result.success) {
      // Map error messages to appropriate status codes
      let statusCode = 500

      if (result.error?.includes('expired')) {
        statusCode = 410 // Gone
      } else if (result.error?.includes('not authorized') || result.error?.includes('assigned to another user')) {
        statusCode = 403 // Forbidden
      } else if (result.error?.includes('Please log in')) {
        statusCode = 401 // Unauthorized
      } else if (result.error?.includes('verification required')) {
        statusCode = 428 // Precondition Required (verification needed)
      } else if (
        result.error?.includes('already been signed') ||
        result.error?.includes('not found')
      ) {
        statusCode = 400 // Bad Request
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
