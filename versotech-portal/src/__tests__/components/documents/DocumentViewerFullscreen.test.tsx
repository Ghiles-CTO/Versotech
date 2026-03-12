// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'

describe('DocumentViewerFullscreen', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses a restricted audio player when download is hidden', async () => {
    render(
      <DocumentViewerFullscreen
        isOpen
        document={{
          id: 'doc-1',
          file_name: 'investor-call.mp3',
          mime_type: 'audio/mpeg',
        }}
        previewUrl="https://example.com/investor-call.mp3"
        isLoading={false}
        error={null}
        onClose={vi.fn()}
        onDownload={vi.fn()}
        hideDownload
      />
    )

    expect(await screen.findByLabelText('Audio playback progress')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /download/i })).toBeNull()
    expect(document.body.querySelector('audio[controls]')).toBeNull()
  })

  it('renders Office previews in an iframe when the Office embed strategy is used', async () => {
    render(
      <DocumentViewerFullscreen
        isOpen
        document={{
          id: 'doc-2',
          file_name: 'financial-model.xlsx',
          mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          preview_type: 'excel',
          preview_strategy: 'office_embed',
        }}
        previewUrl="about:blank"
        isLoading={false}
        error={null}
        onClose={vi.fn()}
        onDownload={vi.fn()}
        hideDownload
      />
    )

    const iframe = await screen.findByTitle('financial-model.xlsx')
    expect(iframe.tagName).toBe('IFRAME')
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-downloads')
    expect(screen.queryByRole('button', { name: /download/i })).toBeNull()
  })

  it('renders PowerPoint previews in the restricted Office iframe', async () => {
    render(
      <DocumentViewerFullscreen
        isOpen
        document={{
          id: 'doc-3',
          file_name: 'pitch-deck.pptx',
          mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          preview_type: 'presentation',
          preview_strategy: 'office_embed',
        }}
        previewUrl="about:blank"
        isLoading={false}
        error={null}
        onClose={vi.fn()}
        onDownload={vi.fn()}
        hideDownload
      />
    )

    const iframe = await screen.findByTitle('pitch-deck.pptx')
    expect(iframe.tagName).toBe('IFRAME')
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-downloads')
  })
})
