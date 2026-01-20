'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Users, TrendingUp, DollarSign, FileCheck } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardMetrics {
  kpis: {
    aum: {
      value: number
      commitment: number
      funded: number
      funding_rate: number
      change_mtd: number | null
      trend: 'up' | 'down' | null
    }
    revenue: {
      total: number
      spread_fees: number
      subscription_fees: number
      management_fees: number
    }
    investors: {
      active: number
      new_mtd: number
      trend: 'up' | 'down' | null
    }
    deals: {
      open: number
      pipeline_value: number
      trend: 'up' | 'down' | null
    }
    pending: {
      approvals: number
      tasks: number
      kyc: number
    }
  }
}

interface DashboardKPICardsProps {
  days: string
}

/**
 * Formats a number for display:
 * - Currency: $1.2M, $45.2M, $123.5K
 * - Counts: 1,247
 */
function formatNumber(value: number, isCurrency = false): string {
  if (isCurrency) {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`
    }
    return `$${value.toLocaleString()}`
  }
  return value.toLocaleString()
}

/**
 * Calculates percentage change between current and previous values
 */
function calculateChange(current: number, previous: number): { value: number; isPositive: boolean } | null {
  if (previous === 0) return null
  const change = ((current - previous) / previous) * 100
  return {
    value: Math.abs(Math.round(change * 10) / 10),
    isPositive: change >= 0
  }
}

function KPICardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function DashboardKPICards({ days }: DashboardKPICardsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/metrics/dashboard?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch metrics')
        }
        const result = await response.json()
        if (result.success && result.data) {
          setMetrics(result.data)
        } else {
          throw new Error(result.error || 'Unknown error')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [days])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p className="text-sm font-medium">Failed to load KPI metrics</p>
        <p className="text-xs mt-1">{error}</p>
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  const { kpis } = metrics

  // Calculate trends for display
  // Since the API doesn't provide historical data for comparisons,
  // we show new_mtd as a positive trend indicator for investors
  const investorTrend = kpis.investors.new_mtd > 0
    ? { value: kpis.investors.new_mtd, isPositive: true }
    : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Users (Active Investors) */}
      <KPICard
        title="Total Users"
        value={formatNumber(kpis.investors.active)}
        icon={Users}
        subtitle={`${formatNumber(kpis.investors.new_mtd)} new this month`}
        trend={investorTrend ? { value: investorTrend.value, isPositive: investorTrend.isPositive } : undefined}
      />

      {/* Active Users (based on recent activity proxy) */}
      <KPICard
        title="Active Investors"
        value={formatNumber(kpis.investors.active)}
        icon={TrendingUp}
        subtitle={`${kpis.deals.open} open deals`}
        trend={kpis.investors.trend === 'up' ? { value: 0, isPositive: true } : undefined}
      />

      {/* Total AUM */}
      <KPICard
        title="Total AUM"
        value={formatNumber(kpis.aum.value, true)}
        icon={DollarSign}
        subtitle={`${kpis.aum.funding_rate}% funding rate`}
        trend={kpis.aum.change_mtd !== null ? { value: kpis.aum.change_mtd, isPositive: kpis.aum.change_mtd >= 0 } : undefined}
        additionalInfo={{
          breakdown: [
            { label: 'Committed', value: formatNumber(kpis.aum.commitment, true) },
            { label: 'Funded', value: formatNumber(kpis.aum.funded, true) }
          ]
        }}
        interactive
        hasDetails
      />

      {/* Pending Approvals */}
      <KPICard
        title="Pending Approvals"
        value={formatNumber(kpis.pending.approvals + kpis.pending.tasks + kpis.pending.kyc)}
        icon={FileCheck}
        subtitle={`${kpis.pending.kyc} KYC reviews pending`}
        additionalInfo={{
          breakdown: [
            { label: 'Approvals', value: kpis.pending.approvals },
            { label: 'Tasks', value: kpis.pending.tasks }
          ]
        }}
        interactive
        hasDetails
      />
    </div>
  )
}
