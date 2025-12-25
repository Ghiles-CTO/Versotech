import { createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { IntroducerDetailClient } from '@/components/staff/introducers/introducer-detail-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type IntroducerDetail = {
  id: string
  legal_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  default_commission_bps: number | null
  commission_cap_amount: number | null
  payment_terms: string | null
  status: string
  kyc_status: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

type Introduction = {
  id: string
  prospect_email: string | null
  status: string
  introduced_at: string | null
  deal: {
    id: string
    name: string
  } | null
}

type Commission = {
  id: string
  accrual_amount: number
  status: string
  paid_at: string | null
  created_at: string
  deal_id: string | null
  investor_id: string | null
  investor?: {
    legal_name: string
  } | null
  deal?: {
    name: string
  } | null
}

type Agreement = {
  id: string
  status: string
  default_commission_bps: number | null
  agreement_date: string | null
  effective_date: string | null
  expiry_date: string | null
  special_terms: string | null
  signed_date: string | null
  created_at: string
  updated_at: string
}

export default async function IntroducerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  await requireStaffAuth()
  const serviceClient = createServiceClient()

  // Fetch introducer details
  const { data: introducer, error } = await serviceClient
    .from('introducers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !introducer) {
    console.error('[Introducer Detail] Error:', error)
    notFound()
  }

  // Fetch introductions separately to avoid Supabase nested query issues
  const { data: introductionsData } = await serviceClient
    .from('introductions')
    .select(`
      id,
      prospect_email,
      status,
      introduced_at,
      deal_id
    `)
    .eq('introducer_id', id)
    .order('introduced_at', { ascending: false })

  // Fetch deal names for introductions
  const dealIds = (introductionsData || [])
    .map(i => i.deal_id)
    .filter((id): id is string => id != null)

  let dealsMap: Record<string, { id: string; name: string }> = {}
  if (dealIds.length > 0) {
    const { data: dealsData } = await serviceClient
      .from('deals')
      .select('id, name')
      .in('id', dealIds)

    dealsMap = (dealsData || []).reduce((acc, d) => {
      acc[d.id] = { id: d.id, name: d.name }
      return acc
    }, {} as Record<string, { id: string; name: string }>)
  }

  const introductions: Introduction[] = (introductionsData || []).map(i => ({
    id: i.id,
    prospect_email: i.prospect_email,
    status: i.status || 'pending',
    introduced_at: i.introduced_at,
    deal: i.deal_id ? dealsMap[i.deal_id] || null : null,
  }))

  // Fetch commissions separately
  const { data: commissionsData } = await serviceClient
    .from('introducer_commissions')
    .select(`
      id,
      accrual_amount,
      status,
      paid_at,
      created_at,
      deal_id,
      investor_id
    `)
    .eq('introducer_id', id)
    .order('created_at', { ascending: false })

  // Fetch investor names for commissions
  const commissionInvestorIds = (commissionsData || [])
    .map(c => c.investor_id)
    .filter((id): id is string => id != null)

  let commissionInvestorsMap: Record<string, { legal_name: string }> = {}
  if (commissionInvestorIds.length > 0) {
    const { data: investorsData } = await serviceClient
      .from('investors')
      .select('id, legal_name')
      .in('id', commissionInvestorIds)

    commissionInvestorsMap = (investorsData || []).reduce((acc, inv) => {
      acc[inv.id] = { legal_name: inv.legal_name }
      return acc
    }, {} as Record<string, { legal_name: string }>)
  }

  // Fetch deal names for commissions
  const commissionDealIds = (commissionsData || [])
    .map(c => c.deal_id)
    .filter((id): id is string => id != null)

  let commissionDealsMap: Record<string, { name: string }> = {}
  if (commissionDealIds.length > 0) {
    const { data: commissionDealsData } = await serviceClient
      .from('deals')
      .select('id, name')
      .in('id', commissionDealIds)

    commissionDealsMap = (commissionDealsData || []).reduce((acc, d) => {
      acc[d.id] = { name: d.name }
      return acc
    }, {} as Record<string, { name: string }>)
  }

  const commissions: Commission[] = (commissionsData || []).map(c => {
    const investor = c.investor_id ? commissionInvestorsMap[c.investor_id] : null
    const deal = c.deal_id ? commissionDealsMap[c.deal_id] : null

    return {
      id: c.id,
      accrual_amount: Number(c.accrual_amount) || 0,
      status: c.status || 'accrued',
      paid_at: c.paid_at,
      created_at: c.created_at,
      deal_id: c.deal_id,
      investor_id: c.investor_id,
      investor: investor || undefined,
      deal: deal || undefined,
    }
  })

  // Fetch agreements
  const { data: agreementsData } = await serviceClient
    .from('introducer_agreements')
    .select(`
      id,
      status,
      default_commission_bps,
      agreement_date,
      effective_date,
      expiry_date,
      special_terms,
      signed_date,
      created_at,
      updated_at
    `)
    .eq('introducer_id', id)
    .order('created_at', { ascending: false })

  const agreements: Agreement[] = (agreementsData || []).map(a => ({
    id: a.id,
    status: a.status || 'draft',
    default_commission_bps: a.default_commission_bps,
    agreement_date: a.agreement_date,
    effective_date: a.effective_date,
    expiry_date: a.expiry_date,
    special_terms: a.special_terms,
    signed_date: a.signed_date,
    created_at: a.created_at,
    updated_at: a.updated_at,
  }))

  // Calculate metrics
  const totalIntroductions = introductions.length
  const successfulAllocations = introductions.filter(i =>
    ['allocated', 'converted'].includes(i.status)
  ).length
  const conversionRate = totalIntroductions > 0
    ? (successfulAllocations / totalIntroductions) * 100
    : 0

  const totalCommissionPaid = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.accrual_amount, 0)

  const pendingCommission = commissions
    .filter(c => c.status === 'accrued' || c.status === 'invoiced')
    .reduce((sum, c) => sum + c.accrual_amount, 0)

  const metrics = {
    totalIntroductions,
    successfulAllocations,
    conversionRate,
    totalCommissionPaid,
    pendingCommission,
  }

  const introducerData = introducer as IntroducerDetail

  return (
    <IntroducerDetailClient
      introducer={introducerData}
      metrics={metrics}
      introductions={introductions}
      commissions={commissions}
      agreements={agreements}
    />
  )
}
