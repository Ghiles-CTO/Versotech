'use client'

/**
 * Tree Node
 *
 * Recursive component for rendering tree items (vehicles, folders, deals).
 * Features:
 * - Type-specific icons and colors
 * - Expand/collapse chevron
 * - Hover and selected states
 * - Document count badge
 * - Drag-drop target support
 */

import React from 'react'
import { cn } from '@/lib/utils'
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Database,
  Package,
  Users,
  User,
  Landmark,
  FileText,
} from 'lucide-react'

interface TreeNodeProps {
  type:
    | 'vehicle'
    | 'folder'
    | 'deal'
    | 'deals-group'
    | 'data-room'
    | 'investors-group'
    | 'investor'
    | 'account-group'
    | 'account'
    | 'doc-type'
  id: string
  name: string
  depth: number
  isExpanded?: boolean
  isSelected?: boolean
  isVirtual?: boolean
  documentCount?: number
  children?: React.ReactNode
  trailing?: React.ReactNode
  onToggle?: () => void
  onClick?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export function TreeNode({
  type,
  id,
  name,
  depth,
  isExpanded = false,
  isSelected = false,
  isVirtual = false,
  documentCount,
  children,
  trailing,
  onToggle,
  onClick,
  onDragOver,
  onDrop,
  onContextMenu,
}: TreeNodeProps) {
  // ---------------------------------------------------------------------------
  // Icon Selection
  // ---------------------------------------------------------------------------

  const getIcon = () => {
    switch (type) {
      case 'vehicle':
        return <Landmark className="h-4 w-4 text-blue-500 flex-shrink-0" />
      case 'folder':
        return isExpanded ? (
          <FolderOpen className="h-4 w-4 text-amber-500 flex-shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-amber-500 flex-shrink-0" />
        )
      case 'deal':
        return <Briefcase className="h-4 w-4 text-emerald-500 flex-shrink-0" />
      case 'deals-group':
        return <Package className="h-4 w-4 text-purple-500 flex-shrink-0" />
      case 'data-room':
        return <Database className="h-4 w-4 text-cyan-500 flex-shrink-0" />
      case 'investors-group':
        return <Users className="h-4 w-4 text-orange-500 flex-shrink-0" />
      case 'investor':
        return <User className="h-4 w-4 text-orange-400 flex-shrink-0" />
      case 'account-group':
        return <Users className="h-4 w-4 text-sky-500 flex-shrink-0" />
      case 'account':
        return <User className="h-4 w-4 text-sky-500 flex-shrink-0" />
      case 'doc-type':
        return <FileText className="h-4 w-4 text-amber-500 flex-shrink-0" />
      default:
        return <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    }
  }

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle?.()
  }

  const handleClick = (e: React.MouseEvent) => {
    // If has toggle and clicking on the row (not chevron), both toggle and navigate
    if (onToggle && !isExpanded) {
      onToggle()
    }
    onClick?.()
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const paddingLeft = depth * 12 + 8 // 12px per level, 8px base

  return (
    <div>
      <div
        className={cn(
          'group flex items-start gap-1.5 py-2 px-2 rounded-md cursor-pointer',
          'transition-all duration-150',
          'hover:bg-accent',
          isSelected && 'bg-primary/10 text-primary',
          isVirtual && 'opacity-80'
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onContextMenu={onContextMenu}
        role="treeitem"
        aria-expanded={children ? isExpanded : undefined}
        aria-selected={isSelected}
      >
        {/* Expand/Collapse Chevron */}
        <button
          className={cn(
            'flex items-center justify-center w-4 h-4 rounded',
            'transition-colors',
            onToggle ? 'hover:bg-muted' : 'invisible'
          )}
          onClick={onToggle ? handleChevronClick : undefined}
          tabIndex={-1}
          aria-hidden="true"
        >
          {onToggle &&
            (isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            ))}
        </button>

        {/* Icon */}
        {getIcon()}

        {/* Name */}
        <span
          className={cn(
            'flex-1 text-sm whitespace-normal break-words leading-snug',
            isSelected ? 'font-medium' : 'font-normal',
            isVirtual && 'italic'
          )}
          title={name}
        >
          {name}
        </span>

        {trailing && (
          <div
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {trailing}
          </div>
        )}

        {/* Document Count Badge */}
        {typeof documentCount === 'number' && documentCount > 0 && (
          <span
            className={cn(
              'text-xs text-muted-foreground',
              'px-1.5 py-0.5 rounded-full',
              'bg-muted/80',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-150'
            )}
          >
            {documentCount}
          </span>
        )}
      </div>

      {/* Children */}
      {children && isExpanded && (
        <div role="group" className="relative">
          {/* Connecting line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-border"
            style={{ left: `${paddingLeft + 7}px` }}
          />
          {children}
        </div>
      )}
    </div>
  )
}
