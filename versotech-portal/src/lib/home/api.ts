import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isStaffUser } from '@/lib/api-auth'
import { resolvePrimaryInvestorLink } from '@/lib/kyc/investor-link'
import type { HomeItem } from '@/types/home'
import { homeItemCreateSchema, normalizeHomeItemInput, type HomeItemPatchInput } from '@/lib/home/validation'
import { extractDomain } from '@/lib/messaging/url-utils'

type RawHomeItem = Record<string, any>

function withSourceDefaults(input: Record<string, any>) {
  const next = { ...input }

  if (typeof next.source_url === 'string' && next.source_url.length > 0) {
    next.source_domain = next.source_domain || extractDomain(next.source_url)

    if (next.kind === 'news_article' && !next.source_name) {
      next.source_name = next.source_domain
    }
  }

  return next
}

function pickMutableHomeItemFields(input: RawHomeItem) {
  return {
    kind: input.kind,
    status: input.status,
    title: input.title,
    eyebrow: input.eyebrow,
    summary: input.summary,
    body: input.body,
    image_url: input.image_url,
    link_url: input.link_url,
    cta_label: input.cta_label,
    cta_action: input.cta_action,
    source_url: input.source_url,
    source_name: input.source_name,
    source_domain: input.source_domain,
    source_published_at: input.source_published_at,
    metadata_json: input.metadata_json,
    linked_deal_id: input.linked_deal_id,
    featured_slot: input.featured_slot,
    sort_order: input.sort_order,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    is_pinned: input.is_pinned,
  }
}

export function buildHomeItemCreatePayload(input: unknown) {
  const parsed = homeItemCreateSchema.parse(withSourceDefaults(input as Record<string, unknown>))
  return normalizeHomeItemInput(parsed)
}

export function buildHomeItemPatchPayload(existing: RawHomeItem, patch: HomeItemPatchInput) {
  const candidate = {
    ...pickMutableHomeItemFields(existing),
    ...patch,
  }

  return buildHomeItemCreatePayload(candidate)
}

export function toHomeItem(row: RawHomeItem): HomeItem {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    title: row.title,
    eyebrow: row.eyebrow ?? null,
    summary: row.summary,
    body: row.body ?? null,
    image_url: row.image_url ?? null,
    link_url: row.link_url ?? null,
    cta_label: row.cta_label ?? null,
    cta_action: row.cta_action,
    source_url: row.source_url ?? null,
    source_name: row.source_name ?? null,
    source_domain: row.source_domain ?? null,
    source_published_at: row.source_published_at ?? null,
    metadata_json: row.metadata_json ?? null,
    linked_deal_id: row.linked_deal_id ?? null,
    featured_slot: row.featured_slot ?? null,
    sort_order: row.sort_order ?? 0,
    starts_at: row.starts_at ?? null,
    ends_at: row.ends_at ?? null,
    is_pinned: row.is_pinned ?? false,
    created_by: row.created_by ?? null,
    updated_by: row.updated_by ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function requireStaffActor() {
  const authSupabase = await createClient()
  const {
    data: { user },
    error,
  } = await authSupabase.auth.getUser()

  if (error || !user) {
    return { error: 'Unauthorized', status: 401 as const }
  }

  const staffAccess = await isStaffUser(authSupabase, user)
  if (!staffAccess) {
    return { error: 'Forbidden', status: 403 as const }
  }

  return {
    authSupabase,
    serviceSupabase: createServiceClient(),
    user,
  }
}

export async function requireInvestorActor() {
  const authSupabase = await createClient()
  const {
    data: { user },
    error,
  } = await authSupabase.auth.getUser()

  if (error || !user) {
    return { error: 'Unauthorized', status: 401 as const }
  }

  const serviceSupabase = createServiceClient()
  const { link, error: investorError } = await resolvePrimaryInvestorLink(
    serviceSupabase,
    user.id,
    'investor_id, role, is_primary'
  )

  if (investorError) {
    return { error: 'Failed to resolve investor account', status: 500 as const }
  }

  if (!link?.investor_id) {
    return { error: 'Investor access required', status: 403 as const }
  }

  return {
    authSupabase,
    serviceSupabase,
    user,
    investorId: link.investor_id as string,
  }
}
