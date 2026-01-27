'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Upload, Download, CheckCircle, Clock, AlertCircle, Loader2, Send, Eye, RefreshCw, BadgeCheck, RotateCcw, FileType } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import { SignatorySelectionDialog } from './signatory-selection-dialog'

interface Document {
  id: string
  subscription_id: string
  type: string
  name: string
  file_key: string
  mime_type: string
  file_size_bytes: number
  status: 'draft' | 'final' | 'published' | 'pending_signature' | 'signed'
  ready_for_signature: boolean
  created_at: string
  created_by_profile?: {
    display_name: string
    email: string
  }
}

interface SubscriptionDocumentsTabProps {
  subscriptionId: string
}

export function SubscriptionDocumentsTab({ subscriptionId }: SubscriptionDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [sendingForSignature, setSendingForSignature] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [signatoryDialogOpen, setSignatoryDialogOpen] = useState(false)
  const [selectedDocumentForSignature, setSelectedDocumentForSignature] = useState<Document | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [markingFinalId, setMarkingFinalId] = useState<string | null>(null)
  const [regenerateFormat, setRegenerateFormat] = useState<'docx' | 'pdf'>('docx')

  // Document viewer hook
  const {
    isOpen: viewerOpen,
    document: viewerDocument,
    previewUrl,
    isLoading: viewerLoading,
    error: viewerError,
    openPreview,
    closePreview,
    downloadDocument
  } = useDocumentViewer()

  const statusColors: Record<string, string> = {
    draft: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200',
    final: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-200',
    published: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-200',
    pending_signature: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-200',
    signed: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200'
  }

  const statusIcons: Record<string, React.ReactNode> = {
    draft: <Clock className="h-4 w-4" />,
    final: <CheckCircle className="h-4 w-4" />,
    published: <CheckCircle className="h-4 w-4" />,
    pending_signature: <AlertCircle className="h-4 w-4" />,
    signed: <CheckCircle className="h-4 w-4" />
  }

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    final: 'Final (Ready)',
    published: 'Final (Ready)',
    pending_signature: 'Pending Signatures',
    signed: 'Fully Executed'
  }

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/documents`)
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [subscriptionId])

  useEffect(() => {
    fetchDocuments()
  }, [subscriptionId, fetchDocuments])

  const handleDownload = async (document: Document) => {
    setDownloadingId(document.id)
    try {
      const response = await fetch(
        `/api/storage/download?bucket=deal-documents&path=${encodeURIComponent(document.file_key)}`
      )

      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.file_key.split('/').pop() || 'document'
      window.document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      window.document.body.removeChild(a)

      toast.success('Document downloaded successfully')
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Failed to download document')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      if (!isPdf) {
        toast.error('Please upload a PDF file')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUploadFinal = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('documentType', 'subscription_pack')

      const response = await fetch(`/api/subscriptions/${subscriptionId}/documents/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      toast.success('Final subscription pack uploaded successfully')
      setUploadDialogOpen(false)
      setSelectedFile(null)
      fetchDocuments()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleOpenSignatoryDialog = (document: Document) => {
    setSelectedDocumentForSignature(document)
    setSignatoryDialogOpen(true)
  }

  const handleSendForSignature = async (
    signatoryIds: string[],
    countersignerType?: 'ceo' | 'arranger',
    arrangerId?: string
  ) => {
    if (!selectedDocumentForSignature) return

    setSendingForSignature(selectedDocumentForSignature.id)
    try {
      // Filter out 'investor_primary' as it's handled specially by the API
      const memberIds = signatoryIds.filter(id => id !== 'investor_primary')

      const response = await fetch(
        `/api/subscriptions/${subscriptionId}/documents/${selectedDocumentForSignature.id}/ready-for-signature`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signatory_member_ids: memberIds.length > 0 ? memberIds : undefined,
            countersigner_type: countersignerType,
            arranger_id: arrangerId
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send for signature')
      }

      const data = await response.json()
      const countersignerLabel = data.countersigner_type === 'arranger'
        ? `arranger (${data.countersigner_name})`
        : 'CEO'
      toast.success(`Document sent to ${data.total_signatories} signatories for signature. Countersigner: ${countersignerLabel}`)
      console.log('Signature requests created:', data)
      fetchDocuments()
    } catch (error) {
      console.error('Error sending for signature:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send for signature')
      throw error // Re-throw to let the dialog handle it
    } finally {
      setSendingForSignature(null)
      setSelectedDocumentForSignature(null)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: regenerateFormat })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to regenerate subscription pack')
      }

      const data = await response.json()
      const format = data.format?.toUpperCase() || regenerateFormat.toUpperCase()
      toast.success(`Subscription pack regenerated as ${format}`)
      console.log('Regeneration result:', data)
      fetchDocuments() // Refresh document list
    } catch (error) {
      console.error('Error regenerating subscription pack:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate subscription pack')
    } finally {
      setRegenerating(false)
    }
  }

  const handleToggleFinalStatus = async (documentId: string, currentStatus: string) => {
    setMarkingFinalId(documentId)
    try {
      const response = await fetch(
        `/api/subscriptions/${subscriptionId}/documents/${documentId}/mark-final`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update document status')
      }

      const data = await response.json()

      if (data.action === 'finalized') {
        toast.success('Document marked as final - ready for signature')
      } else {
        toast.success('Document reverted to draft')
      }

      fetchDocuments() // Refresh document list
    } catch (error) {
      console.error('Error updating document status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update document status')
    } finally {
      setMarkingFinalId(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const hasFinalDocument = documents.some(doc => doc.status === 'final' || doc.status === 'published' || doc.status === 'pending_signature' || doc.status === 'signed')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-muted/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Subscription Pack Documents
              </CardTitle>
              <CardDescription>
                Manage draft and final subscription pack documents
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Format Selection + Regenerate */}
              <div className="flex items-center gap-1">
                <Select
                  value={regenerateFormat}
                  onValueChange={(value: 'docx' | 'pdf') => setRegenerateFormat(value)}
                  disabled={regenerating}
                >
                  <SelectTrigger className="w-[100px] h-9 bg-muted/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="docx">
                      <div className="flex items-center gap-2">
                        <FileType className="h-3 w-3" />
                        DOCX
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        PDF
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                >
                  {regenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Final Pack
                  </Button>
                </DialogTrigger>
              <DialogContent className="bg-background border border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Upload Final Subscription Pack</DialogTitle>
                  <DialogDescription>
                    Upload the edited and finalized subscription pack PDF
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-foreground">Document File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="bg-muted/50 border-border text-foreground"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadFinal}
                    disabled={!selectedFile || uploading}
                    className="gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Final
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No documents generated yet</p>
              <p className="text-sm text-muted-foreground">
                Draft subscription pack will be generated automatically when subscription is approved
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-start justify-between py-4 px-4 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {document.name}
                        </span>
                        <Badge className={statusColors[document.status]}>
                          <div className="flex items-center gap-1">
                            {statusIcons[document.status]}
                            {statusLabels[document.status]}
                          </div>
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(document.file_size_bytes)} •
                          {document.mime_type.includes('pdf') ? ' PDF' : ' DOCX'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {new Date(document.created_at).toLocaleDateString()} at{' '}
                          {new Date(document.created_at).toLocaleTimeString()}
                          {document.created_by_profile && ` by ${document.created_by_profile.display_name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openPreview({
                        id: document.id,
                        name: document.name,
                        file_name: document.name,
                        mime_type: document.mime_type,
                        file_size_bytes: document.file_size_bytes,
                        type: document.type
                      })}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDownload(document)}
                      disabled={downloadingId === document.id}
                    >
                      {downloadingId === document.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download
                        </>
                      )}
                    </Button>
                    {/* Toggle Final/Draft button - show for draft, final, and published */}
                    {(document.status === 'draft' || document.status === 'final' || document.status === 'published') && (
                      <Button
                        variant={(document.status === 'final' || document.status === 'published') ? 'outline' : 'default'}
                        size="sm"
                        className={(document.status === 'final' || document.status === 'published')
                          ? 'gap-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
                          : 'gap-2 bg-cyan-600 hover:bg-cyan-700'}
                        onClick={() => handleToggleFinalStatus(document.id, document.status)}
                        disabled={markingFinalId === document.id}
                      >
                        {markingFinalId === document.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {(document.status === 'final' || document.status === 'published') ? 'Reverting...' : 'Marking...'}
                          </>
                        ) : (document.status === 'final' || document.status === 'published') ? (
                          <>
                            <RotateCcw className="h-4 w-4" />
                            Revert to Draft
                          </>
                        ) : (
                          <>
                            <BadgeCheck className="h-4 w-4" />
                            Mark as Final
                          </>
                        )}
                      </Button>
                    )}
                    {/* Ready for Signature button - for final or published documents */}
                    {(document.status === 'final' || document.status === 'published') && !document.ready_for_signature && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => handleOpenSignatoryDialog(document)}
                        disabled={sendingForSignature === document.id}
                      >
                        {sendingForSignature === document.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Ready for Signature
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Guide */}
      <Card className="border border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm text-foreground">Subscription Pack Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-200 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-foreground">Draft Generation</p>
                <p className="text-muted-foreground">
                  System automatically generates draft subscription pack when subscription is approved
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-200 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-foreground">Staff Review & Edit</p>
                <p className="text-muted-foreground">
                  Download draft, work with lawyers to finalize, then upload the final PDF
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-200 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-foreground">Send for Signatures</p>
                <p className="text-muted-foreground">
                  Click "Ready for Signature" to initiate dual-signature workflow (investor + staff)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-200 flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <p className="font-medium text-foreground">Execution Complete</p>
                <p className="text-muted-foreground">
                  Once both parties sign, subscription status automatically changes to "committed"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer Fullscreen */}
      <DocumentViewerFullscreen
        isOpen={viewerOpen}
        document={viewerDocument}
        previewUrl={previewUrl}
        isLoading={viewerLoading}
        error={viewerError}
        onClose={closePreview}
        onDownload={downloadDocument}
      />

      {/* Signatory Selection Dialog */}
      {selectedDocumentForSignature && (
        <SignatorySelectionDialog
          open={signatoryDialogOpen}
          onOpenChange={(open) => {
            setSignatoryDialogOpen(open)
            if (!open) setSelectedDocumentForSignature(null)
          }}
          subscriptionId={subscriptionId}
          documentId={selectedDocumentForSignature.id}
          documentName={selectedDocumentForSignature.name}
          onConfirm={handleSendForSignature}
        />
      )}
    </div>
  )
}
