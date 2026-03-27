import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'

type TableName =
  | 'investor_users'
  | 'deal_data_room_access'
  | 'deals'
  | 'approvals'

type TestDb = Record<TableName, any[]>

function createRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/data-room-access/request-extension', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function createMockSupabase(seed: Partial<TestDb> = {}) {
  const db: TestDb = {
    investor_users: seed.investor_users ? [...seed.investor_users] : [],
    deal_data_room_access: seed.deal_data_room_access ? [...seed.deal_data_room_access] : [],
    deals: seed.deals ? [...seed.deals] : [],
    approvals: seed.approvals ? [...seed.approvals] : [],
  }

  class QueryBuilder {
    private filters: Array<(row: any) => boolean> = []
    private pendingInsert: any[] | null = null
    private orderBy: Array<{ column: string; ascending: boolean }> = []
    private rowLimit: number | null = null

    constructor(private table: TableName) {}

    select() {
      return this
    }

    eq(column: string, value: unknown) {
      this.filters.push(row => row[column] === value)
      return this
    }

    is(column: string, value: unknown) {
      this.filters.push(row => row[column] === value)
      return this
    }

    order(column: string, options?: { ascending?: boolean }) {
      this.orderBy.push({ column, ascending: options?.ascending !== false })
      return this
    }

    limit(count: number) {
      this.rowLimit = count
      return this
    }

    insert(payload: Record<string, unknown> | Array<Record<string, unknown>>) {
      const rows = (Array.isArray(payload) ? payload : [payload]).map((row, index) => ({
        id: row.id ?? `approval-${db[this.table].length + index + 1}`,
        ...row,
      }))
      db[this.table].push(...rows)
      this.pendingInsert = rows
      return this
    }

    single() {
      const rows = this.execute()
      return { data: rows[0] ?? null, error: null }
    }

    maybeSingle() {
      const rows = this.execute()
      return { data: rows[0] ?? null, error: null }
    }

    then(resolve: (value: { data: any; error: null }) => unknown) {
      return Promise.resolve({ data: this.execute(), error: null }).then(resolve)
    }

    private execute() {
      if (this.pendingInsert) {
        return this.pendingInsert
      }

      let rows = db[this.table].filter(row => this.filters.every(filter => filter(row)))

      for (let index = this.orderBy.length - 1; index >= 0; index -= 1) {
        const { column, ascending } = this.orderBy[index]
        rows = [...rows].sort((left, right) => {
          const leftValue = left[column] ?? null
          const rightValue = right[column] ?? null

          if (leftValue === rightValue) return 0
          if (leftValue === null) return ascending ? 1 : -1
          if (rightValue === null) return ascending ? -1 : 1
          if (leftValue < rightValue) return ascending ? -1 : 1
          return ascending ? 1 : -1
        })
      }

      if (this.rowLimit !== null) {
        rows = rows.slice(0, this.rowLimit)
      }

      return rows
    }
  }

  return {
    db,
    client: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
    },
    service: {
      from(table: TableName) {
        return new QueryBuilder(table)
      },
    },
  }
}

describe('data room access extension route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows extension requests when the prior access record is expired', async () => {
    const supabase = createMockSupabase({
      investor_users: [{ user_id: 'user-1', investor_id: 'investor-1' }],
      deal_data_room_access: [{
        id: 'access-1',
        deal_id: 'deal-1',
        investor_id: 'investor-1',
        expires_at: '2026-03-20T12:00:00.000Z',
        revoked_at: null,
      }],
      deals: [{ id: 'deal-1', name: 'OpenAI Secondary' }],
      approvals: [],
    })

    vi.mocked(createClient).mockResolvedValue(supabase.client as any)
    vi.mocked(createServiceClient).mockReturnValue(supabase.service as any)

    const { POST } = await import('@/app/api/data-room-access/request-extension/route')

    const response = await POST(createRequest({
      deal_id: 'deal-1',
      reason: 'Requesting renewed access after expiry',
    }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(supabase.db.approvals).toHaveLength(1)
    expect(supabase.db.approvals[0]).toMatchObject({
      entity_type: 'data_room_access_extension',
      entity_id: 'access-1',
      related_investor_id: 'investor-1',
      related_deal_id: 'deal-1',
      status: 'pending',
    })
    expect(supabase.db.approvals[0].entity_metadata).toMatchObject({
      current_expires_at: '2026-03-20T12:00:00.000Z',
      requested_reason: 'Requesting renewed access after expiry',
      access_id: 'access-1',
    })
  })

  it('rejects a duplicate request when an extension approval is already pending', async () => {
    const supabase = createMockSupabase({
      investor_users: [{ user_id: 'user-1', investor_id: 'investor-1' }],
      deal_data_room_access: [{
        id: 'access-1',
        deal_id: 'deal-1',
        investor_id: 'investor-1',
        expires_at: '2026-03-20T12:00:00.000Z',
        revoked_at: null,
      }],
      deals: [{ id: 'deal-1', name: 'OpenAI Secondary' }],
      approvals: [{
        id: 'approval-existing',
        entity_type: 'data_room_access_extension',
        entity_id: 'access-1',
        status: 'pending',
      }],
    })

    vi.mocked(createClient).mockResolvedValue(supabase.client as any)
    vi.mocked(createServiceClient).mockReturnValue(supabase.service as any)

    const { POST } = await import('@/app/api/data-room-access/request-extension/route')

    const response = await POST(createRequest({
      deal_id: 'deal-1',
      reason: 'Requesting renewed access after expiry',
    }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Extension request already pending approval')
    expect(supabase.db.approvals).toHaveLength(1)
  })

  it('resolves a primary investor link when the user has multiple investor accounts', async () => {
    const supabase = createMockSupabase({
      investor_users: [
        { user_id: 'user-1', investor_id: 'investor-older', is_primary: false, created_at: '2026-01-01T00:00:00.000Z' },
        { user_id: 'user-1', investor_id: 'investor-primary', is_primary: true, created_at: '2026-02-01T00:00:00.000Z' },
      ],
      deal_data_room_access: [{
        id: 'access-primary',
        deal_id: 'deal-1',
        investor_id: 'investor-primary',
        expires_at: '2026-03-20T12:00:00.000Z',
        revoked_at: null,
      }],
      deals: [{ id: 'deal-1', name: 'OpenAI Secondary' }],
      approvals: [],
    })

    vi.mocked(createClient).mockResolvedValue(supabase.client as any)
    vi.mocked(createServiceClient).mockReturnValue(supabase.service as any)

    const { POST } = await import('@/app/api/data-room-access/request-extension/route')

    const response = await POST(createRequest({
      deal_id: 'deal-1',
      reason: 'Requesting renewed access after expiry',
    }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(supabase.db.approvals).toHaveLength(1)
    expect(supabase.db.approvals[0]).toMatchObject({
      entity_id: 'access-primary',
      related_investor_id: 'investor-primary',
      related_deal_id: 'deal-1',
    })
  })
})
