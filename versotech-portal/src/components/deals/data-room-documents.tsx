'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Folder, Loader2, ExternalLink, Eye } from 'lucide-react'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import { getFileTypeCategory } from '@/constants/document-preview.constants'

export interface DataRoomDocument {
  id: string
  deal_id: string
  folder: string | null
  file_key: string | null
  file_name: string | null
  created_at: string
  external_link: string | null
  is_featured?: boolean
}

interface DataRoomDocumentsProps {
  documents: DataRoomDocument[]
}

export function DataRoomDocuments({ documents }: DataRoomDocumentsProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const viewer = useDocumentViewer()

  const documentsByFolder = documents.reduce<Record<string, DataRoomDocument[]>>((acc, doc) => {
    const folder = doc.folder ?? 'General'
    if (!acc[folder]) {
      acc[folder] = []
    }
    acc[folder].push(doc)
    return acc
  }, {})

  const handleDownload = async (doc: DataRoomDocument) => {
    setDownloadingId(doc.id)
    setError(null)

    try {
      // If it's an external link, just open it directly
      if (doc.external_link) {
        window.open(doc.external_link, '_blank', 'noopener,noreferrer')
        setDownloadingId(null)
        return
      }

      // Use API endpoint for secure download with audit logging
      const response = await fetch(`/api/deals/${doc.deal_id}/documents/${doc.id}/download`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate download link')
      }

      const data = await response.json()

      if (!data.download_url) {
        throw new Error('No download URL received')
      }

      // Open the pre-signed URL
      window.open(data.download_url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Failed to download file', err)
      setError(err instanceof Error ? err.message : 'Unable to download this document right now.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handlePreview = (doc: DataRoomDocument) => {
    const fileName = doc.file_name ?? doc.file_key?.split('/').pop() ?? null
    viewer.openPreview({
      id: doc.id,
      file_name: fileName,
    }, doc.deal_id)
  }

  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents available yet.</p>
  }

  return (
    <div className="space-y-3">
      {Object.entries(documentsByFolder).map(([folder, docs]) => (
        <div key={folder} className="rounded-lg border-2 border-border bg-card">
          <div className="flex items-center justify-between px-3 py-2 bg-muted border-b-2 border-border">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Folder className="h-4 w-4 text-blue-600" />
              {folder}
            </div>
            <Badge variant="outline" className="text-xs border-border bg-card text-foreground">
              {docs.length} file{docs.length === 1 ? '' : 's'}
            </Badge>
          </div>
          <div className="divide-y divide-border">
            {docs.map((doc) => {
              const fileName = doc.file_name ?? doc.file_key?.split('/').pop() ?? 'Untitled'
              const canPreview = !doc.external_link && getFileTypeCategory(fileName) !== 'unsupported'

              return (
                <div key={doc.id} className="flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {fileName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {doc.external_link ? 'External link' : `Uploaded ${new Date(doc.created_at).toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {canPreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(doc)}
                        className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingId === doc.id}
                      className="gap-2 border-blue-600 text-foreground hover:bg-primary/10"
                    >
                      {downloadingId === doc.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          {doc.external_link ? 'Opening…' : 'Preparing…'}
                        </>
                      ) : doc.external_link ? (
                        <>
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                          View
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 text-blue-600" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      {/* Document Preview Fullscreen Viewer */}
      <DocumentViewerFullscreen
        isOpen={viewer.isOpen}
        document={viewer.document}
        previewUrl={viewer.previewUrl}
        isLoading={viewer.isLoading}
        error={viewer.error}
        onClose={viewer.closePreview}
        onDownload={viewer.downloadDocument}
        watermark={viewer.watermark}
      />
    </div>
  )
}
