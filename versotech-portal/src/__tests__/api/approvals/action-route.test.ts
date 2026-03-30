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
import { triggerWorkflow } from '@/lib/trigger-workflow'
import { createSignatureRequest } from '@/lib/signature/client'
import { getCeoSigner } from '@/lib/staff/ceo-signer'

type TableName =
  | 'approvals'
  | 'deal_subscription_submissions'
  | 'investor_notifications'
  | 'investor_deal_interest'
  | 'investors'
  | 'deals'
  | 'investor_members'
  | 'workflow_runs'
  | 'signature_requests'
  | 'tasks'

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
    investor_deal_interest: seed.investor_deal_interest ? [...seed.investor_deal_interest] : [],
    investors: seed.investors ? [...seed.investors] : [],
    deals: seed.deals ? [...seed.deals] : [],
    investor_members: seed.investor_members ? [...seed.investor_members] : [],
    workflow_runs: seed.workflow_runs ? [...seed.workflow_runs] : [],
    signature_requests: seed.signature_requests ? [...seed.signature_requests] : [],
    tasks: seed.tasks ? [...seed.tasks] : [],
  }

  const removedStorageFiles: Array<{ bucket: string; paths: string[] }> = []

  class QueryBuilder {
    private filters: Array<(row: any) => boolean> = []
    private pendingUpdate: Record<string, unknown> | null = null
    private pendingInsert: any[] | null = null
    private pendingDelete = false
    private returnSingle = false

    constructor(private table: TableName, private updateOptions?: { count?: 'exact' }) {}

    select() {
      return this
    }

    eq(column: string, value: unknown) {
      this.filters.push(row => row[column] === value)
      return this
    }

    neq(column: string, value: unknown) {
      this.filters.push(row => row[column] !== value)
      return this
    }

    in(column: string, values: unknown[]) {
      this.filters.push(row => values.includes(row[column]))
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

    delete() {
      this.pendingDelete = true
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

      if (this.pendingDelete) {
        db[this.table] = db[this.table].filter(row => !this.filters.every(filter => filter(row)))
        return { data: this.returnSingle ? rows[0] ?? null : rows, error: null }
      }

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
    storage: {
      from(bucket: string) {
        return {
          remove: async (paths: string[]) => {
            removedStorageFiles.push({ bucket, paths: [...paths] })
            return { data: paths, error: null }
          },
        }
      },
    },
    _db: db,
    _removedStorageFiles: removedStorageFiles,
  }
}

describe('approval action route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue({} as any)
    vi.mocked(requireStaffAuth).mockResolvedValue({
      id: 'staff-user-1',
      email: 'staff@test.com',
      role: 'staff_ops',
    } as any)
    vi.mocked(updateDealInvestmentCycleProgress).mockResolvedValue(undefined)
    vi.mocked(createSignatureRequest).mockReset()
    vi.mocked(getCeoSigner).mockResolvedValue(null)
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

  it('rolls the approval back to pending when NDA workflow triggering fails', async () => {
    const supabase = createMockSupabase({
      approvals: [{
        id: 'approval-nda-1',
        entity_id: 'interest-1',
        entity_type: 'deal_interest',
        status: 'pending',
        created_at: '2026-03-26T12:00:00.000Z',
        requested_by: 'investor-user-1',
        requested_by_profile: {
          id: 'investor-user-1',
          display_name: 'Ashish Damankar',
          email: 'adamankar@versoholdings.com',
        },
      }],
      investor_deal_interest: [{
        id: 'interest-1',
        deal_id: 'deal-1',
        investor_id: 'investor-1',
        status: 'pending_review',
        deal: {
          id: 'deal-1',
          name: 'Test Deal',
        },
      }],
      investors: [{
        id: 'investor-1',
        type: 'individual',
        legal_name: 'Ashish Damankar',
        display_name: 'Ashish Damankar',
        email: 'adamankar@versoholdings.com',
        residential_street: 'Test Street 1',
        residential_line_2: '',
        residential_postal_code: '12345',
        residential_city: 'Luxembourg',
        residential_country: 'LU',
        registered_address: null,
        registered_address_line_1: null,
        registered_address_line_2: null,
        registered_postal_code: null,
        registered_city: null,
        registered_country: null,
        address_line_1: null,
        address_line_2: null,
        postal_code: null,
        city: null,
        country: null,
        country_of_incorporation: null,
      }],
      deals: [{
        id: 'deal-1',
        name: 'Test Deal',
        description: 'Test Deal Description',
        vehicle: {
          name: 'VERSO Capital 0 SCSP Series 001',
          entity_code: 'VC001',
          series_short_title: 'VC',
          series_number: '001',
          investment_name: 'Test Investment',
          address: '2 Avenue Charles de Gaulle',
          domicile: 'Luxembourg, LU',
        },
      }],
    })

    vi.mocked(createServiceClient).mockReturnValue(supabase as any)
    vi.mocked(triggerWorkflow).mockResolvedValue({
      success: false,
      error: 'Webhook authentication not configured. Cannot trigger workflow.',
    })

    const { POST } = await import('@/app/api/approvals/[id]/action/route')

    const response = await POST(
      createRequest({
        action: 'approve',
      }),
      { params: Promise.resolve({ id: 'approval-nda-1' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toMatch(/rolled back to pending status/i)
    expect(supabase._db.approvals[0].status).toBe('pending')
    expect(supabase._db.investor_deal_interest[0].status).toBe('pending_review')
  })

  it('cleans up staged NDA artifacts when a later signatory fails', async () => {
    const supabase = createMockSupabase({
      approvals: [{
        id: 'approval-nda-entity-1',
        entity_id: 'interest-entity-1',
        entity_type: 'deal_interest',
        status: 'pending',
        created_at: '2026-03-26T12:00:00.000Z',
        requested_by: 'investor-user-1',
        requested_by_profile: {
          id: 'investor-user-1',
          display_name: 'Julien Machot',
          email: 'jmachot@versoholdings.com',
        },
      }],
      investor_deal_interest: [{
        id: 'interest-entity-1',
        deal_id: 'deal-1',
        investor_id: 'investor-entity-1',
        status: 'pending_review',
        deal: {
          id: 'deal-1',
          name: 'Test Deal',
        },
      }],
      investors: [{
        id: 'investor-entity-1',
        type: 'entity',
        legal_name: 'Verso Holdings',
        display_name: 'Verso Holdings',
        email: 'ops@versoholdings.com',
        residential_street: null,
        residential_line_2: null,
        residential_postal_code: null,
        residential_city: null,
        residential_country: null,
        registered_address: null,
        registered_address_line_1: '2 Avenue Charles de Gaulle',
        registered_address_line_2: null,
        registered_postal_code: '1653',
        registered_city: 'Luxembourg',
        registered_country: 'LU',
        address_line_1: null,
        address_line_2: null,
        postal_code: null,
        city: null,
        country: null,
        country_of_incorporation: 'LU',
        representative_name: 'Julien Machot',
        representative_title: 'Director',
      }],
      investor_members: [
        {
          id: 'member-1',
          investor_id: 'investor-entity-1',
          full_name: 'Signer One',
          email: 'signer1@example.com',
          role_title: 'Director',
          is_signatory: true,
          is_active: true,
        },
        {
          id: 'member-2',
          investor_id: 'investor-entity-1',
          full_name: 'Signer Two',
          email: 'signer2@example.com',
          role_title: 'Director',
          is_signatory: true,
          is_active: true,
        },
      ],
      deals: [{
        id: 'deal-1',
        name: 'Test Deal',
        description: 'Test Deal Description',
        vehicle: {
          name: 'VERSO Capital 0 SCSP Series 001',
          entity_code: 'VC001',
          series_short_title: 'VC',
          series_number: '001',
          investment_name: 'Test Investment',
          address: '2 Avenue Charles de Gaulle',
          domicile: 'Luxembourg, LU',
        },
      }],
      workflow_runs: [{
        id: 'workflow-run-1',
        status: 'running',
      }],
    })

    vi.mocked(createServiceClient).mockReturnValue(supabase as any)
    vi.mocked(triggerWorkflow)
      .mockResolvedValueOnce({
        success: true,
        workflow_run_id: 'workflow-run-1',
        n8n_response: {
          id: 'google-file-1',
          webContentLink: 'https://example.com/nda-1.pdf',
        },
      })
      .mockResolvedValueOnce({
        success: false,
        error: 'Second NDA generation failed',
      })

    let createdSigCount = 0
    vi.mocked(createSignatureRequest).mockImplementation(async (_params, mockedSupabase: any) => {
      createdSigCount += 1
      const signatureRequestId = `sig-${createdSigCount}`
      mockedSupabase._db.signature_requests.push({
        id: signatureRequestId,
        unsigned_pdf_path: `unsigned/${signatureRequestId}.pdf`,
      })
      mockedSupabase._db.tasks.push({
        id: `task-${createdSigCount}`,
        related_entity_type: 'signature_request',
        related_entity_id: signatureRequestId,
        status: 'pending',
      })

      return {
        success: true,
        signature_request_id: signatureRequestId,
      }
    })

    const { POST } = await import('@/app/api/approvals/[id]/action/route')

    const response = await POST(
      createRequest({
        action: 'approve',
      }),
      { params: Promise.resolve({ id: 'approval-nda-entity-1' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toMatch(/rolled back to pending status/i)
    expect(supabase._db.approvals[0].status).toBe('pending')
    expect(supabase._db.investor_deal_interest[0].status).toBe('pending_review')
    expect(supabase._db.signature_requests).toHaveLength(0)
    expect(supabase._db.tasks).toHaveLength(0)
    expect(supabase._removedStorageFiles).toEqual([
      {
        bucket: 'signatures',
        paths: ['unsigned/sig-1.pdf'],
      },
    ])
  })
})
