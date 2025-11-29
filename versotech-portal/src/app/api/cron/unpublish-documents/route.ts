import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function handleCronRequest(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {

    const supabase = createServiceClient()

    // Call database function to unpublish expired documents
    const { data, error } = await supabase.rpc('unpublish_expired_documents')

    if (error) {
      console.error('Unpublish expired documents error:', error)
      return NextResponse.json(
        { error: 'Failed to unpublish documents', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      unpublished: data?.length || 0,
      documents: data || []
    })

  } catch (error) {
    console.error('Cron unpublish error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Vercel cron uses GET requests
export async function GET(request: NextRequest) {
  return handleCronRequest(request)
}

export async function POST(request: NextRequest) {
  return handleCronRequest(request)
}


