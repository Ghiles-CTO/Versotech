'use client'

/**
 * Simplified Session Manager
 * 
 * Provides basic session management utilities without forcing re-authentication.
 * Supabase handles session persistence and expiration automatically.
 */

const AUTH_KEY_HINTS = ['supabase', 'sb-', 'auth', 'supabase.auth.token']
const IDLE_TIMEOUT_MS = 5 * 60 * 1000
const IDLE_COUNTDOWN_MS = 10 * 1000
const ACTIVITY_WRITE_THROTTLE_MS = 1000
const LAST_ACTIVITY_KEY = 'verso.session.lastActivityAt'
const LOGOUT_EVENT_KEY = 'verso.session.logout'
const ONBOARDING_MODAL_DISMISSED_KEY = 'verso_onboarding_action_dismissed'
const IDLE_DISABLED_EXACT_ROUTES = new Set([
  '/',
  '/versoholdings/login',
  '/versotech/login',
  '/versotech_main/login',
  '/versotech_main/set-password',
  '/versotech_main/reset-password',
  '/logout',
])
const IDLE_DISABLED_ROUTE_PREFIXES = [
  '/auth/callback',
  '/invitation/accept',
  '/sign/',
]
const PERSONA_STORAGE_PREFIX = 'verso_active_persona'
const PERSONA_COOKIE_NAMES = [
  'verso_active_persona_type',
  'verso_active_persona_id',
  'verso_active_tour_persona',
]

type LogoutReason = 'signed_out' | 'idle_timeout'

export interface SessionManagerState {
  countdownSeconds: number | null
  isTracking: boolean
}

type SessionManagerListener = (state: SessionManagerState) => void

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
  private countdownIntervalId: number | null = null
  private currentPathname = ''
  private idleLogoutInProgress = false
  private isActivityListenersAttached = false
  private lastActivityWriteAt = 0
  private listeners = new Set<SessionManagerListener>()
  private state: SessionManagerState = {
    countdownSeconds: null,
    isTracking: false,
  }

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

  destroy(): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return
    }

    this.stopIdleTracking()
    window.removeEventListener('storage', this.handleStorageChange)
    this.listeners.clear()
    this.isInitialized = false
    this.currentPathname = ''
    this.idleLogoutInProgress = false
    this.lastActivityWriteAt = 0
  }

  subscribe(listener: SessionManagerListener): () => void {
    this.listeners.add(listener)
    listener(this.getIdleState())

    return () => {
      this.listeners.delete(listener)
    }
  }

  getIdleState(): SessionManagerState {
    return { ...this.state }
  }

  setRoute(pathname: string): void {
    this.currentPathname = pathname

    if (!this.shouldTrackRoute(pathname)) {
      this.stopIdleTracking()
      return
    }

    this.startIdleTracking()
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
  forceSignOut(reason: LogoutReason = 'signed_out'): void {
    if (typeof window === 'undefined') {
      return
    }

    console.info('[auth-session] Force sign out - clearing all auth state')
    this.idleLogoutInProgress = true
    this.publishLogoutEvent(reason)
    this.stopIdleTracking({ preserveLogoutInProgress: true })

    // Clear all local auth data
    this.clearAllAuthData()
    window.localStorage.removeItem(LAST_ACTIVITY_KEY)
    if (reason === 'idle_timeout') {
      window.sessionStorage.removeItem(ONBOARDING_MODAL_DISMISSED_KEY)
    }

    // Call logout API to clear server-side session
    void fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
    }).catch((error) => {
      console.error('[auth-session] Failed to revoke server session', error)
    })
  }

  /**
   * Handle storage changes from other tabs
   * If auth keys are removed in another tab, redirect to login
   */
  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key === LOGOUT_EVENT_KEY && event.newValue) {
      const reason = this.parseLogoutReason(event.newValue)
      this.stopIdleTracking({ preserveLogoutInProgress: true })
      window.location.replace(this.getLoginRedirect(reason))
      return
    }

    if (event.key === LAST_ACTIVITY_KEY && this.state.isTracking) {
      this.evaluateIdleState()
      return
    }

    if (event.key && AUTH_KEY_HINTS.some((hint) => event.key?.includes(hint)) && event.newValue === null) {
      console.info('[auth-session] Auth state cleared in another tab, redirecting to login')
      this.stopIdleTracking({ preserveLogoutInProgress: true })
      window.location.replace(this.getLoginRedirect('signed_out'))
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

    this.idleLogoutInProgress = false
    const now = Date.now()
    this.lastActivityWriteAt = now
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(now))

    if (this.shouldTrackRoute(this.currentPathname)) {
      this.updateState({
        countdownSeconds: null,
        isTracking: true,
      })
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
      currentPathname: this.currentPathname,
      idleCountdownSeconds: this.state.countdownSeconds,
      idleTrackingEnabled: this.state.isTracking,
      localStorageKeys: Object.keys(localStorage).filter((key) =>
        AUTH_KEY_HINTS.some((hint) => key.includes(hint))
      ),
      sessionStorageKeys: Object.keys(sessionStorage).filter((key) =>
        AUTH_KEY_HINTS.some((hint) => key.includes(hint))
      ),
    }
  }

  private shouldTrackRoute(pathname: string): boolean {
    if (!pathname) {
      return false
    }

    if (IDLE_DISABLED_EXACT_ROUTES.has(pathname)) {
      return false
    }

    return !IDLE_DISABLED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  }

  private startIdleTracking(): void {
    if (typeof window === 'undefined') {
      return
    }

    if (!this.state.isTracking) {
      this.updateState({
        countdownSeconds: null,
        isTracking: true,
      })
    }

    this.attachActivityListeners()

    const lastActivity = this.getStoredLastActivity()
    if (lastActivity === null) {
      this.persistActivity(Date.now(), true)
    }

    if (this.countdownIntervalId === null) {
      this.countdownIntervalId = window.setInterval(() => {
        this.evaluateIdleState()
      }, 1000)
    }

    this.evaluateIdleState()
  }

  private stopIdleTracking(options?: { preserveLogoutInProgress?: boolean }): void {
    if (typeof window === 'undefined') {
      return
    }

    if (this.countdownIntervalId !== null) {
      window.clearInterval(this.countdownIntervalId)
      this.countdownIntervalId = null
    }

    this.detachActivityListeners()

    this.updateState({
      countdownSeconds: null,
      isTracking: false,
    })

    if (!options?.preserveLogoutInProgress) {
      this.idleLogoutInProgress = false
    }
  }

  private attachActivityListeners(): void {
    if (this.isActivityListenersAttached || typeof window === 'undefined') {
      return
    }

    window.addEventListener('mousemove', this.handlePotentialActivity, { passive: true })
    window.addEventListener('mousedown', this.handlePotentialActivity, { passive: true })
    window.addEventListener('keydown', this.handlePotentialActivity)
    window.addEventListener('touchstart', this.handlePotentialActivity, { passive: true })
    window.addEventListener('scroll', this.handlePotentialActivity, { passive: true })
    window.addEventListener('focus', this.handlePotentialActivity)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    this.isActivityListenersAttached = true
  }

  private detachActivityListeners(): void {
    if (!this.isActivityListenersAttached || typeof window === 'undefined') {
      return
    }

    window.removeEventListener('mousemove', this.handlePotentialActivity)
    window.removeEventListener('mousedown', this.handlePotentialActivity)
    window.removeEventListener('keydown', this.handlePotentialActivity)
    window.removeEventListener('touchstart', this.handlePotentialActivity)
    window.removeEventListener('scroll', this.handlePotentialActivity)
    window.removeEventListener('focus', this.handlePotentialActivity)
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.isActivityListenersAttached = false
  }

  private handlePotentialActivity = (): void => {
    if (!this.state.isTracking || this.idleLogoutInProgress || typeof window === 'undefined') {
      return
    }

    const now = Date.now()
    const lastActivity = this.getStoredLastActivity()

    if (lastActivity !== null && now - lastActivity >= IDLE_TIMEOUT_MS) {
      this.handleIdleTimeout()
      return
    }

    if (now - this.lastActivityWriteAt < ACTIVITY_WRITE_THROTTLE_MS) {
      this.updateState({
        countdownSeconds: null,
        isTracking: true,
      })
      return
    }

    this.persistActivity(now)
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      this.handlePotentialActivity()
    }
  }

  private persistActivity(timestamp: number, force = false): void {
    if (typeof window === 'undefined') {
      return
    }

    if (!force && timestamp - this.lastActivityWriteAt < ACTIVITY_WRITE_THROTTLE_MS) {
      return
    }

    this.lastActivityWriteAt = timestamp
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(timestamp))

    this.updateState({
      countdownSeconds: null,
      isTracking: true,
    })
  }

  private getStoredLastActivity(): number | null {
    if (typeof window === 'undefined') {
      return null
    }

    const rawTimestamp = window.localStorage.getItem(LAST_ACTIVITY_KEY)
    const parsedTimestamp = rawTimestamp ? Number(rawTimestamp) : Number.NaN

    if (!Number.isFinite(parsedTimestamp) || parsedTimestamp <= 0) {
      return null
    }

    return parsedTimestamp
  }

  private evaluateIdleState = (): void => {
    if (!this.state.isTracking || this.idleLogoutInProgress || typeof window === 'undefined') {
      return
    }

    const lastActivity = this.getStoredLastActivity()
    if (lastActivity === null) {
      this.persistActivity(Date.now(), true)
      return
    }

    const now = Date.now()
    const elapsed = now - lastActivity

    if (elapsed >= IDLE_TIMEOUT_MS) {
      this.handleIdleTimeout()
      return
    }

    const remainingMs = IDLE_TIMEOUT_MS - elapsed
    const countdownSeconds = remainingMs <= IDLE_COUNTDOWN_MS
      ? Math.max(1, Math.ceil(remainingMs / 1000))
      : null

    this.updateState({
      countdownSeconds,
      isTracking: true,
    })
  }

  private handleIdleTimeout(): void {
    if (this.idleLogoutInProgress || typeof window === 'undefined') {
      return
    }

    console.info('[auth-session] Idle timeout reached, logging out')
    this.forceSignOut('idle_timeout')
    window.location.replace(this.getLoginRedirect('idle_timeout'))
  }

  private publishLogoutEvent(reason: LogoutReason): void {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(LOGOUT_EVENT_KEY, JSON.stringify({
      at: Date.now(),
      reason,
    }))
  }

  private parseLogoutReason(value: string): LogoutReason {
    try {
      const payload = JSON.parse(value) as { reason?: LogoutReason }
      if (payload.reason === 'idle_timeout') {
        return 'idle_timeout'
      }
    } catch {
      // Ignore malformed logout payloads and fall back to signed_out.
    }

    return 'signed_out'
  }

  private getLoginRedirect(reason: LogoutReason): string {
    if (reason === 'idle_timeout') {
      return '/versotech_main/login?error=idle_timeout'
    }

    return '/versotech_main/login?message=signed_out'
  }

  private updateState(nextState: SessionManagerState): void {
    if (
      this.state.countdownSeconds === nextState.countdownSeconds &&
      this.state.isTracking === nextState.isTracking
    ) {
      return
    }

    this.state = nextState
    this.listeners.forEach((listener) => listener(this.getIdleState()))
  }
}

export const sessionManager = SessionManager.getInstance()
