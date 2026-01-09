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
 * Check if user has a specific permission OR is CEO (CEO bypasses all permission checks)
 *
 * This centralizes permission checking so that:
 * 1. CEO users automatically have ALL permissions without needing staff_permissions entries
 * 2. Regular staff users need explicit permissions in staff_permissions table
 *
 * @param supabase - Supabase client (can be regular or service client)
 * @param userId - The user's ID
 * @param requiredPermissions - Array of permissions (user needs ANY of these, not all)
 * @returns true if user has permission or is CEO
 */
export async function hasPermission(
  supabase: any,
  userId: string,
  requiredPermissions: string[]
): Promise<boolean> {
  // First, check if user is CEO - CEO bypasses all permission checks
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'ceo') {
    return true // CEO has all permissions
  }

  // Also check if user has CEO persona (for multi_persona users)
  const { data: ceoUser } = await supabase
    .from('ceo_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (ceoUser) {
    return true // User is in ceo_users table, has all permissions
  }

  // For non-CEO users, check staff_permissions table
  const { data: permission } = await supabase
    .from('staff_permissions')
    .select('permission')
    .eq('user_id', userId)
    .in('permission', requiredPermissions)
    .limit(1)
    .maybeSingle()

  return !!permission
}

/**
 * Check if user has super_admin permission OR is CEO
 * Convenience function for the most common permission check
 */
export async function isSuperAdmin(supabase: any, userId: string): Promise<boolean> {
  return hasPermission(supabase, userId, ['super_admin'])
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
