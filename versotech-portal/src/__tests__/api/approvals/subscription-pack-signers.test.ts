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

vi.mock('@/lib/staff/arranger-signer', () => ({
  getArrangerSigner: vi.fn(),
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

vi.mock('@/lib/approvals/requester-notifications', () => ({
  getRequesterApprovalNotificationCopy: vi.fn(),
}))

vi.mock('@/lib/subscriptions/signatory-resolution', () => ({
  resolveSubscriptionSigners: vi.fn(),
}))

vi.mock('@/lib/vehicles/bank-accounts', () => ({
  resolveVehicleActiveBankAccount: vi.fn(),
  toVehicleBankAccountPayload: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { triggerWorkflow } from '@/lib/trigger-workflow'
import { getCeoSigner } from '@/lib/staff/ceo-signer'
import { getArrangerSigner } from '@/lib/staff/arranger-signer'
import {
  getExistingFormalSubscriptionForCycle,
  updateDealInvestmentCycleProgress,
} from '@/lib/deals/investment-cycles'
import { buildSubscriptionPackPayload } from '@/lib/subscription-pack/payload-builder'
import { resolveSubscriptionSigners } from '@/lib/subscriptions/signatory-resolution'
import {
  resolveVehicleActiveBankAccount,
  toVehicleBankAccountPayload,
} from '@/lib/vehicles/bank-accounts'

type DbTable = Record<string, any[]>

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/approvals/approval-1/action', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function createMockSupabase(seed: DbTable) {
  const db: DbTable = Object.fromEntries(
    Object.entries(seed).map(([tableName, rows]) => [tableName, rows.map((row) => ({ ...row }))])
  )

  class QueryBuilder {
    private filters: Array<(row: any) => boolean> = []
    private pendingUpdate: Record<string, unknown> | null = null
    private pendingInsert: any[] | null = null
    private pendingDelete = false
    private returnSingle = false
    private sortColumn: string | null = null
    private sortAscending = true
    private maxRows: number | null = null
    private countExact = false

    constructor(private table: string) {}

    select() {
      return this
    }

    eq(column: string, value: unknown) {
      this.filters.push((row) => row[column] === value)
      return this
    }

    neq(column: string, value: unknown) {
      this.filters.push((row) => row[column] !== value)
      return this
    }

    in(column: string, values: unknown[]) {
      this.filters.push((row) => values.includes(row[column]))
      return this
    }

    is(column: string, value: unknown) {
      this.filters.push((row) => row[column] === value)
      return this
    }

    order(column: string, options?: { ascending?: boolean }) {
      this.sortColumn = column
      this.sortAscending = options?.ascending !== false
      return this
    }

    limit(value: number) {
      this.maxRows = value
      return this
    }

    insert(payload: Record<string, unknown> | Array<Record<string, unknown>>) {
      const rows = (Array.isArray(payload) ? payload : [payload]).map((row) => ({ ...row }))
      db[this.table] = db[this.table] || []
      db[this.table].push(...rows)
      this.pendingInsert = rows
      return this
    }

    update(payload: Record<string, unknown>, options?: { count?: 'exact' }) {
      this.pendingUpdate = payload
      this.countExact = options?.count === 'exact'
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

    then(resolve: (value: { data: any; error: any }) => unknown) {
      return Promise.resolve(this.result()).then(resolve)
    }

    private getRows() {
      let rows = [...(db[this.table] || [])].filter((row) => this.filters.every((filter) => filter(row)))

      if (this.sortColumn) {
        rows.sort((a, b) => {
          const left = a[this.sortColumn as string]
          const right = b[this.sortColumn as string]

          if (left === right) return 0
          if (left == null) return this.sortAscending ? 1 : -1
          if (right == null) return this.sortAscending ? -1 : 1
          if (left < right) return this.sortAscending ? -1 : 1
          return this.sortAscending ? 1 : -1
        })
      }

      if (this.maxRows !== null) {
        rows = rows.slice(0, this.maxRows)
      }

      return rows
    }

    private result() {
      if (this.pendingInsert) {
        return {
          data: this.returnSingle ? this.pendingInsert[0] ?? null : this.pendingInsert,
          error: null,
        }
      }

      const rows = this.getRows()

      if (this.pendingDelete) {
        db[this.table] = (db[this.table] || []).filter(
          (row) => !this.filters.every((filter) => filter(row))
        )
        return { data: this.returnSingle ? rows[0] ?? null : rows, error: null }
      }

      if (this.pendingUpdate) {
        const matchedRows = this.getRows()
        const sourceRows = db[this.table] || []
        sourceRows.forEach((row) => {
          if (this.filters.every((filter) => filter(row))) {
            Object.assign(row, this.pendingUpdate)
          }
        })

        return {
          data: this.returnSingle
            ? (matchedRows[0] ? { ...matchedRows[0], ...this.pendingUpdate } : null)
            : matchedRows.map((row) => ({ ...row, ...this.pendingUpdate })),
          error: null,
          count: this.countExact ? matchedRows.length : undefined,
        }
      }

      return {
        data: this.returnSingle ? rows[0] ?? null : rows,
        error: null,
      }
    }
  }

  return {
    from(table: string) {
      return new QueryBuilder(table)
    },
    storage: {
      from() {
        return {
          upload: async () => ({ data: null, error: null }),
          remove: async () => ({ data: null, error: null }),
        }
      },
    },
    _db: db,
  }
}

describe('subscription pack signer payloads', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(createClient).mockResolvedValue({} as any)
    vi.mocked(requireStaffAuth).mockResolvedValue({
      id: 'staff-user-1',
      email: 'ops@verso.test',
      displayName: 'Ops User',
      role: 'staff_ops',
      title: 'Operations',
    } as any)
    vi.mocked(getExistingFormalSubscriptionForCycle).mockResolvedValue(null)
    vi.mocked(updateDealInvestmentCycleProgress).mockResolvedValue(null as any)
    vi.mocked(resolveSubscriptionSigners).mockResolvedValue({
      issues: [],
      signers: [
        {
          full_name: 'Ashish Damankar',
          role_title: 'Director',
          is_primary: true,
        },
      ],
    } as any)
    vi.mocked(resolveVehicleActiveBankAccount).mockResolvedValue({
      hasExactlyOneActiveAccount: true,
      hasNoActiveAccount: false,
      hasMultipleActiveAccounts: false,
      activeAccount: { id: 'bank-account-1' },
      activeAccounts: [{ id: 'bank-account-1' }],
      draftAccounts: [],
      accounts: [{ id: 'bank-account-1' }],
    } as any)
    vi.mocked(toVehicleBankAccountPayload).mockReturnValue({
      wire_reference_display: 'Agency VERSO Capital 2 SCSP Series 600',
    } as any)
    vi.mocked(getCeoSigner).mockResolvedValue({
      displayName: 'Julien Machot',
      title: 'CEO',
    } as any)
    vi.mocked(getArrangerSigner).mockResolvedValue({
      displayName: 'Fred Demargne',
      title: 'Managing Partner',
    } as any)
    vi.mocked(buildSubscriptionPackPayload).mockReturnValue({
      payload: { ok: true },
      computed: {
        amount: 100000,
        numShares: 10000,
        pricePerShare: 10,
      },
    } as any)
    vi.mocked(triggerWorkflow).mockResolvedValue({
      success: true,
      workflow_run_id: 'wf-1',
      n8n_response: {
        data: Buffer.from('PK\u0003\u0004test-docx', 'latin1').toString('base64'),
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        filename: 'subscription-pack.docx',
      },
    } as any)
  })

  it('uses the live arranger signer name and title instead of stale fee-plan defaults', async () => {
    const supabase = createMockSupabase({
      approvals: [
        {
          id: 'approval-1',
          entity_id: 'submission-1',
          entity_type: 'deal_subscription',
          status: 'pending',
          created_at: '2026-04-02T10:00:00.000Z',
          requested_by: null,
        },
      ],
      deal_subscription_submissions: [
        {
          id: 'submission-1',
          status: 'pending_review',
          deal_id: 'deal-1',
          investor_id: 'investor-1',
          cycle_id: 'cycle-1',
          term_sheet_id: 'term-1',
          formal_subscription_id: 'subscription-1',
          submitted_at: '2026-04-02T09:00:00.000Z',
          subscription_type: 'individual',
          payload_json: { amount: 100000, currency: 'USD' },
          deal: {
            id: 'deal-1',
            name: 'Test Deal',
            vehicle_id: 'vehicle-1',
            currency: 'USD',
            company_name: 'Portfolio Co',
            company_logo_url: null,
            vehicle: {
              entity_code: 'VC2',
              investment_name: 'Fund I',
              name: 'VERSO Capital 2 SCSP Series 600',
            },
          },
          investor: {
            display_name: 'Verso Investor',
            legal_name: 'Verso Investor',
          },
        },
      ],
      deal_investment_cycles: [
        {
          id: 'cycle-1',
          term_sheet_id: 'term-1',
          assigned_fee_plan_id: 'fee-plan-1',
          status: 'pending',
        },
      ],
      fee_plans: [
        {
          id: 'fee-plan-1',
          deal_id: 'deal-1',
          is_default: true,
          is_active: true,
        },
      ],
      deal_fee_structures: [
        {
          id: 'term-1',
          subscription_fee_percent: 0.02,
          management_fee_percent: 0.01,
          carried_interest_percent: 0.2,
          price_per_share: 10,
          price_per_share_text: '10',
          cost_per_share: 8,
          payment_deadline_days: 5,
          issuer_signatory_name: 'Legacy Issuer',
          issuer_signatory_title: 'Legacy CEO',
          arranger_person_name: 'Legacy Arranger',
          arranger_person_title: 'Director',
        },
      ],
      valuations: [],
      fee_components: [],
      introductions: [],
      subscriptions: [
        {
          id: 'subscription-1',
          commitment: 100000,
          currency: 'USD',
          price_per_share: 10,
          num_shares: 10000,
          subscription_fee_percent: 0.02,
          subscription_fee_amount: 2000,
          pack_generated_at: null,
          status: 'pending',
        },
      ],
      investors: [
        {
          id: 'investor-1',
          type: 'entity',
          display_name: 'Verso Investor',
          legal_name: 'Verso Investor',
          email: 'ops@investor.test',
          registered_address: '1 Test Street',
          registered_country: 'LU',
          country_of_incorporation: 'LU',
        },
      ],
      vehicles: [
        {
          id: 'vehicle-1',
          series_number: '600',
          name: 'VERSO Capital 2 SCSP Series 600',
          series_short_title: 'VC2',
          investment_name: 'Fund I',
          currency: 'USD',
          issuer_gp_name: 'VERSO GP',
          issuer_gp_rcc_number: 'RCS-GP',
          issuer_rcc_number: 'RCS-ISSUER',
          issuer_website: 'https://verso.test',
        },
      ],
      deals: [
        {
          id: 'deal-1',
          arranger_entity_id: 'arranger-1',
        },
      ],
      workflow_runs: [
        {
          id: 'wf-1',
          status: 'running',
        },
      ],
      document_folders: [],
      documents: [],
      ceo_users: [],
      investor_notifications: [],
    })

    vi.mocked(createServiceClient).mockReturnValue(supabase as any)

    const { POST } = await import('@/app/api/approvals/[id]/action/route')
    const response = await POST(
      createRequest({ action: 'approve' }),
      { params: Promise.resolve({ id: 'approval-1' }) }
    )

    expect(response.status).toBe(200)
    expect(buildSubscriptionPackPayload).toHaveBeenCalledWith(expect.objectContaining({
      arrangerName: 'Fred Demargne',
      arrangerTitle: 'Managing Partner',
      issuerName: 'Julien Machot',
      issuerTitle: 'CEO',
    }))
    expect(buildSubscriptionPackPayload).toHaveBeenCalledWith(expect.objectContaining({
      vehicleBankAccount: expect.objectContaining({
        wire_reference_display: 'Agency VERSO Capital 2 SCSP Series 600',
      }),
    }))
  })
})
