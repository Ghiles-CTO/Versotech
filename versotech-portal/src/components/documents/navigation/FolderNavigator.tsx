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
  ArrowUp,
  ArrowDown,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  FileSpreadsheet,
  FileCheck,
  Scale,
  Receipt,
  Lock,
  FileSignature,
  Clipboard,
  UserCheck,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { toast } from 'sonner'
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
  sortBy?: 'name' | 'date' | 'size'
  sortDir?: 'asc' | 'desc'
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
  onSortChange?: (sort: 'name' | 'date' | 'size') => void
  onSortDirChange?: (dir: 'asc' | 'desc') => void
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
  sortBy = 'date',
  sortDir = 'desc',
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
  onSortDirChange,
  onSearchChange,
  searchQuery = '',
  className,
}: FolderNavigatorProps) {
  const isEmpty = !isLoading && subfolders.length === 0 && documents.length === 0
  const hasContent = subfolders.length > 0 || documents.length > 0

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Toolbar - Always visible for search access */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 bg-muted/50 border-b border-border">
        {/* Left: Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
          <Input
            type="text"
            placeholder="Search folders and documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Sort Field */}
          <Select value={sortBy} onValueChange={(value) => onSortChange?.(value as 'name' | 'date' | 'size')}>
            <SelectTrigger className="w-[130px] h-9 text-sm">
              <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" strokeWidth={2} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Direction */}
          <Select value={sortDir} onValueChange={(value) => onSortDirChange?.(value as 'asc' | 'desc')}>
            <SelectTrigger className="w-[100px] h-9 text-sm">
              {sortDir === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 mr-2 text-muted-foreground" strokeWidth={2} />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" strokeWidth={2} />
              )}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-4 h-4" strokeWidth={2} />
              </button>
              <div className="w-px h-6 bg-border" />
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'list'
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
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
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Folders
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{subfolders.length}</span>
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
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Documents
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{documents.length}</span>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                    {documents.map((document) => (
                      <DocumentCard
                        key={document.id}
                        document={document}
                        onPreview={() => onDocumentClick(document.id)}
                        onRename={onRenameDocument}
                        onDelete={onDeleteDocument}
                        variant="default"
                      />
                    ))}
                  </div>
                )}

                {/* List View - Table with columns */}
                {viewMode === 'list' && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    {/* Table Header - Clickable for sorting */}
                    <div className="grid grid-cols-[1fr_100px_140px_80px] gap-4 px-4 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                      <button
                        onClick={() => onSortChange?.('name')}
                        className={cn(
                          'flex items-center gap-1 hover:text-foreground transition-colors text-left',
                          sortBy === 'name' && 'text-foreground'
                        )}
                      >
                        Name
                        {sortBy === 'name' && (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5" strokeWidth={2} />
                          )
                        )}
                      </button>
                      <button
                        onClick={() => onSortChange?.('size')}
                        className={cn(
                          'flex items-center gap-1 hover:text-foreground transition-colors text-left',
                          sortBy === 'size' && 'text-foreground'
                        )}
                      >
                        Size
                        {sortBy === 'size' && (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5" strokeWidth={2} />
                          )
                        )}
                      </button>
                      <button
                        onClick={() => onSortChange?.('date')}
                        className={cn(
                          'flex items-center gap-1 hover:text-foreground transition-colors text-left',
                          sortBy === 'date' && 'text-foreground'
                        )}
                      >
                        Date
                        {sortBy === 'date' && (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5" strokeWidth={2} />
                          )
                        )}
                      </button>
                      <div className="text-right">Actions</div>
                    </div>
                    {/* Table Body */}
                    <div className="divide-y divide-border">
                      {documents.map((document) => (
                        <DocumentListRow
                          key={document.id}
                          document={document}
                          onPreview={() => onDocumentClick(document.id)}
                          onRename={onRenameDocument}
                          onDelete={onDeleteDocument}
                        />
                      ))}
                    </div>
                  </div>
                )}
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
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 border border-border">
        <FolderOpen className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        This folder is empty
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md leading-relaxed">
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
 * Get icon for document type
 */
function getDocumentIcon(type: string) {
  const iconMap: Record<string, typeof FileText> = {
    statement: FileSpreadsheet,
    report: FileCheck,
    legal: Scale,
    tax: Receipt,
    nda: Lock,
    subscription: FileSignature,
    agreement: FileSignature,
    term_sheet: Clipboard,
    kyc: UserCheck,
    other: FileText,
  }
  return iconMap[type?.toLowerCase()] || FileText
}

/**
 * Format file size for display
 */
function formatFileSize(bytes?: number): string {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * Document List Row for table view
 */
function DocumentListRow({
  document,
  onPreview,
  onRename,
  onDelete,
}: {
  document: Document
  onPreview: () => void
  onRename?: (id: string) => void
  onDelete?: (id: string) => void
}) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const displayName = (document as any).file_name || (document as any).name || 'Untitled Document'
  const DocIcon = getDocumentIcon(document.type)
  const formattedSize = formatFileSize(document.file_size_bytes)
  const formattedDate = new Date(document.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/documents/${document.id}/download`)
      if (!response.ok) {
        toast.error('Failed to generate download link')
        return
      }
      const { download_url } = await response.json()
      window.open(download_url, '_blank')
      toast.success('Download started')
    } catch {
      toast.error('Failed to download document')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div
      className="grid grid-cols-[1fr_100px_140px_80px] gap-4 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer items-center"
      onClick={onPreview}
    >
      {/* Name Column */}
      <div className="flex items-center gap-3 min-w-0">
        <DocIcon className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium text-foreground truncate">{displayName}</span>
      </div>

      {/* Size Column */}
      <div className="text-sm text-muted-foreground">{formattedSize}</div>

      {/* Date Column */}
      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
        {formattedDate}
      </div>

      {/* Actions Column */}
      <div className="flex items-center justify-end">
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger
            className={cn(
              'p-1 rounded hover:bg-muted transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
            <span className="sr-only">Document actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onPreview()
              }}
            >
              <Eye className="w-4 h-4 mr-2 text-primary" strokeWidth={2} />
              <span>Preview</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleDownload()
              }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin text-muted-foreground" strokeWidth={2} />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                  <span>Download</span>
                </>
              )}
            </DropdownMenuItem>
            {onRename && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onRename(document.id)
                }}
              >
                <Edit className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                <span>Rename</span>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(document.id)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

