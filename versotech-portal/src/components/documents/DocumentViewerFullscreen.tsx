'use client'

import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, Loader2, AlertCircle, FileText, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/utils'
import { DocumentReference } from '@/types/document-viewer.types'

interface DocumentViewerFullscreenProps {
  isOpen: boolean
  document: DocumentReference | null
  previewUrl: string | null
  isLoading: boolean
  error: string | null
  onClose: () => void
  onDownload: () => void
}

/**
 * Check if a file is a PDF based on filename or URL
 */
function isPdfFile(fileName?: string | null, url?: string | null): boolean {
  if (fileName?.toLowerCase().endsWith('.pdf')) return true
  if (url?.toLowerCase().includes('.pdf')) return true
  // Supabase signed URLs have the file path in them
  if (url?.includes('deal-documents') && url?.includes('.pdf')) return true
  return false
}

/**
 * Check if a document has expired based on its expiry date
 */
function isDocumentExpired(expiryDate?: string | null): boolean {
  if (!expiryDate) return false
  return new Date(expiryDate) < new Date()
}

/**
 * Format expiry date for display
 */
function formatExpiryDate(expiryDate: string): string {
  return new Date(expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Append PDF viewer parameters to URL to fix browser rendering issues
 * - navpanes=0: Hide thumbnail sidebar (fixes Brave issue)
 * - view=FitH: Fit to width for better viewing
 * - pagemode=none: Don't show bookmarks/thumbnails
 */
function getPdfViewerUrl(url: string): string {
  // Don't add hash if URL already has one
  if (url.includes('#')) return url
  return `${url}#navpanes=0&view=FitH&pagemode=none`
}

export function DocumentViewerFullscreen({
  isOpen,
  document,
  previewUrl,
  isLoading,
  error,
  onClose,
  onDownload,
}: DocumentViewerFullscreenProps) {
  const [iframeError, setIframeError] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Track mount state for portal rendering
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Compute the final iframe URL with PDF parameters if needed
  const iframeSrc = useMemo(() => {
    if (!previewUrl) return null
    const fileName = document?.file_name || document?.name
    if (isPdfFile(fileName, previewUrl)) {
      return getPdfViewerUrl(previewUrl)
    }
    return previewUrl
  }, [previewUrl, document])

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        onDownload()
      }
    }

    if (isOpen && typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when viewer is open
      if (window.document?.body) {
        window.document.body.style.overflow = 'hidden'
      }

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        if (window.document?.body) {
          window.document.body.style.overflow = ''
        }
      }
    }
  }, [isOpen, onClose, onDownload])

  // Reset iframe error when URL changes
  useEffect(() => {
    setIframeError(false)
  }, [previewUrl])

  // Don't render until mounted (for portal) or if not open
  if (!isOpen || !mounted) return null

  // Use portal to render at body level, escaping backdrop-blur containing blocks
  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/95 overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="h-16 bg-white border-b shadow-md flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {document?.file_name || document?.name || 'Document Preview'}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {document?.type && (
                <span className="capitalize">{document.type}</span>
              )}
              {document?.file_size_bytes && (
                <>
                  <span>•</span>
                  <span>{formatFileSize(document.file_size_bytes)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
      </div>

      {/* Expired Document Banner */}
      {isDocumentExpired(document?.document_expiry_date) && (
        <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 border-b border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            This document expired on {formatExpiryDate(document!.document_expiry_date!)}
          </p>
        </div>
      )}

      {/* Main viewport */}
      <div className="flex-1 bg-gray-900 min-h-0 relative">
        {/* Loading/error states need centering */}
        {(isLoading || error || iframeError) && (
          <div className="w-full h-full flex items-center justify-center">
            {isLoading && (
              <div className="flex flex-col items-center gap-4 text-white">
                <Loader2 className="h-12 w-12 animate-spin" />
                <p className="text-lg">Loading document...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="flex flex-col items-center gap-4 text-white max-w-md mx-auto px-4">
                <AlertCircle className="h-16 w-16 text-red-400" />
                <h3 className="text-xl font-semibold">Failed to Load Preview</h3>
                <p className="text-gray-300 text-center">{error}</p>
                <Button
                  onClick={onDownload}
                  variant="secondary"
                  className="gap-2 mt-4"
                >
                  <Download className="h-4 w-4" />
                  Download Instead
                </Button>
              </div>
            )}

            {iframeError && !isLoading && !error && (
              <div className="flex flex-col items-center gap-4 text-white max-w-md mx-auto px-4">
                <AlertCircle className="h-16 w-16 text-red-400" />
                <h3 className="text-xl font-semibold">Preview Unavailable</h3>
                <p className="text-gray-300 text-center">
                  This document cannot be previewed in your browser.
                </p>
                <Button
                  onClick={onDownload}
                  variant="secondary"
                  className="gap-2 mt-4"
                >
                  <Download className="h-4 w-4" />
                  Download to View
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Iframe fills the entire viewport when ready */}
        {iframeSrc && !isLoading && !error && !iframeError && (
          <iframe
            src={iframeSrc}
            className="w-full h-full border-0"
            title="Document Preview"
            onError={() => {
              console.error('iframe failed to load preview')
              setIframeError(true)
            }}
          />
        )}

        {/* CONFIDENTIAL Watermark Overlay for watermarked documents */}
        {document?.watermark && !isLoading && !error && !iframeError && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            {/* Diagonal watermark text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="text-[100px] md:text-[140px] font-bold text-gray-400 whitespace-nowrap select-none"
                style={{
                  transform: 'rotate(-45deg)',
                  opacity: 0.08,
                  textShadow: '0 0 10px rgba(0,0,0,0.1)',
                }}
              >
                CONFIDENTIAL
              </div>
            </div>
            {/* Footer attribution */}
            <div className="absolute bottom-4 right-4 text-xs text-gray-400/50 bg-black/20 px-2 py-1 rounded select-none">
              VERSO Holdings • {document.watermark.uploaded_at
                ? new Date(document.watermark.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : 'Confidential Document'}
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm bg-black/50 px-4 py-2 rounded-full">
          Press <kbd className="px-2 py-1 bg-white/10 rounded mx-1">ESC</kbd> to close
          or <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Ctrl+D</kbd> to download
        </div>
      )}
    </div>
  )

  // Render portal to document.body to escape backdrop-blur containing blocks
  const portalTarget = typeof window !== 'undefined' ? window.document.body : null
  if (!portalTarget) return null
  return createPortal(modalContent, portalTarget)
}
