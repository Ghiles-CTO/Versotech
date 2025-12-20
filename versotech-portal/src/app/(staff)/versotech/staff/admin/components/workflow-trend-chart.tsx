'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface WorkflowTrendChartProps {
  data: Array<{
    date: string
    total_runs: number
    completed: number
    failed: number
    success_rate: number
  }>
}

export function WorkflowTrendChart({ data }: WorkflowTrendChartProps) {
  // Format dates for display
  const chartData = (data || []).map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  // Calculate overall success rate
  const totalRuns = chartData.reduce((sum, d) => sum + d.total_runs, 0)
  const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0)
  const overallSuccessRate = totalRuns > 0 ? Math.round((totalCompleted / totalRuns) * 100) : 100

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{item.dateLabel}</p>
          <p className="text-emerald-400 text-sm">{item.success_rate}% success</p>
          <p className="text-zinc-400 text-xs mt-1">
            {item.completed}/{item.total_runs} completed
          </p>
          {item.failed > 0 && (
            <p className="text-red-400 text-xs">{item.failed} failed</p>
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
            <Zap className="h-4 w-4 text-purple-400" />
            <CardTitle className="text-sm font-medium text-white">Workflow Success (30d)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-zinc-500 text-sm">No workflow data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-700/50 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <CardTitle className="text-sm font-medium text-white">Workflow Success (30d)</CardTitle>
          </div>
          <span className={`text-xs font-medium ${
            overallSuccessRate >= 90 ? 'text-emerald-400' :
            overallSuccessRate >= 70 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {overallSuccessRate}% overall
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="dateLabel"
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={90} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Line
              type="monotone"
              dataKey="success_rate"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ fill: '#a855f7', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: '#a855f7', strokeWidth: 0, r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
