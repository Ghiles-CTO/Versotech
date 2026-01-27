'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Eye } from 'lucide-react'
import { DocumentService } from '@/services/document.service'
import { toast } from 'sonner'

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

  const handleDownload = async (doc: Document) => {
    try {
      setDownloadingId(doc.id)
      const { download_url } = await DocumentService.getDownloadUrl(doc.id)

      // Trigger download
      const link = document.createElement('a')
      link.href = download_url
      link.download = doc.name || doc.file_key?.split('/').pop() || 'document'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

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
      const { download_url } = await DocumentService.getPreviewUrl(doc.id)

      // Open preview in new tab
      window.open(download_url, '_blank')

      toast.success('Opening preview')
    } catch (error: any) {
      console.error('Preview error:', error)
      toast.error(error.message || 'Failed to preview document')
    } finally {
      setPreviewingId(null)
    }
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
                      {doc.type} • {new Date(doc.created_at).toLocaleDateString()}
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
    </Card>
  )
}
