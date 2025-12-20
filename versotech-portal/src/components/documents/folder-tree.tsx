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
            'hover:bg-blue-900/40 hover:border-blue-600',
            isSelected && 'bg-blue-800/60 border-blue-500 shadow-lg',
            'border border-transparent',
            level > 0 && 'ml-4'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="flex-shrink-0 p-0.5 hover:bg-gray-700 rounded"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
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
                folder.folder_type === 'vehicle_root' ? 'text-blue-400' :
                folder.folder_type === 'category' ? 'text-green-400' :
                'text-gray-400'
              )} />
            ) : (
              <Folder className={cn(
                "h-4 w-4",
                folder.folder_type === 'vehicle_root' ? 'text-blue-400' :
                folder.folder_type === 'category' ? 'text-green-400' :
                'text-gray-400'
              )} />
            )}
          </div>

          {/* Folder Name */}
          <button
            onClick={() => onSelectFolder(folder.id, folder)}
            className={cn(
              "flex-1 text-left text-sm font-medium truncate",
              isSelected ? 'text-white' : 'text-gray-300 hover:text-white'
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
                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
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
        <FolderTreeIcon className="h-12 w-12 mx-auto mb-2 text-gray-500" />
        <p className="text-sm text-gray-400">No folders yet</p>
        {onCreateFolder && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCreateFolder(null)}
            className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-blue-500"
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


