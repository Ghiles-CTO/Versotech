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
}

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
      // Check for demo session using cookies
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const demoCookie = cookieStore.get('demo_auth_user')
      
      if (demoCookie) {
        try {
          const demoData = JSON.parse(demoCookie.value)
          console.log('[auth] Demo session detected:', demoData.email, demoData.role)
          
          return {
            id: demoData.id,
            email: demoData.email,
            displayName: demoData.displayName,
            role: demoData.role as UserRole,
            created_at: new Date().toISOString()
          }
        } catch (error) {
          console.error('[auth] Failed to parse demo cookie:', error)
        }
      }
      
      return null
    }

    // Get profile data from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // If no profile exists, create one from auth user data
      const displayName = user.user_metadata?.display_name ||
                         user.user_metadata?.full_name ||
                         user.email?.split('@')[0] ||
                         'User'

      const role = user.user_metadata?.role || 'investor'

      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          display_name: displayName,
          role: role,
          created_at: new Date().toISOString()
        })

      if (createError) {
        console.error('Error creating profile:', createError)
        return null
      }

      return {
        id: user.id,
        email: user.email!,
        displayName: displayName,
        role: role as UserRole,
        created_at: new Date().toISOString()
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      avatar: profile.avatar,
      role: profile.role as UserRole,
      title: profile.title,
      created_at: profile.created_at
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