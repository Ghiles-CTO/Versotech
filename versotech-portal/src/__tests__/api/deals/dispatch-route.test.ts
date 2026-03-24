import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/deals/dispatch-fanout', () => ({
  sendDealDispatchFanout: vi.fn(),
}))

vi.mock('@/lib/deals/investment-cycles', () => ({
  assertPublishedDealTermSheet: vi.fn(),
  createOrResumeDealInvestmentCycle: vi.fn(),
}))

vi.mock('@/lib/introducers/commercial-eligibility', () => ({
  buildIntroducerCommercialBlockPayload: vi.fn(),
  evaluateIntroducerCommercialEligibility: vi.fn(),
  getIntroducerCommercialEligibility: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendDealDispatchFanout } from '@/lib/deals/dispatch-fanout'
import {
  assertPublishedDealTermSheet,
  createOrResumeDealInvestmentCycle,
} from '@/lib/deals/investment-cycles'

type TableName =
  | 'deals'
  | 'deal_memberships'
  | 'profiles'
  | 'investor_users'
  | 'investors'
  | 'deal_investment_cycles'

type TestDb = Record<TableName, any[]>

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/deals/11111111-1111-4111-8111-111111111111/dispatch', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function createMockSupabase(seed: Partial<TestDb> = {}) {
  const db: TestDb = {
    deals: seed.deals ? [...seed.deals] : [],
    deal_memberships: seed.deal_memberships ? [...seed.deal_memberships] : [],
    profiles: seed.profiles ? [...seed.profiles] : [],
    investor_users: seed.investor_users ? [...seed.investor_users] : [],
    investors: seed.investors ? [...seed.investors] : [],
    deal_investment_cycles: seed.deal_investment_cycles ? [...seed.deal_investment_cycles] : [],
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
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: '99999999-9999-4999-8999-999999999999' } },
        error: null,
      }),
    },
    rpc(name: string) {
      if (name === 'get_user_personas') {
        return Promise.resolve({
          data: [{ persona_type: 'ceo' }],
          error: null,
        })
      }

      return Promise.resolve({ data: null, error: null })
    },
    from(table: TableName) {
      return new QueryBuilder(table)
    },
  }
}

describe('deal dispatch route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(assertPublishedDealTermSheet).mockResolvedValue(undefined)
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase() as any
    )
  })

  it('blocks bulk dispatch when the investor already received the selected term sheet', async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      createMockSupabase({
        deals: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Alpha Deal', status: 'open' }],
        deal_memberships: [],
        profiles: [{
          id: '33333333-3333-4333-8333-333333333333',
          email: 'investor@test.com',
          display_name: 'Existing Investor',
        }],
        investor_users: [{
          user_id: '33333333-3333-4333-8333-333333333333',
          investor_id: '44444444-4444-4444-8444-444444444444',
        }],
        investors: [{
          id: '44444444-4444-4444-8444-444444444444',
          status: 'approved',
          account_approval_status: 'approved',
        }],
        deal_investment_cycles: [{
          deal_id: '11111111-1111-4111-8111-111111111111',
          investor_id: '44444444-4444-4444-8444-444444444444',
          term_sheet_id: '22222222-2222-4222-8222-222222222222',
        }],
      }) as any
    )

    const { POST } = await import('@/app/api/deals/[id]/dispatch/route')

    const response = await POST(
      createRequest({
        user_ids: ['33333333-3333-4333-8333-333333333333'],
        role: 'investor',
        term_sheet_id: '22222222-2222-4222-8222-222222222222',
      }),
      { params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('The investor has already received the term sheet')
    expect(data.reasonCode).toBe('term_sheet_already_received')
    expect(data.users_blocked).toEqual(['33333333-3333-4333-8333-333333333333'])
    expect(createOrResumeDealInvestmentCycle).not.toHaveBeenCalled()
    expect(sendDealDispatchFanout).not.toHaveBeenCalled()
  })
})
