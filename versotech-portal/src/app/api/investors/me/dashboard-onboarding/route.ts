import { NextResponse } from 'next/server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolvePrimaryInvestorLink } from '@/lib/kyc/investor-link'
import { getInvestorAccountApprovalReadiness } from '@/lib/kyc/investor-account-approval-readiness'

export async function GET() {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { link: investorUser, error: investorUserError } = await resolvePrimaryInvestorLink(
      serviceSupabase,
      user.id,
      'investor_id, role, is_primary'
    )

    if (investorUserError) {
      console.error('[dashboard-onboarding] Failed to resolve investor link:', investorUserError)
      return NextResponse.json({ error: 'Failed to resolve investor account' }, { status: 500 })
    }

    if (!investorUser?.investor_id) {
      return NextResponse.json({ error: 'Investor account not found' }, { status: 404 })
    }

    const readiness = await getInvestorAccountApprovalReadiness({
      supabase: serviceSupabase,
      investorId: investorUser.investor_id,
    })

    if (!readiness) {
      return NextResponse.json({ error: 'Investor account not found' }, { status: 404 })
    }

    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('account_approval_status, onboarding_status')
      .eq('id', investorUser.investor_id)
      .single()

    if (investorError || !investor) {
      console.error('[dashboard-onboarding] Failed to load investor state:', investorError)
      return NextResponse.json({ error: 'Failed to load investor approval state' }, { status: 500 })
    }

    return NextResponse.json({
      investorId: readiness.investorId,
      investorType: readiness.investorType,
      accountApprovalStatus:
        investor.account_approval_status || readiness.accountApprovalStatus || 'pending_onboarding',
      onboardingStatus: investor.onboarding_status || null,
      isReady: readiness.isReady,
      hasPendingApproval: readiness.hasPendingApproval,
      canSubmitAccountApproval:
        investorUser.is_primary === true || investorUser.role === 'admin',
      missingItems: readiness.missingItems,
      latestRequestInfo: readiness.latestRequestInfo,
    })
  } catch (error) {
    console.error('[dashboard-onboarding] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard onboarding state' },
      { status: 500 }
    )
  }
}
