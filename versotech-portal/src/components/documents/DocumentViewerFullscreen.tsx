'use client'

import { useEffect, useState } from 'react'
import { X, Download, Loader2, AlertCircle, FileText } from 'lucide-react'
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95">
      {/* Toolbar */}
      <div className="h-16 bg-white border-b shadow-md flex items-center justify-between px-6">
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

      {/* Main viewport */}
      <div className="h-[calc(100vh-4rem)] bg-gray-900 flex items-center justify-center">
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

        {previewUrl && !isLoading && !error && !iframeError && (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Document Preview"
            // Removed sandbox attribute to prevent Brave browser from blocking
            // sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onError={() => {
              console.error('iframe failed to load preview')
              setIframeError(true)
            }}
          />
        )}
      </div>

      {/* Footer hint */}
      {isOpen && !isLoading && !error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm bg-black/50 px-4 py-2 rounded-full">
          Press <kbd className="px-2 py-1 bg-white/10 rounded mx-1">ESC</kbd> to close
          or <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Ctrl+D</kbd> to download
        </div>
      )}
    </div>
  )
}
