import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/tests/utils/test-utils'
import { PerformanceTrends } from '@/components/dashboard/performance-trends'
import { generateMockDashboardData } from '@/tests/utils/test-utils'

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />
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
    performanceTrends: vi.fn().mockReturnValue('test-performance-trends-key')
  },
  CacheTTL: {
    PERFORMANCE_TRENDS: 600000
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

describe('PerformanceTrends Component', () => {
  const mockData = generateMockDashboardData()

  const mockPerformanceData = Array.from({ length: 12 }, (_, i) => ({
    period: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    date: new Date(2024, i, 1).toISOString().split('T')[0],
    nav: 1000000 + (i * 50000) + (Math.random() * 100000),
    contributions: Math.min(1000000, 100000 * i),
    distributions: i > 6 ? 50000 * (i - 6) : 0,
    dpi: i > 6 ? (50000 * (i - 6)) / (100000 * i) : 0,
    tvpi: 1 + (i * 0.05) + (Math.random() * 0.1),
    irr: 0.08 + (i * 0.01) + (Math.random() * 0.02)
  }))

  beforeEach(() => {
    vi.clearAllMocks()
    mockCacheGet.mockReturnValue(null)

    // Mock fetch for performance data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: mockPerformanceData })
    })
  })

  it('renders loading state initially', () => {
    render(<PerformanceTrends data={mockData} />)

    expect(screen.getByText('Performance Trends')).toBeInTheDocument()
    expect(screen.getByText('Historical performance and key metrics over time')).toBeInTheDocument()

    // Should show loading skeleton
    const skeletons = screen.getAllByRole('generic')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays chart controls and options', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      // Chart type controls
      expect(screen.getByText('Line')).toBeInTheDocument()
      expect(screen.getByText('Area')).toBeInTheDocument()
      expect(screen.getByText('Bar')).toBeInTheDocument()

      // Time period controls
      expect(screen.getByText('6M')).toBeInTheDocument()
      expect(screen.getByText('1Y')).toBeInTheDocument()
      expect(screen.getByText('2Y')).toBeInTheDocument()
    })
  })

  it('displays metric selection toggles', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByText('NAV')).toBeInTheDocument()
      expect(screen.getByText('DPI')).toBeInTheDocument()
      expect(screen.getByText('TVPI')).toBeInTheDocument()
      expect(screen.getByText('IRR')).toBeInTheDocument()
    })
  })

  it('renders chart components after data loads', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    })
  })

  it('switches between chart types', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    // Switch to area chart
    fireEvent.click(screen.getByText('Area'))

    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    // Switch to bar chart
    fireEvent.click(screen.getByText('Bar'))

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
  })

  it('toggles metrics visibility', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      const navToggle = screen.getByText('NAV')
      expect(navToggle).toBeInTheDocument()
    })

    // Toggle NAV off
    fireEvent.click(screen.getByText('NAV'))

    // Should still render chart but with different metrics
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  it('changes time periods', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByText('1Y')).toBeInTheDocument()
    })

    // Change to 6M view
    fireEvent.click(screen.getByText('6M'))

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    // Change to 2Y view
    fireEvent.click(screen.getByText('2Y'))

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  it('shows benchmark lines when available', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      // Should show benchmark reference lines
      expect(screen.getByTestId('reference-line')).toBeInTheDocument()
    })
  })

  it('displays performance summary stats', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      // Should show summary statistics
      expect(screen.getByText(/Growth|Return/i)).toBeInTheDocument()
    })
  })

  it('uses cached performance data when available', async () => {
    mockCacheGet.mockReturnValue(mockPerformanceData)

    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    // Should not call cache.set since we used cached data
    expect(mockCacheSet).not.toHaveBeenCalled()

    // Should not fetch from API
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('caches fetched performance data', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(mockCacheSet).toHaveBeenCalledWith(
        'test-performance-trends-key',
        expect.any(Array),
        600000
      )
    })
  })

  it('handles API errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'))

    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      // Should show error state or fallback
      expect(screen.getByText(/Error|unavailable/i)).toBeInTheDocument()
    })
  })

  it('shows deal-focused badge when dealId is provided', async () => {
    render(<PerformanceTrends data={mockData} selectedDealId="demo-1" />)

    await waitFor(() => {
      expect(screen.getByText('Deal-Focused')).toBeInTheDocument()
    })
  })

  it('formats currency values correctly', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      // Should format large numbers with proper notation
      expect(screen.getByText(/\$|M|K/)).toBeInTheDocument()
    })
  })

  it('shows percentage values for ratios', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      // Should show percentage formatting for IRR, returns, etc.
      expect(screen.getByText(/%/)).toBeInTheDocument()
    })
  })

  it('records performance metrics', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(mockPerformanceMonitor.startTiming).toHaveBeenCalledWith('performance-trends-fetch')
      expect(mockPerformanceMonitor.endTiming).toHaveBeenCalledWith('performance-trends-fetch')
    })
  })

  it('handles empty performance data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: [] })
    })

    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByText(/No data|insufficient data/i)).toBeInTheDocument()
    })
  })

  it('updates when data changes', async () => {
    const { rerender } = render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    // Change data
    const newData = generateMockDashboardData({
      tvpi: 2.0,
      dpi: 0.5
    })

    mockCacheGet.mockReturnValue(null) // Clear cache for new data

    rerender(<PerformanceTrends data={newData} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<PerformanceTrends data={mockData} />)

    expect(() => unmount()).not.toThrow()
  })

  it('shows chart legend', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  it('displays tooltip on hover', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    render(<PerformanceTrends data={mockData} className="custom-class" />)

    const component = screen.getByText('Performance Trends').closest('div')
    expect(component).toHaveClass('custom-class')
  })

  it('shows appropriate chart based on selected metrics', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByText('NAV')).toBeInTheDocument()
    })

    // Toggle all metrics off except one
    fireEvent.click(screen.getByText('DPI'))
    fireEvent.click(screen.getByText('TVPI'))
    fireEvent.click(screen.getByText('IRR'))

    await waitFor(() => {
      // Should still show chart with remaining metric
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  it('maintains chart responsiveness', async () => {
    render(<PerformanceTrends data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })
})