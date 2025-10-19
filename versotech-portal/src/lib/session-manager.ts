'use client'

/**
 * Simplified Session Manager
 * 
 * Provides basic session management utilities without forcing re-authentication.
 * Supabase handles session persistence and expiration automatically.
 */

const AUTH_KEY_HINTS = ['supabase', 'sb-', 'auth']

const removeAuthKeys = (storage: Storage) => {
  const keysToRemove = new Set<string>()

  AUTH_KEY_HINTS.forEach((hint) => {
    Object.keys(storage)
      .filter((key) => key.includes(hint))
      .forEach((key) => keysToRemove.add(key))
  })

  keysToRemove.forEach((key) => storage.removeItem(key))
}

class SessionManager {
  private static instance: SessionManager
  private isInitialized = false

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }

    return SessionManager.instance
  }

  /**
   * Initialize session manager
   * Sets up storage event listeners to handle cross-tab logout
   */
  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    try {
      this.isInitialized = true

      // Listen for storage changes in other tabs (cross-tab logout)
      window.addEventListener('storage', this.handleStorageChange)

      console.info('[auth-session] Session manager initialized')
    } catch (error) {
      console.error('[auth-session] Failed to initialize session manager:', error)
      this.isInitialized = false
    }
  }

  /**
   * Force sign out by clearing all auth-related storage
   * Used during logout to ensure clean state
   */
  forceSignOut(): void {
    if (typeof window === 'undefined') {
      return
    }

    console.info('[auth-session] Clearing local auth state')

    removeAuthKeys(window.localStorage)
    removeAuthKeys(window.sessionStorage)

    // Call logout API to clear server-side session
    void fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch((error) => {
      console.error('[auth-session] Failed to revoke server session', error)
    })
  }

  /**
   * Handle storage changes from other tabs
   * If auth keys are removed in another tab, redirect to login
   */
  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key && AUTH_KEY_HINTS.some((hint) => event.key?.includes(hint)) && event.newValue === null) {
      console.info('[auth-session] Auth state cleared in another tab, redirecting to login')
      window.location.href = '/versoholdings/login?error=signed_out'
    }
  }

  /**
   * Mark session as authenticated
   * This is called after successful login to update session state
   */
  markAuthenticated(): void {
    if (typeof window === 'undefined') {
      return
    }

    console.info('[auth-session] Session marked as authenticated')
  }

  /**
   * Get debug information about current session state
   * Useful for troubleshooting auth issues
   */
  getDebugInfo(): Record<string, unknown> {
    if (typeof window === 'undefined') {
      return { error: 'Not in browser' }
    }

    return {
      localStorageKeys: Object.keys(localStorage).filter((key) =>
        AUTH_KEY_HINTS.some((hint) => key.includes(hint))
      ),
      sessionStorageKeys: Object.keys(sessionStorage).filter((key) =>
        AUTH_KEY_HINTS.some((hint) => key.includes(hint))
      ),
    }
  }
}

export const sessionManager = SessionManager.getInstance()
