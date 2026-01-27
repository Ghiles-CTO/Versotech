'use client'

import React, { Fragment } from 'react'
import { Home, ChevronRight, Folder, Building2 } from 'lucide-react'
import { Breadcrumb, DocumentFolder } from '@/types/documents'
import { cn } from '@/lib/utils'

interface FolderBreadcrumbsProps {
  currentFolder: DocumentFolder | null
  onNavigate: (folderId: string | null) => void
  /** Vehicle context for the current folder hierarchy */
  vehicle?: { id: string; name: string } | null
  /** Called when user clicks the vehicle segment (navigates to vehicle's root) */
  onVehicleClick?: () => void
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
  vehicle,
  onVehicleClick,
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
        'bg-muted/50 border-b border-border',
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
          !currentFolder && !vehicle
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
        aria-label="Navigate to root"
        aria-current={!currentFolder && !vehicle ? 'page' : undefined}
      >
        <Home className="w-4 h-4" strokeWidth={2} />
      </button>

      {/* Vehicle Segment (if vehicle context exists) */}
      {vehicle && (
        <>
          <ChevronRight
            className="w-4 h-4 text-muted-foreground/60 flex-shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
          {!currentFolder ? (
            // Vehicle is current location - not clickable, emphasized
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-md">
              <Building2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {vehicle.name}
              </span>
            </div>
          ) : (
            // Vehicle is parent - clickable
            <button
              onClick={onVehicleClick}
              className={cn(
                'flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-md',
                'hover:text-foreground hover:bg-accent',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'transition-all duration-150',
                'truncate max-w-[160px]'
              )}
              title={vehicle.name}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" strokeWidth={2} />
              {vehicle.name}
            </button>
          )}
        </>
      )}

      {/* Breadcrumb Trail (folder segments) */}
      {displayBreadcrumbs.map((crumb, index) => {
        const isLast = index === displayBreadcrumbs.length - 1
        const isEllipsis = crumb.id === '...'

        return (
          <Fragment key={crumb.id || index}>
            {/* Separator */}
            <ChevronRight
              className="w-4 h-4 text-muted-foreground/60 flex-shrink-0"
              strokeWidth={2}
              aria-hidden="true"
            />

            {/* Breadcrumb Segment */}
            {isEllipsis ? (
              // Ellipsis indicator
              <span className="text-sm text-muted-foreground px-2 select-none">
                {crumb.name}
              </span>
            ) : isLast ? (
              // Current location - not clickable, emphasized
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-md">
                <Folder className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
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
                  'text-sm text-muted-foreground px-3 py-1.5 rounded-md',
                  'hover:text-foreground hover:bg-accent',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
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
        <div className="ml-auto hidden lg:flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="opacity-60">Path:</span>
          <span className="px-2 py-1 bg-muted rounded border border-border text-muted-foreground">
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
  vehicle,
  className,
}: FolderBreadcrumbsProps) {
  return (
    <nav
      className={cn(
        'flex items-center gap-2 px-4 py-2.5',
        'bg-muted/50 border-b border-border',
        className
      )}
      aria-label="Folder navigation"
    >
      {/* Back Button */}
      <button
        onClick={() => onNavigate(null)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Back to root"
      >
        <Home className="w-4 h-4" />
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />

      {/* Vehicle Name (if exists) */}
      {vehicle && (
        <>
          <span className="text-sm text-muted-foreground truncate max-w-[100px]">
            {vehicle.name}
          </span>
          {currentFolder && (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          )}
        </>
      )}

      {/* Current Folder Name */}
      <span className="text-sm font-medium text-foreground truncate">
        {currentFolder?.name || (vehicle ? vehicle.name : 'All Documents')}
      </span>
    </nav>
  )
}
