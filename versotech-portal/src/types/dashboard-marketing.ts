export const MARKETING_CARD_TYPES = [
  'opportunity',
  'event',
  'news',
  'document',
] as const
export const MARKETING_CARD_STATUSES = ['draft', 'published'] as const
export const MARKETING_CARD_MEDIA_TYPES = [
  'image',
  'video',
  'link',
  'document',
] as const

export type MarketingCardType = (typeof MARKETING_CARD_TYPES)[number]
export type MarketingCardStatus = (typeof MARKETING_CARD_STATUSES)[number]
export type MarketingCardMediaType = (typeof MARKETING_CARD_MEDIA_TYPES)[number]

export const MARKETING_BADGE_LABELS: Record<MarketingCardType, string> = {
  opportunity: 'Investment Opportunity',
  event: 'Event',
  news: 'News',
  document: 'Document',
}

export interface MarketingCard {
  id: string
  card_type: MarketingCardType
  status: MarketingCardStatus
  title: string
  summary: string
  media_type: MarketingCardMediaType
  image_url: string | null
  image_storage_path: string | null
  video_url: string | null
  video_storage_path: string | null
  external_url: string | null
  link_domain: string | null
  source_published_at: string | null
  document_storage_path: string | null
  document_file_name: string | null
  document_mime_type: string | null
  document_preview_storage_path: string | null
  document_preview_url?: string | null
  document_preview_strategy?: 'direct' | 'office_embed' | null
  document_preview_type?: string | null
  metadata_json: Record<string, unknown> | null
  cta_enabled: boolean
  cta_label: string | null
  sort_order: number
  published_at: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface MarketingCardsResponse {
  items: MarketingCard[]
  submittedCardIds: string[]
  generatedAt: string
}

export interface MarketingLead {
  id: string
  card_id: string
  user_id: string
  investor_id: string
  created_at: string
  card_title: string
  card_type: MarketingCardType
  investor_name: string | null
  user_name: string | null
  user_email: string | null
}

export interface MarketingLinkMetadata {
  title: string | null
  summary: string | null
  imageUrl: string | null
  externalUrl: string
  linkDomain: string | null
  sourcePublishedAt: string | null
  metadata: Record<string, unknown>
}
