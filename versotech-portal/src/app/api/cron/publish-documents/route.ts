import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Call database function to publish scheduled documents
    const { data, error } = await supabase.rpc('publish_scheduled_documents')

    if (error) {
      console.error('Publish scheduled documents error:', error)
      return NextResponse.json(
        { error: 'Failed to publish documents', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      published: data?.length || 0,
      documents: data || []
    })

  } catch (error) {
    console.error('Cron publish error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}


