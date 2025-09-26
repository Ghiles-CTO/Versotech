'use client'

import { createClient } from '@/lib/supabase/client'
import { sessionManager } from '@/lib/session-manager'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  avatar?: string
  role: 'investor' | 'staff_admin' | 'staff_ops' | 'staff_rm'
  title?: string
  created_at: string
}

export interface AuthSession {
  user: AuthUser
  session: Session
}

export interface SignInApiResponse {
  success?: boolean
  redirect?: string
  session?: {
    access_token: string
    refresh_token: string
    expires_at?: number | null
  }
  user?: {
    id: string
    email: string
    role: string
    displayName?: string
  }
  error?: string
}

const syncBrowserSession = async (session?: { access_token: string; refresh_token: string }) => {
  if (!session) return true

  const supabase = createClient()

  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  })

  if (error) {
    console.error('[auth] Client session sync failed:', error)
    return false
  }

  return true
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

// Sign up with email and password
export const signUp = async (email: string, password: string, displayName: string, portal: 'investor' | 'staff' = 'investor') => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, displayName, portal })
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok || !payload.success) {
      const message = typeof payload.error === 'string' && payload.error.trim()
        ? payload.error
        : 'Sign up failed. Please try again.'
      throw new AuthError(message)
    }

    return payload
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    console.error('Sign up failed:', error)
    throw new AuthError('Sign up failed. Please try again.')
  }
}

// Sign in with email and password
export const signIn = async (email: string, password: string, portal: 'investor' | 'staff' = 'investor') => {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, portal })
    })

    const payload: SignInApiResponse = await response.json().catch(() => ({}))

    if (!response.ok || !payload.success) {
      const message = typeof payload.error === 'string' && payload.error.trim()
        ? payload.error
        : 'Authentication failed. Please check your credentials.'
      throw new AuthError(message)
    }

    const synced = await syncBrowserSession(payload.session ? {
      access_token: payload.session.access_token,
      refresh_token: payload.session.refresh_token
    } : undefined)

    if (!synced) {
      throw new AuthError('Unable to establish session. Please try again.')
    }

    sessionManager.markAuthenticated()

    return payload
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }

    console.error('Sign in failed:', error)
    throw new AuthError('Sign in failed. Please check your credentials.')
  }
}

// Sign in with Google
export const signInWithGoogle = async (portalType: 'staff' | 'investor' = 'investor') => {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?portal=${portalType}`
      }
    })

    if (error) {
      throw new AuthError(error.message, error.message)
    }

    return data
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('Google sign in failed. Please try again.')
  }
}

// Sign out with comprehensive session clearing
export const signOut = async () => {
  const supabase = createClient()

  let signOutError: unknown = null

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[auth] Supabase signOut error:', error)
      signOutError = error
    }
  } catch (error) {
    console.error('[auth] Sign out error:', error)
    signOutError = error
  } finally {
    if (typeof window !== 'undefined') {
      sessionManager.forceSignOut()
    }
  }

  if (signOutError) {
    throw new AuthError('Sign out failed. Please try again.')
  }
}

// Get current user with profile data
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const supabase = createClient()

  try {
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
      // If no profile exists, create one from auth user data
      const displayName = user.user_metadata?.display_name ||
                         user.user_metadata?.full_name ||
                         user.email?.split('@')[0] ||
                         'User'

      const role = user.user_metadata?.role || 'investor'

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          display_name: displayName,
          role: role,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return null
      }

      return {
        id: user.id,
        email: user.email!,
        displayName: displayName,
        role: role as AuthUser['role'],
        created_at: new Date().toISOString()
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      avatar: profile.avatar,
      role: profile.role as AuthUser['role'],
      title: profile.title,
      created_at: profile.created_at
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Get current session
export const getCurrentSession = async (): Promise<Session | null> => {
  const supabase = createClient()

  try {
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

// Auth state listener
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  const supabase = createClient()

  return supabase.auth.onAuthStateChange(callback)
}

// Password reset
export const resetPassword = async (email: string) => {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    })

    if (error) {
      throw new AuthError(error.message, error.message)
    }
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('Password reset failed. Please try again.')
  }
}

// Update password
export const updatePassword = async (newPassword: string) => {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new AuthError(error.message, error.message)
    }
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('Password update failed. Please try again.')
  }
}

// Update user profile
export const updateProfile = async (updates: Partial<Pick<AuthUser, 'displayName' | 'title'>>) => {
  const supabase = createClient()

  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthError('No authenticated user found')
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: updates.displayName,
        title: updates.title
      })
      .eq('id', user.id)

    if (error) {
      throw new AuthError(error.message, error.message)
    }

    // Also update auth user metadata
    if (updates.displayName) {
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: updates.displayName }
      })

      if (authError) {
        console.error('Error updating auth metadata:', authError)
      }
    }
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('Profile update failed. Please try again.')
  }
}