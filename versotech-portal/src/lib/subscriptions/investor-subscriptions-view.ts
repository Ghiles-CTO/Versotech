export type CurrencyTotals = Record<string, number>

type CurrencyLike = {
  currency?: string | null
}

type FeeLike = CurrencyLike & {
  commitment?: number | null
  subscription_fee_amount?: number | null
  subscription_fee_percent?: number | null
  management_fee_amount?: number | null
  management_fee_percent?: number | null
  spread_fee_amount?: number | null
  spread_per_share?: number | null
  num_shares?: number | null
  vehicle_id?: string | null
}

export function addCurrencyTotal(
  totals: CurrencyTotals,
  currency: string | null | undefined,
  amount: number | null | undefined
): CurrencyTotals {
  const numericAmount = Number(amount ?? 0)

  if (!Number.isFinite(numericAmount) || numericAmount === 0) {
    return totals
  }

  const normalizedCurrency = currency || 'USD'
  totals[normalizedCurrency] = (totals[normalizedCurrency] || 0) + numericAmount
  return totals
}

export function resolvePercentBasedFeeAmount(
  commitment: number | null | undefined,
  explicitAmount: number | null | undefined,
  percent: number | null | undefined
): number {
  if (explicitAmount != null) {
    const numericAmount = Number(explicitAmount)
    return Number.isFinite(numericAmount) ? numericAmount : 0
  }

  if (percent == null || commitment == null) {
    return 0
  }

  const numericCommitment = Number(commitment)
  const numericPercent = Number(percent)

  if (!Number.isFinite(numericCommitment) || !Number.isFinite(numericPercent)) {
    return 0
  }

  return numericCommitment * (numericPercent / 100)
}

export function resolveSpreadAmount(subscription: FeeLike): number {
  if (subscription.spread_fee_amount != null) {
    const numericAmount = Number(subscription.spread_fee_amount)
    return Number.isFinite(numericAmount) ? numericAmount : 0
  }

  if (subscription.spread_per_share == null || subscription.num_shares == null) {
    return 0
  }

  const numericSpread = Number(subscription.spread_per_share)
  const numericShares = Number(subscription.num_shares)

  if (!Number.isFinite(numericSpread) || !Number.isFinite(numericShares)) {
    return 0
  }

  return numericSpread * numericShares
}

export function sanitizeSubscriptionForViewer<T extends FeeLike>(
  subscription: T,
  canViewSpread: boolean
): T {
  if (canViewSpread) {
    return subscription
  }

  return {
    ...subscription,
    spread_fee_amount: null,
    spread_per_share: null,
  }
}

export function buildInvestorSubscriptionsSummary<T extends FeeLike>(
  subscriptions: T[],
  options?: {
    canViewSpread?: boolean
  }
) {
  const canViewSpread = options?.canViewSpread ?? true
  const vehicles = new Set<string>()

  const summary = {
    total_vehicles: 0,
    total_subscriptions: subscriptions.length,
    total_commitment_by_currency: {} as CurrencyTotals,
    total_subscription_fees_by_currency: {} as CurrencyTotals,
    total_management_fees_by_currency: {} as CurrencyTotals,
    total_spread_by_currency: {} as CurrencyTotals,
  }

  for (const subscription of subscriptions) {
    if (subscription.vehicle_id) {
      vehicles.add(subscription.vehicle_id)
    }

    addCurrencyTotal(
      summary.total_commitment_by_currency,
      subscription.currency,
      subscription.commitment
    )

    addCurrencyTotal(
      summary.total_subscription_fees_by_currency,
      subscription.currency,
      resolvePercentBasedFeeAmount(
        subscription.commitment,
        subscription.subscription_fee_amount,
        subscription.subscription_fee_percent
      )
    )

    addCurrencyTotal(
      summary.total_management_fees_by_currency,
      subscription.currency,
      resolvePercentBasedFeeAmount(
        subscription.commitment,
        subscription.management_fee_amount,
        subscription.management_fee_percent
      )
    )

    if (canViewSpread) {
      addCurrencyTotal(
        summary.total_spread_by_currency,
        subscription.currency,
        resolveSpreadAmount(subscription)
      )
    }
  }

  summary.total_vehicles = vehicles.size

  return summary
}
