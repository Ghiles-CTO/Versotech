'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart as PieChartIcon } from 'lucide-react'

interface UserSegment {
  segment: string
  count: number
}

interface UserSegmentsChartProps {
  days: string
}

// Color palette for segments - semantically meaningful colors
const SEGMENT_COLORS: Record<string, string> = {
  'Power Users': '#059669', // Emerald - high engagement
  'Regular': '#3b82f6', // Blue - steady engagement
  'Occasional': '#f59e0b', // Amber - moderate engagement
  'At Risk': '#ef4444', // Red - at risk of churning
}

const DEFAULT_COLORS = ['#1e3a5f', '#0d9488', '#6366f1', '#d97706']

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-3 w-48 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <Skeleton className="h-[180px] w-[180px] rounded-full" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function UserSegmentsChart({ days }: UserSegmentsChartProps) {
  const [data, setData] = useState<UserSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    async function fetchSegmentData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/growth/overview?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch segment data')
        }
        const result = await response.json()
        if (result.success && result.data?.userSegments) {
          setData(result.data.userSegments)
        } else {
          throw new Error(result.error || 'No segment data available')
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load segment data'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSegmentData()
  }, [days])

  // Calculate total and percentages
  const { total, chartData } = useMemo(() => {
    const totalCount = data.reduce((sum, item) => sum + item.count, 0)
    let cumulativePercentage = 0

    const computed = data.map((item, index) => {
      const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0
      const startAngle = cumulativePercentage
      cumulativePercentage += percentage
      const color =
        SEGMENT_COLORS[item.segment] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]

      return {
        ...item,
        percentage,
        startAngle,
        endAngle: cumulativePercentage,
        color,
      }
    })

    return { total: totalCount, chartData: computed }
  }, [data])

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">User Segments</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0 || total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">User Segments</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-sm text-muted-foreground">
            No user segment data available
          </p>
        </CardContent>
      </Card>
    )
  }

  // SVG donut chart dimensions
  const size = 180
  const strokeWidth = 32
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const centerX = size / 2
  const centerY = size / 2

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">User Segments</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Users grouped by engagement level ({days} day period)
        </p>
      </CardHeader>
      <CardContent>
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
                const offset =
                  (chartData
                    .slice(0, index)
                    .reduce((acc, d) => acc + d.percentage, 0) /
                    100) *
                  circumference
                const isHovered = hoveredIndex === index

                return (
                  <circle
                    key={`${item.segment}-${index}`}
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
                    <p className="text-lg font-bold">
                      {chartData[hoveredIndex]?.percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[80px]">
                      {chartData[hoveredIndex]?.segment}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold">{total.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2">
            {chartData.map((item, index) => (
              <div
                key={`legend-${item.segment}-${index}`}
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
                  <span className="text-sm">{item.segment}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-sm font-medium">
                    {item.count.toLocaleString()}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-medium min-w-[45px] text-center"
                    style={{
                      backgroundColor: `${item.color}15`,
                      color: item.color,
                    }}
                  >
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
