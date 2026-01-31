'use client'

/**
 * Content Toolbar
 *
 * Search, sort, and view controls for the content area.
 * Features:
 * - Local search input (filters current view)
 * - Global search (Cmd+K)
 * - Sort dropdown (name, date, size)
 * - View mode toggle (grid/list)
 */

import React, { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Grid3X3,
  List,
  SlidersHorizontal,
  Command,
} from 'lucide-react'

interface ContentToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  className?: string
}

export function ContentToolbar({
  searchQuery,
  onSearchChange,
  className,
}: ContentToolbarProps) {
  const { state, dispatch, performSearch } = useStaffDocuments()
  const { ui, search } = state
  const globalSearchRef = useRef<HTMLInputElement>(null)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // ---------------------------------------------------------------------------
  // Global Search (Cmd+K)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        globalSearchRef.current?.focus()
      }
      if (e.key === 'Escape' && search.isSearchMode) {
        dispatch({ type: 'CLEAR_SEARCH' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [search.isSearchMode, dispatch])

  const handleGlobalSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value
      dispatch({ type: 'SET_GLOBAL_SEARCH_QUERY', query })

      // Clear previous timeout
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }

      // Exit search mode if empty
      if (!query.trim()) {
        dispatch({ type: 'CLEAR_SEARCH' })
        return
      }

      // Debounce search
      searchDebounceRef.current = setTimeout(() => {
        performSearch(query)
      }, 300)
    },
    [dispatch, performSearch]
  )

  const clearGlobalSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' })
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
  }, [dispatch])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Sort Handlers
  // ---------------------------------------------------------------------------

  const handleSortChange = useCallback(
    (sortBy: 'name' | 'date' | 'size') => {
      if (sortBy === ui.sortBy) {
        // Toggle direction if same column
        const newDir = ui.sortDir === 'asc' ? 'desc' : 'asc'
        dispatch({ type: 'SET_SORT', sortBy, dir: newDir })
      } else {
        // Smart defaults: date desc, name/size asc
        const newDir = sortBy === 'date' ? 'desc' : 'asc'
        dispatch({ type: 'SET_SORT', sortBy, dir: newDir })
      }
    },
    [ui.sortBy, ui.sortDir, dispatch]
  )

  // ---------------------------------------------------------------------------
  // View Mode Handler
  // ---------------------------------------------------------------------------

  const handleViewModeChange = useCallback(
    (mode: 'grid' | 'list') => {
      dispatch({ type: 'SET_VIEW_MODE', mode })
    },
    [dispatch]
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const getSortIcon = (sortBy: 'name' | 'date' | 'size') => {
    if (ui.sortBy !== sortBy) return null
    return ui.sortDir === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 ml-auto" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-auto" />
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center gap-3',
        'px-4 md:px-6 py-3',
        'border-b border-border bg-muted/30',
        className
      )}
    >
      {/* Global Search */}
      <div className="relative flex-1 max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={globalSearchRef}
          type="text"
          placeholder="Search all documents..."
          value={search.globalSearchQuery}
          onChange={handleGlobalSearchChange}
          className={cn(
            'h-9 pl-9 pr-20',
            'bg-background border-border',
            'focus:ring-2 focus:ring-primary/20'
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {search.globalSearchQuery ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearGlobalSearch}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-muted-foreground bg-muted border border-border rounded">
              <Command className="h-3 w-3" />K
            </kbd>
          )}
        </div>
        {search.isSearching && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Local Filter (when not in search mode) */}
      {!search.isSearchMode && (
        <div className="relative w-full sm:w-auto">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filter current view..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              'h-9 pl-9 pr-8 w-full sm:w-48',
              'bg-background border-border'
            )}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1 hidden sm:block" />

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">Sort</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => handleSortChange('name')}>
            Name
            {getSortIcon('name')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('date')}>
            Date
            {getSortIcon('date')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('size')}>
            Size
            {getSortIcon('size')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Toggle */}
      <div className="flex items-center border border-border rounded-md">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-9 px-3 rounded-r-none',
            ui.viewMode === 'grid' && 'bg-muted'
          )}
          onClick={() => handleViewModeChange('grid')}
          title="Grid view"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-9 px-3 rounded-l-none border-l border-border',
            ui.viewMode === 'list' && 'bg-muted'
          )}
          onClick={() => handleViewModeChange('list')}
          title="List view"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
