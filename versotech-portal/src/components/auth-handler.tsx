'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      // CRITICAL: Detect hash fragments from implicit flow (invite magic links)
      // Supabase inviteUserByEmail() uses implicit flow which passes tokens in hash fragment
      // If we detect hash fragment with access_token, redirect to /auth/callback to process it
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash
        if (hash.includes('access_token') || hash.includes('type=invite')) {
          console.log('[AuthHandler] Detected hash fragment from implicit flow, redirecting to callback...')
          // Redirect to /auth/callback with the hash fragment preserved
          window.location.href = '/auth/callback' + hash
          return
        }
      }

      const code = searchParams.get('code')
      const error = searchParams.get('error')

      console.log('[AuthHandler] Mounted with params:', { code: code?.substring(0, 8) + '...', error })

      if (error) {
        console.error('[auth] OAuth callback error:', error)
        router.push('/versotech_main/login?error=auth_failed')
        return
      }

      if (code && !isProcessing) {
        setIsProcessing(true)
        console.log('[auth] Processing auth code:', code)

        try {
          const supabase = createClient()
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError || !data?.user) {
            console.error('[auth] Failed to exchange code for session:', exchangeError)
            router.push('/versotech_main/login?error=auth_failed')
            return
          }

          const user = data.user
          console.log('[auth] User confirmed successfully:', user.email)

          // Check if user has a profile to determine redirect
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          if (profile) {
            router.push('/versotech_main/dashboard')
          } else {
            router.push('/versotech_main/login?error=profile_not_found')
          }
        } catch (err) {
          console.error('[auth] Unexpected error in auth callback:', err)
          router.push('/versotech_main/login?error=auth_failed')
        } finally {
          setIsProcessing(false)
        }
      }
    }

    handleAuthCallback()
  }, [searchParams, router, isProcessing])

  // Show a loading indicator when processing auth code
  if (searchParams.get('code') && isProcessing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-center text-gray-600">Confirming your email...</p>
        </div>
      </div>
    )
  }

  return null
}
