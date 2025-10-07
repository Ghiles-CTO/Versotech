'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Download, Trash2 } from 'lucide-react'
import { UploadDocumentModal } from './upload-document-modal'

interface DealDocumentsTabProps {
  dealId: string
  documents: any[]
}

export function DealDocumentsTab({ dealId, documents }: DealDocumentsTabProps) {
  const docTypeColors: Record<string, string> = {
    nda: 'bg-purple-500/20 text-purple-200',
    term_sheet: 'bg-blue-500/20 text-blue-200',
    subscription: 'bg-emerald-500/20 text-emerald-200',
    contract: 'bg-amber-500/20 text-amber-200',
    report: 'bg-cyan-500/20 text-cyan-200',
    other: 'bg-gray-500/20 text-gray-200'
  }

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Deal Documents
              </CardTitle>
              <CardDescription>Documents scoped to this deal only</CardDescription>
            </div>
            <UploadDocumentModal dealId={dealId} />
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet. Click "Upload Document" to add files.
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {doc.file_key.split('/').pop()}
                        </span>
                        <Badge className={docTypeColors[doc.type] || docTypeColors.other}>
                          {doc.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        {doc.created_by_profile && ` by ${doc.created_by_profile.display_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-200">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
