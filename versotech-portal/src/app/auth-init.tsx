'use client'

import { useEffect } from 'react'
import { sessionManager } from '@/lib/session-manager'

/**
 * Authentication initializer component
 * Should be included in the root layout to initialize session management
 */
export function AuthInit() {
  useEffect(() => {
    // Initialize aggressive session management
    sessionManager.init()

    // Debug info
    if (process.env.NODE_ENV === 'development') {
      console.log('[auth-session] Debug info:', sessionManager.getDebugInfo())
    }
  }, [])

  return null // This component renders nothing
}
