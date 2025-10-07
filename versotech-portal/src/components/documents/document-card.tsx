'use client'

import { Document, DocumentType } from '@/types/documents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Shield, Clock, Link2, Info, Building2, Folder } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface DocumentCardProps {
  document: Document
}

function getDocumentIcon(type: string) {
  const icons: Record<string, string> = {
    statement: '📊',
    report: '📈',
    legal: '📄',
    tax: '🧾',
    nda: '🔒',
    subscription: '✍️',
    agreement: '📝',
    term_sheet: '📋',
    kyc: '🆔',
    other: '📁'
  }
  return icons[type.toLowerCase()] || '📁'
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

export function DocumentCard({ document }: DocumentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)

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

      // Show watermark warning
      if (watermark) {
        toast.info(
          `Document will be watermarked with: ${watermark.downloaded_by}`,
          { duration: 5000 }
        )
      }

      // Trigger download
      window.open(download_url, '_blank')

      // Show expiry warning
      toast.success(
        `Download link generated. Expires in ${Math.floor(expires_in_seconds / 60)} minutes`,
        { duration: 5000 }
      )

    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download document. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const formattedSize = formatFileSize(document.file_size_bytes)
  const formattedType = formatDocumentType(document.type)
  const investorLabel = document.scope.investor?.legal_name
  const vehicle = document.scope.vehicle
  const holdingBadgeClasses = vehicle
    ? 'border-blue-200 bg-blue-50 text-blue-700'
    : 'border-slate-200 bg-slate-50 text-slate-700'
  const metadataHighlights = extractMetadataHighlights(document.metadata)
  const formattedDate = new Date(document.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className="group relative border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between">
        {/* Document Info */}
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-300">
            {getDocumentIcon(document.type)}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-900 transition-colors mb-1 truncate">
              {document.file_name}
            </h3>

            {/* Document classification */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600 mb-3">
              <Badge variant="outline" className="border-2 border-slate-200 bg-slate-50 text-slate-700">
                {formattedType}
              </Badge>
              <Badge
                variant="outline"
                className={`flex items-center gap-1 text-xs font-medium border-2 ${holdingBadgeClasses}`}
              >
                {vehicle ? <Building2 className="h-3 w-3" /> : <Folder className="h-3 w-3" />}
                {vehicle ? `Holding: ${vehicle.name}` : 'Holding: None'}
              </Badge>
              {vehicle?.type && (
                <Badge variant="outline" className="border-2 border-blue-100 bg-blue-50 text-blue-700 text-xs">
                  {vehicle.type}
                </Badge>
              )}
              {investorLabel && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs font-medium border-2 border-emerald-200 bg-emerald-50 text-emerald-700">
                  <span className="font-semibold">Entity:</span>
                  {investorLabel}
                </Badge>
              )}
              {document.watermark && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs font-medium border-2 border-blue-200 bg-blue-50 text-blue-700">
                  <Shield className="h-3 w-3" />
                  Watermarked
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formattedDate}
              </span>
              <span>{formattedSize}</span>
            </div>

            {metadataHighlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {metadataHighlights.map(({ label, value }) => (
                  <Badge
                    key={`${label}-${value}`}
                    variant="outline"
                    className="flex items-center gap-1 text-xs font-medium border-2 border-slate-200 bg-slate-50 text-slate-700"
                  >
                    <Info className="h-3 w-3" />
                    <span className="font-semibold">{label}:</span>
                    <span>{value}</span>
                  </Badge>
                ))}
              </div>
            )}

            {/* Created by */}
            {document.created_by && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                Uploaded by {document.created_by.display_name}
              </div>
            )}

            {/* Watermark notice */}
            {document.watermark && (
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-2">
                <Shield className="h-3 w-3" />
                <span>Watermarked & tracked</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 ml-4">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isDownloading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>

          {/* Future: Preview button */}
          {/* <Button
            variant="outline"
            size="sm"
            className="border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button> */}
        </div>
      </div>
    </div>
  )
}