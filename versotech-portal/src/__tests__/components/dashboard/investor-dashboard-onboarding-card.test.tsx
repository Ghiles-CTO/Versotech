import { describe, expect, it } from 'vitest'

import {
  resolveInvestorDashboardOnboardingStage,
  type DashboardOnboardingState,
} from '@/components/dashboard/investor-dashboard-onboarding-card'

function createState(
  overrides: Partial<DashboardOnboardingState> = {}
): DashboardOnboardingState {
  return {
    investorId: 'inv-1',
    investorType: 'entity',
    accountApprovalStatus: 'pending_onboarding',
    onboardingStatus: 'pending',
    isReady: false,
    hasPendingApproval: false,
    canSubmitAccountApproval: false,
    missingItems: [],
    latestRequestInfo: null,
    ...overrides,
  }
}

describe('resolveInvestorDashboardOnboardingStage', () => {
  it('returns in_progress while onboarding requirements are still outstanding', () => {
    const stage = resolveInvestorDashboardOnboardingStage(
      createState({
        missingItems: [
          {
            scope: 'entity',
            name: 'Investor entity',
            missingItems: ['Passport', 'Proof of address'],
          },
        ],
      })
    )

    expect(stage).toBe('in_progress')
  })

  it('returns ready_to_submit when onboarding is complete but not yet submitted', () => {
    const stage = resolveInvestorDashboardOnboardingStage(
      createState({
        isReady: true,
        canSubmitAccountApproval: true,
      })
    )

    expect(stage).toBe('ready_to_submit')
  })

  it('returns under_review when account approval is already pending', () => {
    const stage = resolveInvestorDashboardOnboardingStage(
      createState({
        accountApprovalStatus: 'pending_approval',
        hasPendingApproval: true,
        isReady: true,
      })
    )

    expect(stage).toBe('under_review')
  })

  it('returns action_required when review requested more information', () => {
    const stage = resolveInvestorDashboardOnboardingStage(
      createState({
        latestRequestInfo: {
          details: 'Please upload an updated proof of address.',
          reason: 'Missing document',
          requestedAt: '2026-03-09T10:00:00.000Z',
        },
      })
    )

    expect(stage).toBe('action_required')
  })
})
