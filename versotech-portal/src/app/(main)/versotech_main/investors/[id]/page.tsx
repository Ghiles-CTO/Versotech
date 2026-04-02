import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { InvestorDetailClient } from '@/components/investors/investor-detail-client'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ViewerType = 'staff' | 'arranger'

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
  const hasStaffAccess = await checkStaffAccess(user.id)
  const serviceSupabase = createServiceClient()
  const [{ data: profile }, { data: arrangerLinks }] = await Promise.all([
    serviceSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle(),
    serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id),
  ])

  const arrangerIds = (arrangerLinks || []).map((link) => link.arranger_id)
  const isArranger = arrangerIds.length > 0
  const viewerType: ViewerType | null = hasStaffAccess ? 'staff' : isArranger ? 'arranger' : null
  const canViewSpread =
    profile?.role === 'ceo' ||
    profile?.role === 'staff_admin' ||
    isArranger

  if (!viewerType) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Investor details are only available to staff members and authorized arrangers.
          </p>
        </div>
      </div>
    )
  }

  if (viewerType === 'arranger') {
    const { data: arrangerDeals, error: arrangerDealsError } = await serviceSupabase
      .from('deals')
      .select('id')
      .in('arranger_entity_id', arrangerIds)

    if (arrangerDealsError) {
      console.error('[Investor Detail] Failed to resolve arranger deals:', arrangerDealsError)
      notFound()
    }

    const managedDealIds = (arrangerDeals || []).map((deal) => deal.id)

    if (managedDealIds.length === 0) {
      notFound()
    }

    const { data: visibleSubscription, error: subscriptionAccessError } = await serviceSupabase
      .from('subscriptions')
      .select('id')
      .eq('investor_id', id)
      .in('deal_id', managedDealIds)
      .limit(1)
      .maybeSingle()

    if (subscriptionAccessError) {
      console.error('[Investor Detail] Failed arranger investor access check:', subscriptionAccessError)
      notFound()
    }

    if (!visibleSubscription) {
      notFound()
    }
  }

  const investorSelect =
    viewerType === 'staff'
      ? `
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
        `
      : `
          id,
          legal_name,
          display_name,
          type,
          kyc_status,
          status,
          onboarding_status,
          aml_risk_rating,
          is_pep,
          is_sanctioned,
          created_at
        `

  // Fetch investor details
  const investorResult: {
    data: Record<string, any> | null
    error: unknown
  } = await (serviceSupabase as any)
    .from('investors')
    .select(investorSelect)
    .eq('id', id)
    .single()

  const investor = investorResult.data
  const error = investorResult.error

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
  let metricsAvailable = false

  if (viewerType === 'staff') {
    try {
      const { data: metricsData, error: metricsError } = await serviceSupabase
        .rpc('get_investor_capital_summary', {
          p_investor_ids: [id]
        })

      if (metricsError) {
        console.error('[Investor Detail] Capital metrics error:', metricsError)
      } else if (metricsData && metricsData.length > 0) {
        const metrics = metricsData[0]
        metricsAvailable = true
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
  }

  const investorData = {
    ...investor,
    email: viewerType === 'staff' ? investor.email ?? null : null,
    phone: viewerType === 'staff' ? investor.phone ?? null : null,
    country: viewerType === 'staff' ? investor.country ?? null : null,
    country_of_incorporation:
      viewerType === 'staff' ? investor.country_of_incorporation ?? null : null,
    tax_residency: viewerType === 'staff' ? investor.tax_residency ?? null : null,
    primary_rm_profile:
      viewerType === 'staff' ? investor.primary_rm_profile ?? null : null,
    investor_users:
      viewerType === 'staff' ? investor.investor_users ?? [] : [],
  } as unknown as InvestorDetail

  return (
    <InvestorDetailClient
      investor={investorData}
      capitalMetrics={capitalMetrics}
      metricsAvailable={metricsAvailable}
      viewerType={viewerType}
      canViewSpread={canViewSpread}
    />
  )
}
