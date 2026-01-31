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
  Loader2
} from 'lucide-react'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import type { DocumentReference } from '@/types/document-viewer.types'
import { usePersona } from '@/contexts/persona-context'
import { useProxyMode } from '@/components/commercial-partner'

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
  price_per_share_text: string | null
  minimum_ticket: number | null
  // Fee Structure
  subscription_fee_percent: number | null
  management_fee_percent: number | null
  carried_interest_percent: number | null
  management_fee_clause: string | null
  performance_fee_clause: string | null
  // Timeline
  term_sheet_date: string | null
  interest_confirmation_deadline: string | null
  validity_date: string | null
  completion_date: string | null
  completion_date_text: string | null
  // Legal
  legal_counsel: string | null
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
  } | null
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
    year: 'numeric'
  })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
  const [actionLoading, setActionLoading] = useState(false)
  const isPartnerPersona = activePersona?.persona_type === 'partner'

  // Term sheet preview state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewDocument, setPreviewDocument] = useState<DocumentReference | null>(null)
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
            commitment: parseFloat(subscribeAmount),
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
              amount: parseFloat(subscribeAmount),
              currency: opportunity.currency,
              bank_confirmation: false
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

      alert('Subscription submitted for review. The VERSO team will follow up shortly.')
    } catch (err: any) {
      console.error('Error subscribing:', err)
      alert(err.message || 'Failed to submit subscription')
    } finally {
      setActionLoading(false)
    }
  }


  // Show loading while persona context is initializing
  if (personaLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!hasAnyPersona) {
    return (
      <div className="p-6">
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
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !opportunity) {
    return (
      <div className="p-6">
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
  const canSubscribe = opportunity.can_subscribe && !isTrackingOnly
  const canExpressInterest = opportunity.can_express_interest && !isTrackingOnly
  const canSignNda = opportunity.can_sign_nda && !isTrackingOnly
  const showActionChoices =
    opportunity.status !== 'closed' &&
    !opportunity.subscription &&
    (canSubscribe || canExpressInterest)

  return (
    <div className="p-6 space-y-6">
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
              summary={opportunity.journey.summary}
              currentStage={opportunity.journey.current_stage}
              subscriptionSubmittedAt={opportunity.subscription_submission?.submitted_at ?? null}
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
                        <div className="text-xs opacity-90 font-normal">Submit for review • Subscription pack only (no NDA)</div>
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
            <Button variant="outline" onClick={() => setShowNdaDialog(true)}>
              <FileSignature className="w-4 h-4 mr-2" />
              About NDA Signing
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
                journeySummary={opportunity.journey.summary}
                subscriptionSubmittedAt={opportunity.subscription_submission?.submitted_at ?? null}
                canExpressInterest={canExpressInterest}
                canSignNda={canSignNda}
                canSubscribe={canSubscribe}
                isTrackingOnly={isTrackingOnly}
                onExpressInterest={() => setShowInterestDialog(true)}
                onSignNda={() => setShowNdaDialog(true)}
                onSubscribe={() => setShowSubscribeDialog(true)}
              />
            )}
            <div className="lg:col-span-2">
              <DealKeyDetailsCard
                dealType={opportunity.deal_type || 'N/A'}
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Investment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Target Raise</Label>
                    <p className="font-medium">{formatCurrency(opportunity.target_amount, opportunity.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Raised</Label>
                    <p className="font-medium">{formatCurrency(opportunity.raised_amount, opportunity.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Min Investment</Label>
                    <p className="font-medium">{formatCurrency(opportunity.minimum_investment, opportunity.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Max Investment</Label>
                    <p className="font-medium">{formatCurrency(opportunity.maximum_investment, opportunity.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Closing Date</Label>
                    <p className="font-medium">{formatDate(opportunity.close_at)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Deal Type</Label>
                    <p className="font-medium">{opportunity.deal_type || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {opportunity.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-1">{opportunity.description}</p>
                  </div>
                )}
                {opportunity.investment_thesis && (
                  <div>
                    <Label className="text-muted-foreground">Investment Thesis</Label>
                    <p className="mt-1">{opportunity.investment_thesis}</p>
                  </div>
                )}
                {opportunity.company_website && (
                  <div>
                    <Label className="text-muted-foreground">Website</Label>
                    <a
                      href={opportunity.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline mt-1"
                    >
                      <Globe className="w-4 h-4" />
                      {opportunity.company_website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

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
              setPreviewUrl(null)
              setPreviewError(null)
              setPreviewDocument(null)
            }

            const handleDownloadFromPreview = () => {
              if (previewUrl) {
                window.open(previewUrl, '_blank')
              }
            }

            // Check if any transaction details exist
            const hasTransactionDetails = termSheet.transaction_type || termSheet.structure || termSheet.issuer ||
              termSheet.vehicle || termSheet.exclusive_arranger || termSheet.purchaser || termSheet.seller || termSheet.legal_counsel

            // Check if any timeline info exists
            const hasTimeline = termSheet.interest_confirmation_deadline || termSheet.validity_date ||
              termSheet.completion_date || termSheet.completion_date_text

            // Check if any fees exist
            const hasFees = termSheet.subscription_fee_percent !== null ||
              termSheet.management_fee_percent !== null || termSheet.carried_interest_percent !== null

            return (
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">Term Sheet</CardTitle>
                      {(termSheet.term_sheet_date || termSheet.version) && (
                        <CardDescription className="text-sm">
                          {termSheet.term_sheet_date && formatDate(termSheet.term_sheet_date)}
                          {termSheet.term_sheet_date && termSheet.version && ' • '}
                          {termSheet.version && `Version ${termSheet.version}`}
                        </CardDescription>
                      )}
                    </div>
                    {termSheet.term_sheet_attachment_key && (
                      <Button onClick={handlePreviewTermSheet} size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview PDF
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Price Per Share - Hero display when available */}
                  {termSheet.price_per_share_text && (
                    <div className="text-center py-6 px-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Price Per Share</div>
                      <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{termSheet.price_per_share_text}</div>
                    </div>
                  )}

                  {/* Opportunity Summary */}
                  {(termSheet.term_sheet_html || termSheet.opportunity_summary) && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">Opportunity Summary</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {termSheet.term_sheet_html ? (
                          <div dangerouslySetInnerHTML={{ __html: termSheet.term_sheet_html }} />
                        ) : (
                          <p className="whitespace-pre-wrap text-foreground/80">{termSheet.opportunity_summary}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Terms Grid */}
                  {(termSheet.allocation_up_to || termSheet.minimum_ticket) && (
                    <div className="grid grid-cols-2 gap-4">
                      {termSheet.allocation_up_to && (
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <div className="text-xs text-muted-foreground mb-1">Allocation ({opportunity.currency})</div>
                          <div className="text-lg font-semibold">{formatCurrency(termSheet.allocation_up_to, opportunity.currency)}</div>
                        </div>
                      )}
                      {termSheet.minimum_ticket && (
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <div className="text-xs text-muted-foreground mb-1">Min. Ticket</div>
                          <div className="text-lg font-semibold">{formatCurrency(termSheet.minimum_ticket, opportunity.currency)}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fee Structure */}
                  {hasFees && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">Fee Structure</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {termSheet.subscription_fee_percent !== null && (
                          <div className="p-4 rounded-lg border bg-card">
                            <div className="text-xs text-muted-foreground">Subscription Fee</div>
                            <div className="text-2xl font-bold mt-1">{termSheet.subscription_fee_percent}%</div>
                          </div>
                        )}
                        {termSheet.management_fee_percent !== null && (
                          <div className="p-4 rounded-lg border bg-card">
                            <div className="text-xs text-muted-foreground">Management Fee</div>
                            <div className="text-2xl font-bold mt-1">{termSheet.management_fee_percent}%</div>
                            <div className="text-xs text-muted-foreground">per annum</div>
                            {termSheet.management_fee_clause && (
                              <p className="text-xs text-muted-foreground mt-2 border-t pt-2">{termSheet.management_fee_clause}</p>
                            )}
                          </div>
                        )}
                        {termSheet.carried_interest_percent !== null && (
                          <div className="p-4 rounded-lg border bg-card">
                            <div className="text-xs text-muted-foreground">Carried Interest</div>
                            <div className="text-2xl font-bold mt-1">{termSheet.carried_interest_percent}%</div>
                            {termSheet.performance_fee_clause && (
                              <p className="text-xs text-muted-foreground mt-2 border-t pt-2">{termSheet.performance_fee_clause}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Transaction Details */}
                  {hasTransactionDetails && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">Transaction Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                        {termSheet.transaction_type && (
                          <div>
                            <div className="text-xs text-muted-foreground">Type</div>
                            <div className="font-medium">{termSheet.transaction_type}</div>
                          </div>
                        )}
                        {termSheet.structure && (
                          <div>
                            <div className="text-xs text-muted-foreground">Structure</div>
                            <div className="font-medium">{termSheet.structure}</div>
                          </div>
                        )}
                        {termSheet.issuer && (
                          <div>
                            <div className="text-xs text-muted-foreground">Issuer</div>
                            <div className="font-medium">{termSheet.issuer}</div>
                          </div>
                        )}
                        {termSheet.vehicle && (
                          <div>
                            <div className="text-xs text-muted-foreground">Vehicle</div>
                            <div className="font-medium">{termSheet.vehicle}</div>
                          </div>
                        )}
                        {termSheet.exclusive_arranger && (
                          <div>
                            <div className="text-xs text-muted-foreground">Arranger</div>
                            <div className="font-medium">{termSheet.exclusive_arranger}</div>
                          </div>
                        )}
                        {termSheet.purchaser && (
                          <div>
                            <div className="text-xs text-muted-foreground">Purchaser</div>
                            <div className="font-medium">{termSheet.purchaser}</div>
                          </div>
                        )}
                        {termSheet.seller && (
                          <div>
                            <div className="text-xs text-muted-foreground">Seller</div>
                            <div className="font-medium">{termSheet.seller}</div>
                          </div>
                        )}
                        {termSheet.legal_counsel && (
                          <div>
                            <div className="text-xs text-muted-foreground">Legal Counsel</div>
                            <div className="font-medium">{termSheet.legal_counsel}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {hasTimeline && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">Timeline</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {termSheet.interest_confirmation_deadline && (
                          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Interest Deadline</div>
                            <div className="font-semibold text-amber-700 dark:text-amber-300 mt-1">{formatDate(termSheet.interest_confirmation_deadline)}</div>
                          </div>
                        )}
                        {termSheet.validity_date && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-xs text-muted-foreground">Valid Until</div>
                            <div className="font-medium mt-1">{formatDate(termSheet.validity_date)}</div>
                          </div>
                        )}
                        {(termSheet.completion_date || termSheet.completion_date_text) && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-xs text-muted-foreground">Completion</div>
                            <div className="font-medium mt-1">
                              {termSheet.completion_date
                                ? formatDate(termSheet.completion_date)
                                : termSheet.completion_date_text}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
              onRequestAccess={opportunity.can_sign_nda ? () => setShowNdaDialog(true) : undefined}
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
            <Button onClick={() => setShowNdaDialog(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscribe to Investment Opportunity Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to Investment Opportunity</DialogTitle>
            <DialogDescription>
              Enter your commitment amount to submit a subscription request for {opportunity.name}. Once reviewed,
              you&apos;ll receive the subscription documents to sign.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Commitment Amount ({opportunity.currency})</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Min: ${formatCurrency(opportunity.minimum_investment, opportunity.currency)}`}
                value={subscribeAmount}
                onChange={(e) => setSubscribeAmount(e.target.value)}
              />
              {opportunity.minimum_investment && opportunity.maximum_investment && (
                <p className="text-sm text-muted-foreground">
                  Range: {formatCurrency(opportunity.minimum_investment, opportunity.currency)} - {formatCurrency(opportunity.maximum_investment, opportunity.currency)}
                </p>
              )}
            </div>

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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscribeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={actionLoading || !subscribeAmount || (opportunity.minimum_investment !== null && parseFloat(subscribeAmount) < opportunity.minimum_investment)}
            >
              {actionLoading ? 'Processing...' : 'Subscribe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Term Sheet Preview - Fullscreen Viewer */}
      <DocumentViewerFullscreen
        isOpen={previewOpen}
        document={previewDocument}
        previewUrl={previewUrl}
        isLoading={previewLoading}
        error={previewError}
        onClose={() => {
          setPreviewOpen(false)
          setPreviewUrl(null)
          setPreviewError(null)
          setPreviewDocument(null)
        }}
        onDownload={() => {
          if (previewUrl) {
            window.open(previewUrl, '_blank')
          }
        }}
      />
    </div>
  )
}
