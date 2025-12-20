/**
 * Type definitions for the document viewer system
 */

/**
 * Minimal document reference needed for preview
 * Flexible to support different document sources (general docs, entity docs, deal docs, etc.)
 */
export interface DocumentReference {
  id: string
  file_name?: string | null  // Optional to support different document types
  name?: string | null       // Some documents use 'name' instead of 'file_name'
  mime_type?: string | null
  file_size_bytes?: number | null
  type?: string | null
  [key: string]: any // Allow additional properties
}

/**
 * Response from document download/preview API endpoints
 */
export interface DocumentUrlResponse {
  download_url: string
  mode?: 'preview' | 'download'
  document: {
    id: string
    name: string
    type: string
    file_key?: string
    external_url?: string
    [key: string]: any
  }
  watermark?: {
    uploaded_by?: string
    uploaded_at?: string
    document_classification?: string
    [key: string]: any
  }
  expires_in_seconds: number
}

/**
 * State shape for document viewer
 */
export interface DocumentViewerState {
  isOpen: boolean
  document: DocumentReference | null
  previewUrl: string | null
  isLoading: boolean
  error: string | null
}

/**
 * Custom error class for document operations
 */
export class DocumentError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: any
  ) {
    super(message)
    this.name = 'DocumentError'
  }
}

/**
 * Options for opening a document preview
 */
export interface PreviewOptions {
  /** Force download mode instead of preview */
  forceDownload?: boolean
  /** Custom error handler */
  onError?: (error: DocumentError) => void
  /** Success callback after preview opens */
  onSuccess?: () => void
}
