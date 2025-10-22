'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Folder, Loader2 } from 'lucide-react'

export interface DataRoomDocument {
  id: string
  deal_id: string
  folder: string | null
  file_key: string
  file_name: string | null
  created_at: string
}

interface DataRoomDocumentsProps {
  documents: DataRoomDocument[]
}

export function DataRoomDocuments({ documents }: DataRoomDocumentsProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const documentsByFolder = documents.reduce<Record<string, DataRoomDocument[]>>((acc, doc) => {
    const folder = doc.folder ?? 'General'
    if (!acc[folder]) {
      acc[folder] = []
    }
    acc[folder].push(doc)
    return acc
  }, {})

  const handleDownload = async (doc: DataRoomDocument) => {
    setDownloadingId(doc.id)
    setError(null)

    try {
      // Use API endpoint for secure download with audit logging
      const response = await fetch(`/api/deals/${doc.deal_id}/documents/${doc.id}/download`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate download link')
      }

      const data = await response.json()

      if (!data.download_url) {
        throw new Error('No download URL received')
      }

      // Open the pre-signed URL
      window.open(data.download_url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Failed to download file', err)
      setError(err instanceof Error ? err.message : 'Unable to download this document right now.')
    } finally {
      setDownloadingId(null)
    }
  }

  if (documents.length === 0) {
    return <p className="text-sm text-gray-500">Documents will appear here once published to the data room.</p>
  }

  return (
    <div className="space-y-4">
      {Object.entries(documentsByFolder).map(([folder, docs]) => (
        <div key={folder} className="rounded-lg border border-gray-200">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Folder className="h-4 w-4 text-gray-500" />
              {folder}
            </div>
            <Badge variant="outline">{docs.length} file{docs.length === 1 ? '' : 's'}</Badge>
          </div>
          <div className="divide-y divide-gray-200">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{doc.file_name ?? doc.file_key.split('/').pop()}</span>
                  <span className="text-xs text-gray-500">
                    Uploaded {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                  className="gap-2"
                >
                  {downloadingId === doc.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
