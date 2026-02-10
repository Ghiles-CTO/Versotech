'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Briefcase,
  Eye,
  HandCoins,
  Activity,
  BarChart3,
  Target,
  Wallet
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { FeeModelView } from '@/components/partner/FeeModelView'

type Persona = {
  persona_type: string
  entity_id: string
  entity_name: string
  role_in_entity?: string | null
  can_sign?: boolean
  logo_url?: string | null
}

interface PartnerDashboardProps {
  partnerId: string
  userId: string
  persona: Persona
}

type PartnerMetrics = {
  totalReferredInvestors: number
  subscribedInvestors: number
  pipelineInvestors: number
  totalCommitment: number
  commitmentCurrency: string
  pendingCommissions: number
  pendingCommissionCurrency: string
  trackedDeals: number
  investableDeals: number
}

type PerformanceMetrics = {
  conversionRate: number
  thisMonthReferrals: number
  lastMonthReferrals: number
  referralGrowth: number
  paidCommissions: number
  avgCommitmentPerInvestor: number
  avgCommitmentCurrency: string
}

type RecentReferral = {
  deal_id: string | null
  deal_name: string | null
  deal_status: string | null
  investor_id: string | null
  investor_name: string | null
  dispatched_at: string | null
  interest_confirmed_at: string | null
  subscription: {
    commitment: number | null
    status: string | null
    signed_at: string | null
  } | null
}

export function PartnerDashboard({ partnerId, userId, persona }: PartnerDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<PartnerMetrics | null>(null)
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)
  const [recentReferrals, setRecentReferrals] = useState<RecentReferral[]>([])

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/partners/me/dashboard')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load partner dashboard')
        }

        setMetrics(data.metrics)
        setPerformance(data.performance || null)
        setRecentReferrals(data.recent_referrals || [])
      } catch (err) {
        console.error('Error fetching partner dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load partner dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (partnerId && userId) {
      fetchDashboard()
    }
  }, [partnerId, userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Partner Dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const commitmentCurrency = metrics?.commitmentCurrency || 'USD'
  const pendingCurrency = metrics?.pendingCommissionCurrency || 'USD'

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {persona.entity_name}</h1>
          <p className="text-muted-foreground">
            Partner Dashboard - Track your referrals and investment opportunities
          </p>
        </div>
        <Link href="/versotech_main/opportunities">
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            View Opportunities
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/versotech_main/opportunities" className="block">
          <Card className="h-full hover:border-foreground/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deals Available</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.investableDeals || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.trackedDeals || 0} tracking
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/versotech_main/partner-transactions" className="block">
          <Card className="h-full hover:border-foreground/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referred Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalReferredInvestors || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.subscribedInvestors || 0} subscribed, {metrics?.pipelineInvestors || 0} in pipeline
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referred Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.totalCommitment || 0, commitmentCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Committed by referred investors
            </p>
          </CardContent>
        </Card>

        <Link href="/versotech_main/partner-transactions" className="block">
          <Card className="h-full hover:border-foreground/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.pendingCommissions || 0, pendingCurrency)}
              </div>
              <p className="text-xs text-muted-foreground">
                Accrued and invoiced fees
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Performance Metrics */}
      {performance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
            <CardDescription>Your referral performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Target className="h-4 w-4" />
                  Conversion Rate
                </div>
                <div className="text-2xl font-bold">{performance.conversionRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Referrals that subscribed
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  {performance.referralGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  This Month
                </div>
                <div className="text-2xl font-bold">{performance.thisMonthReferrals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={performance.referralGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {performance.referralGrowth >= 0 ? '+' : ''}{performance.referralGrowth}%
                  </span>
                  {' '}vs last month ({performance.lastMonthReferrals})
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  Avg Commitment
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(performance.avgCommitmentPerInvestor, performance.avgCommitmentCurrency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per subscribed investor
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Wallet className="h-4 w-4" />
                  Paid Commissions
                </div>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(performance.paidCommissions, pendingCurrency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total received
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5" />
              Recent Referrals
            </CardTitle>
            <CardDescription>Investors you have referred to deals</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReferrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No referrals yet</p>
                <p className="text-sm mt-1">
                  Share deals with investors to start tracking
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReferrals.map((referral, idx) => {
                  const status = referral.subscription?.status
                  const hasCommitment = status === 'committed' || status === 'active'
                  const isPending = status === 'pending'
                  const isInterested = !status && referral.interest_confirmed_at
                  const badgeLabel = hasCommitment
                    ? 'Committed'
                    : isPending
                      ? 'Pending'
                      : isInterested
                        ? 'Interested'
                        : 'Dispatched'
                  const badgeVariant = hasCommitment ? 'default' : isPending || isInterested ? 'secondary' : 'outline'

                  return (
                    <div
                      key={`${referral.deal_id}-${referral.investor_id || idx}`}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          hasCommitment
                            ? 'bg-green-100 text-green-600'
                            : isPending
                              ? 'bg-yellow-100 text-yellow-600'
                              : isInterested
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                          {hasCommitment ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : isPending ? (
                            <Clock className="h-4 w-4" />
                          ) : isInterested ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{referral.investor_name || 'Unknown Investor'}</p>
                          <p className="text-sm text-muted-foreground">
                            {referral.deal_name || 'Unknown Deal'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {referral.subscription?.commitment ? (
                          <p className="font-medium">
                            {formatCurrency(referral.subscription.commitment, commitmentCurrency)}
                          </p>
                        ) : null}
                        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                      </div>
                    </div>
                  )
                })}
                <Link href="/versotech_main/partner-transactions">
                  <Button variant="outline" className="w-full">
                    View All Transactions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <FeeModelView />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/versotech_main/opportunities">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Browse Opportunities
              </Button>
            </Link>
            <Link href="/versotech_main/partner-transactions">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                View Transactions
              </Button>
            </Link>
            <Link href="/versotech_main/shared-transactions">
              <Button variant="outline" className="w-full justify-start">
                <HandCoins className="mr-2 h-4 w-4" />
                Shared Deals
              </Button>
            </Link>
            <Link href="/versotech_main/messages">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Messages
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
