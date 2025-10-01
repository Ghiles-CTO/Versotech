import { AppLayout } from '@/components/layout/app-layout'
import { RealtimeDashboard } from '@/components/dashboard/realtime-dashboard'
import { SessionGuard } from '@/components/auth/session-guard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Building2,
  MapPin,
  Target
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { measureTimeAsync } from '@/lib/performance'

async function getPortfolioData() {
  return measureTimeAsync('portfolio-data-fetch', async () => {
    try {
      const supabase = await createClient()

      // Get current user from Supabase session
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!user || userError) {
        return {
          kpis: {
            currentNAV: 0,
            totalContributed: 0,
            totalDistributions: 0,
            unfundedCommitment: 0,
            unrealizedGain: 0,
            unrealizedGainPct: 0,
            dpi: 0,
            tvpi: 0,
            irr: 0
          },
          hasData: false,
          vehicles: []
        }
      }

      const supabaseUser = { id: user.id, email: user.email }

      console.log('🔍 DEBUG: Looking for user:', supabaseUser.id, supabaseUser.email)
      console.log('🔍 DEBUG: User ID type:', typeof supabaseUser.id)

      // Get investor entities linked to this user
      const { data: investorLinks, error: investorError } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', supabaseUser.id)

      console.log('🔍 DEBUG: investor_users query result:', { investorLinks, investorError })

      // Try a test query to see if we can read investor_users at all
      const { data: allLinks, error: allError } = await supabase
        .from('investor_users')
        .select('*')

      console.log('🔍 DEBUG: All investor_users:', { allLinks, allError })

      if (!investorLinks || investorLinks.length === 0) {
        return {
          kpis: {
            currentNAV: 0,
            totalContributed: 0,
            totalDistributions: 0,
            unfundedCommitment: 0,
            unrealizedGain: 0,
            unrealizedGainPct: 0,
            dpi: 0,
            tvpi: 0,
            irr: 0
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

      // Get aggregated performance data from latest performance snapshots
      const { data: latestPerformance } = await supabase
        .from('performance_snapshots')
        .select('nav_value, contributed, distributed, dpi, tvpi, irr_net')
        .in('investor_id', investorIds)
        .order('snapshot_date', { ascending: false })
        .limit(investorIds.length) // Get latest for each investor

      let finalNAV = currentNAV
      let finalContributed = totalContributed
      let finalDistributions = totalDistributions
      let dpi = 0
      let tvpi = 1
      let irr = 0

      if (latestPerformance && latestPerformance.length > 0) {
        // Use aggregated data from performance snapshots instead of calculating client-side
        const aggregatedNAV = latestPerformance.reduce((sum, perf) => sum + (perf.nav_value || 0), 0)
        const aggregatedContributed = latestPerformance.reduce((sum, perf) => sum + (perf.contributed || 0), 0)
        const aggregatedDistributed = latestPerformance.reduce((sum, perf) => sum + (perf.distributed || 0), 0)

        // Use database values when available
        finalNAV = aggregatedNAV || currentNAV
        finalContributed = aggregatedContributed || totalContributed
        finalDistributions = aggregatedDistributed || totalDistributions

        // Calculate performance metrics
        dpi = finalContributed > 0 ? finalDistributions / finalContributed : 0
        tvpi = finalContributed > 0 ? (finalNAV + finalDistributions) / finalContributed : 1
        irr = latestPerformance.reduce((sum, perf) => sum + (perf.irr_net || 0), 0) / latestPerformance.length
      } else {
        // Fallback to calculated values if no performance snapshots
        dpi = finalContributed > 0 ? finalDistributions / finalContributed : 0
        tvpi = finalContributed > 0 ? (finalNAV + finalDistributions) / finalContributed : 1
        irr = 0
      }

      const costBasis = positions?.reduce((sum, pos) => sum + (pos.cost_basis || 0), 0) || 0
      const unrealizedGain = finalNAV - costBasis
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

      // Get recent activity feed
      const { data: recentActivity } = await supabase
        .from('activity_feed')
        .select('*')
        .in('investor_id', investorIds)
        .order('created_at', { ascending: false })
        .limit(10)

      return {
        kpis: {
          currentNAV: finalNAV,
          totalContributed: finalContributed,
          totalDistributions: finalDistributions,
          unfundedCommitment,
          unrealizedGain,
          unrealizedGainPct,
          dpi,
          tvpi,
          irr
        },
        hasData: finalContributed > 0 || finalNAV > 0,
        vehicles: vehicleData || [],
        recentActivity: recentActivity || []
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
          unrealizedGainPct: 0,
          dpi: 0,
          tvpi: 0,
          irr: 0
        },
        hasData: false,
        vehicles: [],
        recentActivity: []
      }
    }
  })
}

async function getInvestorIds(userId: string) {
  const supabase = await createClient()
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', userId)

  return investorLinks?.map(link => link.investor_id) || []
}

export default async function InvestorDashboard() {
  const { kpis, hasData, vehicles, recentActivity } = await getPortfolioData()

  // Get current user to get investor IDs for realtime subscriptions
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const investorIds = user ? await getInvestorIds(user.id) : []

  return (
    <SessionGuard>
      <AppLayout brand="versoholdings">
        <div className="p-6 space-y-8">

        {/* VERSO Holdings Header */}
        <div className="relative border-b border-gray-200 pb-8 mb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50 rounded-t-2xl" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    VERSO Holdings
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Merchant Banking Group • Since 1958 • $800M+ AUM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-1">
                <Badge variant="outline" className="text-xs bg-white/80 backdrop-blur-sm border-blue-200 hover:border-blue-300 transition-colors">
                  <MapPin className="h-3 w-3 mr-1 text-blue-600" />
                  Luxembourg HQ
                </Badge>
                <Badge variant="outline" className="text-xs bg-white/80 backdrop-blur-sm border-indigo-200 hover:border-indigo-300 transition-colors">
                  <Building2 className="h-3 w-3 mr-1 text-indigo-600" />
                  BVI Professional Fund
                </Badge>
                <Badge variant="outline" className="text-xs bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-300 transition-colors">
                  <Target className="h-3 w-3 mr-1 text-purple-600" />
                  PE • VC • Real Estate
                </Badge>
              </div>
            </div>
            <div className="text-right bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 shadow-sm border border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio as of</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {hasData ? (
          <RealtimeDashboard
            initialData={{ kpis, vehicles, recentActivity }}
            investorIds={investorIds}
          />
        ) : (
          /* Welcome Screen for New Users */
          <div className="text-center py-16 px-4">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Welcome to VERSO Holdings
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Your private portal for accessing investment vehicles across our merchant banking platforms.
              Complete your onboarding to begin viewing your portfolio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              <Card className="group relative overflow-hidden text-center p-8 border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">VERSO FUND</h3>
                  <p className="text-sm text-gray-600">BVI Professional Mutual Fund</p>
                </div>
              </Card>

              <Card className="group relative overflow-hidden text-center p-8 border-2 hover:border-green-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">REAL Empire</h3>
                  <p className="text-sm text-gray-600">Real Estate Securitization</p>
                </div>
              </Card>

              <Card className="group relative overflow-hidden text-center p-8 border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Luxembourg Entities</h3>
                  <p className="text-sm text-gray-600">European Investment Platforms</p>
                </div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/versoholdings/tasks">
                <Button size="lg" className="min-w-[220px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  Complete Onboarding
                </Button>
              </Link>
              <Link href="/versoholdings/messages">
                <Button variant="outline" size="lg" className="min-w-[220px] border-2 hover:bg-gray-50 transition-all duration-300">
                  Contact VERSO Team
                </Button>
              </Link>
            </div>
          </div>
        )}
        </div>
      </AppLayout>
    </SessionGuard>
  )
}