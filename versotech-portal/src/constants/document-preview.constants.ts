/**
 * Document Preview Configuration
 * Defines limits and supported types for the document preview system
 */

export type FileTypeCategory = 'pdf' | 'image' | 'video' | 'audio' | 'excel' | 'docx' | 'text' | 'unsupported'

/** Per-type size limits in bytes */
export const SIZE_LIMITS: Record<FileTypeCategory, number> = {
  pdf: 100 * 1024 * 1024,       // 100MB
  image: 50 * 1024 * 1024,      // 50MB
  video: 1024 * 1024 * 1024,    // 1GB
  audio: 200 * 1024 * 1024,     // 200MB
  excel: 50 * 1024 * 1024,      // 50MB
  docx: 50 * 1024 * 1024,       // 50MB
  text: 25 * 1024 * 1024,       // 25MB
  unsupported: 0,
}

export const PREVIEW_CONFIG = {
  /** Maximum file size for preview (100MB) - legacy default */
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024,

  /** Timeout for iframe loading (30 seconds) */
  IFRAME_TIMEOUT_MS: 30000,

  /** Supported MIME types for preview */
  SUPPORTED_MIME_TYPES: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'text/plain',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ] as const,

  /** Supported file extensions for preview */
  SUPPORTED_EXTENSIONS: [
    'pdf',
    'png',
    'jpeg',
    'jpg',
    'gif',
    'webp',
    'txt',
    'text',
    'mp4',
    'webm',
    'mp3',
    'wav',
    'xlsx',
    'xls',
    'csv',
    'docx',
  ] as const,
} as const

/**
 * User-friendly error messages for document preview
 */
export const PREVIEW_ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File is too large for preview. Please download to view.',
  UNSUPPORTED_TYPE: 'Preview not supported for this file type. Please download to view.',
  LOAD_FAILED: 'Failed to load document preview. Please try downloading instead.',
  UNAUTHORIZED: 'You do not have permission to view this document.',
  NOT_FOUND: 'Document not found or has been deleted.',
  NETWORK_ERROR: 'Network error while loading preview. Please check your connection.',
  INVALID_URL: 'Invalid preview URL received. Please try again.',
  TIMEOUT: 'Preview loading timed out. The file may be too large or your connection too slow.',
} as const

/**
 * Determine the file type category from a filename and/or MIME type
 */
export function getFileTypeCategory(fileName?: string | null, mimeType?: string | null): FileTypeCategory {
  const ext = fileName?.split('.').pop()?.toLowerCase() || ''
  const mime = (mimeType || '').toLowerCase()

  // PDF
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf'

  // Images
  if (['png', 'jpeg', 'jpg', 'gif', 'webp'].includes(ext) || mime.startsWith('image/')) return 'image'

  // Video
  if (['mp4', 'webm'].includes(ext) || mime.startsWith('video/')) return 'video'

  // Audio
  if (['mp3', 'wav'].includes(ext) || mime.startsWith('audio/')) return 'audio'

  // Excel / CSV
  if (['xlsx', 'xls', 'csv'].includes(ext) || mime.includes('spreadsheet') || mime.includes('ms-excel') || mime === 'text/csv') return 'excel'

  // Word documents
  if (['docx'].includes(ext) || mime.includes('wordprocessingml')) return 'docx'

  // Plain text
  if (['txt', 'text'].includes(ext) || mime === 'text/plain') return 'text'

  return 'unsupported'
}

/**
 * Check if a file extension is supported for preview
 */
export function isPreviewableExtension(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase()
  if (!extension) return false

  return (PREVIEW_CONFIG.SUPPORTED_EXTENSIONS as readonly string[]).includes(extension)
}

/**
 * Check if a MIME type is supported for preview
 */
export function isPreviewableMimeType(mimeType: string): boolean {
  return (PREVIEW_CONFIG.SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Check if a file is within size limits for preview (category-aware)
 */
export function isWithinSizeLimit(sizeBytes: number, fileName?: string | null, mimeType?: string | null): boolean {
  const category = getFileTypeCategory(fileName, mimeType)
  const limit = SIZE_LIMITS[category] || PREVIEW_CONFIG.MAX_FILE_SIZE_BYTES
  return sizeBytes <= limit
}

/**
 * Get a human-readable size limit for a file type category
 */
export function getSizeLimitLabel(category: FileTypeCategory): string {
  const bytes = SIZE_LIMITS[category]
  if (bytes >= 1024 * 1024) return `${bytes / (1024 * 1024)}MB`
  return `${bytes / 1024}KB`
}
