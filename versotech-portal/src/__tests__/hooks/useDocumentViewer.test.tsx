// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentService } from '@/services/document.service'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('useDocumentViewer', () => {
  const documentRef = {
    id: 'doc-1',
    file_name: 'kyc-passport.pdf',
    name: 'kyc-passport.pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 1024,
  }

  let fetchMock: ReturnType<typeof vi.fn>
  let openSpy: ReturnType<typeof vi.spyOn>
  let anchorClickSpy: ReturnType<typeof vi.spyOn>
  let createObjectUrlSpy: ReturnType<typeof vi.fn>
  let revokeObjectUrlSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(
      new Response(new Blob(['pdf-bytes'], { type: 'application/pdf' }), {
        status: 200,
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    createObjectUrlSpy = vi.fn(() => 'blob:downloaded-file')
    revokeObjectUrlSpy = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectUrlSpy,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: revokeObjectUrlSpy,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('downloads general documents from the viewer without opening a new tab', async () => {
    vi.spyOn(DocumentService, 'getPreviewUrl').mockResolvedValue({
      download_url: 'https://storage.example/preview.pdf',
      url: 'https://storage.example/preview.pdf',
      expires_in_seconds: 3600,
    } as any)
    const downloadSpy = vi.spyOn(DocumentService, 'getDownloadUrl').mockResolvedValue({
      download_url: 'https://storage.example/download.pdf',
      url: 'https://storage.example/download.pdf',
      expires_in_seconds: 3600,
    } as any)

    const { result } = renderHook(() => useDocumentViewer())

    await act(async () => {
      await result.current.openPreview(documentRef)
    })

    await act(async () => {
      await result.current.downloadDocument()
    })

    expect(downloadSpy).toHaveBeenCalledWith('doc-1')
    expect(fetchMock).toHaveBeenCalledWith('https://storage.example/download.pdf')
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1)
    expect(anchorClickSpy).toHaveBeenCalledTimes(1)
    expect(openSpy).not.toHaveBeenCalled()
  })

  it('downloads deal documents from the viewer without opening a new tab when the API returns a URL', async () => {
    vi.spyOn(DocumentService, 'getDealDocumentPreviewUrl').mockResolvedValue({
      download_url: 'https://storage.example/deal-preview.pdf',
      url: 'https://storage.example/deal-preview.pdf',
      expires_in_seconds: 3600,
    } as any)
    const downloadSpy = vi.spyOn(DocumentService, 'getDealDocumentDownloadUrl').mockResolvedValue({
      download_url: 'https://storage.example/deal-download.pdf',
      url: 'https://storage.example/deal-download.pdf',
      expires_in_seconds: 3600,
    } as any)

    const { result } = renderHook(() => useDocumentViewer())

    await act(async () => {
      await result.current.openPreview(documentRef, 'deal-1')
    })

    await act(async () => {
      await result.current.downloadDocument()
    })

    expect(downloadSpy).toHaveBeenCalledWith('deal-1', 'doc-1')
    expect(fetchMock).toHaveBeenCalledWith('https://storage.example/deal-download.pdf')
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1)
    expect(anchorClickSpy).toHaveBeenCalledTimes(1)
    expect(openSpy).not.toHaveBeenCalled()
  })

  it('downloads the original deal Office file when preview is rendered from a PDF blob', async () => {
    const officeDocument = {
      ...documentRef,
      file_name: 'board-pack.docx',
      name: 'board-pack.docx',
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }

    vi.spyOn(DocumentService, 'getDealDocumentPreviewUrl').mockResolvedValue({
      download_url: 'blob:office-preview',
      url: 'blob:office-preview',
      document: {
        id: 'doc-1',
        name: '',
        type: 'pdf',
      },
      expires_in_seconds: 0,
    } as any)
    const downloadSpy = vi.spyOn(DocumentService, 'getDealDocumentDownloadUrl').mockResolvedValue({
      download_url: 'https://storage.example/deal-download.docx',
      url: 'https://storage.example/deal-download.docx',
      expires_in_seconds: 3600,
    } as any)

    const { result } = renderHook(() => useDocumentViewer())

    await act(async () => {
      await result.current.openPreview(officeDocument, 'deal-1')
    })

    await act(async () => {
      await result.current.downloadDocument()
    })

    expect(downloadSpy).toHaveBeenCalledWith('deal-1', 'doc-1')
    expect(fetchMock).toHaveBeenCalledWith('https://storage.example/deal-download.docx')
    expect(anchorClickSpy).toHaveBeenCalledTimes(1)
    expect(openSpy).not.toHaveBeenCalled()
  })

  it('opens non-deal Microsoft-hosted Office links in the in-app viewer without calling the API', async () => {
    const externalOfficeDocument = {
      id: 'doc-2',
      file_name: 'teaser.docx',
      name: 'teaser.docx',
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      external_link: 'https://versotech.sharepoint.com/:w:/r/sites/investors/Shared%20Documents/teaser.docx?d=abc123',
    }

    const previewSpy = vi.spyOn(DocumentService, 'getPreviewUrl')

    const { result } = renderHook(() => useDocumentViewer())

    await act(async () => {
      await result.current.openPreview(externalOfficeDocument as any)
    })

    expect(previewSpy).not.toHaveBeenCalled()
    expect(result.current.isOpen).toBe(true)
    expect(result.current.previewUrl).toContain('action=embedview')
    expect(result.current.document?.preview_type).toBe('docx')
    expect(result.current.document?.preview_strategy).toBe('office_embed')
  })

  it('allows PowerPoint files through the shared preview flow', async () => {
    const powerpointDocument = {
      id: 'doc-3',
      file_name: 'pitch-deck.pptx',
      name: 'pitch-deck.pptx',
      mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      file_size_bytes: 2048,
    }

    const previewSpy = vi.spyOn(DocumentService, 'getPreviewUrl').mockResolvedValue({
      download_url: 'https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Fstorage.example%2Fpitch-deck.pptx',
      url: 'https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Fstorage.example%2Fpitch-deck.pptx',
      preview_strategy: 'office_embed',
      document: {
        id: 'doc-3',
        name: 'pitch-deck.pptx',
        type: 'presentation',
        preview_strategy: 'office_embed',
      },
      expires_in_seconds: 900,
    } as any)

    const { result } = renderHook(() => useDocumentViewer())

    await act(async () => {
      await result.current.openPreview(powerpointDocument as any)
    })

    expect(previewSpy).toHaveBeenCalledWith('doc-3')
    expect(result.current.error).toBeNull()
    expect(result.current.document?.preview_type).toBe('presentation')
    expect(result.current.document?.preview_strategy).toBe('office_embed')
  })
})
