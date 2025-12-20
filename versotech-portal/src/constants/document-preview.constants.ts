/**
 * Document Preview Configuration
 * Defines limits and supported types for the document preview system
 */

export const PREVIEW_CONFIG = {
  /** Maximum file size for preview (10MB) */
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,

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
  ] as const,
} as const

/**
 * User-friendly error messages for document preview
 */
export const PREVIEW_ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File is too large for preview (maximum 10MB). Please download to view.',
  UNSUPPORTED_TYPE: 'Preview not supported for this file type. Please download to view.',
  LOAD_FAILED: 'Failed to load document preview. Please try downloading instead.',
  UNAUTHORIZED: 'You do not have permission to view this document.',
  NOT_FOUND: 'Document not found or has been deleted.',
  NETWORK_ERROR: 'Network error while loading preview. Please check your connection.',
  INVALID_URL: 'Invalid preview URL received. Please try again.',
  TIMEOUT: 'Preview loading timed out. The file may be too large or your connection too slow.',
} as const

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
 * Check if a file is within size limits for preview
 */
export function isWithinSizeLimit(sizeBytes: number): boolean {
  return sizeBytes <= PREVIEW_CONFIG.MAX_FILE_SIZE_BYTES
}
