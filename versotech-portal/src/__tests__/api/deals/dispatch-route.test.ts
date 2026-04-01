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

vi.mock('@/lib/vehicles/bank-accounts', () => ({
  resolveVehicleActiveBankAccount: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendDealDispatchFanout } from '@/lib/deals/dispatch-fanout'
import {
  assertPublishedDealTermSheet,
  createOrResumeDealInvestmentCycle,
} from '@/lib/deals/investment-cycles'
import { resolveVehicleActiveBankAccount } from '@/lib/vehicles/bank-accounts'

type TableName =
  | 'deals'
  | 'deal_memberships'
  | 'profiles'
  | 'investor_users'
  | 'investors'
  | 'deal_investment_cycles'
  | 'audit_logs'

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
    audit_logs: seed.audit_logs ? [...seed.audit_logs] : [],
  }

  class QueryBuilder {
    private filters: Array<(row: any) => boolean> = []
    private returnSingle = false
    private pendingUpdate: Record<string, unknown> | null = null
    private pendingInsert: any[] | null = null
    private deleteRequested = false

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

    insert(payload: Record<string, unknown> | Array<Record<string, unknown>>) {
      const rows = (Array.isArray(payload) ? payload : [payload]).map(row => ({ ...row }))
      db[this.table].push(...rows)
      this.pendingInsert = rows
      return this
    }

    update(payload: Record<string, unknown>) {
      this.pendingUpdate = payload
      return this
    }

    delete() {
      this.deleteRequested = true
      return this
    }

    maybeSingle() {
      this.returnSingle = true
      const rows = this.execute()
      return { data: rows[0] ?? null, error: null }
    }

    single() {
      this.returnSingle = true
      const rows = this.execute()
      return { data: rows[0] ?? null, error: null }
    }

    then(resolve: (value: { data: any; error: null }) => unknown) {
      return Promise.resolve({
        data: this.returnSingle ? this.execute()[0] ?? null : this.execute(),
        error: null,
      }).then(resolve)
    }

    private execute() {
      if (this.pendingInsert) {
        return this.pendingInsert
      }

      const rows = db[this.table].filter(row => this.filters.every(filter => filter(row)))

      if (this.pendingUpdate) {
        rows.forEach(row => Object.assign(row, this.pendingUpdate))
        return rows
      }

      if (this.deleteRequested) {
        db[this.table] = db[this.table].filter(row => !rows.includes(row))
        return []
      }

      return rows
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
    vi.mocked(resolveVehicleActiveBankAccount).mockResolvedValue({
      hasExactlyOneActiveAccount: true,
      hasNoActiveAccount: false,
      hasMultipleActiveAccounts: false,
      activeAccount: { id: 'bank-account-1' },
      activeAccounts: [{ id: 'bank-account-1' }],
      draftAccounts: [],
      accounts: [{ id: 'bank-account-1' }],
    } as any)
    vi.mocked(sendDealDispatchFanout).mockResolvedValue({
      success: true,
      errors: [],
    } as any)
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase() as any
    )
  })

  it('blocks bulk dispatch when the investor already received the selected term sheet', async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      createMockSupabase({
        deals: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Alpha Deal', status: 'open', vehicle_id: 'vehicle-1' }],
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

  it('blocks bulk redispatch for an existing member who already received the same term sheet', async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      createMockSupabase({
        deals: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Alpha Deal', status: 'open', vehicle_id: 'vehicle-1' }],
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

  it('redispatches an existing member onto a new term sheet instead of skipping them', async () => {
    vi.mocked(createOrResumeDealInvestmentCycle).mockResolvedValue({
      cycle: {
        id: 'cycle-2',
        role: 'investor',
        term_sheet_id: '55555555-5555-4555-8555-555555555555',
        assigned_fee_plan_id: null,
        referred_by_entity_id: null,
        referred_by_entity_type: null,
      },
      created: true,
      resumed: false,
      action: 'created',
    } as any)

    vi.mocked(createServiceClient).mockReturnValue(
      createMockSupabase({
        deals: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Alpha Deal', status: 'open', vehicle_id: 'vehicle-1' }],
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
        term_sheet_id: '55555555-5555-4555-8555-555555555555',
      }),
      { params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.dispatched_count).toBe(1)
    expect(data.skipped_count).toBe(0)
    expect(data.memberships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: '33333333-3333-4333-8333-333333333333',
          term_sheet_id: '55555555-5555-4555-8555-555555555555',
        }),
      ])
    )
    expect(createOrResumeDealInvestmentCycle).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId: '11111111-1111-4111-8111-111111111111',
        userId: '33333333-3333-4333-8333-333333333333',
        investorId: '44444444-4444-4444-8444-444444444444',
        termSheetId: '55555555-5555-4555-8555-555555555555',
      })
    )
    expect(sendDealDispatchFanout).toHaveBeenCalledOnce()
  })

  it('blocks dispatch when the vehicle has no active bank account', async () => {
    vi.mocked(resolveVehicleActiveBankAccount).mockResolvedValue({
      hasExactlyOneActiveAccount: false,
      hasNoActiveAccount: true,
      hasMultipleActiveAccounts: false,
      activeAccount: null,
      activeAccounts: [],
      draftAccounts: [],
      accounts: [],
    } as any)

    vi.mocked(createServiceClient).mockReturnValue(
      createMockSupabase({
        deals: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Alpha Deal', status: 'open', vehicle_id: 'vehicle-42' }],
      }) as any
    )

    const { POST } = await import('@/app/api/deals/[id]/dispatch/route')

    const response = await POST(
      createRequest({
        user_ids: ['33333333-3333-4333-8333-333333333333'],
        role: 'investor',
        term_sheet_id: '55555555-5555-4555-8555-555555555555',
      }),
      { params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.reasonCode).toBe('vehicle_bank_account_missing')
    expect(data.vehicle_id).toBe('vehicle-42')
    expect(data.fixUrl).toBe('/versotech_main/entities/vehicle-42?tab=bank_accounts')
    expect(createOrResumeDealInvestmentCycle).not.toHaveBeenCalled()
    expect(sendDealDispatchFanout).not.toHaveBeenCalled()
  })
})
