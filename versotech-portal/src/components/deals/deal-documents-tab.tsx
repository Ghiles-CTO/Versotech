'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Download, Trash2, Plus, Edit, History } from 'lucide-react'
import { DataRoomDocumentUpload } from './data-room-document-upload'
import { DataRoomDocumentEditor } from './data-room-document-editor'
import { DataRoomDocumentVersions } from './data-room-document-versions'
import { toast } from 'sonner'

interface DealDocumentsTabProps {
  dealId: string
  documents: any[]
  onRefresh?: () => void
}

export function DealDocumentsTab({ dealId, documents, onRefresh }: DealDocumentsTabProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingDocument, setEditingDocument] = useState<any | null>(null)
  const [versionHistoryDoc, setVersionHistoryDoc] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  
  const docTypeColors: Record<string, string> = {
    nda: 'bg-purple-500/20 text-purple-200',
    term_sheet: 'bg-blue-500/20 text-blue-200',
    subscription: 'bg-emerald-500/20 text-emerald-200',
    contract: 'bg-amber-500/20 text-amber-200',
    report: 'bg-cyan-500/20 text-cyan-200',
    other: 'bg-gray-500/20 text-gray-200'
  }

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1)
    // Trigger callback to refresh parent component
    if (onRefresh) {
      onRefresh()
    }
  }

  const handleDownload = async (documentId: string) => {
    setDownloading(documentId)

    try {
      const response = await fetch(`/api/deals/${dealId}/documents/${documentId}/download`)

      if (!response.ok) {
        throw new Error('Failed to generate download link')
      }

      const data = await response.json()

      // Open the signed URL in a new tab
      window.open(data.download_url, '_blank')

      toast.success('Document download started')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download document')
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    setDeleting(documentId)

    try {
      const response = await fetch(`/api/deals/${dealId}/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      toast.success('Document deleted successfully')
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Deal Documents
              </CardTitle>
              <CardDescription>Documents scoped to this deal only</CardDescription>
            </div>
            <DataRoomDocumentUpload
              dealId={dealId}
              onUploadComplete={handleUploadComplete}
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Upload Document
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet. Click "Upload Document" to add files.
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {doc.file_key.split('/').pop()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        {doc.created_by_profile && ` by ${doc.created_by_profile.display_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setEditingDocument(doc)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setVersionHistoryDoc(doc.id)}
                    >
                      <History className="h-4 w-4" />
                      Versions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDownload(doc.id)}
                      disabled={downloading === doc.id}
                    >
                      <Download className="h-4 w-4" />
                      {downloading === doc.id ? 'Downloading...' : 'Download'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-200"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Editor Dialog */}
      {editingDocument && (
        <DataRoomDocumentEditor
          dealId={dealId}
          documentId={editingDocument.id}
          open={!!editingDocument}
          onOpenChange={(open) => !open && setEditingDocument(null)}
          onSaved={() => {
            setEditingDocument(null)
            if (onRefresh) {
              onRefresh()
            }
          }}
          initialData={{
            file_name: editingDocument.file_name,
            folder: editingDocument.folder,
            visible_to_investors: editingDocument.visible_to_investors,
            tags: editingDocument.tags,
            document_notes: editingDocument.document_notes,
            document_expires_at: editingDocument.document_expires_at
          }}
        />
      )}

      {/* Version History Dialog */}
      {versionHistoryDoc && (
        <DataRoomDocumentVersions
          dealId={dealId}
          documentId={versionHistoryDoc}
          open={!!versionHistoryDoc}
          onOpenChange={(open) => !open && setVersionHistoryDoc(null)}
        />
      )}
    </div>
  )
}
