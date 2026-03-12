import { describe, expect, it, vi } from 'vitest'
import {
  maybeReleaseDeferredInvestorRequests,
  shouldDelayFinalSignatureCompletion,
} from '@/lib/signature/staged-release'
import type { SignatureRequestRecord } from '@/lib/signature/types'

type TableRow = Record<string, any>
type TableData = Record<string, TableRow[]>
type Filter =
  | { kind: 'eq'; column: string; value: unknown }
  | { kind: 'in'; column: string; value: unknown[] }
  | { kind: 'not'; column: string; operator: string; value: unknown }

function applyFilters(rows: TableRow[], filters: Filter[]): TableRow[] {
  return rows.filter((row) =>
    filters.every((filter) => {
      if (filter.kind === 'eq') {
        return row[filter.column] === filter.value
      }

      if (filter.kind === 'in') {
        return filter.value.includes(row[filter.column])
      }

      if (filter.kind === 'not' && filter.operator === 'is') {
        return row[filter.column] !== filter.value
      }

      throw new Error(`Unsupported filter: ${JSON.stringify(filter)}`)
    })
  )
}

function createSupabaseMock(
  initialData: TableData,
  options?: { signedUrlResult?: { data: { signedUrl: string } | null; error: unknown } }
) {
  const tables: TableData = Object.fromEntries(
    Object.entries(initialData).map(([tableName, rows]) => [tableName, rows.map((row) => ({ ...row }))])
  )

  const signedUrlSpy = vi.fn(async (path: string) => {
    if (options?.signedUrlResult) {
      return options.signedUrlResult
    }

    return {
      data: { signedUrl: `https://signed.local/${path}` },
      error: null,
    }
  })

  function createQuery(tableName: string) {
    const state: {
      action: 'select' | 'update'
      filters: Filter[]
      updatePayload?: Record<string, unknown>
      singleMode: 'many' | 'single' | 'maybeSingle'
      limitCount?: number
    } = {
      action: 'select',
      filters: [],
      singleMode: 'many',
    }

    const execute = async () => {
      const rows = tables[tableName] || []

      if (state.action === 'update') {
        const matchingRows = applyFilters(rows, state.filters)
        matchingRows.forEach((row) => Object.assign(row, state.updatePayload || {}))

        if (state.singleMode === 'single') {
          return { data: matchingRows[0] || null, error: null }
        }

        if (state.singleMode === 'maybeSingle') {
          return { data: matchingRows[0] || null, error: null }
        }

        return { data: matchingRows, error: null }
      }

      let filteredRows = applyFilters(rows, state.filters)

      if (typeof state.limitCount === 'number') {
        filteredRows = filteredRows.slice(0, state.limitCount)
      }

      if (state.singleMode === 'single') {
        return { data: filteredRows[0] || null, error: null }
      }

      if (state.singleMode === 'maybeSingle') {
        return { data: filteredRows[0] || null, error: null }
      }

      return { data: filteredRows, error: null }
    }

    const query = {
      select: () => query,
      update: (payload: Record<string, unknown>) => {
        state.action = 'update'
        state.updatePayload = payload
        return query
      },
      eq: (column: string, value: unknown) => {
        state.filters.push({ kind: 'eq', column, value })
        return query
      },
      in: (column: string, value: unknown[]) => {
        state.filters.push({ kind: 'in', column, value })
        return query
      },
      not: (column: string, operator: string, value: unknown) => {
        state.filters.push({ kind: 'not', column, operator, value })
        return query
      },
      order: () => query,
      limit: (count: number) => {
        state.limitCount = count
        return query
      },
      maybeSingle: async () => {
        state.singleMode = 'maybeSingle'
        return execute()
      },
      single: async () => {
        state.singleMode = 'single'
        return execute()
      },
      then: (onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) =>
        execute().then(onFulfilled, onRejected),
    }

    return query
  }

  return {
    tables,
    supabase: {
      from: (tableName: string) => createQuery(tableName),
      storage: {
        from: () => ({
          createSignedUrl: signedUrlSpy,
        }),
      },
    },
    signedUrlSpy,
  }
}

function buildSignatureRequest(overrides: Partial<SignatureRequestRecord>): SignatureRequestRecord {
  return {
    id: 'sig-1',
    investor_id: 'inv-1',
    signer_email: 'signer@example.com',
    signer_name: 'Signer',
    document_type: 'subscription',
    signing_token: 'token',
    token_expires_at: '2099-01-01T00:00:00.000Z',
    status: 'signed',
    signer_role: 'admin',
    signature_position: 'party_b',
    created_at: '2026-03-10T00:00:00.000Z',
    updated_at: '2026-03-10T00:00:00.000Z',
    ...overrides,
  }
}

describe('staged-release', () => {
  it('does not release subscription investor requests until both internal signers are signed', async () => {
    const { supabase } = createSupabaseMock({
      documents: [
        {
          id: 'doc-1',
          file_key: 'subscriptions/doc-1.pdf',
          deal_id: 'deal-1',
          subscription_id: 'sub-1',
          signature_workflow_config: {
            mode: 'internal_first',
            internal_roles: ['admin', 'arranger'],
            investor_signers: [
              {
                member_id: 'member-1',
                signer_name: 'Investor Signer',
                signer_email: 'investor@example.com',
                signature_position: 'party_a',
              },
            ],
            investor_requests_released_at: null,
          },
        },
      ],
      signature_requests: [
        {
          id: 'sig-admin',
          document_id: 'doc-1',
          status: 'signed',
          signer_role: 'admin',
          signature_position: 'party_b',
          signed_pdf_path: 'signed/admin.pdf',
        },
        {
          id: 'sig-arranger',
          document_id: 'doc-1',
          status: 'pending',
          signer_role: 'arranger',
          signature_position: 'party_c',
          signed_pdf_path: null,
        },
      ],
    })

    const createSignatureRequest = vi.fn(async () => ({ success: true, signature_request_id: 'new-investor-sig' }))

    await maybeReleaseDeferredInvestorRequests(
      buildSignatureRequest({
        document_type: 'subscription',
        signer_role: 'admin',
        document_id: 'doc-1',
        subscription_id: 'sub-1',
        deal_id: 'deal-1',
      }),
      supabase as any,
      createSignatureRequest
    )

    expect(createSignatureRequest).not.toHaveBeenCalled()
  })

  it('releases staged subscription investor requests once admin and arranger have both signed', async () => {
    const { supabase, tables, signedUrlSpy } = createSupabaseMock({
      documents: [
        {
          id: 'doc-1',
          file_key: 'subscriptions/doc-1.pdf',
          deal_id: 'deal-1',
          subscription_id: 'sub-1',
          signature_workflow_config: {
            mode: 'internal_first',
            internal_roles: ['admin', 'arranger'],
            investor_signers: [
              {
                member_id: 'member-1',
                signer_name: 'Investor Signer',
                signer_email: 'investor@example.com',
                signature_position: 'party_a',
              },
            ],
            investor_requests_released_at: null,
          },
        },
      ],
      signature_requests: [
        {
          id: 'sig-admin',
          document_id: 'doc-1',
          status: 'signed',
          signer_role: 'admin',
          signature_position: 'party_b',
          signed_pdf_path: 'signed/admin.pdf',
        },
        {
          id: 'sig-arranger',
          document_id: 'doc-1',
          status: 'signed',
          signer_role: 'arranger',
          signature_position: 'party_c',
          signed_pdf_path: 'signed/arranger.pdf',
        },
      ],
    })

    const createSignatureRequest = vi.fn(async () => ({ success: true, signature_request_id: 'new-investor-sig' }))

    await maybeReleaseDeferredInvestorRequests(
      buildSignatureRequest({
        document_type: 'subscription',
        signer_role: 'arranger',
        document_id: 'doc-1',
        subscription_id: 'sub-1',
        deal_id: 'deal-1',
        signed_pdf_path: 'signed/arranger.pdf',
      }),
      supabase as any,
      createSignatureRequest
    )

    expect(createSignatureRequest).toHaveBeenCalledTimes(1)
    expect(createSignatureRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        document_type: 'subscription',
        signer_role: 'investor',
        signer_email: 'investor@example.com',
        signature_position: 'party_a',
        total_party_a_signatories: 1,
      }),
      supabase
    )
    expect(signedUrlSpy).toHaveBeenCalledWith('signed/admin.pdf', 604800)
    expect(
      tables.documents[0].signature_workflow_config.investor_requests_released_at
    ).toEqual(expect.any(String))
  })

  it('releases the staged NDA investor request after the admin signature completes', async () => {
    const { supabase, tables } = createSupabaseMock({
      workflow_runs: [
        {
          id: 'wf-1',
          input_params: {
            signature_release_config: {
              mode: 'internal_first',
              investor_signer: {
                member_id: 'member-1',
                signer_name: 'NDA Investor',
                signer_email: 'nda-investor@example.com',
                signature_position: 'party_a',
              },
              investor_requests_released_at: null,
            },
          },
        },
      ],
      signature_requests: [
        {
          id: 'sig-admin',
          workflow_run_id: 'wf-1',
          status: 'signed',
          signer_role: 'admin',
          signature_position: 'party_b',
        },
      ],
    })

    const createSignatureRequest = vi.fn(async () => ({ success: true, signature_request_id: 'nda-investor-sig' }))

    await maybeReleaseDeferredInvestorRequests(
      buildSignatureRequest({
        id: 'sig-admin',
        document_type: 'nda',
        workflow_run_id: 'wf-1',
        signer_role: 'admin',
        deal_id: 'deal-1',
        google_drive_url: 'https://nda-source.local/file.pdf',
        signature_position: 'party_b',
      }),
      supabase as any,
      createSignatureRequest
    )

    expect(createSignatureRequest).toHaveBeenCalledTimes(1)
    expect(createSignatureRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        workflow_run_id: 'wf-1',
        document_type: 'nda',
        signer_role: 'investor',
        signer_email: 'nda-investor@example.com',
        signature_position: 'party_a',
      }),
      supabase
    )
    expect(
      tables.workflow_runs[0].input_params.signature_release_config.investor_requests_released_at
    ).toEqual(expect.any(String))
  })

  it('delays final completion while staged investor signatures have not yet been released', async () => {
    const { supabase } = createSupabaseMock({
      documents: [
        {
          id: 'doc-1',
          signature_workflow_config: {
            mode: 'internal_first',
            internal_roles: ['admin', 'arranger'],
            investor_signers: [
              {
                signer_name: 'Investor Signer',
                signer_email: 'investor@example.com',
                signature_position: 'party_a',
              },
            ],
            investor_requests_released_at: null,
          },
        },
      ],
    })

    const shouldDelay = await shouldDelayFinalSignatureCompletion(
      buildSignatureRequest({
        document_type: 'subscription',
        document_id: 'doc-1',
        signer_role: 'arranger',
      }),
      [
        { signer_role: 'admin', signature_position: 'party_b' },
        { signer_role: 'arranger', signature_position: 'party_c' },
      ],
      supabase as any
    )

    expect(shouldDelay).toBe(true)
  })

  it('does not fall back to the unsigned NDA source when the signed copy cannot be loaded', async () => {
    const { supabase } = createSupabaseMock(
      {
        workflow_runs: [
          {
            id: 'wf-1',
            input_params: {
              signature_release_config: {
                mode: 'internal_first',
                investor_signer: {
                  member_id: 'member-1',
                  signer_name: 'NDA Investor',
                  signer_email: 'nda-investor@example.com',
                  signature_position: 'party_a',
                },
                investor_requests_released_at: null,
              },
            },
          },
        ],
        signature_requests: [
          {
            id: 'sig-admin',
            workflow_run_id: 'wf-1',
            status: 'signed',
            signer_role: 'admin',
            signature_position: 'party_b',
            signed_pdf_path: 'signed/admin.pdf',
            google_drive_url: 'https://unsigned-source.local/nda.pdf',
          },
        ],
      },
      {
        signedUrlResult: {
          data: null,
          error: new Error('signed url failed'),
        },
      }
    )

    const createSignatureRequest = vi.fn(async () => ({ success: true, signature_request_id: 'nda-investor-sig' }))

    await expect(
      maybeReleaseDeferredInvestorRequests(
        buildSignatureRequest({
          id: 'sig-admin',
          document_type: 'nda',
          workflow_run_id: 'wf-1',
          signer_role: 'admin',
          deal_id: 'deal-1',
          signed_pdf_path: 'signed/admin.pdf',
          google_drive_url: 'https://unsigned-source.local/nda.pdf',
          signature_position: 'party_b',
        }),
        supabase as any,
        createSignatureRequest
      )
    ).rejects.toThrow('Failed to resolve an NDA document URL for staged investor release')

    expect(createSignatureRequest).not.toHaveBeenCalled()
  })

  it('does not fall back to the unsigned subscription source when the signed copy cannot be loaded', async () => {
    const { supabase } = createSupabaseMock(
      {
        documents: [
          {
            id: 'doc-1',
            file_key: 'subscriptions/original.pdf',
            deal_id: 'deal-1',
            subscription_id: 'sub-1',
            signature_workflow_config: {
              mode: 'internal_first',
              internal_roles: ['admin', 'arranger'],
              investor_signers: [
                {
                  member_id: 'member-1',
                  signer_name: 'Investor Signer',
                  signer_email: 'investor@example.com',
                  signature_position: 'party_a',
                },
              ],
              investor_requests_released_at: null,
            },
          },
        ],
        signature_requests: [
          {
            id: 'sig-admin',
            document_id: 'doc-1',
            status: 'signed',
            signer_role: 'admin',
            signature_position: 'party_b',
            signed_pdf_path: 'signed/admin.pdf',
          },
          {
            id: 'sig-arranger',
            document_id: 'doc-1',
            status: 'signed',
            signer_role: 'arranger',
            signature_position: 'party_c',
            signed_pdf_path: 'signed/arranger.pdf',
          },
        ],
      },
      {
        signedUrlResult: {
          data: null,
          error: new Error('signed url failed'),
        },
      }
    )

    const createSignatureRequest = vi.fn(async () => ({ success: true, signature_request_id: 'new-investor-sig' }))

    await expect(
      maybeReleaseDeferredInvestorRequests(
        buildSignatureRequest({
          document_type: 'subscription',
          signer_role: 'arranger',
          document_id: 'doc-1',
          subscription_id: 'sub-1',
          deal_id: 'deal-1',
          signed_pdf_path: 'signed/arranger.pdf',
        }),
        supabase as any,
        createSignatureRequest
      )
    ).rejects.toThrow('Failed to resolve a signed subscription document URL for staged investor release')

    expect(createSignatureRequest).not.toHaveBeenCalled()
  })
})
