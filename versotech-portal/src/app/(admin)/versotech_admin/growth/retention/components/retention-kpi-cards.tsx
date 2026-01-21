'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingDown, TrendingUp, Calendar, UserX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RetentionData {
  retentionRates: {
    day7: number
    day30: number
    day90: number
  }
  churnRate: number
}

interface RetentionKPICardsProps {
  days: string
}

interface KPIConfig {
  key: 'day7' | 'day30' | 'day90' | 'churn'
  label: string
  icon: LucideIcon
  getValue: (data: RetentionData) => number
  isChurn?: boolean
  description: string
}

const KPI_CONFIGS: KPIConfig[] = [
  {
    key: 'day7',
    label: '7-Day Retention',
    icon: Calendar,
    getValue: (data) => data.retentionRates.day7,
    description: 'Users retained after 7 days',
  },
  {
    key: 'day30',
    label: '30-Day Retention',
    icon: Calendar,
    getValue: (data) => data.retentionRates.day30,
    description: 'Users retained after 30 days',
  },
  {
    key: 'day90',
    label: '90-Day Retention',
    icon: Calendar,
    getValue: (data) => data.retentionRates.day90,
    description: 'Users retained after 90 days',
  },
  {
    key: 'churn',
    label: 'Churn Rate',
    icon: UserX,
    getValue: (data) => data.churnRate,
    isChurn: true,
    description: 'Users lost in last 30 days',
  },
]

// Get color class based on retention percentage
function getRetentionColor(value: number, isChurn: boolean = false): string {
  if (isChurn) {
    // For churn, lower is better
    if (value <= 10) return 'text-emerald-600 dark:text-emerald-400'
    if (value <= 25) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }
  // For retention, higher is better
  if (value >= 70) return 'text-emerald-600 dark:text-emerald-400'
  if (value >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// Get trend icon based on value
function getTrendIcon(value: number, isChurn: boolean = false) {
  if (isChurn) {
    return value <= 15 ? TrendingDown : TrendingUp
  }
  return value >= 50 ? TrendingUp : TrendingDown
}

function KPICardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export function RetentionKPICards({ days }: RetentionKPICardsProps) {
  const [data, setData] = useState<RetentionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/growth/retention?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch retention data')
        }
        const result = await response.json()
        if (result.success && result.data) {
          setData(result.data)
        } else {
          throw new Error(result.error || 'No data available')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CONFIGS.map((config) => (
          <Card key={config.key}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <config.icon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-destructive text-sm">Error loading data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_CONFIGS.map((config) => {
        const value = config.getValue(data)
        const colorClass = getRetentionColor(value, config.isChurn)
        const TrendIcon = getTrendIcon(value, config.isChurn)
        const isPositiveTrend = config.isChurn ? value <= 15 : value >= 50

        return (
          <Card key={config.key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                </div>
                <TrendIcon
                  className={cn(
                    'h-4 w-4',
                    isPositiveTrend
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  )}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className={cn('text-2xl font-bold', colorClass)}>
                {value.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
