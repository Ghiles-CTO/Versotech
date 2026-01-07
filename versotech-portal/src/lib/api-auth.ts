/**
 * Helper to get authenticated user from Supabase auth
 * Works with both createClient() and createServiceClient()
 */
export async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  return {
    user,
    error: authError
  }
}

/**
 * Get user role from database profile
 */
export async function getUserRole(supabase: any, user: any): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role || null
}

/**
 * Check if user is staff using both profile role AND persona system
 *
 * Users can have staff access through:
 * 1. Legacy role field: 'staff_*' or 'ceo' in profiles.role
 * 2. Persona system: staff or ceo persona via get_user_personas RPC
 */
export async function isStaffUser(supabase: any, user: any): Promise<boolean> {
  // First check legacy role field
  const role = await getUserRole(supabase, user)
  if (role && (role.startsWith('staff_') || role === 'ceo')) {
    return true
  }

  // For multi_persona users, check personas via RPC
  if (role === 'multi_persona') {
    try {
      const { data: personas } = await supabase.rpc('get_user_personas', {
        p_user_id: user.id
      })

      if (personas && Array.isArray(personas)) {
        return personas.some(
          (p: any) => p.persona_type === 'staff' || p.persona_type === 'ceo'
        )
      }
    } catch (err) {
      console.error('[isStaffUser] Error checking personas:', err)
    }
  }

  return false
}
