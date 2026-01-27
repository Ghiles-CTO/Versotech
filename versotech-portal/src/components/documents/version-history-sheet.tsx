'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  History,
  Download,
  User,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  HardDrive
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  file_key: string
  file_size_bytes: number | null
  mime_type: string | null
  changes_description: string | null
  created_by: string | null
  created_at: string
  created_by_profile?: {
    display_name: string | null
    email: string | null
  } | null
}

interface VersionHistorySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string | null
  documentName: string
  currentVersion: number
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function VersionHistorySheet({
  open,
  onOpenChange,
  documentId,
  documentName,
  currentVersion
}: VersionHistorySheetProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadingVersionId, setDownloadingVersionId] = useState<string | null>(null)

  // Fetch versions when sheet opens
  useEffect(() => {
    if (open && documentId) {
      fetchVersions()
    }
  }, [open, documentId])

  const fetchVersions = async () => {
    if (!documentId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/staff/documents/${documentId}/versions`)

      if (!response.ok) {
        throw new Error('Failed to fetch versions')
      }

      const data = await response.json()
      setVersions(data.versions || [])
    } catch (err) {
      console.error('Error fetching versions:', err)
      setError('Failed to load version history')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadVersion = async (version: DocumentVersion) => {
    setDownloadingVersionId(version.id)

    try {
      // Use the document download endpoint with version file_key
      const response = await fetch(`/api/documents/${documentId}/download?file_key=${encodeURIComponent(version.file_key)}`)

      if (!response.ok) {
        throw new Error('Failed to generate download link')
      }

      const { download_url } = await response.json()
      window.open(download_url, '_blank')

      toast.success(`Downloading version ${version.version_number}`)
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download version')
    } finally {
      setDownloadingVersionId(null)
    }
  }

  const getUploaderName = (version: DocumentVersion): string => {
    if (version.created_by_profile?.display_name) {
      return version.created_by_profile.display_name
    }
    if (version.created_by_profile?.email) {
      return version.created_by_profile.email
    }
    return 'Unknown'
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Version History
          </SheetTitle>
          <SheetDescription className="truncate">
            {documentName}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] pr-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-3" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchVersions}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && versions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">No version history</p>
              <p className="text-sm text-muted-foreground mt-1">
                This is the original version of the document.
              </p>
            </div>
          )}

          {!isLoading && !error && versions.length === 1 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">Only one version</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a new version to see version history.
              </p>
            </div>
          )}

          {!isLoading && !error && versions.length > 1 && (
            <div className="space-y-3">
              {versions.map((version, index) => {
                const isCurrent = version.version_number === currentVersion
                const isDownloading = downloadingVersionId === version.id

                return (
                  <div
                    key={version.id}
                    className={`
                      relative p-4 rounded-lg border transition-colors
                      ${isCurrent
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-card border-border hover:bg-muted/50'
                      }
                    `}
                  >
                    {/* Version header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          Version {version.version_number}
                        </span>
                        {isCurrent && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadVersion(version)}
                        disabled={isDownloading}
                        className="h-8 w-8 p-0"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span className="sr-only">Download version {version.version_number}</span>
                      </Button>
                    </div>

                    {/* Version details */}
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {format(new Date(version.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                        </span>
                      </div>

                      {/* Uploader */}
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        <span>{getUploaderName(version)}</span>
                      </div>

                      {/* Size */}
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-3.5 w-3.5" />
                        <span>{formatFileSize(version.file_size_bytes)}</span>
                      </div>
                    </div>

                    {/* Changes description (if any) */}
                    {version.changes_description && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-foreground">
                          {version.changes_description}
                        </p>
                      </div>
                    )}

                    {/* Timeline connector */}
                    {index < versions.length - 1 && (
                      <div className="absolute left-7 -bottom-3 w-0.5 h-3 bg-border" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
