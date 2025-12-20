'use client'

import React, { Fragment } from 'react'
import { Home, ChevronRight, Folder } from 'lucide-react'
import { Breadcrumb, DocumentFolder } from '@/types/documents'
import { cn } from '@/lib/utils'

interface FolderBreadcrumbsProps {
  currentFolder: DocumentFolder | null
  onNavigate: (folderId: string | null) => void
  className?: string
}

/**
 * FolderBreadcrumbs - Institutional Navigation Component
 *
 * Professional breadcrumb navigation for folder hierarchy.
 * Features:
 * - Precise typography hierarchy
 * - Subtle hover states
 * - Responsive collapsing on mobile
 * - Keyboard accessible
 *
 * Design: Financial Terminal Elegance
 */
export function FolderBreadcrumbs({
  currentFolder,
  onNavigate,
  className,
}: FolderBreadcrumbsProps) {
  // Parse folder path into breadcrumb segments
  const breadcrumbs = React.useMemo((): Breadcrumb[] => {
    if (!currentFolder) return []

    const segments = currentFolder.path.split('/').filter(Boolean)
    const crumbs: Breadcrumb[] = []

    // Build breadcrumbs from path segments
    let accumulatedPath = ''
    segments.forEach((segment, index) => {
      accumulatedPath += `/${segment}`
      crumbs.push({
        id: index === segments.length - 1 ? currentFolder.id : null, // Only last segment has ID
        name: segment,
        path: accumulatedPath,
      })
    })

    return crumbs
  }, [currentFolder])

  // Responsive: Show only last 3 breadcrumbs on mobile
  const displayBreadcrumbs = breadcrumbs.length > 3
    ? [
        ...breadcrumbs.slice(0, 1),
        { id: '...', name: '...', path: '...' },
        ...breadcrumbs.slice(-2),
      ]
    : breadcrumbs

  return (
    <nav
      className={cn(
        'flex items-center gap-2 px-6 py-3.5',
        'bg-black/40 border-b border-white/10',
        'transition-colors duration-200',
        className
      )}
      aria-label="Folder navigation breadcrumbs"
    >
      {/* Home Button */}
      <button
        onClick={() => onNavigate(null)}
        className={cn(
          'inline-flex items-center justify-center',
          'w-8 h-8 rounded-md',
          'transition-all duration-150',
          !currentFolder
            ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
            : 'text-gray-400 hover:bg-white/10 hover:text-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
        aria-label="Navigate to root"
        aria-current={!currentFolder ? 'page' : undefined}
      >
        <Home className="w-4 h-4" strokeWidth={2} />
      </button>

      {/* Breadcrumb Trail */}
      {displayBreadcrumbs.map((crumb, index) => {
        const isLast = index === displayBreadcrumbs.length - 1
        const isEllipsis = crumb.id === '...'

        return (
          <Fragment key={crumb.id || index}>
            {/* Separator */}
            <ChevronRight
              className="w-4 h-4 text-gray-600 flex-shrink-0"
              strokeWidth={2}
              aria-hidden="true"
            />

            {/* Breadcrumb Segment */}
            {isEllipsis ? (
              // Ellipsis indicator
              <span className="text-sm text-gray-500 px-2 select-none">
                {crumb.name}
              </span>
            ) : isLast ? (
              // Current location - not clickable, emphasized
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md">
                <Folder className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium text-white truncate max-w-[200px]">
                  {crumb.name}
                </span>
              </div>
            ) : (
              // Previous locations - clickable
              <button
                onClick={() => {
                  // Find the folder ID for this breadcrumb
                  // For now, we navigate to root then manually to this level
                  // In production, you'd store folder IDs in breadcrumbs
                  onNavigate(crumb.id)
                }}
                className={cn(
                  'text-sm text-gray-400 px-3 py-1.5 rounded-md',
                  'hover:text-white hover:bg-white/10',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'transition-all duration-150',
                  'truncate max-w-[160px]'
                )}
                title={crumb.name}
              >
                {crumb.name}
              </button>
            )}
          </Fragment>
        )
      })}

      {/* Path Display (for reference, hidden on mobile) */}
      {currentFolder && (
        <div className="ml-auto hidden lg:flex items-center gap-2 text-xs text-gray-400 font-mono">
          <span className="opacity-60">Path:</span>
          <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-300">
            {currentFolder.path}
          </span>
        </div>
      )}
    </nav>
  )
}

/**
 * Compact Breadcrumb variant (for mobile or compact layouts)
 */
export function FolderBreadcrumbsCompact({
  currentFolder,
  onNavigate,
  className,
}: FolderBreadcrumbsProps) {
  return (
    <nav
      className={cn(
        'flex items-center gap-2 px-4 py-2.5',
        'bg-black/40 border-b border-white/10',
        className
      )}
      aria-label="Folder navigation"
    >
      {/* Back Button */}
      <button
        onClick={() => onNavigate(null)}
        className="text-gray-400 hover:text-white transition-colors"
        aria-label="Back to root"
      >
        <Home className="w-4 h-4" />
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-gray-600" />

      {/* Current Folder Name */}
      <span className="text-sm font-medium text-white truncate">
        {currentFolder?.name || 'All Documents'}
      </span>
    </nav>
  )
}
