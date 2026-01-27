'use client'

import { Card } from '@/components/ui/card'
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  BarChart3,
  Percent
} from 'lucide-react'

interface SubscriptionQuickStatsProps {
  subscriptions: any[]
  selectedCount?: number
}

export function SubscriptionQuickStats({
  subscriptions,
  selectedCount = 0
}: SubscriptionQuickStatsProps) {
  // Calculate metrics from filtered subscriptions
  const metrics = subscriptions.reduce((acc, sub) => {
    acc.totalCommitment += Number(sub.commitment) || 0
    acc.totalFunded += Number(sub.funded_amount) || 0
    acc.totalOutstanding += Number(sub.outstanding_amount) || 0
    acc.totalNAV += Number(sub.current_nav) || 0

    // Currency breakdown
    const currency = sub.currency || 'USD'
    if (!acc.byCurrency[currency]) {
      acc.byCurrency[currency] = 0
    }
    acc.byCurrency[currency] += Number(sub.commitment) || 0

    // Overdue count
    if (sub.funding_due_at && new Date(sub.funding_due_at) < new Date() && sub.status !== 'closed') {
      acc.overdueCount++
    }

    return acc
  }, {
    totalCommitment: 0,
    totalFunded: 0,
    totalOutstanding: 0,
    totalNAV: 0,
    byCurrency: {} as Record<string, number>,
    overdueCount: 0
  })

  const avgCommitment = subscriptions.length > 0
    ? metrics.totalCommitment / subscriptions.length
    : 0

  const fundingRate = metrics.totalCommitment > 0
    ? (metrics.totalFunded / metrics.totalCommitment) * 100
    : 0

  const moic = metrics.totalFunded > 0
    ? metrics.totalNAV / metrics.totalFunded
    : 0

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Subscriptions',
      value: subscriptions.length.toLocaleString(),
      subValue: selectedCount > 0 ? `${selectedCount} selected` : null,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20'
    },
    {
      icon: DollarSign,
      label: 'Total Commitment',
      value: formatCurrency(metrics.totalCommitment),
      subValue: `Avg: ${formatCurrency(avgCommitment)}`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-900/20'
    },
    {
      icon: TrendingUp,
      label: 'Total Funded',
      value: formatCurrency(metrics.totalFunded),
      subValue: `${fundingRate.toFixed(1)}% of commitment`,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20'
    },
    {
      icon: AlertCircle,
      label: 'Outstanding',
      value: formatCurrency(metrics.totalOutstanding),
      subValue: metrics.overdueCount > 0 ? `${metrics.overdueCount} overdue` : 'All current',
      color: metrics.totalOutstanding > 0 ? 'text-yellow-400' : 'text-muted-foreground',
      bgColor: metrics.totalOutstanding > 0 ? 'bg-yellow-900/20' : 'bg-muted'
    },
    {
      icon: BarChart3,
      label: 'Current NAV',
      value: formatCurrency(metrics.totalNAV),
      subValue: moic > 0 ? `${moic.toFixed(2)}x MOIC` : 'N/A',
      color: moic >= 1 ? 'text-blue-400' : 'text-red-400',
      bgColor: moic >= 1 ? 'bg-blue-900/20' : 'bg-red-900/20'
    },
    {
      icon: Percent,
      label: 'Funding Rate',
      value: `${fundingRate.toFixed(1)}%`,
      subValue: Object.keys(metrics.byCurrency).length > 1 ? `${Object.keys(metrics.byCurrency).length} currencies` : 'Single currency',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20'
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-card border-border p-4 hover:bg-muted transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              {stat.subValue && (
                <p className="text-xs text-muted-foreground/70 mt-1">{stat.subValue}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
