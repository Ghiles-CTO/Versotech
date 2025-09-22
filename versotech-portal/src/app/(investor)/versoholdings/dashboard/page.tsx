import { AppLayout } from '@/components/layout/app-layout'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  Calendar,
  FileText,
  MessageSquare,
  Plus,
  Building2,
  MapPin,
  Target,
  Clock,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { measureTimeAsync } from '@/lib/performance'

async function getPortfolioData() {
  return measureTimeAsync('portfolio-data-fetch', async () => {
    try {
      const supabase = await createClient()

      // Get the authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          kpis: {
            currentNAV: 0,
            totalContributed: 0,
            totalDistributions: 0,
            unfundedCommitment: 0,
            unrealizedGain: 0,
            unrealizedGainPct: 0
          },
          hasData: false,
          vehicles: []
        }
      }

      // Get investor entities linked to this user
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      if (!investorLinks || investorLinks.length === 0) {
        return {
          kpis: {
            currentNAV: 0,
            totalContributed: 0,
            totalDistributions: 0,
            unfundedCommitment: 0,
            unrealizedGain: 0,
            unrealizedGainPct: 0
          },
          hasData: false,
          vehicles: []
        }
      }

      const investorIds = investorLinks.map(link => link.investor_id)

      // Get positions and calculate metrics
      const { data: positions } = await supabase
        .from('positions')
        .select('*')
        .in('investor_id', investorIds)

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('commitment')
        .in('investor_id', investorIds)
        .eq('status', 'active')

      const { data: cashflows } = await supabase
        .from('cashflows')
        .select('type, amount')
        .in('investor_id', investorIds)

      // Calculate KPIs
      const totalContributed = cashflows?.filter(cf => cf.type === 'call')
        .reduce((sum, cf) => sum + (cf.amount || 0), 0) || 0

      const totalDistributions = cashflows?.filter(cf => cf.type === 'distribution')
        .reduce((sum, cf) => sum + (cf.amount || 0), 0) || 0

      const totalCommitment = subscriptions?.reduce((sum, sub) => sum + (sub.commitment || 0), 0) || 0
      const unfundedCommitment = totalCommitment - totalContributed

      const currentNAV = positions?.reduce((sum, pos) => {
        return sum + ((pos.units || 0) * (pos.last_nav || 0))
      }, 0) || 0

      const costBasis = positions?.reduce((sum, pos) => sum + (pos.cost_basis || 0), 0) || 0
      const unrealizedGain = currentNAV - costBasis
      const unrealizedGainPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0

      // Get vehicle breakdown
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select(`
          id, name, type, domicile, currency,
          subscriptions!inner(investor_id, commitment, status),
          positions(investor_id, units, cost_basis, last_nav, as_of_date)
        `)
        .in('subscriptions.investor_id', investorIds)
        .eq('subscriptions.status', 'active')

      return {
        kpis: {
          currentNAV,
          totalContributed,
          totalDistributions,
          unfundedCommitment,
          unrealizedGain,
          unrealizedGainPct
        },
        hasData: totalContributed > 0 || currentNAV > 0,
        vehicles: vehicleData || []
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      return {
        kpis: {
          currentNAV: 0,
          totalContributed: 0,
          totalDistributions: 0,
          unfundedCommitment: 0,
          unrealizedGain: 0,
          unrealizedGainPct: 0
        },
        hasData: false,
        vehicles: []
      }
    }
  })
}

export default async function InvestorDashboard() {
  const { kpis, hasData, vehicles } = await getPortfolioData()

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-8">

        {/* VERSO Holdings Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">VERSO Holdings</h1>
              <p className="text-lg text-gray-600 mt-1">
                Merchant Banking Group • Since 1958 • $800M+ AUM
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  Luxembourg HQ
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  BVI Professional Fund
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  PE • VC • Real Estate
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Portfolio as of</p>
              <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {hasData ? (
          <>
            {/* Portfolio KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Net Asset Value"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(kpis.currentNAV)}
                icon={DollarSign}
                trend={kpis.unrealizedGainPct > 0 ? 'up' : kpis.unrealizedGainPct < 0 ? 'down' : 'neutral'}
                trendValue={`${kpis.unrealizedGainPct > 0 ? '+' : ''}${kpis.unrealizedGainPct.toFixed(1)}%`}
              />

              <KPICard
                title="Capital Contributed"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(kpis.totalContributed)}
                icon={PiggyBank}
                description="Total capital called"
              />

              <KPICard
                title="Distributions Received"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(kpis.totalDistributions)}
                icon={TrendingUp}
                description="Cash returned to date"
              />

              <KPICard
                title="Unfunded Commitment"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(kpis.unfundedCommitment)}
                icon={Calendar}
                description="Remaining obligation"
              />
            </div>

            {/* Investment Vehicles */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Investment Vehicles</CardTitle>
                  <CardDescription>
                    Your positions across VERSO's investment platforms
                  </CardDescription>
                </div>
                <Link href="/versoholdings/holdings">
                  <Button variant="outline" size="sm">
                    View All Holdings
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicles.slice(0, 3).map((vehicle) => (
                    <Link key={vehicle.id} href={`/versoholdings/vehicle/${vehicle.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                          <div>
                            <h3 className="font-semibold">{vehicle.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {vehicle.type} • {vehicle.domicile}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <ArrowUpRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* VERSO Services */}
              <Card>
                <CardHeader>
                  <CardTitle>VERSO Services</CardTitle>
                  <CardDescription>
                    Access to deal flow and transactional services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Building2 className="mr-2 h-4 w-4" />
                    Concluder™ Deal Room
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="mr-2 h-4 w-4" />
                    Off-Market Opportunities
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Request Position Statement
                  </Button>
                  <Link href="/versoholdings/reports">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Custom Report Request
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates across your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Q4 Valuation Update</p>
                        <p className="text-xs text-gray-500">VERSO FUND - Updated 2 days ago</p>
                      </div>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Distribution Notice</p>
                        <p className="text-xs text-gray-500">REAL Empire Compartment III</p>
                      </div>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-amber-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New Deal Available</p>
                        <p className="text-xs text-gray-500">Exclusive Luxembourg opportunity</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Link href="/versoholdings/messages">
                      <Button variant="ghost" size="sm" className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        View All Communications
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* Welcome Screen for New Users */
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to VERSO Holdings
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Your private portal for accessing investment vehicles across our merchant banking platforms.
              Complete your onboarding to begin viewing your portfolio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <Card className="text-center p-6">
                <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">VERSO FUND</h3>
                <p className="text-sm text-gray-600">BVI Professional Mutual Fund</p>
              </Card>

              <Card className="text-center p-6">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">REAL Empire</h3>
                <p className="text-sm text-gray-600">Real Estate Securitization</p>
              </Card>

              <Card className="text-center p-6">
                <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Luxembourg Entities</h3>
                <p className="text-sm text-gray-600">European Investment Platforms</p>
              </Card>
            </div>

            <div className="space-y-4">
              <Link href="/versoholdings/tasks">
                <Button size="lg" className="mr-4">
                  Complete Onboarding
                </Button>
              </Link>
              <Link href="/versoholdings/messages">
                <Button variant="outline" size="lg">
                  Contact VERSO Team
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}