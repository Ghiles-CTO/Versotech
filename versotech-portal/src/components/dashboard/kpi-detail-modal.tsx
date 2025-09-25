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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">{kpiData.title}</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {kpiData.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Value & Trend */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Current Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
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
                  <div className="flex items-center gap-2">
                    <TrendIcon className={cn(
                      "h-4 w-4",
                      kpiData.trend.direction === 'up' ? "text-green-600" :
                      kpiData.trend.direction === 'down' ? "text-red-600" : "text-gray-600"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      kpiData.trend.direction === 'up' ? "text-green-600" :
                      kpiData.trend.direction === 'down' ? "text-red-600" : "text-gray-600"
                    )}>
                      {kpiData.trend.value} {kpiData.trend.period}
                    </span>
                  </div>
                )}

                {kpiData.benchmark && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-500 mb-1">
                      {kpiData.benchmark.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{kpiData.benchmark.value}</span>
                      <Badge
                        variant={
                          kpiData.benchmark.comparison === 'above' ? 'default' :
                          kpiData.benchmark.comparison === 'below' ? 'destructive' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {kpiData.benchmark.comparison === 'above' ? 'Above' :
                         kpiData.benchmark.comparison === 'below' ? 'Below' : 'At'} Benchmark
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Breakdown */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {kpiData.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.label}</div>
                        {item.percentage && (
                          <div className="text-xs text-gray-500">
                            {item.percentage.toFixed(1)}% of total
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
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
                            "text-xs",
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
        </div>

        {/* Related Metrics */}
        {kpiData.relatedMetrics && kpiData.relatedMetrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Related Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpiData.relatedMetrics.map((metric, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="font-semibold text-lg">{metric.value}</div>
                    <div className="text-sm text-gray-600 mb-1">{metric.name}</div>
                    <div className={cn(
                      "text-xs",
                      metric.change.startsWith('+') ? "text-green-600" :
                      metric.change.startsWith('-') ? "text-red-600" : "text-gray-600"
                    )}>
                      {metric.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights */}
        {kpiData.insights && kpiData.insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {kpiData.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}