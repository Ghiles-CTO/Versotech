'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface PerformanceDataPoint {
  date: string
  value: number
  displayDate: string
}

interface NAVPerformanceChartProps {
  data: PerformanceDataPoint[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short'
  }).format(value)
}

export function NAVPerformanceChart({ data }: NAVPerformanceChartProps) {
  const isEmpty = !data || data.length === 0

  if (isEmpty) {
    return (
      <Card className="border-0 shadow-md bg-gradient-to-br from-gray-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            NAV Performance
          </CardTitle>
          <CardDescription className="text-gray-600">Portfolio value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[320px] text-gray-400">
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
    <Card className="border-0 shadow-md bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          NAV Performance
        </CardTitle>
        <CardDescription className="text-gray-600">Portfolio value over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-900 mb-2">{data.displayDate}</p>
                      <p className="text-sm text-emerald-600 font-medium">
                        NAV: {formatCurrency(data.value)}
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
              stroke="#059669"
              strokeWidth={3}
              dot={{ fill: '#059669', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
