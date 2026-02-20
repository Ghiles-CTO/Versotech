'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { DealLogo } from '@/components/deals/deal-logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { InvestorJourneyBar } from '@/components/deals/investor-journey-bar'
import { DataRoomViewer, type DataRoomDocument } from '@/components/deals/data-room-viewer'
import { DealTimelineCard } from '@/components/deals/deal-timeline-card'
import { DealKeyDetailsCard } from '@/components/deals/deal-key-details-card'
import { InterestStatusCard } from '@/components/deals/interest-status-card'
import { SubscriptionStatusCard } from '@/components/deals/subscription-status-card'
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  MapPin,
  Globe,
  FileText,
  FileSpreadsheet,
  FileImage,
  Presentation,
  File,
  Download,
  Eye,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSignature,
  Users,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  Tag,
  FolderOpen,
  Loader2,
  DollarSign,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import type { DocumentReference } from '@/types/document-viewer.types'
import { usePersona } from '@/contexts/persona-context'
import { useProxyMode } from '@/components/commercial-partner'
import { getAccountStatusCopy, formatKycStatusLabel } from '@/lib/account-approval-status'
import { isPreviewableExtension } from '@/constants/document-preview.constants'
import { DocumentService } from '@/services/document.service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  category: string
  description: string | null
  uploaded_at: string
  is_featured: boolean
  external_link: string | null
  file_key: string | null
}

interface FeeStructure {
  id: string
  status: string
  version: number
  // Header
  to_description: string | null
  // Opportunity Summary
  opportunity_summary: string | null
  term_sheet_html: string | null
  // Transaction Details
  transaction_type: string | null
  issuer: string | null
  vehicle: string | null
  exclusive_arranger: string | null
  purchaser: string | null
  seller: string | null
  structure: string | null
  // Investment Terms
  allocation_up_to: number | null
  price_per_share: number | null
  price_per_share_text: string | null
  minimum_ticket: number | null
  maximum_ticket: number | null
  // Fee Structure
  subscription_fee_percent: number | null
  management_fee_percent: number | null
  carried_interest_percent: number | null
  management_fee_clause: string | null
  performance_fee_clause: string | null
  // Timeline
  term_sheet_date: string | null
  interest_confirmation_deadline: string | null
  interest_confirmation_text: string | null
  validity_date: string | null
  completion_date: string | null
  completion_date_text: string | null
  capital_call_timeline: string | null
  // Legal
  legal_counsel: string | null
  // Notes
  in_principle_approval_text: string | null
  subscription_pack_note: string | null
  share_certificates_note: string | null
  subject_to_change_note: string | null
  // Attachment
  term_sheet_attachment_key: string | null
}

interface FAQ {
  id: string
  question: string
  answer: string
  display_order: number
}

interface Signatory {
  id: string
  full_name: string
  email: string
  role: string
}

interface Opportunity {
  id: string
  name: string
  description: string | null
  investment_thesis: string | null
  status: string
  deal_type: string | null
  currency: string
  minimum_investment: number | null
  maximum_investment: number | null
  target_amount: number | null
  raised_amount: number | null
  offer_unit_price: number | null
  open_at: string | null
  close_at: string | null
  company_name: string | null
  company_logo_url: string | null
  company_website: string | null
  sector: string | null
  stage: string | null
  location: string | null
  stock_type: string | null
  deal_round: string | null
  vehicle: {
    id: string
    name: string
    type: string
    entity_code: string | null
    series_number: number | null
  } | null
  account_approval_status: string | null
  kyc_status: string | null
  is_account_approved: boolean | null
  has_membership: boolean
  membership: {
    role: string
    dispatched_at: string | null
    viewed_at: string | null
    interest_confirmed_at: string | null
    nda_signed_at: string | null
    data_room_granted_at: string | null
  } | null
  journey: {
    current_stage: number
    stages: any[]
    summary: {
      received: string | null
      viewed: string | null
      interest_confirmed: string | null
      nda_signed: string | null
      data_room_access: string | null
      pack_generated: string | null
      pack_sent: string | null
      signed: string | null
      funded: string | null
      active: string | null
    }
  }
  data_room: {
    has_access: boolean
    access_details: {
      granted_at: string
      expires_at: string | null
      auto_granted: boolean
    } | null
    documents: Document[]
    featured_documents?: Document[]
    requires_nda: boolean
  }
  subscription: {
    id: string
    status: string
    commitment: number | null
    currency: string
    funded_amount: number | null
    pack_generated_at: string | null
    pack_sent_at: string | null
    signed_at: string | null
    funded_at: string | null
    activated_at: string | null
    created_at: string | null
    is_signed: boolean
    is_funded: boolean
    is_active: boolean
    documents: {
      nda: {
        status: string
        signatories: Array<{
          name: string
          email: string
          status: string
          signed_at: string | null
        }>
        unsigned_url: string | null
        signed_url: string | null
      }
      subscription_pack: {
        status: string
        signatories: Array<{
          name: string
          email: string
          status: string
          signed_at: string | null
        }>
        unsigned_url: string | null
        signed_url: string | null
      }
      certificate: {
        status: string
        url: string | null
      } | null
    } | null
  } | null
  subscription_submission?: {
    id: string
    status: string
    submitted_at: string | null
  } | null
  fee_structures: FeeStructure[]
  faqs: FAQ[]
  signatories: Signatory[]
  nda_signing_url?: string | null
  can_express_interest: boolean
  can_sign_nda: boolean
  can_access_data_room: boolean
  can_subscribe: boolean
  can_sign_subscription: boolean
  is_tracking_only?: boolean
  // PERSONA-BASED ACCESS CONTROLS (per Fred's meeting requirements)
  access_controls?: {
    can_view_term_sheet: boolean
    can_view_data_room: boolean
    has_auto_data_room_access: boolean
    restriction_reason: string | null
  }
}

function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const datePart = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  })
  return `${datePart} ${timePart}`
}

// Format with identifier like PDF does - e.g., "ABC Company" → 'ABC Company ("Issuer")'
function withIdentifier(text: string | null | undefined, identifier: string): string {
  if (!text) return ''
  const trimmed = text.trim()
  if (trimmed.includes(`("${identifier}")`)) return trimmed
  return `${trimmed} ("${identifier}")`
}

// Format fee like PDF: "Waived (instead of X%)" or "X%"
function formatFeeDisplay(percent: number | null, type: 'subscription' | 'management' | 'carry'): string {
  if (percent === null || percent === undefined) return 'N/A'
  if (percent === 0) {
    if (type === 'subscription') return 'Waived (instead of 2.00%)'
    if (type === 'management') return 'Waived (instead of 2.00% per annum)'
    return 'Waived (instead of 20.00% no hurdle rate, no applicable cap)'
  }
  if (type === 'management') return `${percent.toFixed(2)}% per annum`
  if (type === 'carry') return `${percent.toFixed(2)}% (no hurdle rate)`
  return `${percent.toFixed(2)}%`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getDocIcon(fileName: string, fileType: string, isExternal: boolean) {
  if (isExternal) return { Icon: ExternalLink, color: 'text-blue-500' }
  // Check mime type first (more reliable), then fall back to extension
  if (fileType) {
    if (fileType.includes('pdf')) return { Icon: FileText, color: 'text-red-500' }
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) return { Icon: FileSpreadsheet, color: 'text-emerald-500' }
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return { Icon: Presentation, color: 'text-orange-500' }
    if (fileType.includes('word') || fileType.includes('document')) return { Icon: FileText, color: 'text-blue-500' }
    if (fileType.includes('image')) return { Icon: FileImage, color: 'text-purple-500' }
  }
  // Extension fallback
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return { Icon: FileText, color: 'text-red-500' }
  if (['xlsx', 'xls', 'csv'].includes(ext)) return { Icon: FileSpreadsheet, color: 'text-emerald-500' }
  if (['pptx', 'ppt'].includes(ext)) return { Icon: Presentation, color: 'text-orange-500' }
  if (['doc', 'docx'].includes(ext)) return { Icon: FileText, color: 'text-blue-500' }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return { Icon: FileImage, color: 'text-purple-500' }
  return { Icon: File, color: 'text-muted-foreground' }
}

function FeaturedDocRow({ doc, dealId, onPreview }: {
  doc: { id: string; file_name: string; file_size: number; file_type: string; external_link?: string | null }
  dealId: string
  onPreview?: (doc: { id: string; file_name: string; file_size: number; file_type: string }) => void
}) {
  const [loading, setLoading] = useState<'preview' | 'download' | null>(null)
  const { Icon, color } = getDocIcon(doc.file_name, doc.file_type, !!doc.external_link)
  const canPreview = !doc.external_link && isPreviewableExtension(doc.file_name)

  const handleAction = async (mode: 'preview' | 'download') => {
    if (doc.external_link) {
      window.open(doc.external_link, '_blank', 'noopener,noreferrer')
      return
    }
    // For preview mode, use the shared viewer if available
    if (mode === 'preview' && onPreview) {
      onPreview(doc)
      return
    }
    setLoading(mode)
    try {
      const response = await fetch(`/api/deals/${dealId}/documents/${doc.id}/download?mode=${mode}`)
      if (!response.ok) throw new Error('Failed to get link')
      const data = await response.json()
      window.open(data.download_url, '_blank')
    } catch {
      toast.error(`Failed to ${mode} document`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/50 rounded-lg transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center p-2 rounded-lg bg-muted/60 flex-shrink-0">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate text-foreground">{doc.file_name}</p>
          {doc.file_size > 0 && (
            <p className="text-xs text-muted-foreground">{formatFileSize(doc.file_size)}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 ml-3">
        {doc.external_link ? (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-blue-600"
            title="Open link"
            onClick={() => handleAction('preview')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        ) : (
          <>
            {canPreview && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                title="Preview"
                onClick={() => handleAction('preview')}
                disabled={loading !== null}
              >
                {loading === 'preview' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Download"
              onClick={() => handleAction('download')}
              disabled={loading !== null}
            >
              {loading === 'download' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dealId = params.id as string
  const actionParam = searchParams.get('action')
  const fromParam = searchParams.get('from') // Track where user came from

  const { hasAnyPersona, isLoading: personaLoading, activePersona, error: personaError } = usePersona()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  // Dialog states
  const [showInterestDialog, setShowInterestDialog] = useState(false)
  const [showNdaDialog, setShowNdaDialog] = useState(false)
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false)
  const [subscribeAmount, setSubscribeAmount] = useState('')
  const [subscribeBankConfirm, setSubscribeBankConfirm] = useState(true)
  const [subscribeNotes, setSubscribeNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [ndaRequestOpen, setNdaRequestOpen] = useState(false)
  const [ndaRequestSubject, setNdaRequestSubject] = useState('')
  const [ndaRequestDetails, setNdaRequestDetails] = useState('')
  const [ndaRequestSubmitting, setNdaRequestSubmitting] = useState(false)
  const isPartnerPersona = activePersona?.persona_type === 'partner'

  // Term sheet preview state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewDocument, setPreviewDocument] = useState<DocumentReference | null>(null)
  const [previewWatermark, setPreviewWatermark] = useState<Record<string, any> | null>(null)
  const { isProxyMode, selectedClient } = useProxyMode()

  useEffect(() => {
    // CRITICAL: AbortController prevents race conditions when navigating between deals
    // Without this, if you navigate A→B quickly, fetch A might complete AFTER fetch B
    // and overwrite the correct data with stale data
    const abortController = new AbortController()
    let isCancelled = false

    // Reset state when dealId changes
    setOpportunity(null)
    setError(null)
    setLoading(true)

    async function fetchOpportunity() {
      try {
        console.log(`[OpportunityDetail] Starting fetch for dealId: ${dealId}`)

        // Record view (fire and forget, don't block on this)
        fetch(`/api/investors/me/opportunities/${dealId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'view' }),
          cache: 'no-store'
        }).catch(() => {}) // Ignore errors from view recording

        // Fetch opportunity data with abort signal
        const timestamp = Date.now()
        const proxyParam = isProxyMode && selectedClient?.id
          ? `&client_investor_id=${selectedClient.id}`
          : ''
        const response = await fetch(`/api/investors/me/opportunities/${dealId}?_t=${timestamp}${proxyParam}`, {
          cache: 'no-store',
          signal: abortController.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })

        // Check if this request was cancelled (user navigated away)
        if (isCancelled) {
          console.log(`[OpportunityDetail] Fetch for ${dealId} was cancelled (user navigated away)`)
          return
        }

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch opportunity (${response.status})`)
        }

        // Double-check we're still on the same deal before setting state
        if (isCancelled) {
          console.log(`[OpportunityDetail] Ignoring response for ${dealId} - request was cancelled`)
          return
        }

        console.log(`[OpportunityDetail] ✅ Setting state for: "${data.opportunity?.name}" (ID: ${data.opportunity?.id})`)

        if (data.opportunity?.id !== dealId) {
          console.error(`[OpportunityDetail] ⚠️ MISMATCH! URL has ${dealId} but API returned ${data.opportunity?.id}`)
        }

        setOpportunity(data.opportunity)
        const trackingOnlyForPersona = data.opportunity.is_tracking_only || (isPartnerPersona && !data.opportunity.membership?.role)

        if (actionParam === 'subscribe' && data.opportunity.can_subscribe && !trackingOnlyForPersona) {
          setShowSubscribeDialog(true)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log(`[OpportunityDetail] Fetch aborted for ${dealId}`)
          return
        }
        if (!isCancelled) {
          console.error('Error fetching opportunity:', err)
          setError('Failed to load opportunity details')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    if (hasAnyPersona && dealId) {
      fetchOpportunity()
    }

    // Cleanup: Cancel any in-flight requests when dealId changes or component unmounts
    return () => {
      console.log(`[OpportunityDetail] Cleanup: Cancelling fetch for ${dealId}`)
      isCancelled = true
      abortController.abort()
    }
  }, [hasAnyPersona, dealId, actionParam, isPartnerPersona, isProxyMode, selectedClient?.id])

  const handleExpressInterest = async () => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/deals/${dealId}/interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to submit interest')
      }

      // Refresh data
      const proxyParam = isProxyMode && selectedClient?.id
        ? `?client_investor_id=${selectedClient.id}`
        : ''
      const refreshResponse = await fetch(`/api/investors/me/opportunities/${dealId}${proxyParam}`)
      const data = await refreshResponse.json()
      setOpportunity(data.opportunity)
      setShowInterestDialog(false)
    } catch (err) {
      console.error('Error expressing interest:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // NDA signing is now handled automatically after CEO approval
  // This function has been removed - NDA documents are generated and sent
  // via the approval workflow, not triggered directly by investors

  // Format a raw number string with thousand separators
  const formatAmountDisplay = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '')
    if (!cleaned) return ''
    const parts = cleaned.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0]
  }

  const parseDisplayAmount = (display: string): number => {
    return parseFloat(display.replace(/,/g, '')) || 0
  }

  const handleSubscribe = async () => {
    if (!subscribeAmount || !opportunity) return

    try {
      setActionLoading(true)

      let response: Response
      if (isProxyMode && selectedClient?.id) {
        response = await fetch('/api/commercial-partners/proxy-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deal_id: dealId,
            client_investor_id: selectedClient.id,
            commitment: parseDisplayAmount(subscribeAmount),
            stock_type: opportunity.stock_type || 'common',
            notes: `Submitted in proxy mode by commercial partner`
          })
        })
      } else {
        // Submit subscription for review (creates CEO approval)
        response = await fetch(`/api/deals/${dealId}/subscriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payload: {
              amount: parseDisplayAmount(subscribeAmount),
              currency: opportunity.currency,
              bank_confirmation: subscribeBankConfirm,
              notes: subscribeNotes.trim() || null
            },
            subscription_type: 'personal'
          })
        })
      }

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to submit subscription')
      }

      await response.json()

      // Refresh data
      const proxyParam = isProxyMode && selectedClient?.id
        ? `?client_investor_id=${selectedClient.id}`
        : ''
      const refreshResponse = await fetch(`/api/investors/me/opportunities/${dealId}${proxyParam}`)
      const data = await refreshResponse.json()
      setOpportunity(data.opportunity)
      setShowSubscribeDialog(false)
      setSubscribeAmount('')
      setSubscribeBankConfirm(true)
      setSubscribeNotes('')

      toast.success('Subscription submitted for review', {
        description: 'The VERSO team will follow up shortly.'
      })
    } catch (err: any) {
      console.error('Error subscribing:', err)
      toast.error(err.message || 'Failed to submit subscription')
    } finally {
      setActionLoading(false)
    }
  }

  const openNdaRequestDialog = () => {
    if (!ndaRequestSubject.trim()) {
      const dealLabel = opportunity?.name || 'deal'
      setNdaRequestSubject(`NDA modification request - ${dealLabel}`)
    }
    setShowNdaDialog(false)
    setNdaRequestOpen(true)
  }

  const handleNdaRequestSubmit = async () => {
    if (!ndaRequestSubject.trim()) {
      toast.error('Please enter a subject for the NDA request.')
      return
    }
    if (!ndaRequestDetails.trim()) {
      toast.error('Please add details about the NDA changes you need.')
      return
    }

    try {
      setNdaRequestSubmitting(true)
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'communication',
          subject: ndaRequestSubject.trim(),
          details: ndaRequestDetails.trim(),
          dealId,
          requestType: 'nda_modification'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit NDA request')
      }

      toast.success('NDA modification request sent.')
      setNdaRequestDetails('')
      setNdaRequestOpen(false)
    } catch (error) {
      console.error('Error submitting NDA modification request:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit NDA request')
    } finally {
      setNdaRequestSubmitting(false)
    }
  }


  // Show loading while persona context is initializing
  if (personaLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!hasAnyPersona) {
    return (
      <div>
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
            <CardDescription>
              You need to be associated with an entity to view this opportunity.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !opportunity) {
    return (
      <div>
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'Opportunity not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(
              fromParam === 'introductions'
                ? '/versotech_main/introductions'
                : '/versotech_main/opportunities'
            )}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {fromParam === 'introductions' ? 'Back to Introductions' : 'Back to Opportunities'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isTrackingOnly = !!opportunity.is_tracking_only || (isPartnerPersona && !opportunity.membership?.role)
  const isAccountApproved = opportunity.is_account_approved === true || opportunity.account_approval_status === 'approved'
  const showAccountBlock = opportunity.is_account_approved === false ||
    (opportunity.account_approval_status !== null && opportunity.account_approval_status !== 'approved')
  const accountStatusCopy = getAccountStatusCopy(opportunity.account_approval_status, opportunity.kyc_status)
  const approvalStatusLabel = accountStatusCopy.label
  const kycStatusLabel = formatKycStatusLabel(opportunity.kyc_status)
  const isBlacklisted = opportunity.account_approval_status === 'unauthorized'
  const subscriptionSubmittedAt = opportunity.subscription_submission?.submitted_at ?? null
  const canSubscribe = opportunity.can_subscribe && !isTrackingOnly && isAccountApproved
  const canExpressInterest = opportunity.can_express_interest && !isTrackingOnly && isAccountApproved

  // Derive subscription limits from termsheet (fee_structures), falling back to deal-level fields
  const publishedTermSheet = opportunity.fee_structures.find(ts => ts.status === 'published') || opportunity.fee_structures[0] || null
  const subscribeMinAmount = publishedTermSheet?.minimum_ticket ?? null
  const subscribeMaxAmount = publishedTermSheet?.allocation_up_to ?? null
  const canSignNda = opportunity.can_sign_nda && !isTrackingOnly && isAccountApproved
  const showActionChoices =
    !isBlacklisted &&
    opportunity.status !== 'closed' &&
    !opportunity.subscription &&
    (canSubscribe || canExpressInterest)
  const journeySummary = showAccountBlock ? {
    ...opportunity.journey.summary,
    interest_confirmed: null,
    nda_signed: null,
    data_room_access: null,
    pack_generated: null,
    pack_sent: null,
    signed: null,
    funded: null,
    active: null
  } : opportunity.journey.summary

  const handleSignNda = () => {
    // Navigate to tasks page where all signature tasks are listed
    // This handles multiple signatories properly and works for investors
    router.push('/versotech_main/tasks')
  }

  return (
    <div className="space-y-6">
      {/* Back button - context-aware navigation */}
      <Button
        variant="ghost"
        onClick={() => {
          // If user came from introductions, go back there specifically
          if (fromParam === 'introductions') {
            router.push('/versotech_main/introductions')
          } else {
            router.back()
          }
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {fromParam === 'introductions' ? 'Back to Introductions' : 'Back'}
      </Button>

      {/* Journey Progress Bar */}
      {!isTrackingOnly ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Investment Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <InvestorJourneyBar
              summary={journeySummary}
              currentStage={opportunity.journey.current_stage}
              subscriptionSubmittedAt={subscriptionSubmittedAt}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tracking Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>
                This deal is available for tracking only. Contact your relationship manager for investor access.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deal Timeline */}
      <DealTimelineCard
        openAt={opportunity.open_at}
        closeAt={opportunity.close_at}
      />

      {/* Header */}
      <div className="flex items-start gap-6">
        <DealLogo
          src={opportunity.company_logo_url}
          alt={opportunity.company_name || opportunity.name}
          size={80}
          rounded="xl"
          className="bg-gray-100 dark:bg-gray-800"
          fallback={<Building2 className="w-10 h-10 text-gray-400" />}
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{opportunity.name}</h1>
          {opportunity.company_name && (
            <p className="text-muted-foreground">{opportunity.company_name}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {opportunity.sector && (
              <Badge variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                {opportunity.sector}
              </Badge>
            )}
            {opportunity.stage && (
              <Badge variant="outline">{opportunity.stage}</Badge>
            )}
            {opportunity.location && (
              <Badge variant="outline">
                <MapPin className="w-3 h-3 mr-1" />
                {opportunity.location}
              </Badge>
            )}
            {opportunity.stock_type && (
              <Badge variant="outline" className="border-purple-300 text-purple-700 dark:text-purple-300">
                <Tag className="w-3 h-3 mr-1" />
                {opportunity.stock_type === 'common'
                  ? 'Common and Ordinary Shares'
                  : opportunity.stock_type.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 min-w-[280px]">
          {showAccountBlock && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              <p className="text-sm font-medium">Account approval required</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Status: {approvalStatusLabel}. {accountStatusCopy.description}
                {kycStatusLabel ? ` KYC status: ${kycStatusLabel}.` : ''}
              </p>
            </div>
          )}
          {/* Two Investment Paths for Open Deals */}
          {showActionChoices && (
            <div className="space-y-3">
              {/* Primary: Subscribe Directly */}
              {canSubscribe && (
                <div className="relative">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-auto py-3"
                    onClick={() => setShowSubscribeDialog(true)}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">Subscribe to Investment</div>
                        <div className="text-xs opacity-90 font-normal">Submit for review • Subscription pack</div>
                      </div>
                    </div>
                  </Button>
                </div>
              )}

              {/* OR Divider */}
              {canSubscribe && canExpressInterest && (
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs text-muted-foreground font-medium px-2">OR</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>
              )}

              {/* Secondary: Data Room Interest */}
              {/* PERSONA ACCESS RULE: Hide for introducers and lawyers who can't access data room */}
              {canExpressInterest && opportunity.access_controls?.can_view_data_room !== false && (
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 border-dashed"
                  onClick={() => setShowInterestDialog(true)}
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-amber-600" />
                    <div className="text-left">
                      <div className="font-medium">Request Data Room Access</div>
                      <div className="text-xs text-muted-foreground font-normal">Review documents first</div>
                    </div>
                  </div>
                </Button>
              )}
            </div>
          )}

          {/* Show NDA info when in NDA stage - signing is triggered after CEO approval */}
          {canSignNda && (
            <Button variant="outline" onClick={handleSignNda}>
              <FileSignature className="w-4 h-4 mr-2" />
              Sign NDA
            </Button>
          )}

          {/* Subscription Status Badges */}
          {opportunity.subscription && !opportunity.subscription.is_active && (
            <Badge className="justify-center py-2" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              {opportunity.subscription.is_funded ? 'Awaiting Activation' :
               opportunity.subscription.is_signed ? 'Awaiting Funding' :
               'Awaiting Signature'}
            </Badge>
          )}
          {opportunity.subscription?.is_active && (
            <Badge className="justify-center py-2 bg-emerald-500 text-white">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Active Investment
            </Badge>
          )}

          {/* Ask Question - always available */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => router.push(`/versotech_main/inbox?deal=${opportunity.id}&deal_name=${encodeURIComponent(opportunity.name)}`)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask a Question
          </Button>
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {/* PERSONA ACCESS RULE: Hide Data Room tab for introducers and lawyers */}
          {(opportunity.access_controls?.can_view_data_room !== false) && (
            <TabsTrigger value="data-room" className="relative">
              Data Room
              {!opportunity.data_room.has_access && (
                <Lock className="w-3 h-3 ml-1" />
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Subscription Status OR Interest Status + Key Details Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Show SubscriptionStatusCard when subscription exists, otherwise show InterestStatusCard */}
            {opportunity.subscription ? (
              <SubscriptionStatusCard
                subscription={opportunity.subscription}
                dealCurrency={opportunity.currency}
                dealId={opportunity.id}
                dealName={opportunity.name}
              />
            ) : opportunity.subscription_submission ? (
              <Card className="border-2 border-dashed border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                      <Clock className="h-5 w-5 text-amber-600" />
                      Subscription Under Review
                    </CardTitle>
                    <Badge className="bg-amber-200 text-amber-900 border-0">
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-amber-800">
                  {opportunity.subscription_submission.submitted_at
                    ? `Submitted on ${formatDate(opportunity.subscription_submission.submitted_at)}.`
                    : 'Submitted and awaiting CEO approval.'}
                </CardContent>
              </Card>
            ) : (
              <InterestStatusCard
                currentStage={opportunity.journey.current_stage}
                membership={opportunity.membership}
                subscription={null}
                canExpressInterest={canExpressInterest}
                canSignNda={canSignNda}
                canSubscribe={canSubscribe}
                isTrackingOnly={isTrackingOnly}
                isAccountApproved={isAccountApproved}
                accountApprovalStatus={opportunity.account_approval_status}
                onExpressInterest={() => setShowInterestDialog(true)}
                onSignNda={handleSignNda}
                onSubscribe={() => setShowSubscribeDialog(true)}
              />
            )}
            <div className="lg:col-span-2">
              <DealKeyDetailsCard
                currency={opportunity.currency}
                stockType={opportunity.stock_type}
                sector={opportunity.sector}
                location={opportunity.location}
                vehicleName={opportunity.vehicle?.name || null}
                stage={opportunity.stage}
                round={opportunity.deal_round}
              />
            </div>
          </div>

          {/* Company Info - Full Width */}
          {(opportunity.description || opportunity.investment_thesis || opportunity.company_website) && (
            <Card>
              <CardHeader>
                <CardTitle>About the Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {opportunity.description && (
                    <div className="md:col-span-2">
                      <Label className="text-muted-foreground text-sm">Description</Label>
                      <p className="mt-1.5 text-foreground leading-relaxed">{opportunity.description}</p>
                    </div>
                  )}
                  {opportunity.investment_thesis && (
                    <div className="md:col-span-2">
                      <Label className="text-muted-foreground text-sm">Investment Thesis</Label>
                      <p className="mt-1.5 text-foreground leading-relaxed">{opportunity.investment_thesis}</p>
                    </div>
                  )}
                  {opportunity.company_website && (
                    <div>
                      <Label className="text-muted-foreground text-sm">Website</Label>
                      <a
                        href={opportunity.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline mt-1.5 font-medium"
                      >
                        <Globe className="w-4 h-4" />
                        {opportunity.company_website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Featured Documents — visible without data room access */}
          {opportunity.access_controls?.can_view_data_room !== false &&
            opportunity.data_room.featured_documents &&
            opportunity.data_room.featured_documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Featured Documents</CardTitle>
                <CardDescription>Key documents available for review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {opportunity.data_room.featured_documents.map((doc) => (
                  <FeaturedDocRow
                    key={doc.id}
                    doc={doc}
                    dealId={opportunity.id}
                    onPreview={(d) => {
                      const docRef: DocumentReference = {
                        id: d.id,
                        file_name: d.file_name,
                        mime_type: d.file_type,
                        file_size_bytes: d.file_size,
                      }
                      setPreviewDocument(docRef)
                      setPreviewOpen(true)
                      setPreviewLoading(true)
                      setPreviewError(null)
                      setPreviewUrl(null)

                      DocumentService.getDealDocumentPreviewUrl(opportunity.id, d.id)
                        .then((res) => {
                          setPreviewUrl(res.download_url)
                          setPreviewWatermark(res.watermark || null)
                        })
                        .catch((err) => {
                          console.error('Error loading featured doc preview:', err)
                          setPreviewError(err instanceof Error ? err.message : 'Failed to load preview')
                        })
                        .finally(() => setPreviewLoading(false))
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Term Sheet */}
          {/* PERSONA ACCESS RULE: Hide Term Sheet for introducers and lawyers */}
          {opportunity.access_controls?.can_view_term_sheet !== false && opportunity.fee_structures.length > 0 && (() => {
            const termSheet = opportunity.fee_structures.find(ts => ts.status === 'published') || opportunity.fee_structures[0]
            if (!termSheet) return null

            const handlePreviewTermSheet = async () => {
              if (!termSheet.term_sheet_attachment_key) return

              // Set up document reference for viewer
              const fileName = termSheet.term_sheet_attachment_key.split('/').pop() || 'Term Sheet.pdf'
              setPreviewDocument({
                id: termSheet.id,
                file_name: fileName,
                name: fileName,
                mime_type: 'application/pdf',
                type: 'term_sheet'
              })
              setPreviewOpen(true)
              setPreviewLoading(true)
              setPreviewError(null)
              setPreviewUrl(null)

              try {
                // Use the correct endpoint with structureId
                const response = await fetch(`/api/deals/${opportunity.id}/fee-structures/${termSheet.id}/attachment`)
                const result = await response.json()
                if (!response.ok) throw new Error(result.error || 'Failed to load preview')
                setPreviewUrl(result.url)
              } catch (err) {
                console.error('Error loading term sheet preview:', err)
                setPreviewError(err instanceof Error ? err.message : 'Failed to load preview')
              } finally {
                setPreviewLoading(false)
              }
            }

            const closePreview = () => {
              setPreviewOpen(false)
              if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
              }
              setPreviewUrl(null)
              setPreviewError(null)
              setPreviewDocument(null)
            }

            const handleDownloadFromPreview = () => {
              if (previewUrl) {
                window.open(previewUrl, '_blank')
              }
            }

            // Get vehicle identifier (entity_code like VC209)
            const vehicleIdentifier = opportunity.vehicle?.entity_code ||
              (opportunity.vehicle?.series_number ? `VC${opportunity.vehicle.series_number}` : 'Vehicle')

            return (
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">Indicative Term Sheet</CardTitle>
                    {termSheet.term_sheet_attachment_key && (
                      <Button onClick={handlePreviewTermSheet} size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview PDF
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {/* Table format matching PDF template exactly */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y">
                        {/* Date */}
                        <tr>
                          <td className="px-4 py-3 bg-muted/50 font-semibold w-1/4">Date</td>
                          <td className="px-4 py-3">{termSheet.term_sheet_date ? formatDate(termSheet.term_sheet_date) : '-'}</td>
                        </tr>
                        {/* To */}
                        <tr>
                          <td className="px-4 py-3 bg-muted/50 font-semibold">To</td>
                          <td className="px-4 py-3">{termSheet.to_description || 'Qualified, Professional and Institutional Investors only'}</td>
                        </tr>
                        {/* Transaction Type */}
                        {termSheet.transaction_type && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Transaction Type</td>
                            <td className="px-4 py-3">{termSheet.transaction_type}</td>
                          </tr>
                        )}
                        {/* Opportunity */}
                        {(termSheet.term_sheet_html || termSheet.opportunity_summary) && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold align-top">Opportunity</td>
                            <td className="px-4 py-3">
                              {termSheet.term_sheet_html ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: termSheet.term_sheet_html }} />
                              ) : (
                                <p className="whitespace-pre-wrap">{termSheet.opportunity_summary}</p>
                              )}
                            </td>
                          </tr>
                        )}
                        {/* Issuer */}
                        {termSheet.issuer && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Issuer</td>
                            <td className="px-4 py-3">{withIdentifier(termSheet.issuer, 'Issuer')}</td>
                          </tr>
                        )}
                        {/* Vehicle */}
                        {termSheet.vehicle && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Vehicle</td>
                            <td className="px-4 py-3">{withIdentifier(termSheet.vehicle, vehicleIdentifier)}</td>
                          </tr>
                        )}
                        {/* Exclusive Arranger */}
                        <tr>
                          <td className="px-4 py-3 bg-muted/50 font-semibold">Exclusive Arranger</td>
                          <td className="px-4 py-3">{withIdentifier(termSheet.exclusive_arranger || 'VERSO Management Limited, regulated by BVI FSC', 'Arranger')}</td>
                        </tr>
                        {/* Purchaser */}
                        <tr>
                          <td className="px-4 py-3 bg-muted/50 font-semibold">Purchaser</td>
                          <td className="px-4 py-3">{withIdentifier(termSheet.purchaser || 'Qualified Limited Partners and Institutional Clients', 'Purchaser')}</td>
                        </tr>
                        {/* Seller */}
                        {termSheet.seller && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Seller</td>
                            <td className="px-4 py-3">{withIdentifier(termSheet.seller, 'Seller')}</td>
                          </tr>
                        )}
                        {/* Structure */}
                        {termSheet.structure && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Structure</td>
                            <td className="px-4 py-3">{termSheet.structure}</td>
                          </tr>
                        )}
                        {/* Allocation */}
                        {termSheet.allocation_up_to && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Allocation</td>
                            <td className="px-4 py-3">Up to {opportunity.currency} {termSheet.allocation_up_to.toLocaleString()} only</td>
                          </tr>
                        )}
                        {/* Price per Share */}
                        {(termSheet.price_per_share != null || termSheet.price_per_share_text) && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Price per Share</td>
                            <td className="px-4 py-3">
                              {termSheet.price_per_share != null
                                ? `${opportunity.currency} ${termSheet.price_per_share.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : termSheet.price_per_share_text}
                            </td>
                          </tr>
                        )}
                        {/* Minimum Ticket */}
                        {termSheet.minimum_ticket && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Minimum Ticket</td>
                            <td className="px-4 py-3">{opportunity.currency} {termSheet.minimum_ticket.toLocaleString()}</td>
                          </tr>
                        )}
                        {/* Subscription Fee */}
                        {termSheet.subscription_fee_percent !== null && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Subscription Fee</td>
                            <td className="px-4 py-3">{formatFeeDisplay(termSheet.subscription_fee_percent, 'subscription')}</td>
                          </tr>
                        )}
                        {/* Management Fee */}
                        {termSheet.management_fee_percent !== null && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Management Fee</td>
                            <td className="px-4 py-3">{formatFeeDisplay(termSheet.management_fee_percent, 'management')}</td>
                          </tr>
                        )}
                        {/* Carried Interest */}
                        {termSheet.carried_interest_percent !== null && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Carried Interest</td>
                            <td className="px-4 py-3">{formatFeeDisplay(termSheet.carried_interest_percent, 'carry')}</td>
                          </tr>
                        )}
                        {/* Legal Counsel */}
                        {termSheet.legal_counsel && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Legal Counsel</td>
                            <td className="px-4 py-3">{withIdentifier(termSheet.legal_counsel, 'Lead Counsel')}</td>
                          </tr>
                        )}
                        {/* Interest Confirmation */}
                        {termSheet.interest_confirmation_deadline && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Interest Confirmation</td>
                            <td className="px-4 py-3">By {formatDateTime(termSheet.interest_confirmation_deadline)} {termSheet.interest_confirmation_text || 'COB for firm commitments only'}</td>
                          </tr>
                        )}
                        {/* Capital Call */}
                        <tr>
                          <td className="px-4 py-3 bg-muted/50 font-semibold">Capital Call</td>
                          <td className="px-4 py-3">{termSheet.capital_call_timeline || 'No later than 3 days prior to confirmed Completion Date by Company with effective funds on Escrow Account (T-3)'}</td>
                        </tr>
                        {/* Completion Date */}
                        {(termSheet.completion_date || termSheet.completion_date_text) && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Completion Date</td>
                            <td className="px-4 py-3">{termSheet.completion_date ? formatDate(termSheet.completion_date) : termSheet.completion_date_text}</td>
                          </tr>
                        )}
                        {/* In-Principle Approval */}
                        <tr>
                          <td className="px-4 py-3 bg-muted/50 font-semibold">In-Principle Approval</td>
                          <td className="px-4 py-3">{termSheet.in_principle_approval_text || 'The Arranger has obtained approval for the present offering from the Issuer'}</td>
                        </tr>
                        {/* Subscription Pack */}
                        <tr>
                          <td className="px-4 py-3 bg-muted/50 font-semibold">Subscription Pack</td>
                          <td className="px-4 py-3">{termSheet.subscription_pack_note || 'The Issuer shall issue a Subscription Pack to be executed by the Purchaser'}</td>
                        </tr>
                        {/* Share Certificates */}
                        <tr>
                          <td className="px-4 py-3 bg-muted/50 font-semibold">Share Certificates</td>
                          <td className="px-4 py-3">{termSheet.share_certificates_note || 'The Issuer shall provide the Purchasers Share Certificates and Statement of Holdings upon Completion'}</td>
                        </tr>
                        {/* Subject to Change */}
                        <tr>
                          <td className="px-4 py-3 bg-muted/50 font-semibold">Subject to Change</td>
                          <td className="px-4 py-3">{termSheet.subject_to_change_note || 'The content of the present term sheet remains indicative, subject to change'}</td>
                        </tr>
                        {/* Validity Date */}
                        {termSheet.validity_date && (
                          <tr>
                            <td className="px-4 py-3 bg-muted/50 font-semibold">Validity Date</td>
                            <td className="px-4 py-3">This indicative term sheet expires on {formatDate(termSheet.validity_date)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Signatories */}
          {opportunity.signatories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Authorized Signatories
                </CardTitle>
                <CardDescription>
                  These signatories will need to sign the NDA and subscription documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {opportunity.signatories.map((signatory) => (
                    <div key={signatory.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{signatory.full_name}</div>
                        <div className="text-sm text-muted-foreground">{signatory.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Room Tab */}
        {/* PERSONA ACCESS RULE: Hide Data Room content for introducers and lawyers */}
        {(opportunity.access_controls?.can_view_data_room !== false) && (
          <TabsContent value="data-room" className="space-y-4">
            {/* Access details banner when has access */}
            {opportunity.data_room.has_access && opportunity.data_room.access_details && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Access granted: {formatDate(opportunity.data_room.access_details.granted_at)}
                      {opportunity.access_controls?.has_auto_data_room_access && (
                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Auto-granted (Arranger)
                        </span>
                      )}
                    </div>
                    {opportunity.data_room.access_details.expires_at && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <Clock className="w-4 h-4" />
                        Expires: {formatDate(opportunity.data_room.access_details.expires_at)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Room Viewer with folder grouping and featured docs */}
            <DataRoomViewer
              documents={opportunity.data_room.documents as DataRoomDocument[]}
              hasAccess={opportunity.data_room.has_access}
              requiresNda={opportunity.data_room.requires_nda}
              dealId={opportunity.id}
              onRequestAccess={opportunity.can_sign_nda ? handleSignNda : undefined}
            />
          </TabsContent>
        )}

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          {opportunity.faqs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No FAQs Available</h3>
                <p className="text-muted-foreground">
                  Frequently asked questions will be added by the deal team.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {opportunity.faqs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`faq-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Submit Interest for Data Room Dialog */}
      <Dialog open={showInterestDialog} onOpenChange={setShowInterestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <FolderOpen className="h-5 w-5 text-amber-600" />
              </div>
              <DialogTitle className="text-lg">Request Data Room Access</DialogTitle>
            </div>
            <DialogDescription className="text-left">
              Submit your interest to access the data room for {opportunity.name}.
            </DialogDescription>
          </DialogHeader>

          {/* Process Steps */}
          <div className="py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium">1</div>
                <div>
                  <div className="font-medium">Request Access</div>
                  <div className="text-muted-foreground">Team reviews your request</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium">2</div>
                <div>
                  <div className="font-medium">Sign NDA</div>
                  <div className="text-muted-foreground">All signatories sign the NDA</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium">3</div>
                <div>
                  <div className="font-medium">Access Data Room</div>
                  <div className="text-muted-foreground">7-day access to all documents</div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowInterestDialog(false)}>
              Cancel
            </Button>
              <Button onClick={handleExpressInterest} disabled={actionLoading} className="gap-2">
                {actionLoading ? 'Processing...' : (
                  <>
                    <FolderOpen className="w-4 h-4" />
                    Request Access
                  </>
                )}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NDA Info Dialog - NDA is sent automatically after CEO approval */}
      <Dialog open={showNdaDialog} onOpenChange={setShowNdaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>NDA Signing Process</DialogTitle>
            <DialogDescription>
              The NDA will be sent to you automatically once your interest is approved.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">Automatic NDA Generation</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Once your interest is approved by the VERSO team, each authorized signatory
                    ({opportunity.signatories.length}) will receive their own NDA document to sign.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Multi-Signatory Required</p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    Data room access will be granted only after <strong>all signatories</strong> have
                    completed signing their individual NDAs.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={openNdaRequestDialog}>
              Request NDA changes
            </Button>
            <Button onClick={() => setShowNdaDialog(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ndaRequestOpen} onOpenChange={setNdaRequestOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request NDA Modifications</DialogTitle>
            <DialogDescription>
              Share the exact sections or terms you want reviewed. The compliance team will follow up.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={ndaRequestSubject}
                onChange={(event) => setNdaRequestSubject(event.target.value)}
                placeholder="NDA modification request"
              />
            </div>
            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea
                value={ndaRequestDetails}
                onChange={(event) => setNdaRequestDetails(event.target.value)}
                placeholder="Add clause numbers, requested changes, or questions..."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNdaRequestOpen(false)}
              disabled={ndaRequestSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleNdaRequestSubmit} disabled={ndaRequestSubmitting}>
              {ndaRequestSubmitting ? 'Sending...' : 'Send request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscribe to Investment Opportunity Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 border-0 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.7)]" showCloseButton={false}>
          {/* Gold accent bar */}
          <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, hsl(43 74% 66%) 0%, hsl(43 74% 56%) 50%, hsl(43 74% 66%) 100%)' }} />

          {/* Header */}
          <div className="relative px-8 pt-8 pb-6 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.06] dark:opacity-[0.10]" style={{ background: 'radial-gradient(circle, hsl(43 74% 66%), transparent 65%)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="relative flex items-start gap-4">
              <DealLogo
                src={opportunity.company_logo_url}
                alt={opportunity.company_name || opportunity.name}
                size={48}
                rounded="lg"
              />
              <div className="min-w-0 flex-1">
                <DialogHeader className="pb-0 space-y-0">
                  <DialogTitle className="text-lg font-semibold tracking-tight leading-tight">
                    Subscribe to Investment Opportunity
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-[13px] text-muted-foreground/80 leading-relaxed mt-1.5">
                  Enter your commitment amount to submit a subscription request for {opportunity.name}. Once reviewed, you&apos;ll receive the subscription documents to sign.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Amount Section */}
          <div className="mx-5 rounded-xl border border-border/80 bg-muted/40 dark:bg-black/20 overflow-hidden">
            <div className="px-5 pt-4 pb-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  Commitment Amount ({opportunity.currency})
                </span>
                {subscribeMinAmount && subscribeMaxAmount && (
                  <span className="text-[10px] tabular-nums text-muted-foreground/40 font-medium">
                    Range: {formatCurrency(subscribeMinAmount, opportunity.currency)} &ndash; {formatCurrency(subscribeMaxAmount, opportunity.currency)}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-bold text-muted-foreground/50 select-none shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {opportunity.currency}
                </span>
                <input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  className="w-full bg-transparent border-0 outline-none text-3xl font-bold tracking-tight placeholder:text-muted-foreground/20 text-foreground"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                  placeholder="0"
                  value={subscribeAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, '')
                    setSubscribeAmount(formatAmountDisplay(raw))
                  }}
                />
              </div>
            </div>
            <div className="px-5 py-2.5 border-t border-border/50 bg-muted/30 dark:bg-black/10 flex items-center justify-between min-h-[36px]">
              {subscribeAmount && parseDisplayAmount(subscribeAmount) > 0 ? (
                <>
                  <span className="text-xs tabular-nums text-muted-foreground font-medium">
                    {formatCurrency(parseDisplayAmount(subscribeAmount), opportunity.currency)}
                  </span>
                  {subscribeMinAmount !== null && parseDisplayAmount(subscribeAmount) < subscribeMinAmount && (
                    <span className="text-[11px] font-medium text-amber-500 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Below minimum ({formatCurrency(subscribeMinAmount, opportunity.currency)})
                    </span>
                  )}
                  {subscribeMaxAmount !== null && parseDisplayAmount(subscribeAmount) > subscribeMaxAmount && (
                    <span className="text-[11px] font-medium text-amber-500 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Exceeds allocation ({formatCurrency(subscribeMaxAmount, opportunity.currency)})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-muted-foreground/30">Enter your commitment amount</span>
              )}
            </div>
          </div>

          <div className="px-5 pt-5 space-y-5">
            {/* Signatories notice */}
            {opportunity.signatories.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileSignature className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      {opportunity.signatories.length} Signatory(ies) Required
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Both NDA and Subscription Pack will be sent to all authorized signatories.
                    </p>
                    <p className="text-amber-600 dark:text-amber-400 mt-2 text-xs">
                      Note: This request does not include data room access.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* KYC Toggle Card */}
            <button
              type="button"
              onClick={() => setSubscribeBankConfirm(!subscribeBankConfirm)}
              className={cn(
                'w-full rounded-xl p-4 text-left transition-all duration-300 cursor-pointer border-2',
                subscribeBankConfirm
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'border-border/60 bg-card hover:bg-muted/40 hover:border-border'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300',
                  subscribeBankConfirm
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-muted border-2 border-border'
                )}>
                  {subscribeBankConfirm && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="drop-shadow-sm">
                      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={cn(
                  'text-sm font-normal cursor-pointer leading-relaxed flex-1',
                  subscribeBankConfirm ? 'text-emerald-900 dark:text-emerald-100' : 'text-foreground'
                )}>
                  I confirm my bank/KYC documentation is ready for the subscription pack.
                </span>
                <ShieldCheck className={cn(
                  'h-5 w-5 shrink-0 transition-all duration-300',
                  subscribeBankConfirm
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : 'text-muted-foreground/20'
                )} />
              </div>
            </button>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="subscribe-notes">Notes for the team (optional)</Label>
              <Textarea
                id="subscribe-notes"
                value={subscribeNotes}
                onChange={(e) => setSubscribeNotes(e.target.value)}
                rows={3}
                className="resize-none bg-muted/30 dark:bg-black/10 border-border/60"
                placeholder="Share wiring preferences, co-investor details, or other information."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 mt-5 border-t border-border/60 bg-muted/30 dark:bg-black/15 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowSubscribeDialog(false)}
              className="text-muted-foreground hover:text-foreground h-11 px-5 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={actionLoading || !subscribeAmount || parseDisplayAmount(subscribeAmount) <= 0}
              className={cn(
                'h-11 px-8 rounded-lg text-sm font-semibold gap-2 transition-all duration-200',
                'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white',
                'shadow-[0_4px_14px_0_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_0_rgba(16,185,129,0.35)]',
                'disabled:opacity-50 disabled:shadow-none'
              )}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Interest
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Term Sheet / Featured Doc Preview - Fullscreen Viewer */}
      <DocumentViewerFullscreen
        isOpen={previewOpen}
        document={previewDocument}
        previewUrl={previewUrl}
        isLoading={previewLoading}
        error={previewError}
        onClose={() => {
          setPreviewOpen(false)
          if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
          }
          setPreviewUrl(null)
          setPreviewError(null)
          setPreviewDocument(null)
          setPreviewWatermark(null)
        }}
        onDownload={() => {
          if (previewUrl) {
            window.open(previewUrl, '_blank')
          }
        }}
        watermark={previewWatermark}
        hideDownload
      />
    </div>
  )
}
