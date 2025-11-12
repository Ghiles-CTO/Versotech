import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createSignatureRequest } from '@/lib/signature/client'
import type { CreateSignatureRequestParams } from '@/lib/signature/types'

export async function POST(req: NextRequest) {
  try {
    const body: CreateSignatureRequestParams = await req.json()
    const supabase = createServiceClient()

    // Call main business logic function
    const result = await createSignatureRequest(body, supabase)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Missing required fields' ? 400 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      signature_request_id: result.signature_request_id,
      signing_url: result.signing_url,
      expires_at: result.expires_at
    })
  } catch (error) {
    console.error('Signature request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
