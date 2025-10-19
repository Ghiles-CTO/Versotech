'use client'

import React from 'react'

// Performance monitoring utilities for the dashboard
interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric>()
  private observers: PerformanceObserver[] = []

  constructor() {
    // Only run on client side
    if (typeof window !== 'undefined') {
      this.setupObservers()
    }
  }

  private setupObservers() {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordMetric('page_load', navEntry.loadEventEnd - navEntry.fetchStart, {
              type: 'navigation',
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
              firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0
            })
          }
        }
      })

      try {
        navigationObserver.observe({ type: 'navigation', buffered: true })
        this.observers.push(navigationObserver)
      } catch (e) {
        console.warn('Navigation observer not supported')
      }

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('_next') || entry.name.includes('chunk')) {
            this.recordMetric(`resource_${entry.name.split('/').pop()}`, entry.duration, {
              type: 'resource',
              size: (entry as any).transferSize || 0
            })
          }
        }
      })

      try {
        resourceObserver.observe({ type: 'resource', buffered: true })
        this.observers.push(resourceObserver)
      } catch (e) {
        console.warn('Resource observer not supported')
      }
    }
  }

  // Start timing a custom metric
  startTiming(name: string, metadata?: Record<string, any>) {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    })
  }

  // End timing and record the metric
  endTiming(name: string, additionalMetadata?: Record<string, any>) {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`No timing started for metric: ${name}`)
      return
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration
    metric.metadata = { ...metric.metadata, ...additionalMetadata }

    this.recordMetric(name, duration, metric.metadata)
    this.metrics.delete(name)

    return duration
  }

  // Record a one-off metric
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${name}`, {
        value: `${value.toFixed(2)}ms`,
        metadata
      })
    }

    // Store in performance buffer for analytics
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        performance.mark(`verso-${name}`, {
          detail: { value, metadata }
        })
      } catch (e) {
        // Fallback for older browsers
        performance.mark(`verso-${name}`)
      }
    }
  }

  // Get Core Web Vitals
  getCoreWebVitals() {
    const vitals = {
      FCP: 0, // First Contentful Paint
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0  // Cumulative Layout Shift
    }

    // Get paint metrics
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcp) vitals.FCP = fcp.startTime

    // Get navigation metrics
    const navigationEntries = performance.getEntriesByType('navigation')
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0] as PerformanceNavigationTiming
      // Use domContentLoaded as a proxy for LCP if not available
      vitals.LCP = nav.domContentLoadedEventEnd - nav.fetchStart
    }

    return vitals
  }

  // Get dashboard-specific metrics
  getDashboardMetrics() {
    const marks = performance.getEntriesByType('mark').filter(mark =>
      mark.name.startsWith('verso-')
    )

    const dashboardMetrics = {
      componentRenders: marks.filter(m => m.name.includes('render')).length,
      dataFetches: marks.filter(m => m.name.includes('fetch')).length,
      cacheHits: marks.filter(m => m.name.includes('cache-hit')).length,
      averageRenderTime: 0,
      averageFetchTime: 0
    }

    // Calculate averages
    const renderTimes = marks.filter(m => m.name.includes('render')).map(m =>
      (m as any).detail?.value || 0
    )
    if (renderTimes.length > 0) {
      dashboardMetrics.averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
    }

    const fetchTimes = marks.filter(m => m.name.includes('fetch')).map(m =>
      (m as any).detail?.value || 0
    )
    if (fetchTimes.length > 0) {
      dashboardMetrics.averageFetchTime = fetchTimes.reduce((a, b) => a + b, 0) / fetchTimes.length
    }

    return dashboardMetrics
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }
    }
    return null
  }

  // Cleanup method
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Performance wrapper for React components
export function withPerformanceMonitoring<T extends Record<string, any>>(
  componentName: string,
  Component: React.ComponentType<T>
) {
  return function PerformanceWrappedComponent(props: T) {
    const renderCount = React.useRef(0)

    React.useEffect(() => {
      performanceMonitor.startTiming(`${componentName}-mount`)
      return () => {
        performanceMonitor.endTiming(`${componentName}-mount`)
      }
    }, [])

    React.useEffect(() => {
      renderCount.current += 1
      performanceMonitor.recordMetric(`${componentName}-render`, performance.now(), {
        renderCount: renderCount.current
      })
    })

    return React.createElement(Component, props)
  }
}

// Hook for performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  const renderCount = React.useRef(0)
  const componentRef = React.useRef(componentName)

  // Update component name ref if it changes
  React.useEffect(() => {
    componentRef.current = componentName
  }, [componentName])

  // Track render performance on each render using ref (no state updates)
  React.useEffect(() => {
    renderCount.current += 1
    const renderTime = performance.now()

    // Only record every 5th render to avoid excessive logging
    if (renderCount.current % 5 === 1) {
      performanceMonitor.recordMetric(`${componentRef.current}-render`, renderTime, {
        renderCount: renderCount.current
      })
    }
  })

  const startOperation = React.useCallback((operationName: string) => {
    performanceMonitor.startTiming(`${componentRef.current}-${operationName}`)
  }, [])

  const endOperation = React.useCallback((operationName: string, metadata?: Record<string, any>) => {
    return performanceMonitor.endTiming(`${componentRef.current}-${operationName}`, metadata)
  }, [])

  const recordMetric = React.useCallback((name: string, value: number, metadata?: Record<string, any>) => {
    performanceMonitor.recordMetric(`${componentRef.current}-${name}`, value, metadata)
  }, [])

  return {
    renderCount: renderCount.current,
    startOperation,
    endOperation,
    recordMetric
  }
}

// Cache performance utilities
export const CachePerformance = {
  recordHit: (cacheKey: string, dataSize?: number) => {
    performanceMonitor.recordMetric('cache-hit', performance.now(), {
      key: cacheKey,
      size: dataSize
    })
  },

  recordMiss: (cacheKey: string) => {
    performanceMonitor.recordMetric('cache-miss', performance.now(), {
      key: cacheKey
    })
  },

  recordEviction: (cacheKey: string, reason: string) => {
    performanceMonitor.recordMetric('cache-eviction', performance.now(), {
      key: cacheKey,
      reason
    })
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, waitMs)
  }
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limitMs)
    }
  }
}

export default performanceMonitor

export const monitor = performanceMonitor

export function measureTime<T>(label: string, fn: () => T): T {
  performanceMonitor.startTiming(label)
  try {
    const result = fn()
    performanceMonitor.endTiming(label)
    return result
  } catch (error) {
    performanceMonitor.endTiming(label)
    throw error
  }
}

export async function measureTimeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  performanceMonitor.startTiming(label)
  try {
    const result = await fn()
    performanceMonitor.endTiming(label)
    return result
  } catch (error) {
    performanceMonitor.endTiming(label)
    throw error
  }
}

export function createPerformanceLogger(componentName: string) {
  return {
    logOperation: (operationName: string, fn: () => void) => {
      measureTime(`component:${componentName}:${operationName}`, fn)
    },
    logAsyncOperation: (operationName: string, fn: () => Promise<unknown>) => {
      return measureTimeAsync(`component:${componentName}:${operationName}`, fn)
    }
  }
}
