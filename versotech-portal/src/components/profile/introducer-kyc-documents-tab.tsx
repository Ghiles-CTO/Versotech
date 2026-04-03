'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { formatViewerDate } from '@/lib/format'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Loader2,
  Shield,
  Upload,
  User,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DocumentMetadataDialog,
  type UploadMetadataFields,
} from '@/components/profile/document-metadata-dialog'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import { getFileTypeCategory } from '@/constants/document-preview.constants'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import {
  buildPortalKycChecklistRows,
  getChecklistCompletionSummary,
  getChecklistDocumentTypeLabel,
  type KycChecklistMember,
  type KycChecklistRow,
  type KycChecklistStatus,
  type KycChecklistSubmission,
} from '@/lib/kyc/portal-kyc-checklist'
import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'
import { cn } from '@/lib/utils'

interface IntroducerSubmission {
  id: string
  document_type: string
  status: string
  submitted_at?: string | null
  created_at: string
  reviewed_at?: string | null
  version: number
  rejection_reason?: string | null
  document_date?: string | null
  document_valid_to?: string | null
  expiry_date?: string | null
  document?: {
    id: string
    name: string
    file_key: string
    file_size_bytes?: number | null
    mime_type?: string | null
    created_at?: string | null
  } | null
  introducer_member?: {
    id: string
    full_name: string
    role: string
  } | null
}

interface IntroducerMember extends KycChecklistMember {
  is_signatory?: boolean
}

type PendingUpload = {
  file: File
  row: KycChecklistRow
  isUpdate: boolean
  defaultDocumentType: string
}

const INTRODUCER_ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'text/plain',
]

const INTRODUCER_FILE_ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt'

function normalizeChecklistSubmission(submission: IntroducerSubmission): KycChecklistSubmission {
  return {
    ...submission,
    memberId: submission.introducer_member?.id ?? null,
    memberName: submission.introducer_member?.full_name ?? null,
    memberRole: submission.introducer_member?.role ?? null,
  }
}

function formatDate(dateString?: string | null) {
  if (!dateString) return '—'
  return formatViewerDate(dateString)
}

function formatFileSize(bytes?: number | null) {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getRelevantDate(submission: KycChecklistSubmission | null) {
  if (!submission?.document_type) return null
  if (isProofOfAddress(submission.document_type)) {
    return submission.document_date || null
  }
  if (isIdDocument(submission.document_type)) {
    return submission.expiry_date || submission.document_valid_to || null
  }
  return null
}

function getRelevantDateLabel(submission: KycChecklistSubmission | null) {
  if (!submission?.document_type) return 'Date'
  if (isProofOfAddress(submission.document_type)) return 'Document Date'
  if (isIdDocument(submission.document_type)) return 'Expiry Date'
  return 'Date'
}

function getStatusBadge(status: KycChecklistStatus) {
  switch (status) {
    case 'approved':
      return (
        <Badge
          variant="default"
          className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      )
    case 'pending':
    case 'draft':
      return (
        <Badge
          variant="secondary"
          className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300"
        >
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
    case 'under_review':
      return (
        <Badge
          variant="secondary"
          className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300"
        >
          <Clock className="mr-1 h-3 w-3" />
          Pending Review
        </Badge>
      )
    case 'rejected':
      return (
        <Badge
          variant="destructive"
          className="border-rose-500/30 bg-rose-500/15 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-300"
        >
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      )
    case 'expired':
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
        >
          <AlertCircle className="mr-1 h-3 w-3" />
          Expired
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="border-border bg-muted/60 text-muted-foreground">
          Missing
        </Badge>
      )
  }
}

function getRowTone(status: KycChecklistStatus) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.10]'
    case 'pending':
    case 'draft':
    case 'under_review':
      return 'bg-amber-500/[0.08] dark:bg-amber-500/[0.10]'
    case 'rejected':
    case 'expired':
    case 'missing':
      return 'bg-rose-500/[0.07] dark:bg-rose-500/[0.10]'
    default:
      return ''
  }
}

function getStatusColor(status?: string) {
  switch ((status || '').toLowerCase().trim()) {
    case 'approved':
      return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500/25 dark:text-emerald-300'
    case 'pending':
    case 'pending_review':
    case 'under_review':
      return 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:border-amber-500/25 dark:text-amber-300'
    case 'rejected':
      return 'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:border-rose-500/25 dark:text-rose-300'
    default:
      return 'border-border bg-muted/60 text-muted-foreground'
  }
}

export function IntroducerKYCDocumentsTab({
  introducerId,
  introducerName,
  kycStatus,
  entityType,
}: {
  introducerId: string
  introducerName?: string
  kycStatus?: string
  entityType?: string | null
}) {
  const [submissions, setSubmissions] = useState<IntroducerSubmission[]>([])
  const [members, setMembers] = useState<IntroducerMember[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false)
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const viewer = useDocumentViewer()

  const isIndividualEntity = entityType === 'individual'

  useEffect(() => {
    void fetchDocuments()
  }, [introducerId])

  const checklistRows = useMemo(
    () =>
      buildPortalKycChecklistRows({
        entityType: isIndividualEntity ? 'individual' : 'entity',
        members,
        submissions: submissions.map(normalizeChecklistSubmission),
      }),
    [isIndividualEntity, members, submissions]
  )

  const checklistSummary = useMemo(
    () => getChecklistCompletionSummary(checklistRows),
    [checklistRows]
  )

  async function fetchDocuments() {
    if (!introducerId) return

    setLoading(true)
    try {
      const response = await fetch('/api/introducers/me/documents')
      if (!response.ok) throw new Error('Failed to fetch documents')

      const data = await response.json()
      setSubmissions(data.submissions || [])
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(fileDocument: { id: string; name: string }) {
    setDownloadingId(fileDocument.id)
    try {
      const response = await fetch(`/api/documents/${fileDocument.id}/download`)

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileDocument.name
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      toast.success('Document downloaded')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download document')
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleUpload(
    file: File,
    row: KycChecklistRow,
    isUpdate: boolean,
    documentType: string,
    metadata?: UploadMetadataFields
  ) {
    if (!introducerId) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit')
      return
    }

    if (!INTRODUCER_ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPG, PNG, WEBP, or TXT files')
      return
    }

    setUploadingKey(row.key)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', documentType)
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
      formData.append('isUpdate', isUpdate ? 'true' : 'false')

      if (row.memberId) {
        formData.append('introducer_member_id', row.memberId)
      }

      if (metadata?.documentNumber) formData.append('documentNumber', metadata.documentNumber)
      if (metadata?.documentIssueDate) formData.append('documentIssueDate', metadata.documentIssueDate)
      if (metadata?.documentExpiryDate) formData.append('documentExpiryDate', metadata.documentExpiryDate)
      if (metadata?.documentIssuingCountry) formData.append('documentIssuingCountry', metadata.documentIssuingCountry)
      if (metadata?.documentDate) formData.append('documentDate', metadata.documentDate)

      const response = await fetch('/api/introducers/me/documents', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'Upload failed')
      }

      toast.success(isUpdate ? 'Document updated successfully' : 'Document uploaded successfully')
      await fetchDocuments()
    } catch (error: unknown) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload document')
    } finally {
      setUploadingKey(null)
      const input = fileInputRefs.current[row.key]
      if (input) {
        input.value = ''
      }
    }
  }

  function queueUpload(file: File, row: KycChecklistRow, isUpdate: boolean) {
    const latestType = row.latestSubmission?.document_type
    const defaultDocumentType =
      latestType && row.acceptedDocumentTypes.includes(latestType)
        ? latestType
        : row.documentTypeOptions[0]?.value || row.acceptedDocumentTypes[0]

    if (!defaultDocumentType) {
      toast.error('Unable to resolve the document type for this upload')
      return
    }

    if (
      row.documentTypeOptions.length > 1 ||
      isIdDocument(defaultDocumentType) ||
      isProofOfAddress(defaultDocumentType)
    ) {
      setPendingUpload({ file, row, isUpdate, defaultDocumentType })
      setMetadataDialogOpen(true)
      return
    }

    void handleUpload(file, row, isUpdate, defaultDocumentType)
  }

  function handleMetadataConfirm(metadata: UploadMetadataFields, documentType?: string) {
    if (!pendingUpload) return

    const { file, row, isUpdate, defaultDocumentType } = pendingUpload
    const selectedType = documentType || defaultDocumentType

    setMetadataDialogOpen(false)
    setPendingUpload(null)
    void handleUpload(file, row, isUpdate, selectedType, metadata)
  }

  if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center',
                  checklistSummary.approved === checklistSummary.total
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/20'
                    : 'bg-primary/10 dark:bg-primary/20'
                )}
              >
                <Shield
                  className={cn(
                    'h-5 w-5',
                    checklistSummary.approved === checklistSummary.total
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-primary'
                  )}
                />
              </div>
              <div>
                <CardTitle>KYC Documents</CardTitle>
                <CardDescription>
                  {isIndividualEntity
                    ? 'Upload your personal KYC documents inline.'
                    : introducerName
                      ? `Compliance documents for ${introducerName}`
                      : 'Upload required compliance documents inline.'}
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  Latest version only is shown per requirement. Use Update to replace an existing upload.
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-2xl font-bold text-foreground">
                  {checklistSummary.approved}/{checklistSummary.total}
                </span>
                {kycStatus && (
                  <Badge variant="outline" className={cn('capitalize', getStatusColor(kycStatus))}>
                    KYC: {kycStatus.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {checklistSummary.pending > 0
                  ? `${checklistSummary.pending} pending review`
                  : checklistSummary.attention > 0
                    ? `${checklistSummary.attention} still need attention`
                    : 'All required items are approved'}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2.5 w-full rounded-full bg-muted">
            <div
              className={cn(
                'h-2.5 rounded-full transition-all duration-500',
                checklistSummary.approved === checklistSummary.total
                  ? 'bg-green-500'
                  : checklistSummary.approved > 0
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
              )}
              style={{
                width: `${checklistSummary.total === 0 ? 0 : Math.round((checklistSummary.approved / checklistSummary.total) * 100)}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required Documents</CardTitle>
          <CardDescription>
            Every required document stays visible from the start, with inline upload and update actions on each row.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  {!isIndividualEntity && <TableHead>Member</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklistRows.map((row) => {
                  const latestSubmission = row.latestSubmission
                  const document = latestSubmission?.document || null
                  const latestDocumentTypeLabel = getChecklistDocumentTypeLabel(latestSubmission?.document_type)
                  const canPreview =
                    !!document &&
                    getFileTypeCategory(document.name, document.mime_type || undefined) !== 'unsupported'
                  const isUploading = uploadingKey === row.key

                  return (
                    <TableRow key={row.key} className={cn('align-top', getRowTone(row.status))}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{row.label}</p>
                          {latestSubmission ? (
                            <p className="text-xs text-muted-foreground">
                              Already uploaded
                              {latestDocumentTypeLabel && latestDocumentTypeLabel !== row.label
                                ? ` • ${latestDocumentTypeLabel}`
                                : ''}
                            </p>
                          ) : (
                            <p className="text-xs text-rose-700 dark:text-rose-300">Awaiting upload</p>
                          )}
                        </div>
                      </TableCell>

                      {!isIndividualEntity && (
                        <TableCell>
                          {row.memberName ? (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <div className="flex flex-col">
                                <span className="text-sm">{row.memberName}</span>
                                {row.memberRole && (
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {row.memberRole.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Entity-level</span>
                          )}
                        </TableCell>
                      )}

                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(row.status)}
                          {row.status === 'rejected' && latestSubmission?.rejection_reason && (
                            <p className="max-w-xs text-xs text-rose-700 dark:text-rose-300">
                              {latestSubmission.rejection_reason}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {latestSubmission ? (
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>{formatDate(latestSubmission.submitted_at || latestSubmission.created_at)}</p>
                            <p className="text-xs text-muted-foreground">
                              Version {latestSubmission.version || 1}
                              {document?.file_size_bytes
                                ? ` • ${formatFileSize(document.file_size_bytes)}`
                                : ''}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {latestSubmission ? (
                          <div className="flex flex-col">
                            <span className="text-sm text-foreground">
                              {formatDate(getRelevantDate(latestSubmission))}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getRelevantDateLabel(latestSubmission)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            ref={(element) => {
                              fileInputRefs.current[row.key] = element
                            }}
                            type="file"
                            className="hidden"
                            accept={INTRODUCER_FILE_ACCEPT}
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              if (file) {
                                queueUpload(file, row, !!latestSubmission)
                              }
                            }}
                            disabled={isUploading}
                          />

                          <Button
                            size="sm"
                            variant={latestSubmission ? 'outline' : 'default'}
                            onClick={() => fileInputRefs.current[row.key]?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            {latestSubmission ? 'Update' : 'Upload'}
                          </Button>

                          {document && canPreview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                viewer.openPreview({
                                  id: document.id,
                                  name: document.name,
                                  file_name: document.name,
                                  mime_type: document.mime_type || undefined,
                                  file_size_bytes: document.file_size_bytes || undefined,
                                })
                              }
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}

                          {document && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(document)}
                              disabled={downloadingId === document.id}
                              title="Download"
                            >
                              {downloadingId === document.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DocumentMetadataDialog
        open={metadataDialogOpen}
        onOpenChange={(open) => {
          setMetadataDialogOpen(open)
          if (!open) {
            setPendingUpload(null)
          }
        }}
        documentType={pendingUpload?.defaultDocumentType || null}
        documentTypeOptions={pendingUpload?.row.documentTypeOptions}
        defaultDocumentType={pendingUpload?.defaultDocumentType || null}
        onConfirm={handleMetadataConfirm}
        isSubmitting={!!uploadingKey}
      />

      <DocumentViewerFullscreen
        isOpen={viewer.isOpen}
        document={viewer.document}
        previewUrl={viewer.previewUrl}
        isLoading={viewer.isLoading}
        error={viewer.error}
        onClose={viewer.closePreview}
        onDownload={viewer.downloadDocument}
        watermark={viewer.watermark}
      />
    </div>
  )
}
