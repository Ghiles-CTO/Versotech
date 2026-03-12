import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'

export async function requireAuthenticatedProfile() {
  const supabase = await createClient()
  const { user, error } = await getAuthenticatedUser(supabase)

  if (error || !user) {
    return {
      supabase,
      user: null,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    }
  }

  return { supabase, user, response: null }
}

export async function requireMarketingAdmin() {
  const auth = await requireAuthenticatedProfile()

  if (auth.response || !auth.user) {
    return auth
  }

  const hasAccess = await hasMarketingAdminAccess(auth.supabase, auth.user.id)

  if (!hasAccess) {
    return {
      ...auth,
      response: new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    }
  }

  return auth
}

export async function hasMarketingAdminAccess(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: personas } = await supabase.rpc('get_user_personas', {
    p_user_id: userId,
  })

  const hasAdminPersona = Array.isArray(personas) && personas.some(
    (persona: { persona_type?: string | null; role_in_entity?: string | null }) =>
      persona.persona_type === 'ceo' ||
      (persona.persona_type === 'staff' &&
        (persona.role_in_entity === 'ceo' || persona.role_in_entity === 'staff_admin'))
  )

  if (hasAdminPersona) {
    return true
  }

  return false
}

export async function verifyInvestorMembership(userId: string, investorId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', userId)
    .eq('investor_id', investorId)
    .maybeSingle()

  return Boolean(data)
}
