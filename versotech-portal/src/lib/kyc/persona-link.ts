import { SupabaseClient } from '@supabase/supabase-js'

export type PersonaUserLinkConfig = {
  userTable: string
  entityIdColumn: string
}

type ResolvePrimaryPersonaLinkParams = {
  supabase: SupabaseClient<any>
  config: PersonaUserLinkConfig
  userId: string
  select: string
  preferredEntityId?: string | null
}

/**
 * Resolve one deterministic persona link for a user, even when multiple links exist.
 * Priority:
 * 1) Explicit preferred entity id (if provided)
 * 2) Primary link
 * 3) Oldest created link
 */
export async function resolvePrimaryPersonaLink<T = Record<string, unknown>>(
  params: ResolvePrimaryPersonaLinkParams
): Promise<{ link: T | null; error: any }> {
  const { supabase, config, userId, select, preferredEntityId } = params

  if (preferredEntityId) {
    const { data, error } = await supabase
      .from(config.userTable)
      .select(select)
      .eq('user_id', userId)
      .eq(config.entityIdColumn, preferredEntityId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      return { link: null, error }
    }

    if (data) {
      return { link: data as T, error: null }
    }
  }

  const { data, error } = await supabase
    .from(config.userTable)
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
