'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertTriangle, ArrowDown, CheckCircle2, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BiggestDropoff {
  fromStage: string
  toStage: string
  dropRate: number
}

interface DropoffAnalysisProps {
  data?: BiggestDropoff
}

export function DropoffAnalysis({ data }: DropoffAnalysisProps) {
  const [dropoff, setDropoff] = useState<BiggestDropoff | null>(data || null)
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (data) {
      setDropoff(data)
      return
    }

    async function fetchData() {
      try {
        const response = await fetch('/api/admin/growth/funnel')
        if (!response.ok) throw new Error('Failed to fetch funnel data')
        const result = await response.json()
        setDropoff(result.data.biggestDropoff)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Drop-off Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <BarChart3 className="h-5 w-5" />
            Drop-off Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // No significant drop-off or no data
  if (!dropoff || !dropoff.fromStage || dropoff.dropRate === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
            Drop-off Analysis
          </CardTitle>
          <CardDescription>
            Identify the biggest conversion bottleneck in your funnels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30 mb-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
              Great Conversion Flow!
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              No significant drop-off detected in your funnels. Keep up the good work!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Determine severity based on drop rate
  const getSeverity = (rate: number) => {
    if (rate >= 70) return { level: 'critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800' }
    if (rate >= 50) return { level: 'high', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-800' }
    if (rate >= 30) return { level: 'medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800' }
    return { level: 'low', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' }
  }

  const severity = getSeverity(dropoff.dropRate)

  return (
    <Card className={cn('border-2', severity.border)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className={cn('h-5 w-5', severity.color)} />
          Drop-off Analysis
        </CardTitle>
        <CardDescription>
          Identify the biggest conversion bottleneck in your funnels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-6">
          {/* Drop-off percentage badge */}
          <div className={cn('rounded-full p-6 mb-6', severity.bg)}>
            <div className="text-center">
              <span className={cn('text-4xl font-bold', severity.color)}>
                {dropoff.dropRate}%
              </span>
              <p className={cn('text-sm font-medium mt-1', severity.color)}>
                Drop-off Rate
              </p>
            </div>
          </div>

          {/* Stage transition visualization */}
          <div className="flex flex-col items-center space-y-2 w-full max-w-xs">
            {/* From stage */}
            <div className="w-full px-4 py-3 rounded-lg bg-muted text-center">
              <span className="font-medium">{dropoff.fromStage}</span>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center py-1">
              <ArrowDown className={cn('h-6 w-6', severity.color)} />
            </div>

            {/* To stage */}
            <div className="w-full px-4 py-3 rounded-lg bg-muted text-center">
              <span className="font-medium">{dropoff.toStage}</span>
            </div>
          </div>

          {/* Insight text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground max-w-md">
              {dropoff.dropRate >= 70 && (
                <>
                  <span className="font-semibold text-red-600 dark:text-red-400">Critical:</span>{' '}
                  Users are abandoning at this step. Consider simplifying the process or adding guidance.
                </>
              )}
              {dropoff.dropRate >= 50 && dropoff.dropRate < 70 && (
                <>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">High priority:</span>{' '}
                  This step needs attention. Review the user experience and identify friction points.
                </>
              )}
              {dropoff.dropRate >= 30 && dropoff.dropRate < 50 && (
                <>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Moderate:</span>{' '}
                  There&apos;s room for improvement at this transition. Consider A/B testing different approaches.
                </>
              )}
              {dropoff.dropRate < 30 && (
                <>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Minor:</span>{' '}
                  This is your biggest drop-off but it&apos;s within acceptable range. Monitor for changes.
                </>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
