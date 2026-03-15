import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getIntroducerAccountApprovalReadiness } from '@/lib/kyc/introducer-account-approval-readiness'
import {
  readActivePersonaCookieValues,
  resolveActiveIntroducerLink,
} from '@/lib/kyc/active-introducer-link'

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

    const { link: introducerUser, error: introducerUserError } = await resolveActiveIntroducerLink<{
      introducer_id: string
      role: string | null
      is_primary: boolean | null
    }>({
      supabase: serviceSupabase,
      userId: user.id,
      cookiePersonaType,
      cookiePersonaId,
      select: 'introducer_id, role, is_primary',
    })

    if (introducerUserError) {
      console.error('[introducer-dashboard-onboarding] Failed to resolve introducer link:', introducerUserError)
      return NextResponse.json({ error: 'Failed to resolve introducer account' }, { status: 500 })
    }

    if (!introducerUser?.introducer_id) {
      return NextResponse.json({ error: 'Introducer account not found' }, { status: 404 })
    }

    const readiness = await getIntroducerAccountApprovalReadiness({
      supabase: serviceSupabase,
      introducerId: introducerUser.introducer_id,
      linkedUserId: user.id,
    })

    if (!readiness) {
      return NextResponse.json({ error: 'Introducer account not found' }, { status: 404 })
    }

    const { data: introducer, error: introducerError } = await serviceSupabase
      .from('introducers')
      .select('account_approval_status')
      .eq('id', introducerUser.introducer_id)
      .single()

    if (introducerError || !introducer) {
      console.error('[introducer-dashboard-onboarding] Failed to load introducer state:', introducerError)
      return NextResponse.json({ error: 'Failed to load introducer approval state' }, { status: 500 })
    }

    return NextResponse.json({
      investorId: readiness.introducerId,
      personaType: 'introducer',
      entityId: readiness.introducerId,
      entityType: readiness.introducerType,
      investorType: readiness.introducerType,
      profileHref: '/versotech_main/introducer-profile?tab=profile',
      kycHref: '/versotech_main/introducer-profile?tab=kyc',
      membersHref:
        readiness.introducerType === 'entity'
          ? '/versotech_main/introducer-profile?tab=entity-members'
          : '/versotech_main/introducer-profile?tab=profile',
      submitHref: '/versotech_main/introducer-profile?tab=profile&action=submit-approval',
      submitEndpoint: '/api/introducers/me/submit-account-approval',
      accountApprovalStatus:
        introducer.account_approval_status || readiness.accountApprovalStatus || 'pending_onboarding',
      onboardingStatus: null,
      isReady: readiness.isReady,
      hasPendingApproval: readiness.hasPendingApproval,
      canSubmitAccountApproval:
        introducerUser.is_primary === true || introducerUser.role === 'admin',
      missingItems: readiness.missingItems,
      latestRequestInfo: readiness.latestRequestInfo,
    })
  } catch (error) {
    console.error('[introducer-dashboard-onboarding] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard onboarding state' },
      { status: 500 }
    )
  }
}
