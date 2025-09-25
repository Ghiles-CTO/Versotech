import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/tests/utils/test-utils'
import { SmartInsights } from '@/components/dashboard/smart-insights'
import { generateMockDashboardData } from '@/tests/utils/test-utils'

// Mock the cache to control behavior
const mockCacheGet = vi.fn()
const mockCacheSet = vi.fn()

vi.mock('@/lib/cache', () => ({
  cache: {
    get: mockCacheGet,
    set: mockCacheSet
  },
  CacheKeys: {
    smartInsights: vi.fn().mockReturnValue('test-insights-key')
  },
  CacheTTL: {
    SMART_INSIGHTS: 900000
  },
  generateDataHash: vi.fn().mockReturnValue('test-hash')
}))

describe('SmartInsights Component', () => {
  const mockData = generateMockDashboardData()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCacheGet.mockReturnValue(null) // No cache by default
  })

  it('renders loading state initially', () => {
    render(<SmartInsights data={mockData} />)

    expect(screen.getByText('Smart Insights')).toBeInTheDocument()
    expect(screen.getByText('AI-powered analysis of your portfolio performance and opportunities')).toBeInTheDocument()

    // Should show loading skeleton
    const skeletons = screen.getAllByRole('generic')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays insights after loading completes', async () => {
    render(<SmartInsights data={mockData} />)

    // Wait for insights to load
    await waitFor(() => {
      expect(screen.queryByText('No insights available at the moment')).not.toBeInTheDocument()
    }, { timeout: 3000 })

    // Should show insights based on mock data
    // High TVPI should trigger outstanding performance insight
    await waitFor(() => {
      expect(screen.getByText('Outstanding Portfolio Performance')).toBeInTheDocument()
    })
  })

  it('shows deal-focused badge when dealId is provided', async () => {
    render(<SmartInsights data={mockData} selectedDealId="demo-1" />)

    await waitFor(() => {
      expect(screen.getByText('Deal-Focused')).toBeInTheDocument()
    })
  })

  it('uses cached insights when available', async () => {
    const cachedInsights = [{
      id: 'cached-insight',
      type: 'success' as const,
      category: 'performance' as const,
      title: 'Cached Insight',
      description: 'This is a cached insight',
      impact: 'high' as const,
      actionable: false,
      breakdown: []
    }]

    mockCacheGet.mockReturnValue(cachedInsights)

    render(<SmartInsights data={mockData} />)

    await waitFor(() => {
      expect(screen.getByText('Cached Insight')).toBeInTheDocument()
      expect(screen.getByText('This is a cached insight')).toBeInTheDocument()
    })

    // Should not call cache.set since we used cached data
    expect(mockCacheSet).not.toHaveBeenCalled()
  })

  it('generates different insights based on performance metrics', async () => {
    // Test low performance scenario
    const lowPerformanceData = generateMockDashboardData({
      tvpi: 1.1, // Below benchmark
      dpi: 0.1   // Low liquidity
    })

    render(<SmartInsights data={lowPerformanceData} />)

    await waitFor(() => {
      expect(screen.getByText('Performance Below Target')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows appropriate insights for high unfunded commitment', async () => {
    const highCommitmentData = generateMockDashboardData({
      unfundedCommitment: 2000000, // Very high
      totalContributed: 1000000
    })

    render(<SmartInsights data={highCommitmentData} />)

    await waitFor(() => {
      expect(screen.getByText('Significant Unfunded Commitment')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays deal-specific insights for selected deals', async () => {
    render(<SmartInsights data={mockData} selectedDealId="demo-1" />)

    await waitFor(() => {
      expect(screen.getByText('Deal Closing Soon')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows no insights message when no insights are generated', async () => {
    // Create data that won't trigger any insights
    const neutralData = generateMockDashboardData({
      tvpi: 1.25,  // Moderate performance
      dpi: 0.35,   // Average liquidity
      unfundedCommitment: 100000, // Low commitment
      irr: 0.12    // Moderate IRR
    })

    render(<SmartInsights data={neutralData} />)

    await waitFor(() => {
      expect(screen.getByText('No insights available at the moment')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('caches generated insights', async () => {
    render(<SmartInsights data={mockData} />)

    await waitFor(() => {
      expect(mockCacheSet).toHaveBeenCalledWith(
        'test-insights-key',
        expect.any(Array),
        900000
      )
    })
  })

  it('renders insight actions correctly', async () => {
    render(<SmartInsights data={mockData} />)

    await waitFor(() => {
      // Should have actionable insights with buttons
      const actionButtons = screen.getAllByRole('button')
      expect(actionButtons.length).toBeGreaterThan(0)
    })
  })

  it('displays impact badges correctly', async () => {
    render(<SmartInsights data={mockData} />)

    await waitFor(() => {
      const badges = screen.getAllByText(/HIGH|MEDIUM|LOW/)
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<SmartInsights data={mockData} />)

    expect(() => unmount()).not.toThrow()
  })

  it('updates insights when data changes', async () => {
    const { rerender } = render(<SmartInsights data={mockData} />)

    // Wait for initial insights
    await waitFor(() => {
      expect(screen.getByText('Outstanding Portfolio Performance')).toBeInTheDocument()
    })

    // Change data to trigger different insights
    const newData = generateMockDashboardData({
      tvpi: 1.1,
      dpi: 0.1
    })

    mockCacheGet.mockReturnValue(null) // Clear cache for new data

    rerender(<SmartInsights data={newData} />)

    await waitFor(() => {
      expect(screen.getByText('Performance Below Target')).toBeInTheDocument()
    })
  })
})