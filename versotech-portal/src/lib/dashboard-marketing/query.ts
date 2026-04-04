import type {
  MarketingCard,
  MarketingCardsResponse,
  MarketingLead,
} from '@/types/dashboard-marketing'
import { resolveMarketingDocumentCoverUrl } from '@/lib/dashboard-marketing/documents'

async function rowToCard(
  row: any,
  options?: {
    supabase?: any
  }
): Promise<MarketingCard> {
  const documentCoverUrl =
    row.card_type === 'document' && options?.supabase
      ? await resolveMarketingDocumentCoverUrl(
          options.supabase,
          row.document_preview_storage_path
        )
      : null

  return {
    id: row.id,
    card_type: row.card_type,
    status: row.status,
    title: row.title,
    summary: row.summary,
    media_type: row.media_type,
    image_url: documentCoverUrl ?? row.image_url ?? null,
    image_storage_path: row.image_storage_path ?? null,
    video_url: row.video_url ?? null,
    video_storage_path: row.video_storage_path ?? null,
    external_url: row.external_url ?? null,
    link_domain: row.link_domain ?? null,
    source_published_at: row.source_published_at ?? null,
    document_storage_path: row.document_storage_path ?? null,
    document_file_name: row.document_file_name ?? null,
    document_mime_type: row.document_mime_type ?? null,
    document_preview_storage_path: row.document_preview_storage_path ?? null,
    document_preview_url: null,
    document_preview_strategy: null,
    document_preview_type: null,
    allow_download: row.allow_download ?? true,
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

export async function buildMarketingCardsResponse(
  rows: any[],
  options?: { submittedCardIds?: string[]; supabase?: any }
): Promise<MarketingCardsResponse> {
  return {
    items: await Promise.all(
      (rows ?? []).map((row) =>
        rowToCard(row, {
          supabase: options?.supabase,
        })
      )
    ),
    submittedCardIds: options?.submittedCardIds ?? [],
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
