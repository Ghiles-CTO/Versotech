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
 * Check if user is staff
 */
export async function isStaffUser(supabase: any, user: any): Promise<boolean> {
  const role = await getUserRole(supabase, user)
  return role ? role.startsWith('staff_') : false
}
