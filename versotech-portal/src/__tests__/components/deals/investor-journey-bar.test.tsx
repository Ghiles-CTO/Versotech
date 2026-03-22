// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InvestorJourneyBar } from '@/components/deals/investor-journey-bar'

describe('InvestorJourneyBar', () => {
  it('keeps the page as a normal single-subscription flow before reinvestment starts', () => {
    render(
      <InvestorJourneyBar
        summary={{
          received: null,
          viewed: '2026-03-20T00:00:00.000Z',
          interest_confirmed: '2026-03-20T01:00:00.000Z',
          nda_signed: null,
          data_room_access: null,
          pack_generated: null,
          pack_sent: null,
          signed: '2026-03-21T00:00:00.000Z',
          funded: '2026-03-22T00:00:00.000Z',
          active: null,
        }}
      />
    )

    expect(screen.queryByText('Additional Investment')).toBeNull()
    expect(screen.getByText('Confirm Interest')).toBeInTheDocument()
  })

  it('shows the reinvestment branch only after reinvestment has started', () => {
    render(
      <InvestorJourneyBar
        summary={{
          received: null,
          viewed: '2026-03-20T00:00:00.000Z',
          interest_confirmed: '2026-03-20T01:00:00.000Z',
          nda_signed: null,
          data_room_access: null,
          pack_generated: null,
          pack_sent: null,
          signed: '2026-03-21T00:00:00.000Z',
          funded: '2026-03-22T00:00:00.000Z',
          active: null,
        }}
        reinvestmentBranch={{
          confirmed_at: '2026-03-22T10:00:00.000Z',
          signed_at: null,
          funded_at: null,
        }}
      />
    )

    expect(screen.getByText('Confirm reinvestment')).toBeInTheDocument()
    expect(screen.getByText('Subscription pack signed')).toBeInTheDocument()
    expect(screen.getAllByText('Funded').length).toBeGreaterThan(0)
  })
})
