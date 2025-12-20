'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, Download, Loader2, AlertCircle, CheckCircle2, Clock, Info, User } from 'lucide-react'
import { KYCUploadDialog } from './kyc-upload-dialog'
import { getDocumentTypeLabel } from '@/constants/kyc-document-types'

interface EntityKYCDocumentsProps {
  entityId: string
  entityName: string
}

interface KYCSubmission {
  id: string
  document_type: string
  custom_label?: string | null
  status: string
  created_at: string
  expiry_date?: string | null
  version: number
  metadata?: any
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
  counterparty_member?: {
    id: string
    full_name: string
    role: string
  } | null
}

interface EntityMember {
  id: string
  full_name: string
  role: string
}

export function EntityKYCDocuments({ entityId, entityName }: EntityKYCDocumentsProps) {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [entityMembers, setEntityMembers] = useState<EntityMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/investors/me/counterparty-entities/${entityId}/kyc-submissions`)

      if (!response.ok) {
        throw new Error('Failed to fetch KYC submissions')
      }

      const data = await response.json()
      setSubmissions(data.submissions || [])
      setEntityMembers(data.members || [])
    } catch (error: any) {
      console.error('Error fetching entity KYC submissions:', error)
      toast.error('Failed to load KYC documents', {
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }, [entityId])

  useEffect(() => {
    fetchSubmissions()
  }, [entityId, fetchSubmissions])

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
          <Badge variant="default" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            <Clock className="mr-1 h-3 w-3" />
            Pending Review
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-rose-500/20 text-rose-300 border-rose-500/30">
            <AlertCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/30">
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{entityName} - KYC Documents</h3>
          <p className="text-sm text-slate-400">
            Upload and manage KYC documents for this entity
          </p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Required: NDA/NDNC, Incorporation Certificate, Memo &amp; Articles, Register of Members, Register of Directors, Bank Confirmation.
          For each member/director: ID/Passport and Utility Bill (less than 3 months old).
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : submissions.length === 0 ? (
        <Card className="border-dashed border-slate-700">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <FileText className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-slate-400 mb-2">No KYC documents uploaded yet</p>
            <p className="text-sm text-slate-500 mb-4">
              Upload entity documents and ID/Utility Bill for each member/director
            </p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  {entityMembers.length > 0 && <TableHead>Member</TableHead>}
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
                        <span className="font-medium text-white">
                          {getDocumentTypeLabel(submission.document_type, submission.custom_label)}
                        </span>
                        {submission.version > 1 && (
                          <span className="text-xs text-slate-400">
                            Version {submission.version}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {entityMembers.length > 0 && (
                      <TableCell>
                        {submission.counterparty_member ? (
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm text-slate-300">{submission.counterparty_member.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className="text-slate-300">
                      {formatDate(submission.created_at)}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {submission.expiry_date ? formatDate(submission.expiry_date) : '—'}
                    </TableCell>
                    <TableCell>
                      {submission.document && (
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-300 truncate max-w-[200px]">
                            {submission.document.name}
                          </span>
                          <span className="text-xs text-slate-500">
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
          </CardContent>
        </Card>
      )}

      <KYCUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUploadSuccess={fetchSubmissions}
        entityId={entityId}
        category="entity"
        members={entityMembers}
        memberType="counterparty"
      />
    </div>
  )
}
