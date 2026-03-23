import { beforeEach, describe, expect, it } from 'vitest'
import {
  createOrResumeDealInvestmentCycle,
  getOrCreateSubmissionCycle,
  type DealInvestmentCycleRow,
} from '@/lib/deals/investment-cycles'

type TableName =
  | 'deal_investment_cycles'
  | 'deals'
  | 'deal_fee_structures'
  | 'subscriptions'
  | 'deal_subscription_submissions'

type TestDb = Record<TableName, any[]>

function createCycle(overrides: Partial<DealInvestmentCycleRow> = {}): DealInvestmentCycleRow {
  return {
    id: 'cycle-1',
    deal_id: 'deal-1',
    user_id: 'user-1',
    investor_id: 'investor-1',
    term_sheet_id: 'ts-1',
    role: 'investor',
    referred_by_entity_id: null,
    referred_by_entity_type: null,
    assigned_fee_plan_id: null,
    sequence_number: 1,
    status: 'dispatched',
    created_at: '2026-03-20T10:00:00.000Z',
    updated_at: '2026-03-20T10:00:00.000Z',
    dispatched_at: '2026-03-20T10:00:00.000Z',
    viewed_at: null,
    interest_confirmed_at: null,
    submission_pending_at: null,
    approved_at: null,
    pack_generated_at: null,
    pack_sent_at: null,
    signed_at: null,
    funded_at: null,
    activated_at: null,
    cancelled_at: null,
    rejected_at: null,
    rejection_reason: null,
    metadata: null,
    ...overrides,
  }
}

function createTestSupabase(seed?: Partial<TestDb>) {
  const db: TestDb = {
    deal_investment_cycles: seed?.deal_investment_cycles ? [...seed.deal_investment_cycles] : [],
    deals: seed?.deals ? [...seed.deals] : [],
    deal_fee_structures: seed?.deal_fee_structures ? [...seed.deal_fee_structures] : [],
    subscriptions: seed?.subscriptions ? [...seed.subscriptions] : [],
    deal_subscription_submissions: seed?.deal_subscription_submissions ? [...seed.deal_subscription_submissions] : [],
  }

  let idCounter = 100

  class QueryBuilder {
    private filters: Array<(row: any) => boolean> = []
    private sorts: Array<{ column: string; ascending: boolean }> = []
    private limitCount: number | null = null
    private selectMode = false
    private returnSingle = false
    private updatePatch: Record<string, unknown> | null = null
    private insertPayload: any[] | null = null
    private op: 'select' | 'update' | 'insert' = 'select'

    constructor(private table: TableName) {}

    select() {
      this.selectMode = true
      return this
    }

    update(patch: Record<string, unknown>) {
      this.op = 'update'
      this.updatePatch = patch
      return this
    }

    insert(payload: Record<string, unknown> | Array<Record<string, unknown>>) {
      this.op = 'insert'
      this.insertPayload = Array.isArray(payload) ? payload : [payload]
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

    not(column: string, operator: string, value: string) {
      if (operator === 'in') {
        const excluded = value.replace(/[()]/g, '').split(',').map((part) => part.trim())
        this.filters.push((row) => !excluded.includes(String(row[column])))
      }
      return this
    }

    order(column: string, options?: { ascending?: boolean }) {
      this.sorts.push({ column, ascending: options?.ascending !== false })
      return this
    }

    limit(count: number) {
      this.limitCount = count
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
      return Promise.resolve({ data: this.finalize(), error: null }).then(resolve)
    }

    private execute() {
      if (this.op === 'insert') {
        const inserted = (this.insertPayload || []).map((payload) => {
          const row = {
            id: payload.id ?? `${this.table}-${idCounter++}`,
            created_at: payload.created_at ?? '2026-03-22T10:00:00.000Z',
            updated_at: payload.updated_at ?? '2026-03-22T10:00:00.000Z',
            ...payload,
          }
          db[this.table].push(row)
          return row
        })
        return inserted
      }

      const rows = db[this.table].filter((row) => this.filters.every((filter) => filter(row)))

      if (this.op === 'update') {
        return rows.map((row) => {
          Object.assign(row, this.updatePatch, { updated_at: '2026-03-22T10:00:00.000Z' })
          return row
        })
      }

      return rows
    }

    private finalize() {
      let rows = this.execute()
      for (const sort of this.sorts) {
        rows = [...rows].sort((left, right) => {
          const leftValue = left[sort.column]
          const rightValue = right[sort.column]
          if (leftValue === rightValue) return 0
          if (leftValue == null) return sort.ascending ? 1 : -1
          if (rightValue == null) return sort.ascending ? -1 : 1
          if (leftValue > rightValue) return sort.ascending ? 1 : -1
          return sort.ascending ? -1 : 1
        })
      }
      if (this.limitCount !== null) {
        rows = rows.slice(0, this.limitCount)
      }
      if (this.returnSingle) {
        return rows[0] ?? null
      }
      return rows
    }
  }

  return {
    db,
    client: {
      from(table: TableName) {
        return new QueryBuilder(table)
      },
    },
  }
}

describe('investment cycle workflow rules', () => {
  let nowIso: string

  beforeEach(() => {
    nowIso = '2026-03-22T12:00:00.000Z'
  })

  it('resumes the same live term-sheet workflow instead of creating a duplicate dispatch', async () => {
    const existingCycle = createCycle({ id: 'cycle-live', status: 'viewed' })
    const { client, db } = createTestSupabase({
      deal_investment_cycles: [existingCycle],
    })

    const result = await createOrResumeDealInvestmentCycle({
      supabase: client as any,
      dealId: 'deal-1',
      userId: 'user-1',
      investorId: 'investor-1',
      termSheetId: 'ts-1',
      role: 'investor',
      dispatchTimestamp: nowIso,
    })

    expect(result.action).toBe('resumed')
    expect(result.created).toBe(false)
    expect(db.deal_investment_cycles).toHaveLength(1)
    expect(db.deal_investment_cycles[0].id).toBe('cycle-live')
  })

  it('cancels an early live workflow and creates a fresh cycle when staff switches to another term sheet', async () => {
    const existingCycle = createCycle({
      id: 'cycle-old',
      term_sheet_id: 'ts-1',
      status: 'viewed',
      sequence_number: 1,
    })
    const { client, db } = createTestSupabase({
      deal_investment_cycles: [existingCycle],
    })

    const result = await createOrResumeDealInvestmentCycle({
      supabase: client as any,
      dealId: 'deal-1',
      userId: 'user-1',
      investorId: 'investor-1',
      termSheetId: 'ts-2',
      role: 'investor',
      dispatchTimestamp: nowIso,
    })

    expect(result.action).toBe('replaced')
    expect(result.created).toBe(true)
    expect(result.replacedCycleId).toBe('cycle-old')
    expect(db.deal_investment_cycles).toHaveLength(2)
    expect(db.deal_investment_cycles[0].status).toBe('cancelled')
    expect(db.deal_investment_cycles[1].term_sheet_id).toBe('ts-2')
    expect(db.deal_investment_cycles[1].sequence_number).toBe(2)
  })

  it('blocks a term-sheet switch once the investor is past the early stage', async () => {
    const existingCycle = createCycle({
      id: 'cycle-protected',
      term_sheet_id: 'ts-1',
      status: 'submission_pending_review',
      submission_pending_at: nowIso,
    })
    const { client } = createTestSupabase({
      deal_investment_cycles: [existingCycle],
    })

    await expect(
      createOrResumeDealInvestmentCycle({
        supabase: client as any,
        dealId: 'deal-1',
        userId: 'user-1',
        investorId: 'investor-1',
        termSheetId: 'ts-2',
        role: 'investor',
        dispatchTimestamp: nowIso,
      })
    ).rejects.toThrow('Investor already has an active term sheet workflow for this opportunity')
  })

  it('creates a new reinvestment cycle only when there is funded history and no other live workflow', async () => {
    const fundedCycle = createCycle({
      id: 'cycle-funded',
      status: 'funded',
      funded_at: '2026-03-10T10:00:00.000Z',
      sequence_number: 1,
    })
    const { client, db } = createTestSupabase({
      deal_investment_cycles: [fundedCycle],
      deals: [{ id: 'deal-1', status: 'open', close_at: '2026-12-31T00:00:00.000Z', closed_processed_at: null }],
      deal_fee_structures: [{ id: 'ts-1', deal_id: 'deal-1', status: 'published', completion_date: '2026-12-31T00:00:00.000Z', closed_processed_at: null }],
    })

    const cycle = await getOrCreateSubmissionCycle(client as any, {
      dealId: 'deal-1',
      investorId: 'investor-1',
      userId: 'user-1',
      role: 'investor',
      termSheetId: 'ts-1',
      intent: 'start_new_cycle',
    })

    expect(cycle.sequence_number).toBe(2)
    expect(cycle.status).toBe('dispatched')
    expect(db.deal_investment_cycles).toHaveLength(2)
  })

  it('blocks reinvestment if another live workflow already exists on the opportunity', async () => {
    const fundedCycle = createCycle({
      id: 'cycle-funded',
      status: 'funded',
      funded_at: '2026-03-10T10:00:00.000Z',
      sequence_number: 1,
    })
    const liveCycle = createCycle({
      id: 'cycle-live',
      term_sheet_id: 'ts-2',
      status: 'viewed',
      sequence_number: 2,
    })
    const { client } = createTestSupabase({
      deal_investment_cycles: [fundedCycle, liveCycle],
      deals: [{ id: 'deal-1', status: 'open', close_at: '2026-12-31T00:00:00.000Z', closed_processed_at: null }],
      deal_fee_structures: [{ id: 'ts-1', deal_id: 'deal-1', status: 'published', completion_date: '2026-12-31T00:00:00.000Z', closed_processed_at: null }],
    })

    await expect(
      getOrCreateSubmissionCycle(client as any, {
        dealId: 'deal-1',
        investorId: 'investor-1',
        userId: 'user-1',
        role: 'investor',
        termSheetId: 'ts-1',
        intent: 'start_new_cycle',
      })
    ).rejects.toThrow('Investor already has an active workflow for this opportunity.')
  })

  it('blocks continuing a cycle once it already has a formal subscription', async () => {
    const cycle = createCycle({
      id: 'cycle-continue',
      status: 'interest_confirmed',
      interest_confirmed_at: '2026-03-21T10:00:00.000Z',
    })
    const { client } = createTestSupabase({
      deal_investment_cycles: [cycle],
      deals: [{ id: 'deal-1', status: 'open', close_at: '2026-12-31T00:00:00.000Z', closed_processed_at: null }],
      deal_fee_structures: [{ id: 'ts-1', deal_id: 'deal-1', status: 'published', completion_date: '2026-12-31T00:00:00.000Z', closed_processed_at: null }],
      subscriptions: [{ id: 'sub-1', cycle_id: 'cycle-continue', status: 'committed' }],
    })

    await expect(
      getOrCreateSubmissionCycle(client as any, {
        dealId: 'deal-1',
        investorId: 'investor-1',
        userId: 'user-1',
        role: 'investor',
        cycleId: 'cycle-continue',
        intent: 'continue_cycle',
      })
    ).rejects.toThrow('already has a subscription')
  })

  it('allows a rejected first-request cycle to be retried on the same term sheet', async () => {
    const cycle = createCycle({
      id: 'cycle-rejected',
      status: 'rejected',
      viewed_at: '2026-03-21T10:00:00.000Z',
      interest_confirmed_at: '2026-03-21T10:05:00.000Z',
      submission_pending_at: '2026-03-21T10:10:00.000Z',
    })
    const { client } = createTestSupabase({
      deal_investment_cycles: [cycle],
      deals: [{ id: 'deal-1', status: 'open', close_at: '2026-12-31T00:00:00.000Z', closed_processed_at: null }],
      deal_fee_structures: [{ id: 'ts-1', deal_id: 'deal-1', status: 'published', completion_date: '2026-12-31T00:00:00.000Z', closed_processed_at: null }],
    })

    const resolved = await getOrCreateSubmissionCycle(client as any, {
      dealId: 'deal-1',
      investorId: 'investor-1',
      userId: 'user-1',
      role: 'investor',
      cycleId: 'cycle-rejected',
      intent: 'continue_cycle',
    })

    expect(resolved.id).toBe('cycle-rejected')
  })

  it('still blocks continuing a rejected additional-investment cycle', async () => {
    const cycle = createCycle({
      id: 'cycle-rejected-topup',
      sequence_number: 2,
      status: 'rejected',
      funded_at: null,
    })
    const { client } = createTestSupabase({
      deal_investment_cycles: [cycle],
      deals: [{ id: 'deal-1', status: 'open', close_at: '2026-12-31T00:00:00.000Z', closed_processed_at: null }],
      deal_fee_structures: [{ id: 'ts-1', deal_id: 'deal-1', status: 'published', completion_date: '2026-12-31T00:00:00.000Z', closed_processed_at: null }],
    })

    await expect(
      getOrCreateSubmissionCycle(client as any, {
        dealId: 'deal-1',
        investorId: 'investor-1',
        userId: 'user-1',
        role: 'investor',
        cycleId: 'cycle-rejected-topup',
        intent: 'continue_cycle',
      })
    ).rejects.toThrow('Investment cycle is already closed')
  })
})
