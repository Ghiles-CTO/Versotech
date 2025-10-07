import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'

/**
 * Helper to get authenticated user from either real Supabase auth or demo mode
 * Works with both createClient() and createServiceClient()
 */
export async function getAuthenticatedUser(supabase: any) {
  // Try real Supabase auth first
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (user) {
    return { user, error: null }
  }
  
  // Fall back to demo mode
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
  
  if (demoCookie) {
    const demoSession = parseDemoSession(demoCookie.value)
    if (demoSession) {
      console.log('[api-auth] Demo mode detected:', demoSession.email, demoSession.role)
      // Return mock user object compatible with Supabase User type
      return {
        user: {
          id: demoSession.id,
          email: demoSession.email,
          user_metadata: { role: demoSession.role, display_name: demoSession.displayName }
        },
        error: null
      }
    }
  }
  
  return { 
    user: null, 
    error: authError || new Error('No authentication found') 
  }
}

/**
 * Get user role - checks demo mode first, then database profile
 */
export async function getUserRole(supabase: any, user: any): Promise<string | null> {
  // If demo mode, role is in user_metadata
  if (user.user_metadata?.role) {
    return user.user_metadata.role
  }
  
  // Otherwise lookup from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return profile?.role || null
}

/**
 * Check if user is staff (works with both real and demo mode)
 */
export async function isStaffUser(supabase: any, user: any): Promise<boolean> {
  const role = await getUserRole(supabase, user)
  return role ? role.startsWith('staff_') : false
}
