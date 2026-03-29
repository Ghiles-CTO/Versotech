'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Eye } from 'lucide-react'
import { DocumentService } from '@/services/document.service'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import { downloadFileFromUrl } from '@/lib/browser-download'
import { toast } from 'sonner'
import { formatViewerDate } from '@/lib/format'

interface Document {
  id: string
  name: string | null
  type: string
  file_key: string
  status?: string
  is_published?: boolean
  created_at: string
  created_by?: string
}

interface VehicleDocumentsListProps {
  documents: Document[]
}

export function VehicleDocumentsList({ documents }: VehicleDocumentsListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [previewDocument, setPreviewDocument] = useState<(Document & { preview_type?: string | null; preview_strategy?: 'direct' | 'office_embed' | null }) | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleDownload = async (doc: Document) => {
    try {
      setDownloadingId(doc.id)
      const { download_url } = await DocumentService.getDownloadUrl(doc.id)
      await downloadFileFromUrl(
        download_url,
        doc.name || doc.file_key?.split('/').pop() || 'document'
      )

      toast.success('Download started')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error(error.message || 'Failed to download document')
    } finally {
      setDownloadingId(null)
    }
  }

  const handlePreview = async (doc: Document) => {
    try {
      setPreviewingId(doc.id)
      setPreviewDocument(doc)
      setPreviewUrl(null)
      setPreviewError(null)
      setPreviewOpen(true)
      const response = await DocumentService.getPreviewUrl(doc.id)
      setPreviewDocument((current) => current ? {
        ...current,
        preview_type: response.document?.type || null,
        preview_strategy: response.preview_strategy || response.document?.preview_strategy || 'direct',
      } : current)
      setPreviewUrl(response.download_url)
    } catch (error: any) {
      console.error('Preview error:', error)
      const errorMessage = error.message || 'Failed to preview document'
      setPreviewError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setPreviewingId(null)
    }
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setPreviewDocument(null)
    setPreviewUrl(null)
    setPreviewError(null)
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Related Documents
        </CardTitle>
        <CardDescription>
          Documents specific to this investment vehicle
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{doc.name || doc.file_key?.split('/').pop() || doc.type}</div>
                      <div className="text-sm text-muted-foreground">
                      {doc.type} • {formatViewerDate(doc.created_at)}
                      </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handlePreview(doc)}
                    disabled={previewingId === doc.id || downloadingId === doc.id}
                  >
                    {previewingId === doc.id ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Preview
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id || previewingId === doc.id}
                  >
                    {downloadingId === doc.id ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No documents available</p>
          </div>
        )}
      </CardContent>
      <DocumentViewerFullscreen
        isOpen={previewOpen}
        document={previewDocument ? {
          id: previewDocument.id,
          name: previewDocument.name,
          file_name: previewDocument.name || previewDocument.file_key?.split('/').pop() || 'document',
          type: previewDocument.type,
          preview_type: previewDocument.preview_type,
          preview_strategy: previewDocument.preview_strategy,
        } : null}
        previewUrl={previewUrl}
        isLoading={previewingId !== null}
        error={previewError}
        onClose={closePreview}
        onDownload={() => previewDocument && handleDownload(previewDocument)}
      />
    </Card>
  )
}
