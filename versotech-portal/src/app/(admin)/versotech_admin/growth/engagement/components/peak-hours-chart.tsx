'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts'

interface HourData {
  hour: number
  count: number
}

interface PeakHoursChartProps {
  days: string
}

// Format hour to readable string
function formatHour(hour: number): string {
  if (hour === 0) return '12am'
  if (hour === 12) return '12pm'
  if (hour < 12) return `${hour}am`
  return `${hour - 12}pm`
}

// Get color based on activity level (business hours highlighted)
function getBarColor(hour: number, maxCount: number, count: number): string {
  const intensity = maxCount > 0 ? count / maxCount : 0
  const isBusinessHours = hour >= 9 && hour <= 17

  if (isBusinessHours) {
    // Business hours: use primary color with intensity
    return `hsl(var(--primary) / ${0.4 + intensity * 0.6})`
  }
  // Non-business hours: use muted primary
  return `hsl(var(--primary) / ${0.2 + intensity * 0.4})`
}

interface TooltipPayload {
  payload: HourData
  value: number
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-44" />
        </div>
        <Skeleton className="h-3 w-56 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between h-[180px] pt-4 overflow-x-auto">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[28px]">
              <Skeleton
                className="w-5"
                style={{ height: `${20 + Math.random() * 120}px` }}
              />
              <Skeleton className="h-3 w-5" />
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
    const isBusinessHours = data.hour >= 9 && data.hour <= 17
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">
          {formatHour(data.hour)} - {formatHour((data.hour + 1) % 24)}
          {isBusinessHours && (
            <span className="text-xs text-muted-foreground ml-1">(Business Hours)</span>
          )}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-medium text-primary">
            {data.count.toLocaleString()}
          </span>{' '}
          actions
        </p>
      </div>
    )
  }
  return null
}

export function PeakHoursChart({ days }: PeakHoursChartProps) {
  const [data, setData] = useState<HourData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/growth/engagement?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch engagement data')
        }
        const result = await response.json()
        if (result.success && result.data?.peakHours) {
          setData(result.data.peakHours)
        } else {
          throw new Error(result.error || 'No engagement data available')
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load engagement data'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days])

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Peak Activity Hours</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
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
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Peak Activity Hours</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-muted-foreground">
            No hourly data available for this period
          </p>
        </CardContent>
      </Card>
    )
  }

  // Find max count for color intensity calculation
  const maxCount = Math.max(...data.map(d => d.count))

  // Find peak hour
  const peakHour = data.reduce((max, current) =>
    current.count > max.count ? current : max
  , data[0])

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">Peak Activity Hours</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hourly activity distribution (last {days} days)
            </p>
          </div>
          {/* Peak hour indicator */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Peak Hour</p>
            <p className="text-sm font-medium text-primary">
              {formatHour(peakHour.hour)} ({peakHour.count.toLocaleString()})
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/50"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              stroke="currentColor"
              className="text-muted-foreground"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={2}
              tickFormatter={formatHour}
            />
            <YAxis
              stroke="currentColor"
              className="text-muted-foreground"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            {/* Business hours indicator lines */}
            <ReferenceLine x={9} stroke="hsl(var(--primary) / 0.3)" strokeDasharray="3 3" />
            <ReferenceLine x={17} stroke="hsl(var(--primary) / 0.3)" strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.hour}`}
                  fill={getBarColor(entry.hour, maxCount, entry.count)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>Business Hours (9am-5pm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <span>Off Hours</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
