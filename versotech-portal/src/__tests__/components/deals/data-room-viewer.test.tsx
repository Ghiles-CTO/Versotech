// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataRoomViewer } from '@/components/deals/data-room-viewer'

vi.mock('@/hooks/useDocumentViewer', () => ({
  useDocumentViewer: () => ({
    isOpen: false,
    document: null,
    previewUrl: null,
    isLoading: false,
    error: null,
    openPreview: vi.fn(),
    closePreview: vi.fn(),
    downloadDocument: vi.fn(),
    watermark: null,
  }),
}))

vi.mock('@/components/documents/DocumentViewerFullscreen', () => ({
  DocumentViewerFullscreen: () => null,
}))

describe('DataRoomViewer', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('shows the expired-access recovery state', () => {
    render(
      <DataRoomViewer
        documents={[]}
        hasAccess={false}
        requiresNda={false}
        dealId="deal-1"
        dealName="OpenAI Secondary"
        accessExpiresAt="2026-03-20T12:00:00.000Z"
      />
    )

    expect(screen.getByText('Data Room Access Expired')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Request Access Again' })).toBeInTheDocument()
  })

  it('shows the expired-access CTA as pending when an extension request is already under review', () => {
    render(
      <DataRoomViewer
        documents={[]}
        hasAccess={false}
        requiresNda={false}
        dealId="deal-1"
        dealName="OpenAI Secondary"
        accessExpiresAt="2026-03-20T12:00:00.000Z"
        hasPendingExtensionRequest
      />
    )

    expect(screen.getByRole('button', { name: 'Request Pending' })).toBeDisabled()
  })

  it('keeps the normal NDA unlock CTA when signing is required', () => {
    const handleSignNda = vi.fn()

    render(
      <DataRoomViewer
        documents={[]}
        hasAccess={false}
        requiresNda
        dealId="deal-1"
        onRequestAccess={handleSignNda}
      />
    )

    expect(screen.getByRole('button', { name: 'Sign NDA to Unlock' })).toBeInTheDocument()
  })

  it('shows the normal request-access CTA when the page wants to allow a new data-room request', async () => {
    const handleRequestAccess = vi.fn()

    render(
      <DataRoomViewer
        documents={[]}
        hasAccess={false}
        requiresNda={false}
        dealId="deal-1"
        onRequestNewAccess={handleRequestAccess}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Request Access' }))

    expect(handleRequestAccess).toHaveBeenCalledTimes(1)
  })
})
