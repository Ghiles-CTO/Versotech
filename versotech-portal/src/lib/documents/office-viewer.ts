const WORD_EXTENSIONS = new Set(['doc', 'docx'])
const SPREADSHEET_EXTENSIONS = new Set(['xls', 'xlsx', 'csv'])
const PRESENTATION_EXTENSIONS = new Set(['ppt', 'pptx'])

const WORD_MIME_MARKERS = ['msword', 'wordprocessingml']
const SPREADSHEET_MIME_MARKERS = ['ms-excel', 'spreadsheetml', 'text/csv']
const PRESENTATION_MIME_MARKERS = ['ms-powerpoint', 'presentationml']

const MICROSOFT_FILE_HOSTS = ['sharepoint.com', 'onedrive.live.com', '1drv.ms']

export type OfficePreviewType = 'docx' | 'excel' | 'presentation'

export function getOfficePreviewType(
  fileName?: string | null,
  mimeType?: string | null
): OfficePreviewType | null {
  const extension = fileName?.split('.').pop()?.toLowerCase() || ''
  const normalizedMimeType = (mimeType || '').toLowerCase()

  if (
    WORD_EXTENSIONS.has(extension) ||
    WORD_MIME_MARKERS.some((marker) => normalizedMimeType.includes(marker))
  ) {
    return 'docx'
  }

  if (
    SPREADSHEET_EXTENSIONS.has(extension) ||
    SPREADSHEET_MIME_MARKERS.some((marker) => normalizedMimeType.includes(marker))
  ) {
    return 'excel'
  }

  if (
    PRESENTATION_EXTENSIONS.has(extension) ||
    PRESENTATION_MIME_MARKERS.some((marker) => normalizedMimeType.includes(marker))
  ) {
    return 'presentation'
  }

  return null
}

export function isOfficePreviewSupported(
  fileName?: string | null,
  mimeType?: string | null
): boolean {
  return getOfficePreviewType(fileName, mimeType) !== null
}

export function isMicrosoftHostedOfficeLink(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.toLowerCase()
    return MICROSOFT_FILE_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
  } catch {
    return false
  }
}

export function canPreviewExternalOfficeLink(
  url: string | null | undefined,
  fileName?: string | null,
  mimeType?: string | null
): boolean {
  if (!url) return false
  if (!isOfficePreviewSupported(fileName, mimeType)) return false
  return isMicrosoftHostedOfficeLink(url)
}

function buildMicrosoftHostedEmbedUrl(url: string, hideDownload: boolean): string {
  const parsedUrl = new URL(url)

  parsedUrl.searchParams.delete('download')
  parsedUrl.searchParams.set('web', '1')
  parsedUrl.searchParams.set('action', 'embedview')
  parsedUrl.searchParams.set('wdHideHeaders', 'true')
  parsedUrl.searchParams.set('wdInConfigurator', 'true')

  if (hideDownload) {
    parsedUrl.searchParams.set('wdDownloadButton', 'false')
  }

  return parsedUrl.toString()
}

function buildOfficeAppsEmbedUrl(sourceUrl: string): string {
  const embedUrl = new URL('https://view.officeapps.live.com/op/embed.aspx')
  embedUrl.searchParams.set('src', sourceUrl)
  return embedUrl.toString()
}

export function buildOfficePreviewUrl(
  sourceUrl: string,
  options?: { hideDownload?: boolean }
): string {
  const hideDownload = options?.hideDownload ?? false

  if (isMicrosoftHostedOfficeLink(sourceUrl)) {
    return buildMicrosoftHostedEmbedUrl(sourceUrl, hideDownload)
  }

  return buildOfficeAppsEmbedUrl(sourceUrl)
}
