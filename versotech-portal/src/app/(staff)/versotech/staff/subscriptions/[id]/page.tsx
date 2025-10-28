import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { SubscriptionDetailClient } from '@/components/subscriptions/subscription-detail-client'

export const dynamic = 'force-dynamic'

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  await requireStaffAuth()
  const supabase = await createClient()

  // Fetch subscription with all related data
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select(
      `
        *,
        investor:investors (
          id,
          legal_name,
          display_name,
          type,
          country,
          email,
          phone,
          kyc_status,
          status,
          aml_risk_rating,
          is_pep,
          primary_rm,
          primary_rm_profile:profiles!investors_primary_rm_fkey (
            id,
            display_name,
            email
          )
        ),
        vehicle:vehicles (
          id,
          name,
          entity_code,
          type,
          currency,
          status,
          domicile,
          formation_date
        )
      `
    )
    .eq('id', id)
    .single()

  if (error || !subscription) {
    console.error('[Subscription Detail] Error:', error)
    notFound()
  }

  // Fetch capital activity (cashflows)
  const { data: cashflows } = await supabase
    .from('cashflows')
    .select('*')
    .eq('investor_id', subscription.investor_id)
    .eq('vehicle_id', subscription.vehicle_id)
    .order('date', { ascending: false })

  // Fetch capital calls related to this vehicle
  const { data: capitalCalls } = await supabase
    .from('capital_calls')
    .select('*')
    .eq('vehicle_id', subscription.vehicle_id)
    .order('due_date', { ascending: false })

  // Fetch distributions related to this vehicle
  const { data: distributions } = await supabase
    .from('distributions')
    .select('*')
    .eq('vehicle_id', subscription.vehicle_id)
    .order('date', { ascending: false })

  // Calculate metrics
  const contributions = cashflows?.filter((cf) => cf.type === 'contribution') || []
  const distributionsFlow = cashflows?.filter((cf) => cf.type === 'distribution') || []

  const total_contributed = contributions.reduce((sum, cf) => sum + Number(cf.amount), 0)
  const total_distributed = distributionsFlow.reduce((sum, cf) => sum + Number(cf.amount), 0)
  const unfunded_commitment = Number(subscription.commitment) - total_contributed
  const current_nav = total_contributed - total_distributed

  const metrics = {
    total_commitment: Number(subscription.commitment),
    total_contributed,
    total_distributed,
    unfunded_commitment,
    current_nav,
    total_calls: capitalCalls?.length || 0,
    pending_calls: capitalCalls?.filter((cc) => cc.status === 'pending')?.length || 0,
  }

  return (
    <SubscriptionDetailClient
      subscription={subscription}
      cashflows={cashflows || []}
      capitalCalls={capitalCalls || []}
      distributions={distributions || []}
      metrics={metrics}
    />
  )
}
