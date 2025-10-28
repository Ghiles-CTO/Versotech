'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, XCircle, Building2, DollarSign, Calendar, Hash } from 'lucide-react'
import { EditSubscriptionDialog } from './edit-subscription-dialog'
import { toast } from 'sonner'

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

  // Share/Unit fields
  price_per_share: number | null
  cost_per_share: number | null
  num_shares: number | null
  spread_per_share: number | null
  units: number | null

  // Fee fields
  subscription_fee_percent: number | null
  subscription_fee_amount: number | null
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
  }
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
    total_commitment_by_currency: Record<string, number>
  }
}

export function SubscriptionsTab({ investorId }: { investorId: string }) {
  const [data, setData] = useState<SubscriptionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  const fetchSubscriptions = async () => {
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
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [investorId])

  const handleCancelSubscription = async (subscriptionId: string, subscriptionNumber: number) => {
    if (!confirm(`Are you sure you want to cancel subscription #${subscriptionNumber}? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/investors/${investorId}/subscriptions/${subscriptionId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }

      toast.success(`Cancelled subscription #${subscriptionNumber}`)
      fetchSubscriptions()
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to cancel subscription')
    }
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setEditDialogOpen(true)
  }

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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Subscriptions ({data.summary.total_subscriptions})
        </h2>
        <p className="text-muted-foreground">
          {data.summary.total_vehicles} vehicles. Use "Add Subscription" button in the page header to create new subscriptions.
        </p>
      </div>

      {data.grouped_by_vehicle.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No subscriptions yet. Use the "Add Subscription" button in the page header to create the first subscription.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {data.grouped_by_vehicle.map((group) => (
            <Card key={group.vehicle.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {group.vehicle.name}
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
                    const hasFees = sub.subscription_fee_amount || sub.bd_fee_amount || sub.spread_fee_amount || sub.finra_fee_amount
                    const totalFees = [
                      sub.subscription_fee_amount,
                      sub.bd_fee_amount,
                      sub.spread_fee_amount,
                      sub.finra_fee_amount
                    ].reduce((sum, fee) => sum + (fee || 0), 0)
                    const moic = sub.funded_amount > 0 && sub.current_nav ? sub.current_nav / sub.funded_amount : null

                    return (
                      <div
                        key={sub.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-4">
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
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(sub)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {sub.status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelSubscription(sub.id, sub.subscription_number)}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* Commitment & Funded */}
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

                          {/* Dates */}
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

                          {/* Share Structure */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Share Structure</p>
                            {sub.num_shares != null ? (
                              <>
                                <p className="text-sm font-medium">{sub.num_shares.toLocaleString()} shares</p>
                                {sub.price_per_share != null && (
                                  <p className="text-xs">@ {formatCurrency(sub.price_per_share, sub.currency)}</p>
                                )}
                                {sub.spread_per_share != null && sub.spread_per_share > 0 && (
                                  <p className="text-xs text-green-600">
                                    Spread: {formatCurrency(sub.spread_per_share, sub.currency)}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">No share data</p>
                            )}
                          </div>

                          {/* Fees & Performance */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Fees & Performance</p>
                            {hasFees ? (
                              <>
                                <p className="text-sm font-medium">Total Fees: {formatCurrency(totalFees, sub.currency)}</p>
                                {sub.subscription_fee_percent && (
                                  <p className="text-xs">Sub: {sub.subscription_fee_percent.toFixed(2)}%</p>
                                )}
                                {sub.bd_fee_percent && (
                                  <p className="text-xs">BD: {sub.bd_fee_percent.toFixed(2)}%</p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">No fees</p>
                            )}
                            {moic != null && (
                              <p className={`text-xs font-medium mt-1 ${moic >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                                MOIC: {moic.toFixed(2)}x
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Additional Financial Info */}
                        {(sub.capital_calls_total > 0 || sub.distributions_total > 0 || sub.current_nav != null) && (
                          <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-sm">
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

          <Card>
            <CardHeader>
              <CardTitle>Grand Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.summary.total_commitment_by_currency).map(
                  ([currency, amount]) => (
                    <div key={currency} className="flex justify-between text-lg">
                      <span className="font-medium">{currency}:</span>
                      <span className="font-bold">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {editingSubscription && (
        <EditSubscriptionDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          investorId={investorId}
          subscription={editingSubscription}
          onSuccess={() => {
            fetchSubscriptions()
            setEditingSubscription(null)
          }}
        />
      )}
    </div>
  )
}
