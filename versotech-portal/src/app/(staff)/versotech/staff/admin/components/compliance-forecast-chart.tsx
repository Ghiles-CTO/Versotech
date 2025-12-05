'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ComplianceForecastChartProps {
  data: {
    next_7_days: number
    next_30_days: number
    next_90_days: number
    total: number
  }
}

export function ComplianceForecastChart({ data }: ComplianceForecastChartProps) {
  const chartData = [
    { name: 'Next 7d', value: data?.next_7_days || 0, color: '#ef4444', urgency: 'critical' },
    { name: 'Next 30d', value: data?.next_30_days || 0, color: '#f59e0b', urgency: 'high' },
    { name: 'Next 90d', value: data?.next_90_days || 0, color: '#3b82f6', urgency: 'medium' },
  ]

  const total = data?.total || 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{item.name}</p>
          <p className="text-zinc-400 text-sm">{item.value} KYC expirations</p>
          <p className={`text-xs mt-1 ${
            item.urgency === 'critical' ? 'text-red-400' :
            item.urgency === 'high' ? 'text-amber-400' : 'text-blue-400'
          }`}>
            {item.urgency === 'critical' ? 'Requires immediate action' :
             item.urgency === 'high' ? 'Plan renewal soon' : 'Monitor'}
          </p>
        </div>
      )
    }
    return null
  }

  if (total === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-700/50 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-sm font-medium text-white">Compliance Forecast</CardTitle>
            </div>
            <span className="text-xs text-emerald-400">All clear</span>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <p className="text-emerald-400 text-2xl font-bold">0</p>
            <p className="text-zinc-500 text-sm">No upcoming KYC expirations</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-700/50 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-sm font-medium text-white">Compliance Forecast</CardTitle>
          </div>
          <span className="text-xs text-zinc-400">{total} expiring</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <XAxis type="number" stroke="#71717a" fontSize={10} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#71717a"
              fontSize={10}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
