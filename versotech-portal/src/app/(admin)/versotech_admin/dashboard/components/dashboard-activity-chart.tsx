'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface ActivityDataPoint {
  date: string
  activeUsers: number
  label: string
}

interface DashboardActivityChartProps {
  days: string
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  )
}

interface TooltipPayload {
  payload: ActivityDataPoint
  value: number
}

function CustomTooltip({
  active,
  payload
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{formattedDate}</p>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-medium text-primary">{data.activeUsers.toLocaleString()}</span> active users
        </p>
      </div>
    )
  }
  return null
}

export function DashboardActivityChart({ days }: DashboardActivityChartProps) {
  const [data, setData] = useState<ActivityDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivityData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/metrics/dashboard?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch activity data')
        }
        const result = await response.json()
        if (result.success && result.data?.adminMetrics?.userActivityTrend) {
          setData(result.data.adminMetrics.userActivityTrend)
        } else {
          throw new Error(result.error || 'No activity data available')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity data')
      } finally {
        setLoading(false)
      }
    }

    fetchActivityData()
  }, [days])

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">User Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
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
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">User Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-sm text-muted-foreground">No activity data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate max value for Y-axis with some headroom
  const maxUsers = Math.max(...data.map((d) => d.activeUsers), 1)
  const yAxisMax = Math.ceil(maxUsers * 1.1)

  // Determine tick interval based on data length
  const tickInterval = days === '7' ? 0 : days === '30' ? 4 : 10

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Unique users with activity over the last {days} days
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/50"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="currentColor"
              className="text-muted-foreground"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
              dy={8}
            />
            <YAxis
              stroke="currentColor"
              className="text-muted-foreground"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, yAxisMax]}
              tickFormatter={(value) => value.toLocaleString()}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="activeUsers"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 5,
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
