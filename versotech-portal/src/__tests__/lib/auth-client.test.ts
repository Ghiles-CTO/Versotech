// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createClientMock, resetClientMock, sessionManagerMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  resetClientMock: vi.fn(),
  sessionManagerMock: {
    clearAllAuthData: vi.fn(),
    markAuthenticated: vi.fn(),
  },
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: createClientMock,
  resetClient: resetClientMock,
}))

vi.mock('@/lib/session-manager', () => ({
  sessionManager: sessionManagerMock,
}))

import { signIn } from '@/lib/auth-client'

const ONBOARDING_MODAL_DISMISSED_KEY = 'verso_onboarding_action_dismissed'

describe('auth-client signIn', () => {
  const fetchMock = vi.fn()
  const supabaseMock = {
    auth: {
      setSession: vi.fn(),
      getSession: vi.fn(),
    },
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    window.sessionStorage.clear()

    fetchMock.mockReset()
    createClientMock.mockReset()
    resetClientMock.mockReset()
    sessionManagerMock.clearAllAuthData.mockReset()
    sessionManagerMock.markAuthenticated.mockReset()
    supabaseMock.auth.setSession.mockReset()
    supabaseMock.auth.getSession.mockReset()

    createClientMock.mockReturnValue(supabaseMock)
    supabaseMock.auth.setSession.mockResolvedValue({
      data: { user: { email: 'user@example.com' } },
      error: null,
    })
    supabaseMock.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'access-token' } },
    })
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        redirect: '/versotech_main/dashboard',
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expires_at: 123456,
        },
        user: {
          id: 'user-id',
          email: 'user@example.com',
          role: 'investor',
          displayName: 'User',
        },
      }),
    })
  })

  it('clears the onboarding modal dismissal flag on successful login', async () => {
    window.sessionStorage.setItem(ONBOARDING_MODAL_DISMISSED_KEY, '1')

    await signIn('user@example.com', 'password123', 'investor')

    expect(window.sessionStorage.getItem(ONBOARDING_MODAL_DISMISSED_KEY)).toBeNull()
    expect(sessionManagerMock.clearAllAuthData).toHaveBeenCalledTimes(1)
    expect(sessionManagerMock.markAuthenticated).toHaveBeenCalledTimes(1)
  })
})
