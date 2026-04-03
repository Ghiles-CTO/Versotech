import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getInvestorAccountApprovalReadiness } from '@/lib/kyc/investor-account-approval-readiness'
import { readActivePersonaCookieValues, resolveActiveInvestorLink } from '@/lib/kyc/active-investor-link'

export async function GET() {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()
    const cookieStore = await cookies()
    const { cookiePersonaType, cookiePersonaId } = readActivePersonaCookieValues(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { link: investorUser, error: investorUserError } = await resolveActiveInvestorLink<{
      investor_id: string
      role: string | null
      is_primary: boolean | null
    }>({
      supabase: serviceSupabase,
      userId: user.id,
      cookiePersonaType,
      cookiePersonaId,
      select: 'investor_id, role, is_primary',
    })

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
      .select('account_approval_status, onboarding_status, updated_at')
      .eq('id', investorUser.investor_id)
      .single()

    if (investorError || !investor) {
      console.error('[dashboard-onboarding] Failed to load investor state:', investorError)
      return NextResponse.json({ error: 'Failed to load investor approval state' }, { status: 500 })
    }

    return NextResponse.json({
      investorId: readiness.investorId,
      personaType: 'investor',
      entityId: readiness.investorId,
      approvalEventKey: investor.updated_at || null,
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
