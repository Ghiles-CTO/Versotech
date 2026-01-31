'use client'

/**
 * Documents Main Content
 *
 * Main content area containing header, toolbar, and content grid/list.
 * Handles different modes: folder view, search results, data room.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import { ContentHeader } from './ContentHeader'
import { ContentToolbar } from './ContentToolbar'
import { ContentGrid } from './ContentGrid'
import { SearchResults } from './SearchResults'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'

interface DocumentsMainContentProps {
  className?: string
}

export function DocumentsMainContent({ className }: DocumentsMainContentProps) {
  const { state } = useStaffDocuments()
  const { search, data, navigation } = state

  // Local search query for filtering current view
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isLoading = data.loading || data.loadingDataRoom

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with breadcrumbs */}
      <ContentHeader />

      {/* Toolbar with search, sort, view toggle */}
      <ContentToolbar
        searchQuery={localSearchQuery}
        onSearchChange={setLocalSearchQuery}
      />

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : search.isSearchMode ? (
            <SearchResults />
          ) : (
            <ContentGrid searchQuery={localSearchQuery} />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
