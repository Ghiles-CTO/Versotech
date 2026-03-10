import { z } from 'zod'

import {
  HOME_CTA_ACTIONS,
  HOME_INTEREST_STATUSES,
  HOME_ITEM_KINDS,
  HOME_ITEM_STATUSES,
  type HomeCtaAction,
  type HomeItemKind,
  type HomeItemStatus,
} from '@/types/home'

const nullableTrimmedString = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value !== 'string') return null
      const trimmed = value.trim()
      return trimmed.length ? trimmed.slice(0, max) : null
    })

const requiredTrimmedString = (max: number) =>
  z.string().trim().min(1).max(max)

const nullableUrl = z
  .union([z.string().url(), z.null(), z.undefined()])
  .transform((value) => (typeof value === 'string' ? value : null))

const nullableDateTime = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value == null || value === '') return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid datetime value',
      })
      return z.NEVER
    }
    return parsed.toISOString()
  })

const nullableInteger = z
  .union([z.number(), z.null(), z.undefined()])
  .transform((value) => (typeof value === 'number' ? Math.trunc(value) : null))

export const homeItemCreateSchema = z
  .object({
    kind: z.enum(HOME_ITEM_KINDS),
    status: z.enum(HOME_ITEM_STATUSES).default('draft'),
    title: requiredTrimmedString(180),
    eyebrow: nullableTrimmedString(80),
    summary: requiredTrimmedString(1200),
    body: nullableTrimmedString(12000),
    image_url: nullableUrl,
    link_url: nullableUrl,
    cta_label: nullableTrimmedString(80),
    cta_action: z.enum(HOME_CTA_ACTIONS).optional(),
    source_url: nullableUrl,
    source_name: nullableTrimmedString(120),
    source_domain: nullableTrimmedString(120),
    source_published_at: nullableDateTime,
    metadata_json: z.record(z.string(), z.unknown()).nullable().optional().default(null),
    linked_deal_id: z
      .union([z.string().uuid(), z.null(), z.undefined()])
      .transform((value) => (typeof value === 'string' ? value : null)),
    featured_slot: nullableInteger,
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
    starts_at: nullableDateTime,
    ends_at: nullableDateTime,
    is_pinned: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if (value.featured_slot != null && (value.featured_slot < 1 || value.featured_slot > 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'featured_slot must be between 1 and 3',
        path: ['featured_slot'],
      })
    }

    if (value.kind === 'news_article' && !value.source_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'News articles require a source_url',
        path: ['source_url'],
      })
    }

    if ((value.kind === 'hero' || value.kind === 'news_article') && value.featured_slot != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${value.kind} items cannot use featured slots`,
        path: ['featured_slot'],
      })
    }

    if (
      value.cta_action === 'interest_capture' &&
      !['opportunity_teaser', 'event'].includes(value.kind)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'interest_capture is only allowed for opportunity teasers and events',
        path: ['cta_action'],
      })
    }

    if (value.cta_action === 'open_link' && !(value.link_url || value.source_url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'open_link CTA requires link_url or source_url',
        path: ['link_url'],
      })
    }

    if (value.starts_at && value.ends_at && new Date(value.starts_at) >= new Date(value.ends_at)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ends_at must be later than starts_at',
        path: ['ends_at'],
      })
    }
  })

export const homeItemPatchSchema = z
  .object({
    status: z.enum(HOME_ITEM_STATUSES).optional(),
    title: z.string().optional(),
    eyebrow: z.union([z.string(), z.null()]).optional(),
    summary: z.string().optional(),
    body: z.union([z.string(), z.null()]).optional(),
    image_url: z.union([z.string(), z.null()]).optional(),
    link_url: z.union([z.string(), z.null()]).optional(),
    cta_label: z.union([z.string(), z.null()]).optional(),
    cta_action: z.enum(HOME_CTA_ACTIONS).optional(),
    source_url: z.union([z.string(), z.null()]).optional(),
    source_name: z.union([z.string(), z.null()]).optional(),
    source_domain: z.union([z.string(), z.null()]).optional(),
    source_published_at: z.union([z.string(), z.null()]).optional(),
    metadata_json: z.record(z.string(), z.unknown()).nullable().optional(),
    linked_deal_id: z.union([z.string(), z.null()]).optional(),
    featured_slot: z.union([z.number(), z.null()]).optional(),
    sort_order: z.coerce.number().optional(),
    starts_at: z.union([z.string(), z.null()]).optional(),
    ends_at: z.union([z.string(), z.null()]).optional(),
    is_pinned: z.boolean().optional(),
  })
  .strict()

export const homeItemsReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        sort_order: z.coerce.number().int().min(0).max(9999),
        featured_slot: z.coerce.number().int().min(1).max(3).nullable().optional(),
      })
    )
    .min(1),
})

export const homeItemPublishSchema = z.object({
  status: z.enum(HOME_ITEM_STATUSES),
})

export const homeIngestLinkSchema = z.object({
  url: z.string().trim().url(),
})

export const homeInterestCreateSchema = z.object({
  note: nullableTrimmedString(2000).optional().default(null),
})

export const homeInterestPatchSchema = z.object({
  status: z.enum(HOME_INTEREST_STATUSES).optional(),
  admin_note: nullableTrimmedString(2000).optional(),
})

export type HomeItemCreateInput = z.infer<typeof homeItemCreateSchema>
export type HomeItemPatchInput = z.infer<typeof homeItemPatchSchema>
export type HomeInterestPatchInput = z.infer<typeof homeInterestPatchSchema>

export function normalizeHomeItemInput(input: HomeItemCreateInput) {
  const normalizedKind = input.kind as HomeItemKind
  const normalizedStatus = input.status as HomeItemStatus
  let ctaAction = (input.cta_action ?? 'none') as HomeCtaAction
  let ctaLabel = input.cta_label
  let linkUrl = input.link_url

  if (normalizedKind === 'hero' && input.cta_action == null) {
    ctaAction = 'go_to_dashboard'
    ctaLabel = ctaLabel ?? 'Go to Dashboard'
  }

  if (normalizedKind === 'news_article') {
    linkUrl = linkUrl ?? input.source_url
    if (input.cta_action == null || input.cta_action === 'none') {
      ctaAction = 'open_link'
    }
    ctaLabel = ctaLabel ?? 'Read article'
  }

  if (
    ['opportunity_teaser', 'event'].includes(normalizedKind) &&
    (input.cta_action == null || input.cta_action === 'none')
  ) {
    ctaAction = 'interest_capture'
    ctaLabel =
      ctaLabel ?? (normalizedKind === 'event' ? 'Keep me informed' : "I'm interested")
  }

  return {
    ...input,
    kind: normalizedKind,
    status: normalizedStatus,
    cta_action: ctaAction,
    cta_label: ctaLabel,
    link_url: linkUrl,
  }
}
