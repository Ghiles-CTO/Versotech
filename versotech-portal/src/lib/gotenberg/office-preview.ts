const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://gotenberg:3000'

const OFFICE_PREVIEW_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx', 'csv'])

const OFFICE_PREVIEW_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
]

const FALLBACK_MIME_TYPES: Record<string, string> = {
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
}

export function isOfficePreviewConvertible(
  fileName: string | null | undefined,
  mimeType?: string | null
): boolean {
  const extension = fileName?.split('.').pop()?.toLowerCase() || ''
  const normalizedMimeType = (mimeType || '').toLowerCase()

  return (
    OFFICE_PREVIEW_EXTENSIONS.has(extension) ||
    OFFICE_PREVIEW_MIME_TYPES.includes(normalizedMimeType)
  )
}

export function getPreviewPdfFileName(fileName: string | null | undefined): string {
  const safeFileName = (fileName || 'document').replace(/[^\w.\-_ ]/g, '_')
  const trimmedName = safeFileName.replace(/\.[^.]+$/, '')
  return `${trimmedName || 'document'}.pdf`
}

export async function convertOfficePreviewToPdf(args: {
  bytes: Uint8Array
  fileName: string
  mimeType?: string | null
}): Promise<Uint8Array> {
  const { bytes, fileName, mimeType } = args
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  const contentType = mimeType || FALLBACK_MIME_TYPES[extension] || 'application/octet-stream'
  const normalizedBuffer = bytes.slice().buffer as ArrayBuffer

  const formData = new FormData()
  const blob = new Blob([normalizedBuffer], { type: contentType })
  formData.append('files', blob, fileName)

  const response = await fetch(`${GOTENBERG_URL}/forms/libreoffice/convert`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `Office preview conversion failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
    )
  }

  return new Uint8Array(await response.arrayBuffer())
}
