// @vitest-environment happy-dom
import type { ReactNode, ImgHTMLAttributes } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InvestorDealsListClient } from '../../../components/deals/investor-deals-list-client'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  )
}))

vi.mock('next/image', () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />
}))

const baseDeal = {
  id: 'deal-1',
  name: 'Alpha Deal',
  deal_type: 'equity_secondary',
  status: 'open',
  currency: 'USD',
  offer_unit_price: null,
  open_at: null,
  close_at: null,
  created_at: new Date().toISOString(),
  description: null,
  investment_thesis: null,
  minimum_investment: null,
  maximum_investment: null,
  target_amount: null,
  company_name: 'Alpha Co',
  company_logo_url: null,
  company_website: null,
  sector: null,
  stage: null,
  location: null,
  vehicles: {
    id: 'vehicle-1',
    name: 'Alpha SPV',
    type: 'spv'
  },
  deal_memberships: [
    {
      role: 'partner',
      accepted_at: null,
      dispatched_at: null
    }
  ],
  fee_plans: []
}

const baseProps = {
  feeStructureMap: new Map(),
  interestByDeal: new Map(),
  accessByDeal: new Map(),
  subscriptionByDeal: new Map(),
  primaryInvestorId: 'investor-1',
  accountApprovalStatus: 'approved',
  summary: {
    totalDeals: 1,
    openDeals: 1,
    pendingInterests: 0,
    activeNdas: 0,
    submittedSubscriptions: 0
  }
}

describe('InvestorDealsListClient', () => {
  it('hides investment CTAs for tracking-only roles', () => {
    render(
      <InvestorDealsListClient
        dealsData={[baseDeal]}
        {...baseProps}
      />
    )

    expect(screen.queryByText('Subscribe to Investment Opportunity')).toBeNull()
    expect(screen.queryByText('Request Data Room Access')).toBeNull()
    expect(screen.getByText('Tracking only')).toBeTruthy()
  })

  it('shows investment CTAs for investor-eligible roles', () => {
    const investableDeal = {
      ...baseDeal,
      deal_memberships: [
        {
          role: 'partner_investor',
          accepted_at: null,
          dispatched_at: null
        }
      ]
    }

    render(
      <InvestorDealsListClient
        dealsData={[investableDeal]}
        {...baseProps}
      />
    )

    expect(screen.getByText('Subscribe to Investment Opportunity')).toBeTruthy()
    expect(screen.getByText('Request Data Room Access')).toBeTruthy()
  })
})
