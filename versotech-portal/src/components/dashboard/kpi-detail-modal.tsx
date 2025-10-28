'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown, Minus, Info, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KPIDetail {
  title: string
  value: string | number
  description: string
  icon?: LucideIcon
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
    period: string
  }
  breakdown: Array<{
    label: string
    value: string | number
    percentage?: number
    change?: string
  }>
  benchmark?: {
    label: string
    value: string
    comparison: 'above' | 'below' | 'equal'
  }
  historicalData?: Array<{
    period: string
    value: number
  }>
  insights?: string[]
  relatedMetrics?: Array<{
    name: string
    value: string
    change: string
  }>
}

interface KPIDetailModalProps {
  isOpen: boolean
  onClose: () => void
  kpiData: KPIDetail | null
}

export function KPIDetailModal({ isOpen, onClose, kpiData }: KPIDetailModalProps) {
  if (!kpiData) return null

  const Icon = kpiData.icon || DollarSign
  const TrendIcon = kpiData.trend?.direction === 'up' ? TrendingUp :
                   kpiData.trend?.direction === 'down' ? TrendingDown : Minus

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50">
              <Icon className="h-7 w-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">{kpiData.title}</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {kpiData.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Main Value Section */}
        <div className="mb-10">
          <Card>
            <CardHeader className="pb-8">
              <CardTitle className="text-xl font-semibold text-gray-800 uppercase tracking-wide">Current Value</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Main Value */}
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900 mb-6">
                  {typeof kpiData.value === 'number'
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(kpiData.value)
                    : kpiData.value
                  }
                </div>

                {kpiData.trend && (
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <TrendIcon className={cn(
                      "h-8 w-8",
                      kpiData.trend.direction === 'up' ? "text-green-600" :
                      kpiData.trend.direction === 'down' ? "text-red-600" : "text-gray-600"
                    )} />
                    <span className={cn(
                      "text-2xl font-semibold",
                      kpiData.trend.direction === 'up' ? "text-green-600" :
                      kpiData.trend.direction === 'down' ? "text-red-600" : "text-gray-600"
                    )}>
                      {kpiData.trend.value} {kpiData.trend.period}
                    </span>
                  </div>
                )}
              </div>

              {/* Benchmark */}
              {kpiData.benchmark && (
                <div className="text-center p-8 bg-gray-50 rounded-xl max-w-md mx-auto">
                  <div className="text-base font-medium text-gray-500 mb-4 uppercase tracking-wide">
                    {kpiData.benchmark.label}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">{kpiData.benchmark.value}</div>
                  <Badge
                    variant={
                      kpiData.benchmark.comparison === 'above' ? 'default' :
                      kpiData.benchmark.comparison === 'below' ? 'destructive' : 'secondary'
                    }
                    className="text-base font-medium px-6 py-2"
                  >
                    {kpiData.benchmark.comparison === 'above' ? 'Above' :
                     kpiData.benchmark.comparison === 'below' ? 'Below' : 'At'} Benchmark
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Section */}
        <div className="mb-10">
          <Card>
            <CardHeader className="pb-8">
              <CardTitle className="text-xl font-semibold text-gray-800 uppercase tracking-wide">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {kpiData.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-8 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="font-bold text-2xl text-gray-900 mb-2">{item.label}</div>
                      {item.percentage && (
                        <div className="text-lg text-gray-500">
                          {item.percentage.toFixed(1)}% of total
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-8">
                      <div className="font-bold text-3xl text-gray-900 mb-2">
                        {typeof item.value === 'number'
                          ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(item.value)
                          : item.value
                        }
                      </div>
                      {item.change && (
                        <div className={cn(
                          "text-lg font-semibold",
                          item.change.startsWith('+') ? "text-green-600" :
                          item.change.startsWith('-') ? "text-red-600" : "text-gray-600"
                        )}>
                          {item.change}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Metrics */}
        {kpiData.relatedMetrics && kpiData.relatedMetrics.length > 0 && (
          <div className="mb-10">
            <Card>
              <CardHeader className="pb-8">
                <CardTitle className="text-xl font-semibold text-gray-800 uppercase tracking-wide">Related Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {kpiData.relatedMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-8 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex-1">
                        <div className="font-bold text-2xl text-gray-900 mb-2">{metric.name}</div>
                      </div>
                      <div className="text-right ml-8">
                        <div className="font-bold text-4xl text-gray-900 mb-2">{metric.value}</div>
                        <div className={cn(
                          "text-lg font-semibold",
                          metric.change.startsWith('+') ? "text-green-600" :
                          metric.change.startsWith('-') ? "text-red-600" : "text-gray-600"
                        )}>
                          {metric.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Insights */}
        {kpiData.insights && kpiData.insights.length > 0 && (
          <div className="mb-10">
            <Card>
              <CardHeader className="pb-8">
                <CardTitle className="text-xl font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-4">
                  <Info className="h-7 w-7 text-blue-600" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-8">
                  {kpiData.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-6 text-lg">
                      <div className="h-4 w-4 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end pt-8 border-t border-gray-100 mt-8">
          <Button onClick={onClose} variant="outline" size="lg">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}