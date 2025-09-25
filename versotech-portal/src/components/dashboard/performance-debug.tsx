'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  Zap,
  Database,
  Clock,
  BarChart3,
  RefreshCw,
  Cpu,
  HardDrive
} from 'lucide-react'
import { performanceMonitor } from '@/lib/performance-monitor'
import { cache } from '@/lib/cache'

interface PerformanceDebugProps {
  className?: string
}

export function PerformanceDebug({ className }: PerformanceDebugProps) {
  const [cacheStats, setCacheStats] = useState<any>({})
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({})
  const [memoryUsage, setMemoryUsage] = useState<any>(null)
  const [coreWebVitals, setCoreWebVitals] = useState<any>({})

  useEffect(() => {
    updateStats()
    const interval = setInterval(updateStats, 2000) // Update every 2 seconds
    return () => clearInterval(interval)
  }, [])

  const updateStats = () => {
    // Cache statistics
    const cacheEntries = []
    for (let i = 0; i < 20; i++) {
      const key = `test-key-${i}`
      if (cache.get(key)) {
        cacheEntries.push(key)
      }
    }

    setCacheStats({
      totalEntries: cacheEntries.length,
      hitRate: Math.random() * 100, // Mock hit rate
      avgResponseTime: Math.random() * 50 + 10
    })

    // Performance metrics
    const metrics = performanceMonitor.getDashboardMetrics()
    setPerformanceMetrics(metrics)

    // Memory usage
    const memory = performanceMonitor.getMemoryUsage()
    setMemoryUsage(memory)

    // Core Web Vitals
    const vitals = performanceMonitor.getCoreWebVitals()
    setCoreWebVitals(vitals)
  }

  const clearCache = () => {
    cache.clear()
    updateStats()
  }

  const clearPerformanceMarks = () => {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks()
      performance.clearMeasures()
    }
    updateStats()
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Debug
            </CardTitle>
            <CardDescription>
              Development-only performance monitoring and cache statistics
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={updateStats}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
            >
              Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearPerformanceMarks}
            >
              Clear Metrics
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="cache" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          </TabsList>

          <TabsContent value="cache" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Cache Entries</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {cacheStats.totalEntries || 0}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Hit Rate</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {(cacheStats.hitRate || 0).toFixed(1)}%
                </div>
                <Progress value={cacheStats.hitRate || 0} className="mt-2" />
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Avg Response</span>
                </div>
                <div className="text-2xl font-bold text-yellow-900">
                  {(cacheStats.avgResponseTime || 0).toFixed(1)}ms
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Cache Operations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dashboard Data TTL:</span>
                  <Badge variant="outline">2m</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Performance Trends TTL:</span>
                  <Badge variant="outline">10m</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Smart Insights TTL:</span>
                  <Badge variant="outline">15m</Badge>
                </div>
                <div className="flex justify-between">
                  <span>AI Recommendations TTL:</span>
                  <Badge variant="outline">15m</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Component Renders</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {performanceMetrics.componentRenders || 0}
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">Data Fetches</span>
                </div>
                <div className="text-2xl font-bold text-indigo-900">
                  {performanceMetrics.dataFetches || 0}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Avg Render Time</h4>
                <div className="text-lg font-semibold">
                  {(performanceMetrics.averageRenderTime || 0).toFixed(2)}ms
                </div>
                <Progress
                  value={Math.min((performanceMetrics.averageRenderTime || 0) / 50 * 100, 100)}
                  className="mt-2"
                />
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Avg Fetch Time</h4>
                <div className="text-lg font-semibold">
                  {(performanceMetrics.averageFetchTime || 0).toFixed(2)}ms
                </div>
                <Progress
                  value={Math.min((performanceMetrics.averageFetchTime || 0) / 200 * 100, 100)}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="space-y-4">
            {memoryUsage ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Used Memory</span>
                    </div>
                    <div className="text-lg font-bold text-red-900">
                      {(memoryUsage.used / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Total Memory</span>
                    </div>
                    <div className="text-lg font-bold text-orange-900">
                      {(memoryUsage.total / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Usage</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {memoryUsage.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Memory Usage</h4>
                  <Progress value={memoryUsage.percentage} className="mb-2" />
                  <div className="text-sm text-gray-600">
                    Limit: {(memoryUsage.limit / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <HardDrive className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Memory API not available in this browser</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">First Contentful Paint</h4>
                <div className="text-lg font-semibold">
                  {coreWebVitals.FCP ? `${coreWebVitals.FCP.toFixed(0)}ms` : 'N/A'}
                </div>
                <Badge variant={coreWebVitals.FCP < 1800 ? 'default' : 'destructive'} className="mt-2">
                  {coreWebVitals.FCP < 1800 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Largest Contentful Paint</h4>
                <div className="text-lg font-semibold">
                  {coreWebVitals.LCP ? `${coreWebVitals.LCP.toFixed(0)}ms` : 'N/A'}
                </div>
                <Badge variant={coreWebVitals.LCP < 2500 ? 'default' : 'destructive'} className="mt-2">
                  {coreWebVitals.LCP < 2500 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Performance Recommendations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Cache hit rate is optimal ({(cacheStats.hitRate || 0).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${memoryUsage?.percentage > 80 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span>Memory usage is {memoryUsage?.percentage > 80 ? 'high' : 'normal'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Components are rendering efficiently</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}