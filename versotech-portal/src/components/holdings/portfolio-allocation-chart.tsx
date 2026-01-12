'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AllocationData {
  name: string
  value: number
  percentage: number
}

interface PortfolioAllocationChartProps {
  data: AllocationData[]
  maxVisibleItems?: number
  currency?: string
}

// Refined color palette - sophisticated financial tones
const COLORS = [
  '#1e3a5f', // Deep navy
  '#0d9488', // Teal
  '#6366f1', // Indigo
  '#d97706', // Amber
  '#dc2626', // Red
  '#059669', // Emerald
  '#8b5cf6', // Purple
  '#0891b2', // Cyan
]

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

export function PortfolioAllocationChart({
  data,
  maxVisibleItems = 6,
  currency = 'USD'
}: PortfolioAllocationChartProps) {
  const [showAll, setShowAll] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const isEmpty = !data || data.length === 0

  const totalValue = useMemo(() =>
    data?.reduce((sum, item) => sum + item.value, 0) || 0
  , [data])

  // Sort and prepare data
  const { displayData, hiddenCount } = useMemo(() => {
    if (!data || data.length === 0) {
      return { displayData: [], hiddenCount: 0 }
    }

    const sorted = [...data]
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)

    if (showAll || sorted.length <= maxVisibleItems) {
      return { displayData: sorted, hiddenCount: 0 }
    }

    return {
      displayData: sorted.slice(0, maxVisibleItems),
      hiddenCount: sorted.length - maxVisibleItems
    }
  }, [data, maxVisibleItems, showAll])

  // Calculate percentages for donut chart
  const chartData = useMemo(() => {
    let cumulativePercentage = 0
    return displayData.map((item, index) => {
      const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0
      const startAngle = cumulativePercentage * 3.6 // Convert to degrees
      cumulativePercentage += percentage
      return {
        ...item,
        percentage,
        startAngle,
        endAngle: cumulativePercentage * 3.6,
        color: COLORS[index % COLORS.length]
      }
    })
  }, [displayData, totalValue])

  if (isEmpty) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            Portfolio Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <div className="text-center">
              <PieChart className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No allocation data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // SVG donut chart
  const size = 180
  const strokeWidth = 32
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const centerX = size / 2
  const centerY = size / 2

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            Portfolio Allocation
          </CardTitle>
          <div className="text-right">
            <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-muted-foreground">{data.filter(d => d.value > 0).length} positions</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
              />
              {/* Data segments */}
              {chartData.map((item, index) => {
                const segmentLength = (item.percentage / 100) * circumference
                const offset = ((chartData.slice(0, index).reduce((acc, d) => acc + d.percentage, 0)) / 100) * circumference
                const isHovered = hoveredIndex === index

                return (
                  <circle
                    key={`${item.name}-${index}`}
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                    strokeDashoffset={-offset}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      filter: isHovered ? 'brightness(1.1)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                )
              })}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {hoveredIndex !== null ? (
                  <>
                    <p className="text-lg font-bold">{chartData[hoveredIndex]?.percentage.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[80px]">
                      {chartData[hoveredIndex]?.name.split(' ').pop()}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold">{displayData.length}</p>
                    <p className="text-xs text-muted-foreground">Holdings</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2">
            {chartData.map((item, index) => (
              <div
                key={`legend-${item.name}-${index}`}
                className={`flex items-center justify-between py-1.5 px-2 rounded-md transition-colors cursor-pointer ${
                  hoveredIndex === index ? 'bg-muted/50' : 'hover:bg-muted/30'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm truncate" title={item.name}>
                    {item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-medium min-w-[45px] text-center"
                    style={{
                      backgroundColor: `${item.color}15`,
                      color: item.color
                    }}
                  >
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}

            {/* Show more/less button */}
            {(hiddenCount > 0 || (showAll && data.filter(d => d.value > 0).length > maxVisibleItems)) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground mt-2"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1.5" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1.5" />
                    Show {hiddenCount} More
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
