import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

interface FunnelStage {
  stage: string
  count: number
  pctOfTotal: number
  pctOfPrevious: number
}

interface BiggestDropoff {
  fromStage: string
  toStage: string
  dropRate: number
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check if user is super admin
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'super_admin')
      .single()

    if (!permission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ===== INVESTMENT FUNNEL =====
    // Stages: Viewed Deal -> Showed Interest -> Started Subscription -> Completed Subscription -> Allocated

    // 1. Viewed Deal: Count unique investors who have viewed any deal
    const { count: viewedDealCount } = await supabase
      .from('deal_memberships')
      .select('investor_id', { count: 'exact', head: true })
      .not('viewed_at', 'is', null)
      .not('investor_id', 'is', null)

    // 2. Showed Interest: Count unique investors who confirmed interest
    const { count: showedInterestCount } = await supabase
      .from('deal_memberships')
      .select('investor_id', { count: 'exact', head: true })
      .not('interest_confirmed_at', 'is', null)
      .not('investor_id', 'is', null)

    // Also check investor_deal_interest table for additional interest signals
    const { data: interestSignals } = await supabase
      .from('investor_deal_interest')
      .select('investor_id')
      .not('investor_id', 'is', null)

    // Get unique investors from memberships who showed interest
    const { data: membershipInterests } = await supabase
      .from('deal_memberships')
      .select('investor_id')
      .not('interest_confirmed_at', 'is', null)
      .not('investor_id', 'is', null)

    // Combine unique investors from both sources
    const interestInvestorIds = new Set<string>()
    interestSignals?.forEach((s) => s.investor_id && interestInvestorIds.add(s.investor_id))
    membershipInterests?.forEach((m) => m.investor_id && interestInvestorIds.add(m.investor_id))
    const totalShowedInterest = interestInvestorIds.size

    // 3. Started Subscription: Count unique investors who have any subscription
    const { data: allSubscriptions } = await supabase
      .from('subscriptions')
      .select('investor_id')
      .not('investor_id', 'is', null)

    const startedSubscriptionInvestors = new Set<string>()
    allSubscriptions?.forEach((s) => s.investor_id && startedSubscriptionInvestors.add(s.investor_id))
    const startedSubscriptionCount = startedSubscriptionInvestors.size

    // 4. Completed Subscription: Count unique investors with signed/funded subscriptions
    const { data: completedSubs } = await supabase
      .from('subscriptions')
      .select('investor_id')
      .not('investor_id', 'is', null)
      .or('signed_at.not.is.null,status.in.(funded,active)')

    const completedSubscriptionInvestors = new Set<string>()
    completedSubs?.forEach((s) => s.investor_id && completedSubscriptionInvestors.add(s.investor_id))
    const completedSubscriptionCount = completedSubscriptionInvestors.size

    // 5. Allocated: Count unique investors with approved allocations
    const { data: allocations } = await supabase
      .from('allocations')
      .select('investor_id')
      .not('investor_id', 'is', null)
      .not('approved_at', 'is', null)

    const allocatedInvestors = new Set<string>()
    allocations?.forEach((a) => a.investor_id && allocatedInvestors.add(a.investor_id))
    const allocatedCount = allocatedInvestors.size

    // Build investment funnel with percentages
    const investmentFunnelRaw = [
      { stage: 'Viewed Deal', count: viewedDealCount || 0 },
      { stage: 'Showed Interest', count: totalShowedInterest },
      { stage: 'Started Subscription', count: startedSubscriptionCount },
      { stage: 'Completed Subscription', count: completedSubscriptionCount },
      { stage: 'Allocated', count: allocatedCount },
    ]

    const investmentFunnel: FunnelStage[] = investmentFunnelRaw.map((item, index) => {
      const totalCount = investmentFunnelRaw[0].count || 1
      const previousCount = index > 0 ? investmentFunnelRaw[index - 1].count : item.count
      return {
        stage: item.stage,
        count: item.count,
        pctOfTotal: Math.round((item.count / totalCount) * 100 * 10) / 10,
        pctOfPrevious: index === 0 ? 100 : previousCount > 0
          ? Math.round((item.count / previousCount) * 100 * 10) / 10
          : 0,
      }
    })

    // ===== ONBOARDING FUNNEL =====
    // Stages: Account Created -> Profile Completed -> KYC Submitted -> KYC Approved -> First Investment

    // 1. Account Created: Total profiles (non-deleted)
    const { count: accountCreatedCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)

    // 2. Profile Completed: Profiles with display_name filled
    const { count: profileCompletedCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)
      .not('display_name', 'is', null)
      .neq('display_name', '')

    // 3. KYC Submitted: Investors with kyc_status not null/pending (submitted for review)
    const { count: kycSubmittedCount } = await supabase
      .from('investors')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null)
      .not('kyc_status', 'is', null)
      .neq('kyc_status', 'pending')
      .neq('kyc_status', 'not_started')

    // 4. KYC Approved: Investors with approved kyc_status
    const { count: kycApprovedCount } = await supabase
      .from('investors')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null)
      .eq('kyc_status', 'approved')

    // 5. First Investment: Unique investors with at least one subscription
    // (Already calculated above as startedSubscriptionCount)
    const firstInvestmentCount = startedSubscriptionCount

    // Build onboarding funnel with percentages
    const onboardingFunnelRaw = [
      { stage: 'Account Created', count: accountCreatedCount || 0 },
      { stage: 'Profile Completed', count: profileCompletedCount || 0 },
      { stage: 'KYC Submitted', count: kycSubmittedCount || 0 },
      { stage: 'KYC Approved', count: kycApprovedCount || 0 },
      { stage: 'First Investment', count: firstInvestmentCount },
    ]

    const onboardingFunnel: FunnelStage[] = onboardingFunnelRaw.map((item, index) => {
      const totalCount = onboardingFunnelRaw[0].count || 1
      const previousCount = index > 0 ? onboardingFunnelRaw[index - 1].count : item.count
      return {
        stage: item.stage,
        count: item.count,
        pctOfTotal: Math.round((item.count / totalCount) * 100 * 10) / 10,
        pctOfPrevious: index === 0 ? 100 : previousCount > 0
          ? Math.round((item.count / previousCount) * 100 * 10) / 10
          : 0,
      }
    })

    // ===== BIGGEST DROP-OFF =====
    // Find the stage transition with the largest percentage drop

    const allFunnelStages = [
      ...investmentFunnel.map((s) => ({ ...s, funnel: 'investment' })),
      ...onboardingFunnel.map((s) => ({ ...s, funnel: 'onboarding' })),
    ]

    let biggestDropoff: BiggestDropoff = {
      fromStage: '',
      toStage: '',
      dropRate: 0,
    }

    // Check investment funnel dropoffs
    for (let i = 0; i < investmentFunnel.length - 1; i++) {
      const dropRate = 100 - investmentFunnel[i + 1].pctOfPrevious
      if (dropRate > biggestDropoff.dropRate && investmentFunnel[i].count > 0) {
        biggestDropoff = {
          fromStage: investmentFunnel[i].stage,
          toStage: investmentFunnel[i + 1].stage,
          dropRate: Math.round(dropRate * 10) / 10,
        }
      }
    }

    // Check onboarding funnel dropoffs
    for (let i = 0; i < onboardingFunnel.length - 1; i++) {
      const dropRate = 100 - onboardingFunnel[i + 1].pctOfPrevious
      if (dropRate > biggestDropoff.dropRate && onboardingFunnel[i].count > 0) {
        biggestDropoff = {
          fromStage: onboardingFunnel[i].stage,
          toStage: onboardingFunnel[i + 1].stage,
          dropRate: Math.round(dropRate * 10) / 10,
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        investmentFunnel,
        onboardingFunnel,
        biggestDropoff,
      },
    })
  } catch (error) {
    console.error('Funnel metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch funnel metrics' },
      { status: 500 }
    )
  }
}
