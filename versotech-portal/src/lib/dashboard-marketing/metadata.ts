import ogs from 'open-graph-scraper'

import { extractDomain } from '@/lib/messaging/url-utils'
import type { MarketingLinkMetadata } from '@/types/dashboard-marketing'

function normalizeMaybeUrl(baseUrl: string, value: string | undefined | null) {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) return value

  try {
    return new URL(value, baseUrl).href
  } catch {
    return null
  }
}

export async function fetchMarketingLinkMetadata(url: string): Promise<MarketingLinkMetadata> {
  const { result } = await ogs({
    url,
    timeout: 5000,
    fetchOptions: {
      headers: {
        'User-Agent': 'VersoBot/1.0 (Marketing Link Ingest)',
      },
    },
  })

  const title = result.ogTitle || result.twitterTitle || result.dcTitle || null
  const summary =
    result.ogDescription ||
    result.twitterDescription ||
    result.dcDescription ||
    null
  const imageUrl =
    normalizeMaybeUrl(url, result.ogImage?.[0]?.url) ||
    normalizeMaybeUrl(url, result.twitterImage?.[0]?.url) ||
    null
  const linkDomain = extractDomain(url)
  const publishedAt =
    (typeof result.articlePublishedTime === 'string' && result.articlePublishedTime) ||
    (typeof result.ogArticlePublishedTime === 'string' && result.ogArticlePublishedTime) ||
    (typeof result.articlePublishedDate === 'string' && result.articlePublishedDate) ||
    null

  return {
    title,
    summary,
    imageUrl,
    externalUrl: url,
    linkDomain,
    sourcePublishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    metadata: {
      favicon: normalizeMaybeUrl(url, result.favicon || null),
      ogType: result.ogType || null,
      ogLocale: result.ogLocale || null,
      sourceName: result.ogSiteName || result.articlePublisher || null,
      author: result.author || null,
    },
  }
}
