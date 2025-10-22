'use client'

import { useState, useMemo } from 'react'
import {
  Folder,
  FolderOpen,
  FolderPlus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  FileText,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Folder {
  id: string
  name: string
  path: string
  parent_folder_id: string | null
  folder_type: string
  vehicle_id: string
}

interface FolderManagerProps {
  entityId: string
  folders: Folder[]
  documents?: Array<{ id: string; folder_id: string | null }>
  selectedFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  onFoldersChange: () => void
}

interface FolderNode extends Folder {
  children: FolderNode[]
  documentCount: number
  isExpanded: boolean
}

const isRootFolder = (folder: Folder) =>
  (folder.folder_type === 'entity' || folder.folder_type === 'vehicle_root') &&
  !folder.parent_folder_id

export function FolderManager({
  entityId,
  folders,
  documents = [],
  selectedFolderId,
  onFolderSelect,
  onFoldersChange
}: FolderManagerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [parentFolderId, setParentFolderId] = useState<string | null>(null)
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null)
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [loading, setLoading] = useState(false)

  // Build folder tree - filter out the root entity folder
  const folderTree = useMemo(() => {
    const documentCounts = new Map<string, number>()
    documents.forEach(doc => {
      if (doc.folder_id) {
        documentCounts.set(doc.folder_id, (documentCounts.get(doc.folder_id) || 0) + 1)
      }
    })

    // Find the root entity folder (the one with folder_type 'entity' and no parent)
    const rootEntityFolder = folders.find((folder) => isRootFolder(folder))

    // Filter out the root entity folder - only show its children and custom folders
    const filteredFolders = folders.filter(folder => {
      // Exclude the root entity folder itself
      if (rootEntityFolder && folder.id === rootEntityFolder.id) {
        return false
      }
      return true
    })

    const nodeMap = new Map<string, FolderNode>()
    const rootNodes: FolderNode[] = []

    // Create nodes from filtered folders
    filteredFolders.forEach(folder => {
      nodeMap.set(folder.id, {
        ...folder,
        children: [],
        documentCount: documentCounts.get(folder.id) || 0,
        isExpanded: expandedFolders.has(folder.id)
      })
    })

    // Build tree - treat children of root entity folder as root nodes
    filteredFolders.forEach(folder => {
      const node = nodeMap.get(folder.id)!
      // If parent is the root entity folder, treat this as a root node
      if (rootEntityFolder && folder.parent_folder_id === rootEntityFolder.id) {
        rootNodes.push(node)
      } else if (folder.parent_folder_id && nodeMap.has(folder.parent_folder_id)) {
        nodeMap.get(folder.parent_folder_id)!.children.push(node)
      } else if (!folder.parent_folder_id) {
        // Custom folders with no parent
        rootNodes.push(node)
      }
    })

    // Sort by name
    const sortNodes = (nodes: FolderNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name))
      nodes.forEach(node => sortNodes(node.children))
    }
    sortNodes(rootNodes)

    return rootNodes
  }, [folders, documents, expandedFolders])

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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required')
      return
    }

    // Find the root entity folder to use as parent if no parent specified
    const rootEntityFolder = folders.find((folder) => isRootFolder(folder))

    const actualParentId = parentFolderId || (rootEntityFolder?.id || null)

    setLoading(true)
    try {
      const response = await fetch(`/api/entities/${entityId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parent_folder_id: actualParentId,
          folder_type: 'custom'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create folder')
      }

      toast.success('Folder created successfully')
      setNewFolderName('')
      setParentFolderId(null)
      setCreateModalOpen(false)
      onFoldersChange()
    } catch (error) {
      console.error('Failed to create folder:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create folder')
    } finally {
      setLoading(false)
    }
  }

  const handleRenameFolder = async () => {
    if (!folderToEdit || !newFolderName.trim()) {
      toast.error('Folder name is required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/entities/${entityId}/folders/${folderToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to rename folder')
      }

      toast.success('Folder renamed successfully')
      setNewFolderName('')
      setFolderToEdit(null)
      setRenameModalOpen(false)
      onFoldersChange()
    } catch (error) {
      console.error('Failed to rename folder:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to rename folder')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return

    setLoading(true)
    try {
      const response = await fetch(`/api/entities/${entityId}/folders/${folderToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete folder')
      }

      toast.success('Folder deleted successfully')
      setFolderToDelete(null)
      setDeleteModalOpen(false)
      if (selectedFolderId === folderToDelete.id) {
        onFolderSelect(null)
      }
      onFoldersChange()
    } catch (error) {
      console.error('Failed to delete folder:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete folder')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = (parentId: string | null = null) => {
    setParentFolderId(parentId)
    setNewFolderName('')
    setCreateModalOpen(true)
  }

  const openRenameModal = (folder: Folder) => {
    setFolderToEdit(folder)
    setNewFolderName(folder.name)
    setRenameModalOpen(true)
  }

  const openDeleteModal = (folder: Folder) => {
    setFolderToDelete(folder)
    setDeleteModalOpen(true)
  }

  const renderFolderNode = (node: FolderNode, depth: number = 0) => {
    const isSelected = selectedFolderId === node.id
    const hasChildren = node.children.length > 0
    const isSystemFolder = node.folder_type === 'vehicle_root' || node.folder_type === 'category'

    return (
      <div key={node.id}>
        <div
          className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
            isSelected
              ? 'bg-emerald-500/20 border-l-2 border-emerald-400'
              : 'hover:bg-white/5 border-l-2 border-transparent'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => onFolderSelect(node.id)}>
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(node.id)
                }}
                className="p-0.5 hover:bg-white/10 rounded"
              >
                {node.isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-5" />}

            {node.isExpanded || isSelected ? (
              <FolderOpen className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-emerald-400 shrink-0" />
            )}

            <span className={`text-sm truncate ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {node.name}
            </span>

            {node.documentCount > 0 && (
              <Badge variant="outline" className="text-xs h-5 bg-white/5 border-white/10">
                {node.documentCount}
              </Badge>
            )}
          </div>

          {!isSystemFolder && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-white/10"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10">
                <DropdownMenuItem onClick={() => openCreateModal(node.id)} className="gap-2">
                  <FolderPlus className="h-4 w-4" />
                  New Subfolder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openRenameModal(node)} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDeleteModal(node)}
                  className="gap-2 text-red-400 focus:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {node.isExpanded && node.children.map(child => renderFolderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Folders</h3>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={() => openCreateModal(null)}
        >
          <FolderPlus className="h-3 w-3" />
          New Folder
        </Button>
      </div>

      <div className="border border-white/10 rounded-lg bg-white/5 p-2 space-y-0.5 max-h-[400px] overflow-y-auto">
        {folderTree.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No folders yet</p>
            <p className="text-xs mt-1">Create your first folder to organize documents</p>
          </div>
        ) : (
          folderTree.map(node => renderFolderNode(node))
        )}
      </div>

      {/* Create Folder Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <FolderPlus className="h-5 w-5 text-emerald-400" />
              Create New Folder
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {parentFolderId
                ? `Creating subfolder in "${folders.find(f => f.id === parentFolderId)?.name}"`
                : 'Creating folder at root level'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-white">Folder Name *</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Q4 2024 Reports"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    handleCreateFolder()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={loading} className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={loading || !newFolderName.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Modal */}
      <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Edit2 className="h-5 w-5 text-emerald-400" />
              Rename Folder
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Renaming "{folderToEdit?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-folder" className="text-white">New Name *</Label>
              <Input
                id="rename-folder"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter new folder name"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    handleRenameFolder()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameModalOpen(false)} disabled={loading} className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Cancel
            </Button>
            <Button onClick={handleRenameFolder} disabled={loading || !newFolderName.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Folder
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{folderToDelete?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-400">
            {folderToDelete && (
              <>
                <p className="mb-2 text-white">The folder must be empty before deletion:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Move all documents to another folder</li>
                  <li>Delete all subfolders first</li>
                </ul>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={loading} className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFolder}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
