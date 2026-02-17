'use client'

/**
 * Staff Documents Layout Shell
 *
 * Main layout component that orchestrates the sidebar and content areas.
 * Features:
 * - Collapsible sidebar (280px default)
 * - Responsive drawer on mobile
 * - Drag-drop overlay for file uploads
 * - Premium glass aesthetics
 */

import React, { useCallback, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import { DocumentsSidebar } from '../sidebar/DocumentsSidebar'
import { DocumentsMainContent } from '../content/DocumentsMainContent'
import { BulkActionBar } from '../content/BulkActionBar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ChevronRight, Menu, Upload } from 'lucide-react'
import { toast } from 'sonner'

// File validation constants
const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1GB

export function StaffDocumentsLayout() {
  const { state, dispatch } = useStaffDocuments()
  const dragCounterRef = useRef(0)
  const resizingRef = useRef(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)

  // ---------------------------------------------------------------------------
  // File Validation
  // ---------------------------------------------------------------------------

  const validateDroppedFiles = useCallback(
    (files: File[]): { valid: File[]; invalid: { file: File; reason: string }[] } => {
      const valid: File[] = []
      const invalid: { file: File; reason: string }[] = []

      files.forEach((file) => {
        const isValidSize = file.size <= MAX_FILE_SIZE

        if (!isValidSize) {
          invalid.push({ file, reason: 'size' })
        } else {
          valid.push(file)
        }
      })

      return { valid, invalid }
    },
    []
  )

  // ---------------------------------------------------------------------------
  // Drag & Drop Handlers
  // ---------------------------------------------------------------------------

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current++

      const hasFiles =
        (e.dataTransfer.items && e.dataTransfer.items.length > 0) ||
        (e.dataTransfer.types && e.dataTransfer.types.includes('Files'))

      if (hasFiles) {
        dispatch({ type: 'SET_IS_DRAG_OVER', isDragOver: true })
      }
    },
    [dispatch]
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current--

      if (dragCounterRef.current === 0) {
        dispatch({ type: 'SET_IS_DRAG_OVER', isDragOver: false })
      }
    },
    [dispatch]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dispatch({ type: 'SET_IS_DRAG_OVER', isDragOver: false })
      dragCounterRef.current = 0

      const files = Array.from(e.dataTransfer.files)
      if (files.length === 0) return

      const { valid, invalid } = validateDroppedFiles(files)

      // Show errors for invalid files
      if (invalid.length > 0) {
        const sizeErrors = invalid.filter((i) => i.reason === 'size')

        if (sizeErrors.length > 0) {
          toast.error(
            `${sizeErrors.length} file(s) exceed 1GB limit: ${sizeErrors
              .map((i) => i.file.name)
              .join(', ')}`
          )
        }
      }

      // Open dialog with valid files
      if (valid.length > 0) {
        dispatch({ type: 'SET_DROPPED_FILES', files: valid })
        dispatch({ type: 'OPEN_UPLOAD_DIALOG' })
      }
    },
    [dispatch, validateDroppedFiles]
  )

  // ---------------------------------------------------------------------------
  // Sidebar Resize
  // ---------------------------------------------------------------------------

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (state.ui.sidebarCollapsed) return
      e.preventDefault()
      resizingRef.current = true
    },
    [state.ui.sidebarCollapsed]
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current || state.ui.sidebarCollapsed) return
      const nextWidth = Math.min(520, Math.max(240, e.clientX))
      setSidebarWidth(nextWidth)
    }

    const handleMouseUp = () => {
      resizingRef.current = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [state.ui.sidebarCollapsed])

  // ---------------------------------------------------------------------------
  // Bulk Action Handlers
  // ---------------------------------------------------------------------------

  const handleBulkMove = useCallback(() => {
    if (state.selection.selectedDocuments.size === 0) return
    dispatch({ type: 'OPEN_BULK_MOVE_DIALOG' })
  }, [state.selection.selectedDocuments.size, dispatch])

  const handleBulkDelete = useCallback(() => {
    if (state.selection.selectedDocuments.size === 0) return
    dispatch({ type: 'OPEN_BULK_DELETE_DIALOG' })
  }, [state.selection.selectedDocuments.size, dispatch])

  const { bulkDownload } = useStaffDocuments()

  const handleBulkDownload = useCallback(() => {
    const documentIds = Array.from(state.selection.selectedDocuments)
    if (documentIds.length === 0) return
    bulkDownload(documentIds)
  }, [state.selection.selectedDocuments, bulkDownload])

  const handleClearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' })
  }, [dispatch])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const selectedCount = state.selection.selectedDocuments.size

  return (
    <div
      className="relative flex h-[calc(100vh-4rem)] overflow-hidden bg-background"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-card/50 backdrop-blur-sm shrink-0',
          'transition-all duration-300 ease-in-out',
          state.ui.sidebarCollapsed ? 'w-0 overflow-hidden' : ''
        )}
        style={
          state.ui.sidebarCollapsed
            ? undefined
            : { width: sidebarWidth, minWidth: 240, maxWidth: 520 }
        }
      >
        <DocumentsSidebar />
      </aside>

      {!state.ui.sidebarCollapsed && (
        <div
          className="hidden md:block w-2 cursor-col-resize bg-border/40 hover:bg-primary/40 transition-colors"
          onMouseDown={handleResizeStart}
          aria-hidden="true"
        />
      )}

      {state.ui.sidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-card/80 border border-border shadow-sm"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR_COLLAPSED' })}
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Mobile Sidebar Drawer */}
      <Sheet
        open={state.ui.showTreeDrawer}
        onOpenChange={(open) => dispatch({ type: 'SET_SHOW_TREE_DRAWER', show: open })}
      >
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute top-4 left-4 z-10"
            aria-label="Open folder tree"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <DocumentsSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DocumentsMainContent />
      </main>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedCount}
        onMove={handleBulkMove}
        onDelete={handleBulkDelete}
        onDownload={handleBulkDownload}
        onClear={handleClearSelection}
      />

      {/* Drag Overlay */}
      {state.dragDrop.isDragOver && (
        <div
          className={cn(
            'absolute inset-0 z-50',
            'flex items-center justify-center',
            'bg-primary/5 backdrop-blur-sm',
            'border-2 border-dashed border-primary rounded-lg',
            'transition-all duration-200'
          )}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className={cn(
                'w-20 h-20 rounded-2xl',
                'bg-primary/10 border border-primary/20',
                'flex items-center justify-center',
                'animate-pulse'
              )}
            >
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Drop files to upload
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                All file types supported (max 1GB each)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
