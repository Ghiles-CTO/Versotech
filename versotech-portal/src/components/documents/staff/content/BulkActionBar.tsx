'use client'

/**
 * Bulk Action Bar
 *
 * Floating action bar that appears when documents are selected.
 * Features:
 * - Move, delete, download actions
 * - Selection count display
 * - Clear selection button
 * - Smooth slide-up animation
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FolderInput,
  Trash2,
  Download,
  X,
  CheckSquare,
} from 'lucide-react'

interface BulkActionBarProps {
  selectedCount: number
  onMove: () => void
  onDelete: () => void
  onDownload: () => void
  onClear: () => void
  className?: string
}

export function BulkActionBar({
  selectedCount,
  onMove,
  onDelete,
  onDownload,
  onClear,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'animate-in slide-in-from-bottom-4 fade-in duration-200',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-xl',
          'bg-card/95 backdrop-blur-md border border-border',
          'shadow-lg shadow-black/10'
        )}
      >
        {/* Selection Count */}
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMove}
            className="gap-2"
          >
            <FolderInput className="h-4 w-4" />
            <span className="hidden sm:inline">Move</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>

        {/* Clear */}
        <div className="pl-2 border-l border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
