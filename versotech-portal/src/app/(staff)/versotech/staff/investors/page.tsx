import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { AddInvestorModal } from '@/components/investors/add-investor-modal'
import { InvestorFilters } from '@/components/investors/investor-filters'
import { ExportInvestorsButton } from '@/components/investors/export-investors-button'
import {
  Users,
  Search,
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

  // Pagination setup
  const limit = parseInt(params.limit || '20')
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
          profiles (
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
    <AppLayout brand="versotech">
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
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search investors by name, email, or ID..." className="pl-10" />
                </div>
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
            <CardTitle>All Investors</CardTitle>
            <CardDescription>Complete list of investors with linked users and key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investorList.map((investor) => (
                <div
                  key={investor.id}
                  className="border border-gray-800 rounded-lg p-4 hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-950/30 rounded-lg flex items-center justify-center border border-blue-800">
                        <Users className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{investor.name}</h3>
                          <Badge variant="outline" className="text-xs capitalize">
                            {investor.type}
                          </Badge>
                          {getKycStatusIcon(investor.kycStatus)}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {investor.email}
                          </span>
                          <span className="hidden sm:block">•</span>
                          <span>{investor.country}</span>
                          <span className="hidden sm:block">•</span>
                          <span>RM: {investor.relationshipManager}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(investor.totalCommitment)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {investor.totalCommitment > 0
                            ? `${Math.round((investor.totalContributed / investor.totalCommitment) * 100)}% funded`
                            : 'No contributions yet'}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Badge className={getKycStatusColor(investor.kycStatus)}>
                          KYC: {investor.kycStatus}
                        </Badge>
                        <Badge className={getRiskColor(investor.riskRating)}>
                          Risk: {investor.riskRating}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/versotech/staff/investors/${investor.id}`}>
                          <Button variant="outline" size="sm" className="bg-white text-black hover:bg-gray-100">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">{investor.vehicleCount}</strong> vehicles
                      </span>
                      <span className="text-muted-foreground">
                        Last activity:{' '}
                        <strong className="text-foreground">
                          {new Date(investor.lastActivity).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">Investor Users</h4>
                      </div>
                      {investor.users.length > 0 ? (
                        <div className="space-y-2">
                          {investor.users.map((user) => (
                            <div
                              key={user.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-md border border-gray-800 p-3"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">{user.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {user.email} • {user.title}
                                </p>
                              </div>
                              <Badge variant="outline" className="self-start sm:self-center text-xs">
                                Portal User
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No linked users yet. Invite team members or investor contacts to collaborate.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          {meta?.pagination && meta.pagination.totalPages > 1 && (
            <CardContent className="pt-0">
              <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((meta.pagination.currentPage - 1) * meta.pagination.limit) + 1} to{' '}
                  {Math.min(meta.pagination.currentPage * meta.pagination.limit, meta.pagination.totalCount)} of{' '}
                  {meta.pagination.totalCount} investors
                </div>
                <div className="flex gap-2">
                  {meta.pagination.currentPage > 1 && (
                    <Link href={`?page=${meta.pagination.currentPage - 1}${meta.filters?.q ? `&q=${meta.filters.q}` : ''}${meta.filters?.status ? `&status=${meta.filters.status}` : ''}${meta.filters?.type ? `&type=${meta.filters.type}` : ''}${meta.filters?.rm ? `&rm=${meta.filters.rm}` : ''}`}>
                      <Button variant="outline" size="sm">
                        Previous
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center gap-2">
                    {[...Array(Math.min(5, meta.pagination.totalPages))].map((_, i) => {
                      const pageNum = i + 1
                      return (
                        <Link key={pageNum} href={`?page=${pageNum}${meta.filters?.q ? `&q=${meta.filters.q}` : ''}${meta.filters?.status ? `&status=${meta.filters.status}` : ''}${meta.filters?.type ? `&type=${meta.filters.type}` : ''}${meta.filters?.rm ? `&rm=${meta.filters.rm}` : ''}`}>
                          <Button 
                            variant={meta.pagination?.currentPage === pageNum ? 'default' : 'outline'} 
                            size="sm"
                          >
                            {pageNum}
                          </Button>
                        </Link>
                      )
                    })}
                    {meta.pagination.totalPages > 5 && <span className="px-2">...</span>}
                  </div>
                  {meta.pagination.currentPage < meta.pagination.totalPages && (
                    <Link href={`?page=${meta.pagination.currentPage + 1}${meta.filters?.q ? `&q=${meta.filters.q}` : ''}${meta.filters?.status ? `&status=${meta.filters.status}` : ''}${meta.filters?.type ? `&type=${meta.filters.type}` : ''}${meta.filters?.rm ? `&rm=${meta.filters.rm}` : ''}`}>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}