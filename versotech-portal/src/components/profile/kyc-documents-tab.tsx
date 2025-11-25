'use client'

import { useState, useEffect } from 'react'
import { Upload, CheckCircle, XCircle, Clock, Download, AlertCircle, Info, Loader2, FileText, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { KYCUploadDialog } from './kyc-upload-dialog'
import { getDocumentTypeLabel } from '@/constants/kyc-document-types'

interface KYCSubmission {
  id: string
  document_type: string
  custom_label?: string | null
  status: string
  submitted_at: string
  created_at: string
  expiry_date?: string | null
  version: number
  metadata?: any
  rejection_reason?: string | null
  document?: {
    id: string
    name: string
    file_key: string
    file_size_bytes: number
    mime_type: string
    created_at: string
  }
  reviewer?: {
    display_name?: string
    email?: string
  } | null
  investor_member?: {
    id: string
    full_name: string
    role: string
  } | null
}

interface InvestorMember {
  id: string
  full_name: string
  role: string
}

interface SuggestedDocument {
  value: string
  label: string
  description: string
}

export function KYCDocumentsTab() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [suggestedDocuments, setSuggestedDocuments] = useState<SuggestedDocument[]>([])
  const [investorMembers, setInvestorMembers] = useState<InvestorMember[]>([])
  const [isEntityInvestor, setIsEntityInvestor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/investors/me/kyc-submissions')
      if (!response.ok) throw new Error('Failed to load KYC submissions')

      const data = await response.json()
      setSubmissions(data.submissions || [])
      setSuggestedDocuments(data.suggested_documents || [])
      setInvestorMembers(data.investor_members || [])
      setIsEntityInvestor(data.is_entity_investor || false)
    } catch (error: any) {
      console.error('Error loading KYC submissions:', error)
      toast.error('Failed to load KYC documents', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    setDownloadingId(documentId)
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)

      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Download started')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Download failed', {
        description: error.message
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 border-amber-500/30">
            <Clock className="mr-1 h-3 w-3" />
            Pending Review
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-rose-500/20 text-rose-700 border-rose-500/30">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="bg-gray-500/20 text-gray-700 border-gray-500/30">
            <AlertCircle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>KYC Documents</CardTitle>
              <CardDescription>
                Upload and manage your Know Your Customer (KYC) verification documents
              </CardDescription>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              You can upload any KYC document with a custom label. Suggested document types are provided for guidance, but you're not limited to these options.
            </AlertDescription>
          </Alert>

          {submissions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No KYC documents uploaded yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Upload your identification documents, proof of address, and other KYC materials
              </p>
              <Button onClick={() => setUploadDialogOpen(true)} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload First Document
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Type</TableHead>
                    {isEntityInvestor && <TableHead>Member</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {getDocumentTypeLabel(submission.document_type, submission.custom_label)}
                          </span>
                          {submission.version > 1 && (
                            <span className="text-xs text-gray-500">
                              Version {submission.version}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {isEntityInvestor && (
                        <TableCell>
                          {submission.investor_member ? (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{submission.investor_member.full_name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {getStatusBadge(submission.status)}
                          {submission.status === 'rejected' && submission.rejection_reason && (
                            <p className="text-xs text-rose-600 max-w-xs">
                              {submission.rejection_reason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(submission.created_at)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {submission.expiry_date ? formatDate(submission.expiry_date) : '—'}
                      </TableCell>
                      <TableCell>
                        {submission.document && (
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900 truncate max-w-[200px]">
                              {submission.document.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatFileSize(submission.document.file_size_bytes)}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.document && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(submission.document!.id, submission.document!.name)}
                            disabled={downloadingId === submission.document.id}
                          >
                            {downloadingId === submission.document.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {suggestedDocuments.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedDocuments.map((doc) => (
                  <Card key={doc.value} className="border-gray-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{doc.label}</p>
                          <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                These are common document types, but you can upload any document type with a custom label.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <KYCUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={loadSubmissions}
        category={isEntityInvestor ? 'entity' : 'individual'}
        members={isEntityInvestor ? investorMembers : []}
        memberType={isEntityInvestor ? 'investor' : undefined}
      />
    </div>
  )
}
