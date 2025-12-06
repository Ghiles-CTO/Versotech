import { unstable_cache as cache } from 'next/cache'
import { getStaffDashboardData, StaffDashboardData, DateRangeFilter } from './dashboard-data'

/**
 * Production-ready cache using Next.js cache API
 * Works correctly in serverless environments (Vercel, AWS Lambda, etc.)
 *
 * Cache strategy:
 * - TTL: 5 minutes (300 seconds)
 * - Tag: 'staff-dashboard' for targeted revalidation
 * - Revalidation: Can be triggered manually via revalidateTag()
 */

const CACHE_TTL = 300 // 5 minutes in seconds
const CACHE_TAG = 'staff-dashboard'

/**
 * Get cached staff dashboard data with optional date range filtering
 * @param dateRangeFilter - Optional date range to filter data
 * @param forceRefresh - If true, bypass cache and fetch fresh data
 */
export async function getCachedStaffDashboardData(
  dateRangeFilter?: DateRangeFilter,
  forceRefresh = false
): Promise<StaffDashboardData> {
  if (forceRefresh) {
    console.log('[Dashboard Cache] Force refresh requested, bypassing cache')
    return await getStaffDashboardData(dateRangeFilter)
  }

  // Create cache key that includes date range to ensure different ranges are cached separately
  const cacheKey = dateRangeFilter?.from || dateRangeFilter?.to
    ? `staff-dashboard-data-${dateRangeFilter.from?.toString()}-${dateRangeFilter.to?.toString()}`
    : 'staff-dashboard-data-default'

  // Create a cached version for this specific date range
  const getCachedDashboardData = cache(
    async () => {
      console.log('[Dashboard Cache] Fetching fresh data from database for range:', dateRangeFilter)
      return await getStaffDashboardData(dateRangeFilter)
    },
    [cacheKey],
    {
      revalidate: CACHE_TTL,
      tags: [CACHE_TAG]
    }
  )

  return await getCachedDashboardData()
}

/**
 * Invalidate dashboard cache
 * Use this when data changes that affect the dashboard
 *
 * @example
 * // After creating a new investor
 * await createInvestor(data)
 * await invalidateDashboardCache()
 */
export async function invalidateDashboardCache(): Promise<void> {
  const { revalidateTag } = await import('next/cache')
  // Next.js 16 requires cacheLife profile as second argument
  // Using { expire: 0 } for immediate cache expiration (not stale-while-revalidate)
  revalidateTag(CACHE_TAG, { expire: 0 })
  console.log('[Dashboard Cache] Cache invalidated')
}

/**
 * Granular cache invalidation based on table changes
 * Only invalidates if the table affects dashboard data
 *
 * @param tableName - The database table that was modified
 *
 * @example
 * // After updating investor data
 * await updateInvestor(id, data)
 * await invalidateByTable('investors')
 */
export async function invalidateByTable(tableName: string): Promise<void> {
  const tablesAffectingDashboard = [
    'investors',
    'tasks',
    'workflow_runs',
    'workflows',
    'deals',
    'request_tickets',
    'fee_events',
    'subscriptions'
  ]

  if (tablesAffectingDashboard.includes(tableName)) {
    console.log(`[Dashboard Cache] Table ${tableName} modified, invalidating cache`)
    await invalidateDashboardCache()
  }
}

/**
 * Get cache configuration for monitoring
 * Note: With Next.js cache, we don't have access to internal cache stats
 * This is a limitation of Next.js's cache abstraction
 */
export function getCacheConfig() {
  return {
    ttl: CACHE_TTL,
    tag: CACHE_TAG,
    strategy: 'next-js-cache',
    note: 'Using Next.js built-in cache (production-ready for serverless)'
  }
}
