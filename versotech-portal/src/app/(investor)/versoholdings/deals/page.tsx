import { AppLayout } from '@/components/layout/app-layout'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { InvestorDealsListClient } from '@/components/deals/investor-deals-list-client'

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
  price_per_share: number | null
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
  completion_date: string | null
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

  let accountApprovalStatus: string | null = null
  let investorKycStatus: string | null = null

  if (primaryInvestorId) {
    const { data: investorAccount } = await serviceSupabase
      .from('investors')
      .select('account_approval_status, kyc_status, status')
      .eq('id', primaryInvestorId)
      .maybeSingle()

    const investorStatus = investorAccount?.status?.toLowerCase() ?? null
    accountApprovalStatus = (investorStatus === 'unauthorized' || investorStatus === 'blacklisted')
      ? 'unauthorized'
      : investorAccount?.account_approval_status ?? null
    investorKycStatus = investorAccount?.kyc_status ?? null
  }

  // Fetch all deals accessible to this user (including closed ones for historical view)
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
        price_per_share,
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
        completion_date,
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

  // Calculate summary statistics (client-side filtering for getEffectiveStatus compatibility)
  const now = new Date()
  const computedOpenDeals = dealsData.filter(deal => {
    if (deal.status === 'closed' || deal.status === 'cancelled') return false
    if (deal.close_at && new Date(deal.close_at) < now) return false
    return deal.status === 'open'
  }).length

  const summary = {
    totalDeals: dealsData.length,
    openDeals: accountApprovalStatus === 'unauthorized' ? 0 : computedOpenDeals,
    pendingInterests: investorInterests.filter(interest => interest.status === 'pending_review').length,
    activeNdas: ndaAccessRecords.length,
    submittedSubscriptions: subscriptionRecords.length
  }

  return (
    <AppLayout brand="versoholdings">
      <InvestorDealsListClient
        dealsData={dealsData}
        feeStructureMap={feeStructureMap}
        interestByDeal={interestByDeal}
        accessByDeal={accessByDeal}
        subscriptionByDeal={subscriptionByDeal}
        primaryInvestorId={primaryInvestorId}
        accountApprovalStatus={accountApprovalStatus}
        kycStatus={investorKycStatus}
        summary={summary}
      />
    </AppLayout>
  )
}
