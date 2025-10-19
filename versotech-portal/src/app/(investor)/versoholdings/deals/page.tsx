import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient, createServiceClient } from '@/lib/supabase/server'
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
  Users
} from 'lucide-react'
import Image from 'next/image'
import { InterestModal } from '@/components/deals/interest-modal'

export const dynamic = 'force-dynamic'

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

function groupByDealId<T extends { deal_id: string }>(
  records: T[]
) {
  const map = new Map<string, T>()
  for (const record of records) {
    const existing = map.get(record.deal_id)
    const currentTimestamp = 'submitted_at' in record
      ? new Date((record as { submitted_at: string }).submitted_at).getTime()
      : 'granted_at' in record
        ? new Date((record as { granted_at: string }).granted_at).getTime()
        : 0

    if (!existing) {
      map.set(record.deal_id, record)
      continue
    }

    const existingTimestamp = 'submitted_at' in existing
      ? new Date((existing as { submitted_at: string }).submitted_at).getTime()
      : 'granted_at' in existing
        ? new Date((existing as { granted_at: string }).granted_at).getTime()
        : 0

    if (currentTimestamp > existingTimestamp) {
      map.set(record.deal_id, record)
    }
  }
  return map
}

export default async function InvestorDealsPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    throw new Error('Authentication required')
  }

  const serviceSupabase = createServiceClient()

  const { data: investorLinks } = await serviceSupabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  if (!investorLinks || investorLinks.length === 0) {
    return (
      <AppLayout brand="versoholdings">
        <div className="p-6">
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No investor profile linked
            </h3>
            <p className="text-gray-500">
              Please contact the VERSO team to be added to an investor account.
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const investorIds = investorLinks.map(link => link.investor_id)
  const primaryInvestorId = investorIds[0]

  const { data: deals, error: dealsError } = await serviceSupabase
    .from('deals')
    .select(`
      *,
      vehicles (
        id,
        name,
        type
      ),
      deal_memberships!inner (
        role,
        accepted_at
      ),
      fee_plans (
        id,
        name,
        description,
        is_default,
        fee_components (
          id,
          kind,
          calc_method,
          rate_bps,
          flat_amount,
          frequency,
          notes
        )
      )
    `)
    .eq('deal_memberships.user_id', user.id)
    .order('status', { ascending: true })
    .order('close_at', { ascending: true })

  if (dealsError) {
    console.error('Failed to load deals', dealsError)
  }

  const dealsData: InvestorDeal[] = deals ?? []
  const dealIds = dealsData.map(deal => deal.id)

  let feeStructureMap = new Map<string, FeeStructure>()
  let investorInterests: DealInterest[] = []
  let ndaAccessRecords: DataRoomAccess[] = []
  let subscriptionRecords: SubscriptionSubmission[] = []

  if (dealIds.length > 0) {
    const { data: feeStructures } = await serviceSupabase
      .from('deal_fee_structures')
      .select(`
        id,
        deal_id,
        created_at,
        effective_at,
        published_at,
        allocation_up_to,
        price_per_share_text,
        minimum_ticket,
        maximum_ticket,
        term_sheet_date,
        transaction_type,
        opportunity_summary,
        issuer,
        vehicle,
        exclusive_arranger,
        purchaser,
        seller,
        structure,
        subscription_fee_percent,
        management_fee_percent,
        carried_interest_percent,
        legal_counsel,
        interest_confirmation_deadline,
        capital_call_timeline,
        completion_date_text,
        in_principle_approval_text,
        subscription_pack_note,
        share_certificates_note,
        subject_to_change_note,
        validity_date,
        term_sheet_attachment_key
      `)
      .in('deal_id', dealIds)
      .eq('status', 'published')
      .order('effective_at', { ascending: false })

      if (feeStructures && feeStructures.length > 0) {
      feeStructureMap = feeStructures.reduce((map, structure) => {
        const existing = map.get(structure.deal_id)
        if (!existing) {
          map.set(structure.deal_id, structure)
          return map
        }

        const getTimestamp = (item: FeeStructure) => {
          const candidate =
            item.effective_at ??
            item.published_at ??
            item.validity_date ??
            item.term_sheet_date ??
            item.created_at ??
            null
          return candidate ? new Date(candidate).getTime() : 0
        }

        if (getTimestamp(structure) > getTimestamp(existing)) {
          map.set(structure.deal_id, structure)
        }
        return map
      }, new Map<string, FeeStructure>())
    }

    if (investorIds.length > 0) {
      const { data: interests } = await serviceSupabase
        .from('investor_deal_interest')
        .select(`
          id,
          deal_id,
          investor_id,
          status,
          submitted_at,
          approved_at,
          indicative_amount,
          indicative_currency,
          is_post_close
        `)
        .in('deal_id', dealIds)
        .in('investor_id', investorIds)
        .order('submitted_at', { ascending: false })

      investorInterests = interests ?? []

      const { data: accessData } = await serviceSupabase
        .from('deal_data_room_access')
        .select(`
          id,
          deal_id,
          investor_id,
          granted_at,
          expires_at,
          auto_granted,
          revoked_at
        `)
        .in('deal_id', dealIds)
        .in('investor_id', investorIds)
        .order('granted_at', { ascending: false })

      ndaAccessRecords = (accessData ?? []).filter(record => !record.revoked_at)

      const { data: subscriptionData } = await serviceSupabase
        .from('deal_subscription_submissions')
        .select(`
          id,
          deal_id,
          investor_id,
          status,
          submitted_at
        `)
        .in('deal_id', dealIds)
        .in('investor_id', investorIds)
        .order('submitted_at', { ascending: false })

      subscriptionRecords = subscriptionData ?? []
    }
  }

  const interestByDeal = groupByDealId(investorInterests)
  const accessByDeal = groupByDealId(ndaAccessRecords)
  const subscriptionByDeal = groupByDealId(subscriptionRecords)

  const summary = {
    totalDeals: dealsData.length,
    openDeals: dealsData.filter(deal => getEffectiveStatus(deal) === 'open').length,
    pendingInterests: investorInterests.filter(interest => interest.status === 'pending_review').length,
    activeNdas: ndaAccessRecords.length,
    submittedSubscriptions: subscriptionRecords.length
  }

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-8">
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Investment Opportunities</h1>
            <p className="text-gray-600">
              Track active allocations, NDAs, and subscriptions throughout the deal pipeline.
            </p>
          </div>

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

        {dealsData.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No deals available yet</h2>
            <p className="text-gray-500">
              The team hasn&apos;t invited you to any opportunities. We&apos;ll notify you as soon as a deal opens up.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {dealsData.map((deal) => {
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
                            : '(Pending)'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Maximum ticket</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {feeStructure?.maximum_ticket
                            ? formatCurrency(feeStructure.maximum_ticket, deal.currency)
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
    </AppLayout>
  )
}
