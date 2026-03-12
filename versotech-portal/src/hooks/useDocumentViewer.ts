'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { DocumentService } from '@/services/document.service'
import { DocumentReference, DocumentError } from '@/types/document-viewer.types'
import { downloadFileFromUrl, triggerBrowserDownload } from '@/lib/browser-download'
import {
  PREVIEW_ERROR_MESSAGES,
  isPreviewableExtension,
  isPreviewableMimeType,
  isWithinSizeLimit,
  getFileTypeCategory,
  getSizeLimitLabel,
} from '@/constants/document-preview.constants'
import {
  buildOfficePreviewUrl,
  canPreviewExternalOfficeLink,
  getOfficePreviewType,
} from '@/lib/documents/office-viewer'

/**
 * Hook for managing document preview state and operations
 */
export function useDocumentViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [document, setDocument] = useState<DocumentReference | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [watermark, setWatermark] = useState<Record<string, any> | null>(null)

  // Refs for stable callbacks (avoid recreating on every state change)
  const previewUrlRef = useRef<string | null>(null)
  const dealIdRef = useRef<string | undefined>(undefined)
  const documentRef = useRef<DocumentReference | null>(null)

  /**
   * Validate if document can be previewed
   */
  const validateDocument = (doc: DocumentReference): string | null => {
    const fileName = doc.file_name || doc.name || ''
    const mimeType = doc.mime_type || ''

    // Check file size with category-aware limits
    if (doc.file_size_bytes) {
      if (!isWithinSizeLimit(doc.file_size_bytes, fileName, mimeType)) {
        const category = getFileTypeCategory(fileName, mimeType)
        const limit = getSizeLimitLabel(category)
        return `File is too large for preview (maximum ${limit}). Please download to view.`
      }
    }

    // Check file type by extension
    const canPreviewByExtension = fileName ? isPreviewableExtension(fileName) : false

    // Check file type by MIME type if available
    const canPreviewByMimeType = mimeType
      ? isPreviewableMimeType(mimeType)
      : false // If no MIME type, must fail validation

    const fileExt = fileName.split('.').pop()?.toLowerCase() || ''
    const officeExtensions = ['odt', 'ods', 'odp']
    const isOfficeDocument = officeExtensions.includes(fileExt) || (mimeType && (
      mimeType.includes('opendocument')
    ))

    if (isOfficeDocument) {
      return 'Office documents cannot be previewed. Please download to view.'
    }

    if (!canPreviewByExtension && !canPreviewByMimeType) {
      return PREVIEW_ERROR_MESSAGES.UNSUPPORTED_TYPE
    }

    return null // Valid for preview
  }

  /**
   * Open document preview
   */
  const openPreview = useCallback(async (doc: DocumentReference, dealId?: string) => {
    // Revoke previous blob URL if any
    if (previewUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    // Reset state
    setError(null)
    setPreviewUrl(null)
    previewUrlRef.current = null
    dealIdRef.current = dealId
    documentRef.current = doc

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
      const externalUrl = doc.external_url || doc.external_link
      if (!dealId && canPreviewExternalOfficeLink(externalUrl, doc.file_name || doc.name, doc.mime_type)) {
        const previewType = getOfficePreviewType(doc.file_name || doc.name, doc.mime_type)
        const embeddedPreviewUrl = buildOfficePreviewUrl(externalUrl, { hideDownload: !!dealId })

        setDocument((current) => current ? {
          ...current,
          preview_type: previewType,
          preview_strategy: 'office_embed',
        } : current)
        setPreviewUrl(embeddedPreviewUrl)
        previewUrlRef.current = embeddedPreviewUrl
        setWatermark(doc.watermark || null)
        setIsLoading(false)
        return
      }

      // Fetch preview URL based on document type
      const response = dealId
        ? await DocumentService.getDealDocumentPreviewUrl(dealId, doc.id)
        : await DocumentService.getPreviewUrl(doc.id)

      // Set preview URL and watermark data (separate state to avoid race conditions)
      setDocument((current) => {
        if (!current) return current
        return {
          ...current,
          preview_type: response.document?.type || null,
          preview_strategy: response.preview_strategy || response.document?.preview_strategy || 'direct',
        }
      })
      setPreviewUrl(response.download_url)
      previewUrlRef.current = response.download_url
      setWatermark(response.watermark || null)
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
    const urlToRevoke = previewUrlRef.current
    // Delay cleanup to allow closing animation
    setTimeout(() => {
      setDocument(null)
      if (urlToRevoke?.startsWith('blob:')) {
        URL.revokeObjectURL(urlToRevoke)
      }
      setPreviewUrl(null)
      previewUrlRef.current = null
      setError(null)
      setIsLoading(false)
      setWatermark(null)
      dealIdRef.current = undefined
      documentRef.current = null
    }, 300)
  }, [])

  /**
   * Download document from preview
   */
  const downloadDocument = useCallback(async () => {
    const doc = documentRef.current
    if (!doc) return
    const fileName = doc.file_name || doc.name || 'document.pdf'
    const originalFileType = getFileTypeCategory(fileName, doc.mime_type)
    const canReusePreviewBlob = originalFileType === 'pdf' || originalFileType === 'image'

    try {
      // For deal documents with a blob preview URL, reuse it (already watermarked)
      if (dealIdRef.current && previewUrlRef.current?.startsWith('blob:') && canReusePreviewBlob) {
        triggerBrowserDownload(previewUrlRef.current, fileName)
        return
      }

      // For deal documents without a blob preview (non-PDF), fetch download URL
      if (dealIdRef.current) {
        const response = await DocumentService.getDealDocumentDownloadUrl(
          dealIdRef.current,
          doc.id
        )
        if (response.download_url.startsWith('blob:')) {
          triggerBrowserDownload(response.download_url, fileName)
          setTimeout(() => URL.revokeObjectURL(response.download_url), 1000)
          return
        }
        await downloadFileFromUrl(response.download_url, fileName)
        return
      }

      // Non-deal docs should use the explicit download endpoint instead of the preview URL.
      const response = await DocumentService.getDownloadUrl(doc.id)
      if (response.download_url.startsWith('blob:')) {
        triggerBrowserDownload(response.download_url, fileName)
        setTimeout(() => URL.revokeObjectURL(response.download_url), 1000)
        return
      }
      await downloadFileFromUrl(response.download_url, fileName)
    } catch (err) {
      console.error('Failed to download document:', err)

      const errorMessage =
        err instanceof DocumentError
          ? DocumentService.getErrorMessage(err)
          : 'Failed to download document'

      toast.error(errorMessage)
    }
  }, [])

  return {
    // State
    isOpen,
    document,
    previewUrl,
    isLoading,
    error,
    watermark,

    // Methods
    openPreview,
    closePreview,
    downloadDocument,
  }
}
