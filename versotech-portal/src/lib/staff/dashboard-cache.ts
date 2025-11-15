import { getStaffDashboardData } from './dashboard-data'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface StaffDashboardData {
  generatedAt: string
  kpis: {
    activeLps: number
    pendingKyc: number
    highPriorityKyc: number
    workflowRunsThisMonth: number
    complianceRate: number
  }
  pipeline: {
    kycPending: number
    ndaInProgress: number
    subscriptionReview: number
    nextCapitalCall?: {
      name: string
      dueDate: string
    }
  }
  processCenter: {
    activeWorkflows: number
  }
  management: {
    activeDeals: number
    activeRequests: number
    complianceRate: number
    activeInvestors: number
  }
  recentActivity: Array<{
    id: string
    title: string
    description: string | null
    activityType: string | null
    createdAt: string
  }>
  errors?: string[]
}

// In-memory cache store
class DashboardCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes in milliseconds

  // Get data from cache if valid
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if cache has expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  // Set data in cache
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  // Clear specific cache entry
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getStats(): {
    size: number
    keys: string[]
    entries: Array<{ key: string; age: number; ttl: number }>
  } {
    const now = Date.now()
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl
    }))

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries
    }
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
const dashboardCache = new DashboardCache()

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    dashboardCache.cleanup()
  }, 60 * 1000)
}

// Cached version of dashboard data fetcher
export async function getCachedStaffDashboardData(
  forceRefresh = false
): Promise<StaffDashboardData> {
  const cacheKey = 'staff-dashboard-data'

  // Check cache first unless force refresh is requested
  if (!forceRefresh) {
    const cached = dashboardCache.get<StaffDashboardData>(cacheKey)
    if (cached) {
      console.log('[Dashboard Cache] Cache hit')
      return cached
    }
  }

  console.log('[Dashboard Cache] Cache miss, fetching fresh data')

  // Fetch fresh data
  const data = await fetchStaffDashboardData()

  // Store in cache
  dashboardCache.set(cacheKey, data)

  return data
}

// Use the original working function from dashboard-data.ts
async function fetchStaffDashboardData(): Promise<StaffDashboardData> {
  // Just call the original working function
  return await getStaffDashboardData()
}

// Cache invalidation hooks for specific events
export function invalidateDashboardCache(): void {
  dashboardCache.invalidate('staff-dashboard-data')
}

// Granular cache invalidation based on table changes
export function invalidateByTable(tableName: string): void {
  // For now, invalidate the whole dashboard cache
  // In future, we could cache individual sections
  const tablesAffectingDashboard = [
    'investors',
    'tasks',
    'workflow_runs',
    'capital_calls',
    'workflows',
    'deals',
    'request_tickets',
    'activity_feed'
  ]

  if (tablesAffectingDashboard.includes(tableName)) {
    invalidateDashboardCache()
  }
}

// Export cache stats for monitoring
export function getCacheStats() {
  return dashboardCache.getStats()
}