// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

const captured = {
  props: null as any,
}

vi.mock('@/components/deals/investor-deals-list-client', () => ({
  InvestorDealsListClient: (props: any) => {
    captured.props = props
    return <div data-testid="opportunities-list" />
  },
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'

type TableName =
  | 'deals'
  | 'investor_users'
  | 'investors'
  | 'partner_users'
  | 'deal_fee_structures'
  | 'investor_deal_interest'
  | 'deal_data_room_access'
  | 'deal_subscription_submissions'
  | 'subscriptions'
  | 'signature_requests'
  | 'deal_investment_cycles'
  | 'partner_commissions'
  | 'deal_memberships'

type TestDb = Record<TableName, any[]>

function createMockSupabase(seed: Partial<TestDb> = {}) {
  const db: TestDb = {
    deals: seed.deals ? [...seed.deals] : [],
    investor_users: seed.investor_users ? [...seed.investor_users] : [],
    investors: seed.investors ? [...seed.investors] : [],
    partner_users: seed.partner_users ? [...seed.partner_users] : [],
    deal_fee_structures: seed.deal_fee_structures ? [...seed.deal_fee_structures] : [],
    investor_deal_interest: seed.investor_deal_interest ? [...seed.investor_deal_interest] : [],
    deal_data_room_access: seed.deal_data_room_access ? [...seed.deal_data_room_access] : [],
    deal_subscription_submissions: seed.deal_subscription_submissions ? [...seed.deal_subscription_submissions] : [],
    subscriptions: seed.subscriptions ? [...seed.subscriptions] : [],
    signature_requests: seed.signature_requests ? [...seed.signature_requests] : [],
    deal_investment_cycles: seed.deal_investment_cycles ? [...seed.deal_investment_cycles] : [],
    partner_commissions: seed.partner_commissions ? [...seed.partner_commissions] : [],
    deal_memberships: seed.deal_memberships ? [...seed.deal_memberships] : [],
  }

  class QueryBuilder {
    private filters: Array<(row: any) => boolean> = []
    private returnSingle = false

    constructor(private table: TableName) {}

    select() {
      return this
    }

    eq(column: string, value: unknown) {
      this.filters.push(row => row[column] === value)
      return this
    }

    in(column: string, values: unknown[]) {
      this.filters.push(row => values.includes(row[column]))
      return this
    }

    order() {
      return this
    }

    maybeSingle() {
      this.returnSingle = true
      const rows = this.finalize()
      return { data: rows[0] ?? null, error: null }
    }

    single() {
      this.returnSingle = true
      const rows = this.finalize()
      return { data: rows[0] ?? null, error: null }
    }

    then(resolve: (value: { data: any; error: null }) => unknown) {
      return Promise.resolve({
        data: this.returnSingle ? this.finalize()[0] ?? null : this.finalize(),
        error: null,
      }).then(resolve)
    }

    private finalize() {
      return db[this.table].filter(row => this.filters.every(filter => filter(row)))
    }
  }

  return {
    from(table: TableName) {
      return new QueryBuilder(table)
    },
  }
}

describe('main opportunities page', () => {
  beforeEach(() => {
    captured.props = null
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
    } as any)
  })

  it('filters rejected submissions before building the investor list props', async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      createMockSupabase({
        deals: [{
          id: 'deal-1',
          name: 'Alpha Deal',
          deal_type: 'equity_secondary',
          status: 'open',
          currency: 'USD',
          offer_unit_price: null,
          open_at: null,
          close_at: null,
          created_at: '2026-03-20T00:00:00.000Z',
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
            type: 'spv',
          },
          deal_memberships: [
            {
              role: 'investor',
              accepted_at: null,
              dispatched_at: '2026-03-20T00:00:00.000Z',
            },
          ],
          fee_plans: [],
          'deal_memberships.user_id': 'user-1',
        }],
        investor_users: [{ user_id: 'user-1', investor_id: 'investor-1' }],
        investors: [{
          id: 'investor-1',
          account_approval_status: 'approved',
          kyc_status: 'approved',
          status: 'approved',
        }],
        partner_users: [],
        deal_fee_structures: [],
        investor_deal_interest: [],
        deal_data_room_access: [],
        deal_subscription_submissions: [
          {
            id: 'submission-rejected',
            deal_id: 'deal-1',
            investor_id: 'investor-1',
            status: 'rejected',
            submitted_at: '2026-03-22T10:00:00.000Z',
          },
          {
            id: 'submission-pending',
            deal_id: 'deal-1',
            investor_id: 'investor-1',
            status: 'pending_review',
            submitted_at: '2026-03-20T10:00:00.000Z',
          },
        ],
        subscriptions: [],
        signature_requests: [],
        deal_investment_cycles: [],
        partner_commissions: [],
        deal_memberships: [],
      }) as any
    )

    const OpportunitiesPage = (await import('@/app/(main)/versotech_main/opportunities/page')).default

    render(await OpportunitiesPage())

    expect(screen.getByTestId('opportunities-list')).toBeInTheDocument()
    expect(captured.props.summary.submittedSubscriptions).toBe(1)
    expect(captured.props.subscriptionByDeal.get('deal-1')).toEqual(
      expect.objectContaining({
        id: 'submission-pending',
        status: 'pending_review',
      })
    )
  })
})
