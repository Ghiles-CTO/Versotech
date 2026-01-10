import { IntroducersDashboard, type IntroducersDashboardProps } from '@/components/staff/introducers/introducers-dashboard'
import { AddIntroducerProvider } from '@/components/staff/introducers/add-introducer-context'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type IntroducerRecord = {
  id: string
  legal_name: string | null
  contact_name: string | null
  email: string | null
  default_commission_bps: number | null
  commission_cap_amount: number | string | null
  payment_terms: string | null
  status: string | null
  created_at: string | null
  introductions?: Array<{
    id: string
    status: string | null
    introduced_at: string | null
    deal_id: string | null
  }> | null
  introducer_commissions?: Array<{
    id: string
    introduction_id: string | null
    accrual_amount: number | string | null
    status: string | null
    created_at: string | null
    paid_at: string | null
  }> | null
}

type RecentIntroductionRecord = {
  id: string
  introducer_id: string | null
  prospect_email: string | null
  prospect_investor_id: string | null
  deal_id: string | null
  status: string | null
  introduced_at: string | null
  commission_rate_override_bps: number | null
  notes: string | null
  introducer: { legal_name: string | null } | null
  prospect_investor: { legal_name: string | null } | null
  deal: { name: string | null } | null
}

/**
 * Introducers Page for Unified Portal (versotech_main)
 *
 * Persona-aware introducer management:
 * - Staff/CEO personas: Full access to introducers
 * - Other personas: Access denied
 */
export default async function IntroducersPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to view introducers.
          </p>
        </div>
      </div>
    )
  }

  // Check if user has staff/CEO persona for full access
  const hasStaffAccess = await checkStaffAccess(user.id)
  const serviceSupabase = createServiceClient()

  if (!hasStaffAccess) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Introducers management is only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Fetch introducers data
  const { data: introducersData, error: introducersError } = await serviceSupabase
    .from('introducers')
    .select(
      `
        id,
        legal_name,
        contact_name,
        email,
        default_commission_bps,
        commission_cap_amount,
        payment_terms,
        status,
        created_at,
        introductions (
          id,
          status,
          introduced_at,
          deal_id
        ),
        introducer_commissions (
          id,
          introduction_id,
          accrual_amount,
          status,
          created_at,
          paid_at
        )
      `
    )
    .order('created_at', { ascending: false })

  if (introducersError) {
    console.error('[Introducers] Failed to fetch introducers', introducersError)
  }

  const introducersRecords = (introducersData ?? []) as IntroducerRecord[]
  const commissionLookup = new Map<string, { amount: number; status: string | null }>()

  const introducers: IntroducersDashboardProps['introducers'] = introducersRecords.map((record) => {
    const introductions = Array.isArray(record.introductions) ? record.introductions : []
    const commissions = Array.isArray(record.introducer_commissions) ? record.introducer_commissions : []

    let latestIntroduction: string | null = null

    introductions.forEach((intro) => {
      if (!intro) return
      const introducedAt = intro.introduced_at || null
      if (!latestIntroduction) {
        latestIntroduction = introducedAt
      } else if (introducedAt && new Date(introducedAt).getTime() > new Date(latestIntroduction).getTime()) {
        latestIntroduction = introducedAt
      }
    })

    let totalCommissionPaid = 0
    let pendingCommission = 0

    commissions.forEach((commission) => {
      if (!commission) return
      const amount = Number(commission.accrual_amount ?? 0)

      if (commission.introduction_id) {
        commissionLookup.set(commission.introduction_id, { amount, status: commission.status ?? null })
      }

      if (commission.status === 'paid') {
        totalCommissionPaid += amount
      }

      if (commission.status === 'accrued' || commission.status === 'invoiced') {
        pendingCommission += amount
      }
    })

    const successfulAllocations = introductions.filter((intro) => intro?.status === 'allocated').length

    return {
      id: record.id,
      legalName: record.legal_name ?? 'Unnamed Introducer',
      contactName: record.contact_name,
      email: record.email,
      defaultCommissionBps: record.default_commission_bps ?? 0,
      commissionCapAmount: record.commission_cap_amount ? Number(record.commission_cap_amount) : null,
      paymentTerms: record.payment_terms,
      status: record.status ?? 'active',
      createdAt: record.created_at,
      totalIntroductions: introductions.length,
      successfulAllocations,
      totalCommissionPaid,
      pendingCommission,
      lastIntroductionAt: latestIntroduction,
    }
  })

  // Fetch recent introductions
  const { data: recentData, error: recentError } = await serviceSupabase
    .from('introductions')
    .select(
      `
        id,
        introducer_id,
        prospect_email,
        prospect_investor_id,
        deal_id,
        status,
        introduced_at,
        commission_rate_override_bps,
        notes,
        introducer:introducers ( legal_name ),
        prospect_investor:investors!introductions_prospect_investor_id_fkey ( legal_name ),
        deal:deals ( name )
      `
    )
    .order('introduced_at', { ascending: false })
    .limit(10)

  if (recentError) {
    console.error('[Introducers] Failed to fetch recent introductions', recentError)
  }

  const recentIntroductions: IntroducersDashboardProps['recentIntroductions'] = (recentData ?? [])
    .filter(Boolean)
    .map((entry) => {
      const record = entry as unknown as RecentIntroductionRecord
      const commission = record.id ? commissionLookup.get(record.id) : undefined

      return {
        id: record.id,
        introducerId: record.introducer_id ?? undefined,
        introducerName: record.introducer?.legal_name ?? 'Unknown Introducer',
        prospectEmail: record.prospect_investor?.legal_name ?? record.prospect_email ?? 'VERSO BI',
        dealId: record.deal_id ?? undefined,
        dealName: record.deal?.name ?? 'Untitled deal',
        status: record.status ?? 'invited',
        introducedAt: record.introduced_at,
        commissionAmount: commission?.amount ?? null,
        commissionStatus: commission?.status ?? null,
        commissionRateOverrideBps: record.commission_rate_override_bps ?? null,
        notes: record.notes ?? null,
      }
    })

  // Calculate summary
  const summary = introducers.reduce<IntroducersDashboardProps['summary']>(
    (acc, introducer) => {
      acc.totalIntroducers += 1
      if (introducer.status === 'active') {
        acc.activeIntroducers += 1
      }
      acc.totalIntroductions += introducer.totalIntroductions
      acc.totalAllocations += introducer.successfulAllocations
      acc.totalCommissionPaid += introducer.totalCommissionPaid
      acc.pendingCommission += introducer.pendingCommission
      return acc
    },
    {
      totalIntroducers: 0,
      activeIntroducers: 0,
      totalIntroductions: 0,
      totalAllocations: 0,
      totalCommissionPaid: 0,
      pendingCommission: 0,
    }
  )

  // Fetch deals for introduction dialog
  const { data: dealsData } = await serviceSupabase
    .from('deals')
    .select('id, name')
    .in('status', ['draft', 'open', 'allocation_pending'])
    .order('name', { ascending: true })

  const deals = (dealsData ?? []).map((d) => ({ id: d.id, name: d.name || 'Untitled Deal' }))

  return (
    <div className="p-6">
      <AddIntroducerProvider>
        <IntroducersDashboard
          summary={summary}
          introducers={introducers}
          recentIntroductions={recentIntroductions}
          deals={deals}
          isDemo={false}
          showAddButtons={false}
        />
      </AddIntroducerProvider>
    </div>
  )
}
