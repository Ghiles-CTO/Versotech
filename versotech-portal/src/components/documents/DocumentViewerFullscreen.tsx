'use client'

import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, Loader2, AlertCircle, FileText, AlertTriangle, FileImage, FileVideo2, Music, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/utils'
import { DocumentReference } from '@/types/document-viewer.types'
import { getFileTypeCategory, type FileTypeCategory } from '@/constants/document-preview.constants'
import { ExcelPreview } from './ExcelPreview'
import { DocxPreview } from './DocxPreview'
import { PdfCanvasViewer } from './PdfCanvasViewer'

interface DocumentViewerFullscreenProps {
  isOpen: boolean
  document: DocumentReference | null
  previewUrl: string | null
  isLoading: boolean
  error: string | null
  onClose: () => void
  onDownload: () => void
  hideDownload?: boolean
  watermark?: Record<string, any> | null
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
 * Get toolbar icon based on file type
 */
function getToolbarIcon(fileType: FileTypeCategory) {
  switch (fileType) {
    case 'image': return FileImage
    case 'video': return FileVideo2
    case 'audio': return Music
    case 'excel': return FileSpreadsheet
    default: return FileText
  }
}

export function DocumentViewerFullscreen({
  isOpen,
  document,
  previewUrl,
  isLoading,
  error,
  onClose,
  onDownload,
  hideDownload = false,
  watermark: watermarkProp,
}: DocumentViewerFullscreenProps) {
  const [contentError, setContentError] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Track mount state for portal rendering
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Determine file type category
  const fileType = useMemo<FileTypeCategory>(() => {
    const fileName = document?.file_name || document?.name
    const mimeType = document?.mime_type || document?.file_type
    return getFileTypeCategory(fileName, mimeType)
  }, [document])

  const viewerUrl = previewUrl ?? null

  const ToolbarIcon = getToolbarIcon(fileType)

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        if (!hideDownload) onDownload()
      }
    }

    if (isOpen && typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown)
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

  // Reset content error when URL changes
  useEffect(() => {
    setContentError(false)
  }, [previewUrl])

  // Don't render until mounted (for portal) or if not open
  if (!isOpen || !mounted) return null

  const showContent = viewerUrl && !isLoading && !error && !contentError

  // Use portal to render at body level, escaping backdrop-blur containing blocks
  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/95 overflow-hidden flex flex-col" onContextMenu={(e) => e.preventDefault()}>
      {/* Toolbar */}
      <div className="h-16 bg-white border-b shadow-md flex items-center justify-between px-6 flex-shrink-0 text-gray-900">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <ToolbarIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
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
          {!hideDownload && (
            <Button
              size="sm"
              onClick={onDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-2 text-gray-900"
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
        {/* Loading/error states */}
        {(isLoading || error || contentError) && (
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
                {!hideDownload && (
                  <Button
                    onClick={onDownload}
                    variant="secondary"
                    className="gap-2 mt-4"
                  >
                    <Download className="h-4 w-4" />
                    Download Instead
                  </Button>
                )}
              </div>
            )}

            {contentError && !isLoading && !error && (
              <div className="flex flex-col items-center gap-4 text-white max-w-md mx-auto px-4">
                <AlertCircle className="h-16 w-16 text-red-400" />
                <h3 className="text-xl font-semibold">Preview Unavailable</h3>
                <p className="text-gray-300 text-center">
                  This document cannot be previewed in your browser.
                </p>
                {!hideDownload && (
                  <Button
                    onClick={onDownload}
                    variant="secondary"
                    className="gap-2 mt-4"
                  >
                    <Download className="h-4 w-4" />
                    Download to View
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content area - conditional rendering by file type */}
        {showContent && fileType === 'pdf' && (
          <PdfCanvasViewer
            url={viewerUrl}
            onError={() => setContentError(true)}
          />
        )}

        {showContent && fileType === 'image' && (
          <div className="w-full h-full flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewerUrl}
              alt={document?.file_name || document?.name || 'Image preview'}
              className="max-w-full max-h-full object-contain"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onError={() => setContentError(true)}
            />
          </div>
        )}

        {showContent && fileType === 'video' && (
          <div className="w-full h-full flex items-center justify-center bg-black" onContextMenu={(e) => e.preventDefault()}>
            <video
              src={viewerUrl}
              controls
              controlsList="nodownload"
              disablePictureInPicture
              className="max-w-full max-h-full"
              onError={() => setContentError(true)}
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {showContent && fileType === 'audio' && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-6 max-w-md w-full mx-4">
              <Music className="h-20 w-20 text-gray-400" />
              <p className="text-white text-lg font-medium text-center truncate w-full">
                {document?.file_name || document?.name || 'Audio File'}
              </p>
              <audio
                src={viewerUrl}
                controls
                className="w-full"
                onError={() => setContentError(true)}
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          </div>
        )}

        {showContent && fileType === 'excel' && (
          <ExcelPreview url={viewerUrl} onDownload={onDownload} />
        )}

        {showContent && fileType === 'docx' && (
          <DocxPreview url={viewerUrl} onDownload={onDownload} />
        )}

        {showContent && fileType === 'text' && (
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0 bg-white"
            title="Document Preview"
            onError={() => setContentError(true)}
          />
        )}

        {/* Per-user repeating diagonal watermark overlay — only renders when watermark data is available */}
        {showContent && (() => {
          const wm = watermarkProp || document?.watermark
          if (!wm?.viewer_email) return null
          const line1 = wm.viewer_email
          const line2 = wm.entity_name || wm.viewer_name || ''
          return (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden select-none"
              aria-hidden="true"
              style={{ zIndex: 9999 }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '120px',
                  transform: 'rotate(-35deg)',
                }}
              >
                {Array.from({ length: 8 }).map((_, row) => (
                  <div
                    key={row}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      gap: '80px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Array.from({ length: 5 }).map((_, col) => (
                      <div
                        key={col}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          opacity: 0.12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#666',
                            textShadow: '0 0 6px rgba(0,0,0,0.15), 0 0 12px rgba(255,255,255,0.15)',
                            lineHeight: 1.2,
                          }}
                        >
                          {line1}
                        </span>
                        {line2 && (
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#666',
                              textShadow: '0 0 6px rgba(0,0,0,0.15), 0 0 12px rgba(255,255,255,0.15)',
                              lineHeight: 1.2,
                              marginTop: '2px',
                            }}
                          >
                            {line2}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Footer hint */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm bg-black/50 px-4 py-2 rounded-full">
          Press <kbd className="px-2 py-1 bg-white/10 rounded mx-1">ESC</kbd> to close
          {!hideDownload && (
            <> or <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Ctrl+D</kbd> to download</>
          )}
        </div>
      )}
    </div>
  )

  // Render portal to document.body to escape backdrop-blur containing blocks
  const portalTarget = typeof window !== 'undefined' ? window.document.body : null
  if (!portalTarget) return null
  return createPortal(modalContent, portalTarget)
}
