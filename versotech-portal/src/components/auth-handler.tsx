'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export function AuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      console.log('[AuthHandler] Mounted with params:', { code: code?.substring(0, 8) + '...', error })

      if (error) {
        console.error('[auth] OAuth callback error:', error)
        router.push('/versoholdings/login?error=auth_failed')
        return
      }

      if (code && !isProcessing) {
        setIsProcessing(true)
        console.log('[auth] Processing auth code:', code)

        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError || !data?.user) {
            console.error('[auth] Failed to exchange code for session:', exchangeError)
            router.push('/versoholdings/login?error=auth_failed')
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

          if (profile && ['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
            router.push('/versotech/staff')
          } else {
            router.push('/versoholdings/dashboard')
          }
        } catch (err) {
          console.error('[auth] Unexpected error in auth callback:', err)
          router.push('/versoholdings/login?error=auth_failed')
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