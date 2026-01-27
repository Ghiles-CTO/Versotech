'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, TrendingUp, Users, DollarSign } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

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
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

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
      <Card className={isDark ? "bg-gray-900 border-blue-700" : "bg-white border-blue-200"}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="h-4 w-4 text-blue-400" />
            Total Commitment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(totalCommitment)}
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Across {totalCount} subscriptions
          </p>
          {summary.by_currency && Object.keys(summary.by_currency).length > 1 && (
            <div className={`mt-2 text-xs space-y-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
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
      <Card className={isDark ? "bg-gray-900 border-green-700" : "bg-white border-green-200"}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="h-4 w-4 text-green-500" />
            Active Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {activeCount}
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Currently active positions
          </p>
          {totalCount > 0 && (
            <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {((activeCount / totalCount) * 100).toFixed(1)}% of total
            </div>
          )}
        </CardContent>
      </Card>

      {/* Committed (Not Active) */}
      <Card className={isDark ? "bg-gray-900 border-yellow-700" : "bg-white border-yellow-200"}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Users className="h-4 w-4 text-yellow-500" />
            Committed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
            {committedCount}
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Awaiting activation
          </p>
          {totalCount > 0 && (
            <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {((committedCount / totalCount) * 100).toFixed(1)}% of total
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overdue/Pending */}
      <Card className={isDark ? "bg-gray-900 border-red-700" : "bg-white border-red-200"}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            {overdueCount + pendingCount}
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {overdueCount} overdue · {pendingCount} pending
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
