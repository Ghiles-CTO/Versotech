import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { InvestorDetailClient } from '@/components/investors/investor-detail-client'

export const dynamic = 'force-dynamic'

type InvestorDetail = {
  id: string
  legal_name: string
  display_name: string | null
  type: string
  email: string | null
  phone: string | null
  country: string | null
  country_of_incorporation: string | null
  tax_residency: string | null
  kyc_status: string
  status: string
  onboarding_status: string
  aml_risk_rating: string | null
  is_pep: boolean
  is_sanctioned: boolean
  created_at: string
  primary_rm_profile: {
    id: string
    display_name: string
    email: string
  } | null
  investor_users: Array<{
    user_id: string
    profiles: {
      id: string
      display_name: string
      email: string
      title: string
      role: string
    } | null
  }>
}

type CapitalMetrics = {
  total_commitment: number
  total_contributed: number
  total_distributed: number
  unfunded_commitment: number
  current_nav: number
  vehicle_count: number
}

// Disable caching to ensure fresh data on every visit
export const revalidate = 0

export default async function InvestorDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  await requireStaffAuth()
  const supabase = await createClient()

  // Fetch investor details
  const { data: investor, error } = await supabase
    .from('investors')
    .select(`
      *,
      primary_rm_profile:profiles!investors_primary_rm_fkey (
        id,
        display_name,
        email
      ),
      investor_users (
        user_id,
        profiles:profiles!investor_users_user_id_fkey (
          id,
          display_name,
          email,
          title,
          role
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !investor) {
    console.error('[Investor Detail] Error:', error)
    notFound()
  }

  // Fetch capital metrics
  let capitalMetrics: CapitalMetrics = {
    total_commitment: 0,
    total_contributed: 0,
    total_distributed: 0,
    unfunded_commitment: 0,
    current_nav: 0,
    vehicle_count: 0
  }

  try {
    const { data: metricsData, error: metricsError } = await supabase
      .rpc('get_investor_capital_summary', {
        p_investor_ids: [id]
      })

    if (metricsError) {
      console.error('[Investor Detail] Capital metrics error:', metricsError)
    } else if (metricsData && metricsData.length > 0) {
      const metrics = metricsData[0]
      capitalMetrics = {
        total_commitment: Number(metrics.total_commitment) || 0,
        total_contributed: Number(metrics.total_contributed) || 0,
        total_distributed: Number(metrics.total_distributed) || 0,
        unfunded_commitment: Number(metrics.unfunded_commitment) || 0,
        current_nav: Number(metrics.current_nav) || 0,
        vehicle_count: Number(metrics.vehicle_count) || 0
      }
    }
  } catch (err) {
    console.error('[Investor Detail] Capital metrics exception:', err)
  }

  const investorData = investor as unknown as InvestorDetail

  return (
    <InvestorDetailClient
      investor={investorData}
      capitalMetrics={capitalMetrics}
    />
  )
}
