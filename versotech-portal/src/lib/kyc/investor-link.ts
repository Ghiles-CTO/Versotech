import { SupabaseClient } from '@supabase/supabase-js'

export type InvestorLink = {
  investor_id: string
  role?: string | null
  is_primary?: boolean | null
  can_sign?: boolean | null
}

/**
 * Resolve one deterministic investor link for a user, even when multiple links exist.
 * Priority: primary link first, then oldest created.
 */
export async function resolvePrimaryInvestorLink(
  supabase: SupabaseClient<any>,
  userId: string,
  select?: string
): Promise<{ link: any | null; error: any }>
export async function resolvePrimaryInvestorLink<T = InvestorLink>(
  supabase: SupabaseClient<any>,
  userId: string,
  select = 'investor_id, role, is_primary, can_sign'
): Promise<{ link: T | null; error: any }> {
  const { data, error } = await supabase
    .from('investor_users')
    .select(select)
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    return { link: null, error }
  }

  return { link: (data as T | null) ?? null, error: null }
}
