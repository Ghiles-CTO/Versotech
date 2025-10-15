'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface DocumentVersionsProps {
  dealId: string
  documentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DocumentVersion {
  id: string
  file_name: string
  version: number
  created_at: string
  created_by: string | null
  file_size_bytes: number | null
  replaced_by_id: string | null
  file_key: string
}

export function DataRoomDocumentVersions({
  dealId,
  documentId,
  open,
  onOpenChange
}: DocumentVersionsProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && documentId) {
      loadVersions()
    }
  }, [open, documentId])

  const loadVersions = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/documents/${documentId}/versions`)
      
      if (!response.ok) {
        throw new Error('Failed to load version history')
      }

      const data = await response.json()
      setVersions(data.versions || [])
    } catch (err) {
      console.error('Error loading versions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load versions')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Version History
          </DialogTitle>
          <DialogDescription>
            View all versions of this document. The latest version is shown to investors.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && versions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No version history available yet.
          </div>
        )}

        {!loading && !error && versions.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map(version => {
                const isLatest = !version.replaced_by_id
                return (
                  <TableRow key={version.id}>
                    <TableCell className="font-medium">
                      v{version.version}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {version.file_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatFileSize(version.file_size_bytes)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(version.created_at), 'dd MMM yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {isLatest ? (
                        <Badge className="bg-emerald-500/20 text-emerald-200">
                          Current
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Replaced
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}

