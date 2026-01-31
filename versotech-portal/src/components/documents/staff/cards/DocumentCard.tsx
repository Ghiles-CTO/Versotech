'use client'

/**
 * Document Card
 *
 * Premium document card with selection, drag, and quick actions.
 * Features:
 * - Selection checkbox (appears on hover)
 * - Type-specific icon with semantic color
 * - File info (type, size, date)
 * - Tag badges
 * - Version badge (if versioned)
 * - Quick actions on hover
 * - Draggable with visual feedback
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { StaffDocument } from '../context/types'
import { getDocumentDisplayName } from '@/lib/documents/document-name'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  File,
  Download,
  MoreHorizontal,
  Eye,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface DocumentCardProps {
  document: StaffDocument
  isSelected: boolean
  onSelect: () => void
  onClick: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  className?: string
}

export function DocumentCard({
  document,
  isSelected,
  onSelect,
  onClick,
  onDragStart,
  onDragEnd,
  onContextMenu,
  className,
}: DocumentCardProps) {
  const displayName = getDocumentDisplayName(document)

  // ---------------------------------------------------------------------------
  // File Type Icon
  // ---------------------------------------------------------------------------

  const getFileIcon = () => {
    const mimeType = document.mime_type || ''
    const ext = displayName.split('.').pop()?.toLowerCase() || ''

    if (mimeType.includes('pdf') || ext === 'pdf') {
      return <FileText className="w-6 h-6 text-red-500" />
    }
    if (mimeType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <FileImage className="w-6 h-6 text-purple-500" />
    }
    if (mimeType.includes('spreadsheet') || ['xlsx', 'xls', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
    }
    if (mimeType.includes('document') || ['docx', 'doc'].includes(ext)) {
      return <FileText className="w-6 h-6 text-blue-500" />
    }
    if (['txt', 'md', 'json', 'xml'].includes(ext)) {
      return <FileCode className="w-6 h-6 text-gray-500" />
    }
    return <File className="w-6 h-6 text-muted-foreground" />
  }

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
  // Get File Extension
  // ---------------------------------------------------------------------------

  const getFileExtension = (): string => {
    const ext = displayName.split('.').pop()?.toUpperCase() || ''
    return ext
  }

  // ---------------------------------------------------------------------------
  // Handle Selection Click
  // ---------------------------------------------------------------------------

  const handleSelectionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        'group relative flex flex-col p-4 rounded-xl',
        'bg-card/80 backdrop-blur-sm border border-border',
        'cursor-pointer select-none',
        'transition-all duration-200',
        'hover:bg-card hover:border-primary/20 hover:shadow-md',
        isSelected && 'ring-2 ring-primary bg-primary/5 border-primary/30',
        className
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Selection Checkbox */}
      <div
        className={cn(
          'absolute top-3 left-3 z-10',
          'opacity-0 group-hover:opacity-100',
          isSelected && 'opacity-100',
          'transition-opacity duration-150'
        )}
        onClick={handleSelectionClick}
      >
        <Checkbox
          checked={isSelected}
          className="h-5 w-5 border-2"
        />
      </div>

      {/* Quick Actions */}
      <div
        className={cn(
          'absolute top-3 right-3 z-10',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150'
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* File Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
          'bg-muted/50 group-hover:bg-muted',
          'transition-colors duration-200'
        )}
      >
        {getFileIcon()}
      </div>

      {/* Document Name */}
      <h3
        className={cn(
          'text-sm font-medium text-foreground w-full leading-snug',
          'line-clamp-4 break-words',
          'group-hover:text-primary transition-colors duration-200'
        )}
        title={displayName}
      >
        {displayName}
      </h3>

      {/* Meta Info */}
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        <span>{getFileExtension()}</span>
        <span>•</span>
        <span>{formatSize(document.file_size_bytes)}</span>
        <span>•</span>
        <span>{formatDate(document.created_at)}</span>
      </div>

      {/* Tags */}
      {document.tags && document.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {document.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={cn(
                'px-1.5 py-0.5 text-xs rounded',
                tag === 'urgent'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  : tag === 'review'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {tag}
            </span>
          ))}
          {document.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{document.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Version Badge */}
      {document.current_version && document.current_version > 1 && (
        <div className="absolute bottom-3 right-3">
          <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            v{document.current_version}
          </span>
        </div>
      )}
    </div>
  )
}
