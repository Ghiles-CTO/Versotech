'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Building2,
  CalendarClock,
  ExternalLink,
  ShieldCheck,
  LineChart,
  MailCheck,
  Users,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  FileSignature,
  Clock,
  CheckCircle2,
  DollarSign,
  Package,
  Share2,
  // Partner-specific icons
  UserPlus,
  TrendingUp,
  Wallet,
  BadgeCheck
} from 'lucide-react'
import { InterestModal } from '@/components/deals/interest-modal'
import { SubscribeNowDialog } from '@/components/deals/subscribe-now-dialog'
import { ShareDealDialog } from '@/components/deals/share-deal-dialog'

type Nullable<T> = T | null

// ============================================================================
// Persona Mode Detection
// ============================================================================

type PersonaMode = 'INVESTOR_ONLY' | 'PARTNER_ONLY' | 'DUAL_PERSONA' | 'GENERIC'

// ============================================================================
// Partner Referral Types (US-5.6.1-01 through 07)
// ============================================================================

interface PartnerReferral {
  deal_id: string
  investor_id: string
  investor_name: string
  dispatched_at: string | null
  interest_confirmed_at: string | null
}

interface ReferralSubscription {
  investor_id: string
  deal_id: string
  status: string
  commitment: number | null
  currency: string | null
  funded_at: string | null
  signed_at: string | null
}

interface PartnerCommission {
  deal_id: string
  investor_id: string
  rate_bps: number | null
  accrual_amount: number | null
  currency: string | null
  status: string
}

interface PartnerSummary {
  totalReferrals: number
  converted: number
  pipelineValue: number
  pendingCommissions: number
  currency: string
}

// Investor journey stage for referral tracking
type ReferralStage = 'dispatched' | 'interested' | 'passed' | 'approved' | 'signed' | 'funded'

const referralStageMeta: Record<ReferralStage, {
  label: string
  bgColor: string
  textColor: string
  borderColor: string
}> = {
  dispatched: {
    label: 'Dispatched',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200'
  },
  interested: {
    label: 'Interested',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  passed: {
    label: 'Passed',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200'
  },
  approved: {
    label: 'Approved',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200'
  },
  signed: {
    label: 'Signed',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  funded: {
    label: 'Funded',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  }
}

// ============================================================================
// Deal Types
// ============================================================================

interface InvestorDeal {
  id: string
  name: string
  deal_type: string
  status: string
  currency: string
  offer_unit_price: number | null
  open_at: string | null
  close_at: string | null
  created_at: string
  description?: string | null
  investment_thesis?: string | null
  minimum_investment?: number | null
  maximum_investment?: number | null
  target_amount?: number | null
  company_name?: string | null
  company_logo_url?: string | null
  company_website?: string | null
  sector?: string | null
  stage?: string | null
  location?: string | null
  vehicles?: {
    id: string
    name: string
    type: string
  }
  deal_memberships: Array<{
    role: string
    accepted_at: string | null
    dispatched_at: string | null
  }>
  fee_plans: Array<{
    id: string
    name: string
    description: string | null
    is_default: boolean
    fee_components: Array<{
      id: string
      kind: string
      calc_method: string
      rate_bps: number | null
      flat_amount: number | null
      frequency: string | null
      notes: string | null
    }>
  }>
}

interface FeeStructure {
  id: string
  deal_id: string
  created_at?: string
  effective_at?: string | null
  published_at?: string | null
  allocation_up_to: number | null
  price_per_share_text: string | null
  minimum_ticket: number | null
  maximum_ticket: number | null
  term_sheet_date: string | null
  transaction_type: string | null
  opportunity_summary: string | null
  issuer: string | null
  vehicle: string | null
  exclusive_arranger: string | null
  purchaser: string | null
  seller: string | null
  structure: string | null
  subscription_fee_percent: number | null
  management_fee_percent: number | null
  carried_interest_percent: number | null
  legal_counsel: string | null
  interest_confirmation_deadline: string | null
  capital_call_timeline: string | null
  completion_date_text: string | null
  in_principle_approval_text: string | null
  subscription_pack_note: string | null
  share_certificates_note: string | null
  subject_to_change_note: string | null
  validity_date: string | null
  term_sheet_attachment_key: string | null
}

interface DealInterest {
  id: string
  deal_id: string
  investor_id: string
  status: 'pending_review' | 'approved' | 'rejected' | 'withdrawn'
  submitted_at: string
  approved_at: string | null
  indicative_amount: number | null
  indicative_currency: string | null
  is_post_close: boolean
}

interface DataRoomAccess {
  id: string
  deal_id: string
  investor_id: string
  granted_at: string
  expires_at: string | null
  auto_granted: boolean
  revoked_at: string | null
}

interface SubscriptionSubmission {
  id: string
  deal_id: string
  investor_id: string
  status: string
  submitted_at: string
}

interface InvestorDealsListClientProps {
  dealsData: InvestorDeal[]
  feeStructureMap: Map<string, FeeStructure>
  interestByDeal: Map<string, DealInterest>
  accessByDeal: Map<string, DataRoomAccess>
  subscriptionByDeal: Map<string, SubscriptionSubmission>
  primaryInvestorId: string | null
  /** Partner ID - if present, user can share deals with investors (PRD Rows 95-96) */
  partnerId?: string | null
  /** Investor-centric summary metrics */
  summary: {
    totalDeals: number
    openDeals: number
    pendingInterests: number
    activeNdas: number
    submittedSubscriptions: number
  }
  /** Base URL for deal detail pages. Defaults to /versoholdings/deal */
  detailUrlBase?: string

  // ============================================================================
  // Partner-Specific Props (US-5.6.1-01 through 07)
  // ============================================================================

  /** Partner's referrals grouped by deal_id */
  referralsByDeal?: Record<string, PartnerReferral[]>
  /** Subscription statuses for referred investors, grouped by deal_id */
  referralSubscriptionsByDeal?: Record<string, ReferralSubscription[]>
  /** Partner's commissions grouped by deal_id */
  partnerCommissionsByDeal?: Record<string, PartnerCommission[]>
  /** Aggregated Partner metrics */
  partnerSummary?: PartnerSummary
}

const dealTypeLabels: Record<string, string> = {
  equity_secondary: 'Secondary Equity',
  equity_primary: 'Primary Equity',
  credit_trade_finance: 'Credit & Trade Finance',
  other: 'Other'
}

const statusBadges: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  open: 'bg-emerald-100 text-emerald-700',
  allocation_pending: 'bg-amber-100 text-amber-700',
  closed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-rose-100 text-rose-700'
}

const INVESTOR_ELIGIBLE_ROLES = new Set([
  'investor',
  'partner_investor',
  'introducer_investor',
  'commercial_partner_investor',
  'co_investor'
])

function isInvestorEligibleRole(role: string | null | undefined) {
  if (!role) return false
  return INVESTOR_ELIGIBLE_ROLES.has(role)
}

const interestStatusMeta: Record<
  DealInterest['status'],
  { label: string; tone: string }
> = {
  pending_review: { label: 'Pending review', tone: 'bg-amber-100 text-amber-700' },
  approved: { label: 'NDA active', tone: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Declined', tone: 'bg-rose-100 text-rose-700' },
  withdrawn: { label: 'Withdrawn', tone: 'bg-slate-100 text-slate-700' }
}

// Subscription stages 6-9 metadata (before Active/Stage 10)
// Maps actual database status values to journey stages
const subscriptionStageMeta: Record<string, {
  label: string
  stage: number
  icon: typeof Package
  bgColor: string
  textColor: string
  borderColor: string
}> = {
  // Actual database statuses from deal_subscription_submissions table
  pending_review: {
    label: 'Pending Review',
    stage: 6,
    icon: Clock,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  // Keep 'pending' as alias for backwards compatibility
  pending: {
    label: 'Pending Review',
    stage: 6,
    icon: Clock,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  approved: {
    label: 'Approved',
    stage: 7,
    icon: MailCheck,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200'
  },
  committed: {
    label: 'Committed',
    stage: 8,
    icon: FileSignature,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  partially_funded: {
    label: 'Partially Funded',
    stage: 9,
    icon: DollarSign,
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200'
  },
  funded: {
    label: 'Funded',
    stage: 9,
    icon: DollarSign,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  },
  // Legacy/alternative status names (for compatibility)
  pack_generated: {
    label: 'Pack Generated',
    stage: 6,
    icon: Package,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  pack_sent: {
    label: 'Pack Sent',
    stage: 7,
    icon: MailCheck,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200'
  },
  signed: {
    label: 'Signed',
    stage: 8,
    icon: FileSignature,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  submitted: {
    label: 'Submitted',
    stage: 6,
    icon: Clock,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  in_review: {
    label: 'In Review',
    stage: 6,
    icon: Clock,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  // DB enum statuses: rejected, cancelled
  rejected: {
    label: 'Rejected',
    stage: 0,
    icon: AlertCircle,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200'
  },
  cancelled: {
    label: 'Cancelled',
    stage: 0,
    icon: AlertCircle,
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200'
  }
}

function normalizeCurrency(code: Nullable<string>) {
  if (!code) return 'USD'
  return code.length === 3 ? code.toUpperCase() : code.toUpperCase().slice(0, 3)
}

function formatCurrency(amount: Nullable<number>, currency: Nullable<string>) {
  if (amount === null || amount === undefined) {
    return '—'
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizeCurrency(currency),
      maximumFractionDigits: amount >= 1000 ? 0 : 2
    }).format(amount)
  } catch {
    return `${currency ?? ''} ${amount.toLocaleString()}`
  }
}

function getEffectiveStatus(deal: InvestorDeal): string {
  if (deal.status === 'closed' || deal.status === 'cancelled') {
    return deal.status
  }

  // Auto-close deals that are past their close date
  if (deal.close_at && new Date(deal.close_at) < new Date()) {
    return 'closed'
  }

  return deal.status
}

function formatDeadlineCopy(
  closeAt: Nullable<string>,
  effectiveStatus: string
) {
  if (!closeAt) {
    return effectiveStatus === 'closed' ? 'Closed' : 'Timing to be announced'
  }

  const closeDate = new Date(closeAt)
  const now = new Date()

  if (effectiveStatus === 'closed' || closeDate < now) {
    return `Closed ${closeDate.toLocaleDateString()}`
  }

  const diffMs = closeDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return 'Closing soon'
  }

  if (diffDays === 1) {
    return 'Closes tomorrow'
  }

  if (diffDays <= 14) {
    return `Closes in ${diffDays} days`
  }

  return `Closes ${closeDate.toLocaleDateString()}`
}

export function InvestorDealsListClient({
  dealsData,
  feeStructureMap,
  interestByDeal,
  accessByDeal,
  subscriptionByDeal,
  primaryInvestorId,
  partnerId,
  summary,
  detailUrlBase = '/versotech_main/opportunities',
  // Partner-specific props
  referralsByDeal = {},
  referralSubscriptionsByDeal = {},
  partnerCommissionsByDeal = {},
  partnerSummary
}: InvestorDealsListClientProps) {
  const [mounted, setMounted] = useState(false)

  // ============================================================================
  // Persona Mode Detection
  // Determines which view(s) to show based on user's personas
  // ============================================================================

  const personaMode: PersonaMode = useMemo(() => {
    if (partnerId && primaryInvestorId) return 'DUAL_PERSONA'
    if (partnerId) return 'PARTNER_ONLY'
    if (primaryInvestorId) return 'INVESTOR_ONLY'
    return 'GENERIC'
  }, [partnerId, primaryInvestorId])

  const isPartnerView = personaMode === 'PARTNER_ONLY' || personaMode === 'DUAL_PERSONA'
  const isInvestorView = personaMode === 'INVESTOR_ONLY' || personaMode === 'DUAL_PERSONA'

  // Helper function to determine referral stage for an investor
  const getReferralStage = (
    referral: PartnerReferral,
    subscriptions: ReferralSubscription[]
  ): ReferralStage => {
    const sub = subscriptions.find(s => s.investor_id === referral.investor_id)

    if (sub) {
      const status = sub.status?.toLowerCase()
      // Check for funded/active
      if (['funded', 'active', 'activated', 'committed'].includes(status)) {
        return 'funded'
      }
      // Check for signed
      if (status === 'signed' || sub.signed_at) {
        return 'signed'
      }
      // Check for approved
      if (status === 'approved') {
        return 'approved'
      }
      // Check for passed/rejected/cancelled
      if (['rejected', 'cancelled', 'passed', 'declined'].includes(status)) {
        return 'passed'
      }
    }

    // Check for interest confirmed
    if (referral.interest_confirmed_at) {
      return 'interested'
    }

    // Default: dispatched only
    return 'dispatched'
  }
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dealTypeFilter, setDealTypeFilter] = useState('all')
  const [interestStatusFilter, setInterestStatusFilter] = useState('all')
  const [pipelineStageFilter, setPipelineStageFilter] = useState('all')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [sortBy, setSortBy] = useState('closing_date')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Wait for client-side hydration to complete before rendering Radix UI components
  useEffect(() => {
    setMounted(true)
  }, [])

  // Extract unique values for filter dropdowns
  // NOTE: All useMemo hooks MUST be called before any early returns to comply with Rules of Hooks
  const uniqueSectors = useMemo(() => {
    const sectors = new Set<string>()
    dealsData.forEach(deal => {
      if (deal.sector) sectors.add(deal.sector)
    })
    return Array.from(sectors).sort()
  }, [dealsData])

  const uniqueStages = useMemo(() => {
    const stages = new Set<string>()
    dealsData.forEach(deal => {
      if (deal.stage) stages.add(deal.stage)
    })
    return Array.from(stages).sort()
  }, [dealsData])

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>()
    dealsData.forEach(deal => {
      if (deal.location) locations.add(deal.location)
    })
    return Array.from(locations).sort()
  }, [dealsData])

  // Compute subscriptions in progress (Stages 6-9)
  // These are subscriptions that are not yet activated (Stage 10)
  const subscriptionsInProgress = useMemo(() => {
    const inProgress: Array<{
      deal: InvestorDeal
      subscription: SubscriptionSubmission
      stageMeta: typeof subscriptionStageMeta[string]
    }> = []

    // Stage 10 (activated) subscriptions go to Portfolio, not here
    const activeStatuses = ['activated', 'active', 'completed']

    dealsData.forEach(deal => {
      const subscription = subscriptionByDeal.get(deal.id)
      if (subscription && !activeStatuses.includes(subscription.status.toLowerCase())) {
        const stageMeta = subscriptionStageMeta[subscription.status.toLowerCase()] ||
          subscriptionStageMeta.pending
        inProgress.push({ deal, subscription, stageMeta })
      }
    })

    // Sort by submission date (most recent first)
    inProgress.sort((a, b) => {
      return new Date(b.subscription.submitted_at).getTime() -
        new Date(a.subscription.submitted_at).getTime()
    })

    return inProgress
  }, [dealsData, subscriptionByDeal])

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let filtered = [...dealsData]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (deal) =>
          deal.name?.toLowerCase().includes(query) ||
          deal.company_name?.toLowerCase().includes(query) ||
          deal.sector?.toLowerCase().includes(query) ||
          deal.location?.toLowerCase().includes(query) ||
          deal.description?.toLowerCase().includes(query)
      )
    }

    // Deal status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((deal) => {
        const effectiveStatus = getEffectiveStatus(deal)
        return effectiveStatus === statusFilter
      })
    }

    // Deal type filter
    if (dealTypeFilter !== 'all') {
      filtered = filtered.filter((deal) => deal.deal_type === dealTypeFilter)
    }

    // Interest status filter
    if (interestStatusFilter !== 'all') {
      filtered = filtered.filter((deal) => {
        const interest = interestByDeal.get(deal.id)
        if (interestStatusFilter === 'no_interest') {
          return !interest
        }
        return interest?.status === interestStatusFilter
      })
    }

    // Pipeline stage filter
    if (pipelineStageFilter !== 'all') {
      filtered = filtered.filter((deal) => {
        const interest = interestByDeal.get(deal.id)
        const ndaAccess = accessByDeal.get(deal.id)
        const subscription = subscriptionByDeal.get(deal.id)

        switch (pipelineStageFilter) {
          case 'interested':
            return Boolean(interest)
          case 'nda_access':
            return Boolean(ndaAccess)
          case 'subscription_submitted':
            return Boolean(subscription)
          default:
            return true
        }
      })
    }

    // Sector filter
    if (sectorFilter !== 'all') {
      filtered = filtered.filter((deal) => deal.sector === sectorFilter)
    }

    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter((deal) => deal.stage === stageFilter)
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter((deal) => deal.location === locationFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'closing_date':
          if (!a.close_at) return 1
          if (!b.close_at) return -1
          return new Date(a.close_at).getTime() - new Date(b.close_at).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'opening_date':
          if (!a.open_at) return 1
          if (!b.open_at) return -1
          return new Date(b.open_at).getTime() - new Date(a.open_at).getTime()
        case 'target_amount':
          return (b.target_amount || 0) - (a.target_amount || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [
    dealsData,
    searchQuery,
    statusFilter,
    dealTypeFilter,
    interestStatusFilter,
    pipelineStageFilter,
    sectorFilter,
    stageFilter,
    locationFilter,
    sortBy,
    interestByDeal,
    accessByDeal,
    subscriptionByDeal
  ])

  // Count active filters
  const activeFiltersCount = [
    searchQuery,
    statusFilter !== 'all',
    dealTypeFilter !== 'all',
    interestStatusFilter !== 'all',
    pipelineStageFilter !== 'all',
    sectorFilter !== 'all',
    stageFilter !== 'all',
    locationFilter !== 'all'
  ].filter(Boolean).length

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setDealTypeFilter('all')
    setInterestStatusFilter('all')
    setPipelineStageFilter('all')
    setSectorFilter('all')
    setStageFilter('all')
    setLocationFilter('all')
  }

  // Render loading state until hydration is complete to prevent Radix UI ID mismatches
  // This must come AFTER all hooks (useState, useEffect, useMemo) to comply with Rules of Hooks
  if (!mounted) {
    return (
      <div className="p-6 space-y-8">
        <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Investment Opportunities</h1>
          <p className="text-gray-600">
            Track active allocations, NDAs, and subscriptions throughout the deal pipeline.
          </p>
        </div>

        {/* ================================================================ */}
        {/* PARTNER Summary Cards (US-5.6.1-07: Display Partner metrics) */}
        {/* ================================================================ */}
        {isPartnerView && partnerSummary && (
          <>
            {personaMode === 'DUAL_PERSONA' && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Share2 className="h-3 w-3 mr-1" />
                  Partner View
                </Badge>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Referrals</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                    <UserPlus className="h-4 w-4 text-blue-500" />
                    Investors you&apos;ve shared with
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-gray-900">
                  {partnerSummary.totalReferrals}
                </CardContent>
              </Card>
              <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Converted</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                    Funded investments
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-gray-900">
                  {partnerSummary.converted}
                </CardContent>
              </Card>
              <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Pipeline Value</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    In-progress commitments
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-gray-900">
                  {partnerSummary.pipelineValue > 0
                    ? formatCurrency(partnerSummary.pipelineValue, partnerSummary.currency)
                    : '—'}
                </CardContent>
              </Card>
              <Card className="border-purple-100 bg-gradient-to-br from-purple-50/50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Pending Commissions</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                    <Wallet className="h-4 w-4 text-purple-500" />
                    Accrued, awaiting invoice
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-gray-900">
                  {partnerSummary.pendingCommissions > 0
                    ? formatCurrency(partnerSummary.pendingCommissions, partnerSummary.currency)
                    : '—'}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* ================================================================ */}
        {/* INVESTOR Summary Cards (original investor-centric metrics) */}
        {/* ================================================================ */}
        {isInvestorView && (
          <>
            {personaMode === 'DUAL_PERSONA' && (
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  <Activity className="h-3 w-3 mr-1" />
                  Investor View
                </Badge>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Open deals</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    Ready for exploration
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-gray-900">
                  {summary.openDeals} / {summary.totalDeals}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Pending interests</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                    <LineChart className="h-4 w-4 text-amber-500" />
                    Awaiting team review
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-gray-900">
                  {summary.pendingInterests}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Active NDAs</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                    <ShieldCheck className="h-4 w-4 text-sky-500" />
                    Data room unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-gray-900">
                  {summary.activeNdas}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Subscriptions in review</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                    <MailCheck className="h-4 w-4 text-indigo-500" />
                    Awaiting confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-gray-900">
                  {summary.submittedSubscriptions}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* ================================================================ */}
        {/* GENERIC View (no investor/partner - just deal counts) */}
        {/* ================================================================ */}
        {personaMode === 'GENERIC' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Open deals</CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Ready for exploration
                </CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-gray-900">
                {summary.openDeals} / {summary.totalDeals}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Your Role</CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4 text-gray-500" />
                  Tracking access
                </CardDescription>
              </CardHeader>
              <CardContent className="text-lg font-medium text-gray-600">
                View-only access
              </CardContent>
            </Card>
          </div>
        )}
      </header>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deals by name, company, sector, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Primary Filters Row */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Deal Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="allocation_pending">Allocation Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Deal Type */}
            <Select value={dealTypeFilter} onValueChange={setDealTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Deal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="equity_secondary">Secondary Equity</SelectItem>
                <SelectItem value="equity_primary">Primary Equity</SelectItem>
                <SelectItem value="credit_trade_finance">Credit & Trade Finance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Pipeline Stage */}
            <Select value={pipelineStageFilter} onValueChange={setPipelineStageFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="My Pipeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="nda_access">NDA Access</SelectItem>
                <SelectItem value="subscription_submitted">Subscription Submitted</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="closing_date">Closing Date</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="opening_date">Newest First</SelectItem>
                <SelectItem value="target_amount">Target Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Interest Status */}
                <Select value={interestStatusFilter} onValueChange={setInterestStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Interest Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Interest Status</SelectItem>
                    <SelectItem value="no_interest">No Interest Yet</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved (NDA)</SelectItem>
                    <SelectItem value="rejected">Declined</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sector */}
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {uniqueSectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Stage */}
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {uniqueStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Location */}
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between pt-2 text-sm text-gray-600">
            <span>
              Showing {filteredDeals.length} of {dealsData.length} deals
            </span>
            {activeFiltersCount > 0 && (
              <span className="text-blue-600">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Subscriptions Section - Stages 6-9 (In Progress) */}
      {subscriptionsInProgress.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                My Subscriptions
              </h2>
              <p className="text-sm text-gray-600">
                Track your in-progress subscriptions (Stages 6-9)
              </p>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              {subscriptionsInProgress.length} in progress
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {subscriptionsInProgress.map(({ deal, subscription, stageMeta }) => {
              const StageIcon = stageMeta.icon

              return (
                <Card
                  key={subscription.id}
                  className={cn(
                    'overflow-hidden border-2 transition-all hover:shadow-md',
                    stageMeta.borderColor,
                    stageMeta.bgColor
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {deal.company_logo_url ? (
                          <Image
                            src={deal.company_logo_url}
                            alt={`${deal.company_name ?? deal.name} logo`}
                            width={40}
                            height={40}
                            className="rounded-lg object-contain bg-white border border-gray-200 p-1"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-gray-400 text-lg font-semibold border border-gray-200">
                            {deal.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base text-gray-900">
                            {deal.name}
                          </CardTitle>
                          <CardDescription className="text-xs text-gray-600">
                            {deal.company_name ?? 'Issuer TBA'}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={cn('text-xs font-medium', stageMeta.bgColor, stageMeta.textColor, stageMeta.borderColor, 'border')}>
                        <StageIcon className="h-3 w-3 mr-1" />
                        {stageMeta.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Progress indicator */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            stageMeta.stage === 6 ? 'w-1/4 bg-blue-500' :
                            stageMeta.stage === 7 ? 'w-2/4 bg-indigo-500' :
                            stageMeta.stage === 8 ? 'w-3/4 bg-purple-500' :
                            'w-full bg-emerald-500'
                          )}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        Stage {stageMeta.stage}/10
                      </span>
                    </div>

                    {/* Submission date */}
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Submitted</span>
                      <span>{new Date(subscription.submitted_at).toLocaleDateString()}</span>
                    </div>

                    {/* View Details button */}
                    <Link href={`${detailUrlBase}/${deal.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 mt-2"
                      >
                        View Details
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500">Open Opportunities</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>
      )}

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-16">
          {dealsData.length === 0 ? (
            <>
              <Users className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No deals available yet</h2>
              <p className="text-gray-500">
                The team hasn&apos;t invited you to any opportunities. We&apos;ll notify you as soon as a deal opens up.
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No deals match your filters</h2>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={resetFilters} variant="outline">
                Clear all filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredDeals.map((deal) => {
            const feeStructure = feeStructureMap.get(deal.id) ?? null
            const interest = interestByDeal.get(deal.id) ?? null
            const ndaAccess = accessByDeal.get(deal.id) ?? null
            const subscription = subscriptionByDeal.get(deal.id) ?? null
            const membershipRole = deal.deal_memberships?.[0]?.role ?? null
            const canInvest = isInvestorEligibleRole(membershipRole)
            const isTrackingOnly = !!membershipRole && !canInvest

            const effectiveStatus = getEffectiveStatus(deal)
            const statusLabel =
              dealTypeLabels[deal.deal_type] ?? deal.deal_type.replace(/_/g, ' ')

            const deadlineCopy = formatDeadlineCopy(deal.close_at, effectiveStatus)

            const indicativeAmount = interest?.indicative_amount ?? null
            const indicativeCurrency =
              interest?.indicative_currency ?? deal.currency ?? null

            const hasDataRoomAccess = Boolean(ndaAccess)
            const isClosed = effectiveStatus === 'closed'

            // Check if deal was dispatched within last 7 days
            const dispatchedAt = deal.deal_memberships?.[0]?.dispatched_at
            const isNewlyDispatched = dispatchedAt &&
              (Date.now() - new Date(dispatchedAt).getTime()) < 7 * 24 * 60 * 60 * 1000

            return (
              <Card key={deal.id} className="overflow-hidden border border-gray-200 shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {deal.company_logo_url ? (
                        <Image
                          src={deal.company_logo_url}
                          alt={`${deal.company_name ?? deal.name} logo`}
                          width={56}
                          height={56}
                          className="rounded-lg object-contain bg-white border border-gray-200 p-2"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-semibold">
                          {deal.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                          {deal.name}
                          <Badge className={cn('text-xs', statusBadges[effectiveStatus] ?? statusBadges.draft)}>
                            {effectiveStatus.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                          {isNewlyDispatched && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              NEW
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          {deal.company_name ?? 'Issuer TBA'} • {statusLabel}
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                          {deal.stage && <span>Stage: {deal.stage}</span>}
                          {deal.sector && <span>Sector: {deal.sector}</span>}
                          {deal.location && <span>Location: {deal.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Timeline</p>
                      <p className="text-sm font-medium text-gray-900">{deadlineCopy}</p>
                      {ndaAccess?.expires_at && (
                        <p className="text-xs text-gray-500">
                          NDA access until {new Date(ndaAccess.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {deal.company_website && (
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      <Link
                        href={deal.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Visit company site
                      </Link>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Allocation</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {feeStructure?.allocation_up_to
                          ? formatCurrency(feeStructure.allocation_up_to, deal.currency)
                          : deal.target_amount
                            ? formatCurrency(deal.target_amount, deal.currency)
                            : '(Pending)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Minimum ticket</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {feeStructure?.minimum_ticket
                          ? formatCurrency(feeStructure.minimum_ticket, deal.currency)
                          : deal.minimum_investment
                            ? formatCurrency(deal.minimum_investment, deal.currency)
                            : '(Pending)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Maximum ticket</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {feeStructure?.maximum_ticket
                          ? formatCurrency(feeStructure.maximum_ticket, deal.currency)
                          : deal.maximum_investment
                            ? formatCurrency(deal.maximum_investment, deal.currency)
                            : '(Pending)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Unit price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {feeStructure?.price_per_share_text
                          ? feeStructure.price_per_share_text
                          : deal.offer_unit_price
                            ? `${formatCurrency(deal.offer_unit_price, deal.currency)} per unit`
                            : '(Pending)'}
                      </p>
                    </div>
                  </div>

                  {/* ============================================================ */}
                  {/* PARTNER VIEW: Your Referrals (US-5.6.1-01 through 06) */}
                  {/* ============================================================ */}
                  {isPartnerView && (() => {
                    const dealReferrals = referralsByDeal[deal.id] || []
                    const dealSubscriptions = referralSubscriptionsByDeal[deal.id] || []
                    const dealCommissions = partnerCommissionsByDeal[deal.id] || []

                    // Get the commission rate (they should all be the same for this deal)
                    const commissionRate = dealCommissions[0]?.rate_bps
                      ? `${(dealCommissions[0].rate_bps / 100).toFixed(2)}%`
                      : null

                    // Calculate estimated commission from funded subscriptions
                    const fundedSubs = dealSubscriptions.filter(s =>
                      ['funded', 'active', 'activated', 'committed'].includes(s.status?.toLowerCase())
                    )
                    const totalFundedAmount = fundedSubs.reduce((sum, s) => sum + Number(s.commitment || 0), 0)
                    const rateBps = dealCommissions[0]?.rate_bps ?? 0
                    const estCommission = commissionRate && totalFundedAmount > 0 && rateBps > 0
                      ? totalFundedAmount * (rateBps / 10000)
                      : 0

                    if (dealReferrals.length === 0) {
                      return (
                        <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-blue-700">No referrals yet</span>
                            </div>
                            {commissionRate && (
                              <span className="text-xs text-blue-600">
                                Fee: {commissionRate} of invested
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-900">
                              Your Referrals ({dealReferrals.length})
                            </span>
                          </div>
                          {commissionRate && (
                            <span className="text-xs text-blue-600">
                              Fee: {commissionRate} of invested
                            </span>
                          )}
                        </div>

                        {/* List of referred investors with stage badges */}
                        <div className="space-y-2">
                          {dealReferrals.slice(0, 5).map((referral) => {
                            const stage = getReferralStage(referral, dealSubscriptions)
                            const stageMeta = referralStageMeta[stage]

                            return (
                              <div
                                key={referral.investor_id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-gray-700 truncate max-w-[200px]">
                                  {referral.investor_name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs',
                                    stageMeta.bgColor,
                                    stageMeta.textColor,
                                    stageMeta.borderColor,
                                    'border'
                                  )}
                                >
                                  {stageMeta.label}
                                </Badge>
                              </div>
                            )
                          })}
                          {dealReferrals.length > 5 && (
                            <p className="text-xs text-blue-600">
                              +{dealReferrals.length - 5} more referrals
                            </p>
                          )}
                        </div>

                        {/* Estimated commission summary */}
                        {estCommission > 0 && (
                          <div className="pt-2 border-t border-blue-200 flex items-center justify-between">
                            <span className="text-xs text-blue-600">Est. Commission:</span>
                            <span className="text-sm font-semibold text-blue-900">
                              {formatCurrency(estCommission, dealCommissions[0]?.currency || deal.currency)}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* ============================================================ */}
                  {/* INVESTOR VIEW: Your Pipeline (original investor tracking) */}
                  {/* ============================================================ */}
                  {isInvestorView && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Your pipeline</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {interest ? (
                            interest.is_post_close ? (
                              <Badge className="w-fit bg-purple-100 text-purple-700">
                                Future interest signal
                              </Badge>
                            ) : (
                              <Badge className={cn('w-fit', interestStatusMeta[interest.status].tone)}>
                                {interestStatusMeta[interest.status].label}
                              </Badge>
                            )
                          ) : (
                            <span className="text-sm text-gray-600">No signal yet</span>
                          )}
                          {subscription && (
                            <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                              Subscription {subscription.status.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          {isTrackingOnly && (
                            <Badge variant="outline" className="border-amber-200 text-amber-700">
                              Tracking only
                            </Badge>
                          )}
                          {hasDataRoomAccess && (
                            <Badge variant="outline" className="text-sky-600 border-sky-300">
                              Data room unlocked
                            </Badge>
                          )}
                          {feeStructure?.interest_confirmation_deadline && (
                            <span className="text-xs text-gray-600">
                              Interest deadline: {new Date(feeStructure.interest_confirmation_deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* GENERIC VIEW: Basic tracking info */}
                  {/* ============================================================ */}
                  {personaMode === 'GENERIC' && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">View-only access</span>
                      </div>
                    </div>
                  )}

                  {isInvestorView && interest && indicativeAmount ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      You indicated interest for approximately{' '}
                      <span className="font-semibold">
                        {formatCurrency(indicativeAmount, indicativeCurrency)}
                      </span>
                      .
                    </div>
                  ) : null}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CalendarClock className="h-4 w-4 text-gray-400" />
                      {deal.open_at
                        ? `Opened ${new Date(deal.open_at).toLocaleDateString()}`
                        : 'Opening window announced soon'}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`${detailUrlBase}/${deal.id}`}>
                        <Button variant="outline" className="gap-2">
                          View details
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>

                      {/* Subscribe to Investment - primary CTA for investors with valid investor ID */}
                      {!isClosed && primaryInvestorId && canInvest && (
                        <SubscribeNowDialog
                          dealId={deal.id}
                          dealName={deal.name}
                          currency={deal.currency}
                          existingSubmission={subscription}
                        >
                          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            Subscribe to Investment Opportunity
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </SubscribeNowDialog>
                      )}

                      {/* Submit Interest for Data Room - secondary CTA for investors with a valid investor ID */}
                      {primaryInvestorId && canInvest && (
                        <InterestModal
                          dealId={deal.id}
                          dealName={deal.name}
                          currency={deal.currency}
                          investorId={primaryInvestorId}
                          defaultAmount={indicativeAmount}
                          isClosed={isClosed}
                        >
                          <Button className="gap-2" variant={isClosed ? 'secondary' : 'outline'}>
                            {isClosed ? "Notify Me About Similar" : "Submit Interest for Data Room"}
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </InterestModal>
                      )}

                      {/* Partner Share Deal - PRD Rows 95-96 */}
                      {partnerId && !isClosed && (
                        <ShareDealDialog
                          dealId={deal.id}
                          dealName={deal.name}
                          partnerId={partnerId}
                        >
                          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Share2 className="h-4 w-4" />
                            Share with Investor
                          </Button>
                        </ShareDealDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
