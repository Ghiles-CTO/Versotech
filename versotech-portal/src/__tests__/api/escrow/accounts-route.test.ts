import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/api-auth', () => ({
  isStaffUser: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isStaffUser } from '@/lib/api-auth'

type TableName =
  | 'lawyer_users'
  | 'arranger_users'
  | 'partner_users'
  | 'vehicles'
  | 'deals'
  | 'deal_lawyer_assignments'
  | 'lawyers'
  | 'deal_fee_structures'
  | 'vehicle_bank_accounts'

type TestDb = Record<TableName, any[]>

function createMockServiceSupabase(seed: Partial<TestDb> = {}) {
  const db: TestDb = {
    lawyer_users: seed.lawyer_users ? [...seed.lawyer_users] : [],
    arranger_users: seed.arranger_users ? [...seed.arranger_users] : [],
    partner_users: seed.partner_users ? [...seed.partner_users] : [],
    vehicles: seed.vehicles ? [...seed.vehicles] : [],
    deals: seed.deals ? [...seed.deals] : [],
    deal_lawyer_assignments: seed.deal_lawyer_assignments ? [...seed.deal_lawyer_assignments] : [],
    lawyers: seed.lawyers ? [...seed.lawyers] : [],
    deal_fee_structures: seed.deal_fee_structures ? [...seed.deal_fee_structures] : [],
    vehicle_bank_accounts: seed.vehicle_bank_accounts ? [...seed.vehicle_bank_accounts] : [],
  }

  class QueryBuilder {
    private filters: Array<(row: any) => boolean> = []
    private singleMode = false
    private limitCount: number | null = null

    constructor(private table: TableName) {}

    select() {
      return this
    }

    eq(column: string, value: unknown) {
      this.filters.push((row) => row[column] === value)
      return this
    }

    in(column: string, values: unknown[]) {
      this.filters.push((row) => values.includes(row[column]))
      return this
    }

    order() {
      return this
    }

    limit(value: number) {
      this.limitCount = value
      return this
    }

    maybeSingle() {
      this.singleMode = true
      return this.result()
    }

    single() {
      this.singleMode = true
      return this.result()
    }

    then(resolve: (value: { data: any; error: null }) => unknown) {
      return Promise.resolve(this.result()).then(resolve)
    }

    private result() {
      let rows = db[this.table].filter((row) => this.filters.every((filter) => filter(row)))

      if (this.table === 'deal_fee_structures') {
        rows = rows.map((row) => ({
          ...row,
          deal: db.deals.find((deal) => deal.id === row.deal_id) || null,
        }))
      }

      if (this.limitCount !== null) {
        rows = rows.slice(0, this.limitCount)
      }

      return {
        data: this.singleMode ? rows[0] ?? null : rows,
        error: null,
      }
    }
  }

  return {
    from(table: TableName) {
      return new QueryBuilder(table)
    },
  }
}

describe('escrow accounts route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
    } as any)
    vi.mocked(isStaffUser).mockResolvedValue(false)
  })

  it('returns lawyer escrow rows from vehicle assignment even without legacy deal assignments', async () => {
    vi.mocked(createServiceClient).mockReturnValue(createMockServiceSupabase({
      lawyer_users: [{ user_id: 'user-1', lawyer_id: 'law-1' }],
      vehicles: [{ id: 'vehicle-1', lawyer_id: 'law-1' }],
      deals: [{
        id: 'deal-1',
        name: 'Alpha Deal',
        company_name: 'Alpha',
        target_amount: 1000000,
        currency: 'USD',
        status: 'open',
        vehicle_id: 'vehicle-1',
      }],
      lawyers: [{ id: 'law-1', assigned_deals: null }],
      deal_fee_structures: [{
        id: 'fee-1',
        deal_id: 'deal-1',
        status: 'published',
        legal_counsel: 'Law 1',
        escrow_fee_text: 'As per agreement',
      }],
      vehicle_bank_accounts: [{
        vehicle_id: 'vehicle-1',
        status: 'active',
        bank_name: 'ING Luxembourg S.A.',
        holder_name: 'Dupont Partners',
        iban: 'LU71 0141 8595 5133 3010',
        bic: 'CELLLULLXXX',
        lawyer: { display_name: 'Dupont Partners', firm_name: 'Dupont Partners' },
      }],
    }) as any)

    const { GET } = await import('@/app/api/escrow/accounts/route')

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.feeStructures).toHaveLength(1)
    expect(data.feeStructures[0].deal_id).toBe('deal-1')
    expect(data.feeStructures[0].wire_bank_name).toBe('ING Luxembourg S.A.')
  })
})
