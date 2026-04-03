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
  Upload,
  User,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useTheme } from '@/components/theme-provider'
import { getFileTypeCategory } from '@/constants/document-preview.constants'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import {
  buildPortalKycChecklistRows,
  getChecklistDocumentTypeLabel,
  type KycChecklistMember,
  type KycChecklistRow,
  type KycChecklistStatus,
  type KycChecklistSubmission,
} from '@/lib/kyc/portal-kyc-checklist'
import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'
import { cn } from '@/lib/utils'

interface KYCSubmission {
  id: string
  document_type: string
  custom_label?: string | null
  status: string
  submitted_at: string
  created_at: string
  reviewed_at?: string | null
  expiry_date?: string | null
  version: number
  metadata?: Record<string, unknown> | null
  rejection_reason?: string | null
  document_date?: string | null
  document_valid_to?: string | null
  document?: {
    id: string
    name: string
    file_key: string
    file_size_bytes: number
    mime_type: string
    created_at: string
  } | null
  investor_member?: {
    id: string
    full_name: string
    role: string
  } | null
}

interface InvestorMember extends KycChecklistMember {}

interface InvestorKycResponse {
  submissions: KYCSubmission[]
  investor_members: InvestorMember[]
  is_entity_investor: boolean
}

type PendingUpload = {
  file: File
  row: KycChecklistRow
  isUpdate: boolean
  defaultDocumentType: string
}

const INVESTOR_ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/webp',
]

const INVESTOR_FILE_ACCEPT = '.pdf,.jpg,.jpeg,.png,.heic,.webp'

function normalizeChecklistSubmission(submission: KYCSubmission): KycChecklistSubmission {
  return {
    ...submission,
    memberId: submission.investor_member?.id ?? null,
    memberName: submission.investor_member?.full_name ?? null,
    memberRole: submission.investor_member?.role ?? null,
  }
}

function formatDate(dateString?: string | null) {
  if (!dateString) return '—'
  return formatViewerDate(dateString, { timeZone: 'UTC' })
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

function buildChecklistRowsFromPayload(data: InvestorKycResponse) {
  return buildPortalKycChecklistRows({
    entityType: data.is_entity_investor ? 'entity' : 'individual',
    members: data.investor_members || [],
    submissions: (data.submissions || []).map(normalizeChecklistSubmission),
  })
}

export function KYCDocumentsTab() {
  const { theme } = useTheme()
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [investorMembers, setInvestorMembers] = useState<InvestorMember[]>([])
  const [isEntityInvestor, setIsEntityInvestor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false)
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const viewer = useDocumentViewer()
  const isDark = theme === 'staff-dark'

  useEffect(() => {
    void loadSubmissions()
  }, [])

  const checklistRows = useMemo(
    () =>
      buildPortalKycChecklistRows({
        entityType: isEntityInvestor ? 'entity' : 'individual',
        members: investorMembers,
        submissions: submissions.map(normalizeChecklistSubmission),
      }),
    [investorMembers, isEntityInvestor, submissions]
  )

  async function loadSubmissions() {
    setLoading(true)
    try {
      const response = await fetch('/api/investors/me/kyc-submissions')
      if (!response.ok) throw new Error('Failed to load KYC submissions')

      const data = (await response.json()) as InvestorKycResponse
      setSubmissions(data.submissions || [])
      setInvestorMembers(data.investor_members || [])
      setIsEntityInvestor(data.is_entity_investor || false)
      return buildChecklistRowsFromPayload(data)
    } catch (error: unknown) {
      console.error('Error loading KYC submissions:', error)
      toast.error('Failed to load KYC documents', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(documentId: string, fileName: string) {
    setDownloadingId(documentId)
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)

      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      toast.success('Download started')
    } catch (error: unknown) {
      console.error('Download error:', error)
      toast.error('Download failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
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
    const missingBeforeUpload = checklistRows.filter((checklistRow) => checklistRow.status === 'missing').length

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 10MB' })
      return
    }

    if (!INVESTOR_ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Only PDF and image files are allowed',
      })
      return
    }

    setUploadingKey(row.key)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)
      formData.append('isUpdate', isUpdate ? 'true' : 'false')

      if (row.memberId) {
        formData.append('investorMemberId', row.memberId)
      }

      if (metadata?.documentNumber) formData.append('documentNumber', metadata.documentNumber)
      if (metadata?.documentIssueDate) formData.append('documentIssueDate', metadata.documentIssueDate)
      if (metadata?.documentExpiryDate) formData.append('documentExpiryDate', metadata.documentExpiryDate)
      if (metadata?.documentIssuingCountry) formData.append('documentIssuingCountry', metadata.documentIssuingCountry)
      if (metadata?.documentDate) formData.append('documentDate', metadata.documentDate)

      const response = await fetch('/api/investors/me/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to upload document')
      }

      toast.success(isUpdate ? 'Document updated successfully' : 'Document uploaded successfully')
      const refreshedRows = await loadSubmissions()
      const missingAfterUpload =
        refreshedRows?.filter((checklistRow) => checklistRow.status === 'missing').length ?? null

      if (!isUpdate && missingBeforeUpload > 0 && missingAfterUpload === 0) {
        setCompletionDialogOpen(true)
      }
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
        <CardHeader>
          <CardTitle>KYC Documents</CardTitle>
          <CardDescription>
            Each requirement stays visible from the start. Upload the missing items inline and use Update to replace an existing version.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  {isEntityInvestor && <TableHead>Member</TableHead>}
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
                  const latestDocumentTypeLabel = getChecklistDocumentTypeLabel(
                    latestSubmission?.document_type,
                    latestSubmission?.custom_label
                  )
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

                      {isEntityInvestor && (
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
                            accept={INVESTOR_FILE_ACCEPT}
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
                              onClick={() => handleDownload(document.id, document.name)}
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

      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent
          className={cn(
            'sm:max-w-[420px] p-0 gap-0 overflow-hidden border rounded-2xl shadow-2xl',
            isDark
              ? 'bg-[#0a0a0a] border-white/[0.08]'
              : 'bg-white border-slate-200'
          )}
        >
          <div className={cn('h-[3px] w-full', isDark ? 'bg-white' : 'bg-blue-600')} />

          <div className="px-6 pt-6 pb-2">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span
                  className={cn(
                    'text-[11px] font-semibold uppercase tracking-[0.15em]',
                    isDark ? 'text-white/50' : 'text-slate-400'
                  )}
                >
                  KYC complete
                </span>
              </div>

              <DialogTitle
                className={cn(
                  'text-[20px] font-semibold leading-tight tracking-tight text-left',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                All documents uploaded
              </DialogTitle>

              <DialogDescription
                className={cn(
                  'text-[13px] leading-relaxed text-left',
                  isDark ? 'text-white/50' : 'text-slate-500'
                )}
              >
                You&apos;ve uploaded all your required KYC documents. Our team will review
                your submission and revert within 24 hours for final approval.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-6 pt-4">
            <button
              onClick={() => setCompletionDialogOpen(false)}
              className={cn(
                'group w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200',
                isDark
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              <span>Got it</span>
              <CheckCircle className="h-4 w-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

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
