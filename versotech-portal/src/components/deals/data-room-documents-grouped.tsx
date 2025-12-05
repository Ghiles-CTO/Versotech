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
  Eye,
  Star
} from 'lucide-react'
import { DataRoomDocument } from './data-room-documents'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'

interface DataRoomDocumentsGroupedProps {
  documents: DataRoomDocument[]
}

// Folder styling based on name - subtle color accents
const getFolderStyle = (folderName: string) => {
  const name = folderName.toLowerCase()
  if (name.includes('legal') || name.includes('contract'))
    return { icon: 'text-blue-600', accent: 'border-l-blue-500' }
  if (name.includes('financial') || name.includes('finance'))
    return { icon: 'text-emerald-600', accent: 'border-l-emerald-500' }
  if (name.includes('due diligence') || name.includes('diligence'))
    return { icon: 'text-violet-600', accent: 'border-l-violet-500' }
  if (name.includes('marketing') || name.includes('presentation'))
    return { icon: 'text-amber-600', accent: 'border-l-amber-500' }
  return { icon: 'text-slate-600', accent: 'border-l-slate-400' }
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

  // Separate featured and regular documents
  const featuredDocs = documents.filter(doc => doc.is_featured)
  const regularDocs = documents.filter(doc => !doc.is_featured)

  // Group regular documents by folder
  const documentsByFolder = regularDocs.reduce<Record<string, DataRoomDocument[]>>((acc, doc) => {
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
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'xlsx':
      case 'xls':
        return <FileText className="h-4 w-4 text-emerald-600" />
      case 'docx':
      case 'doc':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'pptx':
      case 'ppt':
        return <FileText className="h-4 w-4 text-orange-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-slate-500" />
    }
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-500">
        No documents available yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Featured Documents Section */}
      {featuredDocs.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <h3 className="font-semibold text-amber-900">Featured Documents</h3>
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              {featuredDocs.length} key document{featuredDocs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {featuredDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-lg border border-amber-200 px-4 py-3 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-slate-900 block truncate">
                      {doc.file_name || 'Untitled'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!doc.external_link && (
                    <Button
                      onClick={() => handlePreview(doc)}
                      variant="ghost"
                      size="sm"
                      className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
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
                    className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
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
        </div>
      )}

      {/* Regular Documents by Folder */}
      {sortedFolders.map(folder => {
        const folderDocs = documentsByFolder[folder]
        const isExpanded = expandedFolders.has(folder)
        const style = getFolderStyle(folder)

        return (
          <div
            key={folder}
            className={`bg-white border border-slate-200/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isExpanded ? 'border-l-2 ' + style.accent : ''}`}
          >
            {/* Folder header */}
            <button
              onClick={() => toggleFolder(folder)}
              className={`w-full px-5 py-4 flex items-center justify-between transition-all duration-200 ${isExpanded ? 'bg-slate-50/70' : 'hover:bg-slate-50/50'}`}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                    <FolderOpen className={`h-5 w-5 ${style.icon}`} />
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                    <Folder className={`h-5 w-5 ${style.icon}`} />
                  </>
                )}
                <span className="font-medium text-sm text-slate-900">{folder}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {folderDocs.length} {folderDocs.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </button>

            {/* Documents in folder */}
            {isExpanded && (
              <div className="bg-white divide-y divide-slate-100">
                {folderDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-all duration-150 border-l-2 border-transparent hover:border-l-blue-400"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(doc.file_name || '')}
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-slate-900 block truncate">
                          {doc.file_name || 'Untitled'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!doc.external_link && (
                        <Button
                          onClick={() => handlePreview(doc)}
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
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
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
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