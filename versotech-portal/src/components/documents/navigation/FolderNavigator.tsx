'use client'

import React from 'react'
import {
  FolderOpen,
  FileText,
  Upload,
  FolderPlus,
  Search,
  Grid3x3,
  List,
  ArrowUpDown,
} from 'lucide-react'
import { DocumentFolder, Document } from '@/types/documents'
import { FolderCard, FolderCardSkeleton } from './FolderCard'
import { DocumentCard } from '../document-card'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FolderNavigatorProps {
  currentFolderId: string | null
  currentFolder: DocumentFolder | null
  subfolders: DocumentFolder[]
  documents: Document[]
  isLoading?: boolean
  viewMode?: 'grid' | 'list'
  sortBy?: 'name' | 'date' | 'type'
  onNavigateToFolder: (folderId: string) => void
  onDocumentClick: (documentId: string) => void
  onUploadClick: () => void
  onCreateFolderClick: () => void
  onRenameFolder?: (folderId: string) => void
  onDeleteFolder?: (folderId: string) => void
  onCreateSubfolder?: (parentId: string) => void
  onRenameDocument?: (documentId: string) => void
  onDeleteDocument?: (documentId: string) => void
  onViewModeChange?: (mode: 'grid' | 'list') => void
  onSortChange?: (sort: 'name' | 'date' | 'type') => void
  onSearchChange?: (query: string) => void
  searchQuery?: string
  className?: string
}

/**
 * FolderNavigator - Main Folder/Document Grid Component
 *
 * Professional file explorer with:
 * - Grid/list view toggle
 * - Sorting and search
 * - Empty states
 * - Loading skeletons
 * - Keyboard navigation
 *
 * Design: Financial Terminal Elegance
 */
export function FolderNavigator({
  currentFolderId,
  currentFolder,
  subfolders,
  documents,
  isLoading = false,
  viewMode = 'grid',
  sortBy = 'name',
  onNavigateToFolder,
  onDocumentClick,
  onUploadClick,
  onCreateFolderClick,
  onRenameFolder,
  onDeleteFolder,
  onCreateSubfolder,
  onRenameDocument,
  onDeleteDocument,
  onViewModeChange,
  onSortChange,
  onSearchChange,
  searchQuery = '',
  className,
}: FolderNavigatorProps) {
  const isEmpty = !isLoading && subfolders.length === 0 && documents.length === 0
  const hasContent = subfolders.length > 0 || documents.length > 0

  return (
    <div className={cn('flex flex-col h-full bg-[#0a0a0a]', className)}>
      {/* Toolbar - Always visible for search access */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 bg-black/40 border-b border-white/10">
        {/* Left: Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
          <Input
            type="text"
            placeholder="Search folders and documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => onSortChange?.(value as any)}>
            <SelectTrigger className="w-[140px] h-9 text-sm bg-white/5 border-white/10 text-white">
              <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-gray-400" strokeWidth={2} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              <SelectItem value="name" className="text-white focus:bg-white/10 focus:text-white">Name</SelectItem>
              <SelectItem value="date" className="text-white focus:bg-white/10 focus:text-white">Date Modified</SelectItem>
              <SelectItem value="type" className="text-white focus:bg-white/10 focus:text-white">Type</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center border border-white/10 rounded-md overflow-hidden">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:bg-white/10'
                )}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-4 h-4" strokeWidth={2} />
              </button>
              <div className="w-px h-6 bg-white/10" />
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'list'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:bg-white/10'
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="p-6">
            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              )}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <FolderCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && !isLoading && <EmptyState onUploadClick={onUploadClick} onCreateFolderClick={onCreateFolderClick} />}

        {/* Content Grid */}
        {!isEmpty && !isLoading && (
          <div className="p-6 space-y-8">
            {/* Folders Section */}
            {subfolders.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Folders
                  </h2>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-gray-500">{subfolders.length}</span>
                </div>
                <div
                  className={cn(
                    'grid gap-4',
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
                      : 'grid-cols-1 max-w-4xl'
                  )}
                >
                  {subfolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onNavigate={onNavigateToFolder}
                      onRename={onRenameFolder}
                      onDelete={onDeleteFolder}
                      onCreateSubfolder={onCreateSubfolder}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Documents Section */}
            {documents.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Documents
                  </h2>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-gray-500">{documents.length}</span>
                </div>
                <div
                  className={cn(
                    'grid gap-4',
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
                      : 'grid-cols-1 max-w-4xl'
                  )}
                >
                  {documents.map((document) => (
                    <DocumentCard
                      key={document.id}
                      document={document}
                      onPreview={() => onDocumentClick(document.id)}
                      onRename={onRenameDocument}
                      onDelete={onDeleteDocument}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Empty State Component (Professional, Actionable)
 */
function EmptyState({
  onUploadClick,
  onCreateFolderClick,
}: {
  onUploadClick: () => void
  onCreateFolderClick: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
        <FolderOpen className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold text-white mb-2">
        This folder is empty
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-8 text-center max-w-md leading-relaxed">
        Get started by uploading documents or creating subfolders to organize your files.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onUploadClick} size="default" className="min-w-[160px] bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="w-4 h-4 mr-2" strokeWidth={2} />
          Upload Documents
        </Button>
        <Button onClick={onCreateFolderClick} variant="outline" size="default" className="min-w-[160px] border-white/20 text-white hover:bg-white/10">
          <FolderPlus className="w-4 h-4 mr-2" strokeWidth={2} />
          New Folder
        </Button>
      </div>
    </div>
  )
}

