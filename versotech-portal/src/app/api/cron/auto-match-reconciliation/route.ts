import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Cron job to automatically run reconciliation matching algorithm
 * Runs every 6 hours to find matches for unmatched bank transactions
 * Schedule: 0 (star-slash)6 (star) (star) (star) (every 6 hours)
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  try {
    // Get count of unmatched transactions before matching
    const { count: unmatchedBefore } = await supabase
      .from('bank_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'unmatched')

    // Run the auto-matching algorithm
    const { data: matches, error: matchError } = await supabase.rpc('run_auto_match')

    if (matchError) {
      console.error('Auto-match error:', matchError)
      return NextResponse.json(
        { error: 'Failed to run auto-match', details: matchError },
        { status: 500 }
      )
    }

    // Get count of unmatched transactions after matching
    const { count: unmatchedAfter } = await supabase
      .from('bank_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'unmatched')

    const matchesFound = matches?.length || 0
    const unmatchedReduced = (unmatchedBefore || 0) - (unmatchedAfter || 0)

    return NextResponse.json({
      success: true,
      message: `Auto-match completed`,
      matchesFound,
      unmatchedBefore: unmatchedBefore || 0,
      unmatchedAfter: unmatchedAfter || 0,
      unmatchedReduced,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Unexpected error in auto-match cron job:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
