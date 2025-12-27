import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type ReferralRow = {
  deal_id: string | null
  investor_id: string | null
  role: string | null
  dispatched_at: string | null
  interest_confirmed_at: string | null
  created_at: string | null
  deal: { id: string; name: string; status: string } | { id: string; name: string; status: string }[] | null
  investor: { id: string; legal_name: string | null; display_name: string | null } | { id: string; legal_name: string | null; display_name: string | null }[] | null
}

function normalizeJoin<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] || null : value
}

/**
 * GET /api/partners/me/dashboard
 * Returns partner dashboard metrics and recent referral activity.
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: partnerUser, error: partnerUserError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (partnerUserError) {
      console.error('[partner-dashboard] Partner lookup error:', partnerUserError)
      return NextResponse.json({ error: 'Failed to load partner profile' }, { status: 500 })
    }

    if (!partnerUser?.partner_id) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 })
    }

    const partnerId = partnerUser.partner_id

    const { data: ownMemberships, error: ownMembershipsError } = await serviceSupabase
      .from('deal_memberships')
      .select('deal_id, role, dispatched_at')
      .eq('user_id', user.id)
      .not('dispatched_at', 'is', null)

    if (ownMembershipsError) {
      console.error('[partner-dashboard] Membership lookup error:', ownMembershipsError)
      return NextResponse.json({ error: 'Failed to load deal memberships' }, { status: 500 })
    }

    const trackedDeals = (ownMemberships || []).filter(m => m.role === 'partner').length
    const investableDeals = (ownMemberships || []).filter(m => m.role === 'partner_investor').length
    const ownDealIds = Array.from(new Set((ownMemberships || []).map(m => m.deal_id).filter(Boolean)))

    const { data: referralMemberships, error: referralError } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        deal_id,
        investor_id,
        role,
        dispatched_at,
        interest_confirmed_at,
        created_at,
        deal:deal_id (
          id,
          name,
          status
        ),
        investor:investor_id (
          id,
          legal_name,
          display_name
        )
      `)
      .eq('referred_by_entity_type', 'partner')
      .eq('referred_by_entity_id', partnerId)
      .order('dispatched_at', { ascending: false })

    if (referralError) {
      console.error('[partner-dashboard] Referral lookup error:', referralError)
      return NextResponse.json({ error: 'Failed to load referrals' }, { status: 500 })
    }

    const referrals = (referralMemberships || []) as ReferralRow[]
    const referralPairs = referrals
      .filter(r => r.investor_id && r.deal_id)
      .map(r => `${r.investor_id}:${r.deal_id}`)
    const referralPairSet = new Set(referralPairs)

    const investorIds = Array.from(new Set(referrals.map(r => r.investor_id).filter(Boolean)))
    const referralDealIds = Array.from(new Set(referrals.map(r => r.deal_id).filter(Boolean)))

    let matchedSubscriptions: {
      investor_id: string
      deal_id: string
      commitment: number | null
      status: string | null
      signed_at: string | null
      currency: string | null
    }[] = []

    if (investorIds.length > 0 && referralDealIds.length > 0) {
      const { data: subs, error: subsError } = await serviceSupabase
        .from('subscriptions')
        .select('investor_id, deal_id, commitment, status, signed_at, currency')
        .in('investor_id', investorIds)
        .in('deal_id', referralDealIds)

      if (subsError) {
        console.error('[partner-dashboard] Subscription lookup error:', subsError)
        return NextResponse.json({ error: 'Failed to load subscription data' }, { status: 500 })
      }

      matchedSubscriptions = (subs || []).filter(
        sub => referralPairSet.has(`${sub.investor_id}:${sub.deal_id}`)
      )
    }

    const subscriptionMap = new Map(
      matchedSubscriptions.map(sub => [`${sub.investor_id}:${sub.deal_id}`, sub])
    )

    const subscribedStatuses = new Set(['committed', 'active'])
    const pendingStatuses = new Set(['pending'])

    let totalCommitment = 0
    let subscribedInvestors = 0
    let pipelineInvestors = 0

    for (const referral of referrals) {
      if (!referral.investor_id || !referral.deal_id) continue
      const subscription = subscriptionMap.get(`${referral.investor_id}:${referral.deal_id}`)
      const status = subscription?.status || null

      if (status && subscribedStatuses.has(status)) {
        subscribedInvestors += 1
        totalCommitment += Number(subscription?.commitment || 0)
        continue
      }

      if ((status && pendingStatuses.has(status)) || (!status && referral.interest_confirmed_at)) {
        pipelineInvestors += 1
      }
    }

    const commitmentCurrency = matchedSubscriptions.find(sub => sub.currency)?.currency || 'USD'

    let pendingCommissions = 0
    let pendingCommissionCurrency = 'USD'

    let feePlanQuery = serviceSupabase
      .from('fee_plans')
      .select('id')

    const feePlanDealIds = Array.from(new Set([...ownDealIds, ...referralDealIds]))

    if (feePlanDealIds.length > 0) {
      feePlanQuery = feePlanQuery.or(`partner_id.eq.${partnerId},deal_id.in.(${feePlanDealIds.join(',')})`)
    } else {
      feePlanQuery = feePlanQuery.eq('partner_id', partnerId)
    }

    const { data: feePlans, error: feePlansError } = await feePlanQuery

    if (feePlansError) {
      console.error('[partner-dashboard] Fee plan lookup error:', feePlansError)
      return NextResponse.json({ error: 'Failed to load fee plans' }, { status: 500 })
    }

    const feePlanIds = (feePlans || []).map(plan => plan.id)

    if (feePlanIds.length > 0) {
      const { data: feeComponents, error: feeComponentsError } = await serviceSupabase
        .from('fee_components')
        .select('id, fee_plan_id')
        .in('fee_plan_id', feePlanIds)

      if (feeComponentsError) {
        console.error('[partner-dashboard] Fee components lookup error:', feeComponentsError)
        return NextResponse.json({ error: 'Failed to load fee components' }, { status: 500 })
      }

      const componentIds = (feeComponents || []).map(component => component.id)

      if (componentIds.length > 0) {
        const { data: feeEvents, error: feeEventsError } = await serviceSupabase
          .from('fee_events')
          .select('computed_amount, status, currency')
          .in('fee_component_id', componentIds)
          .in('status', ['accrued', 'invoiced'])

        if (feeEventsError) {
          console.error('[partner-dashboard] Fee events lookup error:', feeEventsError)
          return NextResponse.json({ error: 'Failed to load fee events' }, { status: 500 })
        }

        pendingCommissions = (feeEvents || []).reduce(
          (sum, event) => sum + Number(event.computed_amount || 0),
          0
        )
        pendingCommissionCurrency = feeEvents?.[0]?.currency || pendingCommissionCurrency
      }
    }

    const recentReferrals = referrals.slice(0, 10).map(referral => {
      const deal = normalizeJoin(referral.deal)
      const investor = normalizeJoin(referral.investor)
      const subscription = referral.investor_id && referral.deal_id
        ? subscriptionMap.get(`${referral.investor_id}:${referral.deal_id}`) || null
        : null

      return {
        deal_id: referral.deal_id,
        deal_name: deal?.name || null,
        deal_status: deal?.status || null,
        investor_id: referral.investor_id,
        investor_name: investor?.display_name || investor?.legal_name || null,
        dispatched_at: referral.dispatched_at,
        interest_confirmed_at: referral.interest_confirmed_at,
        subscription: subscription ? {
          commitment: subscription.commitment,
          status: subscription.status,
          signed_at: subscription.signed_at
        } : null
      }
    })

    // Calculate performance metrics
    const conversionRate = referrals.length > 0
      ? Math.round((subscribedInvestors / referrals.length) * 100)
      : 0

    // Calculate this month vs last month comparison
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthReferrals = referrals.filter(r =>
      r.created_at && new Date(r.created_at) >= startOfThisMonth
    ).length

    const lastMonthReferrals = referrals.filter(r =>
      r.created_at &&
      new Date(r.created_at) >= startOfLastMonth &&
      new Date(r.created_at) < startOfThisMonth
    ).length

    const referralGrowth = lastMonthReferrals > 0
      ? Math.round(((thisMonthReferrals - lastMonthReferrals) / lastMonthReferrals) * 100)
      : thisMonthReferrals > 0 ? 100 : 0

    // Calculate paid vs pending commissions
    let paidCommissions = 0
    if (feePlanIds.length > 0) {
      const { data: paidEvents } = await serviceSupabase
        .from('fee_events')
        .select('computed_amount')
        .in('fee_component_id', (await serviceSupabase
          .from('fee_components')
          .select('id')
          .in('fee_plan_id', feePlanIds)
        ).data?.map(c => c.id) || [])
        .eq('status', 'paid')

      paidCommissions = (paidEvents || []).reduce(
        (sum, event) => sum + Number(event.computed_amount || 0), 0
      )
    }

    // Average commitment per investor
    const avgCommitmentPerInvestor = subscribedInvestors > 0
      ? Math.round(totalCommitment / subscribedInvestors)
      : 0

    return NextResponse.json({
      metrics: {
        totalReferredInvestors: referrals.length,
        subscribedInvestors,
        pipelineInvestors,
        totalCommitment,
        commitmentCurrency,
        pendingCommissions,
        pendingCommissionCurrency,
        trackedDeals,
        investableDeals
      },
      performance: {
        conversionRate,
        thisMonthReferrals,
        lastMonthReferrals,
        referralGrowth,
        paidCommissions,
        avgCommitmentPerInvestor,
        avgCommitmentCurrency: commitmentCurrency
      },
      recent_referrals: recentReferrals
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/partners/me/dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
