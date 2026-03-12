// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DocumentService } from '@/services/document.service'

describe('DocumentService.getPreviewUrl', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let createObjectUrlSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    createObjectUrlSpy = vi.fn(() => 'blob:office-preview')
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectUrlSpy,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('parses binary PDF previews for uploaded Office files', async () => {
    fetchMock.mockResolvedValue(
      new Response(new Blob(['preview-bytes'], { type: 'application/pdf' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
        },
      })
    )

    const response = await DocumentService.getPreviewUrl('doc-1')

    expect(fetchMock).toHaveBeenCalledWith('/api/documents/doc-1/download?mode=preview', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1)
    expect(response.download_url).toBe('blob:office-preview')
    expect(response.document.type).toBe('pdf')
  })
})
