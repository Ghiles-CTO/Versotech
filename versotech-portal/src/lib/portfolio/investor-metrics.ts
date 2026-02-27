type RawNumber = number | string | null | undefined

export interface SubscriptionLike {
  id?: string | null
  status?: string | null
  commitment?: RawNumber
  funded_amount?: RawNumber
  currency?: string | null
  effective_date?: string | null
  funding_due_at?: string | null
  performance_fee_tier1_percent?: RawNumber
  price_per_share?: RawNumber
  created_at?: string | null
  committed_at?: string | null
  updated_at?: string | null
}

export interface SubscriptionSummary {
  ids: string[]
  subscriptionCount: number
  primaryId: string | null
  commitmentTotal: number
  fundedTotal: number
  currency: string | null
  status: string
  effectiveDate: string | null
  fundingDueAt: string | null
  performanceFeeRate: number
  pricePerShare: number | null
}

export interface PositionMetricInput {
  units: number
  subscriptionAmount: number
  currentPricePerShare: number
  performanceFeeRate?: number
}

const STATUS_PRIORITY: Record<string, number> = {
  active: 6,
  funded: 5,
  partially_funded: 4,
  committed: 3,
  pending: 2,
  closed: 1,
  cancelled: 0
}

const OPEN_STATUSES = new Set([
  'active',
  'funded',
  'partially_funded',
  'committed',
  'pending'
])

export function toNumber(value: RawNumber): number | null {
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function toPositiveNumber(value: RawNumber): number | null {
  const parsed = toNumber(value)
  if (parsed === null || parsed <= 0) return null
  return parsed
}

export function normalizePerformanceFeeRate(value: RawNumber): number {
  const parsed = toNumber(value)
  if (parsed === null) return 0
  const normalized = parsed > 1 ? parsed / 100 : parsed
  if (normalized < 0) return 0
  if (normalized > 1) return 1
  return normalized
}

export function isOpenSubscriptionStatus(status: string | null | undefined): boolean {
  if (!status) return false
  return OPEN_STATUSES.has(status)
}

function toTimestamp(value: string | null | undefined): number {
  if (!value) return 0
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function getStatusPriority(status: string | null | undefined): number {
  if (!status) return -1
  return STATUS_PRIORITY[status] ?? -1
}

function sortSubscriptions(subscriptions: SubscriptionLike[]): SubscriptionLike[] {
  return [...subscriptions].sort((left, right) => {
    const statusDelta = getStatusPriority(right.status) - getStatusPriority(left.status)
    if (statusDelta !== 0) return statusDelta

    const rightTs = Math.max(
      toTimestamp(right.committed_at),
      toTimestamp(right.effective_date),
      toTimestamp(right.updated_at),
      toTimestamp(right.created_at)
    )
    const leftTs = Math.max(
      toTimestamp(left.committed_at),
      toTimestamp(left.effective_date),
      toTimestamp(left.updated_at),
      toTimestamp(left.created_at)
    )
    return rightTs - leftTs
  })
}

export function summarizeSubscriptions(
  subscriptions: SubscriptionLike[],
  fallbackCurrency?: string | null
): SubscriptionSummary {
  if (!subscriptions.length) {
    return {
      ids: [],
      subscriptionCount: 0,
      primaryId: null,
      commitmentTotal: 0,
      fundedTotal: 0,
      currency: fallbackCurrency ?? null,
      status: 'pending',
      effectiveDate: null,
      fundingDueAt: null,
      performanceFeeRate: 0,
      pricePerShare: null
    }
  }

  const sorted = sortSubscriptions(subscriptions)
  const primary = sorted[0]
  const openSubscriptions = sorted.filter((sub) => isOpenSubscriptionStatus(sub.status))
  const commitmentSource = openSubscriptions.length > 0 ? openSubscriptions : sorted

  const commitmentTotal = commitmentSource.reduce((sum, sub) => {
    return sum + (toNumber(sub.commitment) ?? 0)
  }, 0)

  const fundedTotal = commitmentSource.reduce((sum, sub) => {
    return sum + (toNumber(sub.funded_amount) ?? 0)
  }, 0)

  return {
    ids: sorted.map((sub) => sub.id).filter(Boolean) as string[],
    subscriptionCount: sorted.length,
    primaryId: primary.id ?? null,
    commitmentTotal,
    fundedTotal,
    currency: primary.currency || fallbackCurrency || null,
    status: primary.status || 'pending',
    effectiveDate: primary.effective_date || null,
    fundingDueAt: primary.funding_due_at || null,
    performanceFeeRate: normalizePerformanceFeeRate(primary.performance_fee_tier1_percent),
    pricePerShare: toPositiveNumber(primary.price_per_share)
  }
}

export function resolveCurrentPricePerShare(input: {
  latestValuationNav?: RawNumber
  subscriptionPricePerShare?: RawNumber
  subscriptionAmount?: RawNumber
  units?: RawNumber
  positionLastNav?: RawNumber
}): number {
  const valuationNav = toPositiveNumber(input.latestValuationNav)
  if (valuationNav !== null) return valuationNav

  const units = toNumber(input.units) ?? 0
  const subscriptionAmount = toNumber(input.subscriptionAmount) ?? 0
  if (units > 0 && subscriptionAmount > 0) {
    return subscriptionAmount / units
  }

  const positionLastNav = toPositiveNumber(input.positionLastNav)
  if (positionLastNav !== null) return positionLastNav

  const subscriptionPrice = toPositiveNumber(input.subscriptionPricePerShare)
  if (subscriptionPrice !== null) return subscriptionPrice

  return 0
}

export function computePositionMetrics(input: PositionMetricInput) {
  const units = Number.isFinite(input.units) ? input.units : 0
  const subscriptionAmount = Number.isFinite(input.subscriptionAmount) ? input.subscriptionAmount : 0
  const currentPricePerShare = Number.isFinite(input.currentPricePerShare) ? input.currentPricePerShare : 0
  const performanceFeeRate = normalizePerformanceFeeRate(input.performanceFeeRate ?? 0)

  const currentValue = units * currentPricePerShare
  const unrealizedGain = currentValue - subscriptionAmount
  const unrealizedGainPct = subscriptionAmount > 0 ? (unrealizedGain / subscriptionAmount) * 100 : 0
  const netUnrealizedGain = unrealizedGain * (1 - performanceFeeRate)

  return {
    units,
    subscriptionAmount,
    currentPricePerShare,
    currentValue,
    unrealizedGain,
    unrealizedGainPct,
    performanceFeeRate,
    netUnrealizedGain
  }
}
