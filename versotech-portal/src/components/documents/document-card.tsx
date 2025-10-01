'use client'

import { Document, DocumentType } from '@/types/documents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Eye, FileText, Shield, Clock } from 'lucide-react'
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

export function DocumentCard({ document }: DocumentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      const response = await fetch(`/api/documents/${document.id}/download`, {
        method: 'POST'
      })

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

  // Get scope display
  let scopeDisplay = 'General'
  let scopeColor = 'gray'

  if (document.scope.deal) {
    scopeDisplay = document.scope.deal.name
    scopeColor = 'purple'
  } else if (document.scope.vehicle) {
    scopeDisplay = document.scope.vehicle.name
    scopeColor = 'blue'
  } else if (document.scope.investor) {
    scopeDisplay = document.scope.investor.legal_name
    scopeColor = 'green'
  }

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

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
              <Badge variant="outline" className="text-xs font-medium border-2">
                {document.type}
              </Badge>
              <span>•</span>
              <Badge
                variant="outline"
                className={`text-xs font-medium border-2 border-${scopeColor}-200 bg-${scopeColor}-50 text-${scopeColor}-700`}
              >
                {scopeDisplay}
              </Badge>
              <span>•</span>
              <span className="text-xs">{formatFileSize(document.file_size_bytes)}</span>
              <span>•</span>
              <span className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(document.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Created by */}
            {document.created_by && (
              <div className="text-xs text-gray-500">
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