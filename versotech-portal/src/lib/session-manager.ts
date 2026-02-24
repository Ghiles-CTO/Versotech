'use client'

/**
 * Simplified Session Manager
 * 
 * Provides basic session management utilities without forcing re-authentication.
 * Supabase handles session persistence and expiration automatically.
 */

const AUTH_KEY_HINTS = ['supabase', 'sb-', 'auth', 'supabase.auth.token']
const PERSONA_STORAGE_PREFIX = 'verso_active_persona'
const PERSONA_COOKIE_NAMES = [
  'verso_active_persona_type',
  'verso_active_persona_id',
  'verso_active_tour_persona',
]

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
   * Clear all auth-related cookies
   * Cookies need to be cleared with exact path and domain to work properly
   */
  private clearAuthCookies(): void {
    if (typeof document === 'undefined') {
      return
    }

    // Get all cookies
    const cookies = document.cookie.split(';')
    const authCookieNames: string[] = []

    // Find all auth-related cookies
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim()
      if (AUTH_KEY_HINTS.some(hint => cookieName.includes(hint))) {
        authCookieNames.push(cookieName)
      }
    })

    // Clear each auth cookie with multiple path/domain combinations
    authCookieNames.forEach(name => {
      // Try various path combinations
      const paths = ['/', '/versoholdings', '/versotech', '/versotech_main']
      const domains = [window.location.hostname, `.${window.location.hostname}`, '']

      paths.forEach(path => {
        domains.forEach(domain => {
          const domainStr = domain ? `domain=${domain};` : ''
          document.cookie = `${name}=; ${domainStr}path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`
        })
      })
    })

    console.info('[auth-session] Cleared auth cookies:', authCookieNames)
  }

  private clearPersonaState(): void {
    if (typeof window === 'undefined') {
      return
    }

    const clearScopedPersonaKeys = (storage: Storage) => {
      Object.keys(storage)
        .filter((key) => key === PERSONA_STORAGE_PREFIX || key.startsWith(`${PERSONA_STORAGE_PREFIX}:`))
        .forEach((key) => storage.removeItem(key))
    }

    clearScopedPersonaKeys(window.localStorage)
    clearScopedPersonaKeys(window.sessionStorage)

    const paths = ['/', '/versoholdings', '/versotech', '/versotech_main']
    const domains = [window.location.hostname, `.${window.location.hostname}`, '']

    PERSONA_COOKIE_NAMES.forEach((name) => {
      paths.forEach((path) => {
        domains.forEach((domain) => {
          const domainStr = domain ? `domain=${domain};` : ''
          document.cookie = `${name}=; ${domainStr}path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`
        })
      })
    })

    console.info('[auth-session] Cleared persisted persona state')
  }

  /**
   * Clear all auth data - localStorage, sessionStorage, and cookies
   * This is the most comprehensive cleanup and should be used before re-authentication
   */
  clearAllAuthData(): void {
    if (typeof window === 'undefined') {
      return
    }

    console.info('[auth-session] Clearing ALL auth data (storage + cookies)')

    // Clear storage
    removeAuthKeys(window.localStorage)
    removeAuthKeys(window.sessionStorage)

    // Clear cookies
    this.clearAuthCookies()
    this.clearPersonaState()
  }

  /**
   * Force sign out by clearing all auth-related storage
   * Used during logout to ensure clean state
   */
  forceSignOut(): void {
    if (typeof window === 'undefined') {
      return
    }

    console.info('[auth-session] Force sign out - clearing all auth state')

    // Clear all local auth data
    this.clearAllAuthData()

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
      window.location.href = '/versotech_main/login?error=signed_out'
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
