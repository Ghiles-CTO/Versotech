import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkStaffAccess } from '@/lib/auth'
import { AddInvestorModal } from '@/components/investors/add-investor-modal'
import { InvestorFilters } from '@/components/investors/investor-filters'
import { ExportInvestorsButton } from '@/components/investors/export-investors-button'
import { InvestorSearch } from '@/components/investors/investor-search'
import { InvestorsDataTable } from '@/components/investors/investors-data-table'
import { investorColumns } from '@/components/investors/investor-columns'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type InvestorUserRow = {
  user_id: string
  profiles: {
    id: string
    display_name: string | null
    email: string | null
    title: string | null
    role: string | null
  } | null
}

type InvestorRow = {
  id: string
  legal_name: string | null
  type: string | null
  kyc_status: string | null
  country: string | null
  status: string | null
  onboarding_status: string | null
  aml_risk_rating: string | null
  created_at: string | null
  primary_rm: string | null
  rm_profile: {
    id: string
    display_name: string | null
    email: string | null
  } | null
  investor_users?: InvestorUserRow[] | null
}

type InvestorMetrics = {
  investor_id: string
  total_commitment: number | null
  total_contributed: number | null
  total_distributed: number | null
  unfunded_commitment: number | null
  current_nav: number | null
  vehicle_count: number | null
}

type InvestorActivity = {
  investor_id: string
  created_at: string
}

type UIInvestorUser = {
  id: string
  name: string
  email: string
  title: string
}

type UIInvestor = {
  id: string
  name: string
  type: string
  email: string
  kycStatus: string
  onboardingStatus: string
  totalCommitment: number
  totalContributed: number
  vehicleCount: number
  metricsAvailable: boolean
  lastActivity: string
  relationshipManager: string
  riskRating: string
  country: string
  users: UIInvestorUser[]
}

function formatKycStatus(status: string | null) {
  if (!status) return 'pending'
  const lower = status.toLowerCase()
  if (lower === 'approved') return 'completed'
  return lower
}

function inferRisk(status: string | null) {
  if (!status) return 'medium'
  return status.toLowerCase() === 'approved' ? 'low' : 'medium'
}

/**
 * Investors Page for Unified Portal (versotech_main)
 *
 * Persona-aware investor management:
 * - Staff/CEO personas: Full access to all investors
 * - Other personas: Access denied (redirect or empty state)
 */
export default async function InvestorsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string; rm?: string; page?: string; limit?: string }>
}) {
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
            Please log in to view investors.
          </p>
        </div>
      </div>
    )
  }

  // Check if user has staff/CEO access (via profile role or database personas)
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
            Investor management is only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  const params = await searchParams

  // Pagination setup
  const limit = parseInt(params.limit || '1000')
  const page = parseInt(params.page || '1')
  const offset = (page - 1) * limit

  // Build query with filters
  let query = serviceSupabase
    .from('investors')
    .select(
      `
        id,
        legal_name,
        type,
        kyc_status,
        country,
        status,
        onboarding_status,
        aml_risk_rating,
        created_at,
        primary_rm,
        rm_profile:profiles!investors_primary_rm_fkey (
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
      `,
      { count: 'exact' }
    )

  // Apply search filter
  if (params.q) {
    query = query.or(`legal_name.ilike.%${params.q}%,email.ilike.%${params.q}%`)
  }

  // Apply KYC status filter
  if (params.status) {
    query = query.eq('kyc_status', params.status)
  }

  // Apply investor type filter
  if (params.type) {
    query = query.eq('type', params.type)
  }

  // Apply relationship manager filter
  if (params.rm) {
    query = query.eq('primary_rm', params.rm)
  }

  // Apply pagination and sorting
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[Investors] Error fetching investors:', error)
  }

  const investors = (data || []).map(inv => ({
    ...inv,
    rm_profile: Array.isArray(inv.rm_profile) ? inv.rm_profile[0] : inv.rm_profile,
    investor_users: inv.investor_users?.map((iu: any) => ({
      user_id: iu.user_id,
      profiles: Array.isArray(iu.profiles) ? iu.profiles[0] : iu.profiles
    }))
  })) as unknown as InvestorRow[]

  const investorIds = investors.map((inv) => inv.id)

  // Fetch metrics and activity
  const metricsMap = new Map<string, InvestorMetrics>()
  const lastActivityMap = new Map<string, string>()
  let metricsFetchFailed = false

  if (investorIds.length > 0) {
    // Fetch capital metrics
    try {
      const { data: metricsData, error: metricsError } = await serviceSupabase.rpc('get_investor_capital_summary', {
        p_investor_ids: investorIds
      })
      if (metricsError) {
        metricsFetchFailed = true
        console.warn('[Investors] Capital summary RPC unavailable:', metricsError.message)
      }
      if (metricsData) {
        (metricsData as InvestorMetrics[]).forEach((metric) => {
          metricsMap.set(metric.investor_id, metric)
        })
      }
    } catch (e) {
      metricsFetchFailed = true
      console.warn('[Investors] Capital summary RPC unavailable')
    }

    // Fetch last activity
    try {
      const { data: activityData } = await serviceSupabase
        .from('activity_feed')
        .select('investor_id, created_at')
        .in('investor_id', investorIds)
        .order('created_at', { ascending: false })

      if (activityData) {
        (activityData as InvestorActivity[]).forEach((activity) => {
          if (!lastActivityMap.has(activity.investor_id)) {
            lastActivityMap.set(activity.investor_id, activity.created_at)
          }
        })
      }
    } catch (e) {
      console.warn('[Investors] Activity feed unavailable')
    }
  }

  const enrichedInvestors: UIInvestor[] = investors.map((inv) => {
    const users: UIInvestorUser[] = (inv.investor_users || []).map((entry) => ({
      id: entry.profiles?.id || entry.user_id,
      name: entry.profiles?.display_name || 'Unnamed User',
      email: entry.profiles?.email || 'No email',
      title: entry.profiles?.title || '-'
    }))

    const primaryContact = users[0]
    const metrics = metricsMap.get(inv.id)
    const metricsAvailable = !metricsFetchFailed && !!metrics

    return {
      id: inv.id,
      name: inv.legal_name || 'Unnamed Investor',
      type: inv.type || 'individual',
      email: primaryContact?.email || 'No primary contact',
      kycStatus: formatKycStatus(inv.kyc_status),
      onboardingStatus: inv.onboarding_status || (metricsAvailable && metrics?.total_commitment ? 'completed' : 'pending'),
      totalCommitment: metrics?.total_commitment || 0,
      totalContributed: metrics?.total_contributed || 0,
      vehicleCount: metrics?.vehicle_count || 0,
      metricsAvailable,
      lastActivity:
        lastActivityMap.get(inv.id) ||
        inv.created_at ||
        new Date().toISOString(),
      relationshipManager: inv.rm_profile?.display_name || 'Unassigned',
      riskRating: inv.aml_risk_rating || inferRisk(inv.kyc_status),
      country: inv.country || 'Unknown',
      users
    }
  })

  const stats = {
    total: count || enrichedInvestors.length,
    active: enrichedInvestors.filter((i) => i.onboardingStatus === 'completed' || i.onboardingStatus === 'active').length,
    pending: enrichedInvestors.filter((i) => ['pending', 'review'].includes(i.kycStatus)).length,
    entities: enrichedInvestors.filter((i) => i.type === 'entity').length,
    individuals: enrichedInvestors.filter((i) => i.type === 'individual').length
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investor Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage investor accounts, linked users, and onboarding status
          </p>
        </div>
        <AddInvestorModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground mt-1">Registered accounts</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            <div className="text-sm text-muted-foreground mt-1">Fully onboarded</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending KYC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-muted-foreground mt-1">Require attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.entities}</div>
            <div className="text-sm text-muted-foreground mt-1">Corporate investors</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Individuals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{stats.individuals}</div>
            <div className="text-sm text-muted-foreground mt-1">Natural persons</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <InvestorSearch />
            </div>
            <div className="flex gap-2">
              <InvestorFilters />
              <ExportInvestorsButton investors={enrichedInvestors} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Investors ({count || enrichedInvestors.length})</CardTitle>
          <CardDescription>
            Comprehensive investor list with sortable columns and bulk actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvestorsDataTable columns={investorColumns} data={enrichedInvestors} />
        </CardContent>
      </Card>
    </div>
  )
}
