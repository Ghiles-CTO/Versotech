import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'

export type UserRole = 'investor' | 'staff_admin' | 'staff_ops' | 'staff_rm'

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
    const isStaffRole = ['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)

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
    redirect('/versoholdings/login')
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
    redirect('/versoholdings/login')
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
    redirect('/versotech/login')
  }

  if (!['staff_admin', 'staff_ops', 'staff_rm'].includes(user.role)) {
    throw new Error('Staff access required')
  }

  return user
}