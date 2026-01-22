import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { InvestorDealsListClient } from '@/components/deals/investor-deals-list-client'

export const dynamic = 'force-dynamic'

type Nullable<T> = T | null

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
  converted: number // funded subscriptions
  pipelineValue: number // sum of commitments in progress
  pendingCommissions: number // sum of accrued commissions
  currency: string
}

// ============================================================================
// Investor Deal Types
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
  completion_date: string | null
  completion_date_text: string | null
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

/**
 * Opportunities List Page - Unified Portal
 *
 * Access: Any user with deal_memberships (investors, partners, introducers, CPs, lawyers)
 * The deal_memberships table tracks who has access to which deals.
 */
export default async function OpportunitiesPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    throw new Error('Authentication required')
  }

  const serviceSupabase = createServiceClient()

  // Fetch all deals accessible to this user via deal_memberships
  // This works for ALL persona types: investors, partners, introducers, CPs, lawyers, arrangers
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
        accepted_at,
        dispatched_at
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
    .order('close_at', { ascending: true, nullsFirst: false })

  if (dealsError) {
    console.error('Failed to load deals', dealsError)
  }

  const dealsData = (deals ?? []) as unknown as InvestorDeal[]

  // If user has no deal memberships, show appropriate message
  if (dealsData.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No opportunities available
          </h3>
          <p className="text-muted-foreground">
            You haven&apos;t been dispatched to any investment opportunities yet.
            <br />
            Please contact your relationship manager for access.
          </p>
        </div>
      </div>
    )
  }

  // Get investor IDs if user has investor persona (optional - for interest/subscription tracking)
  const { data: investorLinks } = await serviceSupabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  const investorIds = investorLinks?.map(link => link.investor_id) ?? []
  const primaryInvestorId = investorIds[0] ?? null

  // Get partner ID if user is a partner (PRD Rows 95-96: Partner Share feature)
  const { data: partnerUser } = await serviceSupabase
    .from('partner_users')
    .select('partner_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const partnerId = partnerUser?.partner_id ?? null
  const dealIds = dealsData.map(deal => deal.id)

  // ============================================================================
  // Partner Referral Data (US-5.6.1-01 through 07)
  // Fetch referrals, subscription statuses, and commissions for Partner persona
  // ============================================================================

  let referralsByDeal = new Map<string, PartnerReferral[]>()
  let referralSubscriptionsByDeal = new Map<string, ReferralSubscription[]>()
  let partnerCommissionsByDeal = new Map<string, PartnerCommission[]>()
  let partnerSummary: PartnerSummary = {
    totalReferrals: 0,
    converted: 0,
    pipelineValue: 0,
    pendingCommissions: 0,
    currency: 'USD'
  }

  if (partnerId && dealIds.length > 0) {
    // 1. Get all deal_memberships where this partner referred investors
    const { data: referralsRaw } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        deal_id,
        investor_id,
        dispatched_at,
        interest_confirmed_at,
        investors:investor_id (
          id,
          legal_name,
          display_name
        )
      `)
      .eq('referred_by_entity_id', partnerId)
      .eq('referred_by_entity_type', 'partner')
      .in('deal_id', dealIds)

    // Process referrals - group by deal_id
    if (referralsRaw && referralsRaw.length > 0) {
      const referrals: PartnerReferral[] = referralsRaw.map(r => {
        // Supabase returns the joined investor as a single object (not array) when using investor_id FK
        const investor = r.investors as unknown as { id: string; legal_name: string; display_name: string | null } | null
        return {
          deal_id: r.deal_id,
          investor_id: r.investor_id,
          investor_name: investor?.display_name || investor?.legal_name || 'Unknown Investor',
          dispatched_at: r.dispatched_at,
          interest_confirmed_at: r.interest_confirmed_at
        }
      })

      // Group referrals by deal_id
      for (const referral of referrals) {
        const existing = referralsByDeal.get(referral.deal_id) || []
        existing.push(referral)
        referralsByDeal.set(referral.deal_id, existing)
      }

      // 2. Get subscription statuses for referred investors
      const referredInvestorIds = [...new Set(referrals.map(r => r.investor_id))]

      const { data: subscriptionsRaw } = await serviceSupabase
        .from('subscriptions')
        .select('investor_id, deal_id, status, commitment, currency, funded_at, signed_at')
        .in('investor_id', referredInvestorIds)
        .in('deal_id', dealIds)

      if (subscriptionsRaw) {
        // Group subscriptions by deal_id
        for (const sub of subscriptionsRaw) {
          const existing = referralSubscriptionsByDeal.get(sub.deal_id) || []
          existing.push(sub as ReferralSubscription)
          referralSubscriptionsByDeal.set(sub.deal_id, existing)
        }
      }

      // 3. Get partner commissions for fee rate display and pending amounts
      const { data: commissionsRaw } = await serviceSupabase
        .from('partner_commissions')
        .select('deal_id, investor_id, rate_bps, accrual_amount, currency, status')
        .eq('partner_id', partnerId)
        .in('deal_id', dealIds)

      if (commissionsRaw) {
        // Group commissions by deal_id
        for (const comm of commissionsRaw) {
          const existing = partnerCommissionsByDeal.get(comm.deal_id) || []
          existing.push(comm as PartnerCommission)
          partnerCommissionsByDeal.set(comm.deal_id, existing)
        }
      }

      // 4. Calculate Partner summary metrics
      const fundedStatuses = ['funded', 'active', 'activated', 'committed']
      const pipelineStatuses = ['pending', 'pending_review', 'approved', 'signed', 'pack_sent', 'pack_generated']

      let totalPipelineValue = 0
      let totalPendingCommissions = 0
      let convertedCount = 0
      let detectedCurrency = 'USD'

      // Count conversions and pipeline value from subscriptions
      for (const [, subs] of referralSubscriptionsByDeal) {
        for (const sub of subs) {
          if (sub.currency) detectedCurrency = sub.currency
          if (fundedStatuses.includes(sub.status?.toLowerCase())) {
            convertedCount++
          } else if (pipelineStatuses.includes(sub.status?.toLowerCase()) && sub.commitment) {
            totalPipelineValue += Number(sub.commitment)
          }
        }
      }

      // Sum pending commissions
      for (const [, comms] of partnerCommissionsByDeal) {
        for (const comm of comms) {
          if (comm.status === 'accrued' && comm.accrual_amount) {
            totalPendingCommissions += Number(comm.accrual_amount)
            if (comm.currency) detectedCurrency = comm.currency
          }
        }
      }

      partnerSummary = {
        totalReferrals: referrals.length,
        converted: convertedCount,
        pipelineValue: totalPipelineValue,
        pendingCommissions: totalPendingCommissions,
        currency: detectedCurrency
      }
    }
  }

  // ============================================================================
  // Investor-Specific Data
  // ============================================================================

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
        completion_date,
        completion_date_text,
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

  // Calculate summary statistics (client-side filtering for getEffectiveStatus compatibility)
  const now = new Date()
  const summary = {
    totalDeals: dealsData.length,
    openDeals: dealsData.filter(deal => {
      if (deal.status === 'closed' || deal.status === 'cancelled') return false
      if (deal.close_at && new Date(deal.close_at) < now) return false
      return deal.status === 'open'
    }).length,
    pendingInterests: investorInterests.filter(interest => interest.status === 'pending_review').length,
    activeNdas: ndaAccessRecords.length,
    submittedSubscriptions: subscriptionRecords.length
  }

  // Convert Maps to serializable objects for client component
  const referralsByDealObj = Object.fromEntries(referralsByDeal)
  const referralSubscriptionsByDealObj = Object.fromEntries(referralSubscriptionsByDeal)
  const partnerCommissionsByDealObj = Object.fromEntries(partnerCommissionsByDeal)

  return (
    <InvestorDealsListClient
      dealsData={dealsData}
      feeStructureMap={feeStructureMap}
      interestByDeal={interestByDeal}
      accessByDeal={accessByDeal}
      subscriptionByDeal={subscriptionByDeal}
      primaryInvestorId={primaryInvestorId}
      partnerId={partnerId}
      summary={summary}
      detailUrlBase="/versotech_main/opportunities"
      // Partner-specific props (US-5.6.1-01 through 07)
      referralsByDeal={referralsByDealObj}
      referralSubscriptionsByDeal={referralSubscriptionsByDealObj}
      partnerCommissionsByDeal={partnerCommissionsByDealObj}
      partnerSummary={partnerSummary}
    />
  )
}
