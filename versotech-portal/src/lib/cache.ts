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
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

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