'use client'

import React, { useState, useEffect } from 'react'
import { cache, CacheKeys, CacheTTL, generateDataHash } from '@/lib/cache'
import { usePerformanceMonitoring } from '@/lib/performance-monitor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Clock,
  DollarSign,
  BarChart3,
  ChevronRight,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardData {
  kpis: {
    currentNAV: number
    totalContributed: number
    totalDistributions: number
    unfundedCommitment: number
    unrealizedGain: number
    unrealizedGainPct: number
    dpi: number
    tvpi: number
    irr: number
  }
  vehicles: any[]
  recentActivity: any[]
}

interface Insight {
  id: string
  type: 'opportunity' | 'warning' | 'info' | 'success'
  category: 'performance' | 'allocation' | 'risk' | 'opportunity' | 'timing'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  metrics?: {
    current: string
    target?: string
    benchmark?: string
  }
}

interface SmartInsightsProps {
  data: DashboardData
  selectedDealId?: string | null
  className?: string
}

export const SmartInsights = React.memo(function SmartInsights({ data, selectedDealId, className }: SmartInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const { startOperation, endOperation } = usePerformanceMonitoring('SmartInsights')

  useEffect(() => {
    generateInsights()
  }, [data, selectedDealId])

  const generateInsights = async () => {
    setLoading(true)
    startOperation('generate-insights')

    // Check cache first
    const dataHash = generateDataHash(data)
    const cacheKey = CacheKeys.smartInsights(dataHash, selectedDealId)
    const cachedInsights = cache.get(cacheKey) as Insight[] | null

    if (cachedInsights) {
      setInsights(cachedInsights)
      setLoading(false)
      endOperation('generate-insights', { source: 'cache', count: cachedInsights.length })
      return
    }

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500))

    const generatedInsights: Insight[] = []

    // Performance Insights
    if (data.kpis.tvpi > 1.5) {
      generatedInsights.push({
        id: 'performance-excellent',
        type: 'success',
        category: 'performance',
        title: 'Outstanding Portfolio Performance',
        description: `Your TVPI of ${data.kpis.tvpi.toFixed(2)}x significantly exceeds industry benchmarks, indicating excellent value creation.`,
        impact: 'high',
        actionable: true,
        action: {
          label: 'View Performance Details',
          href: '/versoholdings/reports'
        },
        metrics: {
          current: `${data.kpis.tvpi.toFixed(2)}x`,
          benchmark: '1.45x (Top Quartile)',
        }
      })
    } else if (data.kpis.tvpi < 1.2) {
      generatedInsights.push({
        id: 'performance-below-benchmark',
        type: 'warning',
        category: 'performance',
        title: 'Performance Below Target',
        description: `Current TVPI of ${data.kpis.tvpi.toFixed(2)}x is below median. Consider discussing portfolio strategy with your RM.`,
        impact: 'high',
        actionable: true,
        action: {
          label: 'Schedule RM Call',
          href: '/versoholdings/messages'
        },
        metrics: {
          current: `${data.kpis.tvpi.toFixed(2)}x`,
          target: '1.45x',
          benchmark: '1.2x (Median)'
        }
      })
    }

    // Liquidity Insights
    if (data.kpis.dpi < 0.2) {
      generatedInsights.push({
        id: 'liquidity-low',
        type: 'info',
        category: 'risk',
        title: 'Limited Realized Returns',
        description: 'Low DPI suggests most value remains unrealized. Monitor exit opportunities and distribution schedules.',
        impact: 'medium',
        actionable: true,
        action: {
          label: 'View Distribution Schedule'
        },
        metrics: {
          current: `${data.kpis.dpi.toFixed(2)}x`,
          benchmark: '0.35x (Industry Avg)'
        }
      })
    } else if (data.kpis.dpi > 0.8) {
      generatedInsights.push({
        id: 'liquidity-strong',
        type: 'success',
        category: 'performance',
        title: 'Strong Cash Generation',
        description: `DPI of ${data.kpis.dpi.toFixed(2)}x indicates excellent liquidity and realized value creation.`,
        impact: 'high',
        actionable: false,
        metrics: {
          current: `${data.kpis.dpi.toFixed(2)}x`,
          benchmark: '0.35x (Industry Avg)'
        }
      })
    }

    // Commitment Insights
    if (data.kpis.unfundedCommitment > data.kpis.totalContributed * 0.5) {
      generatedInsights.push({
        id: 'commitment-high',
        type: 'warning',
        category: 'allocation',
        title: 'Significant Unfunded Commitment',
        description: 'High unfunded commitment may require substantial capital deployment. Ensure liquidity planning.',
        impact: 'high',
        actionable: true,
        action: {
          label: 'Review Cash Flow Projections'
        },
        metrics: {
          current: `$${(data.kpis.unfundedCommitment / 1000000).toFixed(1)}M`
        }
      })
    }

    // Deal-Specific Insights
    if (selectedDealId && selectedDealId.startsWith('demo-')) {
      if (selectedDealId === 'demo-1') {
        generatedInsights.push({
          id: 'deal-opportunity',
          type: 'opportunity',
          category: 'opportunity',
          title: 'Deal Closing Soon',
          description: 'VERSO Secondary Opportunity I closes in 60 days. Consider increasing allocation if interested.',
          impact: 'high',
          actionable: true,
          action: {
            label: 'Review Deal Terms'
          }
        })
      } else if (selectedDealId === 'demo-2') {
        generatedInsights.push({
          id: 'deal-allocation-pending',
          type: 'info',
          category: 'timing',
          title: 'Allocation Decision Pending',
          description: 'Your allocation for Real Empire Growth Deal is pending review. Expect decision within 5 business days.',
          impact: 'medium',
          actionable: true,
          action: {
            label: 'Check Status'
          }
        })
      }
    }

    // Market Timing Insights
    if (data.kpis.irr > 0.20) {
      generatedInsights.push({
        id: 'irr-exceptional',
        type: 'success',
        category: 'performance',
        title: 'Exceptional Risk-Adjusted Returns',
        description: `IRR of ${(data.kpis.irr * 100).toFixed(1)}% places your portfolio in the top decile of private equity returns.`,
        impact: 'high',
        actionable: true,
        action: {
          label: 'Share Performance Report'
        },
        metrics: {
          current: `${(data.kpis.irr * 100).toFixed(1)}%`,
          benchmark: '12.5% (PE Average)'
        }
      })
    }

    // Diversification Insights
    if (data.vehicles.length < 3) {
      generatedInsights.push({
        id: 'diversification-low',
        type: 'warning',
        category: 'risk',
        title: 'Limited Diversification',
        description: 'Portfolio concentrated in few vehicles. Consider diversifying across strategies and geographies.',
        impact: 'medium',
        actionable: true,
        action: {
          label: 'Explore Opportunities',
          href: '/versoholdings/opportunities'
        }
      })
    }

    // Activity-Based Insights
    const recentHighImportanceActivity = data.recentActivity.filter(a => a.importance === 'high').length
    if (recentHighImportanceActivity > 2) {
      generatedInsights.push({
        id: 'activity-high',
        type: 'info',
        category: 'timing',
        title: 'High Portfolio Activity',
        description: `${recentHighImportanceActivity} urgent items require attention. Review and prioritize actions.`,
        impact: 'high',
        actionable: true,
        action: {
          label: 'View All Tasks',
          href: '/versoholdings/tasks'
        }
      })
    }

    // Sort insights by impact and type
    const sortedInsights = generatedInsights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      const typeOrder = { warning: 4, opportunity: 3, success: 2, info: 1 }

      if (impactOrder[a.impact] !== impactOrder[b.impact]) {
        return impactOrder[b.impact] - impactOrder[a.impact]
      }
      return typeOrder[b.type] - typeOrder[a.type]
    })

    const finalInsights = sortedInsights.slice(0, 6) // Show top 6 insights

    // Cache the results
    cache.set(cacheKey, finalInsights, CacheTTL.SMART_INSIGHTS)

    setInsights(finalInsights)
    setLoading(false)
    endOperation('generate-insights', { source: 'computed', count: finalInsights.length })
  }

  const getInsightIcon = (type: string, category: string) => {
    if (type === 'opportunity') return Target
    if (type === 'warning') return AlertTriangle
    if (type === 'success') return Star

    switch (category) {
      case 'performance': return TrendingUp
      case 'allocation': return DollarSign
      case 'risk': return AlertTriangle
      case 'timing': return Clock
      default: return Lightbulb
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'info': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your portfolio performance and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Insights
          {selectedDealId && <Badge variant="outline" className="text-xs">Deal-Focused</Badge>}
        </CardTitle>
        <CardDescription>
          {selectedDealId
            ? 'AI-powered insights for the selected deal'
            : 'AI-powered analysis of your portfolio performance and opportunities'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No insights available at the moment</p>
            <p className="text-xs text-gray-400">Check back after more portfolio activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.type, insight.category)
              return (
                <div
                  key={insight.id}
                  className={cn(
                    "p-4 border rounded-lg transition-all hover:shadow-md",
                    getInsightColor(insight.type)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge
                          variant="secondary"
                          className={cn("text-xs", getImpactBadgeColor(insight.impact))}
                        >
                          {insight.impact.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.category}
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{insight.description}</p>

                      {insight.metrics && (
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                          <span className="font-medium">Current: {insight.metrics.current}</span>
                          {insight.metrics.target && (
                            <span>Target: {insight.metrics.target}</span>
                          )}
                          {insight.metrics.benchmark && (
                            <span>Benchmark: {insight.metrics.benchmark}</span>
                          )}
                        </div>
                      )}

                      {insight.actionable && insight.action && (
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={insight.action.onClick}
                          >
                            {insight.action.label}
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="pt-4 border-t text-center">
              <p className="text-xs text-gray-500">
                Insights generated using portfolio data and market benchmarks • Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})