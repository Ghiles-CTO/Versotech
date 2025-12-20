'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface StaffActivityChartProps {
  data: Array<{
    staff_id: string
    name: string
    action_count: number
    last_action: string | null
  }>
}

export function StaffActivityChart({ data }: StaffActivityChartProps) {
  // Take top 8 staff members
  const chartData = (data || []).slice(0, 8).map((d) => ({
    name: d.name.length > 12 ? d.name.slice(0, 12) + '...' : d.name,
    fullName: d.name,
    actions: d.action_count,
    lastAction: d.last_action,
  }))

  const maxActions = Math.max(...chartData.map((d) => d.actions), 1)

  const getBarColor = (actions: number) => {
    const ratio = actions / maxActions
    if (ratio > 0.7) return '#10b981' // emerald-500
    if (ratio > 0.4) return '#3b82f6' // blue-500
    if (ratio > 0.1) return '#f59e0b' // amber-500
    return '#6b7280' // gray-500
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.fullName}</p>
          <p className="text-zinc-400 text-sm">{data.actions} actions (7d)</p>
          {data.lastAction && (
            <p className="text-zinc-500 text-xs mt-1">
              Last: {new Date(data.lastAction).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-700/50 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <CardTitle className="text-sm font-medium text-white">Staff Activity (7d)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-zinc-500 text-sm">No staff activity data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-700/50 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-400" />
          <CardTitle className="text-sm font-medium text-white">Staff Activity (7d)</CardTitle>
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
            <Bar dataKey="actions" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.actions)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
