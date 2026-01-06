import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

/**
 * GET /api/partners/[id]/referred-investors
 *
 * Returns all investors dispatched through this partner.
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

    const { id: partnerId } = await params

    // Verify partner exists
    const { data: partner, error: partnerError } = await serviceClient
      .from('partners')
      .select('id, name')
      .eq('id', partnerId)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Fetch deal memberships where this partner is the referrer
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
      .eq('referred_by_entity_type', 'partner')
      .eq('referred_by_entity_id', partnerId)
      .order('invited_at', { ascending: false })

    if (membershipsError) {
      console.error('[Partner Referred Investors] Error:', membershipsError)
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
      partner: {
        id: partner.id,
        name: partner.name
      },
      total_count: referredInvestors.length
    })

  } catch (error) {
    console.error('[Partner Referred Investors] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
