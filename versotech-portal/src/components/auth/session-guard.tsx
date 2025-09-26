'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SessionGuardProps {
  children: React.ReactNode
}

/**
 * Client-side session guard that forces re-authentication
 * if this is a new browser session
 */
export function SessionGuard({ children }: SessionGuardProps) {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      // Check if this is a new browser session
      const sessionMarker = sessionStorage.getItem('verso-session-id')

      if (!sessionMarker) {
        console.log('🚪 New browser session detected - forcing re-authentication')

        // Clear any auth tokens
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key)
          }
        })

        // Sign out from Supabase
        const supabase = createClient()
        await supabase.auth.signOut()

        // Redirect to login
        router.push('/versoholdings/login?error=session_expired')
        return
      }

      // Validate the existing session
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        console.log('❌ Session validation failed:', error?.message)

        // Clear session marker since auth failed
        sessionStorage.removeItem('verso-session-id')

        // Redirect to login
        router.push('/versoholdings/login?error=auth_required')
        return
      }

      console.log('✅ Session validated for user:', user.email)
    }

    checkSession()
  }, [router])

  return <>{children}</>
}

export default SessionGuard