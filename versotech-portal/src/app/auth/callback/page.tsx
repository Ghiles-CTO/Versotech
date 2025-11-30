'use client'

import { useEffect, useState, Suspense, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')
  const processedRef = useRef(false)

  const portalContext = searchParams.get('portal') ?? 'investor'
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const code = searchParams.get('code')

  // Handle authenticated user - create profile if needed and redirect
  const handleAuthenticatedUser = useCallback(async (user: User) => {
    // Prevent double processing
    if (processedRef.current) return
    processedRef.current = true

    console.log('[auth-callback] User authenticated:', user.email)
    console.log('[auth-callback] User metadata:', user.user_metadata)

    const supabase = createClient()

    try {
      // Check if profile exists (should be created by trigger or invite API)
      let profile: { role: string; display_name: string } | null = null
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, display_name')
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
          .select('role, display_name')
          .eq('id', user.id)
          .single()

        profile = newProfile || { role: 'investor', display_name: metadataDisplayName }
      }

      console.log('[auth-callback] Profile ready:', profile)

      // Redirect to appropriate portal based on role
      const isStaff = ['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)
      const redirectUrl = isStaff ? '/versotech/staff' : '/versoholdings/dashboard'

      console.log('[auth-callback] Redirecting to:', redirectUrl, 'for role:', profile.role)

      setStatus('success')
      setMessage(`Email verified! Redirecting to ${isStaff ? 'Staff' : 'Investor'} portal...`)

      setTimeout(() => {
        window.location.href = redirectUrl
      }, 1500)

    } catch (err) {
      console.error('[auth-callback] Unexpected error:', err)
      setStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    }
  }, [])

  useEffect(() => {
    // Handle explicit errors in URL
    if (errorParam) {
      console.error('[auth-callback] Error in URL:', errorParam, errorDescription)
      setStatus('error')
      setMessage(errorDescription || 'Authentication failed. Please try again.')
      setTimeout(() => {
        const loginUrl = portalContext === 'staff' ? '/versotech/login' : '/versoholdings/login'
        router.push(`${loginUrl}?error=auth_failed`)
      }, 2000)
      return
    }

    const supabase = createClient()

    // Set up auth state change listener FIRST
    // This catches the session when Supabase processes hash fragment tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[auth-callback] Auth state changed:', event)

        if (event === 'SIGNED_IN' && session?.user) {
          handleAuthenticatedUser(session.user)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          handleAuthenticatedUser(session.user)
        }
      }
    )

    // Also check for existing session or code exchange
    const checkAuth = async () => {
      // First check if user is already authenticated (session in cookies)
      const { data: { user: existingUser } } = await supabase.auth.getUser()

      if (existingUser) {
        console.log('[auth-callback] Found existing session')
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
            const loginUrl = portalContext === 'staff' ? '/versotech/login' : '/versoholdings/login'
            router.push(`${loginUrl}?error=auth_failed`)
          }, 3000)
          return
        }

        if (data?.user) {
          handleAuthenticatedUser(data.user)
          return
        }
      }

      // No immediate session - wait for onAuthStateChange to fire
      // Give Supabase time to process hash fragment (implicit flow)
      console.log('[auth-callback] Waiting for auth state change...')

      // Set a timeout to show error if no auth event fires
      setTimeout(() => {
        if (!processedRef.current) {
          console.error('[auth-callback] Timeout - no authenticated user found')
          setStatus('error')
          setMessage('Verification failed. The link may have expired or already been used.')
          setTimeout(() => {
            const loginUrl = portalContext === 'staff' ? '/versotech/login' : '/versoholdings/login'
            router.push(`${loginUrl}?error=auth_failed`)
          }, 3000)
        }
      }, 5000) // 5 second timeout
    }

    // Small delay to let Supabase client initialize and process hash
    setTimeout(checkAuth, 100)

    return () => {
      subscription.unsubscribe()
    }
  }, [errorParam, errorDescription, code, portalContext, router, handleAuthenticatedUser])

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
