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
import { cn } from '@/lib/utils'

interface WorkflowTrendChartProps {
  data: Array<{
    date: string
    total_runs: number
    completed: number
    failed: number
    success_rate: number
  }>
  isDark?: boolean
}

export function WorkflowTrendChart({ data, isDark = true }: WorkflowTrendChartProps) {
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
        <div className={cn(
          "rounded-lg p-3 shadow-lg border",
          isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200"
        )}>
          <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{item.dateLabel}</p>
          <p className="text-emerald-500 text-sm">{item.success_rate}% success</p>
          <p className={cn("text-xs mt-1", isDark ? "text-zinc-400" : "text-gray-500")}>
            {item.completed}/{item.total_runs} completed
          </p>
          {item.failed > 0 && (
            <p className="text-red-500 text-xs">{item.failed} failed</p>
          )}
        </div>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn(
        "h-full",
        isDark ? "bg-zinc-900/50 border-zinc-700/50" : "bg-white border-gray-200 shadow-sm"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <CardTitle className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>Workflow Success (30d)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className={cn("text-sm", isDark ? "text-zinc-500" : "text-gray-500")}>No workflow data</p>
        </CardContent>
      </Card>
    )
  }

  const axisStroke = isDark ? "#71717a" : "#9ca3af"

  return (
    <Card className={cn(
      "h-full",
      isDark ? "bg-zinc-900/50 border-zinc-700/50" : "bg-white border-gray-200 shadow-sm"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <CardTitle className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>Workflow Success (30d)</CardTitle>
          </div>
          <span className={`text-xs font-medium ${
            overallSuccessRate >= 90 ? 'text-emerald-500' :
            overallSuccessRate >= 70 ? 'text-amber-500' : 'text-red-500'
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
              stroke={axisStroke}
              fontSize={10}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              stroke={axisStroke}
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
