'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Download, X, Loader2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DocumentViewerProps {
  documentId: string
  documentName: string
  mimeType: string
  open: boolean
  onClose: () => void
}

export function DocumentViewer({
  documentId,
  documentName,
  mimeType,
  open,
  onClose
}: DocumentViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)

  const loadDocument = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/documents/${documentId}/download`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load document')
      }

      const data = await response.json()
      setDocumentUrl(data.url)
    } catch (err) {
      console.error('Document load error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    if (open && documentId) {
      loadDocument()
    }

    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, documentId, loadDocument])

  const handleDownload = () => {
    if (!documentUrl) return

    const a = document.createElement('a')
    a.href = documentUrl
    a.download = documentName
    a.click()
  }

  const isPDF = mimeType === 'application/pdf'
  const isImage = mimeType.startsWith('image/')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-lg font-semibold">{documentName}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!documentUrl || loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Loading document...</p>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && documentUrl && (
            <>
              {isPDF && (
                <iframe
                  src={documentUrl}
                  className="w-full h-full border-0"
                  title={documentName}
                />
              )}

              {isImage && (
                <div className="flex items-center justify-center p-4">

                  <Image
                    src={documentUrl}
                    alt={documentName}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}

              {!isPDF && !isImage && (
                <Alert className="m-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Preview not available for this file type. Please download to view.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
