'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, TrendingUp, Users, DollarSign } from 'lucide-react'

type SubscriptionSummary = {
  total: number
  by_status: Record<string, number>
  by_currency: Record<string, number>
  total_commitment: number
  overdue_count: number
  overdue_amount: number
}

interface SubscriptionHealthCardsProps {
  summary: SubscriptionSummary
}

export function SubscriptionHealthCards({ summary }: SubscriptionHealthCardsProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Always use global summary data
  const activeCount = summary.by_status?.active || 0
  const committedCount = summary.by_status?.committed || 0
  const pendingCount = summary.by_status?.pending || 0
  const totalCommitment = summary.total_commitment || 0
  const totalCount = summary.total
  const overdueCount = summary.overdue_count || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Commitment */}
      <Card className="bg-gray-900 border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <DollarSign className="h-4 w-4 text-blue-400" />
            Total Commitment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(totalCommitment)}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Across {totalCount} subscriptions
          </p>
          {summary.by_currency && Object.keys(summary.by_currency).length > 1 && (
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              {Object.entries(summary.by_currency).map(([currency, amount]) => (
                <div key={currency}>
                  {currency}: {formatCurrency(amount, currency)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card className="bg-gray-900 border-green-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <TrendingUp className="h-4 w-4 text-green-400" />
            Active Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-400">
            {activeCount}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Currently active positions
          </p>
          {totalCount > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {((activeCount / totalCount) * 100).toFixed(1)}% of total
            </div>
          )}
        </CardContent>
      </Card>

      {/* Committed (Not Active) */}
      <Card className="bg-gray-900 border-yellow-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Users className="h-4 w-4 text-yellow-400" />
            Committed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-400">
            {committedCount}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Awaiting activation
          </p>
          {totalCount > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {((committedCount / totalCount) * 100).toFixed(1)}% of total
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overdue/Pending */}
      <Card className="bg-gray-900 border-red-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-400">
            {overdueCount + pendingCount}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {overdueCount} overdue · {pendingCount} pending
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
