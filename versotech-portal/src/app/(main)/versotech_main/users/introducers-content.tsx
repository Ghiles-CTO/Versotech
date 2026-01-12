'use client'

import { useEffect, useState } from 'react'
import { IntroducersDashboard, type IntroducersDashboardProps } from '@/components/staff/introducers/introducers-dashboard'
import { AddIntroducerProvider } from '@/components/staff/introducers/add-introducer-context'
import { AddIntroducerDialog } from '@/components/staff/introducers/add-introducer-dialog'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
  fee_plans?: Array<{
    id: string
    status: string | null
    is_active: boolean | null
  }> | null
}

export default function IntroducersContent() {
  const [introducers, setIntroducers] = useState<IntroducersDashboardProps['introducers']>([])
  const [recentIntroductions, setRecentIntroductions] = useState<IntroducersDashboardProps['recentIntroductions']>([])
  const [summary, setSummary] = useState<IntroducersDashboardProps['summary']>({
    totalIntroducers: 0,
    activeIntroducers: 0,
    totalIntroductions: 0,
    totalAllocations: 0,
    totalCommissionPaid: 0,
    pendingCommission: 0,
  })
  const [deals, setDeals] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIntroducers() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch introducers data
        const { data: introducersData, error: introducersError } = await supabase
          .from('introducers')
          .select(`
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
            ),
            fee_plans (
              id,
              status,
              is_active
            )
          `)
          .order('created_at', { ascending: false })

        if (introducersError) throw introducersError

        const introducersRecords = (introducersData ?? []) as IntroducerRecord[]
        const commissionLookup = new Map<string, { amount: number; status: string | null }>()

        const processedIntroducers: IntroducersDashboardProps['introducers'] = introducersRecords.map((record) => {
          const introductions = Array.isArray(record.introductions) ? record.introductions : []
          const commissions = Array.isArray(record.introducer_commissions) ? record.introducer_commissions : []
          const feePlansData = Array.isArray(record.fee_plans) ? record.fee_plans : []

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

          // Calculate fee plan counts
          const feePlans = {
            total: feePlansData.length,
            accepted: feePlansData.filter((fp) => fp?.status === 'accepted').length,
            pending: feePlansData.filter((fp) =>
              fp?.status === 'sent' || fp?.status === 'pending_signature' || fp?.status === 'draft'
            ).length,
          }

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
            feePlans,
          }
        })

        setIntroducers(processedIntroducers)

        // Fetch recent introductions
        const { data: recentData } = await supabase
          .from('introductions')
          .select(`
            id,
            introducer_id,
            prospect_email,
            deal_id,
            status,
            introduced_at,
            commission_rate_override_bps,
            notes,
            introducer:introducers ( legal_name ),
            deal:deals ( name )
          `)
          .order('introduced_at', { ascending: false })
          .limit(10)

        const processedRecent: IntroducersDashboardProps['recentIntroductions'] = (recentData ?? [])
          .filter(Boolean)
          .map((entry: any) => {
            const commission = entry.id ? commissionLookup.get(entry.id) : undefined
            return {
              id: entry.id,
              introducerId: entry.introducer_id ?? undefined,
              introducerName: entry.introducer?.legal_name ?? 'Unknown Introducer',
              prospectEmail: entry.prospect_email ?? 'VERSO BI',
              dealId: entry.deal_id ?? undefined,
              dealName: entry.deal?.name ?? 'Untitled deal',
              status: entry.status ?? 'invited',
              introducedAt: entry.introduced_at,
              commissionAmount: commission?.amount ?? null,
              commissionStatus: commission?.status ?? null,
              commissionRateOverrideBps: entry.commission_rate_override_bps ?? null,
              notes: entry.notes ?? null,
            }
          })

        setRecentIntroductions(processedRecent)

        // Calculate summary
        const calculatedSummary = processedIntroducers.reduce<IntroducersDashboardProps['summary']>(
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

        setSummary(calculatedSummary)

        // Fetch deals for introduction dialog
        const { data: dealsData } = await supabase
          .from('deals')
          .select('id, name')
          .in('status', ['draft', 'open', 'allocation_pending'])
          .order('name', { ascending: true })

        setDeals((dealsData ?? []).map((d: any) => ({ id: d.id, name: d.name || 'Untitled Deal' })))

        setError(null)
      } catch (err) {
        console.error('[IntroducersContent] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load introducers')
      } finally {
        setLoading(false)
      }
    }

    fetchIntroducers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading introducers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Introducers</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <AddIntroducerProvider>
      <IntroducersDashboard
        summary={summary}
        introducers={introducers}
        recentIntroductions={recentIntroductions}
        deals={deals}
        isDemo={false}
      />
      <AddIntroducerDialog />
    </AddIntroducerProvider>
  )
}
