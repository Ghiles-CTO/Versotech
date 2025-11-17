'use client'

import React from 'react'
import {
  Folder,
  FolderOpen,
  MoreVertical,
  Edit,
  Trash2,
  FolderPlus,
  ChevronRight,
} from 'lucide-react'
import { DocumentFolder } from '@/types/documents'
import { FOLDER_ICON_COLORS } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FolderCardProps {
  folder: DocumentFolder
  onNavigate: (folderId: string) => void
  onRename?: (folderId: string) => void
  onDelete?: (folderId: string) => void
  onCreateSubfolder?: (parentId: string) => void
  className?: string
  variant?: 'default' | 'compact'
}

/**
 * FolderCard - Professional Folder Display Component
 *
 * Institutional-grade folder card with:
 * - Refined hover states
 * - Precise iconography
 * - Context menu actions
 * - Keyboard navigation support
 *
 * Design: Financial Terminal Elegance
 */
export function FolderCard({
  folder,
  onNavigate,
  onRename,
  onDelete,
  onCreateSubfolder,
  className,
  variant = 'default',
}: FolderCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  // Get folder type styling
  const colorScheme = FOLDER_ICON_COLORS[folder.folder_type] || FOLDER_ICON_COLORS.custom

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onNavigate(folder.id)
    }
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={() => onNavigate(folder.id)}
        onKeyDown={handleKeyDown}
        className={cn(
          'group flex items-center gap-3 w-full',
          'px-3 py-2 rounded-md',
          'hover:bg-slate-100 transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-1',
          className
        )}
      >
        <Folder className="w-4 h-4 text-slate-500 flex-shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium text-slate-900 truncate flex-1 text-left">
          {folder.name}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'group relative',
        'bg-white border border-slate-200 rounded-lg',
        'hover:shadow-md hover:border-slate-300',
        'transition-all duration-200',
        'cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate(folder.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Navigate to folder ${folder.name}`}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Folder Icon */}
          <div
            className={cn(
              'w-11 h-11 rounded-lg border flex items-center justify-center',
              'flex-shrink-0 transition-all duration-200',
              colorScheme.bg,
              colorScheme.border,
              colorScheme.hoverBg,
              colorScheme.hoverBorder
            )}
          >
            {isHovered ? (
              <FolderOpen className={cn('w-5 h-5', colorScheme.icon)} strokeWidth={2} />
            ) : (
              <Folder className={cn('w-5 h-5', colorScheme.icon)} strokeWidth={2} />
            )}
          </div>

          {/* Folder Info */}
          <div className="flex-1 min-w-0">
            {/* Folder Name */}
            <h3 className="font-medium text-slate-900 text-sm truncate mb-1">
              {folder.name}
            </h3>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {folder.subfolder_count !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Folder className="w-3 h-3" strokeWidth={2} />
                  <span>{folder.subfolder_count}</span>
                </span>
              )}
              {folder.document_count !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 inline-flex items-center justify-center">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-3 h-3 text-slate-500"
                      strokeWidth={2}
                    >
                      <path
                        d="M9 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6M9 1l5 5M9 1v5h5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{folder.document_count}</span>
                </span>
              )}
            </div>

            {/* Folder Type Badge (subtle) */}
            {folder.folder_type === 'vehicle_root' && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-navy-50 text-navy-700 border border-navy-200">
                  Vehicle Root
                </span>
              </div>
            )}
          </div>

          {/* Context Menu */}
          {(onRename || onDelete || onCreateSubfolder) && (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger
                className={cn(
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                  'p-1 rounded hover:bg-slate-100',
                  'focus:outline-none focus:ring-2 focus:ring-navy-500',
                  isMenuOpen && 'opacity-100'
                )}
                onClick={(e) => {
                  e.stopPropagation() // Prevent folder navigation
                }}
              >
                <MoreVertical className="w-4 h-4 text-slate-600" strokeWidth={2} />
                <span className="sr-only">Folder actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onCreateSubfolder && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onCreateSubfolder(folder.id)
                    }}
                  >
                    <FolderPlus className="w-4 h-4 mr-2 text-navy-600" strokeWidth={2} />
                    <span>New Subfolder</span>
                  </DropdownMenuItem>
                )}
                {onRename && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onRename(folder.id)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2 text-slate-600" strokeWidth={2} />
                    <span>Rename</span>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(folder.id)
                      }}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Hover Indicator (subtle bottom border) */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 bg-navy-600',
          'transform scale-x-0 group-hover:scale-x-100',
          'transition-transform duration-200 origin-left',
          'rounded-b-lg'
        )}
      />
    </div>
  )
}

/**
 * Folder Card Skeleton (for loading states)
 */
export function FolderCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-lg p-4',
        'animate-pulse',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon skeleton */}
        <div className="w-11 h-11 rounded-lg bg-slate-100 flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}
