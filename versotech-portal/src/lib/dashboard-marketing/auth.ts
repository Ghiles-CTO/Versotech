import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, hasPermission } from '@/lib/api-auth'

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

  const { data: profile } = await auth.supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single()

  const hasAdminProfileRole = profile?.role === 'ceo' || profile?.role === 'staff_admin'
  const hasAdminPermission = hasAdminProfileRole
    ? true
    : await hasPermission(auth.supabase, auth.user.id, ['super_admin'])

  if (!hasAdminPermission) {
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
