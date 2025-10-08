'use client'

import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen, FileText, Download, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Folder {
  id: string
  name: string
  path: string
  folder_type: string
  vehicle?: {
    id: string
    name: string
  }
}

interface Document {
  id: string
  name: string
  type: string
  file_key: string
  created_at: string
  file_size_bytes: number
  folder?: {
    id: string
    name: string
    path: string
  }
}

interface InvestorFoldersClientProps {
  folders: Folder[]
  documents: Document[]
}

export function InvestorFoldersClient({ folders, documents }: InvestorFoldersClientProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Group folders by vehicle
  const vehicleRoots = folders.filter(f => f.folder_type === 'vehicle_root')

  const getChildFolders = (parentId: string | null) => {
    return folders.filter(f => {
      if (parentId === null) {
        return f.folder_type === 'vehicle_root'
      }
      // Simple parent matching - you might need to adjust based on your schema
      return f.path.startsWith(folders.find(p => p.id === parentId)?.path + '/')
        && f.path.split('/').length === (folders.find(p => p.id === parentId)?.path.split('/').length || 0) + 1
    })
  }

  const getDocumentsInFolder = (folderId: string | null) => {
    if (folderId === null) {
      return documents.filter(d => !d.folder)
    }
    return documents.filter(d => d.folder?.id === folderId)
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const children = getChildFolders(folder.id)
    const docs = getDocumentsInFolder(folder.id)
    const hasChildren = children.length > 0

    return (
      <div key={folder.id} className="mb-2">
        <button
          onClick={() => {
            toggleFolder(folder.id)
            setSelectedFolderId(folder.id)
          }}
          className={cn(
            'w-full flex items-center gap-2 p-3 rounded-lg transition-all',
            'hover:bg-blue-50 border border-transparent hover:border-blue-200',
            selectedFolderId === folder.id && 'bg-blue-100 border-blue-300'
          )}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {isExpanded ? (
            <FolderOpen className="h-5 w-5 text-blue-500" />
          ) : (
            <Folder className="h-5 w-5 text-blue-500" />
          )}
          <span className="flex-1 text-left font-medium text-gray-900">{folder.name}</span>
          <Badge variant="outline" className="text-xs">
            {docs.length} {docs.length === 1 ? 'doc' : 'docs'}
          </Badge>
        </button>

        {isExpanded && (
          <div className="mt-1">
            {/* Render documents in this folder */}
            {docs.length > 0 && (
              <div className="ml-8 space-y-1 mb-2">
                {docs.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.type} • {formatFileSize(doc.file_size_bytes || 0)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Render child folders */}
            {children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your Documents</h2>
        <p className="text-sm text-gray-500">
          {documents.length} documents in {folders.length} folders
        </p>
      </div>

      <div className="space-y-3">
        {vehicleRoots.map(folder => renderFolder(folder, 0))}
      </div>

      {/* Unfoldered documents */}
      {getDocumentsInFolder(null).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getDocumentsInFolder(null).map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded hover:bg-gray-50 border"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.type} • {formatFileSize(doc.file_size_bytes || 0)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

