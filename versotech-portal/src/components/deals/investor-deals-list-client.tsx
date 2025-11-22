'use client'

import { useState, useMemo } from 'react'
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
  SlidersHorizontal
} from 'lucide-react'
import { InterestModal } from '@/components/deals/interest-modal'

type Nullable<T> = T | null

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
  primaryInvestorId: string
  summary: {
    totalDeals: number
    openDeals: number
    pendingInterests: number
    activeNdas: number
    submittedSubscriptions: number
  }
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

const interestStatusMeta: Record<
  DealInterest['status'],
  { label: string; tone: string }
> = {
  pending_review: { label: 'Pending review', tone: 'bg-amber-100 text-amber-700' },
  approved: { label: 'NDA active', tone: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Declined', tone: 'bg-rose-100 text-rose-700' },
  withdrawn: { label: 'Withdrawn', tone: 'bg-slate-100 text-slate-700' }
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
  summary
}: InvestorDealsListClientProps) {
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

  // Extract unique values for filter dropdowns
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

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Investment Opportunities</h1>
          <p className="text-gray-600">
            Track active allocations, NDAs, and subscriptions throughout the deal pipeline.
          </p>
        </div>

        {/* Summary Cards */}
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

            const effectiveStatus = getEffectiveStatus(deal)
            const statusLabel =
              dealTypeLabels[deal.deal_type] ?? deal.deal_type.replace(/_/g, ' ')

            const deadlineCopy = formatDeadlineCopy(deal.close_at, effectiveStatus)

            const indicativeAmount = interest?.indicative_amount ?? null
            const indicativeCurrency =
              interest?.indicative_currency ?? deal.currency ?? null

            const hasDataRoomAccess = Boolean(ndaAccess)
            const isClosed = effectiveStatus === 'closed'

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
                          ? `${formatCurrency(feeStructure.allocation_up_to, deal.currency)}`
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

                  {interest && indicativeAmount ? (
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
                      <Link href={`/versoholdings/deal/${deal.id}`}>
                        <Button variant="outline" className="gap-2">
                          View details
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>

                      <InterestModal
                        dealId={deal.id}
                        dealName={deal.name}
                        currency={deal.currency}
                        investorId={primaryInvestorId}
                        defaultAmount={indicativeAmount}
                        isClosed={isClosed}
                      >
                        <Button className="gap-2" variant={isClosed ? 'secondary' : 'default'}>
                          {isClosed ? "Notify Me About Similar" : "I'm interested"}
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </InterestModal>
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
