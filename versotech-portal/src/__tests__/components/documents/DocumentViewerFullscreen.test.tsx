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
})
