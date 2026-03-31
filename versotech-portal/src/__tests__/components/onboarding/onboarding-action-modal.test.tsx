// @vitest-environment happy-dom

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { OnboardingActionModal } from '@/components/onboarding/onboarding-action-modal'
import type { DashboardOnboardingState } from '@/components/dashboard/investor-dashboard-onboarding-card'
import type { Persona } from '@/contexts/persona-context'

const {
  pushMock,
  refreshMock,
  usePersonaMock,
  useThemeMock,
  toastSuccessMock,
  toastErrorMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  usePersonaMock: vi.fn(),
  useThemeMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}))

vi.mock('@/contexts/persona-context', () => ({
  usePersona: () => usePersonaMock(),
}))

vi.mock('@/components/theme-provider', () => ({
  useTheme: () => useThemeMock(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

function createPersona(personaType: Persona['persona_type']): Persona {
  return {
    persona_type: personaType,
    entity_id: `${personaType}-entity`,
    entity_name: `${personaType} entity`,
    entity_logo_url: null,
    role_in_entity: 'member',
    is_primary: true,
    can_sign: false,
    can_execute_for_clients: false,
  }
}

function createOnboardingState(
  overrides: Partial<DashboardOnboardingState> = {}
): DashboardOnboardingState {
  return {
    investorId: 'inv-1',
    personaType: 'investor',
    investorType: 'entity',
    accountApprovalStatus: 'pending_onboarding',
    onboardingStatus: 'pending',
    isReady: false,
    hasPendingApproval: false,
    canSubmitAccountApproval: false,
    missingItems: [
      {
        scope: 'entity',
        name: 'Investor entity',
        missingItems: ['Entity Information'],
      },
    ],
    latestRequestInfo: null,
    ...overrides,
  }
}

describe('OnboardingActionModal persona gating', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    useThemeMock.mockReturnValue({ theme: 'light' })
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('does not fetch onboarding data when the active persona is ceo', async () => {
    const fetchMock = vi.fn()
    global.fetch = fetchMock as typeof fetch

    usePersonaMock.mockReturnValue({
      activePersona: createPersona('ceo'),
      personas: [createPersona('ceo'), createPersona('investor'), createPersona('introducer')],
      isLoading: false,
    })

    render(<OnboardingActionModal />)

    await new Promise((resolve) => setTimeout(resolve, 25))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches onboarding data when the active persona is investor', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => createOnboardingState(),
    })
    global.fetch = fetchMock as typeof fetch

    usePersonaMock.mockReturnValue({
      activePersona: createPersona('investor'),
      personas: [createPersona('ceo'), createPersona('investor')],
      isLoading: false,
    })

    render(<OnboardingActionModal />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/investors/me/dashboard-onboarding', {
        credentials: 'same-origin',
      })
    })
  })
})
