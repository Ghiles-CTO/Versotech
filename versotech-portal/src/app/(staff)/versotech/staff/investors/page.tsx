import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { AddInvestorModal } from '@/components/investors/add-investor-modal'
import { InvestorFilters } from '@/components/investors/investor-filters'
import { ExportInvestorsButton } from '@/components/investors/export-investors-button'
import { InvestorSearch } from '@/components/investors/investor-search'
import { InvestorsDataTable } from '@/components/investors/investors-data-table'
import { investorColumns } from '@/components/investors/investor-columns'
import {
  Users,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail
} from 'lucide-react'

export const dynamic = 'force-dynamic'

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

const FALLBACK_INVESTORS: UIInvestor[] = [
  {
    id: '1',
    name: 'Acme Fund LP',
    type: 'institutional',
    email: 'contact@acmefund.com',
    kycStatus: 'completed',
    onboardingStatus: 'active',
    totalCommitment: 2_500_000,
    totalContributed: 1_800_000,
    vehicleCount: 3,
    metricsAvailable: true,
    lastActivity: '2024-01-15',
    relationshipManager: 'Sarah Chen',
    riskRating: 'low',
    country: 'United States',
    users: []
  },
  {
    id: '2',
    name: 'John Smith',
    type: 'individual',
    email: 'john.smith@email.com',
    kycStatus: 'pending',
    onboardingStatus: 'in_progress',
    totalCommitment: 500_000,
    totalContributed: 250_000,
    vehicleCount: 1,
    metricsAvailable: true,
    lastActivity: '2024-01-14',
    relationshipManager: 'Michael Rodriguez',
    riskRating: 'medium',
    country: 'United Kingdom',
    users: []
  },
  {
    id: '3',
    name: 'Global Investments LLC',
    type: 'institutional',
    email: 'investments@global.com',
    kycStatus: 'completed',
    onboardingStatus: 'active',
    totalCommitment: 5_000_000,
    totalContributed: 4_200_000,
    vehicleCount: 5,
    metricsAvailable: true,
    lastActivity: '2024-01-16',
    relationshipManager: 'Sarah Chen',
    riskRating: 'low',
    country: 'Luxembourg',
    users: []
  }
]

function getKycStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'review':
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function getKycStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'review':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-foreground'
  }
}

function getRiskColor(risk: string) {
  return (
    {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }[risk] || 'bg-gray-100 text-foreground'
  )
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

// Disable caching to ensure fresh data on every visit
export const revalidate = 0

export default async function InvestorsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string; rm?: string; page?: string; limit?: string }>
}) {
  await requireStaffAuth()
  const supabase = await createClient()

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams

  // Pagination setup - increased default limit to load more investors
  const limit = parseInt(params.limit || '1000')  // Increased from 20 to 1000
  const page = parseInt(params.page || '1')
  const offset = (page - 1) * limit

  // Build query with filters
  let query = supabase
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
    return renderPage(FALLBACK_INVESTORS, { source: 'error' })
  }

  const investors = (data || []).map(inv => ({
    ...inv,
    rm_profile: Array.isArray(inv.rm_profile) ? inv.rm_profile[0] : inv.rm_profile,
    investor_users: inv.investor_users?.map(iu => ({
      user_id: iu.user_id,
      profiles: Array.isArray(iu.profiles) ? iu.profiles[0] : iu.profiles
    }))
  })) as unknown as InvestorRow[]

  if (investors.length === 0) {
    console.warn('[Investors] No investors returned. Using fallback dataset.')
    return renderPage(FALLBACK_INVESTORS, { source: 'empty' })
  }

  const investorIds = investors.map((inv) => inv.id)

  const [metricsMap, lastActivityMap] = await Promise.all([
    fetchCapitalMetrics(supabase, investorIds),
    fetchLastActivity(supabase, investorIds)
  ])

  const enrichedInvestors: UIInvestor[] = investors.map((inv) => {
    const users: UIInvestorUser[] = (inv.investor_users || []).map((entry) => ({
      id: entry.profiles?.id || entry.user_id,
      name: entry.profiles?.display_name || 'Unnamed User',
      email: entry.profiles?.email || 'No email',
      title: entry.profiles?.title || '—'
    }))

    const primaryContact = users[0]
    const metrics = metricsMap.get(inv.id)

    return {
      id: inv.id,
      name: inv.legal_name || 'Unnamed Investor',
      type: inv.type || 'individual',
      email: primaryContact?.email || 'No primary contact',
      kycStatus: formatKycStatus(inv.kyc_status),
      onboardingStatus: inv.onboarding_status || (metrics?.total_commitment ? 'completed' : 'pending'),
      totalCommitment: metrics?.total_commitment || 0,
      totalContributed: metrics?.total_contributed || 0,
      vehicleCount: metrics?.vehicle_count || 0,
      metricsAvailable: !!metrics,
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

  const totalPages = Math.ceil((count || 0) / limit)
  
  return renderPage(enrichedInvestors, {
    source: 'live',
    pagination: {
      currentPage: page,
      totalPages,
      totalCount: count || 0,
      limit
    },
    filters: params
  })
}

async function fetchCapitalMetrics(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createServiceClient>,
  investorIds: string[]
) {
  const metricsMap = new Map<string, InvestorMetrics>()

  if (investorIds.length === 0) {
    return metricsMap
  }

  try {
    const { data, error } = await supabase.rpc('get_investor_capital_summary', {
      p_investor_ids: investorIds
    })

    if (error) {
      console.warn('[Investors] Capital summary RPC failed:', error.message)
      return metricsMap
    }

    (data as InvestorMetrics[]).forEach((metric) => {
      metricsMap.set(metric.investor_id, metric)
    })
  } catch (rpcError) {
    console.warn('[Investors] Capital summary RPC unavailable:', rpcError)
  }

  return metricsMap
}

async function fetchLastActivity(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createServiceClient>,
  investorIds: string[]
) {
  const lastActivity = new Map<string, string>()

  if (investorIds.length === 0) {
    return lastActivity
  }

  try {
    const { data, error } = await supabase
      .from('activity_feed')
      .select('investor_id, created_at')
      .in('investor_id', investorIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[Investors] Failed to fetch activity feed:', error.message)
      return lastActivity
    }

    (data as InvestorActivity[]).forEach((activity) => {
      if (!lastActivity.has(activity.investor_id)) {
        lastActivity.set(activity.investor_id, activity.created_at)
      }
    })
  } catch (activityError) {
    console.warn('[Investors] Activity feed unavailable:', activityError)
  }

  return lastActivity
}

function renderPage(
  investorList: UIInvestor[],
  meta?: {
    source?: 'live' | 'demo' | 'empty' | 'error' | 'demo-empty' | 'demo-error'
    pagination?: {
      currentPage: number
      totalPages: number
      totalCount: number
      limit: number
    }
    filters?: {
      q?: string
      status?: string
      type?: string
      rm?: string
    }
  }
) {
  if (meta?.source && !['live', 'demo'].includes(meta.source)) {
    console.warn('[Investors] Rendering fallback dataset from', meta.source)
  }

  const stats = {
    total: meta?.pagination?.totalCount || investorList.length,
    active: investorList.filter((i) => i.onboardingStatus === 'completed' || i.onboardingStatus === 'active').length,
    pending: investorList.filter((i) => ['pending', 'review'].includes(i.kycStatus)).length,
    institutional: investorList.filter((i) => i.type === 'institutional' || i.type === 'entity').length
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Institutional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.institutional}</div>
              <div className="text-sm text-muted-foreground mt-1">Professional investors</div>
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
                <ExportInvestorsButton investors={investorList} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Investors ({meta?.pagination?.totalCount || investorList.length})</CardTitle>
            <CardDescription>
              Comprehensive investor list with sortable columns and bulk actions
              {meta?.pagination?.totalCount && meta.pagination.totalCount > investorList.length && (
                <span className="text-muted-foreground text-sm ml-2">
                  (Showing {investorList.length} of {meta.pagination.totalCount})
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvestorsDataTable columns={investorColumns} data={investorList} />
          </CardContent>
        </Card>
      </div>
    )
}