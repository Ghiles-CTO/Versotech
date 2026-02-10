'use client'

import { createClient, resetClient } from '@/lib/supabase/client'
import { sessionManager } from '@/lib/session-manager'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  avatar?: string
  role:
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

const syncBrowserSession = async (
  session?: {
    access_token: string
    refresh_token: string
    expires_at?: number | null
  }
) => {
  console.log('[auth] syncBrowserSession called, session provided:', !!session)

  if (!session) {
    console.log('[auth] No session to sync, returning true')
    return true
  }

  const supabase = createClient()

  console.log('[auth] Calling supabase.auth.setSession...')
  const { data, error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  })

  if (error) {
    console.error('[auth] Client session sync failed:', error)
    return false
  }

  console.log('[auth] Session synced successfully, user:', data?.user?.email)
  return true
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * SIGNUP - DISABLED
 *
 * This platform is invite-only. Self-registration is not allowed.
 * This function is kept for backwards compatibility but will always fail.
 *
 * @deprecated Use admin invitation flow instead
 */
export const signUp = async (email: string, password: string, displayName: string, portal: 'investor' | 'staff' = 'investor') => {
  console.warn('[auth-client] signUp() called but self-registration is disabled')
  throw new AuthError('Self-registration is disabled. This platform is invite-only. Please contact your administrator or relationship manager to request access.')
}

// Sign in with email and password
export const signIn = async (email: string, password: string, portal: 'investor' | 'staff' = 'investor') => {
  try {
    // CRITICAL FIX: Clear all auth data before attempting sign-in
    // This prevents "Invalid Refresh Token" and session conflict errors
    console.log('[auth-client] Clearing all auth data before sign-in...')
    sessionManager.clearAllAuthData()

    // Reset the Supabase client singleton to get fresh instance
    resetClient()

    // Small delay to ensure storage clearing completes
    await new Promise(resolve => setTimeout(resolve, 100))

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
      refresh_token: payload.session.refresh_token,
      expires_at: payload.session.expires_at,
    } : undefined)

    if (!synced) {
      throw new AuthError('Unable to establish session. Please try again.')
    }

    // Wait for auth cookie/session propagation before redirect-driven navigation.
    // This avoids transient loops back to /login on slower clients.
    const supabase = createClient()
    const waitUntil = Date.now() + 3000
    let hasSession = false
    while (Date.now() < waitUntil) {
      const { data } = await supabase.auth.getSession()
      if (data.session?.access_token) {
        hasSession = true
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 120))
    }
    if (!hasSession) {
      console.warn('[auth-client] Session propagation timeout after sign-in')
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

/**
 * GOOGLE OAUTH - DISABLED
 *
 * Google OAuth has been disabled for security reasons.
 * This platform is invite-only with email/password authentication.
 *
 * @deprecated OAuth providers have been disabled
 */
export const signInWithGoogle = async (portalType: 'staff' | 'investor' = 'investor') => {
  console.warn('[auth-client] signInWithGoogle() called but OAuth is disabled')
  throw new AuthError('Google sign-in is disabled. Please use your email and password to sign in.')
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
      // Reset the Supabase client singleton after sign-out
      resetClient()
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
      console.error('Error getting profile:', profileError)
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name || profile.email?.split('@')[0] || 'User',
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

// Password reset - uses custom API with Resend email
export const resetPassword = async (email: string) => {
  try {
    const response = await fetch('/api/auth/request-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })

    const data = await response.json()

    if (!response.ok) {
      // Include detail error for debugging
      const errorMsg = data.detail
        ? `${data.error} (${data.detail})`
        : data.error || 'Password reset failed. Please try again.'
      throw new AuthError(errorMsg)
    }

    // Success - email sent (or would have been if account exists)
    return { success: true, message: data.message }
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
