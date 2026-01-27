'use client'

import { Document, DocumentType } from '@/types/documents'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Download,
  Shield,
  Clock,
  Building2,
  Folder,
  Eye,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Scale,
  Receipt,
  Lock,
  FileSignature,
  Clipboard,
  UserCheck,
  MoreVertical,
  Edit,
  Trash2,
  Tag,
  History,
  Upload,
  AlertTriangle,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TagBadges } from './tag-badges'
import { TagManagementPopover } from './tag-management-popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DocumentCardProps {
  document: Document
  onPreview?: (document: Document) => void
  onRename?: (documentId: string) => void
  onDelete?: (documentId: string) => void
  onTagsUpdated?: (documentId: string, newTags: string[]) => void
  onVersionHistory?: (documentId: string, documentName: string, currentVersion: number) => void
  onUploadNewVersion?: (documentId: string, documentName: string) => void
  variant?: 'default' | 'compact'
  className?: string
  // Selection props
  isSelected?: boolean
  onSelectToggle?: () => void
  // Drag props
  isDragging?: boolean
  onDragStart?: (e: React.DragEvent, documentId: string, documentName: string) => void
  onDragEnd?: (e: React.DragEvent) => void
}

/**
 * Get professional icon for document type (no emojis)
 */
function getDocumentIcon(type: string) {
  const iconMap: Record<string, typeof FileText> = {
    statement: FileSpreadsheet,
    report: FileCheck,
    legal: Scale,
    tax: Receipt,
    nda: Lock,
    subscription: FileSignature,
    agreement: FileSignature,
    term_sheet: Clipboard,
    kyc: UserCheck,
    other: FileText,
  }
  const IconComponent = iconMap[type.toLowerCase()] || FileText
  return IconComponent
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDocumentType(type: DocumentType | string) {
  const normalized = (type || 'Document').toString().replace(/_/g, ' ')
  return normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Check if a document has expired based on its expiry date
 */
function isDocumentExpired(expiryDate?: string | null): boolean {
  if (!expiryDate) return false
  return new Date(expiryDate) < new Date()
}

/**
 * Format expiry date for display
 */
function formatExpiryDate(expiryDate: string): string {
  return new Date(expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}


/**
 * DocumentCard - Professional Document Display Component
 *
 * Refined institutional design matching FolderCard aesthetic.
 * Features:
 * - Clean iconography (no emojis)
 * - Muted professional colors
 * - Subtle hover states
 * - Context menu actions
 *
 * Design: Financial Terminal Elegance
 */
export function DocumentCard({
  document,
  onPreview,
  onRename,
  onDelete,
  onTagsUpdated,
  onVersionHistory,
  onUploadNewVersion,
  variant = 'default',
  className,
  isSelected = false,
  onSelectToggle,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: DocumentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      const response = await fetch(`/api/documents/${document.id}/download`)

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Document not found or access denied')
        } else if (response.status === 401) {
          toast.error('Please sign in to download documents')
        } else {
          toast.error('Failed to generate download link')
        }
        return
      }

      const { download_url, watermark, expires_in_seconds } = await response.json()

      if (watermark) {
        toast.info(`Document will be watermarked with: ${watermark.downloaded_by}`, {
          duration: 5000,
        })
      }

      window.open(download_url, '_blank')

      toast.success(
        `Download link generated. Expires in ${Math.floor(expires_in_seconds / 60)} minutes`,
        { duration: 5000 }
      )
    } catch (error) {
      toast.error('Failed to download document. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle both file_name and name (for different document types)
  const displayName = document.file_name || (document as any).name || 'Untitled Document'

  const formattedSize = formatFileSize(document.file_size_bytes)
  const formattedType = formatDocumentType(document.type)
  const vehicle = document.scope?.vehicle
  const formattedDate = new Date(document.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const DocIcon = getDocumentIcon(document.type)

  // Compact variant for list view
  if (variant === 'compact') {
    return (
      <button
        onClick={() => onPreview?.(document)}
        className={cn(
          'group flex items-center gap-3 w-full px-4 py-3 rounded-md',
          'hover:bg-muted transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
          className
        )}
      >
        <DocIcon className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium text-foreground flex-1 text-left break-words line-clamp-1">
          {displayName}
        </span>
        <span className="text-sm text-muted-foreground flex-shrink-0">{formattedSize}</span>
      </button>
    )
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, document.id, displayName)
    }
  }

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'group relative bg-card border border-border rounded-lg shadow-sm',
        'hover:bg-muted/50 hover:border-border hover:shadow-md',
        'transition-all duration-200',
        'cursor-pointer',
        isSelected && 'bg-primary/5 border-primary/50',
        isDragging && 'opacity-50 ring-2 ring-primary',
        onDragStart && 'cursor-grab active:cursor-grabbing',
        className
      )}
      onClick={() => onPreview?.(document)}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Selection Checkbox */}
          {onSelectToggle && (
            <div
              className="flex-shrink-0 pt-1"
              onClick={(e) => {
                e.stopPropagation()
                onSelectToggle()
              }}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelectToggle()}
                aria-label={`Select ${displayName}`}
              />
            </div>
          )}
          {/* Document Icon */}
          <div
            className={cn(
              'w-14 h-14 rounded-lg border border-border flex items-center justify-center',
              'flex-shrink-0 transition-all duration-200',
              'bg-muted/50'
            )}
          >
            <DocIcon className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {/* File Name - Allow wrapping for long names */}
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-semibold text-foreground text-sm leading-tight break-words line-clamp-2 flex-1">
                {displayName}
              </h3>
              {/* Expired Warning - show AlertTriangle for expired documents */}
              {isDocumentExpired(document.document_expiry_date) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-shrink-0 p-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={2} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Expired on {formatExpiryDate(document.document_expiry_date!)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {/* Version Badge - only show for versioned documents */}
              {document.current_version && document.current_version > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onVersionHistory?.(document.id, displayName, document.current_version || 1)
                  }}
                  className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                  title="View version history"
                >
                  v{document.current_version}
                </button>
              )}
            </div>

            {/* Type & Size */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{formattedType}</span>
              <span>•</span>
              <span>{formattedSize}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                {formattedDate}
              </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {vehicle && (
                <Badge
                  variant="outline"
                  className="text-xs border-blue-200 bg-blue-50 text-blue-700"
                >
                  <Building2 className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                  {vehicle.name}
                </Badge>
              )}
              {document.folder && (
                <Badge
                  variant="outline"
                  className="text-xs border-purple-200 bg-purple-50 text-purple-700"
                >
                  <Folder className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                  {document.folder.path}
                </Badge>
              )}
              {document.watermark && (
                <Badge
                  variant="outline"
                  className="text-xs border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
                >
                  <Shield className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                  CONFIDENTIAL
                </Badge>
              )}
            </div>

            {/* Tags - Grid View: Show below document name */}
            <TagBadges tags={document.tags} maxVisible={2} className="mt-2" />
          </div>

          {/* Context Menu */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger
              className={cn(
                'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                'p-1 rounded hover:bg-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                isMenuOpen && 'opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
              <span className="sr-only">Document actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onPreview && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onPreview(document)
                  }}
                >
                  <Eye className="w-4 h-4 mr-2 text-primary" strokeWidth={2} />
                  <span>Preview</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload()
                }}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin text-muted-foreground" strokeWidth={2} />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                    <span>Download</span>
                  </>
                )}
              </DropdownMenuItem>
              {onRename && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onRename(document.id)
                  }}
                >
                  <Edit className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                  <span>Rename</span>
                </DropdownMenuItem>
              )}
              <TagManagementPopover
                documentId={document.id}
                documentName={displayName}
                currentTags={document.tags || []}
                onTagsUpdated={(newTags) => onTagsUpdated?.(document.id, newTags)}
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Tag className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                    <span>Manage Tags</span>
                  </DropdownMenuItem>
                }
              />
              {onVersionHistory && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onVersionHistory(document.id, displayName, document.current_version || 1)
                  }}
                >
                  <History className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                  <span>Version History</span>
                </DropdownMenuItem>
              )}
              {onUploadNewVersion && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onUploadNewVersion(document.id, displayName)
                  }}
                >
                  <Upload className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                  <span>Upload New Version</span>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(document.id)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hover Indicator (subtle bottom border) */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 bg-primary',
          'transform scale-x-0 group-hover:scale-x-100',
          'transition-transform duration-200 origin-left',
          'rounded-b-lg'
        )}
      />
    </div>
  )
}

/**
 * Document Card Skeleton (for loading states)
 */
export function DocumentCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4 shadow-sm',
        'animate-pulse',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-muted flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}