import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(),
}))

import { createServiceClient } from '@/lib/supabase/server'
import { triggerWorkflow } from '@/lib/trigger-workflow'

type TableName = 'workflows' | 'workflow_runs' | 'audit_logs'

type TestDb = Record<TableName, any[]>

function createMockSupabase(
  seed: Partial<TestDb> = {},
  options: { failWorkflowRunInsertMessage?: string } = {}
) {
  const db: TestDb = {
    workflows: seed.workflows ? [...seed.workflows] : [],
    workflow_runs: seed.workflow_runs ? [...seed.workflow_runs] : [],
    audit_logs: seed.audit_logs ? [...seed.audit_logs] : [],
  }

  class QueryBuilder {
    private filters: Array<(row: any) => boolean> = []
    private pendingInsert: any[] | null = null
    private pendingUpdate: Record<string, unknown> | null = null
    private returnSingle = false

    constructor(private table: TableName) {}

    select() {
      return this
    }

    eq(column: string, value: unknown) {
      this.filters.push(row => row[column] === value)
      return this
    }

    insert(payload: Record<string, unknown> | Array<Record<string, unknown>>) {
      if (options.failWorkflowRunInsertMessage && this.table === 'workflow_runs') {
        this.pendingInsert = []
        return this
      }

      const rows = (Array.isArray(payload) ? payload : [payload]).map((row, index) => ({
        id: row.id ?? `${this.table}-${db[this.table].length + index + 1}`,
        ...row,
      }))
      db[this.table].push(...rows)
      this.pendingInsert = rows
      return this
    }

    update(payload: Record<string, unknown>) {
      this.pendingUpdate = payload
      return this
    }

    single() {
      this.returnSingle = true
      return this.result()
    }

    then(resolve: (value: { data: any; error: any }) => unknown) {
      return Promise.resolve(this.result()).then(resolve)
    }

    private result() {
      if (this.pendingInsert) {
        if (options.failWorkflowRunInsertMessage && this.table === 'workflow_runs') {
          return {
            data: null,
            error: { message: options.failWorkflowRunInsertMessage },
          }
        }

        return { data: this.returnSingle ? this.pendingInsert[0] ?? null : this.pendingInsert, error: null }
      }

      const rows = db[this.table].filter(row => this.filters.every(filter => filter(row)))

      if (this.pendingUpdate) {
        rows.forEach(row => Object.assign(row, this.pendingUpdate))
        return { data: this.returnSingle ? rows[0] ?? null : rows, error: null }
      }

      return {
        data: this.returnSingle ? rows[0] ?? null : rows,
        error: rows.length === 0 && this.returnSingle ? { message: 'Not found' } : null,
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

describe('triggerWorkflow', () => {
  const originalEnv = {
    N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
    N8N_OUTBOUND_SECRET: process.env.N8N_OUTBOUND_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'production'
    delete process.env.N8N_WEBHOOK_SECRET
    delete process.env.N8N_OUTBOUND_SECRET
    global.fetch = vi.fn(async () => ({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({ ok: true }),
    })) as any
  })

  afterEach(() => {
    process.env.N8N_WEBHOOK_SECRET = originalEnv.N8N_WEBHOOK_SECRET
    process.env.N8N_OUTBOUND_SECRET = originalEnv.N8N_OUTBOUND_SECRET
    process.env.NODE_ENV = originalEnv.NODE_ENV
    vi.unstubAllGlobals()
  })

  it('uses N8N_OUTBOUND_SECRET when N8N_WEBHOOK_SECRET is not set', async () => {
    const supabase = createMockSupabase({
      workflows: [{
        id: 'workflow-1',
        key: 'process-nda',
        is_active: true,
        n8n_webhook_url: 'https://example.com/webhook/NDA',
      }],
    })

    process.env.N8N_OUTBOUND_SECRET = 'your-secure-random-secret-for-outbound-webhooks'
    vi.mocked(createServiceClient).mockReturnValue(supabase as any)

    const result = await triggerWorkflow({
      workflowKey: 'process-nda',
      payload: { foo: 'bar' },
      entityType: 'deal_interest_nda',
      entityId: '11111111-1111-4111-8111-111111111111',
      user: {
        id: '22222222-2222-4222-8222-222222222222',
        email: 'jmachot@versoholdings.com',
        displayName: 'Julien Machot',
        role: 'ceo',
      },
    })

    expect(result.success).toBe(true)
    expect(supabase._db.workflow_runs).toHaveLength(1)
    expect(vi.mocked(global.fetch)).toHaveBeenCalledTimes(1)
  })

  it('fails before creating a workflow run only when both secrets are missing', async () => {
    const supabase = createMockSupabase({
      workflows: [{
        id: 'workflow-1',
        key: 'process-nda',
        is_active: true,
        n8n_webhook_url: 'https://example.com/webhook/NDA',
      }],
    })

    vi.mocked(createServiceClient).mockReturnValue(supabase as any)

    const result = await triggerWorkflow({
      workflowKey: 'process-nda',
      payload: { foo: 'bar' },
      entityType: 'deal_interest_nda',
      entityId: '11111111-1111-4111-8111-111111111111',
      user: {
        id: '22222222-2222-4222-8222-222222222222',
        email: 'jmachot@versoholdings.com',
        displayName: 'Julien Machot',
        role: 'ceo',
      },
    })

    expect(result).toEqual({
      success: false,
      error: 'Webhook authentication not configured. Cannot trigger workflow.',
    })
    expect(supabase._db.workflow_runs).toHaveLength(0)
    expect(vi.mocked(global.fetch)).not.toHaveBeenCalled()
  })

  it('returns the workflow run insert failure without calling n8n', async () => {
    const supabase = createMockSupabase(
      {
        workflows: [{
          id: 'workflow-1',
          key: 'process-nda',
          is_active: true,
          n8n_webhook_url: 'https://example.com/webhook/NDA',
        }],
      },
      {
        failWorkflowRunInsertMessage: 'new row violates row-level security policy for table "workflow_runs"',
      }
    )

    process.env.N8N_OUTBOUND_SECRET = 'your-secure-random-secret-for-outbound-webhooks'
    vi.mocked(createServiceClient).mockReturnValue(supabase as any)

    const result = await triggerWorkflow({
      workflowKey: 'process-nda',
      payload: { foo: 'bar' },
      entityType: 'deal_interest_nda',
      entityId: '11111111-1111-4111-8111-111111111111',
      user: {
        id: '22222222-2222-4222-8222-222222222222',
        email: 'jmachot@versoholdings.com',
        displayName: 'Julien Machot',
        role: 'staff_admin',
      },
    })

    expect(result).toEqual({
      success: false,
      error: 'Failed to create workflow run',
    })
    expect(supabase._db.workflow_runs).toHaveLength(0)
    expect(vi.mocked(global.fetch)).not.toHaveBeenCalled()
  })
})
