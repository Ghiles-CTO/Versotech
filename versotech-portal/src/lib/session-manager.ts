'use client'

const SESSION_MARKER_KEY = 'verso-session-id'
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

  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    this.isInitialized = true

    if (!sessionStorage.getItem(SESSION_MARKER_KEY)) {
      console.info('[auth-session] Detected new browser session – resetting cached credentials')
      this.forceSignOut()
      sessionStorage.setItem(SESSION_MARKER_KEY, Date.now().toString())
    }

    window.addEventListener('storage', this.handleStorageChange)
    window.addEventListener('beforeunload', this.handleBrowserClose)

    console.info('[auth-session] Session manager initialised')
  }

  forceSignOut(): void {
    if (typeof window === 'undefined') {
      return
    }

    console.info('[auth-session] Forcing complete sign out')

    removeAuthKeys(window.localStorage)
    removeAuthKeys(window.sessionStorage)

    void fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch((error) => {
      console.error('[auth-session] Failed to revoke server session during forceSignOut', error)
    })

    console.info('[auth-session] Local auth caches cleared')
  }

  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key && AUTH_KEY_HINTS.some((hint) => event.key.includes(hint)) && event.newValue === null) {
      window.location.href = '/versoholdings/login?error=signed_out'
    }
  }

  private handleBrowserClose = (): void => {
    console.info('[auth-session] Browser session ending')
  }

  shouldForceAuth(): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    if (!sessionStorage.getItem(SESSION_MARKER_KEY)) {
      return true
    }

    const hasAuthTokens = [...Object.keys(localStorage), ...Object.keys(sessionStorage)].some((key) =>
      AUTH_KEY_HINTS.some((hint) => key.includes(hint))
    )

    if (hasAuthTokens && !sessionStorage.getItem(SESSION_MARKER_KEY)) {
      return true
    }

    return false
  }

  markAuthenticated(): void {
    if (typeof window === 'undefined') {
      return
    }

    sessionStorage.setItem(SESSION_MARKER_KEY, Date.now().toString())
    console.info('[auth-session] Session marked as authenticated')
  }

  getDebugInfo(): Record<string, unknown> {
    if (typeof window === 'undefined') {
      return { error: 'Not in browser' }
    }

    return {
      sessionKey: !!sessionStorage.getItem(SESSION_MARKER_KEY),
      localStorageKeys: Object.keys(localStorage).filter((key) =>
        AUTH_KEY_HINTS.some((hint) => key.includes(hint))
      ),
      sessionStorageKeys: Object.keys(sessionStorage).filter((key) =>
        AUTH_KEY_HINTS.some((hint) => key.includes(hint))
      ),
      shouldForceAuth: this.shouldForceAuth(),
    }
  }
}

export const sessionManager = SessionManager.getInstance()
