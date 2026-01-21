'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from 'lucide-react'
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

interface DayData {
  day: number
  dayName: string
  count: number
}

interface EngagementByDayChartProps {
  days: string
}

// Color coding: weekend days (Sat, Sun) vs weekdays
function getBarColor(dayIndex: number): string {
  // 0 = Sunday, 6 = Saturday (weekends)
  const isWeekend = dayIndex === 0 || dayIndex === 6
  return isWeekend ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--primary))'
}

interface TooltipPayload {
  payload: DayData
  value: number
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-3 w-52 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between h-[250px] pt-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton
                className="w-10"
                style={{ height: `${60 + Math.random() * 120}px` }}
              />
              <Skeleton className="h-3 w-8" />
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
    const isWeekend = data.day === 0 || data.day === 6
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">
          {data.dayName}
          {isWeekend && <span className="text-muted-foreground ml-1">(Weekend)</span>}
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

export function EngagementByDayChart({ days }: EngagementByDayChartProps) {
  const [data, setData] = useState<DayData[]>([])
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
        if (result.success && result.data?.engagementByDay) {
          // Reorder to start with Monday (day 1) instead of Sunday (day 0)
          const sorted = [...result.data.engagementByDay].sort((a: DayData, b: DayData) => {
            // Convert so Monday=0, Tuesday=1, ..., Sunday=6
            const aOrder = a.day === 0 ? 6 : a.day - 1
            const bOrder = b.day === 0 ? 6 : b.day - 1
            return aOrder - bOrder
          })
          setData(sorted)
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
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Engagement by Day</CardTitle>
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
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Engagement by Day</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-sm text-muted-foreground">
            No engagement data available for this period
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Engagement by Day</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Activity distribution across weekdays (last {days} days)
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/50"
              vertical={false}
            />
            <XAxis
              dataKey="dayName"
              stroke="currentColor"
              className="text-muted-foreground"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <YAxis
              stroke="currentColor"
              className="text-muted-foreground"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={`cell-${entry.day}`} fill={getBarColor(entry.day)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>Weekdays</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/50" />
            <span>Weekends</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
