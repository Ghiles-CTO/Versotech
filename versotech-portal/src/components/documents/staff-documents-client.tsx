'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Upload,
  FolderPlus,
  RefreshCw,
  FolderTree as FolderTreeIcon,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { FolderBreadcrumbs } from './navigation/FolderBreadcrumbs'
import { FolderNavigator } from './navigation/FolderNavigator'
import { FolderTreeDrawer } from './navigation/FolderTreeDrawer'
import { UploadDestinationBanner } from './upload/UploadDestinationBanner'
import { DocumentUploadDialog } from './document-upload-dialog'
import { MoveDocumentDialog } from './move-document-dialog'
import { CreateFolderDialog } from './create-folder-dialog'
import { DocumentFolder } from '@/types/documents'
import { toast } from 'sonner'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from './DocumentViewerFullscreen'

interface Vehicle {
  id: string
  name: string
  type: string
}

interface StaffDocument {
  id: string
  name: string
  type: string
  status: string
  file_size_bytes: number
  is_published: boolean
  created_at: string
  mime_type?: string
  folder?: {
    id: string
    name: string
    path: string
  }
  vehicle?: {
    id: string
    name: string
  }
  created_by_profile?: {
    display_name: string
  }
}

interface StaffDocumentsClientProps {
  initialVehicles: Vehicle[]
  userProfile: {
    role: string
    display_name: string
    title?: string
  }
}

export function StaffDocumentsClient({ initialVehicles, userProfile }: StaffDocumentsClientProps) {
  // Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [currentFolder, setCurrentFolder] = useState<DocumentFolder | null>(null)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  const [showTreeDrawer, setShowTreeDrawer] = useState(false)

  // Data State
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [documents, setDocuments] = useState<StaffDocument[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog State
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false)
  const [createFolderParentId, setCreateFolderParentId] = useState<string | null>(null)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [moveDialogDocId, setMoveDialogDocId] = useState<string | null>(null)
  const [moveDialogDocName, setMoveDialogDocName] = useState<string>('')
  const [moveDialogCurrentFolder, setMoveDialogCurrentFolder] = useState<string | null>(null)

  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('name')

  // Document viewer hook
  const {
    isOpen: previewOpen,
    document: previewDocument,
    previewUrl,
    isLoading: isLoadingPreview,
    error: previewError,
    openPreview,
    closePreview,
    downloadDocument: downloadFromPreview
  } = useDocumentViewer()

  // Load data on mount and when filters change
  useEffect(() => {
    loadFolders()
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [currentFolderId, searchQuery, statusFilter])

  // Navigation Functions (NEW)
  const navigateToFolder = (folderId: string | null) => {
    if (currentFolderId !== null && currentFolderId !== folderId) {
      setNavigationHistory(prev => [...prev, currentFolderId])
    }

    setCurrentFolderId(folderId)

    const folder = folders.find(f => f.id === folderId)
    setCurrentFolder(folder || null)
  }

  const navigateBack = () => {
    if (navigationHistory.length === 0) return

    const previousId = navigationHistory[navigationHistory.length - 1]
    setNavigationHistory(prev => prev.slice(0, -1))
    setCurrentFolderId(previousId)

    const folder = folders.find(f => f.id === previousId)
    setCurrentFolder(folder || null)
  }

  // Get subfolders of current location
  const getSubfolders = useMemo((): DocumentFolder[] => {
    return folders.filter(f => f.parent_folder_id === (currentFolderId || null))
  }, [folders, currentFolderId])

  // Get filtered documents
  const filteredDocuments = useMemo(() => {
    let result = documents

    // Search filter
    if (searchQuery) {
      result = result.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'type') {
        return a.type.localeCompare(b.type)
      }
      return 0
    })

    return result
  }, [documents, searchQuery, sortBy])

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/staff/documents/folders?tree=true')

      if (response.ok) {
        const data = await response.json()
        const foldersList = data.folders || []

        // Flatten tree structure to flat array
        interface FolderTreeNode extends DocumentFolder {
          children?: FolderTreeNode[]
        }

        const flattenFolders = (nodes: FolderTreeNode[]): DocumentFolder[] => {
          const result: DocumentFolder[] = []
          nodes.forEach((node: FolderTreeNode) => {
            result.push({
              id: node.id,
              name: node.name,
              path: node.path,
              parent_folder_id: node.parent_folder_id,
              folder_type: node.folder_type,
              vehicle_id: node.vehicle_id,
              created_by: node.created_by,
              created_at: node.created_at,
              updated_at: node.updated_at,
              subfolder_count: node.children?.length || 0,
              document_count: 0,
            })
            if (node.children && node.children.length > 0) {
              result.push(...flattenFolders(node.children))
            }
          })
          return result
        }

        setFolders(flattenFolders(foldersList))
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMsg = errorData.details || errorData.error || 'Unknown error'
        toast.error(`Failed to load folders: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error loading folders:', error)
      toast.error('Failed to load folders')
    }
  }

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (currentFolderId) {
        // Get all descendant folder IDs for recursive display
        const folderIds = getDescendantFolderIds(currentFolderId)
        folderIds.forEach(id => params.append('folder_ids', id))
        params.append('include_subfolders', 'true')
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/staff/documents?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMsg = errorData.details || errorData.error || 'Unknown error'
        toast.error(`Failed to load documents: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const getDescendantFolderIds = (folderId: string): string[] => {
    const result = [folderId]

    const findChildren = (parentId: string) => {
      const children = folders.filter(f => f.parent_folder_id === parentId)
      children.forEach(child => {
        result.push(child.id)
        findChildren(child.id)
      })
    }

    findChildren(folderId)
    return result
  }

  const handleCreateFolder = (parentId: string | null = null) => {
    setCreateFolderParentId(parentId || currentFolderId)
    setCreateFolderDialogOpen(true)
  }

  const handleInitVehicleFolders = async (vehicleId: string) => {
    try {
      const vehicle = initialVehicles.find(v => v.id === vehicleId)
      const response = await fetch('/api/staff/documents/init-vehicle-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: vehicleId })
      })

      if (response.ok) {
        toast.success(`Default folders created for ${vehicle?.name || 'vehicle'}`)
        loadFolders()
      } else {
        toast.error('Failed to create vehicle folders')
      }
    } catch (error) {
      console.error('Error initializing folders:', error)
      toast.error('Failed to create vehicle folders')
    }
  }

  const handleMoveDocument = (documentId: string, documentName: string, currentFolderId: string | null) => {
    setMoveDialogDocId(documentId)
    setMoveDialogDocName(documentName)
    setMoveDialogCurrentFolder(currentFolderId)
    setMoveDialogOpen(true)
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/staff/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Document deleted successfully')
        loadDocuments()
      } else {
        toast.error('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const handlePublishDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/staff/documents/${documentId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediate: true })
      })

      if (response.ok) {
        toast.success('Document published successfully')
        loadDocuments()
      } else {
        toast.error('Failed to publish document')
      }
    } catch (error) {
      console.error('Error publishing document:', error)
      toast.error('Failed to publish document')
    }
  }

  const handlePreview = async (doc: StaffDocument) => {
    const fileName = doc.name || ''
    const fileExt = fileName.split('.').pop()?.toLowerCase() || ''
    const officeExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odt', 'ods', 'odp']

    if (officeExtensions.includes(fileExt)) {
      toast.info('Office documents cannot be previewed. Use Download to view.')
      handleDownload(doc.id)
      return
    }

    await openPreview({
      id: doc.id,
      file_name: doc.name,
      name: doc.name,
      file_size_bytes: doc.file_size_bytes,
      type: doc.type,
      mime_type: doc.mime_type,
    })
  }

  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (response.ok) {
        const data = await response.json()
        const downloadUrl = data.url || data.download_url
        if (downloadUrl) {
          window.open(downloadUrl, '_blank')
          toast.success('Download started')
        } else {
          toast.error('No download URL in response')
        }
      } else {
        toast.error('Failed to generate download link')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Failed to download document')
    }
  }

  const handleRenameFolder = (folderId: string) => {
    toast.info('Folder renaming not yet implemented')
  }

  const handleDeleteFolder = (folderId: string) => {
    toast.info('Folder deletion not yet implemented')
  }

  // Check for vehicles without folders
  const vehiclesWithoutFolders = initialVehicles.filter(vehicle => {
    return !folders.some(folder =>
      folder.vehicle_id === vehicle.id &&
      folder.folder_type === 'vehicle_root'
    )
  })

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
          <p className="text-slate-600 mt-1">
            Manage documents with hierarchical folder structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadDocuments()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Breadcrumbs */}
      {currentFolder && (
        <FolderBreadcrumbs
          currentFolder={currentFolder}
          onNavigate={navigateToFolder}
        />
      )}

      {/* Upload Destination Banner */}
      {currentFolder && (
        <UploadDestinationBanner currentFolder={currentFolder} />
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowTreeDrawer(true)}
          >
            <FolderTreeIcon className="w-4 h-4 mr-2" />
            Browse All Folders
          </Button>
          {navigationHistory.length > 0 && (
            <Button variant="ghost" onClick={navigateBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {vehiclesWithoutFolders.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Initialize Vehicle Folders ({vehiclesWithoutFolders.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {vehiclesWithoutFolders.map(vehicle => (
                  <DropdownMenuItem
                    key={vehicle.id}
                    onClick={() => handleInitVehicleFolders(vehicle.id)}
                  >
                    {vehicle.name} ({vehicle.type})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="w-4 w-4 mr-2" />
            Upload Documents
          </Button>
          <Button variant="outline" onClick={() => handleCreateFolder()}>
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Main Navigator (Folders + Documents) */}
      <div className="flex-1 overflow-hidden">
        <FolderNavigator
          currentFolderId={currentFolderId}
          currentFolder={currentFolder}
          subfolders={getSubfolders}
          documents={filteredDocuments as any}
          isLoading={loading}
          viewMode={viewMode}
          sortBy={sortBy}
          searchQuery={searchQuery}
          onNavigateToFolder={navigateToFolder}
          onDocumentClick={(docId) => {
            const doc = documents.find(d => d.id === docId)
            if (doc) handlePreview(doc)
          }}
          onUploadClick={() => setUploadDialogOpen(true)}
          onCreateFolderClick={() => handleCreateFolder()}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onCreateSubfolder={handleCreateFolder}
          onViewModeChange={setViewMode}
          onSortChange={setSortBy}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Tree Drawer (Optional) */}
      <FolderTreeDrawer
        open={showTreeDrawer}
        onOpenChange={setShowTreeDrawer}
        folders={folders}
        currentFolderId={currentFolderId}
        onNavigate={navigateToFolder}
      />

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        folderId={currentFolderId}
        currentFolder={currentFolder}
        vehicleId={currentFolder?.vehicle_id || undefined}
        onSuccess={() => loadDocuments()}
      />

      {/* Move Document Dialog */}
      <MoveDocumentDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        documentId={moveDialogDocId}
        documentName={moveDialogDocName}
        currentFolderId={moveDialogCurrentFolder}
        onSuccess={() => loadDocuments()}
      />

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        parentFolderId={createFolderParentId}
        onSuccess={() => loadFolders()}
      />

      {/* Document Preview Modal */}
      <DocumentViewerFullscreen
        isOpen={previewOpen}
        document={previewDocument}
        previewUrl={previewUrl}
        isLoading={isLoadingPreview}
        error={previewError}
        onClose={closePreview}
        onDownload={downloadFromPreview}
      />
    </div>
  )
}
