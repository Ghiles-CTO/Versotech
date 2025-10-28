import { CachePerformance } from './performance-monitor'

// Simple in-memory cache for client-side data
class SimpleCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

  set(key: string, data: unknown, ttlMs = 5 * 60 * 1000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  get(key: string): unknown | null {
    const item = this.cache.get(key)
    if (!item) {
      CachePerformance.recordMiss(key)
      return null
    }

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      CachePerformance.recordEviction(key, 'expired')
      return null
    }

    CachePerformance.recordHit(key, JSON.stringify(item.data).length)
    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new SimpleCache()

// Clean up expired cache entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}

// Helper function for cached API calls
export async function cachedFetch<T>(
  url: string, 
  options: RequestInit = {}, 
  ttlMs = 5 * 60 * 1000
): Promise<T> {
  const cacheKey = `fetch:${url}:${JSON.stringify(options)}`
  
  // Try to get from cache first
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached as T
  }

  // Fetch and cache
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  cache.set(cacheKey, data, ttlMs)

  return data
}

// Cache key generators for different data types
export const CacheKeys = {
  dashboardData: (investorIds: string[], dealId?: string | null) => {
    const base = `dashboard_${investorIds.sort().join('_')}`
    return dealId ? `${base}_deal_${dealId}` : base
  },

  performanceTrends: (investorIds: string[], period: string, dealId?: string | null) => {
    const base = `performance_${investorIds.sort().join('_')}_${period}`
    return dealId ? `${base}_deal_${dealId}` : base
  },

  smartInsights: (dataHash: string, dealId?: string | null) => {
    const base = `insights_${dataHash}`
    return dealId ? `${base}_deal_${dealId}` : base
  },

  aiRecommendations: (dataHash: string, dealId?: string | null) => {
    const base = `recommendations_${dataHash}`
    return dealId ? `${base}_deal_${dealId}` : base
  },

  dealList: (investorIds: string[]) => `deals_${investorIds.sort().join('_')}`,

  activityFeed: (investorIds: string[], dealId?: string | null) => {
    const base = `activity_${investorIds.sort().join('_')}`
    return dealId ? `${base}_deal_${dealId}` : base
  }
}

// TTL configurations for different data types
export const CacheTTL = {
  DASHBOARD_DATA: 2 * 60 * 1000,      // 2 minutes
  PERFORMANCE_TRENDS: 10 * 60 * 1000,  // 10 minutes
  SMART_INSIGHTS: 15 * 60 * 1000,      // 15 minutes
  AI_RECOMMENDATIONS: 15 * 60 * 1000,  // 15 minutes
  DEAL_LIST: 30 * 60 * 1000,           // 30 minutes
  ACTIVITY_FEED: 1 * 60 * 1000         // 1 minute
}

// Utility to generate data hash for cache invalidation
export function generateDataHash(data: any): string {
  const str = JSON.stringify(data, Object.keys(data).sort())
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}