'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink } from 'lucide-react'

interface InlinePdfViewerProps {
  pdfUrl: string
  documentName: string
}

export function InlinePdfViewer({ pdfUrl, documentName }: InlinePdfViewerProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-lg">{documentName}</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Open in New Tab
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg bg-gray-50 overflow-hidden" style={{ height: '600px' }}>
          {/* Use Google Docs viewer as proxy to bypass cross-origin iframe restrictions */}
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            className="w-full h-full"
            title={documentName}
            frameBorder="0"
          />
        </div>
      </CardContent>
    </Card>
  )
}
