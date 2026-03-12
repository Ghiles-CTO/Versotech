import { z } from 'zod'

import {
  MARKETING_CARD_MEDIA_TYPES,
  MARKETING_CARD_STATUSES,
  MARKETING_CARD_TYPES,
  type MarketingCardType,
} from '@/types/dashboard-marketing'

const nullableTrimmedString = (max: number) =>
  z.union([z.string(), z.null(), z.undefined()]).transform((value) => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length ? trimmed.slice(0, max) : null
  })

const requiredTrimmedString = (max: number) => z.string().trim().min(1).max(max)

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

export const marketingCardCreateSchema = z
  .object({
    card_type: z.enum(MARKETING_CARD_TYPES),
    status: z.enum(MARKETING_CARD_STATUSES).default('draft'),
    title: requiredTrimmedString(180),
    summary: requiredTrimmedString(1200),
    media_type: z.enum(MARKETING_CARD_MEDIA_TYPES),
    image_url: nullableUrl,
    image_storage_path: nullableTrimmedString(500),
    video_url: nullableUrl,
    video_storage_path: nullableTrimmedString(500),
    external_url: nullableUrl,
    link_domain: nullableTrimmedString(120),
    source_published_at: nullableDateTime,
    metadata_json: z
      .record(z.string(), z.unknown())
      .nullable()
      .optional()
      .default(null),
    cta_enabled: z.boolean().optional(),
    cta_label: nullableTrimmedString(60),
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  })
  .superRefine((value, ctx) => {
    if (
      value.card_type !== 'news' &&
      value.media_type === 'image' &&
      !value.image_url
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Image cards require an image.',
        path: ['image_url'],
      })
    }

    if (value.card_type !== 'news' && value.media_type === 'video') {
      if (!value.video_url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Video cards require a video.',
          path: ['video_url'],
        })
      }
      if (!value.image_url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Video cards require a preview image.',
          path: ['image_url'],
        })
      }
    }

    if (
      value.card_type !== 'news' &&
      value.media_type === 'link' &&
      !value.external_url
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Link cards require an external URL.',
        path: ['external_url'],
      })
    }

    if (value.card_type === 'news' && !value.external_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'News cards require an article URL.',
        path: ['external_url'],
      })
    }
  })

export const marketingCardPatchSchema = z
  .object({
    card_type: z.enum(MARKETING_CARD_TYPES).optional(),
    status: z.enum(MARKETING_CARD_STATUSES).optional(),
    title: z.string().optional(),
    summary: z.string().optional(),
    media_type: z.enum(MARKETING_CARD_MEDIA_TYPES).optional(),
    image_url: z.union([z.string(), z.null()]).optional(),
    image_storage_path: z.union([z.string(), z.null()]).optional(),
    video_url: z.union([z.string(), z.null()]).optional(),
    video_storage_path: z.union([z.string(), z.null()]).optional(),
    external_url: z.union([z.string(), z.null()]).optional(),
    link_domain: z.union([z.string(), z.null()]).optional(),
    source_published_at: z.union([z.string(), z.null()]).optional(),
    metadata_json: z.record(z.string(), z.unknown()).nullable().optional(),
    cta_enabled: z.boolean().optional(),
    cta_label: z.union([z.string(), z.null()]).optional(),
    sort_order: z.coerce.number().int().min(0).max(9999).optional(),
  })
  .strict()

export const marketingCardsReorderSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1),
})

export const marketingIngestLinkSchema = z.object({
  url: z.string().trim().url(),
})

export const marketingInterestSchema = z.object({
  investorId: z.string().uuid(),
})

export type MarketingCardCreateInput = z.infer<typeof marketingCardCreateSchema>

export function normalizeMarketingCardInput(input: MarketingCardCreateInput) {
  const cardType = input.card_type as MarketingCardType
  const mediaType = cardType === 'news' ? 'link' : input.media_type
  const ctaEnabled = input.cta_enabled ?? (cardType === 'news' ? false : true)

  let ctaLabel = input.cta_label

  if (cardType === 'opportunity' || cardType === 'event') {
    ctaLabel = "I'm interested"
  }

  if (cardType === 'news' && ctaEnabled && !ctaLabel) {
    ctaLabel = 'Open'
  }

  return {
    ...input,
    media_type: mediaType,
    video_url: mediaType === 'video' ? input.video_url : null,
    video_storage_path: mediaType === 'video' ? input.video_storage_path : null,
    cta_enabled: ctaEnabled,
    cta_label: ctaEnabled ? ctaLabel : null,
    link_domain: input.link_domain,
    external_url: input.external_url,
  }
}
