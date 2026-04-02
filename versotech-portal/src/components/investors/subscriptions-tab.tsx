'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Hash, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatViewerDate } from '@/lib/format'
import {
  resolvePercentBasedFeeAmount,
  resolveSpreadAmount,
  type CurrencyTotals,
} from '@/lib/subscriptions/investor-subscriptions-view'

type Subscription = {
  id: string
  subscription_number: number
  vehicle_id: string
  commitment: number
  currency: string
  status: string
  committed_at: string | null
  created_at: string
  acknowledgement_notes: string | null
  effective_date: string | null
  funding_due_at: string | null

  // Share/Unit fields
  price_per_share: number | null
  cost_per_share: number | null
  num_shares: number | null
  spread_per_share: number | null
  units: number | null

  // Fee fields
  subscription_fee_percent: number | null
  subscription_fee_amount: number | null
  management_fee_percent: number | null
  management_fee_amount: number | null
  management_fee_frequency: string | null
  bd_fee_percent: number | null
  bd_fee_amount: number | null
  finra_fee_amount: number | null
  spread_fee_amount: number | null
  performance_fee_tier1_percent: number | null
  performance_fee_tier1_threshold: number | null
  performance_fee_tier2_percent: number | null
  performance_fee_tier2_threshold: number | null

  // Financial tracking
  funded_amount: number
  outstanding_amount: number | null
  capital_calls_total: number
  distributions_total: number
  current_nav: number | null

  // Business context
  opportunity_name: string | null

  vehicle?: {
    id: string
    name: string
    type: string | null
  }
}

type GroupedSubscriptions = {
  vehicle: {
    id: string
    name: string
  } | null
  subscriptions: Subscription[]
  total_commitment: number
  currency: string
}

type SubscriptionsData = {
  investor: {
    id: string
    legal_name: string
  }
  subscriptions: Subscription[]
  grouped_by_vehicle: GroupedSubscriptions[]
  summary: {
    total_vehicles: number
    total_subscriptions: number
    total_commitment_by_currency: CurrencyTotals
    total_subscription_fees_by_currency: CurrencyTotals
    total_management_fees_by_currency: CurrencyTotals
    total_spread_by_currency: CurrencyTotals
  }
  viewer?: {
    can_view_spread?: boolean
    can_manage_subscriptions?: boolean
  }
}

type SubscriptionsTabProps = {
  investorId: string
  canViewSpread?: boolean
  canManageSubscriptions?: boolean
}

function formatPercent(value: number | null | undefined) {
  if (value == null) return '—'
  return `${value.toFixed(2)}%`
}

export function SubscriptionsTab({
  investorId,
  canViewSpread = false,
  canManageSubscriptions = true,
}: SubscriptionsTabProps) {
  const router = useRouter()
  const [data, setData] = useState<SubscriptionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/investors/${investorId}/subscriptions`)

      if (!res.ok) {
        let message = `Failed to fetch subscriptions (status ${res.status})`

        try {
          const errorBody = await res.json()
          if (errorBody?.error) {
            message = errorBody.details
              ? `${errorBody.error}: ${errorBody.details}`
              : errorBody.error
          }
        } catch {
          // Ignore JSON parse errors and keep default message
        }

        throw new Error(message)
      }

      const result = await res.json()
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }, [investorId])

  useEffect(() => {
    fetchSubscriptions()
  }, [investorId, fetchSubscriptions])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return formatViewerDate(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'committed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const renderCurrencyTotals = (
    totals: CurrencyTotals,
    emptyLabel = '—'
  ) => {
    const entries = Object.entries(totals).sort(([left], [right]) => left.localeCompare(right))

    if (entries.length === 0) {
      return (
        <p className="text-2xl font-semibold text-muted-foreground">
          {emptyLabel}
        </p>
      )
    }

    return (
      <div className="space-y-1">
        {entries.map(([currency, amount], index) => (
          <p
            key={currency}
            className={index === 0 ? 'text-2xl font-bold' : 'text-sm font-medium text-muted-foreground'}
          >
            {formatCurrency(amount, currency)}
          </p>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchSubscriptions} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const showSpread = data.viewer?.can_view_spread ?? canViewSpread
  const showManageActions = data.viewer?.can_manage_subscriptions ?? canManageSubscriptions

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Subscriptions ({data.summary.total_subscriptions})
        </h2>
        <p className="text-muted-foreground">
          {showManageActions
            ? `${data.summary.total_vehicles} vehicles. Use "Manage Subscriptions" to review the full subscription register.`
            : `${data.summary.total_vehicles} vehicles linked to this investor in your managed mandates.`}
        </p>
      </div>

      {data.grouped_by_vehicle.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {showManageActions
                ? 'No subscriptions yet. Use the subscriptions page to manage records.'
                : 'No managed subscriptions are visible for this investor.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={showSpread ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Commitment</CardDescription>
              </CardHeader>
              <CardContent>
                {renderCurrencyTotals(data.summary.total_commitment_by_currency)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Subscription Fees</CardDescription>
              </CardHeader>
              <CardContent>
                {renderCurrencyTotals(data.summary.total_subscription_fees_by_currency)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Management Fees</CardDescription>
              </CardHeader>
              <CardContent>
                {renderCurrencyTotals(data.summary.total_management_fees_by_currency)}
              </CardContent>
            </Card>

            {showSpread && (
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Spread</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderCurrencyTotals(data.summary.total_spread_by_currency)}
                </CardContent>
              </Card>
            )}
          </div>

          {data.grouped_by_vehicle.map((group, index) => (
            <Card key={group.vehicle?.id ?? `no-vehicle-${index}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {group.vehicle?.name ?? 'No Vehicle Assigned'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {group.subscriptions.length} subscription
                      {group.subscriptions.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Commitment
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(group.total_commitment, group.currency)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.subscriptions.map((sub) => {
                    const percentFunded = sub.commitment > 0 ? (sub.funded_amount / sub.commitment) * 100 : 0
                    const subscriptionFeeAmount = resolvePercentBasedFeeAmount(
                      sub.commitment,
                      sub.subscription_fee_amount,
                      sub.subscription_fee_percent
                    )
                    const hasSubscriptionFee =
                      sub.subscription_fee_amount != null || sub.subscription_fee_percent != null
                    const managementFeeAmount = resolvePercentBasedFeeAmount(
                      sub.commitment,
                      sub.management_fee_amount,
                      sub.management_fee_percent
                    )
                    const hasManagementFee =
                      sub.management_fee_amount != null || sub.management_fee_percent != null
                    const spreadAmount = showSpread ? resolveSpreadAmount(sub) : 0
                    const moic = sub.funded_amount > 0 && sub.current_nav ? sub.current_nav / sub.funded_amount : null
                    const performanceFeeLines = [
                      sub.performance_fee_tier1_percent != null
                        ? {
                            label: sub.performance_fee_tier2_percent != null ? 'Tier 1' : 'Performance',
                            value: sub.performance_fee_tier1_percent,
                          }
                        : null,
                      sub.performance_fee_tier2_percent != null
                        ? {
                            label: 'Tier 2',
                            value: sub.performance_fee_tier2_percent,
                          }
                        : null,
                    ].filter((line): line is { label: string; value: number } => line !== null)

                    return (
                      <div
                        key={sub.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono font-semibold text-lg">
                                {sub.subscription_number}
                              </span>
                            </div>
                            <Badge className={getStatusColor(sub.status)}>
                              {sub.status}
                            </Badge>
                            {sub.opportunity_name && (
                              <span className="text-sm text-muted-foreground italic">
                                {sub.opportunity_name}
                              </span>
                            )}
                          </div>
                          {showManageActions && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/versotech_main/subscriptions')}
                              >
                                View Details
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Commitment</p>
                            <p className="font-semibold">{formatCurrency(sub.commitment, sub.currency)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Funded: {formatCurrency(sub.funded_amount, sub.currency)} ({percentFunded.toFixed(0)}%)
                            </p>
                            {sub.outstanding_amount != null && sub.outstanding_amount > 0 && (
                              <p className="text-xs text-yellow-600 font-medium">
                                Outstanding: {formatCurrency(sub.outstanding_amount, sub.currency)}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Important Dates</p>
                            {sub.committed_at && (
                              <p className="text-sm">Committed: {formatDate(sub.committed_at)}</p>
                            )}
                            {sub.created_at && (
                              <p className="text-sm">Created: {formatDate(sub.created_at)}</p>
                            )}
                            {!sub.committed_at && !sub.created_at && (
                              <p className="text-sm text-muted-foreground">No dates set</p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Shares count</p>
                            {sub.num_shares != null ? (
                              <>
                                <p className="text-sm font-medium">{sub.num_shares.toLocaleString()} shares</p>
                                {sub.price_per_share != null && (
                                  <p className="text-xs text-muted-foreground">
                                    Price/share: {formatCurrency(sub.price_per_share, sub.currency)}
                                  </p>
                                )}
                                {showSpread && sub.spread_per_share != null && sub.spread_per_share > 0 && (
                                  <p className="text-xs text-green-600">
                                    Spread/share: {formatCurrency(sub.spread_per_share, sub.currency)}
                                  </p>
                                )}
                                {showSpread && spreadAmount > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    Total spread: {formatCurrency(spreadAmount, sub.currency)}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">No share data</p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Subscription Fees</p>
                            <p className="text-sm font-medium">
                              {hasSubscriptionFee
                                ? formatCurrency(subscriptionFeeAmount, sub.currency)
                                : '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatPercent(sub.subscription_fee_percent)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Management Fees</p>
                            <p className="text-sm font-medium">
                              {hasManagementFee
                                ? formatCurrency(managementFeeAmount, sub.currency)
                                : '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatPercent(sub.management_fee_percent)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Performance Fees</p>
                            {performanceFeeLines.length > 0 ? (
                              <div className="space-y-1">
                                {performanceFeeLines.map((line) => (
                                  <p key={line.label} className="text-sm">
                                    <span className="font-medium">{line.label}:</span>{' '}
                                    {formatPercent(line.value)}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No performance fee</p>
                            )}
                          </div>
                        </div>

                        {(sub.capital_calls_total > 0 || sub.distributions_total > 0 || sub.current_nav != null) && (
                          <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {sub.capital_calls_total > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground">Capital Calls</p>
                                <p className="font-medium">{formatCurrency(sub.capital_calls_total, sub.currency)}</p>
                              </div>
                            )}
                            {sub.distributions_total > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground">Distributions</p>
                                <p className="font-medium text-green-600">{formatCurrency(sub.distributions_total, sub.currency)}</p>
                              </div>
                            )}
                            {sub.current_nav != null && (
                              <div>
                                <p className="text-xs text-muted-foreground">Current NAV</p>
                                <p className={`font-medium ${moic && moic >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(sub.current_nav, sub.currency)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}
