'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { TrendingUp, Wallet } from 'lucide-react'

interface AllocationData {
  name: string
  value: number
  percentage: number
}

interface PortfolioAllocationChartProps {
  data: AllocationData[]
}

// Sophisticated, muted color palette inspired by private wealth management
const COLORS = [
  { main: '#1e3a5f', light: '#2d4a6f', gradient: 'from-[#1e3a5f] to-[#2d5a8a]' },  // Deep navy
  { main: '#0d9488', light: '#14b8a6', gradient: 'from-[#0d9488] to-[#2dd4bf]' },  // Teal
  { main: '#7c3aed', light: '#8b5cf6', gradient: 'from-[#7c3aed] to-[#a78bfa]' },  // Violet
  { main: '#b45309', light: '#d97706', gradient: 'from-[#b45309] to-[#f59e0b]' },  // Amber
  { main: '#be185d', light: '#db2777', gradient: 'from-[#be185d] to-[#ec4899]' },  // Rose
  { main: '#059669', light: '#10b981', gradient: 'from-[#059669] to-[#34d399]' },  // Emerald
  { main: '#4f46e5', light: '#6366f1', gradient: 'from-[#4f46e5] to-[#818cf8]' },  // Indigo
  { main: '#dc2626', light: '#ef4444', gradient: 'from-[#dc2626] to-[#f87171]' },  // Red
]

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatLargeCurrency = (value: number) => {
  if (value >= 1000000) {
    return { value: (value / 1000000).toFixed(2), suffix: 'M' }
  }
  if (value >= 1000) {
    return { value: (value / 1000).toFixed(0), suffix: 'K' }
  }
  return { value: value.toFixed(0), suffix: '' }
}

// Custom active shape for hover state
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
          transition: 'all 0.3s ease-out',
        }}
      />
    </g>
  )
}

export function PortfolioAllocationChart({ data }: PortfolioAllocationChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const isEmpty = !data || data.length === 0

  const totalValue = data?.reduce((sum, item) => sum + item.value, 0) || 0
  const formattedTotal = formatLargeCurrency(totalValue)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  if (isEmpty) {
    return (
      <Card className="border border-gray-100 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-50 dark:border-zinc-800">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gray-100 dark:bg-zinc-800">
              <Wallet className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            Portfolio Allocation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[280px] text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-dashed border-gray-200 dark:border-zinc-700 flex items-center justify-center">
                <Wallet className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No allocation data</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Portfolio data will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-100 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-gray-50 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Portfolio Allocation
          </CardTitle>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {data.length} {data.length === 1 ? 'Vehicle' : 'Vehicles'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chart Section */}
          <div className="relative flex-shrink-0 mx-auto lg:mx-0">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length].main}
                      style={{
                        transition: 'all 0.3s ease-out',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Total</p>
                <p className="text-2xl font-bold text-foreground tracking-tight">
                  ${formattedTotal.value}
                  <span className="text-lg text-gray-500 dark:text-gray-400">{formattedTotal.suffix}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Legend / Breakdown Section */}
          <div className="flex-1 min-w-0">
            <div className="space-y-3">
              {data.map((item, index) => {
                const color = COLORS[index % COLORS.length]
                const isActive = activeIndex === index

                return (
                  <div
                    key={item.name}
                    className={`group relative p-3 rounded-lg transition-all duration-200 cursor-pointer
                      ${isActive
                        ? 'bg-gray-50 dark:bg-zinc-800 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700'
                        : 'hover:bg-gray-50/70 dark:hover:bg-zinc-800/50'
                      }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-3 h-3 rounded-sm flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-125' : ''}`}
                          style={{ backgroundColor: color.main }}
                        />
                        <span className={`text-sm font-medium truncate transition-colors duration-200 ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-sm font-semibold tabular-nums transition-colors duration-200 ${isActive ? 'text-foreground' : 'text-foreground/90'}`}>
                          {formatCurrency(item.value)}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums transition-all duration-200`}
                          style={{
                            backgroundColor: isActive ? color.main : `${color.main}15`,
                            color: isActive ? 'white' : color.main,
                          }}
                        >
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${item.percentage}%`,
                          background: `linear-gradient(90deg, ${color.main}, ${color.light})`,
                          boxShadow: isActive ? `0 0 8px ${color.main}40` : 'none',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Diversified across {data.length} vehicles
                </span>
                <span className="text-gray-400 dark:text-gray-500">
                  Updated today
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
