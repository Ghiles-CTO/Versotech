'use client'

/**
 * Documents Sidebar
 *
 * Premium sidebar with vehicle/folder tree navigation.
 * Features:
 * - Collapsible header with toggle
 * - Search input to filter tree
 * - Hierarchical tree with vehicles, folders, deals
 */

import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import type { BrowseMode } from '../context/types'
import { VehicleTree } from './VehicleTree'
import { DealTree } from './DealTree'
import { AccountsTree } from './AccountsTree'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
} from 'lucide-react'

interface DocumentsSidebarProps {
  className?: string
}

export function DocumentsSidebar({ className }: DocumentsSidebarProps) {
  const { state, dispatch } = useStaffDocuments()
  const { tree, ui } = state

  // ---------------------------------------------------------------------------
  // Tree Search
  // ---------------------------------------------------------------------------

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value
      dispatch({ type: 'SET_TREE_SEARCH_QUERY', query })

      // Debounced actual filter update would go here
      // For now, immediate update
      dispatch({ type: 'SET_DEBOUNCED_TREE_SEARCH', query })
    },
    [dispatch]
  )

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_TREE_SEARCH' })
  }, [dispatch])

  const handleBrowseModeChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_BROWSE_MODE', mode: value as BrowseMode })
    },
    [dispatch]
  )

  // ---------------------------------------------------------------------------
  // Collapse Toggle
  // ---------------------------------------------------------------------------

  const toggleCollapse = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR_COLLAPSED' })
  }, [dispatch])

  // ---------------------------------------------------------------------------
  // Create Folder
  // ---------------------------------------------------------------------------

  const handleCreateFolder = useCallback(() => {
    dispatch({
      type: 'OPEN_CREATE_FOLDER_DIALOG',
      parentId: state.navigation.currentFolderId,
    })
  }, [dispatch, state.navigation.currentFolderId])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
          Documents
        </h2>
        <div className="flex items-center gap-1">
          {ui.browseMode === 'vehicles' &&
            (state.navigation.selectedVehicleId || state.navigation.currentFolderId) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCreateFolder}
              title="Create folder"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hidden md:flex"
            onClick={toggleCollapse}
            title={ui.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {ui.sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border">
        <Tabs value={ui.browseMode} onValueChange={handleBrowseModeChange}>
          <TabsList className="grid grid-cols-3 h-9 mb-2">
            <TabsTrigger value="vehicles" className="text-xs">Vehicles</TabsTrigger>
            <TabsTrigger value="deals" className="text-xs">Deals</TabsTrigger>
            <TabsTrigger value="accounts" className="text-xs">Accounts</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={
              ui.browseMode === 'deals'
                ? 'Search deals...'
                : ui.browseMode === 'accounts'
                ? 'Search accounts...'
                : 'Search vehicles...'
            }
            value={tree.treeSearchQuery}
            onChange={handleSearchChange}
            className={cn(
              'h-8 pl-8 pr-8 text-sm',
              'bg-muted/50 border-transparent',
              'focus:bg-background focus:border-border',
              'placeholder:text-muted-foreground/60'
            )}
          />
          {tree.treeSearchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={clearSearch}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {ui.browseMode === 'vehicles' && <VehicleTree />}
          {ui.browseMode === 'deals' && <DealTree />}
          {ui.browseMode === 'accounts' && <AccountsTree />}
        </div>
      </ScrollArea>
    </div>
  )
}
