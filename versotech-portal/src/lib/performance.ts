// Performance monitoring utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTiming(label: string): () => void {
    const start = performance.now()
    
    return () => {
      const end = performance.now()
      const duration = end - start
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, [])
      }
      
      this.metrics.get(label)?.push(duration)
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(label)!
      if (measurements.length > 100) {
        measurements.shift()
      }

      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
      }
    }
  }

  getMetrics(label: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics.get(label)
    if (!measurements || measurements.length === 0) return null

    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length
    const min = Math.min(...measurements)
    const max = Math.max(...measurements)

    return { avg, min, max, count: measurements.length }
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    
    for (const [label] of this.metrics) {
      const metrics = this.getMetrics(label)
      if (metrics) {
        result[label] = metrics
      }
    }
    
    return result
  }

  clear(): void {
    this.metrics.clear()
  }
}

// Convenience functions
export const monitor = PerformanceMonitor.getInstance()

export function measureTime<T>(label: string, fn: () => T): T {
  const endTiming = monitor.startTiming(label)
  try {
    const result = fn()
    endTiming()
    return result
  } catch (error) {
    endTiming()
    throw error
  }
}

export async function measureTimeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const endTiming = monitor.startTiming(label)
  try {
    const result = await fn()
    endTiming()
    return result
  } catch (error) {
    endTiming()
    throw error
  }
}

// React hook for performance monitoring (client-side only)
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

// Bundle size tracking
export function trackBundleSize() {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    // Track memory usage if available
    const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
    if (memory) {
      console.log('Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      })
    }
  }
}