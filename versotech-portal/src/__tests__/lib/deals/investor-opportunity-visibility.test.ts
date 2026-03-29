import { describe, expect, it } from 'vitest'
import {
  filterInvestorVisibleSubmissions,
  filterInvestorVisibleCycles,
  getInvestorVisiblePackGeneratedAt,
  isInvestorVisibleSubmissionStatus,
  isInvestorSubscriptionPackDispatched,
  isRetryableRejectedPrimaryCycle,
  normalizeRejectedJourneyCycle,
} from '@/lib/deals/investor-opportunity-visibility'

function createCycle(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cycle-1',
    sequence_number: 1,
    status: 'viewed',
    dispatched_at: '2026-03-20T10:00:00.000Z',
    viewed_at: '2026-03-20T10:05:00.000Z',
    interest_confirmed_at: null,
    submission_pending_at: null,
    approved_at: null,
    pack_generated_at: null,
    pack_sent_at: null,
    signed_at: null,
    funded_at: null,
    activated_at: null,
    ...overrides,
  }
}

describe('investor opportunity visibility', () => {
  it('normalizes a rejected first-request journey back to viewed', () => {
    const rejectedCycle = createCycle({
      status: 'rejected',
      interest_confirmed_at: '2026-03-20T10:10:00.000Z',
      submission_pending_at: '2026-03-20T10:15:00.000Z',
    })

    const displayCycle = normalizeRejectedJourneyCycle(rejectedCycle)

    expect(displayCycle?.status).toBe('viewed')
    expect(displayCycle?.interest_confirmed_at).toBeNull()
    expect(displayCycle?.submission_pending_at).toBeNull()
  })

  it('keeps a rejected first request visible only when it is the only investor-facing journey', () => {
    const rejectedPrimary = createCycle({
      id: 'cycle-rejected',
      status: 'rejected',
      interest_confirmed_at: '2026-03-20T10:10:00.000Z',
      submission_pending_at: '2026-03-20T10:15:00.000Z',
    })

    expect(
      isRetryableRejectedPrimaryCycle(rejectedPrimary, [rejectedPrimary], () => false)
    ).toBe(true)

    expect(
      filterInvestorVisibleCycles([rejectedPrimary], () => false).map(cycle => cycle.id)
    ).toEqual(['cycle-rejected'])
  })

  it('hides a rejected additional-investment request when a funded subscription already exists', () => {
    const fundedPrimary = createCycle({
      id: 'cycle-funded',
      status: 'funded',
      funded_at: '2026-03-21T10:00:00.000Z',
    })
    const rejectedAdditional = createCycle({
      id: 'cycle-rejected-topup',
      sequence_number: 2,
      status: 'rejected',
      interest_confirmed_at: '2026-03-22T10:10:00.000Z',
      submission_pending_at: '2026-03-22T10:15:00.000Z',
    })

    expect(
      filterInvestorVisibleCycles([fundedPrimary, rejectedAdditional], () => false).map(cycle => cycle.id)
    ).toEqual(['cycle-funded'])
  })

  it('treats only pending-review and approved submissions as investor-visible', () => {
    expect(isInvestorVisibleSubmissionStatus('pending_review')).toBe(true)
    expect(isInvestorVisibleSubmissionStatus('approved')).toBe(true)
    expect(isInvestorVisibleSubmissionStatus('rejected')).toBe(false)
    expect(isInvestorVisibleSubmissionStatus('withdrawn')).toBe(false)
  })

  it('filters rejected submissions out of investor-visible submission lists', () => {
    expect(
      filterInvestorVisibleSubmissions([
        { id: 'submission-pending', status: 'pending_review' },
        { id: 'submission-approved', status: 'approved' },
        { id: 'submission-rejected', status: 'rejected' },
      ]).map(submission => submission.id)
    ).toEqual(['submission-pending', 'submission-approved'])
  })

  it('treats the subscription pack as investor-visible only after it is sent', () => {
    expect(isInvestorSubscriptionPackDispatched(null)).toBe(false)
    expect(isInvestorSubscriptionPackDispatched('2026-03-28T10:00:00.000Z')).toBe(true)
  })

  it('hides pack-generated progress from investors until the pack is sent', () => {
    expect(
      getInvestorVisiblePackGeneratedAt(
        '2026-03-28T09:00:00.000Z',
        null
      )
    ).toBeNull()

    expect(
      getInvestorVisiblePackGeneratedAt(
        '2026-03-28T09:00:00.000Z',
        '2026-03-28T10:00:00.000Z'
      )
    ).toBe('2026-03-28T09:00:00.000Z')
  })
})
