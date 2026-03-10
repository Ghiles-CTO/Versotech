import ogs from 'open-graph-scraper'

import { extractDomain } from '@/lib/messaging/url-utils'

export interface HomeLinkMetadata {
  sourceUrl: string
  sourceName: string | null
  sourceDomain: string
  title: string | null
  summary: string | null
  imageUrl: string | null
  publishedAt: string | null
  metadata: Record<string, unknown>
}

function normalizeMaybeUrl(baseUrl: string, value: string | undefined | null) {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  try {
    return new URL(value, baseUrl).href
  } catch {
    return null
  }
}

export async function fetchHomeLinkMetadata(url: string): Promise<HomeLinkMetadata> {
  const { result } = await ogs({
    url,
    timeout: 5000,
    fetchOptions: {
      headers: {
        'User-Agent': 'VersoBot/1.0 (Home Link Ingest)',
      },
    },
  })

  const sourceDomain = extractDomain(url)
  const title =
    result.ogTitle ||
    result.twitterTitle ||
    result.dcTitle ||
    null
  const summary =
    result.ogDescription ||
    result.twitterDescription ||
    result.dcDescription ||
    null
  const imageUrl =
    normalizeMaybeUrl(url, result.ogImage?.[0]?.url) ||
    normalizeMaybeUrl(url, result.twitterImage?.[0]?.url) ||
    null
  const sourceName =
    result.ogSiteName ||
    result.articlePublisher ||
    result.ogArticlePublisher ||
    result.dcPublisher ||
    sourceDomain
  const publishedAt =
    (typeof result.articlePublishedTime === 'string' && result.articlePublishedTime) ||
    (typeof result.ogArticlePublishedTime === 'string' && result.ogArticlePublishedTime) ||
    (typeof result.articlePublishedDate === 'string' && result.articlePublishedDate) ||
    (typeof result.publishedTime === 'string' && result.publishedTime) ||
    null

  return {
    sourceUrl: url,
    sourceName,
    sourceDomain,
    title,
    summary,
    imageUrl,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    metadata: {
      favicon: normalizeMaybeUrl(url, result.favicon || null),
      ogType: result.ogType || null,
      ogLocale: result.ogLocale || null,
      author: result.author || null,
    },
  }
}
