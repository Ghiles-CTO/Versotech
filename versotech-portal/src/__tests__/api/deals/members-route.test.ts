import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/api-auth', () => ({
  getAuthenticatedUser: vi.fn(),
  isStaffUser: vi.fn(),
}))

vi.mock('@/lib/deals/dispatch-fanout', () => ({
  sendDealDispatchFanout: vi.fn(),
}))

vi.mock('@/lib/deals/investment-cycles', () => ({
  createOrResumeDealInvestmentCycle: vi.fn(),
  LIVE_CYCLE_STATUSES: [
    'dispatched',
    'viewed',
    'interest_confirmed',
    'submission_pending_review',
    'approved',
    'pack_generated',
    'pack_sent',
    'signed',
  ],
}))

vi.mock('@/lib/introducers/commercial-eligibility', () => ({
  buildIntroducerCommercialBlockPayload: vi.fn(),
  getIntroducerCommercialEligibility: vi.fn(),
}))

vi.mock('@/lib/audit', () => ({
  auditLogger: {
    log: vi.fn(),
  },
  AuditActions: {
    CREATE: 'create',
    UPDATE: 'update',
  },
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { sendDealDispatchFanout } from '@/lib/deals/dispatch-fanout'
import { createOrResumeDealInvestmentCycle } from '@/lib/deals/investment-cycles'

type TableName =
  | 'deals'
  | 'deal_fee_structures'
  | 'deal_memberships'
  | 'deal_investment_cycles'

type TestDb = Record<TableName, any[]>

function createRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/deals/11111111-1111-4111-8111-111111111111/members', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function createMockSupabase(seed: Partial<TestDb> = {}) {
  const db: TestDb = {
    deals: seed.deals ? [...seed.deals] : [],
    deal_fee_structures: seed.deal_fee_structures ? [...seed.deal_fee_structures] : [],
    deal_memberships: seed.deal_memberships ? [...seed.deal_memberships] : [],
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
      return Promise.resolve({ data: this.returnSingle ? this.finalize()[0] ?? null : this.finalize(), error: null }).then(resolve)
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

describe('deal members route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      user: { id: '99999999-9999-4999-8999-999999999999', email: 'staff@test.com' } as any,
      error: null,
    })
    vi.mocked(isStaffUser).mockResolvedValue(true)
    vi.mocked(createClient).mockResolvedValue({} as any)
  })

  it('blocks same-term-sheet redispatch without resuming the cycle or sending fanout', async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      createMockSupabase({
        deals: [{ id: '11111111-1111-4111-8111-111111111111', status: 'open' }],
        deal_fee_structures: [{ id: '22222222-2222-4222-8222-222222222222', deal_id: '11111111-1111-4111-8111-111111111111', status: 'published' }],
        deal_memberships: [{
          deal_id: '11111111-1111-4111-8111-111111111111',
          user_id: '33333333-3333-4333-8333-333333333333',
          investor_id: '44444444-4444-4444-8444-444444444444',
          role: 'investor',
          referred_by_entity_id: null,
          referred_by_entity_type: null,
          assigned_fee_plan_id: null,
          term_sheet_id: '22222222-2222-4222-8222-222222222222',
        }],
        deal_investment_cycles: [{
          term_sheet_id: '22222222-2222-4222-8222-222222222222',
          deal_id: '11111111-1111-4111-8111-111111111111',
          investor_id: '44444444-4444-4444-8444-444444444444',
        }],
      }) as any
    )

    const { POST } = await import('@/app/api/deals/[id]/members/route')

    const response = await POST(
      createRequest({
        user_id: '33333333-3333-4333-8333-333333333333',
        investor_id: '44444444-4444-4444-8444-444444444444',
        role: 'investor',
        send_notification: true,
        term_sheet_id: '22222222-2222-4222-8222-222222222222',
      }),
      { params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('The investor has already received the term sheet')
    expect(data.reasonCode).toBe('term_sheet_already_received')
    expect(createOrResumeDealInvestmentCycle).not.toHaveBeenCalled()
    expect(sendDealDispatchFanout).not.toHaveBeenCalled()
  })

  it('blocks same-term-sheet dispatch when only prior cycle history exists', async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      createMockSupabase({
        deals: [{ id: '11111111-1111-4111-8111-111111111111', status: 'open' }],
        deal_fee_structures: [{ id: '22222222-2222-4222-8222-222222222222', deal_id: '11111111-1111-4111-8111-111111111111', status: 'published' }],
        deal_memberships: [],
        deal_investment_cycles: [{
          term_sheet_id: '22222222-2222-4222-8222-222222222222',
          deal_id: '11111111-1111-4111-8111-111111111111',
          investor_id: '44444444-4444-4444-8444-444444444444',
        }],
      }) as any
    )

    const { POST } = await import('@/app/api/deals/[id]/members/route')

    const response = await POST(
      createRequest({
        user_id: '33333333-3333-4333-8333-333333333333',
        investor_id: '44444444-4444-4444-8444-444444444444',
        role: 'investor',
        send_notification: true,
        term_sheet_id: '22222222-2222-4222-8222-222222222222',
      }),
      { params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('The investor has already received the term sheet')
    expect(data.reasonCode).toBe('term_sheet_already_received')
    expect(createOrResumeDealInvestmentCycle).not.toHaveBeenCalled()
    expect(sendDealDispatchFanout).not.toHaveBeenCalled()
  })
})
