'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, UserCheck, UsersRound, Activity, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface GrowthMetrics {
  dau: number
  wau: number
  mau: number
  stickiness: number
  avgSessionDuration: number
}

interface GrowthKPICardsProps {
  days: string
}

interface KPIConfig {
  key: keyof GrowthMetrics
  label: string
  icon: LucideIcon
  format: (value: number) => string
  description: string
}

const KPI_CONFIGS: KPIConfig[] = [
  {
    key: 'dau',
    label: 'Daily Active Users',
    icon: Users,
    format: (v) => v.toLocaleString(),
    description: 'Unique users active today',
  },
  {
    key: 'wau',
    label: 'Weekly Active Users',
    icon: UserCheck,
    format: (v) => v.toLocaleString(),
    description: 'Unique users in last 7 days',
  },
  {
    key: 'mau',
    label: 'Monthly Active Users',
    icon: UsersRound,
    format: (v) => v.toLocaleString(),
    description: 'Unique users in last 30 days',
  },
  {
    key: 'stickiness',
    label: 'Stickiness',
    icon: Activity,
    format: (v) => `${v.toFixed(1)}%`,
    description: 'DAU/MAU ratio',
  },
  {
    key: 'avgSessionDuration',
    label: 'Avg Session',
    icon: Clock,
    format: (v) => `${v} min`,
    description: 'Average session duration',
  },
]

function KPICardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  )
}

export function GrowthKPICards({ days }: GrowthKPICardsProps) {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/growth/overview?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch growth metrics')
        }
        const result = await response.json()
        if (result.success && result.data) {
          setMetrics(result.data)
        } else {
          throw new Error(result.error || 'No data available')
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {KPI_CONFIGS.map((config) => {
        const value = metrics[config.key]
        return (
          <Card key={config.key}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <config.icon className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{config.format(value)}</p>
              <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
