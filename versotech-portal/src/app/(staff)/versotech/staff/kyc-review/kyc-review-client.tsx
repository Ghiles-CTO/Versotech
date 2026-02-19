'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle, XCircle, Clock, AlertCircle, FileText,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ExternalLink, ClipboardList, MessageSquare, Inbox, History,
  CreditCard, MapPin, UserRound, Building2, ScrollText, Users,
  BarChart3, Shield, CircleDollarSign, ClipboardCheck, Fingerprint,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { QuestionnaireViewer } from '@/components/kyc/questionnaire-viewer'
import { ProfileSnapshotViewer } from '@/components/kyc/profile-snapshot-viewer'
import { getDocumentTypeLabel } from '@/constants/kyc-document-types'
import { formatFileSize } from '@/lib/utils'

// ─── Document type icon map ───────────────────────────────────────────────────
const DOC_TYPE_ICON_MAP: Record<string, LucideIcon> = {
  passport: CreditCard,
  national_id: CreditCard,
  drivers_license: CreditCard,
  proof_of_id: Fingerprint,
  proof_of_address: MapPin,
  utility_bill: MapPin,
  bank_statement: MapPin,
  personal_info: UserRound,
  entity_info: Building2,
  questionnaire: ClipboardCheck,
  certificate_of_incorporation: Building2,
  company_registration: Building2,
  business_license: Building2,
  articles_of_association: ScrollText,
  memorandum: ScrollText,
  bylaws: ScrollText,
  partnership_agreement: ScrollText,
  shareholder_agreement: Users,
  ownership_structure: Users,
  ubo_declaration: Users,
  register_of_members: Users,
  financial_statements: BarChart3,
  tax_returns: BarChart3,
  aml_policy: Shield,
  source_of_funds: CircleDollarSign,
  source_of_wealth: CircleDollarSign,
}

function getDocTypeIcon(documentType: string): LucideIcon {
  return DOC_TYPE_ICON_MAP[documentType] ?? FileText
}

// ─── File extension helpers ───────────────────────────────────────────────────
function getFileExt(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'JPG'
  if (mimeType === 'image/png') return 'PNG'
  if (mimeType === 'image/gif') return 'GIF'
  if (mimeType === 'image/webp') return 'WEBP'
  if (mimeType.startsWith('image/')) return mimeType.split('/')[1].toUpperCase().slice(0, 4)
  if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) return 'DOC'
  if (mimeType.includes('spreadsheetml') || mimeType.includes('excel')) return 'XLS'
  return 'FILE'
}

function getFileBadgeClass(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'bg-red-500/15 text-red-500 border-red-500/20'
  if (mimeType.startsWith('image/')) return 'bg-green-500/15 text-green-600 border-green-500/20'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'bg-blue-500/15 text-blue-500 border-blue-500/20'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
  return 'bg-muted text-muted-foreground border-border'
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface KYCSubmission {
  id: string
  investor_id: string | null
  counterparty_entity_id?: string | null
  investor_member_id?: string | null
  document_type: string
  custom_label?: string | null
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'info_requested' | 'expired'
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
  version?: number
  previous_submission_id?: string | null
  metadata?: any
  investor?: {
    id: string
    legal_name: string
    display_name: string
    email: string
    type: string
    kyc_status: string
  }
  counterparty_entity?: {
    id: string
    legal_name: string
    entity_type: string
  } | null
  investor_member?: {
    id: string
    full_name: string
    role: string
    role_title?: string
  } | null
  document?: {
    id: string
    name: string
    file_key: string
    file_size_bytes: number
    mime_type: string
  }
  reviewer?: {
    display_name: string
    email: string
  }
}

interface Statistics {
  total: number
  draft: number
  pending: number
  approved: number
  rejected: number
  info_requested: number
  expired: number
}

interface Pagination {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ─── Main component ───────────────────────────────────────────────────────────
export function KYCReviewClient() {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue')
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [globalStats, setGlobalStats] = useState<Statistics | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)

  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')
  const [investorFilter, setInvestorFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all')

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_info'>('approve')
  const [rejectionReason, setRejectionReason] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewing, setReviewing] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false)
  const [bulkRejectionReason, setBulkRejectionReason] = useState('')

  const reviewableSubmissions = submissions.filter(s => ['pending', 'under_review'].includes(s.status))

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const selectAllReviewable = () => setSelectedIds(new Set(reviewableSubmissions.map(s => s.id)))
  const clearSelection = () => setSelectedIds(new Set())

  const {
    isOpen: previewOpen,
    document: previewDocument,
    previewUrl,
    isLoading: isLoadingPreview,
    error: previewError,
    openPreview,
    closePreview,
    downloadDocument: downloadFromPreview,
    watermark: previewWatermark,
  } = useDocumentViewer()

  const [viewingQuestionnaire, setViewingQuestionnaire] = useState<KYCSubmission | null>(null)
  const [viewingProfileSnapshot, setViewingProfileSnapshot] = useState<KYCSubmission | null>(null)

  const handlePreview = (submission: KYCSubmission) => {
    if (!submission.document) return
    openPreview({
      id: submission.document.id,
      file_name: submission.document.name,
      name: submission.document.name,
      mime_type: submission.document.mime_type,
      file_size_bytes: submission.document.file_size_bytes,
    })
  }

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (activeTab === 'queue') {
        params.append('status', 'queue')
      } else {
        params.append('status', historyStatusFilter !== 'all' ? historyStatusFilter : 'history')
      }
      if (documentTypeFilter !== 'all') params.append('document_type', documentTypeFilter)
      if (entityTypeFilter !== 'all') params.append('entity_type', entityTypeFilter)
      if (investorFilter !== 'all') params.append('investor_id', investorFilter)
      params.append('page', String(page))
      params.append('pageSize', String(pageSize))

      const response = await fetch(`/api/staff/kyc-submissions?${params.toString()}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load submissions')
      }
      const data = await response.json()
      setSubmissions(data.submissions || [])
      setPagination(data.pagination || null)
      if (data.statistics) setGlobalStats(data.statistics)
    } catch (error: any) {
      toast.error('Failed to load KYC submissions', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [activeTab, historyStatusFilter, documentTypeFilter, entityTypeFilter, investorFilter, page, pageSize])

  const handleBulkAction = async (action: 'approve' | 'reject', reason?: string) => {
    if (selectedIds.size === 0) return
    setReviewing(true)
    try {
      const results = await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/staff/kyc-submissions/${id}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, rejection_reason: action === 'reject' ? reason : undefined }),
          })
        )
      )
      const successCount = results.filter(r => r.ok).length
      toast.success(`${successCount} document${successCount !== 1 ? 's' : ''} ${action === 'approve' ? 'approved' : 'rejected'}`)
      clearSelection()
      setBulkRejectOpen(false)
      setBulkRejectionReason('')
      await loadSubmissions()
    } catch {
      toast.error('Failed to process some documents')
    } finally {
      setReviewing(false)
    }
  }

  const handleReview = async () => {
    if (!selectedSubmission) return
    if ((reviewAction === 'reject' || reviewAction === 'request_info') && !rejectionReason.trim()) {
      toast.error(reviewAction === 'request_info' ? 'Please specify what additional information is needed' : 'Please provide a rejection reason')
      return
    }
    setReviewing(true)
    try {
      const response = await fetch(`/api/staff/kyc-submissions/${selectedSubmission.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: reviewAction,
          rejection_reason: (reviewAction === 'reject' || reviewAction === 'request_info') ? rejectionReason : undefined,
          notes: reviewNotes || undefined,
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Review failed')
      }
      toast.success({ approve: 'Document approved', reject: 'Document rejected', request_info: 'Info request sent' }[reviewAction])
      setReviewDialogOpen(false)
      await loadSubmissions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to review document')
    } finally {
      setReviewing(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setDocumentTypeFilter('all')
    setEntityTypeFilter('all')
    setInvestorFilter('all')
    setSearchQuery('')
    setSelectedIds(new Set())
  }, [activeTab])

  useEffect(() => { setPage(1) }, [historyStatusFilter, documentTypeFilter, entityTypeFilter, investorFilter])
  useEffect(() => { loadSubmissions() }, [loadSubmissions])

  const openReviewDialog = (submission: KYCSubmission, action: 'approve' | 'reject' | 'request_info') => {
    setSelectedSubmission(submission)
    setReviewAction(action)
    setRejectionReason('')
    setReviewNotes('')
    setReviewDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-medium"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected': return <Badge className="bg-rose-500/15 text-rose-500 border border-rose-500/30 font-medium"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'info_requested': return <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium"><MessageSquare className="w-3 h-3 mr-1" />Info Requested</Badge>
      case 'pending': return <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/30 font-medium"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'draft': return <Badge variant="outline" className="text-muted-foreground font-medium"><Clock className="w-3 h-3 mr-1" />Draft</Badge>
      case 'expired': return <Badge variant="outline" className="text-muted-foreground font-medium"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>
      default: return null
    }
  }

  const uniqueDocumentTypes = Array.from(new Set(submissions.map(s => s.document_type))).sort()
  const uniqueInvestors = Array.from(
    new Map(submissions.filter(s => s.investor).map(s => [s.investor!.id, s.investor!])).values()
  ).sort((a, b) => (a.display_name || a.legal_name).localeCompare(b.display_name || b.legal_name))

  const filteredSubmissions = submissions.filter(sub => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      sub.investor?.display_name?.toLowerCase().includes(q) ||
      sub.investor?.legal_name?.toLowerCase().includes(q) ||
      sub.investor?.email?.toLowerCase().includes(q) ||
      getDocumentTypeLabel(sub.document_type, sub.custom_label).toLowerCase().includes(q) ||
      sub.counterparty_entity?.legal_name?.toLowerCase().includes(q)
    )
  })

  const queueCount = globalStats ? globalStats.pending : null
  const historyCount = globalStats ? globalStats.approved + globalStats.rejected + globalStats.info_requested + globalStats.expired : null

  // ─── Shared cell components ─────────────────────────────────────────────────

  // Merged document type + content cell — the clickable file/form is the single entry point for preview
  const DocumentCell = ({ submission }: { submission: KYCSubmission }) => {
    const DocIcon = getDocTypeIcon(submission.document_type)

    return (
      <div className="space-y-1.5">
        {/* Document type label with category icon */}
        <div className="flex items-center gap-1.5">
          <DocIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-sm leading-tight">
            {getDocumentTypeLabel(submission.document_type, submission.custom_label)}
          </span>
          {submission.version && submission.version > 1 && (
            <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded">v{submission.version}</span>
          )}
        </div>

        {/* Member badge */}
        {submission.investor_member && (
          <Badge variant="outline" className="text-[11px] font-normal py-0 h-5">
            {submission.investor_member.full_name}
            {submission.investor_member.role_title && ` · ${submission.investor_member.role_title}`}
          </Badge>
        )}

        {/* Clickable file / form indicator */}
        {submission.document ? (
          <button
            onClick={() => handlePreview(submission)}
            className="flex items-center gap-1.5 group text-left max-w-full"
            title="Click to preview"
          >
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${getFileBadgeClass(submission.document.mime_type)}`}>
              {getFileExt(submission.document.mime_type)}
            </span>
            <span className="text-xs text-muted-foreground group-hover:text-foreground group-hover:underline underline-offset-2 transition-colors truncate max-w-[160px]">
              {submission.document.name}
            </span>
            <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 hidden group-hover:inline">
              {formatFileSize(submission.document.file_size_bytes)}
            </span>
          </button>
        ) : submission.document_type === 'questionnaire' && submission.metadata ? (
          <button
            onClick={() => setViewingQuestionnaire(submission)}
            className="flex items-center gap-1 group text-left"
            title="Click to view questionnaire"
          >
            <ClipboardCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <span className="text-xs text-blue-500 group-hover:underline underline-offset-2">
              View questionnaire
            </span>
          </button>
        ) : (submission.document_type === 'personal_info' || submission.document_type === 'entity_info') && submission.metadata?.review_snapshot ? (
          <button
            onClick={() => setViewingProfileSnapshot(submission)}
            className="flex items-center gap-1 group text-left"
            title="Click to view profile snapshot"
          >
            <ClipboardList className="w-3 h-3 text-indigo-400 flex-shrink-0" />
            <span className="text-xs text-indigo-400 group-hover:underline underline-offset-2">
              View profile snapshot
            </span>
          </button>
        ) : (
          <span className="text-xs text-muted-foreground/40">No attachment</span>
        )}
      </div>
    )
  }

  const InvestorCell = ({ submission }: { submission: KYCSubmission }) => (
    <div>
      <div className="font-medium text-sm flex items-center gap-1.5 flex-wrap">
        {submission.counterparty_entity ? (
          <>
            {submission.counterparty_entity.legal_name}
            <Badge variant="outline" className="text-[11px] py-0 h-4">Entity</Badge>
          </>
        ) : (
          <>
            {submission.investor?.display_name || submission.investor?.legal_name || 'Unknown'}
            {submission.investor_id && submission.investor?.id && (
              <a
                href={`/versotech_main/investors/${submission.investor.id}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </>
        )}
      </div>
      <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap mt-0.5">
        <span>{submission.investor?.email || ''}</span>
        {submission.investor?.type && ['entity', 'corporate', 'institution'].includes(submission.investor.type) && (
          <Badge variant="secondary" className="text-[11px] py-0 h-4">{submission.investor.type}</Badge>
        )}
        {submission.investor?.kyc_status && (
          <Badge
            variant="outline"
            className={`text-[11px] py-0 h-4 ${
              submission.investor.kyc_status === 'approved' ? 'border-emerald-500/50 text-emerald-500' :
              submission.investor.kyc_status === 'pending' ? 'border-amber-500/50 text-amber-500' :
              submission.investor.kyc_status === 'rejected' ? 'border-rose-500/50 text-rose-500' :
              'border-muted-foreground/30 text-muted-foreground'
            }`}
          >
            KYC: {submission.investor.kyc_status}
          </Badge>
        )}
      </div>
    </div>
  )

  // Shared filter dropdowns JSX (inlined — NOT a sub-component to avoid remount on re-render)
  const filterDropdowns = (
    <>
      <div className="min-w-[160px]">
        <Label className="text-xs text-muted-foreground mb-1 block">Document Type</Label>
        <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueDocumentTypes.map(type => (
              <SelectItem key={type} value={type}>{getDocumentTypeLabel(type)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[140px]">
        <Label className="text-xs text-muted-foreground mb-1 block">Entity Type</Label>
        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="All entities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="investor">Investor</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="introducer">Introducer</SelectItem>
            <SelectItem value="lawyer">Lawyer</SelectItem>
            <SelectItem value="commercial_partner">Commercial Partner</SelectItem>
            <SelectItem value="arranger">Arranger</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[160px]">
        <Label className="text-xs text-muted-foreground mb-1 block">Investor</Label>
        <Select value={investorFilter} onValueChange={setInvestorFilter}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {uniqueInvestors.map(inv => (
              <SelectItem key={inv.id} value={inv.id}>{inv.display_name || inv.legal_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <Label className="text-xs text-muted-foreground mb-1 block">Search</Label>
        <Input
          placeholder="Name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
    </>
  )

  const PaginationControls = () => {
    if (!pagination || pagination.totalPages <= 1) return null
    return (
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{((pagination.page - 1) * pagination.pageSize) + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount}</span>
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1) }}>
            <SelectTrigger className="h-7 w-[65px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
          </Select>
          <span>per page</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(1)} disabled={!pagination.hasPrevPage}><ChevronsLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(page - 1)} disabled={!pagination.hasPrevPage}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <span className="px-2 text-sm text-muted-foreground">Page {pagination.page} / {pagination.totalPages}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(page + 1)} disabled={!pagination.hasNextPage}><ChevronRight className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(pagination.totalPages)} disabled={!pagination.hasNextPage}><ChevronsRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KYC Document Review</h1>
          <p className="text-muted-foreground mt-1">Review and approve KYC submissions across all personas</p>
        </div>
        {globalStats && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 text-sm font-medium border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />{globalStats.pending} Pending
            </span>
            <div className="w-px h-5 bg-border" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-sm font-medium border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" />{globalStats.approved} Approved
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-500 text-sm font-medium border border-rose-500/20">
              <XCircle className="w-3.5 h-3.5" />{globalStats.rejected} Rejected
            </span>
            {globalStats.info_requested > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
                <MessageSquare className="w-3.5 h-3.5" />{globalStats.info_requested} Info Requested
              </span>
            )}
            {globalStats.expired > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-sm font-medium border border-border">
                <AlertCircle className="w-3.5 h-3.5" />{globalStats.expired} Expired
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'queue' | 'history')}>
        <TabsList className="h-10">
          <TabsTrigger value="queue" className="flex items-center gap-2 px-5">
            <Inbox className="w-4 h-4" />
            Review Queue
            {queueCount !== null && (
              <Badge className={`ml-0.5 text-xs h-5 min-w-5 px-1.5 ${queueCount > 0 ? 'bg-amber-500 hover:bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {queueCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 px-5">
            <History className="w-4 h-4" />
            History
            {historyCount !== null && (
              <span className="ml-0.5 text-xs text-muted-foreground">({historyCount})</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Review Queue Tab ─────────────────────────────────────────────── */}
        <TabsContent value="queue" className="mt-4 space-y-4">
          <div className="flex items-end gap-3 flex-wrap">{filterDropdowns}</div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mb-3 opacity-60" />
              <p className="text-lg font-medium">All clear</p>
              <p className="text-sm text-muted-foreground mt-1">No documents awaiting review</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-10 pl-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.size > 0 && selectedIds.size === reviewableSubmissions.length}
                        onChange={e => e.target.checked ? selectAllReviewable() : clearSelection()}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>Investor / Entity</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead className="w-28">Submitted</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="text-right pr-4 w-56">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map(submission => (
                    <TableRow key={submission.id} className="group align-top">
                      <TableCell className="pl-4 pt-3">
                        {['pending', 'under_review'].includes(submission.status) && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(submission.id)}
                            onChange={() => toggleSelect(submission.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        )}
                      </TableCell>
                      <TableCell className="py-3"><InvestorCell submission={submission} /></TableCell>
                      <TableCell className="py-3"><DocumentCell submission={submission} /></TableCell>
                      <TableCell className="py-3">
                        <div className="text-sm">{new Date(submission.submitted_at).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">{new Date(submission.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </TableCell>
                      <TableCell className="py-3">{getStatusBadge(submission.status)}</TableCell>
                      <TableCell className="py-3 pr-4">
                        {['pending', 'under_review'].includes(submission.status) && (
                          <div className="flex items-center justify-end gap-1.5">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-emerald-500 border-emerald-500/50 hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-500 h-7 px-2.5"
                                    onClick={() => openReviewDialog(submission, 'approve')}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 mr-1" />Approve
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Approve this document</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-amber-500 border-amber-500/50 hover:bg-amber-950 hover:text-amber-400 hover:border-amber-500 h-7 px-2.5"
                                    onClick={() => openReviewDialog(submission, 'request_info')}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Request more information</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-rose-500 border-rose-500/50 hover:bg-rose-950 hover:text-rose-400 hover:border-rose-500 h-7 px-2.5"
                                    onClick={() => openReviewDialog(submission, 'reject')}
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-1" />Reject
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reject this document</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-4 pb-4">
                <PaginationControls />
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── History Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="history" className="mt-4 space-y-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="min-w-[140px]">
              <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
              <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Completed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="info_requested">Info Requested</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filterDropdowns}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <History className="w-12 h-12 text-muted-foreground mb-3 opacity-40" />
              <p className="text-lg font-medium">No history yet</p>
              <p className="text-sm text-muted-foreground mt-1">Reviewed documents will appear here</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Investor / Entity</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead className="w-28">Submitted</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead>Reviewed By</TableHead>
                    <TableHead className="w-28">Reviewed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map(submission => (
                    <TableRow key={submission.id} className="align-top">
                      <TableCell className="py-3"><InvestorCell submission={submission} /></TableCell>
                      <TableCell className="py-3"><DocumentCell submission={submission} /></TableCell>
                      <TableCell className="py-3">
                        <div className="text-sm">{new Date(submission.submitted_at).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">{new Date(submission.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          {getStatusBadge(submission.status)}
                          {(submission.status === 'rejected' || submission.status === 'info_requested') && submission.rejection_reason && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className={`text-xs max-w-[200px] truncate cursor-help mt-1 ${submission.status === 'info_requested' ? 'text-blue-400' : 'text-rose-400'}`}>
                                    {submission.rejection_reason}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px]">
                                  <p className="text-sm">{submission.rejection_reason}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        {submission.reviewer ? (
                          <div className="text-sm font-medium">{submission.reviewer.display_name}</div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {submission.reviewed_at ? (
                          <>
                            <div className="text-sm">{new Date(submission.reviewed_at).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">{new Date(submission.reviewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </>
                        ) : <span className="text-sm text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-4 pb-4">
                <PaginationControls />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Review Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' && 'Approve Document'}
              {reviewAction === 'reject' && 'Reject Document'}
              {reviewAction === 'request_info' && 'Request Additional Information'}
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <>
                  {getDocumentTypeLabel(selectedSubmission.document_type, selectedSubmission.custom_label)} for{' '}
                  {selectedSubmission.counterparty_entity
                    ? `${selectedSubmission.counterparty_entity.legal_name} (Entity of ${selectedSubmission.investor?.display_name || selectedSubmission.investor?.legal_name || 'Unknown'})`
                    : selectedSubmission.investor?.display_name || selectedSubmission.investor?.legal_name || 'Unknown'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(reviewAction === 'reject' || reviewAction === 'request_info') && (
              <div>
                <Label htmlFor="rejection-reason">
                  {reviewAction === 'request_info' ? 'What information is needed?' : 'Rejection Reason'}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="rejection-reason"
                  placeholder={reviewAction === 'request_info'
                    ? 'Specify what additional information or documents are needed...'
                    : 'Explain why this document is being rejected...'}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="review-notes">Notes (Optional)</Label>
              <Textarea
                id="review-notes"
                placeholder="Any additional notes..."
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)} disabled={reviewing}>Cancel</Button>
            <Button
              onClick={handleReview}
              disabled={reviewing}
              className={reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : reviewAction === 'request_info' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              {reviewing ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : reviewAction === 'request_info' ? 'Send Request' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Fullscreen Document Viewer ───────────────────────────────────────── */}
      <DocumentViewerFullscreen
        isOpen={previewOpen}
        document={previewDocument}
        previewUrl={previewUrl}
        isLoading={isLoadingPreview}
        error={previewError}
        onClose={closePreview}
        onDownload={downloadFromPreview}
        watermark={previewWatermark}
      />

      {/* ── Questionnaire Viewer ─────────────────────────────────────────────── */}
      {viewingQuestionnaire && (
        <QuestionnaireViewer
          open={!!viewingQuestionnaire}
          onClose={() => setViewingQuestionnaire(null)}
          investorName={viewingQuestionnaire.investor?.display_name || viewingQuestionnaire.investor?.legal_name || 'Unknown'}
          submittedAt={viewingQuestionnaire.submitted_at}
          metadata={viewingQuestionnaire.metadata || {}}
        />
      )}

      {/* ── Profile Snapshot Viewer ──────────────────────────────────────────── */}
      {viewingProfileSnapshot && (
        <ProfileSnapshotViewer
          open={!!viewingProfileSnapshot}
          onClose={() => setViewingProfileSnapshot(null)}
          entityName={
            viewingProfileSnapshot.counterparty_entity?.legal_name ||
            viewingProfileSnapshot.investor?.display_name ||
            viewingProfileSnapshot.investor?.legal_name ||
            'Unknown'
          }
          submittedAt={viewingProfileSnapshot.submitted_at}
          documentType={viewingProfileSnapshot.document_type as 'personal_info' | 'entity_info'}
          snapshot={viewingProfileSnapshot.metadata?.review_snapshot || {}}
          memberName={viewingProfileSnapshot.investor_member?.full_name}
        />
      )}

      {/* ── Bulk Action Bar — sticky to viewport bottom ──────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[11px] font-bold text-primary-foreground">{selectedIds.size}</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {selectedIds.size} document{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={clearSelection} disabled={reviewing}>
                Deselect all
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setBulkRejectOpen(true)} disabled={reviewing}>
                <XCircle className="h-3.5 w-3.5 mr-1.5" />Reject All
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleBulkAction('approve')} disabled={reviewing}>
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approve All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Reject Dialog ───────────────────────────────────────────────── */}
      <Dialog open={bulkRejectOpen} onOpenChange={setBulkRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject {selectedIds.size} Documents</DialogTitle>
            <DialogDescription>All selected documents will be rejected with the same reason.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="bulk-rejection-reason">Rejection Reason <span className="text-destructive">*</span></Label>
            <Textarea
              id="bulk-rejection-reason"
              placeholder="Explain why these documents are being rejected..."
              value={bulkRejectionReason}
              onChange={e => setBulkRejectionReason(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRejectOpen(false)} disabled={reviewing}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleBulkAction('reject', bulkRejectionReason)} disabled={reviewing || !bulkRejectionReason.trim()}>
              {reviewing ? 'Processing...' : 'Reject All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
