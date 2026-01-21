'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'

interface FeatureUsageData {
  feature: string
  count: number
}

interface FeatureUsageChartProps {
  days: string
}

// Color palette for bars - gradient from primary to lighter shades
const BAR_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.9)',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.7)',
  'hsl(var(--primary) / 0.65)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--primary) / 0.55)',
  'hsl(var(--primary) / 0.5)',
  'hsl(var(--primary) / 0.45)',
  'hsl(var(--primary) / 0.4)',
]

interface TooltipPayload {
  payload: FeatureUsageData
  value: number
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-3 w-56 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton
                className="h-6 flex-1"
                style={{ width: `${100 - i * 10}%` }}
              />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{data.feature}</p>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-medium text-primary">
            {data.count.toLocaleString()}
          </span>{' '}
          uses
        </p>
      </div>
    )
  }
  return null
}

export function FeatureUsageChart({ days }: FeatureUsageChartProps) {
  const [data, setData] = useState<FeatureUsageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeatureData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/growth/overview?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch feature usage data')
        }
        const result = await response.json()
        if (result.success && result.data?.featureUsage) {
          setData(result.data.featureUsage)
        } else {
          throw new Error(result.error || 'No feature usage data available')
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load feature usage data'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchFeatureData()
  }, [days])

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Feature Usage</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Feature Usage</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-sm text-muted-foreground">
            No feature usage data available
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate chart height based on data length (minimum 300px)
  const chartHeight = Math.max(data.length * 40 + 40, 300)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Feature Usage</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Top platform actions over the last {days} days
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/50"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="currentColor"
              className="text-muted-foreground"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="feature"
              stroke="currentColor"
              className="text-muted-foreground"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
