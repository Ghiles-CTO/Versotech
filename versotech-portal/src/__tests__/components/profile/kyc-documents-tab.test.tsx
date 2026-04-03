// @vitest-environment happy-dom
import React from 'react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import { KYCDocumentsTab } from '@/components/profile/kyc-documents-tab'

const {
  toastSuccess,
  toastError,
  openPreview,
  closePreview,
  downloadDocument,
} = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  openPreview: vi.fn(),
  closePreview: vi.fn(),
  downloadDocument: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}))

vi.mock('@/hooks/useDocumentViewer', () => ({
  useDocumentViewer: () => ({
    isOpen: false,
    document: null,
    previewUrl: null,
    isLoading: false,
    error: null,
    openPreview,
    closePreview,
    downloadDocument,
    watermark: null,
  }),
}))

vi.mock('@/components/documents/DocumentViewerFullscreen', () => ({
  DocumentViewerFullscreen: () => null,
}))

vi.mock('@/components/profile/document-metadata-dialog', () => ({
  DocumentMetadataDialog: () => null,
}))

type InvestorKycPayload = {
  submissions: Array<Record<string, unknown>>
  investor_members: Array<Record<string, unknown>>
  is_entity_investor: boolean
}

function makeInvestorPayload(
  overrides: Partial<InvestorKycPayload> = {}
): InvestorKycPayload {
  return {
    submissions: [],
    investor_members: [
      { id: 'member-1', full_name: 'Alice Director', role: 'director' },
    ],
    is_entity_investor: true,
    ...overrides,
  }
}

function makeEntitySubmissionsWithoutBankConfirmation() {
  return [
    {
      id: 'sub-inc',
      document_type: 'incorporation_certificate',
      status: 'approved',
      version: 1,
      created_at: '2026-04-01T08:00:00.000Z',
      submitted_at: '2026-04-01T08:00:00.000Z',
    },
    {
      id: 'sub-memo',
      document_type: 'memo_articles',
      status: 'approved',
      version: 1,
      created_at: '2026-04-01T08:05:00.000Z',
      submitted_at: '2026-04-01T08:05:00.000Z',
    },
    {
      id: 'sub-directors',
      document_type: 'register_directors',
      status: 'approved',
      version: 1,
      created_at: '2026-04-01T08:10:00.000Z',
      submitted_at: '2026-04-01T08:10:00.000Z',
    },
    {
      id: 'sub-members',
      document_type: 'register_members',
      status: 'approved',
      version: 1,
      created_at: '2026-04-01T08:15:00.000Z',
      submitted_at: '2026-04-01T08:15:00.000Z',
    },
    {
      id: 'sub-ubo',
      document_type: 'register_beneficial_owners',
      status: 'approved',
      version: 1,
      created_at: '2026-04-01T08:20:00.000Z',
      submitted_at: '2026-04-01T08:20:00.000Z',
    },
    {
      id: 'sub-passport',
      document_type: 'passport',
      status: 'approved',
      version: 1,
      created_at: '2026-04-01T08:25:00.000Z',
      submitted_at: '2026-04-01T08:25:00.000Z',
      investor_member: {
        id: 'member-1',
        full_name: 'Alice Director',
        role: 'director',
      },
    },
    {
      id: 'sub-address',
      document_type: 'utility_bill',
      status: 'approved',
      version: 1,
      created_at: '2026-04-01T08:30:00.000Z',
      submitted_at: '2026-04-01T08:30:00.000Z',
      investor_member: {
        id: 'member-1',
        full_name: 'Alice Director',
        role: 'director',
      },
    },
  ]
}

describe('KYCDocumentsTab', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('renders the dynamic checklist view with entity/member rows and without the file name column', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        makeInvestorPayload({
          submissions: [
            {
              id: 'sub-1',
              document_type: 'register_directors',
              status: 'rejected',
              version: 2,
              created_at: '2026-04-02T08:00:00.000Z',
              submitted_at: '2026-04-02T08:00:00.000Z',
              rejection_reason: 'Please upload the latest signed register.',
            },
            {
              id: 'sub-2',
              document_type: 'passport',
              status: 'under_review',
              version: 1,
              created_at: '2026-04-01T08:00:00.000Z',
              submitted_at: '2026-04-01T08:00:00.000Z',
              expiry_date: '2030-06-01',
              investor_member: {
                id: 'member-1',
                full_name: 'Alice Director',
                role: 'director',
              },
            },
          ],
        }),
    })

    global.fetch = fetchMock as typeof fetch

    render(<KYCDocumentsTab />)

    expect(await screen.findByText('Register of Directors')).toBeInTheDocument()
    expect(screen.getByText('Proof of Identification')).toBeInTheDocument()
    expect(screen.getAllByText('Alice Director').length).toBeGreaterThan(0)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText('Pending Review')).toBeInTheDocument()
    expect(screen.getAllByText('Awaiting upload').length).toBeGreaterThan(0)
    expect(screen.queryByText(/file name/i)).not.toBeInTheDocument()
  })

  it('uploads a missing checklist row inline and reloads it as already uploaded', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeInvestorPayload({
            submissions: [],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          status: 'pending',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeInvestorPayload({
            submissions: [
              {
                id: 'sub-bank',
                document_type: 'bank_confirmation',
                status: 'pending',
                version: 1,
                created_at: '2026-04-03T08:00:00.000Z',
                submitted_at: '2026-04-03T08:00:00.000Z',
              },
            ],
          }),
      })

    global.fetch = fetchMock as typeof fetch

    const { container } = render(<KYCDocumentsTab />)

    expect(await screen.findByText('Bank Confirmation Letter')).toBeInTheDocument()

    const bankRow = screen.getByText('Bank Confirmation Letter').closest('tr')
    expect(bankRow).not.toBeNull()

    const input = bankRow?.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeTruthy()

    const file = new File(['bank-pdf'], 'bank-confirmation.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/investors/me/documents/upload')
    const uploadOptions = fetchMock.mock.calls[1]?.[1] as RequestInit
    const uploadBody = uploadOptions.body as FormData
    expect(uploadBody.get('documentType')).toBe('bank_confirmation')
    expect(uploadBody.get('isUpdate')).toBe('false')

    const updatedRow = screen.getByText('Bank Confirmation Letter').closest('tr')
    expect(updatedRow).not.toBeNull()
    expect(within(updatedRow as HTMLTableRowElement).getByText(/Already uploaded/i)).toBeInTheDocument()
    expect(within(updatedRow as HTMLTableRowElement).getByText(/Version 1/i)).toBeInTheDocument()

    expect(container.querySelectorAll('input[type="file"]').length).toBeGreaterThan(0)
  })

  it('uses explicit update for a rejected document row and refreshes the latest status/version', async () => {
    const rejectedPayload = makeInvestorPayload({
      submissions: [
        {
          id: 'sub-old',
          document_type: 'register_directors',
          status: 'rejected',
          version: 2,
          created_at: '2026-04-02T08:00:00.000Z',
          submitted_at: '2026-04-02T08:00:00.000Z',
          rejection_reason: 'Please provide the latest signed register.',
        },
      ],
    })

    const updatedPayload = makeInvestorPayload({
      submissions: [
        {
          id: 'sub-new',
          document_type: 'register_directors',
          status: 'under_review',
          version: 3,
          created_at: '2026-04-03T08:00:00.000Z',
          submitted_at: '2026-04-03T08:00:00.000Z',
        },
      ],
    })

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => rejectedPayload,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          status: 'pending',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedPayload,
      })

    global.fetch = fetchMock as typeof fetch

    render(<KYCDocumentsTab />)

    expect(await screen.findByText('Register of Directors')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()

    const registerRow = screen.getByText('Register of Directors').closest('tr')
    expect(registerRow).not.toBeNull()
    expect(within(registerRow as HTMLTableRowElement).getByRole('button', { name: 'Update' })).toBeInTheDocument()

    const input = registerRow?.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['updated-register'], 'register-directors.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    const uploadOptions = fetchMock.mock.calls[1]?.[1] as RequestInit
    const uploadBody = uploadOptions.body as FormData
    expect(uploadBody.get('documentType')).toBe('register_directors')
    expect(uploadBody.get('isUpdate')).toBe('true')

    const refreshedRow = screen.getByText('Register of Directors').closest('tr')
    expect(refreshedRow).not.toBeNull()
    expect(within(refreshedRow as HTMLTableRowElement).getByText('Pending Review')).toBeInTheDocument()
    expect(within(refreshedRow as HTMLTableRowElement).getByText(/Version 3/i)).toBeInTheDocument()
  })

  it('opens the completion popup when the final missing required document is uploaded', async () => {
    const initialPayload = makeInvestorPayload({
      submissions: makeEntitySubmissionsWithoutBankConfirmation(),
    })

    const completedPayload = makeInvestorPayload({
      submissions: [
        ...makeEntitySubmissionsWithoutBankConfirmation(),
        {
          id: 'sub-bank',
          document_type: 'bank_confirmation',
          status: 'pending',
          version: 1,
          created_at: '2026-04-03T08:00:00.000Z',
          submitted_at: '2026-04-03T08:00:00.000Z',
        },
      ],
    })

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialPayload,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          status: 'pending',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => completedPayload,
      })

    global.fetch = fetchMock as typeof fetch

    render(<KYCDocumentsTab />)

    expect(await screen.findByText('Bank Confirmation Letter')).toBeInTheDocument()

    const bankRow = screen.getByText('Bank Confirmation Letter').closest('tr')
    expect(bankRow).not.toBeNull()

    const input = bankRow?.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['bank-confirmation'], 'bank-confirmation.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText('Congratulations')).toBeInTheDocument()
    expect(
      screen.getByText(/you've uploaded all your required kyc documents/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument()
  })
})
