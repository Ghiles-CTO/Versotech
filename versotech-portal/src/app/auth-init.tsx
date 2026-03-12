'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sessionManager } from '@/lib/session-manager'

/**
 * Authentication initializer component
 * Should be included in the root layout to initialize session management
 */
export function AuthInit() {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [idleState, setIdleState] = useState(sessionManager.getIdleState())

  const handleContinueSession = () => {
    if (typeof window === 'undefined') {
      return
    }

    window.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      clientX: 1,
      clientY: 1,
    }))
  }

  const handleCloseSession = () => {
    if (typeof window === 'undefined') {
      return
    }

    sessionManager.forceSignOut('idle_timeout')
    window.location.replace('/versotech_main/login?error=idle_timeout')
  }

  useEffect(() => {
    setIsClient(true)
    
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      const unsubscribe = sessionManager.subscribe(setIdleState)

      try {
        // Initialize aggressive session management
        sessionManager.init()

        // Debug info
        if (process.env.NODE_ENV === 'development') {
          console.log('[auth-session] Debug info:', sessionManager.getDebugInfo())
        }
      } catch (error) {
        console.error('[auth-session] Initialization error:', error)
      }

      return () => {
        unsubscribe()
        sessionManager.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (!isClient) {
      return
    }

    sessionManager.setRoute(pathname ?? '')
  }, [isClient, pathname])

  // Prevent hydration mismatch by not rendering anything until client-side
  if (!isClient) {
    return null
  }

  if (!idleState.isTracking || idleState.countdownSeconds === null) {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120]">
      <div className="pointer-events-auto rounded-2xl border border-amber-400/20 bg-zinc-950/95 px-4 py-3 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
          <Clock3 className="h-5 w-5" />
        </div>
        <div className="min-w-[170px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Session timeout
          </p>
          <p className="text-sm font-medium text-white">
            Logging out in {idleState.countdownSeconds}s
          </p>
        </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleContinueSession}
            className="border border-white/10 bg-white/8 text-white hover:bg-white/14"
          >
            Continue Session
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCloseSession}
            className="bg-amber-400 text-zinc-950 hover:bg-amber-300"
          >
            Close Session
          </Button>
        </div>
      </div>
    </div>
  )
}
