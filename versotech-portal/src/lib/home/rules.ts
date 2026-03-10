import type { SupabaseClient } from '@supabase/supabase-js'

type SchedulableHomeItem = {
  id?: string | null
  kind: string
  status: string
  featured_slot?: number | null
  starts_at?: string | null
  ends_at?: string | null
}

function timestampOrDefault(value: string | null | undefined, fallback: number) {
  if (!value) return fallback
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? fallback : parsed
}

function windowsOverlap(a: SchedulableHomeItem, b: SchedulableHomeItem) {
  const aStart = timestampOrDefault(a.starts_at, Number.NEGATIVE_INFINITY)
  const aEnd = timestampOrDefault(a.ends_at, Number.POSITIVE_INFINITY)
  const bStart = timestampOrDefault(b.starts_at, Number.NEGATIVE_INFINITY)
  const bEnd = timestampOrDefault(b.ends_at, Number.POSITIVE_INFINITY)

  return aStart < bEnd && bStart < aEnd
}

export async function assertHomeItemConflicts(
  supabase: SupabaseClient<any>,
  item: SchedulableHomeItem,
  options?: { excludeId?: string | null }
) {
  if (item.status !== 'published') {
    return
  }

  const excludeId = options?.excludeId ?? item.id ?? null

  if (item.kind === 'hero') {
    const heroQuery = supabase
      .from('home_items')
      .select('id, kind, status, starts_at, ends_at, title')
      .eq('kind', 'hero')
      .eq('status', 'published')

    if (excludeId) {
      heroQuery.neq('id', excludeId)
    }

    const { data: heroes, error } = await heroQuery

    if (error) {
      throw new Error(`Failed to validate hero conflicts: ${error.message}`)
    }

    const overlappingHero = (heroes ?? []).find((hero) => windowsOverlap(item, hero))
    if (overlappingHero) {
      throw new Error('Another published hero overlaps this schedule window')
    }
  }

  if (item.featured_slot != null) {
    const slotQuery = supabase
      .from('home_items')
      .select('id, kind, status, starts_at, ends_at, featured_slot, title')
      .eq('featured_slot', item.featured_slot)
      .eq('status', 'published')

    if (excludeId) {
      slotQuery.neq('id', excludeId)
    }

    const { data: featuredItems, error } = await slotQuery

    if (error) {
      throw new Error(`Failed to validate featured slot conflicts: ${error.message}`)
    }

    const overlappingFeatured = (featuredItems ?? []).find((existing) => windowsOverlap(item, existing))
    if (overlappingFeatured) {
      throw new Error(`Featured slot ${item.featured_slot} already has an overlapping published item`)
    }
  }
}
