// @vitest-environment happy-dom
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import { IntroducerKYCDocumentsTab } from '@/components/profile/introducer-kyc-documents-tab'

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

type IntroducerPayload = {
  submissions: Array<Record<string, unknown>>
  members: Array<Record<string, unknown>>
}

function makeIntroducerPayload(
  overrides: Partial<IntroducerPayload> = {}
): IntroducerPayload {
  return {
    submissions: [],
    members: [
      { id: 'member-1', full_name: 'Alice Introducer', role: 'director' },
    ],
    ...overrides,
  }
}

describe('IntroducerKYCDocumentsTab', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('renders the introducer checklist with member rows, statuses, and no file name column', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        makeIntroducerPayload({
          submissions: [
            {
              id: 'sub-entity',
              document_type: 'register_members',
              status: 'approved',
              version: 1,
              created_at: '2026-04-01T08:00:00.000Z',
              submitted_at: '2026-04-01T08:00:00.000Z',
            },
            {
              id: 'sub-member',
              document_type: 'utility_bill',
              status: 'under_review',
              version: 1,
              created_at: '2026-04-02T08:00:00.000Z',
              submitted_at: '2026-04-02T08:00:00.000Z',
              document_date: '2026-03-15',
              introducer_member: {
                id: 'member-1',
                full_name: 'Alice Introducer',
                role: 'director',
              },
            },
          ],
        }),
    })

    global.fetch = fetchMock as typeof fetch

    render(
      <IntroducerKYCDocumentsTab
        introducerId="intro-1"
        introducerName="North Star Capital"
        kycStatus="under_review"
        entityType="entity"
      />
    )

    expect(await screen.findByText('Register of Members/Shareholders')).toBeInTheDocument()
    expect(screen.getByText('Proof of Address')).toBeInTheDocument()
    expect(screen.getAllByText('Alice Introducer').length).toBeGreaterThan(0)
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getAllByText('Pending Review').length).toBeGreaterThan(0)
    expect(screen.queryByText(/file name/i)).not.toBeInTheDocument()
  })

  it('updates a rejected introducer checklist row inline and refreshes the latest version', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeIntroducerPayload({
            submissions: [
              {
                id: 'sub-old',
                document_type: 'register_members',
                status: 'rejected',
                version: 1,
                created_at: '2026-04-01T08:00:00.000Z',
                submitted_at: '2026-04-01T08:00:00.000Z',
                rejection_reason: 'Please upload a complete shareholder register.',
              },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          submission_status: 'pending',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeIntroducerPayload({
            submissions: [
              {
                id: 'sub-new',
                document_type: 'register_members',
                status: 'under_review',
                version: 2,
                created_at: '2026-04-03T08:00:00.000Z',
                submitted_at: '2026-04-03T08:00:00.000Z',
              },
            ],
          }),
      })

    global.fetch = fetchMock as typeof fetch

    render(
      <IntroducerKYCDocumentsTab
        introducerId="intro-1"
        introducerName="North Star Capital"
        kycStatus="rejected"
        entityType="entity"
      />
    )

    expect(await screen.findByText('Register of Members/Shareholders')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()

    const registerRow = screen.getByText('Register of Members/Shareholders').closest('tr')
    expect(registerRow).not.toBeNull()
    expect(within(registerRow as HTMLTableRowElement).getByRole('button', { name: 'Update' })).toBeInTheDocument()

    const input = registerRow?.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['updated-register'], 'register-members.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/introducers/me/documents')
    const uploadOptions = fetchMock.mock.calls[1]?.[1] as RequestInit
    const uploadBody = uploadOptions.body as FormData
    expect(uploadBody.get('type')).toBe('register_members')
    expect(uploadBody.get('isUpdate')).toBe('true')

    const refreshedRow = screen.getByText('Register of Members/Shareholders').closest('tr')
    expect(refreshedRow).not.toBeNull()
    expect(within(refreshedRow as HTMLTableRowElement).getByText('Pending Review')).toBeInTheDocument()
    expect(within(refreshedRow as HTMLTableRowElement).getByText(/Version 2/i)).toBeInTheDocument()
  })
})
