'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Download,
  ExternalLink,
  Loader2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Eye
} from 'lucide-react'
import { DataRoomDocument } from './data-room-documents'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'

interface DataRoomDocumentsGroupedProps {
  documents: DataRoomDocument[]
}

export function DataRoomDocumentsGrouped({ documents }: DataRoomDocumentsGroupedProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Document viewer hook
  const {
    isOpen,
    document: previewDocument,
    previewUrl,
    isLoading: isLoadingPreview,
    error: previewError,
    openPreview,
    closePreview,
    downloadDocument
  } = useDocumentViewer()

  // Group documents by folder
  const documentsByFolder = documents.reduce<Record<string, DataRoomDocument[]>>((acc, doc) => {
    const folder = doc.folder || 'General'
    if (!acc[folder]) {
      acc[folder] = []
    }
    acc[folder].push(doc)
    return acc
  }, {})

  // Sort folders alphabetically
  const sortedFolders = Object.keys(documentsByFolder).sort()

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder)
    } else {
      newExpanded.add(folder)
    }
    setExpandedFolders(newExpanded)
  }

  const handlePreview = async (doc: DataRoomDocument) => {
    // External links can't be previewed - open directly
    if (doc.external_link) {
      window.open(doc.external_link, '_blank', 'noopener,noreferrer')
      return
    }

    // Open preview with deal_id for proper API routing
    await openPreview({
      id: doc.id,
      file_name: doc.file_name,
      name: doc.file_name,
    }, doc.deal_id)
  }

  const handleDownload = async (doc: DataRoomDocument) => {
    setDownloadingId(doc.id)

    try {
      // If it's an external link, just open it directly
      if (doc.external_link) {
        window.open(doc.external_link, '_blank', 'noopener,noreferrer')
        setDownloadingId(null)
        return
      }

      if (!doc.file_key) {
        throw new Error('No file available for download')
      }

      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .download(doc.file_key)

      if (error || !data) {
        throw new Error(error?.message || 'Download failed')
      }

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.file_name || 'document'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      alert(err instanceof Error ? err.message : 'Failed to download document')
    } finally {
      setDownloadingId(null)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        No documents available yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sortedFolders.map(folder => {
        const folderDocs = documentsByFolder[folder]
        const isExpanded = expandedFolders.has(folder)

        return (
          <div key={folder} className="border border-gray-200 rounded-lg bg-white">
            {/* Folder header */}
            <button
              onClick={() => toggleFolder(folder)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                    <Folder className="h-4 w-4 text-blue-600" />
                  </>
                )}
                <span className="font-medium text-sm text-black">{folder}</span>
                <span className="text-xs text-gray-500">({folderDocs.length})</span>
              </div>
            </button>

            {/* Documents in folder */}
            {isExpanded && (
              <div className="border-t border-gray-100 divide-y divide-gray-100">
                {folderDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(doc.file_name || '')}
                      <span className="text-sm text-black truncate">
                        {doc.file_name || 'Untitled'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!doc.external_link && (
                        <Button
                          onClick={() => handlePreview(doc)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          Preview
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : doc.external_link ? (
                          <>
                            <ExternalLink className="h-4 w-4 mr-1.5" />
                            View
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1.5" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Document Preview Modal */}
      <DocumentViewerFullscreen
        isOpen={isOpen}
        document={previewDocument}
        previewUrl={previewUrl}
        isLoading={isLoadingPreview}
        error={previewError}
        onClose={closePreview}
        onDownload={downloadDocument}
      />
    </div>
  )
}