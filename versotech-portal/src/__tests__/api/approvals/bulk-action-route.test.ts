import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/api-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}))

vi.mock('@/lib/deals/investment-cycles', () => ({
  updateDealInvestmentCycleProgress: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { updateDealInvestmentCycleProgress } from '@/lib/deals/investment-cycles'

type TableName = 'approvals' | 'deal_subscription_submissions'

type TestDb = Record<TableName, any[]>

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/approvals/bulk-action', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function createMockSupabase(seed: Partial<TestDb> = {}) {
  const db: TestDb = {
    approvals: seed.approvals ? [...seed.approvals] : [],
    deal_subscription_submissions: seed.deal_subscription_submissions
      ? [...seed.deal_subscription_submissions]
      : [],
  }

  class QueryBuilder {
    private filters: Array<(row: any) => boolean> = []
    private pendingUpdate: Record<string, unknown> | null = null
    private returnSingle = false

    constructor(private table: TableName, private updateOptions?: { count?: 'exact' }) {}

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

    update(payload: Record<string, unknown>, updateOptions?: { count?: 'exact' }) {
      this.pendingUpdate = payload
      this.updateOptions = updateOptions
      return this
    }

    maybeSingle() {
      this.returnSingle = true
      return this.result()
    }

    single() {
      this.returnSingle = true
      return this.result()
    }

    then(resolve: (value: { data: any; error: any; count?: number }) => unknown) {
      return Promise.resolve(this.result()).then(resolve)
    }

    private result() {
      const rows = db[this.table].filter(row => this.filters.every(filter => filter(row)))

      if (this.pendingUpdate) {
        rows.forEach(row => Object.assign(row, this.pendingUpdate))
        const data = this.returnSingle ? rows[0] ?? null : rows
        const count = this.updateOptions?.count === 'exact' ? rows.length : undefined
        return { data, error: null, count }
      }

      return {
        data: this.returnSingle ? rows[0] ?? null : rows,
        error: null,
      }
    }
  }

  return {
    from(table: TableName) {
      return new QueryBuilder(table)
    },
    _db: db,
  }
}

describe('bulk approval action route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue({} as any)
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      user: {
        id: 'staff-user-1',
        email: 'staff@test.com',
        user_metadata: { role: 'ceo' },
      } as any,
      error: null,
    })
    vi.mocked(updateDealInvestmentCycleProgress).mockResolvedValue(undefined)
  })

  it('rejects deal subscription submissions in the bulk approval flow', async () => {
    const supabase = createMockSupabase({
      approvals: [{
        id: '11111111-1111-4111-8111-111111111111',
        entity_id: '22222222-2222-4222-8222-222222222222',
        entity_type: 'deal_subscription',
        status: 'pending',
        assigned_to: null,
        priority: 'normal',
        created_at: '2026-03-26T12:00:00.000Z',
      }],
      deal_subscription_submissions: [{
        id: '22222222-2222-4222-8222-222222222222',
        status: 'pending_review',
        cycle_id: 'cycle-1',
        rejected_by: null,
        rejected_at: null,
        decided_by: null,
        decided_at: null,
      }],
    })

    vi.mocked(createServiceClient).mockReturnValue(supabase as any)

    const { POST } = await import('@/app/api/approvals/bulk-action/route')

    const response = await POST(createRequest({
      approval_ids: ['11111111-1111-4111-8111-111111111111'],
      action: 'reject',
      rejection_reason: 'Insufficient documentation',
    }) as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.successful_count).toBe(1)
    expect(supabase._db.approvals[0].status).toBe('rejected')
    expect(supabase._db.deal_subscription_submissions[0].status).toBe('rejected')
    expect(supabase._db.deal_subscription_submissions[0].rejection_reason).toBe('Insufficient documentation')
    expect(supabase._db.deal_subscription_submissions[0].rejected_by).toBe('staff-user-1')
    expect(updateDealInvestmentCycleProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        cycleId: 'cycle-1',
        status: 'rejected',
      })
    )
  })
})
