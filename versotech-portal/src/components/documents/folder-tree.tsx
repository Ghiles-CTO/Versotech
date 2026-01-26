'use client'

import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreVertical,
  Edit,
  Trash2,
  FolderTree as FolderTreeIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface FolderNode {
  id: string
  name: string
  path: string
  folder_type: 'vehicle_root' | 'category' | 'custom'
  parent_folder_id: string | null
  vehicle_id: string | null
  children?: FolderNode[]
  vehicle?: {
    id: string
    name: string
    type: string
  }
}

interface FolderTreeProps {
  folders: FolderNode[]
  selectedFolderId?: string | null
  onSelectFolder: (folderId: string | null, folder: FolderNode) => void
  onCreateFolder?: (parentId: string | null) => void
  onRenameFolder?: (folderId: string) => void
  onDeleteFolder?: (folderId: string) => void
  expandedFolders?: Set<string>
  onToggleFolder?: (folderId: string) => void
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  expandedFolders = new Set(),
  onToggleFolder
}: FolderTreeProps) {
  const [localExpanded, setLocalExpanded] = useState<Set<string>>(new Set())

  const isExpanded = (folderId: string) => {
    return expandedFolders.has(folderId) || localExpanded.has(folderId)
  }

  const toggleFolder = (folderId: string) => {
    if (onToggleFolder) {
      onToggleFolder(folderId)
    } else {
      setLocalExpanded(prev => {
        const next = new Set(prev)
        if (next.has(folderId)) {
          next.delete(folderId)
        } else {
          next.add(folderId)
        }
        return next
      })
    }
  }

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0
    const expanded = isExpanded(folder.id)
    const isSelected = selectedFolderId === folder.id

    return (
      <div key={folder.id}>
        <div
          className={cn(
            'flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors group',
            'hover:bg-accent hover:border-primary/50',
            isSelected && 'bg-primary/20 border-primary shadow-sm',
            'border border-transparent',
            level > 0 && 'ml-4'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="flex-shrink-0 p-0.5 hover:bg-muted rounded"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Folder Icon */}
          <div className="flex-shrink-0">
            {expanded ? (
              <FolderOpen className={cn(
                "h-4 w-4",
                folder.folder_type === 'vehicle_root' ? 'text-blue-500' :
                folder.folder_type === 'category' ? 'text-green-500' :
                'text-muted-foreground'
              )} />
            ) : (
              <Folder className={cn(
                "h-4 w-4",
                folder.folder_type === 'vehicle_root' ? 'text-blue-500' :
                folder.folder_type === 'category' ? 'text-green-500' :
                'text-muted-foreground'
              )} />
            )}
          </div>

          {/* Folder Name */}
          <button
            onClick={() => onSelectFolder(folder.id, folder)}
            className={cn(
              "flex-1 text-left text-sm font-medium truncate",
              isSelected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {folder.name}
          </button>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {folder.folder_type !== 'vehicle_root' && onCreateFolder && (
                <DropdownMenuItem onClick={() => onCreateFolder(folder.id)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Subfolder
                </DropdownMenuItem>
              )}
              {folder.folder_type === 'custom' && onRenameFolder && (
                <DropdownMenuItem onClick={() => onRenameFolder(folder.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
              )}
              {folder.folder_type === 'custom' && onDeleteFolder && (
                <DropdownMenuItem
                  onClick={() => onDeleteFolder(folder.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Render Children */}
        {hasChildren && expanded && (
          <div>
            {folder.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (folders.length === 0) {
    return (
      <div className="text-center py-8">
        <FolderTreeIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No folders yet</p>
        {onCreateFolder && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCreateFolder(null)}
            className="mt-4"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Create First Folder
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {folders.map(folder => renderFolder(folder, 0))}
    </div>
  )
}


