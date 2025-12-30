import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, mockSupabaseClient } from '@/__tests__/utils/test-utils'
import { PerformanceTrends } from '@/components/dashboard/performance-trends'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="pie-cell" />,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}))

const mockSnapshots = [
  {
    snapshot_date: '2024-01-01',
    nav_value: 1000000,
    contributed: 800000,
    distributed: 100000,
    irr_net: 0.12
  },
  {
    snapshot_date: '2024-02-01',
    nav_value: 1100000,
    contributed: 850000,
    distributed: 150000,
    irr_net: 0.13
  }
]

const buildSnapshotQuery = (data: unknown[]) => {
  const query = {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: (resolve: (value: { data: unknown[]; error: null }) => void) =>
      Promise.resolve(resolve({ data, error: null }))
  }

  return query
}

beforeEach(() => {
  vi.clearAllMocks()

  mockSupabaseClient.from.mockImplementation((table) => {
    if (table === 'performance_snapshots') {
      return buildSnapshotQuery(mockSnapshots)
    }

    if (table === 'deals') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { vehicle_id: 'vehicle-1' },
              error: null
            })
          })
        })
      }
    }

    return buildSnapshotQuery([])
  })
})

describe('PerformanceTrends Component', () => {
  it('renders header and description', async () => {
    render(<PerformanceTrends investorIds={['investor-1']} />)

    expect(screen.getByText('Performance Trends')).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByText('Historical performance metrics and portfolio evolution')
      ).toBeInTheDocument()
    })
  })

  it('renders period buttons and tabs after load', async () => {
    render(<PerformanceTrends investorIds={['investor-1']} />)

    await waitFor(() => {
      expect(screen.getByText('12M')).toBeInTheDocument()
      expect(screen.getByText('24M')).toBeInTheDocument()
      expect(screen.getByText('ALL')).toBeInTheDocument()
      expect(screen.getByText('NAV Growth')).toBeInTheDocument()
      expect(screen.getByText('DPI / TVPI')).toBeInTheDocument()
      expect(screen.getByText('Cash Flows')).toBeInTheDocument()
      expect(screen.getByText('Composition')).toBeInTheDocument()
    })
  })

  it('renders charts for each tab', async () => {
    const user = userEvent.setup()

    render(<PerformanceTrends investorIds={['investor-1']} />)

    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    await user.click(screen.getByText('DPI / TVPI'))

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Cash Flows'))

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Composition'))

    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })
  })

  it('shows summary stats after data loads', async () => {
    render(<PerformanceTrends investorIds={['investor-1']} />)

    await waitFor(() => {
      expect(screen.getByText('Current NAV')).toBeInTheDocument()
      expect(screen.getByText('Current DPI')).toBeInTheDocument()
      expect(screen.getByText('Current TVPI')).toBeInTheDocument()
      expect(screen.getByText('Current IRR')).toBeInTheDocument()
    })
  })

  it('shows deal-scoped context when selectedDealId is provided', async () => {
    render(
      <PerformanceTrends
        investorIds={['investor-1']}
        selectedDealId="deal-1"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Performance Trends (Deal-Scoped)')).toBeInTheDocument()
      expect(
        screen.getByText('Historical performance metrics for the selected deal')
      ).toBeInTheDocument()
    })
  })

  it('renders zeroed stats when no snapshots are returned', async () => {
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'performance_snapshots') {
        return buildSnapshotQuery([])
      }
      return buildSnapshotQuery([])
    })

    render(<PerformanceTrends investorIds={['investor-1']} />)

    await waitFor(() => {
      expect(screen.getByText('$0')).toBeInTheDocument()
      expect(screen.getAllByText('0.00x').length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })
  })
})
