import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Mock Supabase client
export const mockSupabaseClient = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockReturnValue({
          data: null,
          error: null
        })
      }),
      in: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            data: [],
            error: null
          })
        })
      }),
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          data: [],
          error: null
        })
      })
    }),
    insert: vi.fn().mockReturnValue({
      data: null,
      error: null
    }),
    update: vi.fn().mockReturnValue({
      data: null,
      error: null
    }),
    delete: vi.fn().mockReturnValue({
      data: null,
      error: null
    })
  }),
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue('SUBSCRIBED')
  }),
  removeChannel: vi.fn()
}

// Mock the Supabase client module
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

// Mock the cache module
export const mockCache = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  has: vi.fn(),
  size: vi.fn().mockReturnValue(0)
}

vi.mock('@/lib/cache', () => ({
  cache: mockCache,
  CacheKeys: {
    dashboardData: vi.fn().mockReturnValue('dashboard-data'),
    performanceTrends: vi.fn().mockReturnValue('performance-trends'),
    smartInsights: vi.fn().mockReturnValue('smart-insights'),
    aiRecommendations: vi.fn().mockReturnValue('ai-recommendations'),
    dealList: vi.fn().mockReturnValue('deal-list'),
    activityFeed: vi.fn().mockReturnValue('activity-feed')
  },
  CacheTTL: {
    DASHBOARD_DATA: 120000,
    PERFORMANCE_TRENDS: 600000,
    SMART_INSIGHTS: 900000,
    AI_RECOMMENDATIONS: 900000,
    DEAL_LIST: 1800000,
    ACTIVITY_FEED: 60000
  },
  generateDataHash: vi.fn().mockReturnValue('test-hash')
}))

// Mock performance monitor
export const mockPerformanceMonitor = {
  startTiming: vi.fn(),
  endTiming: vi.fn(),
  recordMetric: vi.fn(),
  getDashboardMetrics: vi.fn().mockReturnValue({
    componentRenders: 5,
    dataFetches: 3,
    cacheHits: 2,
    averageRenderTime: 25.5,
    averageFetchTime: 150.2
  }),
  getMemoryUsage: vi.fn().mockReturnValue({
    used: 50000000,
    total: 100000000,
    limit: 200000000,
    percentage: 50
  }),
  getCoreWebVitals: vi.fn().mockReturnValue({
    FCP: 1200,
    LCP: 2100,
    FID: 50,
    CLS: 0.1
  })
}

vi.mock('@/lib/performance-monitor', () => ({
  performanceMonitor: mockPerformanceMonitor,
  usePerformanceMonitoring: vi.fn().mockReturnValue({
    renderCount: 1,
    startOperation: vi.fn(),
    endOperation: vi.fn(),
    recordMetric: vi.fn()
  }),
  CachePerformance: {
    recordHit: vi.fn(),
    recordMiss: vi.fn(),
    recordEviction: vi.fn()
  }
}))

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
export { userEvent }

// Test data generators
export const generateMockDashboardData = (overrides = {}) => ({
  kpis: {
    currentNAV: 1500000,
    totalContributed: 1200000,
    totalDistributions: 300000,
    unfundedCommitment: 800000,
    unrealizedGain: 600000,
    unrealizedGainPct: 25.5,
    dpi: 0.25,
    tvpi: 1.5,
    irr: 0.185,
    ...overrides
  },
  vehicles: [
    {
      id: 'vehicle-1',
      name: 'VERSO FUND',
      type: 'fund',
      domicile: 'BVI',
      currency: 'USD'
    }
  ],
  recentActivity: []
})

export const generateMockDeals = () => [
  {
    id: 'demo-1',
    name: 'VERSO Secondary Opportunity I',
    deal_type: 'equity_secondary',
    status: 'open',
    vehicle_name: 'VERSO FUND',
    open_at: '2024-08-25T00:00:00Z',
    close_at: '2024-11-25T00:00:00Z'
  },
  {
    id: 'demo-2',
    name: 'Real Empire Growth Deal',
    deal_type: 'equity_primary',
    status: 'allocation_pending',
    vehicle_name: 'REAL Empire',
    open_at: '2024-09-10T00:00:00Z',
    close_at: '2024-12-10T00:00:00Z'
  }
]

// Test helpers
export const waitForLoadingToFinish = async () => {
  await new Promise(resolve => setTimeout(resolve, 600))
}

export const mockConsoleError = () => {
  const originalError = console.error
  console.error = vi.fn()
  return () => {
    console.error = originalError
  }
}

export const mockConsoleLog = () => {
  const originalLog = console.log
  console.log = vi.fn()
  return () => {
    console.log = originalLog
  }
}

// Async test utilities
export const flushPromises = () => new Promise(setImmediate)

export const expectEventuallyToBeInDocument = async (getByText: any, text: string, timeout = 3000) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      expect(getByText(text)).toBeInTheDocument()
      return
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  throw new Error(`Expected "${text}" to be in document within ${timeout}ms`)
}
