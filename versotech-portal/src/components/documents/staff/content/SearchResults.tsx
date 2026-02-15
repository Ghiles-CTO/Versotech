'use client'

/**
 * Search Results
 *
 * Displays global search results with document context.
 * Features:
 * - Shows vehicle/folder context for each result
 * - Click to navigate to document location
 * - Preview document from search
 */

import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import { getDocumentDisplayName } from '@/lib/documents/document-name'
import {
  FileText,
  Building2,
  Folder,
  Search,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchResultsProps {
  className?: string
}

export function SearchResults({ className }: SearchResultsProps) {
  const { state, dispatch, navigateToFolder } = useStaffDocuments()
  const { search } = state

  // Document viewer
  const {
    isOpen: previewOpen,
    document: previewDocument,
    previewUrl,
    isLoading: isLoadingPreview,
    error: previewError,
    openPreview,
    closePreview,
    downloadDocument: downloadFromPreview,
    watermark: previewWatermark,
  } = useDocumentViewer()

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleResultClick = useCallback(
    (result: typeof search.searchResults[0]) => {
      const displayName = getDocumentDisplayName({ name: result.name })
      openPreview({
        id: result.id,
        file_name: displayName,
        file_size_bytes: result.file_size,
      })
    },
    [openPreview]
  )

  const handleNavigateToLocation = useCallback(
    (folderId: string | null) => {
      dispatch({ type: 'CLEAR_SEARCH' })
      navigateToFolder(folderId)
    },
    [dispatch, navigateToFolder]
  )

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' })
  }, [dispatch])

  // ---------------------------------------------------------------------------
  // Format File Size
  // ---------------------------------------------------------------------------

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ---------------------------------------------------------------------------
  // Format Date
  // ---------------------------------------------------------------------------

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (search.searchResults.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          No results found
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          No documents match "{search.globalSearchQuery}"
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={clearSearch}
        >
          <X className="h-4 w-4 mr-2" />
          Clear search
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {search.searchTotal} result{search.searchTotal !== 1 ? 's' : ''} for "
            <span className="font-medium text-foreground">
              {search.globalSearchQuery}
            </span>
            "
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Results List */}
        <div className="space-y-2">
          {search.searchResults.map((result) => {
            const displayName = getDocumentDisplayName({ name: result.name })
            return (
              <div
                key={result.id}
                className={cn(
                  'group flex items-start gap-4 p-4 rounded-lg',
                  'bg-card border border-border',
                  'hover:border-primary/20 hover:shadow-sm',
                  'transition-all duration-150 cursor-pointer'
                )}
                onClick={() => handleResultClick(result)}
              >
              {/* Icon */}
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  'bg-primary/10'
                )}
              >
                <FileText className="h-5 w-5 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Document Name */}
                <h4 className="font-medium text-foreground line-clamp-2 break-words group-hover:text-primary transition-colors">
                  {displayName}
                </h4>

                {/* Meta Info */}
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{result.type}</span>
                  <span>•</span>
                  <span>{formatSize(result.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(result.created_at)}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mt-2">
                  {result.vehicle_name && (
                    <button
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNavigateToLocation(null)
                      }}
                    >
                      <Building2 className="h-3 w-3" />
                      {result.vehicle_name}
                    </button>
                  )}
                  {result.folder_name && (
                    <>
                      <span className="text-muted-foreground/50">/</span>
                      <button
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigateToLocation(result.folder_id)
                        }}
                      >
                        <Folder className="h-3 w-3" />
                        {result.folder_name}
                      </button>
                    </>
                  )}
                </div>

                {/* Tags */}
                {result.tags && result.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {result.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {result.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{result.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Version Badge */}
              {result.current_version && result.current_version > 1 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  v{result.current_version}
                </span>
              )}
            </div>
            )
          })}
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentViewerFullscreen
        isOpen={previewOpen}
        document={previewDocument}
        previewUrl={previewUrl}
        isLoading={isLoadingPreview}
        error={previewError}
        onClose={closePreview}
        onDownload={downloadFromPreview}
        watermark={previewWatermark}
      />
    </>
  )
}
