import { SupabaseClient } from '@supabase/supabase-js'

type RoutingConfigRow = {
  primary_reviewer_email: string
  fallback_reviewer_email: string
}

function normalizeEmail(email?: string | null): string | null {
  if (!email) return null
  const trimmed = email.trim().toLowerCase()
  return trimmed || null
}

async function resolveProfileIdByEmail(
  supabase: SupabaseClient,
  email: string | null
): Promise<string | null> {
  if (!email) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle()

  if (error || !data?.id) {
    return null
  }

  return data.id as string
}

/**
 * Resolve the target reviewer for KYC submissions.
 *
 * Resolution order:
 * 1) Active row in kyc_routing_config.primary_reviewer_email
 * 2) Active row in kyc_routing_config.fallback_reviewer_email
 * 3) Any active staff admin profile (last-resort fallback)
 */
export async function resolveKycSubmissionAssignee(
  supabase: SupabaseClient
): Promise<string | null> {
  try {
    const { data: config, error: configError } = await supabase
      .from('kyc_routing_config')
      .select('primary_reviewer_email, fallback_reviewer_email')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!configError && config) {
      const primaryEmail = normalizeEmail((config as RoutingConfigRow).primary_reviewer_email)
      const fallbackEmail = normalizeEmail((config as RoutingConfigRow).fallback_reviewer_email)

      const primaryReviewerId = await resolveProfileIdByEmail(supabase, primaryEmail)
      if (primaryReviewerId) return primaryReviewerId

      const fallbackReviewerId = await resolveProfileIdByEmail(supabase, fallbackEmail)
      if (fallbackReviewerId) return fallbackReviewerId
    }

    const { data: fallbackAdmin } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'staff_admin')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    return (fallbackAdmin?.id as string | undefined) || null
  } catch (error) {
    console.error('[kyc-assignment] Failed to resolve KYC assignee:', error)
    return null
  }
}

