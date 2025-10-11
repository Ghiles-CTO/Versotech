import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, Building2, Calendar, User, DollarSign } from 'lucide-react'
import { notFound } from 'next/navigation'
import { InvestorDetailActions } from '@/components/investors/investor-detail-actions'
import { PortalUsersSection } from '@/components/investors/portal-users-section'

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
      console.log('[Investor Detail] Capital metrics loaded:', capitalMetrics)
    } else {
      console.warn('[Investor Detail] No capital metrics data returned for investor:', id)
    }
  } catch (err) {
    console.error('[Investor Detail] Capital metrics exception:', err)
  }

  const investorData = investor as unknown as InvestorDetail

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/versotech/staff/investors">
              <Button variant="ghost" size="sm" className="bg-gray-800 text-white hover:bg-gray-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Investors
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {investorData.legal_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Investor ID: {investorData.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <InvestorDetailActions investor={investorData} />
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={investorData.kyc_status === 'completed' || investorData.kyc_status === 'approved' ? 'default' : 'secondary'}>
            KYC: {investorData.kyc_status}
          </Badge>
          <Badge variant={investorData.status === 'active' ? 'default' : 'secondary'}>
            {investorData.status}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {investorData.type}
          </Badge>
          {investorData.aml_risk_rating && (
            <Badge variant={investorData.aml_risk_rating === 'low' ? 'default' : investorData.aml_risk_rating === 'high' ? 'destructive' : 'secondary'}>
              Risk: {investorData.aml_risk_rating}
            </Badge>
          )}
          {investorData.is_pep && (
            <Badge variant="destructive">PEP</Badge>
          )}
        </div>

        {/* Capital Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Commitment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_commitment)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {capitalMetrics.vehicle_count > 0 ? (
                  <>Across {capitalMetrics.vehicle_count} vehicle{capitalMetrics.vehicle_count !== 1 ? 's' : ''}</>
                ) : (
                  <>No subscriptions yet</>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contributed / Unfunded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_contributed)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Unfunded: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.unfunded_commitment)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current NAV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.current_nav)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Distributed: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_distributed)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {investorData.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="text-sm font-medium">{investorData.email}</div>
                  </div>
                </div>
              )}
              {investorData.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="text-sm font-medium">{investorData.phone}</div>
                  </div>
                </div>
              )}
              {investorData.country && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Country</div>
                    <div className="text-sm font-medium">{investorData.country}</div>
                  </div>
                </div>
              )}
              {investorData.primary_rm_profile && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Relationship Manager</div>
                    <div className="text-sm font-medium">{investorData.primary_rm_profile.display_name}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entity Information */}
          <Card>
            <CardHeader>
              <CardTitle>Entity Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {investorData.display_name && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Display Name</div>
                    <div className="text-sm font-medium">{investorData.display_name}</div>
                  </div>
                </div>
              )}
              {investorData.country_of_incorporation && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Country of Incorporation</div>
                    <div className="text-sm font-medium">{investorData.country_of_incorporation}</div>
                  </div>
                </div>
              )}
              {investorData.tax_residency && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Tax Residency</div>
                    <div className="text-sm font-medium">{investorData.tax_residency}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-sm font-medium">
                    {new Date(investorData.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portal Users */}
        <PortalUsersSection
          investorId={investorData.id}
          users={investorData.investor_users || []}
        />
      </div>
    </AppLayout>
  )
}
