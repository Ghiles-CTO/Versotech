import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  requireStaffAuth: vi.fn(),
}))

vi.mock('@/lib/audit', () => ({
  auditLogger: {
    log: vi.fn(),
  },
  AuditActions: {},
}))

vi.mock('@/lib/trigger-workflow', () => ({
  triggerWorkflow: vi.fn(),
}))

vi.mock('@/lib/signature/client', () => ({
  createSignatureRequest: vi.fn(),
}))

vi.mock('@/lib/staff/ceo-signer', () => ({
  getCeoSigner: vi.fn(),
}))

vi.mock('@/lib/email/resend-service', () => ({
  sendAccountStatusEmail: vi.fn(),
  sendInvitationEmail: vi.fn(),
}))

vi.mock('@/lib/signature/token', () => ({
  getAppUrl: vi.fn(),
}))

vi.mock('@/lib/invitations/entity-invitation', () => ({
  resolveInvitationInviteeName: vi.fn(),
}))

vi.mock('@/lib/deals/deal-close-handler', () => ({
  handleDealClose: vi.fn(),
  handleTermsheetClose: vi.fn(),
}))

vi.mock('@/lib/deals/investment-cycles', () => ({
  getExistingFormalSubscriptionForCycle: vi.fn(),
  updateDealInvestmentCycleProgress: vi.fn(),
}))

vi.mock('@/lib/subscription-pack/payload-builder', () => ({
  buildSubscriptionPackPayload: vi.fn(),
}))

vi.mock('@/lib/subscription-pack/pdf-format-guard', () => ({
  assertSubscriptionPackPdfIsA4: vi.fn(),
}))

vi.mock('@/lib/subscription/page-numbering', () => ({
  applySubscriptionPackPageNumbers: vi.fn(),
}))

vi.mock('@/lib/notifications/entity-recipient-groups', () => ({
  getEntityPrimaryAndAdminRecipients: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { updateDealInvestmentCycleProgress } from '@/lib/deals/investment-cycles'

type TableName = 'approvals' | 'deal_subscription_submissions' | 'investor_notifications'

type TestDb = Record<TableName, any[]>

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/approvals/approval-1/action', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function createMockSupabase(
  seed: Partial<TestDb> = {},
  options: { failSubmissionUpdate?: boolean } = {}
) {
  const db: TestDb = {
    approvals: seed.approvals ? [...seed.approvals] : [],
    deal_subscription_submissions: seed.deal_subscription_submissions
      ? [...seed.deal_subscription_submissions]
      : [],
    investor_notifications: seed.investor_notifications ? [...seed.investor_notifications] : [],
  }

  class QueryBuilder {
    private filters: Array<(row: any) => boolean> = []
    private pendingUpdate: Record<string, unknown> | null = null
    private pendingInsert: any[] | null = null
    private returnSingle = false

    constructor(private table: TableName, private updateOptions?: { count?: 'exact' }) {}

    select() {
      return this
    }

    eq(column: string, value: unknown) {
      this.filters.push(row => row[column] === value)
      return this
    }

    insert(payload: Record<string, unknown> | Array<Record<string, unknown>>) {
      const rows = (Array.isArray(payload) ? payload : [payload]).map(row => ({ ...row }))
      db[this.table].push(...rows)
      this.pendingInsert = rows
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
      if (this.pendingInsert) {
        return { data: this.returnSingle ? this.pendingInsert[0] ?? null : this.pendingInsert, error: null }
      }

      const rows = db[this.table].filter(row => this.filters.every(filter => filter(row)))

      if (this.pendingUpdate) {
        if (options.failSubmissionUpdate && this.table === 'deal_subscription_submissions') {
          return { data: null, error: { message: 'column "updated_at" does not exist' }, count: 0 }
        }

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

describe('approval action route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue({} as any)
    vi.mocked(requireStaffAuth).mockResolvedValue({
      id: 'staff-user-1',
      email: 'staff@test.com',
    } as any)
    vi.mocked(updateDealInvestmentCycleProgress).mockResolvedValue(undefined)
  })

  it('rejects a deal subscription submission with rejected timestamps instead of leaving it pending review', async () => {
    const supabase = createMockSupabase({
      approvals: [{
        id: 'approval-1',
        entity_id: 'submission-1',
        entity_type: 'deal_subscription',
        status: 'pending',
        created_at: '2026-03-26T12:00:00.000Z',
        requested_by: null,
      }],
      deal_subscription_submissions: [{
        id: 'submission-1',
        status: 'pending_review',
        cycle_id: 'cycle-1',
        rejection_reason: null,
        rejected_by: null,
        rejected_at: null,
        decided_by: null,
        decided_at: null,
      }],
    })

    vi.mocked(createServiceClient).mockReturnValue(supabase as any)

    const { POST } = await import('@/app/api/approvals/[id]/action/route')

    const response = await POST(
      createRequest({
        action: 'reject',
        rejection_reason: 'Insufficient documentation',
      }),
      { params: Promise.resolve({ id: 'approval-1' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Approval rejected successfully')
    expect(supabase._db.approvals[0].status).toBe('rejected')
    expect(supabase._db.deal_subscription_submissions[0].status).toBe('rejected')
    expect(supabase._db.deal_subscription_submissions[0].rejection_reason).toBe('Insufficient documentation')
    expect(supabase._db.deal_subscription_submissions[0].rejected_by).toBe('staff-user-1')
    expect(supabase._db.deal_subscription_submissions[0].decided_by).toBe('staff-user-1')
    expect(supabase._db.deal_subscription_submissions[0]).not.toHaveProperty('updated_at')
    expect(updateDealInvestmentCycleProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        cycleId: 'cycle-1',
        status: 'rejected',
      })
    )
  })

  it('rolls the approval back to pending when the subscription rejection side effect fails', async () => {
    const supabase = createMockSupabase(
      {
        approvals: [{
          id: 'approval-1',
          entity_id: 'submission-1',
          entity_type: 'deal_subscription',
          status: 'pending',
          created_at: '2026-03-26T12:00:00.000Z',
          requested_by: null,
          rejection_reason: null,
        }],
        deal_subscription_submissions: [{
          id: 'submission-1',
          status: 'pending_review',
          cycle_id: 'cycle-1',
        }],
      },
      { failSubmissionUpdate: true }
    )

    vi.mocked(createServiceClient).mockReturnValue(supabase as any)

    const { POST } = await import('@/app/api/approvals/[id]/action/route')

    const response = await POST(
      createRequest({
        action: 'reject',
        rejection_reason: 'Insufficient documentation',
      }),
      { params: Promise.resolve({ id: 'approval-1' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toMatch(/rolled back to pending status/i)
    expect(supabase._db.approvals[0].status).toBe('pending')
    expect(supabase._db.approvals[0].rejection_reason).toBeNull()
    expect(supabase._db.deal_subscription_submissions[0].status).toBe('pending_review')
  })
})
