'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Upload,
  FolderPlus,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  FileText,
  Grid,
  List as ListIcon,
  ChevronRight,
  UserPlus,
  FolderInput
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { FolderTree, FolderNode } from './folder-tree'
import { DocumentUploadDialog } from './document-upload-dialog'
import { FolderAccessDialog } from './folder-access-dialog'
import { DocumentAccessDialog } from './document-access-dialog'
import { MoveDocumentDialog } from './move-document-dialog'
import { CreateFolderDialog } from './create-folder-dialog'
import { toast } from 'sonner'

interface Vehicle {
  id: string
  name: string
  type: string
}

interface Document {
  id: string
  name: string
  type: string
  status: string
  file_size_bytes: number
  is_published: boolean
  created_at: string
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
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [folders, setFolders] = useState<FolderNode[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<FolderNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false)
  const [createFolderParentId, setCreateFolderParentId] = useState<string | null>(null)
  const [accessDialogOpen, setAccessDialogOpen] = useState(false)
  const [accessDialogFolderId, setAccessDialogFolderId] = useState<string | null>(null)
  const [docAccessDialogOpen, setDocAccessDialogOpen] = useState(false)
  const [docAccessDialogId, setDocAccessDialogId] = useState<string | null>(null)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [moveDialogDocId, setMoveDialogDocId] = useState<string | null>(null)
  const [moveDialogDocName, setMoveDialogDocName] = useState<string>('')
  const [moveDialogCurrentFolder, setMoveDialogCurrentFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadFolders()
    loadDocuments()
  }, [selectedFolderId, searchQuery, statusFilter])

  const loadFolders = async () => {
    try {
      console.log('[StaffDocuments] Loading folders...')
      const response = await fetch('/api/staff/documents/folders?tree=true')
      console.log('[StaffDocuments] Folders response status:', response.status)
      console.log('[StaffDocuments] Folders response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const data = await response.json()
        console.log('[StaffDocuments] Folders loaded:', data.folders?.length || 0)
        setFolders(data.folders || [])
      } else {
        const text = await response.text()
        console.error('[StaffDocuments] Folders load failed. Status:', response.status, 'Response:', text)
        let errorData: any = { error: 'Unknown error' }
        try {
          errorData = JSON.parse(text)
        } catch (e) {
          errorData = { error: text || 'Unknown error' }
        }
        console.error('[StaffDocuments] Parsed error:', errorData)
        const errorMsg = errorData.details || errorData.error || 'Unknown error'
        const errorCode = errorData.code ? ` (${errorData.code})` : ''
        toast.error(`Failed to load folders: ${errorMsg}${errorCode}`)
      }
    } catch (error) {
      console.error('[StaffDocuments] Error loading folders:', error)
      toast.error('Failed to load folders. Check console for details.')
    }
  }

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedFolderId) {
        // Get all descendant folder IDs for recursive display
        const folderIds = getDescendantFolderIds(selectedFolderId)
        folderIds.forEach(id => params.append('folder_ids', id))
        params.append('include_subfolders', 'true')
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      console.log('[StaffDocuments] Loading documents with params:', params.toString())
      const response = await fetch(`/api/staff/documents?${params.toString()}`)
      console.log('[StaffDocuments] Documents response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[StaffDocuments] Documents loaded:', data.documents?.length || 0)
        setDocuments(data.documents || [])
      } else {
        const text = await response.text()
        console.error('[StaffDocuments] Documents load failed. Status:', response.status, 'Response:', text)
        let errorData: any = { error: 'Unknown error' }
        try {
          errorData = JSON.parse(text)
        } catch (e) {
          errorData = { error: text || 'Unknown error' }
        }
        console.error('[StaffDocuments] Parsed error:', errorData)
        const errorMsg = errorData.details || errorData.error || 'Unknown error'
        const errorCode = errorData.code ? ` (${errorData.code})` : ''
        toast.error(`Failed to load documents: ${errorMsg}${errorCode}`)
      }
    } catch (error) {
      console.error('[StaffDocuments] Error loading documents:', error)
      toast.error('Failed to load documents. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const flattenFolders = (nodes: FolderNode[]): FolderNode[] => {
    const result: FolderNode[] = []
    nodes.forEach(node => {
      result.push(node)
      if (node.children && node.children.length > 0) {
        result.push(...flattenFolders(node.children))
      }
    })
    return result
  }

  const getDescendantFolderIds = (folderId: string): string[] => {
    const allFolders = flattenFolders(folders)
    const result = [folderId]
    
    const findChildren = (parentId: string) => {
      const children = allFolders.filter(f => f.parent_folder_id === parentId)
      children.forEach(child => {
        result.push(child.id)
        findChildren(child.id)
      })
    }
    
    findChildren(folderId)
    return result
  }

  const handleSelectFolder = (folderId: string | null, folder: FolderNode) => {
    setSelectedFolderId(folderId)
    setSelectedFolder(folder)
  }

  const handleCreateFolder = (parentId: string | null) => {
    setCreateFolderParentId(parentId)
    setCreateFolderDialogOpen(true)
  }

  const handleInitVehicleFolders = async (vehicleId: string) => {
    try {
      const response = await fetch('/api/staff/documents/init-vehicle-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: vehicleId })
      })

      if (response.ok) {
        toast.success('Vehicle folders created successfully')
        loadFolders()
      } else {
        toast.error('Failed to create vehicle folders')
      }
    } catch (error) {
      console.error('Error initializing folders:', error)
      toast.error('Failed to create vehicle folders')
    }
  }

  const handleToggleFolder = (folderId: string) => {
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

  const handleManageAccess = (folderId: string) => {
    setAccessDialogFolderId(folderId)
    setAccessDialogOpen(true)
  }

  const handleManageDocumentAccess = (documentId: string, documentName: string) => {
    setDocAccessDialogId(documentId)
    setDocAccessDialogOpen(true)
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { className: string, icon: any, label: string }> = {
      draft: { 
        className: 'bg-gray-700 text-gray-200 border-gray-600', 
        icon: FileText,
        label: 'Draft'
      },
      pending_approval: { 
        className: 'bg-amber-900/50 text-amber-300 border-amber-600', 
        icon: Clock,
        label: 'Pending Approval'
      },
      approved: { 
        className: 'bg-green-900/50 text-green-300 border-green-600', 
        icon: CheckCircle,
        label: 'Approved'
      },
      published: { 
        className: 'bg-blue-900/50 text-blue-300 border-blue-600', 
        icon: CheckCircle,
        label: 'Published'
      },
      archived: { 
        className: 'bg-gray-800 text-gray-400 border-gray-600', 
        icon: FileText,
        label: 'Archived'
      }
    }

    const config = configs[status] || configs.draft
    const Icon = config.icon

    return (
      <Badge className={`gap-1 border ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Management</h1>
          <p className="text-gray-300 mt-1">
            Manage documents with hierarchical folder structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadDocuments()}
            className="border-gray-600 text-gray-200 hover:border-gray-500 hover:bg-gray-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              console.log('[StaffDocuments] Upload button clicked')
              setUploadDialogOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Folder Tree */}
        <div className="col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white">Folders</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateFolder(null)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Vehicle Folder Initialization */}
              {initialVehicles.length > 0 && (
                <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                  <p className="text-sm font-semibold text-blue-300 mb-2">Initialize Vehicle Folders</p>
                  <div className="space-y-1">
                    {initialVehicles.map(vehicle => (
                      <Button
                        key={vehicle.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInitVehicleFolders(vehicle.id)}
                        className="w-full justify-start text-left hover:bg-blue-800/50 text-blue-200 hover:text-white"
                      >
                        <FolderPlus className="h-3 w-3 mr-2" />
                        {vehicle.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Folder Tree */}
              <FolderTree
                folders={folders}
                selectedFolderId={selectedFolderId}
                onSelectFolder={handleSelectFolder}
                onCreateFolder={handleCreateFolder}
                onManageAccess={handleManageAccess}
                expandedFolders={expandedFolders}
                onToggleFolder={handleToggleFolder}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Documents */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  {selectedFolder && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <span>Documents</span>
                      <ChevronRight className="h-4 w-4" />
                      <span className="font-medium text-gray-200">{selectedFolder.path}</span>
                    </div>
                  )}
                  <CardTitle className="text-white">
                    {selectedFolder ? selectedFolder.name : 'All Documents'}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}
                  >
                    <ListIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-600 text-gray-200 hover:border-blue-500 hover:bg-gray-800 hover:text-white">
                      <Filter className="h-4 w-4 mr-2" />
                      {statusFilter === 'all' ? 'All Status' : statusFilter.replace('_', ' ')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white">
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter('all')}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter('draft')}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter('pending_approval')}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      Pending Approval
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter('approved')}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      Approved
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter('published')}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      Published
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-400 mt-4">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-sm text-gray-400">No documents found</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800/50 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-white">{doc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="font-medium">{doc.type}</span>
                            <span>•</span>
                            <span>{formatFileSize(doc.file_size_bytes || 0)}</span>
                            <span>•</span>
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(doc.status)}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-gray-700 text-gray-300 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleManageDocumentAccess(doc.id, doc.name)}
                              className="cursor-pointer"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Manage Investor Access
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleMoveDocument(doc.id, doc.name, doc.folder?.id || null)}
                              className="cursor-pointer"
                            >
                              <FolderInput className="h-4 w-4 mr-2" />
                              Move to Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Metadata
                            </DropdownMenuItem>
                            {!doc.is_published && doc.status === 'approved' && (
                              <DropdownMenuItem 
                                onClick={() => handlePublishDocument(doc.id)}
                                className="cursor-pointer text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        folderId={selectedFolderId}
        vehicleId={selectedFolder?.vehicle_id || undefined}
        onSuccess={() => loadDocuments()}
      />

      {/* Folder Access Dialog */}
      <FolderAccessDialog
        open={accessDialogOpen}
        onOpenChange={setAccessDialogOpen}
        folderId={accessDialogFolderId}
        folderName={folders.find(f => f.id === accessDialogFolderId)?.name}
        onSuccess={() => {
          // Refresh data if needed
        }}
      />

      {/* Document Access Dialog */}
      <DocumentAccessDialog
        open={docAccessDialogOpen}
        onOpenChange={setDocAccessDialogOpen}
        documentId={docAccessDialogId}
        documentName={documents.find(d => d.id === docAccessDialogId)?.name}
        onSuccess={() => {
          // Refresh data if needed
        }}
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
    </div>
  )
}

