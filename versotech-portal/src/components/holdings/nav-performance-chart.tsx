'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useChartColors } from '@/lib/theme-colors'

interface PerformanceDataPoint {
  date: string
  value: number
  displayDate: string
}

interface NAVPerformanceChartProps {
  data: PerformanceDataPoint[]
  currency?: string
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short'
  }).format(value)
}

export function NAVPerformanceChart({ data, currency = 'USD' }: NAVPerformanceChartProps) {
  const chartColors = useChartColors()
  const isEmpty = !data || data.length === 0

  if (isEmpty) {
    return (
      <Card className="border-0 shadow-md bg-gradient-to-br from-muted/50 to-background">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            NAV Performance
          </CardTitle>
          <CardDescription className="text-muted-foreground">Portfolio value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[320px] text-muted-foreground/50">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No performance data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-muted/50 to-background">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          NAV Performance
        </CardTitle>
        <CardDescription className="text-muted-foreground">Portfolio value over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: chartColors.axis }}
              tickLine={false}
              axisLine={{ stroke: chartColors.axisLine }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: chartColors.axis }}
              tickLine={false}
              axisLine={{ stroke: chartColors.axisLine }}
              tickFormatter={(value) => formatCurrency(value as number, currency)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background p-4 border border-border rounded-lg shadow-lg">
                      <p className="font-semibold text-foreground mb-2">{data.displayDate}</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        NAV: {formatCurrency(data.value, currency)}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColors.success}
              strokeWidth={3}
              dot={{ fill: chartColors.success, r: 4, strokeWidth: 2, stroke: chartColors.line.dot }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: chartColors.line.dot }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
