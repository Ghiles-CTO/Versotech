export const HOME_ITEM_KINDS = [
  'hero',
  'opportunity_teaser',
  'event',
  'report',
  'verso_update',
  'news_article',
] as const

export const HOME_ITEM_STATUSES = ['draft', 'published', 'archived'] as const

export const HOME_CTA_ACTIONS = ['open_link', 'interest_capture', 'go_to_dashboard', 'none'] as const

export const HOME_INTEREST_STATUSES = ['new', 'reviewed', 'contacted', 'closed'] as const

export type HomeItemKind = (typeof HOME_ITEM_KINDS)[number]
export type HomeItemStatus = (typeof HOME_ITEM_STATUSES)[number]
export type HomeCtaAction = (typeof HOME_CTA_ACTIONS)[number]
export type HomeInterestStatus = (typeof HOME_INTEREST_STATUSES)[number]

export interface HomeItem {
  id: string
  kind: HomeItemKind
  status: HomeItemStatus
  title: string
  eyebrow: string | null
  summary: string
  body: string | null
  image_url: string | null
  link_url: string | null
  cta_label: string | null
  cta_action: HomeCtaAction
  source_url: string | null
  source_name: string | null
  source_domain: string | null
  source_published_at: string | null
  metadata_json: Record<string, unknown> | null
  linked_deal_id: string | null
  featured_slot: number | null
  sort_order: number
  starts_at: string | null
  ends_at: string | null
  is_pinned: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface HomeFeedResponse {
  hero: HomeItem | null
  featuredItems: HomeItem[]
  feedItems: HomeItem[]
  marketNews: HomeItem[]
  generatedAt: string
}

export interface HomeInterestSubmission {
  id: string
  home_item_id: string
  user_id: string
  investor_id: string
  note: string | null
  admin_note: string | null
  status: HomeInterestStatus
  created_at: string
  updated_at: string
}
