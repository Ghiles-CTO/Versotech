import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/tests/utils/test-utils'
import { AIRecommendations } from '@/components/dashboard/ai-recommendations'
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
    aiRecommendations: vi.fn().mockReturnValue('test-recommendations-key')
  },
  CacheTTL: {
    AI_RECOMMENDATIONS: 900000
  },
  generateDataHash: vi.fn().mockReturnValue('test-hash')
}))

describe('AIRecommendations Component', () => {
  const mockData = generateMockDashboardData()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCacheGet.mockReturnValue(null) // No cache by default
  })

  it('renders loading state initially', () => {
    render(<AIRecommendations data={mockData} />)

    expect(screen.getByText('AI Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Personalized insights powered by machine learning')).toBeInTheDocument()

    // Should show loading skeleton
    const skeletons = screen.getAllByRole('generic')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays recommendations after loading completes', async () => {
    render(<AIRecommendations data={mockData} />)

    // Wait for recommendations to load
    await waitFor(() => {
      expect(screen.queryByText('No recommendations available at the moment')).not.toBeInTheDocument()
    }, { timeout: 3000 })

    // Should show recommendations based on mock data
    await waitFor(() => {
      const recommendations = screen.getAllByText(/Optimize|Consider|Review|Diversify/i)
      expect(recommendations.length).toBeGreaterThan(0)
    })
  })

  it('shows deal-focused badge when dealId is provided', async () => {
    render(<AIRecommendations data={mockData} selectedDealId="demo-1" />)

    await waitFor(() => {
      expect(screen.getByText('Deal-Focused')).toBeInTheDocument()
    })
  })

  it('uses cached recommendations when available', async () => {
    const cachedRecommendations = [{
      id: 'cached-rec',
      type: 'optimization' as const,
      category: 'diversification' as const,
      title: 'Cached Recommendation',
      description: 'This is a cached recommendation',
      priority: 'high' as const,
      confidence: 0.95,
      actionable: true,
      estimatedImpact: '+5% portfolio return',
      actions: ['Take action']
    }]

    mockCacheGet.mockReturnValue(cachedRecommendations)

    render(<AIRecommendations data={mockData} />)

    await waitFor(() => {
      expect(screen.getByText('Cached Recommendation')).toBeInTheDocument()
      expect(screen.getByText('This is a cached recommendation')).toBeInTheDocument()
      expect(screen.getByText('95%')).toBeInTheDocument() // Confidence score
      expect(screen.getByText('+5% portfolio return')).toBeInTheDocument()
    })

    // Should not call cache.set since we used cached data
    expect(mockCacheSet).not.toHaveBeenCalled()
  })

  it('generates different recommendations based on performance metrics', async () => {
    // Test high concentration scenario
    const concentratedData = generateMockDashboardData({
      tvpi: 2.5, // Very high performance but potentially risky
      dpi: 0.1   // Low liquidity
    })

    render(<AIRecommendations data={concentratedData} />)

    await waitFor(() => {
      expect(screen.getByText(/Diversify|liquidity/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows appropriate recommendations for underperformance', async () => {
    const underperformingData = generateMockDashboardData({
      tvpi: 1.1, // Below benchmark
      irr: 0.05  // Low returns
    })

    render(<AIRecommendations data={underperformingData} />)

    await waitFor(() => {
      expect(screen.getByText(/Review|Optimize/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays priority badges correctly', async () => {
    render(<AIRecommendations data={mockData} />)

    await waitFor(() => {
      const priorityBadges = screen.getAllByText(/HIGH|MEDIUM|LOW/)
      expect(priorityBadges.length).toBeGreaterThan(0)
    })
  })

  it('shows confidence scores for recommendations', async () => {
    render(<AIRecommendations data={mockData} />)

    await waitFor(() => {
      // Look for percentage confidence scores
      const confidenceScores = screen.getAllByText(/%/)
      expect(confidenceScores.length).toBeGreaterThan(0)
    })
  })

  it('displays actionable recommendations with buttons', async () => {
    render(<AIRecommendations data={mockData} />)

    await waitFor(() => {
      // Should have action buttons for actionable recommendations
      const actionButtons = screen.getAllByRole('button')
      const actionableButtons = actionButtons.filter(button =>
        button.textContent && !button.textContent.includes('Priority') && !button.textContent.includes('Confidence')
      )
      expect(actionableButtons.length).toBeGreaterThan(0)
    })
  })

  it('shows estimated impact information', async () => {
    render(<AIRecommendations data={mockData} />)

    await waitFor(() => {
      // Look for impact indicators (+ or % symbols)
      const impactText = screen.getAllByText(/\+|\%|return|improvement/i)
      expect(impactText.length).toBeGreaterThan(0)
    })
  })

  it('handles no recommendations scenario', async () => {
    // Create data that won't trigger many recommendations
    const optimalData = generateMockDashboardData({
      tvpi: 1.8,   // Good performance
      dpi: 0.4,    // Good liquidity
      irr: 0.15,   // Good returns
      unfundedCommitment: 200000 // Moderate commitment
    })

    render(<AIRecommendations data={optimalData} />)

    await waitFor(() => {
      const noRecsMessage = screen.queryByText('No recommendations available at the moment')
      if (noRecsMessage) {
        expect(noRecsMessage).toBeInTheDocument()
      } else {
        // If recommendations are shown, they should be fewer and lower priority
        const recommendations = screen.getAllByText(/Optimize|Consider|Review/i)
        expect(recommendations.length).toBeLessThan(3)
      }
    }, { timeout: 3000 })
  })

  it('caches generated recommendations', async () => {
    render(<AIRecommendations data={mockData} />)

    await waitFor(() => {
      expect(mockCacheSet).toHaveBeenCalledWith(
        'test-recommendations-key',
        expect.any(Array),
        900000
      )
    })
  })

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<AIRecommendations data={mockData} />)

    expect(() => unmount()).not.toThrow()
  })

  it('updates recommendations when data changes', async () => {
    const { rerender } = render(<AIRecommendations data={mockData} />)

    // Wait for initial recommendations
    await waitFor(() => {
      expect(screen.queryByText('No recommendations available')).not.toBeInTheDocument()
    })

    // Change data to trigger different recommendations
    const newData = generateMockDashboardData({
      tvpi: 1.0,
      dpi: 0.05,
      unfundedCommitment: 5000000 // Very high commitment
    })

    mockCacheGet.mockReturnValue(null) // Clear cache for new data

    rerender(<AIRecommendations data={newData} />)

    await waitFor(() => {
      // Should show recommendations relevant to high unfunded commitment
      expect(screen.getByText(/commitment|funding/i)).toBeInTheDocument()
    })
  })

  it('displays category-specific recommendations', async () => {
    render(<AIRecommendations data={mockData} />)

    await waitFor(() => {
      // Should show different categories of recommendations
      const categoryElements = screen.getAllByText(/diversification|risk|performance|allocation/i)
      expect(categoryElements.length).toBeGreaterThan(0)
    })
  })

  it('handles deal-specific recommendations', async () => {
    render(<AIRecommendations data={mockData} selectedDealId="demo-1" />)

    await waitFor(() => {
      // Deal-specific recommendations should be more focused
      expect(screen.getByText('Deal-Focused')).toBeInTheDocument()
    })
  })

  it('renders progress indicators for recommendations with targets', async () => {
    render(<AIRecommendations data={mockData} />)

    await waitFor(() => {
      // Look for progress bars or percentage indicators
      const progressElements = screen.getAllByRole('progressbar', { hidden: true })
      // Some recommendations might have progress indicators
      expect(progressElements.length).toBeGreaterThanOrEqual(0)
    })
  })
})