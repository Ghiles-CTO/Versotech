import { SupabaseClient } from '@supabase/supabase-js'

import { readActivePersonaCookieValues } from '@/lib/kyc/active-investor-link'
import { resolvePrimaryPersonaLink } from '@/lib/kyc/persona-link'

export { readActivePersonaCookieValues }

type CookieReader = Parameters<typeof readActivePersonaCookieValues>[0]

export type ActiveIntroducerLink = {
  introducer_id: string
  role?: string | null
  is_primary?: boolean | null
  can_sign?: boolean | null
}

export async function resolveActiveIntroducerLink<T = ActiveIntroducerLink>(params: {
  supabase: SupabaseClient<any>
  userId: string
  select?: string
  cookiePersonaType?: string | null
  cookiePersonaId?: string | null
}) {
  const {
    supabase,
    userId,
    select = 'introducer_id, role, is_primary, can_sign',
    cookiePersonaType,
    cookiePersonaId,
  } = params

  return resolvePrimaryPersonaLink<T>({
    supabase,
    config: {
      userTable: 'introducer_users',
      entityIdColumn: 'introducer_id',
    },
    userId,
    select,
    preferredEntityId: cookiePersonaType === 'introducer' ? cookiePersonaId : null,
  })
}

export async function resolveActiveIntroducerLinkFromCookies<T = ActiveIntroducerLink>(params: {
  supabase: SupabaseClient<any>
  userId: string
  cookieStore?: CookieReader | null
  select?: string
}) {
  const { supabase, userId, cookieStore, select } = params
  const { cookiePersonaType, cookiePersonaId } = readActivePersonaCookieValues(cookieStore)

  return resolveActiveIntroducerLink<T>({
    supabase,
    userId,
    select,
    cookiePersonaType,
    cookiePersonaId,
  })
}
