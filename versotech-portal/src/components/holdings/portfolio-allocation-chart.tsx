'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { TrendingUp, Wallet, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AllocationData {
  name: string
  value: number
  percentage: number
}

interface PortfolioAllocationChartProps {
  data: AllocationData[]
  maxVisibleItems?: number
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

// "Others" color - neutral gray
const OTHERS_COLOR = { main: '#6b7280', light: '#9ca3af', gradient: 'from-[#6b7280] to-[#9ca3af]' }

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

export function PortfolioAllocationChart({ data, maxVisibleItems = 6 }: PortfolioAllocationChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)
  const isEmpty = !data || data.length === 0

  const totalValue = data?.reduce((sum, item) => sum + item.value, 0) || 0
  const formattedTotal = formatLargeCurrency(totalValue)

  // Process data: show top N items + "Others" if there are more
  const { chartData, displayData, othersCount, othersValue } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], displayData: [], othersCount: 0, othersValue: 0 }
    }

    // Sort by value descending
    const sorted = [...data].sort((a, b) => b.value - a.value)

    if (sorted.length <= maxVisibleItems) {
      return { chartData: sorted, displayData: sorted, othersCount: 0, othersValue: 0 }
    }

    const topItems = sorted.slice(0, maxVisibleItems - 1)
    const otherItems = sorted.slice(maxVisibleItems - 1)
    const othersTotal = otherItems.reduce((sum, item) => sum + item.value, 0)
    const othersPercentage = totalValue > 0 ? (othersTotal / totalValue) * 100 : 0

    const othersItem: AllocationData = {
      name: `Others (${otherItems.length})`,
      value: othersTotal,
      percentage: othersPercentage
    }

    return {
      chartData: [...topItems, othersItem],
      displayData: showAll ? sorted : [...topItems, othersItem],
      othersCount: otherItems.length,
      othersValue: othersTotal
    }
  }, [data, maxVisibleItems, showAll, totalValue])

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  const getColorForIndex = (index: number, isOthers: boolean) => {
    if (isOthers) return OTHERS_COLOR
    return COLORS[index % COLORS.length]
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
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  activeIndex={activeIndex !== null && activeIndex < chartData.length ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartData.map((item, index) => {
                    const isOthers = item.name.startsWith('Others')
                    const color = getColorForIndex(index, isOthers)
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={color.main}
                        style={{
                          transition: 'all 0.3s ease-out',
                          cursor: 'pointer',
                        }}
                      />
                    )
                  })}
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
          <div className="flex-1 min-w-0 flex flex-col">
            <ScrollArea className={showAll && data.length > maxVisibleItems ? "h-[280px]" : ""}>
              <div className="space-y-2">
                {displayData.map((item, index) => {
                  const isOthers = item.name.startsWith('Others')
                  const color = getColorForIndex(index, isOthers)
                  const chartIndex = chartData.findIndex(c => c.name === item.name)
                  const isActive = activeIndex === chartIndex

                  return (
                    <div
                      key={`${item.name}-${index}`}
                      className={`group relative p-2.5 rounded-lg transition-all duration-200 cursor-pointer
                        ${isActive
                          ? 'bg-gray-50 dark:bg-zinc-800 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700'
                          : 'hover:bg-gray-50/70 dark:hover:bg-zinc-800/50'
                        }`}
                      onMouseEnter={() => setActiveIndex(chartIndex >= 0 ? chartIndex : null)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div
                            className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-125' : ''}`}
                            style={{ backgroundColor: color.main }}
                          />
                          <span className={`text-xs font-medium truncate transition-colors duration-200 ${isActive ? 'text-foreground' : 'text-foreground/80'}`} title={item.name}>
                            {item.name.length > 28 ? item.name.slice(0, 28) + '...' : item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className={`text-xs font-semibold tabular-nums transition-colors duration-200 ${isActive ? 'text-foreground' : 'text-foreground/90'}`}>
                            {formatCurrency(item.value)}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums transition-all duration-200"
                            style={{
                              backgroundColor: isActive ? color.main : `${color.main}15`,
                              color: isActive ? 'white' : color.main,
                            }}
                          >
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Show All / Collapse Toggle */}
            {othersCount > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1.5" />
                      Show Top {maxVisibleItems - 1} Only
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1.5" />
                      Show All {data.length} Vehicles
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Summary Footer */}
            <div className={`pt-3 border-t border-gray-100 dark:border-zinc-800 ${othersCount === 0 ? 'mt-3' : 'mt-0'}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {data.length} vehicles
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
