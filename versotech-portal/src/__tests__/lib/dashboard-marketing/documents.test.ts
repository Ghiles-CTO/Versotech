import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'

import {
  buildMarketingDocumentPreviewResponse,
  uploadMarketingDocumentAsset,
} from '@/lib/dashboard-marketing/documents'

function createSupabase() {
  return {
    storage: {
      from: () => ({
        createSignedUrl: async (path: string, expiresIn: number) => ({
          data: {
            signedUrl: `https://storage.example/${encodeURIComponent(path)}?ttl=${expiresIn}`,
          },
          error: null,
        }),
      }),
    },
  }
}

describe('dashboard marketing document previews', () => {
  it('uploads a PDF document and generates a top-of-page cover image', async () => {
    const uploads: Array<{ path: string; contentType: string }> = []
    const removals: string[][] = []
    const supabase = {
      storage: {
        from: () => ({
          upload: async (
            path: string,
            _body: Uint8Array,
            options: { contentType: string; upsert: boolean }
          ) => {
            uploads.push({ path, contentType: options.contentType })
            return { error: null }
          },
          createSignedUrl: async (path: string, expiresIn: number) => ({
            data: {
              signedUrl: `https://storage.example/${encodeURIComponent(path)}?ttl=${expiresIn}`,
            },
            error: null,
          }),
          remove: async (paths: string[]) => {
            removals.push(paths)
            return { error: null }
          },
        }),
      },
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842])
    page.drawText('Investor document preview', { x: 36, y: 790 })
    const pdfBytes = await pdfDoc.save()
    const originalDomMatrix = (globalThis as any).DOMMatrix
    const originalImageData = (globalThis as any).ImageData
    const originalPath2D = (globalThis as any).Path2D

    ;(globalThis as any).DOMMatrix = undefined
    ;(globalThis as any).ImageData = undefined
    ;(globalThis as any).Path2D = undefined

    try {
      const payload = await uploadMarketingDocumentAsset({
        supabase: supabase as any,
        fileName: 'investor-document.pdf',
        mimeType: 'application/pdf',
        bytes: new Uint8Array(pdfBytes),
      })

      expect(uploads).toHaveLength(2)
      expect(uploads[0]?.path).toMatch(/^marketing\/documents\//)
      expect(uploads[0]?.contentType).toBe('application/pdf')
      expect(uploads[1]?.path).toMatch(/^marketing\/previews\//)
      expect(uploads[1]?.contentType).toBe('image/jpeg')
      expect(payload.document_preview_type).toBe('pdf')
      expect(payload.document_preview_strategy).toBe('direct')
      expect(payload.document_preview_url).toContain(
        encodeURIComponent(payload.document_storage_path)
      )
      expect(payload.image_url).toContain(
        encodeURIComponent(payload.document_preview_storage_path)
      )
      expect(removals).toHaveLength(0)
      expect((globalThis as any).DOMMatrix).toBeDefined()
      expect((globalThis as any).ImageData).toBeDefined()
      expect((globalThis as any).Path2D).toBeDefined()
    } finally {
      ;(globalThis as any).DOMMatrix = originalDomMatrix
      ;(globalThis as any).ImageData = originalImageData
      ;(globalThis as any).Path2D = originalPath2D
    }
  })

  it('returns direct previews for PDF cards', async () => {
    const response = await buildMarketingDocumentPreviewResponse({
      supabase: createSupabase() as any,
      card: {
        id: 'card-pdf',
        document_storage_path: 'marketing/documents/fund-teaser.pdf',
        document_file_name: 'fund-teaser.pdf',
        document_mime_type: 'application/pdf',
      },
      mode: 'preview',
    })

    expect(response.preview_strategy).toBe('direct')
    expect(response.download_url).toContain('fund-teaser.pdf')
    expect(response.document.type).toBe('pdf')
  })

  it('uses Office embed for Word previews and direct URLs for downloads', async () => {
    const previewResponse = await buildMarketingDocumentPreviewResponse({
      supabase: createSupabase() as any,
      card: {
        id: 'card-docx',
        document_storage_path: 'marketing/documents/investor-update.docx',
        document_file_name: 'investor-update.docx',
        document_mime_type:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      mode: 'preview',
    })

    expect(previewResponse.preview_strategy).toBe('office_embed')
    expect(previewResponse.download_url).toContain(
      'view.officeapps.live.com/op/embed.aspx'
    )
    expect(previewResponse.document.type).toBe('docx')

    const downloadResponse = await buildMarketingDocumentPreviewResponse({
      supabase: createSupabase() as any,
      card: {
        id: 'card-docx',
        document_storage_path: 'marketing/documents/investor-update.docx',
        document_file_name: 'investor-update.docx',
        document_mime_type:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      mode: 'download',
    })

    expect(downloadResponse.preview_strategy).toBe('direct')
    expect(downloadResponse.download_url).toContain('investor-update.docx')
    expect(downloadResponse.download_url).not.toContain(
      'view.officeapps.live.com'
    )
  })
})
