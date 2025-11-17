'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Upload, Download, CheckCircle, Clock, AlertCircle, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

interface Document {
  id: string
  subscription_id: string
  type: string
  name: string
  file_key: string
  mime_type: string
  file_size_bytes: number
  status: 'draft' | 'final' | 'pending_signature' | 'signed'
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

  const statusColors: Record<string, string> = {
    draft: 'bg-purple-500/20 text-purple-200',
    final: 'bg-cyan-500/20 text-cyan-200',
    pending_signature: 'bg-amber-500/20 text-amber-200',
    signed: 'bg-emerald-500/20 text-emerald-200'
  }

  const statusIcons: Record<string, React.ReactNode> = {
    draft: <Clock className="h-4 w-4" />,
    final: <CheckCircle className="h-4 w-4" />,
    pending_signature: <AlertCircle className="h-4 w-4" />,
    signed: <CheckCircle className="h-4 w-4" />
  }

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    final: 'Final (Ready)',
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
      // Validate file type
      if (!file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
        toast.error('Please upload a .docx or .pdf file')
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

  const handleReadyForSignature = async (documentId: string) => {
    if (!confirm('Send this document for dual signature? This will notify the investor and staff signatory.')) {
      return
    }

    setSendingForSignature(documentId)
    try {
      const response = await fetch(
        `/api/subscriptions/${subscriptionId}/documents/${documentId}/ready-for-signature`,
        {
          method: 'POST'
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send for signature')
      }

      const data = await response.json()
      toast.success('Document sent for signatures successfully')
      console.log('Signature requests created:', data)
      fetchDocuments()
    } catch (error) {
      console.error('Error sending for signature:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send for signature')
    } finally {
      setSendingForSignature(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const hasFinalDocument = documents.some(doc => doc.status === 'final' || doc.status === 'pending_signature' || doc.status === 'signed')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-white/5">
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
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Final Pack
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Upload Final Subscription Pack</DialogTitle>
                  <DialogDescription>
                    Upload the edited and finalized subscription pack document (DOCX or PDF)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-foreground">Document File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".docx,.pdf"
                      onChange={handleFileSelect}
                      className="bg-white/5 border-white/10 text-foreground"
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
                  className="flex items-start justify-between py-4 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
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
                    {document.status === 'final' && !document.ready_for_signature && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => handleReadyForSignature(document.id)}
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
      <Card className="border border-white/10 bg-white/5">
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
                  Download draft, work with lawyers to finalize, then upload final version
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
    </div>
  )
}
