import { SupabaseClient } from '@supabase/supabase-js'

import { ACTIVE_PERSONA_ID_COOKIE, ACTIVE_PERSONA_TYPE_COOKIE } from '@/lib/persona/active-persona'
import { resolvePrimaryPersonaLink } from '@/lib/kyc/persona-link'

type CookieValue = { value: string }
type CookieReader = {
  get(name: string): CookieValue | undefined
}

export type ActiveInvestorLink = {
  investor_id: string
  role?: string | null
  is_primary?: boolean | null
  can_sign?: boolean | null
}

export function readActivePersonaCookieValues(cookieStore?: CookieReader | null) {
  return {
    cookiePersonaType: cookieStore?.get(ACTIVE_PERSONA_TYPE_COOKIE)?.value ?? null,
    cookiePersonaId: cookieStore?.get(ACTIVE_PERSONA_ID_COOKIE)?.value ?? null,
  }
}

export async function resolveActiveInvestorLink<T = ActiveInvestorLink>(params: {
  supabase: SupabaseClient<any>
  userId: string
  select?: string
  cookiePersonaType?: string | null
  cookiePersonaId?: string | null
}) {
  const {
    supabase,
    userId,
    select = 'investor_id, role, is_primary, can_sign',
    cookiePersonaType,
    cookiePersonaId,
  } = params

  return resolvePrimaryPersonaLink<T>({
    supabase,
    config: {
      userTable: 'investor_users',
      entityIdColumn: 'investor_id',
    },
    userId,
    select,
    preferredEntityId: cookiePersonaType === 'investor' ? cookiePersonaId : null,
  })
}
