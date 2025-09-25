import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/tests/utils/test-utils'
import { RealtimeDashboard } from '@/components/dashboard/realtime-dashboard'
import { mockSupabaseClient, generateMockDashboardData, generateMockDeals } from '@/tests/utils/test-utils'

// Mock all child components
vi.mock('@/components/dashboard/kpi-card', () => ({
  KPICard: ({ title, value, onDrillDown }: any) => (
    <div data-testid="kpi-card" onClick={onDrillDown}>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  )
}))

vi.mock('@/components/dashboard/deal-context-selector', () => ({
  DealContextSelector: ({ onDealChange, selectedDealId }: any) => (
    <div data-testid="deal-context-selector">
      <button onClick={() => onDealChange('demo-1')}>Select Deal</button>
      <button onClick={() => onDealChange(null)}>All Deals</button>
      <span>Selected: {selectedDealId || 'All'}</span>
    </div>
  )
}))

vi.mock('@/components/dashboard/performance-trends', () => ({
  PerformanceTrends: ({ data, selectedDealId }: any) => (
    <div data-testid="performance-trends">
      Performance Trends - {selectedDealId ? 'Deal Focused' : 'All Deals'}
    </div>
  )
}))

vi.mock('@/components/dashboard/smart-insights', () => ({
  SmartInsights: ({ data, selectedDealId }: any) => (
    <div data-testid="smart-insights">
      Smart Insights - {selectedDealId ? 'Deal Focused' : 'All Deals'}
    </div>
  )
}))

vi.mock('@/components/dashboard/ai-recommendations', () => ({
  AIRecommendations: ({ data, selectedDealId }: any) => (
    <div data-testid="ai-recommendations">
      AI Recommendations - {selectedDealId ? 'Deal Focused' : 'All Deals'}
    </div>
  )
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogTrigger: ({ children }: any) => children
}))

// Mock the cache
const mockCacheGet = vi.fn()
const mockCacheSet = vi.fn()

vi.mock('@/lib/cache', () => ({
  cache: {
    get: mockCacheGet,
    set: mockCacheSet
  },
  CacheKeys: {
    dashboardData: vi.fn().mockReturnValue('test-dashboard-key'),
    activityFeed: vi.fn().mockReturnValue('test-activity-key')
  },
  CacheTTL: {
    DASHBOARD_DATA: 120000,
    ACTIVITY_FEED: 60000
  },
  generateDataHash: vi.fn().mockReturnValue('test-hash')
}))

// Mock performance monitor
const mockPerformanceMonitor = {
  startTiming: vi.fn(),
  endTiming: vi.fn(),
  recordMetric: vi.fn()
}

vi.mock('@/lib/performance-monitor', () => ({
  performanceMonitor: mockPerformanceMonitor,
  usePerformanceMonitoring: () => ({
    renderCount: 1,
    startOperation: vi.fn(),
    endOperation: vi.fn(),
    recordMetric: vi.fn()
  })
}))

describe('RealtimeDashboard Integration', () => {
  const mockInvestorIds = ['investor-1', 'investor-2']
  const mockDashboardData = generateMockDashboardData()
  const mockDeals = generateMockDeals()

  // Mock WebSocket channel
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue('SUBSCRIBED'),
    unsubscribe: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCacheGet.mockReturnValue(null)

    // Setup Supabase mocks
    mockSupabaseClient.from.mockImplementation((table) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockReturnValue({
            data: table === 'deals' ? mockDeals[0] : mockDashboardData,
            error: null
          }),
          data: table === 'deals' ? mockDeals : [mockDashboardData],
          error: null
        }),
        in: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              data: table === 'activity_feed' ? [] : mockDeals,
              error: null
            })
          }),
          data: table === 'deals' ? mockDeals : [],
          error: null
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            data: table === 'activity_feed' ? [] : [],
            error: null
          })
        })
      })
    }))

    mockSupabaseClient.channel.mockReturnValue(mockChannel)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all dashboard components', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(screen.getByTestId('deal-context-selector')).toBeInTheDocument()
      expect(screen.getAllByTestId('kpi-card')).toHaveLength(7) // 7 KPI cards expected
      expect(screen.getByTestId('performance-trends')).toBeInTheDocument()
      expect(screen.getByTestId('smart-insights')).toBeInTheDocument()
      expect(screen.getByTestId('ai-recommendations')).toBeInTheDocument()
    })
  })

  it('displays correct KPI values', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(screen.getByText('Current NAV')).toBeInTheDocument()
      expect(screen.getByText('Total Contributed')).toBeInTheDocument()
      expect(screen.getByText('Total Distributions')).toBeInTheDocument()
      expect(screen.getByText('Unfunded Commitment')).toBeInTheDocument()
      expect(screen.getByText('DPI')).toBeInTheDocument()
      expect(screen.getByText('TVPI')).toBeInTheDocument()
      expect(screen.getByText('IRR')).toBeInTheDocument()
    })
  })

  it('switches between all deals and deal-specific view', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    // Initially shows all deals
    await waitFor(() => {
      expect(screen.getByText('Performance Trends - All Deals')).toBeInTheDocument()
      expect(screen.getByText('Smart Insights - All Deals')).toBeInTheDocument()
      expect(screen.getByText('AI Recommendations - All Deals')).toBeInTheDocument()
    })

    // Switch to deal-specific view
    fireEvent.click(screen.getByText('Select Deal'))

    await waitFor(() => {
      expect(screen.getByText('Performance Trends - Deal Focused')).toBeInTheDocument()
      expect(screen.getByText('Smart Insights - Deal Focused')).toBeInTheDocument()
      expect(screen.getByText('AI Recommendations - Deal Focused')).toBeInTheDocument()
    })

    // Switch back to all deals
    fireEvent.click(screen.getByText('All Deals'))

    await waitFor(() => {
      expect(screen.getByText('Performance Trends - All Deals')).toBeInTheDocument()
      expect(screen.getByText('Smart Insights - All Deals')).toBeInTheDocument()
      expect(screen.getByText('AI Recommendations - All Deals')).toBeInTheDocument()
    })
  })

  it('opens KPI detail modal when KPI card is clicked', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(screen.getAllByTestId('kpi-card')).toHaveLength(7)
    })

    // Click on first KPI card
    fireEvent.click(screen.getAllByTestId('kpi-card')[0])

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
    })
  })

  it('sets up realtime subscriptions', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(mockSupabaseClient.channel).toHaveBeenCalled()
      expect(mockChannel.on).toHaveBeenCalled()
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })
  })

  it('handles realtime updates', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(mockChannel.on).toHaveBeenCalled()
    })

    // Simulate realtime update
    const updateCallback = mockChannel.on.mock.calls[0][1]
    updateCallback({ new: { ...mockDashboardData, currentNAV: 2000000 } })

    // Should trigger re-render with updated data
    await waitFor(() => {
      expect(screen.getAllByTestId('kpi-card')).toHaveLength(7)
    })
  })

  it('caches dashboard data', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(mockCacheSet).toHaveBeenCalledWith(
        'test-dashboard-key',
        expect.any(Object),
        120000
      )
    })
  })

  it('uses cached data when available', async () => {
    mockCacheGet.mockReturnValue(mockDashboardData)

    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(screen.getAllByTestId('kpi-card')).toHaveLength(7)
    })

    // Should not call cache.set since we used cached data
    expect(mockCacheSet).not.toHaveBeenCalled()
  })

  it('records performance metrics', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(mockPerformanceMonitor.startTiming).toHaveBeenCalledWith('dashboard-load')
      expect(mockPerformanceMonitor.endTiming).toHaveBeenCalledWith('dashboard-load')
    })
  })

  it('handles loading states', () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    // Should show loading skeletons initially
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument()
  })

  it('handles empty investor IDs', async () => {
    render(<RealtimeDashboard investorIds={[]} />)

    await waitFor(() => {
      expect(screen.getByText('No investor data available')).toBeInTheDocument()
    })
  })

  it('handles Supabase errors gracefully', async () => {
    mockSupabaseClient.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockReturnValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      })
    }))

    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard data/)).toBeInTheDocument()
    })
  })

  it('cleans up subscriptions on unmount', async () => {
    const { unmount } = render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(mockSupabaseClient.channel).toHaveBeenCalled()
    })

    unmount()

    expect(mockSupabaseClient.removeChannel).toHaveBeenCalled()
  })

  it('refreshes data when investor IDs change', async () => {
    const { rerender } = render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(screen.getAllByTestId('kpi-card')).toHaveLength(7)
    })

    vi.clearAllMocks()
    mockCacheGet.mockReturnValue(null)

    // Change investor IDs
    rerender(<RealtimeDashboard investorIds={['new-investor']} />)

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalled()
      expect(mockCacheSet).toHaveBeenCalled()
    })
  })

  it('displays activity feed in sidebar', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })
  })

  it('shows correct deal context in selector', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(screen.getByText('Selected: All')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Select Deal'))

    await waitFor(() => {
      expect(screen.getByText('Selected: demo-1')).toBeInTheDocument()
    })
  })

  it('handles modal close correctly', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      expect(screen.getAllByTestId('kpi-card')).toHaveLength(7)
    })

    // Open modal
    fireEvent.click(screen.getAllByTestId('kpi-card')[0])

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })

    // Close modal (simulate escape key)
    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  it('maintains component responsiveness', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      const dashboard = screen.getByText('Current NAV').closest('.grid')
      expect(dashboard).toHaveClass('grid')
    })
  })

  it('formats financial values correctly', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      // Should format large numbers appropriately
      expect(screen.getByText(/\$1\.5M|\$1,500,000/)).toBeInTheDocument()
    })
  })

  it('shows correct trend indicators', async () => {
    render(<RealtimeDashboard investorIds={mockInvestorIds} />)

    await waitFor(() => {
      // Should show percentage values for ratios
      expect(screen.getByText(/18\.5%|0\.25|1\.5/)).toBeInTheDocument()
    })
  })
})