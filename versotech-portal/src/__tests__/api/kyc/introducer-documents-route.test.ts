import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/kyc/active-introducer-link', () => ({
  resolveActiveIntroducerLinkFromCookies: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveActiveIntroducerLinkFromCookies } from '@/lib/kyc/active-introducer-link'
import { POST } from '@/app/api/introducers/me/documents/route'

import { createMockSupabase, createMultipartNextRequest } from './route-test-helpers'

function createAuthSupabase() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'introducer@example.com',
          },
        },
        error: null,
      }),
    },
  }
}

function createIntroducerServiceSupabase() {
  return createMockSupabase({
    profiles: [
      {
        id: 'user-1',
        display_name: 'Introducer One',
        email: 'introducer@example.com',
      },
    ],
    introducer_members: [
      {
        id: 'member-1',
        introducer_id: 'introducer-1',
        is_active: true,
      },
    ],
    kyc_submissions: [],
    documents: [],
    audit_logs: [],
  })
}

function createIntroducerUploadRequest(params: {
  documentType: string
  isUpdate?: boolean
  introducerMemberId?: string
  documentDate?: string
  documentExpiryDate?: string
}) {
  const formData = new FormData()
  formData.append(
    'file',
    new File(['kyc-bytes'], 'document.pdf', {
      type: 'application/pdf',
    })
  )
  formData.append('type', params.documentType)
  formData.append('name', 'document')
  if (params.isUpdate) formData.append('isUpdate', 'true')
  if (params.introducerMemberId) formData.append('introducer_member_id', params.introducerMemberId)
  if (params.documentDate) formData.append('documentDate', params.documentDate)
  if (params.documentExpiryDate) formData.append('documentExpiryDate', params.documentExpiryDate)

  return createMultipartNextRequest(
    'http://localhost:3000/api/introducers/me/documents',
    formData
  )
}

describe('POST /api/introducers/me/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(resolveActiveIntroducerLinkFromCookies).mockResolvedValue({
      link: { introducer_id: 'introducer-1' },
    } as any)
    vi.mocked(createClient).mockResolvedValue(createAuthSupabase() as any)
  })

  it('blocks duplicate uploads for grouped proof-of-address requirements unless update is explicit', async () => {
    const serviceSupabase = createIntroducerServiceSupabase()
    serviceSupabase._db.kyc_submissions.push({
      id: 'submission-existing',
      introducer_id: 'introducer-1',
      introducer_member_id: 'member-1',
      document_type: 'government_correspondence',
      version: 1,
    })

    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)

    const response = await POST(
      createIntroducerUploadRequest({
        documentType: 'utility_bill',
        introducerMemberId: 'member-1',
        documentDate: '2026-03-15',
      })
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      error: 'This document requirement is already uploaded. Use Update to replace it.',
    })
    expect(serviceSupabase._uploads).toHaveLength(0)
  })

  it('creates the next version when a grouped proof-of-address document is explicitly updated', async () => {
    const serviceSupabase = createIntroducerServiceSupabase()
    serviceSupabase._db.kyc_submissions.push({
      id: 'submission-existing',
      introducer_id: 'introducer-1',
      introducer_member_id: 'member-1',
      document_type: 'government_correspondence',
      version: 3,
    })

    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)

    const response = await POST(
      createIntroducerUploadRequest({
        documentType: 'bank_statement',
        introducerMemberId: 'member-1',
        documentDate: '2026-03-20',
        isUpdate: true,
      })
    )

    expect(response.status).toBe(200)

    const insertedSubmission = serviceSupabase._db.kyc_submissions.find(
      (row) => row.id !== 'submission-existing'
    )
    expect(insertedSubmission).toMatchObject({
      introducer_id: 'introducer-1',
      introducer_member_id: 'member-1',
      document_type: 'bank_statement',
      version: 4,
      previous_submission_id: 'submission-existing',
      status: 'pending',
    })

    expect(serviceSupabase._db.documents[0]).toMatchObject({
      introducer_id: 'introducer-1',
      introducer_member_id: 'member-1',
      type: 'bank_statement',
    })
    expect(serviceSupabase._uploads).toHaveLength(1)
  })

  it('validates required metadata for proof-of-address documents before upload', async () => {
    const serviceSupabase = createIntroducerServiceSupabase()
    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)

    const response = await POST(
      createIntroducerUploadRequest({
        documentType: 'utility_bill',
        introducerMemberId: 'member-1',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Document date is required for proof of address documents',
    })
    expect(serviceSupabase._uploads).toHaveLength(0)
    expect(serviceSupabase._db.documents).toHaveLength(0)
  })
})
