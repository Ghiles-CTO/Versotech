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

  it('parses Office embed previews for uploaded Office files', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({
        download_url: 'https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Fstorage.example%2Fdoc.docx',
        preview_strategy: 'office_embed',
        document: {
          id: 'doc-1',
          name: 'board-pack.docx',
          type: 'docx',
          preview_strategy: 'office_embed',
        },
        expires_in_seconds: 900,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
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
    expect(createObjectUrlSpy).not.toHaveBeenCalled()
    expect(response.download_url).toContain('view.officeapps.live.com')
    expect(response.document.type).toBe('docx')
    expect(response.preview_strategy).toBe('office_embed')
  })

  it('parses PowerPoint Office embed previews', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({
        download_url: 'https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Fstorage.example%2Fdeck.pptx',
        preview_strategy: 'office_embed',
        document: {
          id: 'doc-2',
          name: 'deck.pptx',
          type: 'presentation',
          preview_strategy: 'office_embed',
        },
        expires_in_seconds: 900,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )

    const response = await DocumentService.getPreviewUrl('doc-2')

    expect(response.document.type).toBe('presentation')
    expect(response.preview_strategy).toBe('office_embed')
    expect(response.download_url).toContain('view.officeapps.live.com')
  })
})
