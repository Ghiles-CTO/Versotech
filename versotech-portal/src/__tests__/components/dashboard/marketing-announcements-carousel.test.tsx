// @vitest-environment happy-dom
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { MarketingAnnouncementsCarousel } from '@/components/dashboard/marketing-announcements-carousel'
import type { MarketingCard } from '@/types/dashboard-marketing'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'light' }),
}))

vi.mock('@/hooks/use-confirmation-dialog', () => ({
  useConfirmationDialog: () => ({
    confirm: vi.fn(),
    ConfirmationDialog: () => null,
  }),
}))

vi.mock('@/components/documents/DocumentViewerFullscreen', () => ({
  DocumentViewerFullscreen: ({
    isOpen,
    document,
    previewUrl,
  }: {
    isOpen: boolean
    document: { file_name?: string | null } | null
    previewUrl: string | null
  }) =>
    isOpen ? (
      <div data-testid="document-viewer">
        <span>{document?.file_name}</span>
        <span>{previewUrl}</span>
      </div>
    ) : null,
}))

function createDocumentCard(): MarketingCard {
  return {
    id: 'card-1',
    card_type: 'document',
    status: 'published',
    title: 'Investor update',
    summary: 'Updated memo and supporting material.',
    media_type: 'document',
    image_url: 'https://cdn.example.com/generated-cover.jpg',
    image_storage_path: null,
    video_url: null,
    video_storage_path: null,
    external_url: null,
    link_domain: null,
    source_published_at: null,
    document_storage_path: 'marketing/documents/investor-update.pdf',
    document_file_name: 'investor-update.pdf',
    document_mime_type: 'application/pdf',
    document_preview_storage_path: 'marketing/previews/investor-update.jpg',
    document_preview_url: null,
    document_preview_strategy: null,
    document_preview_type: null,
    metadata_json: null,
    cta_enabled: true,
    cta_label: 'Preview',
    sort_order: 0,
    published_at: '2026-03-25T10:00:00.000Z',
    created_by: null,
    updated_by: null,
    created_at: '2026-03-25T10:00:00.000Z',
    updated_at: '2026-03-25T10:00:00.000Z',
  }
}

describe('MarketingAnnouncementsCarousel', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('opens document cards in the inline viewer when Preview is clicked', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          download_url: 'https://storage.example/preview/investor-update.pdf',
          preview_strategy: 'direct',
          document: {
            id: 'card-1',
            name: 'investor-update.pdf',
            type: 'pdf',
          },
          expires_in_seconds: 900,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )
    vi.stubGlobal('fetch', fetchMock)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(
      <MarketingAnnouncementsCarousel
        investorId="investor-1"
        items={[createDocumentCard()]}
      />
    )

    await user.click(screen.getByRole('button', { name: /preview/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/dashboard-marketing/cards/card-1/document?mode=preview&investor_id=investor-1',
        { cache: 'no-store' }
      )
      expect(screen.getByTestId('document-viewer')).toHaveTextContent(
        'investor-update.pdf'
      )
      expect(screen.getByTestId('document-viewer')).toHaveTextContent(
        'https://storage.example/preview/investor-update.pdf'
      )
    })

    expect(openSpy).not.toHaveBeenCalled()
  })

  it('renders document previews full-bleed inside the shared media container', () => {
    render(
      <MarketingAnnouncementsCarousel
        investorId="investor-1"
        items={[createDocumentCard()]}
      />
    )

    const previewImage = screen.getByAltText('Investor update')
    const mediaContainer = previewImage.parentElement

    expect(mediaContainer?.className).toContain('aspect-[16/10]')
    expect(mediaContainer?.className).not.toContain('p-4')
    expect(previewImage.className).toContain('object-cover')
    expect(previewImage.className).toContain('object-top')
  })
})
