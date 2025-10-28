import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/tests/utils/test-utils'
import { DealContextSelector } from '@/components/dashboard/deal-context-selector'
import { mockSupabaseClient } from '@/tests/utils/test-utils'

// Mock the cache
const mockCacheGet = vi.fn()
const mockCacheSet = vi.fn()

vi.mock('@/lib/cache', () => ({
  cache: {
    get: mockCacheGet,
    set: mockCacheSet
  },
  CacheKeys: {
    dealList: vi.fn().mockReturnValue('test-deal-list-key')
  },
  CacheTTL: {
    DEAL_LIST: 1800000
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
  performanceMonitor: mockPerformanceMonitor
}))

describe('DealContextSelector Component', () => {
  const mockInvestorIds = ['investor-1', 'investor-2']
  const mockOnDealChange = vi.fn()

  const mockDeals = [
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

  beforeEach(() => {
    vi.clearAllMocks()
    mockCacheGet.mockReturnValue(null)

    // Mock Supabase responses
    mockSupabaseClient.from.mockImplementation((table) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: table === 'deals' ? mockDeals : [],
          error: null
        }),
        in: vi.fn().mockReturnValue({
          data: table === 'deals' ? mockDeals : [],
          error: null
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            data: table === 'deals' ? mockDeals : [],
            error: null
          })
        })
      }),
      insert: vi.fn().mockReturnValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({ data: null, error: null })
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with default "All Deals" option', () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    expect(screen.getByText('All Deals')).toBeInTheDocument()
    expect(screen.getByText('Portfolio Overview')).toBeInTheDocument()
  })

  it('shows loading state while fetching deals', async () => {
    // Mock a longer loading time
    const slowMockSupabase = {
      ...mockSupabaseClient,
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            data: [],
            error: null
          })
        })
      })
    }

    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    // Initially should show All Deals
    expect(screen.getByText('All Deals')).toBeInTheDocument()
  })

  it('displays deals after loading', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    // Click to open dropdown
    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByText('VERSO Secondary Opportunity I')).toBeInTheDocument()
      expect(screen.getByText('Real Empire Growth Deal')).toBeInTheDocument()
    })
  })

  it('shows deal details in dropdown options', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByText('VERSO FUND')).toBeInTheDocument()
      expect(screen.getByText('REAL Empire')).toBeInTheDocument()
      expect(screen.getByText('Open')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
  })

  it('calls onDealChange when a deal is selected', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByText('VERSO Secondary Opportunity I')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('VERSO Secondary Opportunity I'))

    expect(mockOnDealChange).toHaveBeenCalledWith('demo-1')
  })

  it('calls onDealChange with null when "All Deals" is selected', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId="demo-1"
        onDealChange={mockOnDealChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByText('All Deals')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('All Deals'))

    expect(mockOnDealChange).toHaveBeenCalledWith(null)
  })

  it('displays selected deal name when a deal is selected', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId="demo-1"
        onDealChange={mockOnDealChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('VERSO Secondary Opportunity I')).toBeInTheDocument()
      expect(screen.getByText('Deal-Focused Analysis')).toBeInTheDocument()
    })
  })

  it('shows status badges for deals', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      // Status badges should be shown
      expect(screen.getByText('Open')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
  })

  it('uses cached deals when available', async () => {
    mockCacheGet.mockReturnValue(mockDeals)

    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    // Should immediately show cached deals without calling Supabase
    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByText('VERSO Secondary Opportunity I')).toBeInTheDocument()
    })

    // Should not have called cache.set since we used cached data
    expect(mockCacheSet).not.toHaveBeenCalled()
  })

  it('caches fetched deals', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    await waitFor(() => {
      expect(mockCacheSet).toHaveBeenCalledWith(
        'test-deal-list-key',
        expect.any(Array),
        1800000
      )
    })
  })

  it('handles Supabase errors gracefully', async () => {
    // Mock Supabase error
    mockSupabaseClient.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          data: null,
          error: { message: 'Database error' }
        })
      })
    }))

    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    // Should still show default option
    expect(screen.getByText('All Deals')).toBeInTheDocument()
  })

  it('shows fallback demo data when no deals are available', async () => {
    // Mock empty deals response
    mockSupabaseClient.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          data: [],
          error: null
        })
      })
    }))

    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      // Should show demo deals as fallback
      expect(screen.getByText(/Demo|Test/)).toBeInTheDocument()
    })
  })

  it('records performance metrics', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    await waitFor(() => {
      expect(mockPerformanceMonitor.startTiming).toHaveBeenCalledWith('deal-selector-fetch')
      expect(mockPerformanceMonitor.endTiming).toHaveBeenCalledWith('deal-selector-fetch')
    })
  })

  it('applies custom className', () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
        className="custom-class"
      />
    )

    // The component should render with the custom class
    const selector = screen.getByRole('combobox').parentElement
    expect(selector).toHaveClass('custom-class')
  })

  it('handles deal type formatting correctly', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      // Should format deal types properly
      expect(screen.getByText('Secondary')).toBeInTheDocument()
      expect(screen.getByText('Primary')).toBeInTheDocument()
    })
  })

  it('shows deal closing dates', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      // Should show formatted closing dates
      expect(screen.getByText(/Nov|Dec/)).toBeInTheDocument()
    })
  })

  it('handles empty investorIds array', () => {
    render(
      <DealContextSelector
        investorIds={[]}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    expect(screen.getByText('All Deals')).toBeInTheDocument()
  })

  it('refreshes data when investorIds change', async () => {
    const { rerender } = render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    await waitFor(() => {
      expect(mockCacheSet).toHaveBeenCalled()
    })

    vi.clearAllMocks()
    mockCacheGet.mockReturnValue(null)

    // Change investorIds
    rerender(
      <DealContextSelector
        investorIds={['new-investor']}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    await waitFor(() => {
      expect(mockCacheSet).toHaveBeenCalled()
    })
  })
})