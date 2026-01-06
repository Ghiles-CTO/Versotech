import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

/**
 * GET /api/introducers/[id]/referred-investors
 *
 * Returns all investors dispatched through this introducer.
 * Includes deal info, fee plan info, and subscription status.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const serviceClient = createServiceClient()
    const isStaff = await isStaffUser(serviceClient, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id: introducerId } = await params

    // Verify introducer exists
    const { data: introducer, error: introducerError } = await serviceClient
      .from('introducers')
      .select('id, legal_name')
      .eq('id', introducerId)
      .single()

    if (introducerError || !introducer) {
      return NextResponse.json({ error: 'Introducer not found' }, { status: 404 })
    }

    // Fetch deal memberships where this introducer is the referrer
    // We need to join with fee_plans to get the introducer link
    const { data: memberships, error: membershipsError } = await serviceClient
      .from('deal_memberships')
      .select(`
        id,
        deal_id,
        user_id,
        investor_id,
        role,
        invited_at,
        accepted_at,
        referred_by_entity_id,
        referred_by_entity_type,
        assigned_fee_plan_id,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        investors:investor_id (
          id,
          legal_name,
          type
        ),
        deal:deal_id (
          id,
          name,
          status
        ),
        fee_plan:assigned_fee_plan_id (
          id,
          name,
          status
        )
      `)
      .eq('referred_by_entity_type', 'introducer')
      .eq('referred_by_entity_id', introducerId)
      .order('invited_at', { ascending: false })

    if (membershipsError) {
      console.error('[Introducer Referred Investors] Error:', membershipsError)
      return NextResponse.json(
        { error: 'Failed to fetch referred investors' },
        { status: 500 }
      )
    }

    // Get subscription info for these memberships (if available)
    const memberDealPairs = (memberships || [])
      .filter(m => m.investor_id && m.deal_id)
      .map(m => ({ investor_id: m.investor_id, deal_id: m.deal_id }))

    let subscriptionsMap: Record<string, { status: string; amount: number | null; funded_at: string | null }> = {}

    if (memberDealPairs.length > 0) {
      // Fetch subscriptions for these investor/deal pairs
      const { data: subscriptions } = await serviceClient
        .from('subscriptions')
        .select('investor_id, deal_id, status, total_amount, funded_date')

      if (subscriptions) {
        subscriptionsMap = subscriptions.reduce((acc, sub) => {
          const key = `${sub.investor_id}-${sub.deal_id}`
          acc[key] = {
            status: sub.status,
            amount: sub.total_amount,
            funded_at: sub.funded_date
          }
          return acc
        }, {} as Record<string, { status: string; amount: number | null; funded_at: string | null }>)
      }
    }

    // Enrich memberships with subscription data
    const referredInvestors = (memberships || []).map(m => {
      const subscriptionKey = `${m.investor_id}-${m.deal_id}`
      const subscription = subscriptionsMap[subscriptionKey]

      return {
        id: m.id,
        investor_id: m.investor_id,
        user_id: m.user_id,
        role: m.role,
        invited_at: m.invited_at,
        accepted_at: m.accepted_at,
        profile: m.profiles,
        investor: m.investors,
        deal: m.deal,
        fee_plan: m.fee_plan,
        subscription: subscription || null
      }
    })

    return NextResponse.json({
      referred_investors: referredInvestors,
      introducer: {
        id: introducer.id,
        name: introducer.legal_name
      },
      total_count: referredInvestors.length
    })

  } catch (error) {
    console.error('[Introducer Referred Investors] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
