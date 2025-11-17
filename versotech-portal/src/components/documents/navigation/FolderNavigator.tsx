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
  onViewModeChange,
  onSortChange,
  onSearchChange,
  searchQuery = '',
  className,
}: FolderNavigatorProps) {
  const isEmpty = !isLoading && subfolders.length === 0 && documents.length === 0
  const hasContent = subfolders.length > 0 || documents.length > 0

  return (
    <div className={cn('flex flex-col h-full bg-slate-50', className)}>
      {/* Toolbar */}
      {hasContent && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 bg-white border-b border-slate-200">
          {/* Left: Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
            <Input
              type="text"
              placeholder="Search folders and documents..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 h-9 text-sm border-slate-200 focus:border-navy-500 focus:ring-navy-500"
            />
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => onSortChange?.(value as any)}>
              <SelectTrigger className="w-[140px] h-9 text-sm border-slate-200">
                <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-slate-500" strokeWidth={2} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date Modified</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            {onViewModeChange && (
              <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={cn(
                    'p-1.5 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-navy-100 text-navy-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" strokeWidth={2} />
                </button>
                <div className="w-px h-6 bg-slate-200" />
                <button
                  onClick={() => onViewModeChange('list')}
                  className={cn(
                    'p-1.5 transition-colors',
                    viewMode === 'list'
                      ? 'bg-navy-100 text-navy-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
          <div className="p-6">
            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1 max-w-4xl'
              )}
            >
              {/* Folders First */}
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

              {/* Documents Second */}
              {documents.map((document) => (
                <DocumentPreviewCard
                  key={document.id}
                  document={document}
                  onClick={() => onDocumentClick(document.id)}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                />
              ))}
            </div>
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
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 border border-slate-200">
        <FolderOpen className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        This folder is empty
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-8 text-center max-w-md leading-relaxed">
        Get started by uploading documents or creating subfolders to organize your files.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onUploadClick} size="default" className="min-w-[160px]">
          <Upload className="w-4 h-4 mr-2" strokeWidth={2} />
          Upload Documents
        </Button>
        <Button onClick={onCreateFolderClick} variant="outline" size="default" className="min-w-[160px]">
          <FolderPlus className="w-4 h-4 mr-2" strokeWidth={2} />
          New Folder
        </Button>
      </div>
    </div>
  )
}

/**
 * Document Preview Card (Temporary - will be replaced by refined DocumentCard)
 */
function DocumentPreviewCard({
  document,
  onClick,
  variant = 'default',
}: {
  document: Document
  onClick: () => void
  variant?: 'default' | 'compact'
}) {
  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="group flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
      >
        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium text-slate-900 truncate flex-1 text-left">
          {document.file_name}
        </span>
      </button>
    )
  }

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-slate-600" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 text-sm truncate mb-1">
            {document.file_name}
          </h3>
          <p className="text-xs text-slate-500">
            {document.type}
          </p>
        </div>
      </div>
    </div>
  )
}
