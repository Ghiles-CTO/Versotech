'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CohortRow {
  cohort_week: string
  week_0: number
  week_1: number
  week_2: number
  week_3: number
  week_4: number
}

interface RetentionData {
  cohortMatrix: CohortRow[]
}

interface CohortMatrixProps {
  days: string
}

// Get background color based on retention percentage
function getRetentionBgColor(value: number): string {
  if (value === 0) return 'bg-muted'
  if (value >= 70) return 'bg-emerald-500/80 dark:bg-emerald-600/80'
  if (value >= 50) return 'bg-emerald-400/60 dark:bg-emerald-500/60'
  if (value >= 30) return 'bg-amber-400/60 dark:bg-amber-500/60'
  if (value >= 10) return 'bg-orange-400/60 dark:bg-orange-500/60'
  return 'bg-red-400/60 dark:bg-red-500/60'
}

// Get text color based on retention percentage
function getRetentionTextColor(value: number): string {
  if (value === 0) return 'text-muted-foreground'
  if (value >= 50) return 'text-white dark:text-white'
  return 'text-foreground'
}

const WEEK_HEADERS = ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4']

export function CohortMatrix({ days }: CohortMatrixProps) {
  const [data, setData] = useState<CohortRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/growth/retention?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch retention data')
        }
        const result = await response.json()
        if (result.success && result.data) {
          setData(result.data.cohortMatrix)
        } else {
          throw new Error(result.error || 'No data available')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-44" />
          </div>
          <Skeleton className="h-3 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-2 mb-3 pb-2 border-b">
              <Skeleton className="h-4 w-20" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16 mx-auto" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-2 py-2">
                <Skeleton className="h-4 w-16" />
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-10 w-full rounded" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Table2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Retention Cohort Matrix</CardTitle>
          </div>
          <CardDescription>
            Weekly cohort retention analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">Failed to load cohort data</p>
        </CardContent>
      </Card>
    )
  }

  // Reverse data to show oldest cohorts at top
  const sortedData = [...data].reverse()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Table2 className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Retention Cohort Matrix</CardTitle>
        </div>
        <CardDescription>
          Track how different weekly user cohorts retain over time. Higher percentages (green) indicate better retention.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Matrix Table */}
          <div className="min-w-[600px]">
            {/* Header Row */}
            <div className="grid grid-cols-6 gap-2 mb-3 pb-2 border-b">
              <div className="text-sm font-medium text-muted-foreground">
                Cohort
              </div>
              {WEEK_HEADERS.map((header) => (
                <div
                  key={header}
                  className="text-sm font-medium text-muted-foreground text-center"
                >
                  {header}
                </div>
              ))}
            </div>

            {/* Data Rows */}
            {sortedData.map((row, rowIndex) => {
              // Calculate which columns should be shown (based on how old the cohort is)
              const maxWeek = 4 - rowIndex

              return (
                <div key={row.cohort_week} className="grid grid-cols-6 gap-2 py-1">
                  {/* Cohort Label */}
                  <div className="flex items-center text-sm font-medium">
                    {row.cohort_week}
                  </div>

                  {/* Week Cells */}
                  {[row.week_0, row.week_1, row.week_2, row.week_3, row.week_4].map(
                    (value, weekIndex) => {
                      const isAvailable = weekIndex <= maxWeek
                      const bgColor = isAvailable ? getRetentionBgColor(value) : 'bg-muted/30'
                      const textColor = isAvailable ? getRetentionTextColor(value) : 'text-muted-foreground/50'

                      return (
                        <div
                          key={weekIndex}
                          className={cn(
                            'flex items-center justify-center h-10 rounded text-sm font-medium transition-colors',
                            bgColor,
                            textColor,
                            !isAvailable && 'opacity-40'
                          )}
                          title={
                            isAvailable
                              ? `${row.cohort_week} - Week ${weekIndex}: ${value}% retention`
                              : 'Not enough time has passed'
                          }
                        >
                          {isAvailable ? `${value}%` : '-'}
                        </div>
                      )
                    }
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t">
          <span className="text-xs text-muted-foreground">Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-emerald-500/80" />
            <span className="text-xs text-muted-foreground">70%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-emerald-400/60" />
            <span className="text-xs text-muted-foreground">50-69%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-amber-400/60" />
            <span className="text-xs text-muted-foreground">30-49%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-orange-400/60" />
            <span className="text-xs text-muted-foreground">10-29%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-400/60" />
            <span className="text-xs text-muted-foreground">&lt;10%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted" />
            <span className="text-xs text-muted-foreground">No data</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
