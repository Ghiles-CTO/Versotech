import type { HomeFeedResponse, HomeItem } from '@/types/home'

function timestampForSort(value?: string | null) {
  if (!value) return 0
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

export function isHomeItemActive(item: Pick<HomeItem, 'starts_at' | 'ends_at'>, now = new Date()) {
  const current = now.getTime()
  const startsAt = item.starts_at ? new Date(item.starts_at).getTime() : Number.NEGATIVE_INFINITY
  const endsAt = item.ends_at ? new Date(item.ends_at).getTime() : Number.POSITIVE_INFINITY
  return startsAt <= current && endsAt > current
}

export function sortHomeItems(items: HomeItem[]) {
  return [...items].sort((left, right) => {
    if (left.is_pinned !== right.is_pinned) {
      return left.is_pinned ? -1 : 1
    }

    const leftFeatured = left.featured_slot ?? Number.MAX_SAFE_INTEGER
    const rightFeatured = right.featured_slot ?? Number.MAX_SAFE_INTEGER
    if (leftFeatured !== rightFeatured) {
      return leftFeatured - rightFeatured
    }

    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order
    }

    const leftTimestamp = Math.max(
      timestampForSort(left.source_published_at),
      timestampForSort(left.starts_at),
      timestampForSort(left.created_at)
    )
    const rightTimestamp = Math.max(
      timestampForSort(right.source_published_at),
      timestampForSort(right.starts_at),
      timestampForSort(right.created_at)
    )

    return rightTimestamp - leftTimestamp
  })
}

export function buildHomeFeedResponse(items: HomeItem[]): HomeFeedResponse {
  const sorted = sortHomeItems(items)
  const hero = sorted.find((item) => item.kind === 'hero') ?? null
  const featuredItems = sorted
    .filter((item) => item.kind !== 'hero' && item.kind !== 'news_article' && item.featured_slot != null)
    .slice(0, 3)
  const feedItems = sorted.filter(
    (item) => item.kind !== 'hero' && item.kind !== 'news_article' && item.featured_slot == null
  )
  const marketNews = sorted.filter((item) => item.kind === 'news_article')

  return {
    hero,
    featuredItems,
    feedItems,
    marketNews,
    generatedAt: new Date().toISOString(),
  }
}
