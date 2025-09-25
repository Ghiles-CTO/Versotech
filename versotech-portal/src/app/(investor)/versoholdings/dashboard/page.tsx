import { AppLayout } from '@/components/layout/app-layout'
import { RealtimeDashboard } from '@/components/dashboard/realtime-dashboard'
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
import { getUserById } from '@/lib/simple-auth'
import { cookies } from 'next/headers'
import { measureTimeAsync } from '@/lib/performance'
import { cn } from '@/lib/utils'

async function getPortfolioData() {
  return measureTimeAsync('portfolio-data-fetch', async () => {
    try {
      const supabase = await createClient()

      // Get current user - auth already handled by AppLayout
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get('demo_session')
      if (!sessionCookie) {
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

      const session = JSON.parse(sessionCookie.value)
      const user = getUserById(session.id)
      if (!user) {
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

      const costBasis = positions?.reduce((sum, pos) => sum + (pos.cost_basis || 0), 0) || 0
      const unrealizedGain = currentNAV - costBasis
      const unrealizedGainPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0

      // Calculate DPI, TVPI, and IRR from performance snapshots (latest)
      const { data: latestPerformance } = await supabase
        .from('performance_snapshots')
        .select('dpi, tvpi, irr_net')
        .in('investor_id', investorIds)
        .order('snapshot_date', { ascending: false })
        .limit(1)

      const dpi = latestPerformance?.[0]?.dpi || (totalContributed > 0 ? totalDistributions / totalContributed : 0)
      const tvpi = latestPerformance?.[0]?.tvpi || (totalContributed > 0 ? (currentNAV + totalDistributions) / totalContributed : 1)
      const irr = latestPerformance?.[0]?.irr_net || 0

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
          currentNAV,
          totalContributed,
          totalDistributions,
          unfundedCommitment,
          unrealizedGain,
          unrealizedGainPct,
          dpi,
          tvpi,
          irr
        },
        hasData: totalContributed > 0 || currentNAV > 0,
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
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('demo_session')
  const investorIds = sessionCookie ? await getInvestorIds(JSON.parse(sessionCookie.value).id) : []

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
          <RealtimeDashboard
            initialData={{ kpis, vehicles, recentActivity }}
            investorIds={investorIds}
          />
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