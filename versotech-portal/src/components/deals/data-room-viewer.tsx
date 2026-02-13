'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'
import {
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  Presentation,
  Folder,
  FolderOpen,
  Star,
  Lock,
  Eye,
  Loader2
} from 'lucide-react'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import { DocumentReference } from '@/types/document-viewer.types'
import { getFileTypeCategory } from '@/constants/document-preview.constants'

export interface DataRoomDocument {
  id: string
  file_name: string
  file_type: string
  file_size: number
  category: string
  description: string | null
  uploaded_at: string
  is_featured: boolean
  external_link: string | null
  file_key: string | null
}

interface DataRoomViewerProps {
  documents: DataRoomDocument[]
  hasAccess: boolean
  requiresNda: boolean
  dealId: string
  onRequestAccess?: () => void
}

// File type icon mapping
function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return FileText
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return FileSpreadsheet
  if (mimeType.includes('image')) return FileImage
  if (mimeType.includes('video')) return FileVideo
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return Presentation
  if (mimeType.includes('word') || mimeType.includes('document')) return FileText
  return File
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

// Check if file type supports in-app preview
function isPreviewableType(mimeType: string, fileName?: string): boolean {
  const category = getFileTypeCategory(fileName, mimeType)
  return category !== 'unsupported'
}

// Document row component with download/preview functionality
function DocumentRow({
  document,
  dealId,
  hasAccess,
  onPreview
}: {
  document: DataRoomDocument
  dealId: string
  hasAccess: boolean
  onPreview: (doc: DataRoomDocument) => void
}) {
  const [isDownloading, setIsDownloading] = useState(false)
  const FileIcon = getFileIcon(document.file_type)
  const isExternal = !!document.external_link
  const canPreview = isPreviewableType(document.file_type, document.file_name)

  const handleDownload = useCallback(async () => {
    if (isExternal && document.external_link) {
      window.open(document.external_link, '_blank', 'noopener,noreferrer')
      return
    }

    setIsDownloading(true)

    try {
      const response = await fetch(
        `/api/deals/${dealId}/documents/${document.id}/download?mode=download`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          toast.error('Please sign in to access documents')
        } else if (response.status === 403) {
          toast.error(errorData.error || 'Access denied to this document')
        } else if (response.status === 404) {
          toast.error('Document not found')
        } else {
          toast.error(errorData.error || 'Failed to access document')
        }
        return
      }

      const data = await response.json()
      const url = data.download_url || data.url

      if (!url) {
        toast.error('Failed to generate document link')
        return
      }

      window.open(url, '_blank', 'noopener,noreferrer')
      toast.success('Download started')
    } catch (error) {
      console.error('Document download error:', error)
      toast.error('Failed to access document. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }, [dealId, document.id, document.external_link, isExternal])

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-muted rounded-lg transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="p-2 rounded-lg bg-muted text-muted-foreground">
          <FileIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">
            {document.file_name}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(document.file_size)}</span>
            <span>•</span>
            <span>{formatDate(document.uploaded_at)}</span>
            {document.description && (
              <>
                <span>•</span>
                <span className="truncate max-w-[200px]">{document.description}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {hasAccess && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isExternal ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(document.external_link!, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          ) : (
            <>
              {/* In-app preview button for supported file types */}
              {canPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(document)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              )}
              {/* Download button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                Download
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Folder section component
function FolderSection({
  folderName,
  documents,
  dealId,
  hasAccess,
  defaultOpen = false,
  onPreview
}: {
  folderName: string
  documents: DataRoomDocument[]
  dealId: string
  hasAccess: boolean
  defaultOpen?: boolean
  onPreview: (doc: DataRoomDocument) => void
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between py-3 px-4 hover:bg-muted rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
              {isOpen ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
            </div>
            <span className="font-medium text-foreground">{folderName}</span>
            <Badge variant="secondary" className="ml-2">
              {documents.length} {documents.length === 1 ? 'file' : 'files'}
            </Badge>
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 pl-4 border-l-2 border-border space-y-1">
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              dealId={dealId}
              hasAccess={hasAccess}
              onPreview={onPreview}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function DataRoomViewer({
  documents,
  hasAccess,
  requiresNda,
  dealId,
  onRequestAccess
}: DataRoomViewerProps) {
  const viewer = useDocumentViewer()

  // Handle in-app preview for a data room document
  const handlePreview = useCallback((doc: DataRoomDocument) => {
    const docRef: DocumentReference = {
      id: doc.id,
      file_name: doc.file_name,
      mime_type: doc.file_type,
      file_size_bytes: doc.file_size,
    }
    viewer.openPreview(docRef, dealId)
  }, [viewer.openPreview, dealId])

  // Group documents by folder with featured section
  const { featured, folders } = useMemo(() => {
    const featured: DataRoomDocument[] = []
    const folderMap: Record<string, DataRoomDocument[]> = {}

    documents.forEach((doc) => {
      if (doc.is_featured) {
        featured.push(doc)
      }

      const folderName = doc.category || 'General'
      if (!folderMap[folderName]) {
        folderMap[folderName] = []
      }
      folderMap[folderName].push(doc)
    })

    // Sort folders alphabetically, but put "General" last
    const sortedFolders: Record<string, DataRoomDocument[]> = {}
    const keys = Object.keys(folderMap).sort((a, b) => {
      if (a === 'General') return 1
      if (b === 'General') return -1
      return a.localeCompare(b)
    })
    keys.forEach((key) => {
      sortedFolders[key] = folderMap[key]
    })

    return { featured, folders: sortedFolders }
  }, [documents])

  // No access state
  if (!hasAccess) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
        <CardContent className="py-8 text-center">
          <Lock className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Data Room Access Required
          </h3>
          <p className="text-amber-700 dark:text-amber-300 mb-4 max-w-md mx-auto">
            {requiresNda
              ? 'Sign the NDA to unlock access to the full data room with deal documents, financials, and more.'
              : 'Express interest in this deal to unlock access to the data room.'}
          </p>
          {onRequestAccess && (
            <Button onClick={onRequestAccess} className="bg-amber-600 hover:bg-amber-700">
              {requiresNda ? 'Sign NDA to Unlock' : 'Request Access'}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Documents Available
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Documents for this deal haven&apos;t been uploaded yet. Check back soon.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Featured Documents Section */}
      {featured.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              Featured Documents
            </CardTitle>
            <CardDescription className="text-amber-600/80 dark:text-amber-400/80">
              Key documents highlighted by the deal team
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {featured.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                dealId={dealId}
                hasAccess={hasAccess}
                onPreview={handlePreview}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Folders Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            Data Room
          </CardTitle>
          <CardDescription>
            {documents.length} document{documents.length !== 1 ? 's' : ''} across {Object.keys(folders).length} folder{Object.keys(folders).length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          {Object.entries(folders).map(([folderName, docs], index) => (
            <FolderSection
              key={folderName}
              folderName={folderName}
              documents={docs}
              dealId={dealId}
              hasAccess={hasAccess}
              defaultOpen={index === 0}
              onPreview={handlePreview}
            />
          ))}
        </CardContent>
      </Card>

      {/* In-app Document Preview */}
      <DocumentViewerFullscreen
        isOpen={viewer.isOpen}
        document={viewer.document}
        previewUrl={viewer.previewUrl}
        isLoading={viewer.isLoading}
        error={viewer.error}
        onClose={viewer.closePreview}
        onDownload={viewer.downloadDocument}
      />
    </div>
  )
}
