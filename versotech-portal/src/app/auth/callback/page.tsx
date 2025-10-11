'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')
      const portalContext = searchParams.get('portal') ?? 'investor'

      if (errorParam) {
        console.error('[auth-callback] Error in URL:', errorParam)
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        setTimeout(() => {
          const loginUrl = portalContext === 'staff' ? '/versotech/login' : '/versoholdings/login'
          router.push(`${loginUrl}?error=auth_failed`)
        }, 2000)
        return
      }

      if (!code) {
        console.error('[auth-callback] No code provided')
        setStatus('error')
        setMessage('Invalid verification link.')
        setTimeout(() => {
          const loginUrl = portalContext === 'staff' ? '/versotech/login' : '/versoholdings/login'
          router.push(`${loginUrl}?error=auth_failed`)
        }, 2000)
        return
      }

      try {
        console.log('[auth-callback] Exchanging code for session for portal:', portalContext)
        
        // Exchange the code for a session (this handles PKCE automatically)
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

        if (!data?.user) {
          console.error('[auth-callback] No user data after exchange')
          setStatus('error')
          setMessage('Email verification failed. Please try signing up again.')
          setTimeout(() => {
            const loginUrl = portalContext === 'staff' ? '/versotech/login' : '/versoholdings/login'
            router.push(`${loginUrl}?error=auth_failed`)
          }, 3000)
          return
        }

        console.log('[auth-callback] Email verified successfully:', data.user.email)
        console.log('[auth-callback] User metadata:', data.user.user_metadata)

        // Check if profile exists (should be created by trigger)
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, display_name')
          .eq('id', data.user.id)
          .maybeSingle()

        // If profile doesn't exist (trigger failed), create it via API
        if (!profile) {
          console.log('[auth-callback] Profile not found, creating it...')
          
          const metadataRole = data.user.user_metadata?.role || 'investor'
          const metadataDisplayName = data.user.user_metadata?.display_name || 
                                       data.user.user_metadata?.full_name ||
                                       data.user.email?.split('@')[0] ||
                                       'User'

          const createResponse = await fetch('/api/auth/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
              displayName: metadataDisplayName,
              role: metadataRole
            })
          })

          if (!createResponse.ok) {
            setStatus('error')
            setMessage('Failed to create profile. Please contact support.')
            return
          }

          profile = { role: metadataRole, display_name: metadataDisplayName }
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
    }

    handleCallback()
  }, [searchParams, router])

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

