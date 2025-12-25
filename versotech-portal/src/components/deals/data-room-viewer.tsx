'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
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
    year: 'numeric'
  })
}

// Check if file type supports preview
function isPreviewableType(mimeType: string): boolean {
  return (
    mimeType.includes('pdf') ||
    mimeType.includes('image') ||
    mimeType.includes('text') ||
    mimeType.includes('video')
  )
}

// Document row component with download/preview functionality
function DocumentRow({
  document,
  dealId,
  hasAccess
}: {
  document: DataRoomDocument
  dealId: string
  hasAccess: boolean
}) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const FileIcon = getFileIcon(document.file_type)
  const isExternal = !!document.external_link
  const canPreview = isPreviewableType(document.file_type)

  const handleDocumentAction = useCallback(async (mode: 'download' | 'preview') => {
    if (isExternal && document.external_link) {
      window.open(document.external_link, '_blank', 'noopener,noreferrer')
      return
    }

    const isPreview = mode === 'preview'
    if (isPreview) {
      setIsPreviewing(true)
    } else {
      setIsDownloading(true)
    }

    try {
      const response = await fetch(
        `/api/deals/${dealId}/documents/${document.id}/download?mode=${mode}`
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

      // Open in new tab
      window.open(url, '_blank', 'noopener,noreferrer')

      // Show success toast with watermark info
      if (data.watermark) {
        toast.success(
          isPreview ? 'Document opened for preview' : 'Download started',
          {
            description: `Link expires in ${Math.floor(data.expires_in_seconds / 60)} minutes`,
            duration: 4000
          }
        )
      } else {
        toast.success(isPreview ? 'Document opened' : 'Download started')
      }
    } catch (error) {
      console.error('Document action error:', error)
      toast.error('Failed to access document. Please try again.')
    } finally {
      setIsDownloading(false)
      setIsPreviewing(false)
    }
  }, [dealId, document.id, document.external_link, isExternal])

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500">
          <FileIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {document.file_name}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
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
              onClick={() => handleDocumentAction('preview')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          ) : (
            <>
              {/* Preview button for supported file types */}
              {canPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDocumentAction('preview')}
                  disabled={isPreviewing}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {isPreviewing ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  Preview
                </Button>
              )}
              {/* Download button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDocumentAction('download')}
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
  defaultOpen = false
}: {
  folderName: string
  documents: DataRoomDocument[]
  dealId: string
  hasAccess: boolean
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
              {isOpen ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">{folderName}</span>
            <Badge variant="secondary" className="ml-2">
              {documents.length} {documents.length === 1 ? 'file' : 'files'}
            </Badge>
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-1">
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              dealId={dealId}
              hasAccess={hasAccess}
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
          <Folder className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Documents Available
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
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
              defaultOpen={index === 0} // Open first folder by default
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
