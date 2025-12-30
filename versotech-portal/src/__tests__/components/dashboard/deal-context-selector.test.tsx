import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { mockCache, mockSupabaseClient, render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { DealContextSelector } from '@/components/dashboard/deal-context-selector'

describe('DealContextSelector Component', () => {
  const mockInvestorIds = ['investor-1', 'investor-2']
  const mockOnDealChange = vi.fn()

  const mockDeals = [
    {
      id: 'demo-1',
      name: 'VERSO Secondary Opportunity I',
      deal_type: 'equity_secondary',
      status: 'open',
      vehicle_id: 'vehicle-1',
      vehicle_name: 'VERSO FUND',
      open_at: '2024-08-25T00:00:00Z',
      close_at: '2024-11-25T00:00:00Z'
    },
    {
      id: 'demo-2',
      name: 'Real Empire Growth Deal',
      deal_type: 'equity_primary',
      status: 'allocation_pending',
      vehicle_id: 'vehicle-2',
      vehicle_name: 'REAL Empire',
      open_at: '2024-09-10T00:00:00Z',
      close_at: '2024-12-10T00:00:00Z'
    }
  ]

  const mockVehicles = [
    { id: 'vehicle-1', name: 'VERSO FUND' },
    { id: 'vehicle-2', name: 'REAL Empire' }
  ]

  const buildSelectResult = (data: unknown[]) => ({
    data,
    error: null,
    order: vi.fn().mockReturnValue({ data, error: null })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockCache.get.mockReturnValue(null)

    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'vehicles') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({ data: mockVehicles, error: null })
          })
        }
      }

      const data = table === 'deals'
        ? mockDeals
        : [
          { deal_id: 'demo-1' },
          { deal_id: 'demo-2' }
        ]

      return {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue(buildSelectResult(data)),
          order: vi.fn().mockReturnValue({ data, error: null })
        }),
        insert: vi.fn().mockReturnValue({ data: null, error: null }),
        update: vi.fn().mockReturnValue({ data: null, error: null }),
        delete: vi.fn().mockReturnValue({ data: null, error: null })
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders default portfolio view', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('All Deals (Portfolio View)')).toBeInTheDocument()
    })
  })

  it('shows dropdown options and deal details', async () => {
    const user = userEvent.setup()

    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    const trigger = await screen.findByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('All Deals')).toBeInTheDocument()
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument()
      expect(screen.getByText('VERSO Secondary Opportunity I')).toBeInTheDocument()
      expect(screen.getByText('Real Empire Growth Deal')).toBeInTheDocument()
      expect(screen.getByText('open')).toBeInTheDocument()
      expect(screen.getByText('allocation pending')).toBeInTheDocument()
    })
  })

  it('calls onDealChange when a deal is selected', async () => {
    const user = userEvent.setup()

    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    const trigger = await screen.findByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /VERSO Secondary Opportunity I/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('option', { name: /VERSO Secondary Opportunity I/i }))

    expect(mockOnDealChange).toHaveBeenCalledWith('demo-1')
  })

  it('calls onDealChange with null when "All Deals" is selected', async () => {
    const user = userEvent.setup()

    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId="demo-1"
        onDealChange={mockOnDealChange}
      />
    )

    const trigger = await screen.findByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /All Deals/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('option', { name: /All Deals/i }))

    expect(mockOnDealChange).toHaveBeenCalledWith(null)
  })

  it('shows selected deal details', async () => {
    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId="demo-1"
        onDealChange={mockOnDealChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Vehicle: VERSO FUND')).toBeInTheDocument()
      expect(screen.getByText('Type: Secondary')).toBeInTheDocument()
    })
  })

  it('uses cached deals when available', async () => {
    const user = userEvent.setup()
    mockCache.get.mockReturnValue(mockDeals)

    render(
      <DealContextSelector
        investorIds={mockInvestorIds}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    const trigger = await screen.findByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('VERSO Secondary Opportunity I')).toBeInTheDocument()
    })

    expect(mockCache.set).not.toHaveBeenCalled()
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
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.any(Number)
      )
    })
  })

  it('handles empty investorIds array', async () => {
    render(
      <DealContextSelector
        investorIds={[]}
        selectedDealId={null}
        onDealChange={mockOnDealChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('No accessible deals found')).toBeInTheDocument()
    })
  })

})
