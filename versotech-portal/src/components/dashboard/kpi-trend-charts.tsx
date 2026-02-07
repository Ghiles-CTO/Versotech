'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Users,
  AlertTriangle,
  Workflow,
  CheckCircle,
  Calendar,
  RefreshCw,
  Download,
  Maximize2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'

interface DataPoint {
  date: string
  value: number
  label?: string
}

interface KPIMetric {
  id: string
  label: string
  currentValue: number | string
  previousValue: number | string
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  data: {
    '7d': DataPoint[]
    '30d': DataPoint[]
    '90d': DataPoint[]
  }
  icon: any
  color: string
  format?: 'number' | 'percent' | 'currency'
}

// Mini sparkline component for inline charts
function Sparkline({
  data,
  color = 'text-slate-400',
  height = 40,
  width = 120
}: {
  data: DataPoint[]
  color?: string
  height?: number
  width?: number
}) {
  if (!data || data.length === 0) return null

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d.value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" className={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" className={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="currentColor"
        className={color}
        strokeWidth="2"
        points={points}
      />
      <polygon
        fill={`url(#${gradientId})`}
        points={`${points} ${width},${height} 0,${height}`}
      />
      {/* Data points */}
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((d.value - min) / range) * height
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill="currentColor"
            className={cn(color, "opacity-60")}
          />
        )
      })}
    </svg>
  )
}

// Large chart component
function TrendChart({
  data,
  color,
  format = 'number',
  currencyCode = ''
}: {
  data: DataPoint[]
  color: string
  format?: 'number' | 'percent' | 'currency'
  currencyCode?: string
}) {
  if (!data || data.length === 0) return null

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const width = 500
  const height = 200
  const padding = 40

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
    const y = padding + (1 - (d.value - min) / range) * (height - 2 * padding)
    return { x, y, ...d }
  })

  const pathData = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')

  const formatValue = (value: number) => {
    if (format === 'percent') return `${value}%`
    if (format === 'currency') {
      if (!currencyCode) return value.toLocaleString()
      return formatCurrency(value, currencyCode)
    }
    return value.toLocaleString()
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(i => {
          const y = padding + i * (height - 2 * padding)
          const value = max - i * range
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="currentColor"
                className="text-white/5"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={y + 4}
                className="text-[10px] fill-slate-500"
                textAnchor="end"
              >
                {formatValue(value)}
              </text>
            </g>
          )
        })}

        {/* X-axis labels */}
        {points.filter((_, i) => i % Math.ceil(points.length / 5) === 0).map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - padding + 20}
            className="text-[10px] fill-slate-500"
            textAnchor="middle"
          >
            {p.label || p.date}
          </text>
        ))}

        {/* Area fill */}
        <path
          d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`}
          fill="currentColor"
          className={cn(color, "opacity-10")}
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          className={color}
          strokeWidth="2"
        />

        {/* Data points with hover */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="currentColor"
              className={cn(color, "opacity-80")}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r="12"
              fill="transparent"
              className="cursor-pointer hover:fill-white/10"
            >
              <title>{`${p.date}: ${formatValue(p.value)}`}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function KPITrendCharts({
  className,
  onRefresh,
  currencyCode = ''
}: {
  className?: string
  onRefresh?: () => void
  currencyCode?: string
}) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  const formatMetricValue = (value: number | string, format?: 'number' | 'percent' | 'currency') => {
    if (typeof value !== 'number') return value
    if (format === 'percent') return `${value}%`
    if (format === 'currency') {
      if (!currencyCode) return value.toLocaleString()
      return formatCurrency(value, currencyCode)
    }
    return value.toLocaleString()
  }

  // Generate sample data (in real app, this would come from API)
  const generateTrendData = (baseValue: number, variance: number, points: number): DataPoint[] => {
    const data: DataPoint[] = []
    const now = new Date()

    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      const value = baseValue + (Math.random() - 0.5) * variance + (i * variance * 0.01)

      data.push({
        date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        value: Math.round(value),
        label: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      })
    }

    return data
  }

  const kpiMetrics: KPIMetric[] = [
    {
      id: 'active-lps',
      label: 'Active LPs',
      currentValue: 52,
      previousValue: 48,
      change: 8.3,
      changeType: 'increase',
      data: {
        '7d': generateTrendData(50, 5, 7),
        '30d': generateTrendData(45, 10, 30),
        '90d': generateTrendData(40, 15, 90)
      },
      icon: Users,
      color: 'text-sky-400',
      format: 'number'
    },
    {
      id: 'pending-kyc',
      label: 'Pending KYC',
      currentValue: 8,
      previousValue: 12,
      change: -33.3,
      changeType: 'decrease',
      data: {
        '7d': generateTrendData(10, 3, 7),
        '30d': generateTrendData(15, 5, 30),
        '90d': generateTrendData(20, 8, 90)
      },
      icon: AlertTriangle,
      color: 'text-amber-400',
      format: 'number'
    },
    {
      id: 'workflow-runs',
      label: 'Workflow Runs',
      currentValue: 234,
      previousValue: 189,
      change: 23.8,
      changeType: 'increase',
      data: {
        '7d': generateTrendData(30, 10, 7),
        '30d': generateTrendData(200, 50, 30),
        '90d': generateTrendData(150, 100, 90)
      },
      icon: Workflow,
      color: 'text-purple-400',
      format: 'number'
    },
    {
      id: 'compliance-rate',
      label: 'Compliance Rate',
      currentValue: 94.5,
      previousValue: 91.2,
      change: 3.6,
      changeType: 'increase',
      data: {
        '7d': generateTrendData(93, 2, 7),
        '30d': generateTrendData(90, 5, 30),
        '90d': generateTrendData(85, 10, 90)
      },
      icon: CheckCircle,
      color: 'text-emerald-400',
      format: 'percent'
    }
  ]

  const handleRefresh = async () => {
    setIsLoading(true)
    await onRefresh?.()
    setTimeout(() => setIsLoading(false), 1000)
  }

  const filteredMetrics = selectedMetric === 'all'
    ? kpiMetrics
    : kpiMetrics.filter(m => m.id === selectedMetric)

  return (
    <Card className={cn(
      'bg-black/95 backdrop-blur-xl border-white/10',
      className
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-sky-400" />
              KPI Trends
            </CardTitle>
            <CardDescription className="text-slate-400">
              Performance metrics over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[140px] h-8 bg-black/50 border-white/10 text-slate-200">
                <SelectValue placeholder="All Metrics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                {kpiMetrics.map(metric => (
                  <SelectItem key={metric.id} value={metric.id}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
              <TabsList className="h-8 bg-black/50 border border-white/10">
                <TabsTrigger value="7d" className="text-xs">7D</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs">30D</TabsTrigger>
                <TabsTrigger value="90d" className="text-xs">90D</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              className="h-8 border-white/10 text-slate-200 hover:bg-white/10"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Compact view for all metrics */}
        {selectedMetric === 'all' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMetrics.map(metric => {
              const Icon = metric.icon
              return (
                <div
                  key={metric.id}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", metric.color)} />
                      <span className="text-sm font-medium text-slate-200">
                        {metric.label}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs border",
                        metric.changeType === 'increase'
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : metric.changeType === 'decrease'
                          ? "border-red-500/30 bg-red-500/10 text-red-300"
                          : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                      )}
                    >
                      {metric.changeType === 'increase' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {metric.changeType === 'decrease' && <TrendingDown className="h-3 w-3 mr-1" />}
                      {metric.changeType === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
                      {Math.abs(metric.change)}%
                    </Badge>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {formatMetricValue(metric.currentValue, metric.format)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        vs {metric.previousValue} last period
                      </div>
                    </div>
                    <Sparkline
                      data={metric.data[selectedPeriod]}
                      color={metric.color}
                      height={40}
                      width={100}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Detailed view for single metric */
          <div>
            {filteredMetrics.map(metric => {
              const Icon = metric.icon
              return (
                <div key={metric.id} className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-white/10")}>
                        <Icon className={cn("h-5 w-5", metric.color)} />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">
                          {formatMetricValue(metric.currentValue, metric.format)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {metric.label}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-sm px-3 py-1 border",
                        metric.changeType === 'increase'
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : metric.changeType === 'decrease'
                          ? "border-red-500/30 bg-red-500/10 text-red-300"
                          : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                      )}
                    >
                      {metric.changeType === 'increase' && <TrendingUp className="h-4 w-4 mr-1" />}
                      {metric.changeType === 'decrease' && <TrendingDown className="h-4 w-4 mr-1" />}
                      {metric.changeType === 'neutral' && <Minus className="h-4 w-4 mr-1" />}
                      {Math.abs(metric.change)}% from last period
                    </Badge>
                  </div>

                  <div className="p-4 rounded-lg border border-white/10 bg-black/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-slate-300">
                        {selectedPeriod === '7d' && 'Last 7 Days'}
                        {selectedPeriod === '30d' && 'Last 30 Days'}
                        {selectedPeriod === '90d' && 'Last 90 Days'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-slate-400 hover:text-white"
                        >
                          <Maximize2 className="h-3 w-3 mr-1" />
                          Expand
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-slate-400 hover:text-white"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <TrendChart
                      data={metric.data[selectedPeriod]}
                      color={metric.color}
                      format={metric.format}
                      currencyCode={currencyCode}
                    />
                  </div>

                  {/* Additional insights */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-500 mb-1">Average</div>
                      <div className="text-lg font-semibold text-white">
                        {Math.round(metric.data[selectedPeriod].reduce((a, b) => a + b.value, 0) / metric.data[selectedPeriod].length)}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-500 mb-1">Peak</div>
                      <div className="text-lg font-semibold text-white">
                        {Math.max(...metric.data[selectedPeriod].map(d => d.value))}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-500 mb-1">Low</div>
                      <div className="text-lg font-semibold text-white">
                        {Math.min(...metric.data[selectedPeriod].map(d => d.value))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
