// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sessionManager } from '@/lib/session-manager'

const LAST_ACTIVITY_KEY = 'verso.session.lastActivityAt'
const LOGOUT_EVENT_KEY = 'verso.session.logout'

const createStorageMock = (): Storage => {
  const store = new Map<string, string>()
  const reservedKeys = new Set(['length', 'clear', 'getItem', 'key', 'removeItem', 'setItem'])

  const storage = {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
      syncEnumerableKeys()
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
      syncEnumerableKeys()
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
      syncEnumerableKeys()
    },
  } as Storage & Record<string, string>

  const syncEnumerableKeys = () => {
    Object.keys(storage).forEach((key) => {
      if (!reservedKeys.has(key)) {
        delete storage[key]
      }
    })

    store.forEach((value, key) => {
      storage[key] = value
    })
  }

  return storage
}

const dispatchStorageEvent = (key: string, newValue: string | null) => {
  const event = new StorageEvent('storage', { key, newValue })
  window.dispatchEvent(event)
}

describe('sessionManager idle timeout', () => {
  const fetchMock = vi.fn(() => Promise.resolve({ ok: true }))
  const replaceMock = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-12T09:00:00.000Z'))
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(window.location, 'replace').mockImplementation(replaceMock)

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createStorageMock(),
    })

    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: createStorageMock(),
    })

    fetchMock.mockClear()
    replaceMock.mockClear()
    document.cookie = ''

    sessionManager.init()
    sessionManager.setRoute('/versotech_main/dashboard')
  })

  afterEach(() => {
    sessionManager.destroy()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('shows the final 10-second countdown and logs out at 5 minutes', async () => {
    vi.advanceTimersByTime(4 * 60 * 1000 + 50 * 1000)
    expect(sessionManager.getIdleState()).toEqual({
      countdownSeconds: 10,
      isTracking: true,
    })

    vi.advanceTimersByTime(10 * 1000)
    await Promise.resolve()

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', {
      credentials: 'include',
      keepalive: true,
      method: 'POST',
    })
    expect(replaceMock).toHaveBeenCalledWith('/versotech_main/login?error=idle_timeout')

    const logoutPayload = JSON.parse(window.localStorage.getItem(LOGOUT_EVENT_KEY) ?? '{}')
    expect(logoutPayload.reason).toBe('idle_timeout')
  })

  it('resets the timer when real user activity happens during countdown', () => {
    vi.advanceTimersByTime(4 * 60 * 1000 + 55 * 1000)
    expect(sessionManager.getIdleState().countdownSeconds).toBe(5)

    window.dispatchEvent(new Event('mousemove'))
    expect(sessionManager.getIdleState()).toEqual({
      countdownSeconds: null,
      isTracking: true,
    })

    vi.advanceTimersByTime(9 * 1000)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(sessionManager.getIdleState().countdownSeconds).toBeNull()
  })

  it('ignores idle tracking on public routes', () => {
    sessionManager.setRoute('/versotech_main/login')
    expect(sessionManager.getIdleState()).toEqual({
      countdownSeconds: null,
      isTracking: false,
    })

    vi.advanceTimersByTime(6 * 60 * 1000)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('resets countdown when another tab reports activity', () => {
    vi.advanceTimersByTime(4 * 60 * 1000 + 55 * 1000)
    expect(sessionManager.getIdleState().countdownSeconds).toBe(5)

    const activityTimestamp = String(Date.now())
    window.localStorage.setItem(LAST_ACTIVITY_KEY, activityTimestamp)
    dispatchStorageEvent(LAST_ACTIVITY_KEY, activityTimestamp)

    expect(sessionManager.getIdleState()).toEqual({
      countdownSeconds: null,
      isTracking: true,
    })

    vi.advanceTimersByTime(9 * 1000)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('refreshes the idle timestamp after login even before tracking restarts', () => {
    sessionManager.setRoute('/versotech_main/login')
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now() - 10 * 60 * 1000))

    sessionManager.markAuthenticated()

    expect(window.localStorage.getItem(LAST_ACTIVITY_KEY)).toBe(String(Date.now()))
    expect(sessionManager.getIdleState()).toEqual({
      countdownSeconds: null,
      isTracking: false,
    })
  })
})
