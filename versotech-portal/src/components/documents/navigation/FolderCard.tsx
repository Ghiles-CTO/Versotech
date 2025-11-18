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
          'px-4 py-3 rounded-md',
          'hover:bg-white/10 transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          className
        )}
      >
        <Folder className="w-5 h-5 text-blue-400 flex-shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium text-white flex-1 text-left break-words line-clamp-1">
          {folder.name}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'group relative',
        'bg-white/5 border border-white/10 rounded-lg',
        'hover:bg-white/10 hover:border-white/20',
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
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Folder Icon */}
          <div
            className={cn(
              'w-14 h-14 rounded-lg border flex items-center justify-center',
              'flex-shrink-0 transition-all duration-200',
              colorScheme.bg,
              colorScheme.border,
              colorScheme.hoverBg,
              colorScheme.hoverBorder
            )}
          >
            {isHovered ? (
              <FolderOpen className={cn('w-6 h-6', colorScheme.icon)} strokeWidth={2} />
            ) : (
              <Folder className={cn('w-6 h-6', colorScheme.icon)} strokeWidth={2} />
            )}
          </div>

          {/* Folder Info */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {/* Folder Name - Allow wrapping for long names */}
            <h3 className="font-semibold text-white text-sm leading-tight mb-2 break-words line-clamp-2">
              {folder.name}
            </h3>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-sm text-gray-400">
              {folder.subfolder_count !== undefined && (
                <span className="inline-flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{folder.subfolder_count}</span>
                </span>
              )}
              {folder.document_count !== undefined && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 inline-flex items-center justify-center">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-3.5 h-3.5 text-gray-400"
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
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30">
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
                  'p-1 rounded hover:bg-white/10',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isMenuOpen && 'opacity-100'
                )}
                onClick={(e) => {
                  e.stopPropagation() // Prevent folder navigation
                }}
              >
                <MoreVertical className="w-4 h-4 text-gray-400" strokeWidth={2} />
                <span className="sr-only">Folder actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-white/10">
                {onCreateSubfolder && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onCreateSubfolder(folder.id)
                    }}
                    className="text-gray-200 focus:bg-white/10 focus:text-white"
                  >
                    <FolderPlus className="w-4 h-4 mr-2 text-blue-400" strokeWidth={2} />
                    <span>New Subfolder</span>
                  </DropdownMenuItem>
                )}
                {onRename && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onRename(folder.id)
                    }}
                    className="text-gray-200 focus:bg-white/10 focus:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2 text-gray-400" strokeWidth={2} />
                    <span>Rename</span>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(folder.id)
                      }}
                      className="text-red-400 focus:text-red-300 focus:bg-red-500/20"
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
          'absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500',
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
        'bg-white/5 border border-white/10 rounded-lg p-4',
        'animate-pulse',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon skeleton */}
        <div className="w-11 h-11 rounded-lg bg-white/10 flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}
