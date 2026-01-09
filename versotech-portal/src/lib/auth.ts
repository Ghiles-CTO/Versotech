import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'

// Profile roles (stored in profiles.role)
export type ProfileRole =
  | 'investor'
  | 'staff_admin'
  | 'staff_ops'
  | 'staff_rm'
  | 'arranger'
  | 'introducer'
  | 'partner'
  | 'commercial_partner'
  | 'lawyer'
  | 'ceo'

// All persona types (from get_user_personas())
export type PersonaType = 'staff' | 'investor' | 'arranger' | 'introducer' | 'partner' | 'commercial_partner' | 'lawyer'

// UserRole = ProfileRole for backward compatibility
export type UserRole = ProfileRole

const STAFF_ROLES: ProfileRole[] = ['staff_admin', 'staff_ops', 'staff_rm', 'ceo']

export interface AuthUser {
  id: string
  email: string
  displayName: string
  avatar?: string
  role: UserRole
  title?: string
  created_at: string
  permissions?: string[]
}

// Alias for backward compatibility
export type Profile = AuthUser

export interface AuthSession {
  user: AuthUser
  session: Session
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

// Server-side Supabase client
const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Get current user with profile data
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current auth user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    // Get profile data from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('[auth] Profile not found for user:', user.id, profileError)
      return null
    }

    // Fetch permissions for staff users
    let permissions: string[] = []
    const isStaffRole = STAFF_ROLES.includes(profile.role)

    if (isStaffRole) {
      const { data: permissionsData } = await supabase
        .from('staff_permissions')
        .select('permission')
        .eq('user_id', user.id)

      permissions = permissionsData?.map(p => p.permission) || []
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      avatar: profile.avatar_url,
      role: profile.role as UserRole,
      title: profile.title,
      created_at: profile.created_at,
      permissions
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Get current session
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Get profile (alias for getCurrentUser for backward compatibility)
export async function getProfile(): Promise<AuthUser | null> {
  const user = await getCurrentUser()
  if (user) {
    console.log('[auth] Profile retrieved:', user.email, user.role)
  } else {
    console.log('[auth] No profile found')
  }
  return user
}

// Require authentication
export async function requireAuth(allowedRoles?: UserRole[]) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/versotech_main/login')
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }

  return user
}

// Require investor auth
export async function requireInvestorAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/versotech_main/login')
  }

  if (user.role !== 'investor') {
    throw new Error('Investor access required')
  }

  return user
}

// Require staff auth
export async function requireStaffAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/versotech_main/login')
  }

  if (!STAFF_ROLES.includes(user.role)) {
    throw new Error('Staff access required')
  }

  return user
}

/**
 * Check if a user has staff-level access for page authorization.
 *
 * IMPORTANT: Staff users (staff_admin, ceo, staff_ops, staff_rm) don't have
 * traditional database persona entries. Their "personas" are created synthetically
 * in the layout. This function checks BOTH:
 * 1. Profile role (for staff users without persona entries)
 * 2. Database personas (for users with explicit staff/ceo persona entries)
 *
 * @param userId - The user's ID
 * @returns true if user has staff access (via role OR persona)
 */
export async function checkStaffAccess(userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()

  // Check profile role first (handles synthetic staff personas)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!profileError && profile && STAFF_ROLES.includes(profile.role as ProfileRole)) {
    return true
  }

  // Fallback: check database personas (for edge cases)
  const { data: personas } = await supabase.rpc('get_user_personas', {
    p_user_id: userId
  })

  return personas?.some(
    (p: { persona_type: string }) => p.persona_type === 'staff' || p.persona_type === 'ceo'
  ) || false
}

/**
 * Check if a user has CEO-level access (full admin access).
 * CEO access is granted to users with 'ceo' or 'staff_admin' profile roles.
 */
export async function checkCeoAccess(userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'ceo' || profile?.role === 'staff_admin'
}

// Export STAFF_ROLES for use in pages
export { STAFF_ROLES }
