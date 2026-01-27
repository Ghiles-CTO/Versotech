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
  X,
  Loader2,
  ChevronRight,
  ChevronDown,
  FolderInput,
  Archive,
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
import { TagBadges } from '../tag-badges'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Search result from server-side search API
interface SearchResult {
  id: string
  name: string
  type: string
  file_size: number
  status: string
  created_at: string
  updated_at: string
  tags: string[] | null
  current_version: number | null
  document_expiry_date: string | null
  watermark: unknown
  folder_id: string | null
  folder_name: string | null
  vehicle_id: string | null
  vehicle_name: string | null
}

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
  // Global search props
  globalSearchQuery?: string
  onGlobalSearchChange?: (query: string) => void
  onClearSearch?: () => void
  isSearchMode?: boolean
  isSearching?: boolean
  searchResults?: SearchResult[]
  searchTotal?: number
  // Document selection props
  selectedDocuments?: Set<string>
  onToggleSelection?: (documentId: string) => void
  onSelectAll?: () => void
  onClearSelection?: () => void
  // Bulk action props
  onBulkMove?: () => void
  onBulkDelete?: () => void
  onBulkDownload?: () => void
  // Document drag props
  draggingDocumentId?: string | null
  onDocumentDragStart?: (e: React.DragEvent, documentId: string, documentName: string) => void
  onDocumentDragEnd?: (e: React.DragEvent) => void
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
  // Global search props
  globalSearchQuery = '',
  onGlobalSearchChange,
  onClearSearch,
  isSearchMode = false,
  isSearching = false,
  searchResults = [],
  searchTotal = 0,
  // Selection props
  selectedDocuments = new Set<string>(),
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  // Bulk action props
  onBulkMove,
  onBulkDelete,
  onBulkDownload,
  // Document drag props
  draggingDocumentId = null,
  onDocumentDragStart,
  onDocumentDragEnd,
}: FolderNavigatorProps) {
  const isEmpty = !isLoading && !isSearchMode && subfolders.length === 0 && documents.length === 0
  const hasContent = subfolders.length > 0 || documents.length > 0

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Toolbar - Always visible for search access */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 bg-muted/50 border-b border-border">
        {/* Left: Global Search + Selection Badge + Bulk Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Selection Count Badge */}
          {selectedDocuments.size > 0 && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 flex-shrink-0"
            >
              {selectedDocuments.size} selected
            </Badge>
          )}
          {/* Bulk Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedDocuments.size === 0}
                className={cn(
                  "h-9 flex-shrink-0",
                  selectedDocuments.size === 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                Actions
                <ChevronDown className="w-4 h-4 ml-2" strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={onBulkMove}
                disabled={selectedDocuments.size === 0}
              >
                <FolderInput className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                <span>Move to...</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onBulkDelete}
                disabled={selectedDocuments.size === 0}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
                <span>Delete</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onBulkDownload}
                disabled={selectedDocuments.size === 0}
              >
                <Archive className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                <span>Download ZIP</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative flex-1 sm:flex-initial sm:min-w-[300px]">
          {isSearching ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary animate-spin" strokeWidth={2} />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
          )}
          <Input
            type="text"
            placeholder="Search all documents..."
            value={globalSearchQuery}
            onChange={(e) => onGlobalSearchChange?.(e.target.value)}
            className={cn(
              "pl-10 h-9 text-sm",
              globalSearchQuery && "pr-10"
            )}
          />
          {globalSearchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          </div>
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
        {/* Search Mode - Show Search Results */}
        {isSearchMode && (
          <div className="p-6">
            {/* Search Results Header */}
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Search Results
              </h2>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">
                {isSearching ? 'Searching...' : `${searchTotal} result${searchTotal !== 1 ? 's' : ''}`}
              </span>
            </div>

            {/* Searching Loading State */}
            {isSearching && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" strokeWidth={2} />
                <p className="text-sm text-muted-foreground">Searching documents...</p>
              </div>
            )}

            {/* Empty Search Results */}
            {!isSearching && searchResults.length === 0 && (
              <SearchEmptyState query={globalSearchQuery} onClearSearch={onClearSearch} />
            )}

            {/* Search Results Grid/List */}
            {!isSearching && searchResults.length > 0 && (
              <>
                {viewMode === 'grid' && (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                    {searchResults.map((result) => (
                      <SearchResultCard
                        key={result.id}
                        result={result}
                        onClick={() => onDocumentClick(result.id)}
                      />
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_200px_150px_100px_140px] gap-4 px-4 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                      <div>Name</div>
                      <div>Location</div>
                      <div>Tags</div>
                      <div>Size</div>
                      <div>Date</div>
                    </div>
                    {/* Table Body */}
                    <div className="divide-y divide-border">
                      {searchResults.map((result) => (
                        <SearchResultRow
                          key={result.id}
                          result={result}
                          onClick={() => onDocumentClick(result.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Non-Search Mode Content */}
        {!isSearchMode && (
          <>
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
                  {/* Select All Checkbox */}
                  {onToggleSelection && (
                    <Checkbox
                      id="select-all-documents"
                      checked={documents.length > 0 && documents.every(doc => selectedDocuments.has(doc.id))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onSelectAll?.()
                        } else {
                          onClearSelection?.()
                        }
                      }}
                      className="flex-shrink-0"
                      aria-label="Select all documents"
                    />
                  )}
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
                        isSelected={selectedDocuments.has(document.id)}
                        onSelectToggle={onToggleSelection ? () => onToggleSelection(document.id) : undefined}
                        isDragging={draggingDocumentId === document.id}
                        onDragStart={onDocumentDragStart}
                        onDragEnd={onDocumentDragEnd}
                      />
                    ))}
                  </div>
                )}

                {/* List View - Table with columns */}
                {viewMode === 'list' && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    {/* Table Header - Clickable for sorting */}
                    <div className={cn(
                      "gap-4 px-4 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground grid",
                      onToggleSelection ? "grid-cols-[40px_1fr_150px_100px_140px_80px]" : "grid-cols-[1fr_150px_100px_140px_80px]"
                    )}>
                      {/* Checkbox Header */}
                      {onToggleSelection && (
                        <div className="flex items-center">
                          <Checkbox
                            id="select-all-list"
                            checked={documents.length > 0 && documents.every(doc => selectedDocuments.has(doc.id))}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                onSelectAll?.()
                              } else {
                                onClearSelection?.()
                              }
                            }}
                            aria-label="Select all documents"
                          />
                        </div>
                      )}
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
                      <div>Tags</div>
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
                          isSelected={selectedDocuments.has(document.id)}
                          onSelectToggle={onToggleSelection ? () => onToggleSelection(document.id) : undefined}
                          showCheckbox={!!onToggleSelection}
                          isDragging={draggingDocumentId === document.id}
                          onDragStart={onDocumentDragStart}
                          onDragEnd={onDocumentDragEnd}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Search Empty State Component
 */
function SearchEmptyState({
  query,
  onClearSearch,
}: {
  query: string
  onClearSearch?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 border border-border">
        <Search className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No results for &ldquo;{query}&rdquo;
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md leading-relaxed">
        Try adjusting your search terms or browse the folder tree to find what you&apos;re looking for.
      </p>

      {/* Actions */}
      {onClearSearch && (
        <Button onClick={onClearSearch} variant="outline" size="default">
          <X className="w-4 h-4 mr-2" strokeWidth={2} />
          Clear Search
        </Button>
      )}
    </div>
  )
}

/**
 * Search Result Card Component (Grid View)
 */
function SearchResultCard({
  result,
  onClick,
}: {
  result: SearchResult
  onClick: () => void
}) {
  const DocIcon = getDocumentIcon(result.type)
  const formattedSize = formatFileSize(result.file_size)
  const formattedDate = new Date(result.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Build path: Vehicle > Folder
  const pathParts: string[] = []
  if (result.vehicle_name) pathParts.push(result.vehicle_name)
  if (result.folder_name) pathParts.push(result.folder_name)
  const pathDisplay = pathParts.length > 0 ? pathParts.join(' > ') : 'Root'

  return (
    <div
      onClick={onClick}
      className="group relative p-4 rounded-lg border border-border bg-card hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      {/* Document Icon */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <DocIcon className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {result.name}
          </h4>
          {/* Path */}
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <ChevronRight className="w-3 h-3" />
            <span className="truncate">{pathDisplay}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {result.tags && result.tags.length > 0 && (
        <div className="mt-2">
          <TagBadges tags={result.tags} maxVisible={2} size="sm" />
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span>{formattedSize}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formattedDate}
        </span>
      </div>
    </div>
  )
}

/**
 * Search Result Row Component (List View)
 */
function SearchResultRow({
  result,
  onClick,
}: {
  result: SearchResult
  onClick: () => void
}) {
  const DocIcon = getDocumentIcon(result.type)
  const formattedSize = formatFileSize(result.file_size)
  const formattedDate = new Date(result.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Build path: Vehicle > Folder
  const pathParts: string[] = []
  if (result.vehicle_name) pathParts.push(result.vehicle_name)
  if (result.folder_name) pathParts.push(result.folder_name)
  const pathDisplay = pathParts.length > 0 ? pathParts.join(' > ') : 'Root'

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[1fr_200px_150px_100px_140px] gap-4 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer items-center"
    >
      {/* Name Column */}
      <div className="flex items-center gap-3 min-w-0">
        <DocIcon className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium text-foreground truncate">{result.name}</span>
      </div>

      {/* Location Column */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{pathDisplay}</span>
      </div>

      {/* Tags Column */}
      <div className="overflow-hidden">
        <TagBadges tags={result.tags} maxVisible={2} size="sm" />
      </div>

      {/* Size Column */}
      <div className="text-sm text-muted-foreground">{formattedSize}</div>

      {/* Date Column */}
      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
        {formattedDate}
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
  isSelected = false,
  onSelectToggle,
  showCheckbox = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: {
  document: Document
  onPreview: () => void
  onRename?: (id: string) => void
  onDelete?: (id: string) => void
  isSelected?: boolean
  onSelectToggle?: () => void
  showCheckbox?: boolean
  isDragging?: boolean
  onDragStart?: (e: React.DragEvent, documentId: string, documentName: string) => void
  onDragEnd?: (e: React.DragEvent) => void
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

  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, document.id, displayName)
    }
  }

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "gap-4 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer items-center grid",
        showCheckbox ? "grid-cols-[40px_1fr_150px_100px_140px_80px]" : "grid-cols-[1fr_150px_100px_140px_80px]",
        isSelected && "bg-primary/5",
        isDragging && "opacity-50 ring-2 ring-primary",
        onDragStart && "cursor-grab active:cursor-grabbing"
      )}
      onClick={onPreview}
    >
      {/* Checkbox Column */}
      {showCheckbox && (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectToggle?.()}
            aria-label={`Select ${displayName}`}
          />
        </div>
      )}
      {/* Name Column */}
      <div className="flex items-center gap-3 min-w-0">
        <DocIcon className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium text-foreground truncate">{displayName}</span>
      </div>

      {/* Tags Column */}
      <div className="overflow-hidden">
        <TagBadges tags={document.tags} maxVisible={2} size="sm" />
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

