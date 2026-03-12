// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const { sessionManagerMock } = vi.hoisted(() => ({
  sessionManagerMock: {
  getIdleState: vi.fn(),
  subscribe: vi.fn(),
  init: vi.fn(),
  setRoute: vi.fn(),
  destroy: vi.fn(),
  forceSignOut: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/versotech_main/dashboard',
}))

vi.mock('@/lib/session-manager', () => ({
  sessionManager: sessionManagerMock,
}))

import { AuthInit } from '@/app/auth-init'

describe('AuthInit countdown actions', () => {
  beforeEach(() => {
    sessionManagerMock.getIdleState.mockReturnValue({
      countdownSeconds: 10,
      isTracking: true,
    })
    sessionManagerMock.subscribe.mockImplementation((listener: (state: { countdownSeconds: number | null; isTracking: boolean }) => void) => {
      listener({
        countdownSeconds: 10,
        isTracking: true,
      })
      return vi.fn()
    })
    sessionManagerMock.init.mockClear()
    sessionManagerMock.setRoute.mockClear()
    sessionManagerMock.destroy.mockClear()
    sessionManagerMock.forceSignOut.mockClear()
  })

  it('renders session action buttons during countdown', async () => {
    render(<AuthInit />)

    expect(await screen.findByText('Logging out in 10s')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue Session' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close Session' })).toBeInTheDocument()
  })

  it('uses the idle timeout sign-out flow when closing the session', async () => {
    const replaceMock = vi.spyOn(window.location, 'replace').mockImplementation(vi.fn())

    render(<AuthInit />)

    fireEvent.click(await screen.findByRole('button', { name: 'Close Session' }))

    expect(sessionManagerMock.forceSignOut).toHaveBeenCalledWith('idle_timeout')
    expect(replaceMock).toHaveBeenCalledWith('/versotech_main/login?error=idle_timeout')
  })

  it('treats continue as activity', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    render(<AuthInit />)

    fireEvent.click(await screen.findByRole('button', { name: 'Continue Session' }))

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled()
    })
  })
})
