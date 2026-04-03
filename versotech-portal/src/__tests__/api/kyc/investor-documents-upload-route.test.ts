import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/kyc/active-investor-link', () => ({
  resolveActiveInvestorLinkFromCookies: vi.fn(),
}))

vi.mock('@/lib/kyc/member-linking', () => ({
  fetchMemberWithAutoLink: vi.fn(),
}))

vi.mock('@/lib/kyc/check-entity-kyc-status', () => ({
  checkAndUpdateEntityKYCStatus: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveActiveInvestorLinkFromCookies } from '@/lib/kyc/active-investor-link'
import { checkAndUpdateEntityKYCStatus } from '@/lib/kyc/check-entity-kyc-status'
import { POST } from '@/app/api/investors/me/documents/upload/route'

import { createMockSupabase, createMultipartNextRequest } from './route-test-helpers'

function createAuthSupabase() {
  const supabase = createMockSupabase({
    profiles: [
      {
        id: 'user-1',
        display_name: 'Investor One',
        email: 'investor@example.com',
      },
    ],
  })

  return {
    ...supabase,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'investor@example.com',
          },
        },
        error: null,
      }),
    },
  }
}

function createInvestorUploadRequest(params: {
  documentType: string
  isUpdate?: boolean
  fileName?: string
  fileType?: string
  documentExpiryDate?: string
  documentDate?: string
  investorMemberId?: string
}) {
  const formData = new FormData()
  formData.append(
    'file',
    new File(['kyc-bytes'], params.fileName || 'document.pdf', {
      type: params.fileType || 'application/pdf',
    })
  )
  formData.append('documentType', params.documentType)
  if (params.isUpdate) formData.append('isUpdate', 'true')
  if (params.documentExpiryDate) formData.append('documentExpiryDate', params.documentExpiryDate)
  if (params.documentDate) formData.append('documentDate', params.documentDate)
  if (params.investorMemberId) formData.append('investorMemberId', params.investorMemberId)

  return createMultipartNextRequest(
    'http://localhost:3000/api/investors/me/documents/upload',
    formData
  )
}

describe('POST /api/investors/me/documents/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(resolveActiveInvestorLinkFromCookies).mockResolvedValue({
      link: { investor_id: 'investor-1' },
    } as any)
  })

  it('blocks duplicate uploads for grouped ID requirements unless update is explicit', async () => {
    const authSupabase = createAuthSupabase()
    const serviceSupabase = createMockSupabase({
      kyc_submissions: [
        {
          id: 'submission-existing',
          investor_id: 'investor-1',
          investor_member_id: null,
          counterparty_entity_id: null,
          document_type: 'passport',
          version: 1,
        },
      ],
      documents: [],
      audit_logs: [],
      tasks: [],
      investor_members: [],
      investor_counterparty: [],
      counterparty_entity_members: [],
    })

    vi.mocked(createClient).mockResolvedValue(authSupabase as any)
    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)

    const response = await POST(
      createInvestorUploadRequest({
        documentType: 'drivers_license',
        documentExpiryDate: '2030-01-01',
      })
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      error: 'This document requirement is already uploaded. Use Update to replace it.',
    })
    expect(serviceSupabase._uploads).toHaveLength(0)
    expect(vi.mocked(checkAndUpdateEntityKYCStatus)).not.toHaveBeenCalled()
  })

  it('creates the next version when an existing grouped ID document is explicitly updated', async () => {
    const authSupabase = createAuthSupabase()
    const serviceSupabase = createMockSupabase({
      kyc_submissions: [
        {
          id: 'submission-existing',
          investor_id: 'investor-1',
          investor_member_id: null,
          counterparty_entity_id: null,
          document_type: 'passport',
          version: 2,
        },
      ],
      documents: [],
      audit_logs: [],
      tasks: [],
      investor_members: [],
      investor_counterparty: [],
      counterparty_entity_members: [],
    })

    vi.mocked(createClient).mockResolvedValue(authSupabase as any)
    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)

    const response = await POST(
      createInvestorUploadRequest({
        documentType: 'national_id',
        isUpdate: true,
        fileName: 'national-id.png',
        fileType: 'image/png',
        documentExpiryDate: '2031-06-01',
      })
    )

    expect(response.status).toBe(200)

    const insertedSubmission = serviceSupabase._db.kyc_submissions.find(
      (row) => row.id !== 'submission-existing'
    )
    expect(insertedSubmission).toMatchObject({
      document_type: 'national_id',
      version: 3,
      previous_submission_id: 'submission-existing',
      status: 'pending',
      investor_id: 'investor-1',
    })

    const insertedDocument = serviceSupabase._db.documents[0]
    expect(insertedDocument).toMatchObject({
      name: 'national-id.png',
      mime_type: 'image/png',
      owner_investor_id: 'investor-1',
    })
    expect(serviceSupabase._uploads).toHaveLength(1)
    expect(vi.mocked(checkAndUpdateEntityKYCStatus)).toHaveBeenCalledWith(
      serviceSupabase,
      'investor',
      'investor-1'
    )
  })

  it('validates required metadata for ID documents before any upload work starts', async () => {
    const authSupabase = createAuthSupabase()
    const serviceSupabase = createMockSupabase({
      kyc_submissions: [],
      documents: [],
      audit_logs: [],
      tasks: [],
      investor_members: [],
      investor_counterparty: [],
      counterparty_entity_members: [],
    })

    vi.mocked(createClient).mockResolvedValue(authSupabase as any)
    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)

    const response = await POST(
      createInvestorUploadRequest({
        documentType: 'passport',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Expiry date is required for ID documents',
    })
    expect(serviceSupabase._uploads).toHaveLength(0)
    expect(serviceSupabase._db.documents).toHaveLength(0)
  })
})
