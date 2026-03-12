import ogs from 'open-graph-scraper'

import { extractDomain } from '@/lib/messaging/url-utils'
import type { MarketingLinkMetadata } from '@/types/dashboard-marketing'

/**
 * Fetch link metadata using the same proven approach as the messaging link preview.
 * Keeps it simple: ogTitle, ogDescription, ogImage, favicon — no obscure fallbacks.
 */
export async function fetchMarketingLinkMetadata(url: string): Promise<MarketingLinkMetadata> {
  const { result } = await ogs({
    url,
    timeout: 5000,
    fetchOptions: {
      headers: {
        'User-Agent': 'VersoBot/1.0 (Link Preview)',
      },
    },
  })

  const title = result.ogTitle || null
  const summary = result.ogDescription || null
  const ogImage = result.ogImage?.[0]?.url || null
  const rawFavicon = result.favicon || null

  let favicon: string | null = null
  if (rawFavicon) {
    if (rawFavicon.startsWith('http')) {
      favicon = rawFavicon
    } else {
      try {
        favicon = new URL(rawFavicon, url).href
      } catch {
        favicon = null
      }
    }
  }

  return {
    title,
    summary,
    imageUrl: ogImage,
    externalUrl: url,
    linkDomain: extractDomain(url),
    sourcePublishedAt:
      (typeof result.articlePublishedTime === 'string' && result.articlePublishedTime)
        ? new Date(result.articlePublishedTime).toISOString()
        : null,
    metadata: {
      favicon,
      ogType: result.ogType || null,
      sourceName: result.ogSiteName || null,
    },
  }
}
