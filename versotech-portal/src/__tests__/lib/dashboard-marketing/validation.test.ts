import { describe, expect, it } from 'vitest'

import {
  marketingCardCreateSchema,
  normalizeMarketingCardInput,
} from '@/lib/dashboard-marketing/validation'

const documentCardInput = {
  card_type: 'document' as const,
  status: 'draft' as const,
  title: 'Fund overview pack',
  summary: 'Quarterly summary and supporting documents.',
  media_type: 'document' as const,
  image_url: 'https://cdn.example.com/generated-cover.jpg',
  image_storage_path: null,
  video_url: null,
  video_storage_path: null,
  external_url: null,
  link_domain: null,
  source_published_at: null,
  document_storage_path: 'marketing/documents/overview-pack.pdf',
  document_file_name: 'overview-pack.pdf',
  document_mime_type: 'application/pdf',
  document_preview_storage_path: 'marketing/previews/overview-pack.jpg',
  metadata_json: null,
  cta_enabled: false,
  cta_label: 'Open',
  sort_order: 0,
}

describe('dashboard marketing validation', () => {
  it('requires uploaded document metadata for document cards', () => {
    const parsed = marketingCardCreateSchema.safeParse({
      ...documentCardInput,
      document_storage_path: null,
      document_preview_storage_path: null,
    })

    expect(parsed.success).toBe(false)
    if (parsed.success) {
      throw new Error('Expected document validation to fail')
    }

    const errors = parsed.error.flatten().fieldErrors
    expect(errors.document_storage_path).toContain(
      'Document cards require an uploaded file.'
    )
    expect(errors.document_preview_storage_path).toContain(
      'Document cards require a generated cover preview.'
    )
  })

  it('forces the Preview CTA and document media mode for document cards', () => {
    const parsed = marketingCardCreateSchema.parse(documentCardInput)
    const normalized = normalizeMarketingCardInput(parsed)

    expect(normalized.media_type).toBe('document')
    expect(normalized.cta_enabled).toBe(true)
    expect(normalized.cta_label).toBe('Preview')
    expect(normalized.image_url).toBeNull()
    expect(normalized.document_storage_path).toBe(
      'marketing/documents/overview-pack.pdf'
    )
  })
})
