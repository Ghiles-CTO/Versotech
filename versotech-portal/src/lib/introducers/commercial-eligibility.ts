import type { SupabaseClient } from '@supabase/supabase-js'

type IntroducerEligibilityRow = {
  id: string
  legal_name?: string | null
  display_name?: string | null
  contact_name?: string | null
  account_approval_status?: string | null
  onboarding_status?: string | null
}

export type IntroducerCommercialEligibilityReasonCode =
  | 'introducer_account_not_approved'
  | 'introducer_onboarding_incomplete'
  | 'introducer_account_not_ready'

export type IntroducerCommercialEligibility = {
  introducerId: string
  introducerName: string
  accountApprovalStatus: string | null
  onboardingStatus: string | null
  eligible: boolean
  reasonCode: IntroducerCommercialEligibilityReasonCode | null
  message: string | null
  staffHref: string
  profileHref: string
}

function normalizeStatus(value?: string | null) {
  return value ? value.trim().toLowerCase() : null
}

function getIntroducerName(introducer: IntroducerEligibilityRow) {
  return (
    introducer.legal_name?.trim() ||
    introducer.display_name?.trim() ||
    introducer.contact_name?.trim() ||
    'This introducer'
  )
}

export function evaluateIntroducerCommercialEligibility(
  introducer: IntroducerEligibilityRow
): IntroducerCommercialEligibility {
  const introducerName = getIntroducerName(introducer)
  const accountApprovalStatus = normalizeStatus(introducer.account_approval_status)
  const onboardingStatus = normalizeStatus(introducer.onboarding_status)
  const hasApprovedAccount = accountApprovalStatus === 'approved'
  const hasCompletedOnboarding = onboardingStatus === 'completed'
  const eligible = hasApprovedAccount && hasCompletedOnboarding

  let reasonCode: IntroducerCommercialEligibilityReasonCode | null = null
  let message: string | null = null

  if (!eligible) {
    if (!hasApprovedAccount && !hasCompletedOnboarding) {
      reasonCode = 'introducer_account_not_ready'
      message = `${introducerName} cannot be used for fee plans or investor dispatch until account approval is approved and onboarding is completed.`
    } else if (!hasApprovedAccount) {
      reasonCode = 'introducer_account_not_approved'
      message = `${introducerName} cannot be used for fee plans or investor dispatch until account approval is approved.`
    } else {
      reasonCode = 'introducer_onboarding_incomplete'
      message = `${introducerName} cannot be used for fee plans or investor dispatch until onboarding is completed.`
    }
  }

  return {
    introducerId: introducer.id,
    introducerName,
    accountApprovalStatus,
    onboardingStatus,
    eligible,
    reasonCode,
    message,
    staffHref: `/versotech_main/introducers/${introducer.id}`,
    profileHref: '/versotech_main/introducer-profile?tab=profile',
  }
}

export async function getIntroducerCommercialEligibility(
  supabaseOrParams:
    | SupabaseClient
    | {
        supabase: SupabaseClient
        introducerId: string
      },
  maybeIntroducerId?: string
): Promise<IntroducerCommercialEligibility | null> {
  const supabase = maybeIntroducerId
    ? (supabaseOrParams as SupabaseClient)
    : (supabaseOrParams as { supabase: SupabaseClient; introducerId: string }).supabase
  const introducerId = maybeIntroducerId
    ? maybeIntroducerId
    : (supabaseOrParams as { supabase: SupabaseClient; introducerId: string }).introducerId

  const { data: introducer, error } = await supabase
    .from('introducers')
    .select('id, legal_name, display_name, contact_name, account_approval_status, onboarding_status')
    .eq('id', introducerId)
    .maybeSingle()

  if (error || !introducer) {
    return null
  }

  return evaluateIntroducerCommercialEligibility(introducer as IntroducerEligibilityRow)
}

export function buildIntroducerCommercialBlockPayload(
  eligibilityOrParams:
    | IntroducerCommercialEligibility
    | {
        introducerId?: string
        eligibility: IntroducerCommercialEligibility
      }
) {
  const eligibility =
    'eligibility' in eligibilityOrParams
      ? eligibilityOrParams.eligibility
      : eligibilityOrParams

  return {
    error: 'Introducer not ready for commercial setup',
    code: 'introducer_commercially_ineligible',
    reasonCode: eligibility.reasonCode,
    message:
      eligibility.message ||
      `${eligibility.introducerName} cannot be used for fee plans or investor dispatch yet.`,
    entityType: 'introducer',
    entityId: eligibility.introducerId,
    accountApprovalStatus: eligibility.accountApprovalStatus,
    onboardingStatus: eligibility.onboardingStatus,
    href: eligibility.staffHref,
  }
}

export const getIntroducerCommercialBlockPayload =
  buildIntroducerCommercialBlockPayload
