'use client'

import React, { useState, useMemo } from 'react'
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Search,
  X,
} from 'lucide-react'
import { DocumentFolder } from '@/types/documents'
import { FOLDER_ICON_COLORS } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FolderTreeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: DocumentFolder[]
  currentFolderId: string | null
  onNavigate: (folderId: string | null) => void
}

/**
 * FolderTreeDrawer - Collapsible Sidebar with Full Tree
 *
 * Professional drawer component for power users who want
 * quick access to any folder in the hierarchy.
 *
 * Features:
 * - Searchable folder tree
 * - Expand/collapse folders
 * - Highlights current folder
 * - Keyboard shortcut support
 *
 * Design: Financial Terminal Elegance
 */
export function FolderTreeDrawer({
  open,
  onOpenChange,
  folders,
  currentFolderId,
  onNavigate,
}: FolderTreeDrawerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // Build tree structure from flat folder list
  const folderTree = useMemo(() => {
    return buildFolderTree(folders)
  }, [folders])

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return folderTree
    return filterTreeBySearch(folderTree, searchQuery.toLowerCase())
  }, [folderTree, searchQuery])

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  // Handle folder navigation
  const handleNavigate = (folderId: string | null) => {
    onNavigate(folderId)
    onOpenChange(false) // Close drawer after navigation
  }

  // Auto-expand current folder's ancestors
  React.useEffect(() => {
    if (currentFolderId && folders.length > 0) {
      const currentFolder = folders.find(f => f.id === currentFolderId)
      if (currentFolder) {
        const ancestorIds = getAncestorIds(currentFolder, folders)
        setExpandedFolders(prev => new Set([...prev, ...ancestorIds]))
      }
    }
  }, [currentFolderId, folders])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[500px] p-0 bg-background border-border">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="text-foreground">Browse All Folders</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Quick access to any folder in the hierarchy
          </SheetDescription>
        </SheetHeader>

        {/* Search */}
        <div className="px-6 py-4 border-b border-border bg-muted/50">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
              strokeWidth={2}
            />
            <Input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-9 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Folder Tree */}
        <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
          <div className="px-4 py-4">
            {/* Root Option */}
            <button
              onClick={() => handleNavigate(null)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                currentFolderId === null
                  ? 'bg-primary/20 text-primary border border-primary'
                  : 'text-muted-foreground hover:bg-muted border border-transparent'
              )}
            >
              <Folder className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <span>All Documents (Root)</span>
            </button>

            {/* Tree Nodes */}
            <div className="mt-2 space-y-0.5">
              {filteredTree.map((node) => (
                <FolderTreeNode
                  key={node.folder.id}
                  node={node}
                  level={0}
                  currentFolderId={currentFolderId}
                  expandedFolders={expandedFolders}
                  onToggle={toggleFolder}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredTree.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {searchQuery ? 'No folders match your search' : 'No folders found'}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/50">
          <p className="text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono text-foreground">
              Cmd+K
            </kbd>{' '}
            to open this drawer
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Tree Node Component (Recursive)
 */
interface TreeNode {
  folder: DocumentFolder
  children: TreeNode[]
}

interface FolderTreeNodeProps {
  node: TreeNode
  level: number
  currentFolderId: string | null
  expandedFolders: Set<string>
  onToggle: (folderId: string) => void
  onNavigate: (folderId: string) => void
}

function FolderTreeNode({
  node,
  level,
  currentFolderId,
  expandedFolders,
  onToggle,
  onNavigate,
}: FolderTreeNodeProps) {
  const isExpanded = expandedFolders.has(node.folder.id)
  const hasChildren = node.children.length > 0
  const isCurrent = currentFolderId === node.folder.id

  // Get folder color scheme
  const colorScheme =
    FOLDER_ICON_COLORS[node.folder.folder_type] || FOLDER_ICON_COLORS.custom

  return (
    <div>
      {/* Folder Row */}
      <div
        className={cn(
          'flex items-center gap-1 rounded-md transition-colors',
          isCurrent ? 'bg-primary/20 border border-primary' : 'hover:bg-muted border border-transparent'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.folder.id)}
            className="p-1 hover:bg-accent rounded transition-colors"
            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
            )}
          </button>
        ) : (
          <div className="w-5" /> // Spacer for alignment
        )}

        {/* Folder Button */}
        <button
          onClick={() => onNavigate(node.folder.id)}
          className="flex items-center gap-2 flex-1 py-2 pr-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
        >
          {isExpanded ? (
            <FolderOpen
              className={cn(
                'w-4 h-4 flex-shrink-0',
                colorScheme === FOLDER_ICON_COLORS.vehicle_root ? 'text-blue-500' :
                colorScheme === FOLDER_ICON_COLORS.category ? 'text-green-500' :
                'text-muted-foreground'
              )}
              strokeWidth={2}
            />
          ) : (
            <Folder
              className={cn(
                'w-4 h-4 flex-shrink-0',
                colorScheme === FOLDER_ICON_COLORS.vehicle_root ? 'text-blue-500' :
                colorScheme === FOLDER_ICON_COLORS.category ? 'text-green-500' :
                'text-muted-foreground'
              )}
              strokeWidth={2}
            />
          )}
          <span
            className={cn(
              'truncate font-medium',
              isCurrent ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {node.folder.name}
          </span>
          {node.folder.subfolder_count !== undefined && node.folder.subfolder_count > 0 && (
            <span className="text-xs text-muted-foreground">({node.folder.subfolder_count})</span>
          )}
        </button>
      </div>

      {/* Children (Recursive) */}
      {isExpanded && hasChildren && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <FolderTreeNode
              key={child.folder.id}
              node={child}
              level={level + 1}
              currentFolderId={currentFolderId}
              expandedFolders={expandedFolders}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Helper Functions
 */

function buildFolderTree(folders: DocumentFolder[]): TreeNode[] {
  const folderMap = new Map<string | null, TreeNode[]>()

  // Initialize map
  folders.forEach((folder) => {
    if (!folderMap.has(folder.parent_folder_id)) {
      folderMap.set(folder.parent_folder_id, [])
    }
    folderMap.get(folder.parent_folder_id)!.push({
      folder,
      children: [],
    })
  })

  // Build tree recursively
  function buildChildren(parentId: string | null): TreeNode[] {
    const children = folderMap.get(parentId) || []
    return children.map((node) => ({
      ...node,
      children: buildChildren(node.folder.id),
    }))
  }

  return buildChildren(null)
}

function filterTreeBySearch(tree: TreeNode[], query: string): TreeNode[] {
  return tree
    .map((node) => {
      const nameMatches = node.folder.name.toLowerCase().includes(query)
      const pathMatches = node.folder.path.toLowerCase().includes(query)
      const filteredChildren = filterTreeBySearch(node.children, query)

      if (nameMatches || pathMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        }
      }
      return null
    })
    .filter((node): node is TreeNode => node !== null)
}

function getAncestorIds(folder: DocumentFolder, allFolders: DocumentFolder[]): string[] {
  const ancestors: string[] = []
  let currentFolder: DocumentFolder | undefined = folder

  while (currentFolder?.parent_folder_id) {
    ancestors.push(currentFolder.parent_folder_id)
    currentFolder = allFolders.find((f) => f.id === currentFolder!.parent_folder_id)
  }

  return ancestors
}
