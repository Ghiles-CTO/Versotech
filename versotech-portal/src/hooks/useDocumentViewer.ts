'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { DocumentService } from '@/services/document.service'
import { DocumentReference, DocumentError } from '@/types/document-viewer.types'
import {
  PREVIEW_CONFIG,
  PREVIEW_ERROR_MESSAGES,
  isPreviewableExtension,
  isPreviewableMimeType,
  isWithinSizeLimit,
} from '@/constants/document-preview.constants'

/**
 * Hook for managing document preview state and operations
 */
export function useDocumentViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [document, setDocument] = useState<DocumentReference | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Validate if document can be previewed
   */
  const validateDocument = (doc: DocumentReference): string | null => {
    // Check file size
    if (doc.file_size_bytes && !isWithinSizeLimit(doc.file_size_bytes)) {
      return PREVIEW_ERROR_MESSAGES.FILE_TOO_LARGE
    }

    // Check file type by extension
    const fileName = doc.file_name || doc.name || ''
    const canPreviewByExtension = fileName ? isPreviewableExtension(fileName) : false

    // Check file type by MIME type if available
    const mimeType = doc.mime_type || ''
    const canPreviewByMimeType = mimeType
      ? isPreviewableMimeType(mimeType)
      : true // If no MIME type, rely on extension

    if (!canPreviewByExtension && !canPreviewByMimeType) {
      return PREVIEW_ERROR_MESSAGES.UNSUPPORTED_TYPE
    }

    return null // Valid for preview
  }

  /**
   * Open document preview
   */
  const openPreview = useCallback(async (doc: DocumentReference, dealId?: string) => {
    // Reset state
    setError(null)
    setPreviewUrl(null)

    // Validate document
    const validationError = validateDocument(doc)
    if (validationError) {
      toast.error(validationError)
      return
    }

    // Set document and open immediately (for better UX)
    setDocument(doc)
    setIsOpen(true)
    setIsLoading(true)

    try {
      // Fetch preview URL based on document type
      const response = dealId
        ? await DocumentService.getDealDocumentPreviewUrl(dealId, doc.id)
        : await DocumentService.getPreviewUrl(doc.id)

      // Set preview URL
      setPreviewUrl(response.download_url)
      setIsLoading(false)
    } catch (err) {
      console.error('Failed to load document preview:', err)

      const errorMessage =
        err instanceof DocumentError
          ? DocumentService.getErrorMessage(err)
          : PREVIEW_ERROR_MESSAGES.LOAD_FAILED

      setError(errorMessage)
      setIsLoading(false)

      // Also show toast for immediate feedback
      toast.error(errorMessage)
    }
  }, [])

  /**
   * Close document preview
   */
  const closePreview = useCallback(() => {
    setIsOpen(false)
    // Delay cleanup to allow closing animation
    setTimeout(() => {
      setDocument(null)
      setPreviewUrl(null)
      setError(null)
      setIsLoading(false)
    }, 300)
  }, [])

  /**
   * Download document from preview
   */
  const downloadDocument = useCallback(async () => {
    if (!document) return

    try {
      // Use previewUrl if available (already fetched)
      if (previewUrl) {
        window.open(previewUrl, '_blank')
        return
      }

      // Otherwise fetch download URL
      const response = await DocumentService.getDownloadUrl(document.id)
      window.open(response.download_url, '_blank')
    } catch (err) {
      console.error('Failed to download document:', err)

      const errorMessage =
        err instanceof DocumentError
          ? DocumentService.getErrorMessage(err)
          : 'Failed to download document'

      toast.error(errorMessage)
    }
  }, [document, previewUrl])

  return {
    // State
    isOpen,
    document,
    previewUrl,
    isLoading,
    error,

    // Methods
    openPreview,
    closePreview,
    downloadDocument,
  }
}
