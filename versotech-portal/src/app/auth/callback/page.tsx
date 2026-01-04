'use client'

import { useEffect, useState, Suspense, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import { createClient as createMainClient, resetClient } from '@/lib/supabase/client'

/**
 * CRITICAL: Capture hash fragment AT MODULE LOAD TIME
 * This happens BEFORE any React rendering or Supabase client initialization.
 * Supabase's detectSessionInUrl may clear the hash, so we must capture it first.
 */
let CAPTURED_HASH = ''
let IS_RECOVERY_FLOW_DETECTED = false

if (typeof window !== 'undefined') {
  CAPTURED_HASH = window.location.hash || ''
  // Check if this is a recovery/password reset flow
  if (CAPTURED_HASH.includes('type=recovery')) {
    IS_RECOVERY_FLOW_DETECTED = true
    console.log('[auth-callback:module] RECOVERY FLOW DETECTED at module load! Hash:', CAPTURED_HASH.substring(0, 50) + '...')
  }
}

/**
 * Create a special Supabase client for auth callback that handles IMPLICIT flow.
 *
 * WHY THIS IS NEEDED:
 * - The main app client uses flowType: 'pkce' for security
 * - BUT Supabase inviteUserByEmail() uses IMPLICIT flow (tokens in hash fragment)
 * - PKCE clients IGNORE hash fragments (#access_token=...)
 * - So we need an IMPLICIT client specifically for processing invite magic links
 *
 * IMPORTANT: After extracting tokens, we sync the session to the main app's
 * singleton client to ensure session persistence across page navigation.
 */
function createImplicitFlowClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,  // CRITICAL: Detect hash fragment tokens
      autoRefreshToken: true,
      flowType: 'implicit',      // CRITICAL: Process hash fragments from invite links
    },
  })
}

/**
 * Sync the session to the main app's singleton client.
 * This ensures that when we navigate to set-password or other pages,
 * they can access the session using the standard createClient().
 */
async function syncSessionToMainClient(accessToken: string, refreshToken: string): Promise<boolean> {
  try {
    // Reset the singleton to ensure fresh state
    resetClient()

    // Get the main app's singleton client
    const mainClient = createMainClient()

    // Set the session on the main client
    const { error } = await mainClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    if (error) {
      console.error('[auth-callback] Failed to sync session to main client:', error)
      return false
    }

    console.log('[auth-callback] Session synced to main app client successfully')
    return true
  } catch (err) {
    console.error('[auth-callback] Error syncing session:', err)
    return false
  }
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')
  const processedRef = useRef(false)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const portalContext = searchParams.get('portal') ?? 'investor'
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const code = searchParams.get('code')
  const authType = searchParams.get('type') // 'recovery', 'signup', 'invite', etc.

  // Also check URL params for recovery type (in case it's there)
  const isRecoveryFromParams = authType === 'recovery'

  // Use module-level detection OR URL param detection
  const isRecovery = IS_RECOVERY_FLOW_DETECTED || isRecoveryFromParams

  // Handle authenticated user - create profile if needed and redirect
  const handleAuthenticatedUser = useCallback(async (user: User) => {
    // Prevent double processing
    if (processedRef.current) return
    processedRef.current = true

    console.log('[auth-callback] User authenticated:', user.email)
    console.log('[auth-callback] User metadata:', user.user_metadata)
    console.log('[auth-callback] IS_RECOVERY_FLOW_DETECTED (module):', IS_RECOVERY_FLOW_DETECTED)
    console.log('[auth-callback] isRecoveryFromParams:', isRecoveryFromParams)
    console.log('[auth-callback] Final isRecovery:', isRecovery)

    // If this is a password recovery flow, redirect directly to reset-password page
    // Check BOTH module-level detection AND local detection
    if (isRecovery) {
      console.log('[auth-callback] Recovery flow CONFIRMED, redirecting to reset-password...')
      setStatus('success')
      setMessage('Redirecting to reset your password...')
      setTimeout(() => {
        window.location.href = '/versotech_main/reset-password'
      }, 1000)
      return
    }

    // Use the implicit flow client for database operations too
    const supabase = supabaseRef.current || createImplicitFlowClient()

    try {
      // Check if profile exists (should be created by trigger or invite API)
      let profile: { role: string; display_name: string; password_set: boolean | null } | null = null
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, display_name, password_set')
        .eq('id', user.id)
        .maybeSingle()

      profile = profileData

      // If profile doesn't exist (trigger failed), create it via API
      if (!profile) {
        console.log('[auth-callback] Profile not found, creating it...')

        const metadataDisplayName = user.user_metadata?.display_name ||
                                     user.user_metadata?.full_name ||
                                     user.email?.split('@')[0] ||
                                     'User'

        const createResponse = await fetch('/api/auth/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            displayName: metadataDisplayName
          })
        })

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}))
          console.error('[auth-callback] Profile creation failed:', errorData)
          setStatus('error')
          setMessage('Failed to create profile. Please contact support.')
          return
        }

        // Fetch the newly created profile to get server-assigned role
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('role, display_name, password_set')
          .eq('id', user.id)
          .single()

        profile = newProfile || { role: 'investor', display_name: metadataDisplayName, password_set: false }
      }

      console.log('[auth-callback] Profile ready:', profile)

      // Determine if user is staff
      const isStaff = ['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)

      // Check if password needs to be set (for invited users)
      if (profile.password_set === false) {
        console.log('[auth-callback] Password not set, redirecting to set-password page...')
        // Unified set-password page
        const setPasswordUrl = '/versotech_main/set-password'

        setStatus('success')
        setMessage('Please set your password to continue...')

        setTimeout(() => {
          window.location.href = setPasswordUrl
        }, 1500)
        return
      }

      // Unified portal: all users go to the same dashboard
      // Layout handles persona-based access control
      const redirectUrl = '/versotech_main/dashboard'

      console.log('[auth-callback] Redirecting to unified portal:', redirectUrl, 'for role:', profile.role)

      setStatus('success')
      setMessage('Email verified! Redirecting to portal...')

      setTimeout(() => {
        window.location.href = redirectUrl
      }, 1500)

    } catch (err) {
      console.error('[auth-callback] Unexpected error:', err)
      setStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    }
  }, [isRecovery, isRecoveryFromParams])

  useEffect(() => {
    // Log module-level detection status
    console.log('[auth-callback:effect] Module-level IS_RECOVERY_FLOW_DETECTED:', IS_RECOVERY_FLOW_DETECTED)
    console.log('[auth-callback:effect] Module-level CAPTURED_HASH:', CAPTURED_HASH ? CAPTURED_HASH.substring(0, 50) + '...' : 'empty')
    console.log('[auth-callback:effect] Component-level isRecovery:', isRecovery)

    // Handle explicit errors in URL
    if (errorParam) {
      console.error('[auth-callback] Error in URL:', errorParam, errorDescription)
      setStatus('error')
      setMessage(errorDescription || 'Authentication failed. Please try again.')
      setTimeout(() => {
        // Unified login page
        router.push('/versotech_main/login?error=auth_failed')
      }, 2000)
      return
    }

    // Create an IMPLICIT flow client that can process hash fragment tokens
    // This is CRITICAL for invite magic links to work
    const supabase = createImplicitFlowClient()
    supabaseRef.current = supabase

    console.log('[auth-callback] Created implicit flow client')
    console.log('[auth-callback] Current URL hash:', window.location.hash ? 'Present (tokens in hash)' : 'Empty')
    console.log('[auth-callback] Code param:', code ? 'Present (PKCE flow)' : 'Empty')

    // Set up auth state change listener
    // The implicit flow client will automatically process hash fragments
    // and fire SIGNED_IN event when tokens are detected
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[auth-callback] Auth state changed:', event, session?.user?.email, 'isRecovery:', isRecovery)

        if (event === 'SIGNED_IN' && session?.user) {
          // CRITICAL: Sync session to main app client for page navigation
          if (session.access_token && session.refresh_token) {
            await syncSessionToMainClient(session.access_token, session.refresh_token)
          }
          handleAuthenticatedUser(session.user)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Also sync on token refresh
          if (session.access_token && session.refresh_token) {
            await syncSessionToMainClient(session.access_token, session.refresh_token)
          }
          handleAuthenticatedUser(session.user)
        } else if (event === 'INITIAL_SESSION' && session?.user) {
          // This fires when client initializes and finds a session
          console.log('[auth-callback] Initial session detected')
          // Sync initial session too
          if (session.access_token && session.refresh_token) {
            await syncSessionToMainClient(session.access_token, session.refresh_token)
          }
          handleAuthenticatedUser(session.user)
        }
      }
    )

    // Also check for existing session or code exchange
    const checkAuth = async () => {
      // First check if user is already authenticated (session in cookies)
      const { data: { user: existingUser } } = await supabase.auth.getUser()

      if (existingUser) {
        console.log('[auth-callback] Found existing session, isRecovery:', isRecovery)
        handleAuthenticatedUser(existingUser)
        return
      }

      // If we have a code parameter, try PKCE exchange
      if (code) {
        console.log('[auth-callback] Exchanging code for session...')
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('[auth-callback] Exchange failed:', exchangeError)
          setStatus('error')
          setMessage(`Verification error: ${exchangeError.message}`)
          setTimeout(() => {
            router.push('/versotech_main/login?error=auth_failed')
          }, 3000)
          return
        }

        if (data?.user) {
          handleAuthenticatedUser(data.user)
          return
        }
      }

      // Check for hash fragment (implicit flow from invite links and recovery)
      // Use CAPTURED_HASH from module level since current hash might be cleared
      const hashToUse = CAPTURED_HASH || window.location.hash
      if (hashToUse && hashToUse.includes('access_token')) {
        console.log('[auth-callback] Hash fragment detected, manually extracting tokens from:', hashToUse.substring(0, 50) + '...')

        // Parse hash fragment to extract tokens
        const hashParams = new URLSearchParams(hashToUse.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const hashType = hashParams.get('type')

        console.log('[auth-callback] Tokens extracted:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type: hashType
        })

        if (accessToken && refreshToken) {
          // Set the session on BOTH the implicit client and the main app client
          // This ensures session persistence across page navigation

          // 1. Set on implicit client first (for immediate use)
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('[auth-callback] Failed to set session on implicit client:', sessionError)
          } else if (sessionData?.user) {
            console.log('[auth-callback] Session set on implicit client for:', sessionData.user.email)

            // 2. CRITICAL: Also sync to main app's singleton client
            // This ensures the set-password page can access the session
            const synced = await syncSessionToMainClient(accessToken, refreshToken)
            if (!synced) {
              console.warn('[auth-callback] Session sync to main client failed, navigation may fail')
            }

            handleAuthenticatedUser(sessionData.user)
            return
          }
        }

        // Fallback: try getUser after a delay
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: { user: hashUser } } = await supabase.auth.getUser()
        if (hashUser) {
          console.log('[auth-callback] User found after hash processing')
          handleAuthenticatedUser(hashUser)
          return
        }
      }

      // No immediate session - wait for onAuthStateChange to fire
      console.log('[auth-callback] Waiting for auth state change...')

      // Set a timeout to show error if no auth event fires
      setTimeout(() => {
        if (!processedRef.current) {
          console.error('[auth-callback] Timeout - no authenticated user found')
          console.error('[auth-callback] Hash was:', window.location.hash ? 'Present' : 'Empty')
          console.error('[auth-callback] CAPTURED_HASH was:', CAPTURED_HASH ? 'Present' : 'Empty')
          setStatus('error')
          setMessage('Verification failed. The link may have expired or already been used.')
          setTimeout(() => {
            router.push('/versotech_main/login?error=auth_failed')
          }, 3000)
        }
      }, 5000) // 5 second timeout
    }

    // Small delay to let Supabase client initialize and process hash
    setTimeout(checkAuth, 200)

    return () => {
      subscription.unsubscribe()
    }
  }, [errorParam, errorDescription, code, authType, portalContext, router, handleAuthenticatedUser, isRecovery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verifying Your Email</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600">Please wait while we verify your email.</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
