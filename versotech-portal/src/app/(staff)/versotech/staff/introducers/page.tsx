import { AppLayout } from '@/components/layout/app-layout'
import { IntroducersDashboard, type IntroducersDashboardProps } from '@/components/staff/introducers/introducers-dashboard'
import { AddIntroducerProvider } from '@/components/staff/introducers/add-introducer-context'
import { AddIntroducerDialog } from '@/components/staff/introducers/add-introducer-dialog'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { requireStaffAuth } from '@/lib/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddIntroducerDialogWrapper } from '@/components/staff/introducers/add-introducer-dialog-wrapper'

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
  prospect_email: string | null
  status: string | null
  introduced_at: string | null
  introducer: { legal_name: string | null } | null
  deal: { name: string | null } | null
}

export default async function IntroducersPage() {
  await requireStaffAuth()
  const supabase = await createClient()
  
  const { user } = await getAuthenticatedUser(supabase)
  if (!user) {
    redirect('/versotech/login')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !profile.role.startsWith('staff_')) {
    redirect('/versotech/staff')
  }
  
  // Use service client for data fetching (bypasses RLS)
  const serviceSupabase = createServiceClient()

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

  const { data: recentData, error: recentError } = await serviceSupabase
    .from('introductions')
    .select(
      `
        id,
        prospect_email,
        status,
        introduced_at,
        introducer:introducers ( legal_name ),
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
      const record = entry as RecentIntroductionRecord
      const commission = record.id ? commissionLookup.get(record.id) : undefined

      return {
        id: record.id,
        introducerName: record.introducer?.legal_name ?? 'Unknown Introducer',
        prospectEmail: record.prospect_email ?? 'Unknown prospect',
        dealName: record.deal?.name ?? 'Untitled deal',
        status: record.status ?? 'invited',
        introducedAt: record.introduced_at,
        commissionAmount: commission?.amount ?? null,
        commissionStatus: commission?.status ?? null,
      }
    })

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

  return (
    <AppLayout brand="versotech">
      <AddIntroducerProvider>
        <IntroducersDashboard
          summary={summary}
          introducers={introducers}
          recentIntroductions={recentIntroductions}
          isDemo={false}
        />
        <AddIntroducerDialog />
      </AddIntroducerProvider>
    </AppLayout>
  )
}

