import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get deal information
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id, name, status, currency')
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Get deal term sheet for min/max ticket and target raise
    const { data: termSheet } = await supabase
      .from('deal_fee_structures')
      .select('minimum_ticket, maximum_ticket, allocation_up_to')
      .eq('deal_id', dealId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Calculate total from BOTH sources without double-counting:
    // 1. Get ALL subscriptions (formal commitments)
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id, commitment, status')
      .eq('deal_id', dealId)
      .in('status', ['pending', 'committed', 'partially_funded', 'funded', 'active'])

    const totalFromSubscriptions = subscriptions?.reduce((sum, sub) => {
      return sum + (sub.commitment || 0)
    }, 0) || 0

    // 2. Get approved submissions - include formal_subscription_id to detect converted ones
    // The relationship is: deal_subscription_submissions.formal_subscription_id -> subscriptions.id
    // If formal_subscription_id IS NOT NULL, the submission has been converted to a formal subscription
    const { data: submissions } = await supabase
      .from('deal_subscription_submissions')
      .select('id, payload_json, formal_subscription_id')
      .eq('deal_id', dealId)
      .eq('status', 'approved')

    // Filter out submissions that have been converted to subscriptions
    // A submission is converted when formal_subscription_id is set
    const unconvertedSubmissions = submissions?.filter(
      sub => !sub.formal_subscription_id
    ) || []

    const totalFromUnconvertedSubmissions = unconvertedSubmissions.reduce((sum, sub) => {
      const amount = sub.payload_json?.amount || 0
      return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0)
    }, 0)

    // Total is subscriptions PLUS unconverted submissions
    const totalSubscribed = totalFromSubscriptions + totalFromUnconvertedSubmissions

    // Count includes subscriptions plus unconverted submissions
    const subscriptionCount = subscriptions?.length || 0
    const unconvertedSubmissionCount = unconvertedSubmissions.length
    const totalCount = subscriptionCount + unconvertedSubmissionCount

    // Return capacity information
    return NextResponse.json({
      target_raise: termSheet?.allocation_up_to || null,
      min_ticket: termSheet?.minimum_ticket || null,
      max_ticket: termSheet?.maximum_ticket || null,
      total_subscribed: totalSubscribed,
      subscription_count: totalCount,
      currency: deal.currency || 'USD',
      status: deal.status,
      // Additional metrics
      remaining_capacity: termSheet?.allocation_up_to
        ? Math.max(0, termSheet.allocation_up_to - totalSubscribed)
        : null,
      subscription_percentage: termSheet?.allocation_up_to
        ? (totalSubscribed / termSheet.allocation_up_to) * 100
        : 0,
      is_oversubscribed: termSheet?.allocation_up_to
        ? totalSubscribed > termSheet.allocation_up_to
        : false,
      // Debug info (can remove in production)
      _debug: {
        from_unconverted_submissions: totalFromUnconvertedSubmissions,
        from_subscriptions: totalFromSubscriptions,
        unconverted_submission_count: unconvertedSubmissionCount,
        subscription_count: subscriptionCount,
        total_calculated: totalSubscribed
      }
    })

  } catch (error) {
    console.error('[Deal Capacity API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deal capacity information' },
      { status: 500 }
    )
  }
}
