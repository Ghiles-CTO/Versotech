import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { InvestorDetailClient } from '@/components/investors/investor-detail-client'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

/**
 * Investor Detail Page for Unified Portal (versotech_main)
 *
 * Persona-aware access:
 * - Staff/CEO personas: Full access to investor details
 * - Other personas: Access denied
 */
export default async function InvestorDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    redirect('/versotech_main/login')
  }

  // Check if user has staff persona for access
  const serviceSupabase = createServiceClient()
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const hasStaffAccess = personas?.some(
    (p: any) => p.persona_type === 'staff'
  ) || false

  if (!hasStaffAccess) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Investor details are only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Fetch investor details
  const { data: investor, error } = await serviceSupabase
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
        profiles (
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
    const { data: metricsData, error: metricsError } = await serviceSupabase
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
