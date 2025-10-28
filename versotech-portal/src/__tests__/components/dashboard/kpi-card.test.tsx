import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/tests/utils/test-utils'
import { KPICard } from '@/components/dashboard/kpi-card'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

describe('KPICard Component', () => {
  const mockOnDrillDown = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders basic KPI card with title and value', () => {
    render(
      <KPICard
        title="Total NAV"
        value="$1,500,000"
        subtitle="Current Portfolio Value"
      />
    )

    expect(screen.getByText('Total NAV')).toBeInTheDocument()
    expect(screen.getByText('$1,500,000')).toBeInTheDocument()
    expect(screen.getByText('Current Portfolio Value')).toBeInTheDocument()
  })

  it('renders with numeric value', () => {
    render(
      <KPICard
        title="Deal Count"
        value={25}
        subtitle="Active Deals"
      />
    )

    expect(screen.getByText('Deal Count')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Active Deals')).toBeInTheDocument()
  })

  it('displays icon when provided', () => {
    render(
      <KPICard
        title="Revenue"
        value="$1,000,000"
        icon={DollarSign}
      />
    )

    expect(screen.getByText('Revenue')).toBeInTheDocument()
    // Icon should be rendered (as SVG element)
    const iconElement = screen.getByRole('img', { hidden: true })
    expect(iconElement).toBeInTheDocument()
  })

  it('shows trend indicator with string format', () => {
    render(
      <KPICard
        title="Performance"
        value="12.5%"
        trend="up"
        trendValue="+2.3%"
      />
    )

    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('12.5%')).toBeInTheDocument()
    expect(screen.getByText('+2.3%')).toBeInTheDocument()
  })

  it('shows trend indicator with object format', () => {
    render(
      <KPICard
        title="Returns"
        value="8.5%"
        trend={{
          value: 1.2,
          isPositive: true
        }}
      />
    )

    expect(screen.getByText('Returns')).toBeInTheDocument()
    expect(screen.getByText('8.5%')).toBeInTheDocument()
    expect(screen.getByText('+1.2%')).toBeInTheDocument()
  })

  it('shows negative trend correctly', () => {
    render(
      <KPICard
        title="Volatility"
        value="15.2%"
        trend={{
          value: -0.5,
          isPositive: false
        }}
      />
    )

    expect(screen.getByText('Volatility')).toBeInTheDocument()
    expect(screen.getByText('15.2%')).toBeInTheDocument()
    expect(screen.getByText('-0.5%')).toBeInTheDocument()
  })

  it('handles neutral trend', () => {
    render(
      <KPICard
        title="Stable Metric"
        value="100"
        trend="neutral"
        trendValue="0%"
      />
    )

    expect(screen.getByText('Stable Metric')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('supports backward compatibility with description prop', () => {
    render(
      <KPICard
        title="Legacy Metric"
        value="$500,000"
        description="Legacy description"
      />
    )

    expect(screen.getByText('Legacy Metric')).toBeInTheDocument()
    expect(screen.getByText('$500,000')).toBeInTheDocument()
    expect(screen.getByText('Legacy description')).toBeInTheDocument()
  })

  it('prioritizes subtitle over description', () => {
    render(
      <KPICard
        title="Priority Test"
        value="$1,000"
        subtitle="Primary subtitle"
        description="Secondary description"
      />
    )

    expect(screen.getByText('Priority Test')).toBeInTheDocument()
    expect(screen.getByText('$1,000')).toBeInTheDocument()
    expect(screen.getByText('Primary subtitle')).toBeInTheDocument()
    expect(screen.queryByText('Secondary description')).not.toBeInTheDocument()
  })

  it('renders as interactive when interactive prop is true', () => {
    render(
      <KPICard
        title="Interactive Card"
        value="$750,000"
        interactive={true}
        onDrillDown={mockOnDrillDown}
        hasDetails={true}
      />
    )

    const card = screen.getByRole('button')
    expect(card).toBeInTheDocument()

    // Should show drill-down indicator
    expect(screen.getByText('View Details')).toBeInTheDocument()
  })

  it('calls onDrillDown when interactive card is clicked', () => {
    render(
      <KPICard
        title="Clickable Card"
        value="$2,000,000"
        interactive={true}
        onDrillDown={mockOnDrillDown}
      />
    )

    const card = screen.getByRole('button')
    fireEvent.click(card)

    expect(mockOnDrillDown).toHaveBeenCalledTimes(1)
  })

  it('handles keyboard navigation on interactive cards', () => {
    render(
      <KPICard
        title="Keyboard Card"
        value="$1,250,000"
        interactive={true}
        onDrillDown={mockOnDrillDown}
      />
    )

    const card = screen.getByRole('button')

    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' })
    expect(mockOnDrillDown).toHaveBeenCalledTimes(1)

    // Test Space key
    fireEvent.keyDown(card, { key: ' ', code: 'Space' })
    expect(mockOnDrillDown).toHaveBeenCalledTimes(2)
  })

  it('does not call onDrillDown when not interactive', () => {
    render(
      <KPICard
        title="Static Card"
        value="$500,000"
        interactive={false}
        onDrillDown={mockOnDrillDown}
      />
    )

    const card = screen.getByText('Static Card').closest('div')
    if (card) {
      fireEvent.click(card)
    }

    expect(mockOnDrillDown).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(
      <KPICard
        title="Custom Style"
        value="$123,456"
        className="custom-kpi-class"
      />
    )

    const card = screen.getByText('Custom Style').closest('div')
    expect(card).toHaveClass('custom-kpi-class')
  })

  it('shows hover effects on interactive cards', () => {
    render(
      <KPICard
        title="Hover Card"
        value="$890,000"
        interactive={true}
        onDrillDown={mockOnDrillDown}
      />
    )

    const card = screen.getByRole('button')
    expect(card).toHaveClass('hover:shadow-md')
  })

  it('displays loading state when value is empty', () => {
    render(
      <KPICard
        title="Loading Card"
        value=""
        subtitle="Loading..."
      />
    )

    expect(screen.getByText('Loading Card')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles very large numbers', () => {
    render(
      <KPICard
        title="Large Number"
        value={1000000000}
        subtitle="One billion"
      />
    )

    expect(screen.getByText('Large Number')).toBeInTheDocument()
    expect(screen.getByText('1000000000')).toBeInTheDocument()
    expect(screen.getByText('One billion')).toBeInTheDocument()
  })

  it('handles decimal numbers', () => {
    render(
      <KPICard
        title="Decimal Value"
        value={123.456}
        subtitle="Precise value"
      />
    )

    expect(screen.getByText('Decimal Value')).toBeInTheDocument()
    expect(screen.getByText('123.456')).toBeInTheDocument()
    expect(screen.getByText('Precise value')).toBeInTheDocument()
  })

  it('shows correct trend colors', () => {
    const { rerender } = render(
      <KPICard
        title="Trend Colors"
        value="100%"
        trend="up"
        trendValue="+5%"
      />
    )

    // Check for positive trend styling
    expect(screen.getByText('+5%')).toHaveClass('text-green-600')

    rerender(
      <KPICard
        title="Trend Colors"
        value="100%"
        trend="down"
        trendValue="-5%"
      />
    )

    // Check for negative trend styling
    expect(screen.getByText('-5%')).toHaveClass('text-red-600')
  })

  it('handles missing trend value gracefully', () => {
    render(
      <KPICard
        title="No Trend Value"
        value="$1,000,000"
        trend="up"
      />
    )

    expect(screen.getByText('No Trend Value')).toBeInTheDocument()
    expect(screen.getByText('$1,000,000')).toBeInTheDocument()
  })

  it('shows drill-down indicator only when hasDetails is true', () => {
    const { rerender } = render(
      <KPICard
        title="Details Test"
        value="$500,000"
        interactive={true}
        onDrillDown={mockOnDrillDown}
        hasDetails={true}
      />
    )

    expect(screen.getByText('View Details')).toBeInTheDocument()

    rerender(
      <KPICard
        title="Details Test"
        value="$500,000"
        interactive={true}
        onDrillDown={mockOnDrillDown}
        hasDetails={false}
      />
    )

    expect(screen.queryByText('View Details')).not.toBeInTheDocument()
  })

  it('maintains accessibility attributes', () => {
    render(
      <KPICard
        title="Accessible Card"
        value="$1,500,000"
        subtitle="Accessible description"
        interactive={true}
        onDrillDown={mockOnDrillDown}
      />
    )

    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('tabIndex', '0')
    expect(card).toHaveAttribute('aria-label', 'Accessible Card: $1,500,000')
  })
})