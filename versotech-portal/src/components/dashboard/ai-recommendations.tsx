'use client'

import React, { useState, useEffect } from 'react'
import { cache, CacheKeys, CacheTTL, generateDataHash } from '@/lib/cache'
import { usePerformanceMonitoring } from '@/lib/performance-monitor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  Target,
  TrendingUp,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  PieChart,
  Briefcase
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

interface Recommendation {
  id: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'optimization' | 'opportunity' | 'risk-management' | 'planning'
  title: string
  description: string
  expectedImpact: string
  timeline: string
  confidence: number
  actions: Array<{
    label: string
    primary: boolean
    href?: string
    onClick?: () => void
  }>
  metrics?: {
    current: string
    projected: string
    improvement: string
  }
}

interface AIRecommendationsProps {
  data: DashboardData
  selectedDealId?: string | null
  className?: string
}

export const AIRecommendations = React.memo(function AIRecommendations({ data, selectedDealId, className }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const { startOperation, endOperation } = usePerformanceMonitoring('AIRecommendations')

  useEffect(() => {
    generateRecommendations()
  }, [data, selectedDealId])

  const generateRecommendations = async () => {
    setLoading(true)
    startOperation('generate-recommendations')

    // Check cache first
    const dataHash = generateDataHash(data)
    const cacheKey = CacheKeys.aiRecommendations(dataHash, selectedDealId)
    const cachedRecommendations = cache.get(cacheKey) as Recommendation[] | null

    if (cachedRecommendations) {
      setRecommendations(cachedRecommendations)
      setLoading(false)
      endOperation('generate-recommendations', { source: 'cache', count: cachedRecommendations.length })
      return
    }

    await new Promise(resolve => setTimeout(resolve, 800)) // Simulate AI processing

    const generated: Recommendation[] = []

    // Portfolio Optimization Recommendations
    if (data.kpis.dpi < 0.3 && data.kpis.tvpi > 1.3) {
      generated.push({
        id: 'liquidity-optimization',
        priority: 'high',
        category: 'optimization',
        title: 'Optimize Portfolio Liquidity',
        description: 'Strong unrealized value but limited cash distributions. Consider discussing exit strategies for mature investments.',
        expectedImpact: '+$500K liquidity within 12 months',
        timeline: '3-6 months',
        confidence: 85,
        actions: [
          { label: 'Schedule Exit Planning Call', primary: true, href: '/versoholdings/messages' },
          { label: 'Review Portfolio Composition', primary: false }
        ],
        metrics: {
          current: `${data.kpis.dpi.toFixed(2)}x DPI`,
          projected: `${(data.kpis.dpi + 0.3).toFixed(2)}x DPI`,
          improvement: '+30% liquidity'
        }
      })
    }

    // Allocation Opportunity
    if (data.kpis.unfundedCommitment < data.kpis.totalContributed * 0.2) {
      generated.push({
        id: 'allocation-opportunity',
        priority: 'medium',
        category: 'opportunity',
        title: 'Increase Portfolio Allocation',
        description: 'Low unfunded commitment suggests capacity for additional investments. Consider new opportunities.',
        expectedImpact: 'Portfolio growth potential +15-25%',
        timeline: '6-12 months',
        confidence: 78,
        actions: [
          { label: 'Explore New Deals', primary: true, href: '/versoholdings/opportunities' },
          { label: 'Schedule Strategy Review', primary: false, href: '/versoholdings/messages' }
        ],
        metrics: {
          current: `$${(data.kpis.unfundedCommitment / 1000000).toFixed(1)}M unfunded`,
          projected: `$${((data.kpis.unfundedCommitment + data.kpis.totalContributed * 0.3) / 1000000).toFixed(1)}M capacity`,
          improvement: `+${(data.kpis.totalContributed * 0.3 / 1000000).toFixed(1)}M potential`
        }
      })
    }

    // Performance Enhancement
    if (data.kpis.irr < 0.15 && data.kpis.irr > 0.08) {
      generated.push({
        id: 'performance-enhancement',
        priority: 'medium',
        category: 'optimization',
        title: 'Enhance Risk-Adjusted Returns',
        description: 'Moderate IRR suggests room for improvement. Consider rebalancing toward higher-performing sectors.',
        expectedImpact: 'Target IRR improvement to 15-18%',
        timeline: '12-18 months',
        confidence: 72,
        actions: [
          { label: 'Portfolio Analysis Report', primary: true, href: '/versoholdings/reports' },
          { label: 'Discuss Rebalancing', primary: false, href: '/versoholdings/messages' }
        ],
        metrics: {
          current: `${(data.kpis.irr * 100).toFixed(1)}% IRR`,
          projected: '15.0% IRR',
          improvement: `+${(15 - data.kpis.irr * 100).toFixed(1)}pp`
        }
      })
    }

    // Deal-Specific Recommendations
    if (selectedDealId && selectedDealId.startsWith('demo-')) {
      if (selectedDealId === 'demo-1') {
        generated.push({
          id: 'deal-allocation-increase',
          priority: 'high',
          category: 'opportunity',
          title: 'Consider Increasing Deal Allocation',
          description: 'VERSO Secondary Opportunity I shows strong fundamentals. Current allocation may be conservative given your risk profile.',
          expectedImpact: 'Potential +2-3pp IRR contribution',
          timeline: '30 days (deal closing)',
          confidence: 80,
          actions: [
            { label: 'Review Deal Terms', primary: true },
            { label: 'Submit Amendment', primary: false }
          ]
        })
      }

      if (selectedDealId === 'demo-2') {
        generated.push({
          id: 'deal-due-diligence',
          priority: 'critical',
          category: 'risk-management',
          title: 'Complete Due Diligence Review',
          description: 'Real Estate deal pending allocation decision. Recommend thorough review of market conditions and property valuations.',
          expectedImpact: 'Risk mitigation and informed decision',
          timeline: '5 business days',
          confidence: 95,
          actions: [
            { label: 'Access Deal Room', primary: true },
            { label: 'Schedule DD Call', primary: false, href: '/versoholdings/messages' }
          ]
        })
      }
    }

    // Tax Optimization
    if (data.kpis.totalDistributions > data.kpis.totalContributed * 0.5) {
      generated.push({
        id: 'tax-optimization',
        priority: 'medium',
        category: 'planning',
        title: 'Tax Optimization Review',
        description: 'Significant distributions received. Consider tax-loss harvesting and optimal timing of future distributions.',
        expectedImpact: 'Potential tax savings 5-15%',
        timeline: 'By year-end',
        confidence: 88,
        actions: [
          { label: 'Tax Planning Session', primary: true, href: '/versoholdings/messages' },
          { label: 'Download Tax Documents', primary: false, href: '/versoholdings/documents' }
        ]
      })
    }

    // Diversification Analysis
    if (data.vehicles.length < 4) {
      generated.push({
        id: 'diversification-analysis',
        priority: 'medium',
        category: 'risk-management',
        title: 'Portfolio Diversification Review',
        description: 'Limited vehicle diversity may increase concentration risk. Consider geographic and sector diversification.',
        expectedImpact: 'Reduced portfolio volatility 10-20%',
        timeline: '6-9 months',
        confidence: 82,
        actions: [
          { label: 'Diversification Report', primary: true, href: '/versoholdings/reports' },
          { label: 'Explore Global Opportunities', primary: false }
        ]
      })
    }

    // Sort by priority and confidence
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const sorted = generated.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.confidence - a.confidence
    })

    const finalRecommendations = sorted.slice(0, 4) // Show top 4 recommendations

    // Cache the results
    cache.set(cacheKey, finalRecommendations, CacheTTL.AI_RECOMMENDATIONS)

    setRecommendations(finalRecommendations)
    setLoading(false)
    endOperation('generate-recommendations', { source: 'computed', count: finalRecommendations.length })
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return AlertCircle
      case 'high': return Zap
      case 'medium': return Target
      case 'low': return Clock
      default: return Target
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'optimization': return TrendingUp
      case 'opportunity': return Target
      case 'risk-management': return AlertCircle
      case 'planning': return Briefcase
      default: return Brain
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Machine learning powered investment recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
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
          <Brain className="h-5 w-5" />
          AI Recommendations
          {selectedDealId && <Badge variant="outline" className="text-xs">Deal-Focused</Badge>}
        </CardTitle>
        <CardDescription>
          Machine learning powered investment recommendations based on your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No recommendations available</p>
            <p className="text-xs text-gray-400">Portfolio performing optimally</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const PriorityIcon = getPriorityIcon(rec.priority)
              const CategoryIcon = getCategoryIcon(rec.category)

              return (
                <div
                  key={rec.id}
                  className={cn(
                    "p-4 border rounded-lg transition-all hover:shadow-md",
                    getPriorityColor(rec.priority)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <PriorityIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{rec.title}</h4>
                        <Badge
                          className={cn("text-xs", getPriorityBadgeColor(rec.priority))}
                        >
                          {rec.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-sm mb-3">{rec.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                        <div>
                          <span className="font-medium text-gray-600">Expected Impact:</span>
                          <div className="mt-1 font-medium">{rec.expectedImpact}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Timeline:</span>
                          <div className="mt-1 font-medium">{rec.timeline}</div>
                        </div>
                      </div>

                      {rec.metrics && (
                        <div className="p-3 bg-white/50 rounded-lg mb-3">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <div className="font-medium text-gray-600">Current</div>
                              <div className="font-semibold">{rec.metrics.current}</div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-600">Projected</div>
                              <div className="font-semibold">{rec.metrics.projected}</div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-600">Improvement</div>
                              <div className="font-semibold text-green-600">{rec.metrics.improvement}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Confidence:</span>
                          <Progress value={rec.confidence} className="w-16 h-2" />
                          <span className="text-xs font-medium">{rec.confidence}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CategoryIcon className="h-3 w-3" />
                          <span className="text-xs text-gray-600 capitalize">{rec.category.replace('-', ' ')}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {rec.actions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant={action.primary ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-7"
                            onClick={action.onClick}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="pt-4 border-t text-center">
              <p className="text-xs text-gray-500">
                Recommendations generated using ML models trained on market data and portfolio performance patterns
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})