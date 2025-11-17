'use client'

import { Document, DocumentType } from '@/types/documents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Download,
  Shield,
  Clock,
  Link2,
  Info,
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
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DOCUMENT_TYPE_COLORS } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DocumentCardProps {
  document: Document
  onPreview?: (document: Document) => void
  variant?: 'default' | 'compact'
  className?: string
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function formatMetadataLabel(label: string) {
  return label
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function extractMetadataHighlights(metadata?: Document['metadata']) {
  if (!metadata) return [] as { label: string; value: string }[]

  const metadataRecord = metadata as Record<string, unknown>
  const highlights: { label: string; value: string }[] = []
  const preferredKeys = [
    'period',
    'reporting_period',
    'as_of',
    'as_of_date',
    'effective_date',
    'statement_date',
    'fiscal_year',
    'fiscal_quarter'
  ]

  preferredKeys.forEach((key) => {
    const value = metadataRecord[key]
    if (isNonEmptyString(value)) {
      highlights.push({ label: formatMetadataLabel(key), value })
    }
  })

  if (highlights.length === 0) {
    for (const [key, value] of Object.entries(metadataRecord)) {
      if (highlights.length >= 3) break
      if (preferredKeys.includes(key)) continue
      if (isNonEmptyString(value)) {
        highlights.push({ label: formatMetadataLabel(key), value })
      }
    }
  }

  return highlights
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
  variant = 'default',
  className,
}: DocumentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
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

  const formattedSize = formatFileSize(document.file_size_bytes)
  const formattedType = formatDocumentType(document.type)
  const investorLabel = document.scope.investor?.legal_name
  const vehicle = document.scope.vehicle
  const metadataHighlights = extractMetadataHighlights(document.metadata)
  const formattedDate = new Date(document.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Get document type color scheme
  const typeKey = document.type as keyof typeof DOCUMENT_TYPE_COLORS
  const colorScheme = DOCUMENT_TYPE_COLORS[typeKey] || DOCUMENT_TYPE_COLORS.Other
  const DocIcon = getDocumentIcon(document.type)

  // Compact variant for list view
  if (variant === 'compact') {
    return (
      <button
        onClick={() => onPreview?.(document)}
        className={cn(
          'group flex items-center gap-3 w-full px-3 py-2 rounded-md',
          'hover:bg-slate-100 transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-1',
          className
        )}
      >
        <DocIcon className="w-4 h-4 text-slate-500 flex-shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium text-slate-900 truncate flex-1 text-left">
          {document.file_name}
        </span>
        <span className="text-xs text-slate-500">{formattedSize}</span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'group relative bg-white border border-slate-200 rounded-lg',
        'hover:shadow-md hover:border-slate-300',
        'transition-all duration-200',
        'cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPreview?.(document)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Document Icon */}
          <div
            className={cn(
              'w-11 h-11 rounded-lg border flex items-center justify-center',
              'flex-shrink-0 transition-all duration-200',
              colorScheme.badge
            )}
          >
            <DocIcon className={cn('w-5 h-5', colorScheme.icon)} strokeWidth={2} />
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0">
            {/* File Name */}
            <h3 className="font-medium text-slate-900 text-sm truncate mb-1">
              {document.file_name}
            </h3>

            {/* Type & Size */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span>{formattedType}</span>
              <span>•</span>
              <span>{formattedSize}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={2} />
                {formattedDate}
              </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {vehicle && (
                <Badge
                  variant="outline"
                  className="text-xs border-navy-200 bg-navy-50 text-navy-700"
                >
                  <Building2 className="w-3 h-3 mr-1" strokeWidth={2} />
                  {vehicle.name}
                </Badge>
              )}
              {document.watermark && (
                <Badge
                  variant="outline"
                  className="text-xs border-slate-200 bg-slate-50 text-slate-700"
                >
                  <Shield className="w-3 h-3 mr-1" strokeWidth={2} />
                  Watermarked
                </Badge>
              )}
            </div>
          </div>

          {/* Context Menu */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger
              className={cn(
                'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                'p-1 rounded hover:bg-slate-100',
                'focus:outline-none focus:ring-2 focus:ring-navy-500',
                isMenuOpen && 'opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4 text-slate-600" strokeWidth={2} />
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
                  <Eye className="w-4 h-4 mr-2 text-navy-600" strokeWidth={2} />
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
                    <Clock className="w-4 h-4 mr-2 animate-spin text-slate-600" strokeWidth={2} />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2 text-slate-600" strokeWidth={2} />
                    <span>Download</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
 * Document Card Skeleton (for loading states)
 */
export function DocumentCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-lg p-4',
        'animate-pulse',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-slate-100 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}