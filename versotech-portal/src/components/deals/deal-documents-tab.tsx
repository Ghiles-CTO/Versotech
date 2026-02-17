'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText, Upload, Download, Trash2, Plus, Edit, History, FolderUp, FolderOpen, Star, Loader2, Eye } from 'lucide-react'
import { DataRoomDocumentUpload } from './data-room-document-upload'
import { DataRoomFolderUpload } from './data-room-folder-upload'
import { DataRoomDocumentEditor } from './data-room-document-editor'
import { DataRoomDocumentVersions } from './data-room-document-versions'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import { getFileTypeCategory } from '@/constants/document-preview.constants'
import { DocumentService } from '@/services/document.service'
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const viewer = useDocumentViewer()

  // Prune stale selections when documents change
  useEffect(() => {
    const docIds = new Set(documents.map((d: any) => d.id))
    setSelectedIds(prev => {
      const pruned = new Set([...prev].filter(id => docIds.has(id)))
      if (pruned.size !== prev.size) return pruned
      return prev
    })
  }, [documents])

  const selectAllChecked: boolean | 'indeterminate' =
    selectedIds.size === 0
      ? false
      : selectedIds.size === documents.length
        ? true
        : 'indeterminate'
  
  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return null
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const existingFolders = Array.from(
    new Set(documents.map((d: any) => d.folder).filter(Boolean))
  ) as string[]

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
      const data = await DocumentService.getDealDocumentDownloadUrl(dealId, documentId)

      if (data.download_url.startsWith('blob:')) {
        const doc = documents.find((d: any) => d.id === documentId)
        const a = window.document.createElement('a')
        a.href = data.download_url
        a.download = doc?.file_name || 'document.pdf'
        a.click()
        setTimeout(() => URL.revokeObjectURL(data.download_url), 1000)
      } else {
        window.open(data.download_url, '_blank')
      }

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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === documents.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(documents.map((d: any) => d.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} document${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return
    }

    setBulkDeleting(true)
    let successCount = 0
    let failCount = 0

    for (const id of selectedIds) {
      try {
        const response = await fetch(`/api/deals/${dealId}/documents/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          successCount++
        } else {
          failCount++
        }
      } catch {
        failCount++
      }
    }

    setBulkDeleting(false)
    setSelectedIds(new Set())

    if (failCount === 0) {
      toast.success(`Deleted ${successCount} document${successCount > 1 ? 's' : ''}`)
    } else {
      toast.error(`Deleted ${successCount}, failed ${failCount}`)
    }

    if (onRefresh) onRefresh()
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Deal Documents
              </CardTitle>
              <CardDescription>Documents scoped to this deal only</CardDescription>
            </div>
            <div className="flex gap-2">
              <DataRoomDocumentUpload
                dealId={dealId}
                onUploadComplete={handleUploadComplete}
                trigger={
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </Button>
                }
              />
              <DataRoomFolderUpload
                dealId={dealId}
                onUploadComplete={handleUploadComplete}
                trigger={
                  <Button className="gap-2">
                    <FolderUp className="h-4 w-4" />
                    Upload Folder
                  </Button>
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet. Click "Upload Document" to add files.
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select all bar */}
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectAllChecked}
                    onCheckedChange={toggleSelectAll}
                    disabled={bulkDeleting}
                    aria-label="Select all documents"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size > 0
                      ? `${selectedIds.size} of ${documents.length} selected`
                      : `${documents.length} document${documents.length !== 1 ? 's' : ''}`}
                  </span>
                </div>
                {selectedIds.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                  >
                    {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete {selectedIds.size} selected
                  </Button>
                )}
              </div>

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between py-3 px-4 rounded-lg border transition-colors ${
                    selectedIds.has(doc.id)
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedIds.has(doc.id)}
                      onCheckedChange={() => toggleSelect(doc.id)}
                      disabled={bulkDeleting}
                      aria-label={`Select ${doc.file_name || 'document'}`}
                    />
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {doc.file_name || doc.file_key?.split('/').pop()}
                        </span>
                        {doc.is_featured && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                        {doc.folder && (
                          <Badge variant="outline" className="text-xs gap-1 flex-shrink-0">
                            <FolderOpen className="h-3 w-3" />
                            {doc.folder}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        {doc.created_by_profile && ` by ${doc.created_by_profile.display_name}`}
                        {formatFileSize(doc.file_size_bytes) && ` \u00b7 ${formatFileSize(doc.file_size_bytes)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setEditingDocument(doc)}
                      disabled={bulkDeleting}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setVersionHistoryDoc(doc.id)}
                      disabled={bulkDeleting}
                    >
                      <History className="h-4 w-4" />
                      Versions
                    </Button>
                    {getFileTypeCategory(doc.file_name || doc.file_key?.split('/').pop()) !== 'unsupported' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => viewer.openPreview({
                          id: doc.id,
                          file_name: doc.file_name || doc.file_key?.split('/').pop(),
                          file_size_bytes: doc.file_size_bytes,
                          mime_type: doc.mime_type,
                        }, dealId)}
                        disabled={bulkDeleting}
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDownload(doc.id)}
                      disabled={bulkDeleting || downloading === doc.id}
                    >
                      <Download className="h-4 w-4" />
                      {downloading === doc.id ? 'Downloading...' : 'Download'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-700 dark:text-red-200"
                      onClick={() => handleDelete(doc.id)}
                      disabled={bulkDeleting || deleting === doc.id}
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
          existingFolders={existingFolders}
          initialData={{
            file_name: editingDocument.file_name,
            folder: editingDocument.folder,
            visible_to_investors: editingDocument.visible_to_investors,
            is_featured: editingDocument.is_featured,
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
