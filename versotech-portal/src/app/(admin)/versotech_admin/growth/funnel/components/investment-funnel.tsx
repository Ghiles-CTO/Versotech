'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingDown, ArrowRight, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FunnelStage {
  stage: string
  count: number
  pctOfTotal: number
  pctOfPrevious: number
}

interface InvestmentFunnelProps {
  data?: FunnelStage[]
}

// Color gradient for funnel bars (from dark to light blue)
const FUNNEL_COLORS = [
  'bg-blue-600',
  'bg-blue-500',
  'bg-blue-400',
  'bg-blue-300',
  'bg-emerald-500', // Final stage gets a success color
]

export function InvestmentFunnel({ data }: InvestmentFunnelProps) {
  const [stages, setStages] = useState<FunnelStage[]>([])
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (data) {
      setStages(data)
      return
    }

    async function fetchData() {
      try {
        const response = await fetch('/api/admin/growth/funnel')
        if (!response.ok) throw new Error('Failed to fetch funnel data')
        const result = await response.json()
        setStages(result.data.investmentFunnel)
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
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            Investment Funnel
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
            <DollarSign className="h-5 w-5" />
            Investment Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = stages[0]?.count || 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-500" />
          Investment Funnel
        </CardTitle>
        <CardDescription>
          Track investor journey from deal discovery to allocation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stages.length === 0 || maxCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingDown className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No funnel data available yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Data will appear once investors start engaging with deals
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const widthPercent = maxCount > 0
                ? Math.max((stage.count / maxCount) * 100, 5) // Minimum 5% width for visibility
                : 0
              const isLastStage = index === stages.length - 1
              const conversionRate = stage.pctOfPrevious

              return (
                <div key={stage.stage} className="space-y-1">
                  {/* Stage header */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stage.stage}</span>
                      {index > 0 && (
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            conversionRate >= 50
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : conversionRate >= 25
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          )}
                        >
                          {conversionRate}% conv.
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {stage.count.toLocaleString()}
                      </span>
                      <span className="text-xs">
                        {stage.pctOfTotal}% of total
                      </span>
                    </div>
                  </div>

                  {/* Funnel bar */}
                  <div className="relative">
                    <div
                      className={cn(
                        'h-10 rounded transition-all duration-500',
                        FUNNEL_COLORS[index] || FUNNEL_COLORS[FUNNEL_COLORS.length - 1],
                        isLastStage && 'animate-pulse'
                      )}
                      style={{ width: `${widthPercent}%` }}
                    >
                      {/* Inner gradient overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded" />
                    </div>

                    {/* Connection arrow to next stage */}
                    {index < stages.length - 1 && (
                      <div className="absolute -bottom-3 left-4 text-muted-foreground/50">
                        <ArrowRight className="h-4 w-4 rotate-90" />
                      </div>
                    )}
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
