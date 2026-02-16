/**
 * URL detection and link preview utilities for the messaging system.
 */

export interface LinkPreview {
  url: string
  title: string | null
  description: string | null
  image: string | null
  favicon: string | null
  domain: string
  fetched_at: string
}

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/i

/**
 * Extract the first http/https URL from a text string.
 */
export function extractFirstUrl(text: string): string | null {
  const match = text.match(URL_REGEX)
  return match ? match[0] : null
}

/**
 * Extract the display domain from a URL.
 * e.g. "https://www.bbc.com/article" → "bbc.com"
 */
export function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
