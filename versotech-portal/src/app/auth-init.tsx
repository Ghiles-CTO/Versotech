'use client'

import { useEffect, useState } from 'react'
import { sessionManager } from '@/lib/session-manager'

/**
 * Authentication initializer component
 * Should be included in the root layout to initialize session management
 */
export function AuthInit() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Only initialize on client side
    if (typeof window !== 'undefined') {
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
    }
  }, [])

  // Prevent hydration mismatch by not rendering anything until client-side
  if (!isClient) {
    return null
  }

  return null // This component renders nothing
}
