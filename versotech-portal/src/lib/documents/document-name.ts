export interface DocumentNameSource {
  display_name?: string | null
  file_name?: string | null
  original_file_name?: string | null
  name?: string | null
  file_key?: string | null
}

function cleanFileName(name: string): string {
  let cleaned = name.trim()
  if (!cleaned) return 'Untitled'

  // Strip common machine-generated prefixes (UUIDs / long numeric IDs)
  cleaned = cleaned.replace(
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}[-_]?/i,
    ''
  )
  cleaned = cleaned.replace(/^\d{8,}[-_]/, '')

  // Improve readability for underscores
  cleaned = cleaned.replace(/_+/g, ' ')
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned || name
}

export function getDocumentDisplayName(doc: DocumentNameSource): string {
  const raw = (
    doc.display_name ||
    doc.file_name ||
    doc.original_file_name ||
    doc.name ||
    doc.file_key ||
    ''
  ).trim()

  if (!raw) return 'Untitled'

  const lastSegment = raw.includes('/')
    ? raw.split('/').filter(Boolean).pop() || raw
    : raw

  return cleanFileName(lastSegment)
}
