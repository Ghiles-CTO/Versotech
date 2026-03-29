type RejectedJourneyCycle = {
  id: string
  sequence_number: number
  status?: string | null
  dispatched_at?: string | null
  viewed_at?: string | null
  interest_confirmed_at?: string | null
  submission_pending_at?: string | null
  approved_at?: string | null
  pack_generated_at?: string | null
  pack_sent_at?: string | null
  signed_at?: string | null
  funded_at?: string | null
  activated_at?: string | null
}

const INVESTOR_VISIBLE_SUBMISSION_STATUSES = new Set([
  'pending_review',
  'approved',
])

export function isInvestorSubscriptionPackDispatched(packSentAt?: string | null): boolean {
  return Boolean(packSentAt)
}

export function getInvestorVisiblePackGeneratedAt(
  packGeneratedAt?: string | null,
  packSentAt?: string | null
): string | null {
  return isInvestorSubscriptionPackDispatched(packSentAt) ? packGeneratedAt ?? null : null
}

export function normalizeRejectedJourneyCycle<T extends RejectedJourneyCycle>(cycle: T | null): T | null {
  if (!cycle || cycle.status !== 'rejected') return cycle

  return {
    ...cycle,
    status: cycle.viewed_at ? 'viewed' : cycle.dispatched_at ? 'dispatched' : cycle.status,
    interest_confirmed_at: null,
    submission_pending_at: null,
    approved_at: null,
    pack_generated_at: null,
    pack_sent_at: null,
    signed_at: null,
    funded_at: null,
    activated_at: null,
  }
}

export function isRetryableRejectedPrimaryCycle<T extends RejectedJourneyCycle>(
  cycle: T | null,
  allCycles: T[],
  cycleHasFormalSubscription: (cycleId: string) => boolean
): boolean {
  if (!cycle || cycle.status !== 'rejected' || cycle.sequence_number !== 1) return false
  if (cycleHasFormalSubscription(cycle.id)) return false

  return !allCycles.some(other => {
    if (!other || other.id === cycle.id) return false
    return other.status !== 'rejected' || cycleHasFormalSubscription(other.id)
  })
}

export function filterInvestorVisibleCycles<T extends RejectedJourneyCycle>(
  cycles: T[],
  cycleHasFormalSubscription: (cycleId: string) => boolean
): T[] {
  return cycles.filter(cycle => {
    if (cycle.status !== 'rejected') return true
    if (cycleHasFormalSubscription(cycle.id)) return true
    return isRetryableRejectedPrimaryCycle(cycle, cycles, cycleHasFormalSubscription)
  })
}

export function isInvestorVisibleSubmissionStatus(status?: string | null): boolean {
  if (!status) return false
  return INVESTOR_VISIBLE_SUBMISSION_STATUSES.has(status.toLowerCase())
}

export function filterInvestorVisibleSubmissions<T extends { status?: string | null }>(
  submissions: T[]
): T[] {
  return submissions.filter(submission => isInvestorVisibleSubmissionStatus(submission.status))
}
