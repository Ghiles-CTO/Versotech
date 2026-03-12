import type {
  MarketingCard,
  MarketingCardsResponse,
  MarketingLead,
} from '@/types/dashboard-marketing'

function rowToCard(row: any): MarketingCard {
  return {
    id: row.id,
    card_type: row.card_type,
    status: row.status,
    title: row.title,
    summary: row.summary,
    media_type: row.media_type,
    image_url: row.image_url ?? null,
    image_storage_path: row.image_storage_path ?? null,
    video_url: row.video_url ?? null,
    video_storage_path: row.video_storage_path ?? null,
    external_url: row.external_url ?? null,
    link_domain: row.link_domain ?? null,
    source_published_at: row.source_published_at ?? null,
    metadata_json: row.metadata_json ?? null,
    cta_enabled: Boolean(row.cta_enabled),
    cta_label: row.cta_label ?? null,
    sort_order: row.sort_order ?? 0,
    published_at: row.published_at ?? null,
    created_by: row.created_by ?? null,
    updated_by: row.updated_by ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function buildMarketingCardsResponse(rows: any[]): MarketingCardsResponse {
  return {
    items: (rows ?? []).map(rowToCard),
    generatedAt: new Date().toISOString(),
  }
}

export function mapMarketingLead(row: any): MarketingLead {
  return {
    id: row.id,
    card_id: row.card_id,
    user_id: row.user_id,
    investor_id: row.investor_id,
    created_at: row.created_at,
    card_title: row.dashboard_marketing_cards?.title ?? 'Marketing card',
    card_type: row.dashboard_marketing_cards?.card_type ?? 'news',
    investor_name:
      row.investors?.display_name ??
      row.investors?.legal_name ??
      row.investors?.name ??
      null,
    user_name: row.profiles?.display_name ?? null,
    user_email: row.profiles?.email ?? null,
  }
}
