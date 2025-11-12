import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSignatureRequest } from '@/lib/signature/client'

interface RouteParams {
  params: Promise<{
    token: string
  }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Call main business logic function
    const signatureRequest = await getSignatureRequest(token, supabase)

    if (!signatureRequest) {
      return NextResponse.json(
        { error: 'Signature request not found or invalid' },
        { status: 404 }
      )
    }

    return NextResponse.json(signatureRequest)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error'

    // Map error messages to appropriate status codes
    let statusCode = 500

    if (errorMessage.includes('expired')) {
      statusCode = 410
    } else if (
      errorMessage.includes('already been signed') ||
      errorMessage.includes('cancelled')
    ) {
      statusCode = 400
    } else if (errorMessage.includes('not found')) {
      statusCode = 404
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
