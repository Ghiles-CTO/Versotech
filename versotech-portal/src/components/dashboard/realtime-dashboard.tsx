'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KPICard } from '@/components/dashboard/kpi-card'
import { KPIDetailModal, KPIDetail } from '@/components/dashboard/kpi-detail-modal'
import { PerformanceTrends } from '@/components/dashboard/performance-trends'
import { DealContextSelector } from '@/components/dashboard/deal-context-selector'
// Removed fake AI/ML components - these were decorative and non-functional
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
import { cn } from '@/lib/utils'

interface DashboardData {
  kpis: {
    currentNAV: number
    totalContributed: number
    totalDistributions: number
    unfundedCommitment: number
    unrealizedGain: number
    unrealizedGainPct: number
    dpi: number
    tvpi: number
    irr: number
  }
  vehicles: any[]
  recentActivity: any[]
}

interface RealtimeDashboardProps {
  initialData: DashboardData
  investorIds: string[]
  userId: string
}

interface ActivityEvent {
  id: string
  entity_type?: string | null
  entity_id?: string | null
  activity_type?: string | null
}

interface DealActivityPayload {
  new: ActivityEvent
  eventType: string
}

const DEAL_LINKED_ENTITIES = new Set(['documents', 'messages', 'request_tickets'])

function isDealScopedEvent(payload: DealActivityPayload) {
  const entityType = payload?.new?.entity_type
  if (!entityType) return false
  return DEAL_LINKED_ENTITIES.has(entityType)
}

export function RealtimeDashboard({ initialData, investorIds, userId }: RealtimeDashboardProps) {
  const [data, setData] = useState<DashboardData>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedKPI, setSelectedKPI] = useState<KPIDetail | null>(null)
  const [showKPIModal, setShowKPIModal] = useState(false)
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)
  const [originalData, setOriginalData] = useState<DashboardData>(initialData)
  const [dealDetails, setDealDetails] = useState<Record<string, { vehicle_id: string | null }>>({})

  useEffect(() => {
    setOriginalData(initialData)
    setData(initialData)
  }, [initialData])

  useEffect(() => {
    if (investorIds.length === 0) return

    const supabase = createClient()

    // Set up realtime subscription for activity feed
    const activityChannel = supabase
      .channel(`activity_updates_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_feed'
      }, (payload) => {
        const typedPayload = payload as unknown as DealActivityPayload

        if (selectedDealId && !isDealScopedEvent(typedPayload)) {
          return
        }

        const newActivity = payload.new
        const matchesContext = selectedDealId ? newActivity.deal_id === selectedDealId : true

        if (matchesContext) {
          setData(prev => ({
            ...prev,
            recentActivity: [newActivity, ...prev.recentActivity.slice(0, 9)]
          }))
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Set up realtime subscription for performance snapshots
    const performanceChannel = supabase
      .channel('performance_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'performance_snapshots',
        filter: `investor_id=in.(${investorIds.join(',')})`
      }, async (payload) => {
        console.log('Performance update:', payload)

        // Refresh KPIs when performance data changes
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          // Re-fetch latest performance data
          const { data: latestPerformance } = await supabase
            .from('performance_snapshots')
            .select('dpi, tvpi, irr_net')
            .in('investor_id', investorIds)
            .order('snapshot_date', { ascending: false })
            .limit(1)

          if (latestPerformance?.[0]) {
            const { dpi, tvpi, irr_net } = latestPerformance[0]
            setData(prev => ({
              ...prev,
              kpis: {
                ...prev.kpis,
                dpi: dpi || prev.kpis.dpi,
                tvpi: tvpi || prev.kpis.tvpi,
                irr: irr_net || prev.kpis.irr
              }
            }))
          }
        }
      })
      .subscribe()

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(activityChannel)
      supabase.removeChannel(performanceChannel)
    }
  }, [investorIds, selectedDealId, userId])

  // Generate KPI detail data
  const generateKPIDetail = (kpiType: string): KPIDetail => {
    switch (kpiType) {
      case 'nav':
        return {
          title: 'Net Asset Value',
          value: data.kpis.currentNAV,
          description: 'Current market value of your investment portfolio',
          icon: DollarSign,
          trend: {
            direction: data.kpis.unrealizedGainPct > 0 ? 'up' : data.kpis.unrealizedGainPct < 0 ? 'down' : 'neutral',
            value: `${data.kpis.unrealizedGainPct > 0 ? '+' : ''}${data.kpis.unrealizedGainPct.toFixed(1)}%`,
            period: 'vs cost basis'
          },
          breakdown: [
            { label: 'VERSO FUND', value: data.kpis.currentNAV * 0.6, percentage: 60, change: '+8.2%' },
            { label: 'REAL Empire', value: data.kpis.currentNAV * 0.3, percentage: 30, change: '+12.1%' },
            { label: 'Luxembourg Entities', value: data.kpis.currentNAV * 0.1, percentage: 10, change: '+5.7%' }
          ],
          benchmark: {
            label: 'S&P 500 YTD',
            value: '+18.2%',
            comparison: data.kpis.unrealizedGainPct > 18.2 ? 'above' : 'below'
          },
          insights: [
            'Strong performance across all vehicle types',
            'Real Estate positions showing exceptional growth',
            'Diversification strategy yielding consistent returns'
          ],
          relatedMetrics: [
            { name: 'Cost Basis', value: '$950K', change: '0.0%' },
            { name: 'Unrealized Gain', value: `$${Math.round(data.kpis.unrealizedGain / 1000)}K`, change: `${data.kpis.unrealizedGainPct > 0 ? '+' : ''}${data.kpis.unrealizedGainPct.toFixed(1)}%` },
            { name: 'Beta vs Market', value: '0.85', change: 'Low Risk' }
          ]
        }

      case 'dpi':
        return {
          title: 'DPI (Distributions to Paid-In Capital)',
          value: `${data.kpis.dpi.toFixed(2)}x`,
          description: 'Cash returned relative to capital contributed - measures liquidity generation',
          icon: TrendingUp,
          trend: {
            direction: data.kpis.dpi > 0.5 ? 'up' : 'neutral',
            value: '+0.12x',
            period: 'last 12 months'
          },
          breakdown: [
            { label: 'Return of Capital', value: `${(data.kpis.dpi * 0.7).toFixed(2)}x`, percentage: 70 },
            { label: 'Profit Distributions', value: `${(data.kpis.dpi * 0.3).toFixed(2)}x`, percentage: 30 },
            { label: 'Expected Next 12M', value: `+${(0.15).toFixed(2)}x`, percentage: 0, change: 'Projected' }
          ],
          benchmark: {
            label: 'Industry Average',
            value: '0.35x',
            comparison: data.kpis.dpi > 0.35 ? 'above' : 'below'
          },
          insights: [
            data.kpis.dpi > 1 ? 'Excellent cash generation - exceeding initial investment' : 'Strong liquidity profile for early-stage investments',
            'Consistent distribution pattern indicates mature portfolio',
            'Multiple exit events contributing to realized returns'
          ]
        }

      case 'tvpi':
        return {
          title: 'TVPI (Total Value to Paid-In Capital)',
          value: `${data.kpis.tvpi.toFixed(2)}x`,
          description: 'Total investment value including both realized and unrealized returns',
          icon: Target,
          trend: {
            direction: data.kpis.tvpi > 1.2 ? 'up' : 'neutral',
            value: '+0.18x',
            period: 'last 12 months'
          },
          breakdown: [
            { label: 'Realized Value (DPI)', value: `${data.kpis.dpi.toFixed(2)}x`, percentage: (data.kpis.dpi / data.kpis.tvpi) * 100 },
            { label: 'Unrealized Value (RVPI)', value: `${(data.kpis.tvpi - data.kpis.dpi).toFixed(2)}x`, percentage: ((data.kpis.tvpi - data.kpis.dpi) / data.kpis.tvpi) * 100 },
            { label: 'Portfolio NAV', value: data.kpis.currentNAV, change: `+${data.kpis.unrealizedGainPct.toFixed(1)}%` }
          ],
          benchmark: {
            label: 'Top Quartile Funds',
            value: '1.45x',
            comparison: data.kpis.tvpi >= 1.45 ? 'above' : data.kpis.tvpi >= 1.2 ? 'equal' : 'below'
          },
          insights: [
            data.kpis.tvpi > 1.5 ? 'Outstanding performance in top decile' : 'Solid performance above median',
            'Balanced mix of realized and unrealized value creation',
            'Strong unrealized value suggests future upside potential'
          ]
        }

      case 'irr':
        return {
          title: 'IRR (Internal Rate of Return)',
          value: `${(data.kpis.irr * 100).toFixed(1)}%`,
          description: 'Annualized return rate accounting for timing of cash flows',
          icon: ArrowUpRight,
          trend: {
            direction: data.kpis.irr > 0.15 ? 'up' : data.kpis.irr > 0.08 ? 'neutral' : 'down',
            value: '+2.1pp',
            period: 'last 12 months'
          },
          breakdown: [
            { label: 'Gross IRR', value: `${((data.kpis.irr + 0.02) * 100).toFixed(1)}%`, change: 'Before fees' },
            { label: 'Net IRR', value: `${(data.kpis.irr * 100).toFixed(1)}%`, change: 'After fees' },
            { label: 'Management Fees', value: '2.0%', change: 'Annual' },
            { label: 'Carry Rate', value: '20%', change: 'Above 8% hurdle' }
          ],
          benchmark: {
            label: 'Private Equity Benchmark',
            value: '12.5%',
            comparison: data.kpis.irr >= 0.125 ? 'above' : 'below'
          },
          insights: [
            data.kpis.irr > 0.20 ? 'Exceptional returns in top percentile' : data.kpis.irr > 0.15 ? 'Strong performance above industry average' : 'Moderate returns in line with expectations',
            'IRR benefits from early strong performers and recent markups',
            'Time-weighted returns reflect quality of vintage years'
          ],
          relatedMetrics: [
            { name: 'Money Multiple', value: `${data.kpis.tvpi.toFixed(1)}x`, change: 'TVPI' },
            { name: 'Payback Period', value: '3.2 yrs', change: 'Estimated' },
            { name: 'Volatility', value: '18.5%', change: 'Annual' }
          ]
        }

      default:
        return {
          title: 'Portfolio Metric',
          value: 'N/A',
          description: 'Detailed information not available',
          breakdown: []
        }
    }
  }

  const handleKPIClick = (kpiType: string) => {
    const kpiDetail = generateKPIDetail(kpiType)
    setSelectedKPI(kpiDetail)
    setShowKPIModal(true)
  }

  // Fetch deal-scoped data
  const fetchDealScopedData = async (dealId: string | null) => {
    if (!dealId) {
      setData(originalData)
      setSelectedDealId(null)
      return
    }

    try {
      const supabase = createClient()

      let vehicleId = dealDetails[dealId]?.vehicle_id

      if (!vehicleId) {
        const { data: dealRecord, error: dealError } = await supabase
          .from('deals')
          .select('id, vehicle_id')
          .eq('id', dealId)
          .single()

        if (dealError || !dealRecord?.vehicle_id) {
          setData(originalData)
          return
        }

        vehicleId = dealRecord.vehicle_id
        setDealDetails(prev => ({ ...prev, [dealId]: { vehicle_id: vehicleId } }))
      }

      const { data: vehicleRecords } = await supabase
        .from('vehicles')
        .select('id, name, type, domicile, currency')
        .eq('id', vehicleId)
        .limit(1)

      const { data: positions } = await supabase
        .from('positions')
        .select('*')
        .in('investor_id', investorIds)
        .eq('vehicle_id', vehicleId)

      // Get performance snapshots for this vehicle
      const { data: latestPerformance } = await supabase
        .from('performance_snapshots')
        .select('dpi, tvpi, irr_net, nav_value, contributed, distributed')
        .in('investor_id', investorIds)
        .eq('vehicle_id', vehicleId)
        .order('snapshot_date', { ascending: false })
        .limit(1)

      // Get cashflows for this vehicle
      const { data: cashflows } = await supabase
        .from('cashflows')
        .select('type, amount')
        .in('investor_id', investorIds)
        .eq('vehicle_id', vehicleId)

      // Get deal-specific activity
      const { data: dealActivity } = await supabase
        .from('activity_feed')
        .select('*')
        .in('investor_id', investorIds)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })
        .limit(10)

      // Calculate deal-specific KPIs
      const totalContributed = cashflows?.filter(cf => cf.type === 'call')
        .reduce((sum, cf) => sum + (cf.amount || 0), 0) || 0

      const totalDistributions = cashflows?.filter(cf => cf.type === 'distribution')
        .reduce((sum, cf) => sum + (cf.amount || 0), 0) || 0

      const currentNAV = positions?.reduce((sum, pos) => {
        return sum + ((pos.units || 0) * (pos.last_nav || 0))
      }, 0) || 0

      const costBasis = positions?.reduce((sum, pos) => sum + (pos.cost_basis || 0), 0) || 0
      const unrealizedGain = currentNAV - costBasis
      const unrealizedGainPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0

      // Use performance snapshot data if available, otherwise calculate
      const performanceData = latestPerformance?.[0]
      const dpi = performanceData?.dpi || (totalContributed > 0 ? totalDistributions / totalContributed : 0)
      const tvpi = performanceData?.tvpi || (totalContributed > 0 ? (currentNAV + totalDistributions) / totalContributed : 1)
      const irr = performanceData?.irr_net || 0

      // Update data with deal-scoped values
      setData({
        kpis: {
          currentNAV: performanceData?.nav_value || currentNAV,
          totalContributed: performanceData?.contributed || totalContributed,
          totalDistributions: performanceData?.distributed || totalDistributions,
          unfundedCommitment: Math.max(0, (totalContributed * 1.2) - totalContributed), // Estimate
          unrealizedGain,
          unrealizedGainPct,
          dpi,
          tvpi,
          irr
        },
        vehicles: vehicleRecords || [],
        recentActivity: dealActivity || []
      })

    } catch (error) {
      console.error('Error fetching deal-scoped data:', error)
      setData(originalData)
    }
  }

  const handleDealChange = (dealId: string | null) => {
    setSelectedDealId(dealId)
    fetchDealScopedData(dealId)
  }

  return (
    <div className="space-y-8">
      {/* Deal Context Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DealContextSelector
            investorIds={investorIds}
            selectedDealId={selectedDealId ?? undefined}
            onDealChange={handleDealChange}
          />
        </div>

        {/* Connection Status Indicator */}
        <div className="flex items-center justify-end">
          <div className={cn(
            "flex items-center gap-2 text-xs px-2 py-1 rounded-full",
            isConnected ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"
            )} />
            {isConnected ? "Live Updates" : "Connecting..."}
          </div>
        </div>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        <KPICard
          title="Net Asset Value"
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(data.kpis.currentNAV)}
          icon={DollarSign}
          trend={data.kpis.unrealizedGainPct > 0 ? 'up' : data.kpis.unrealizedGainPct < 0 ? 'down' : 'neutral'}
          trendValue={`${data.kpis.unrealizedGainPct > 0 ? '+' : ''}${data.kpis.unrealizedGainPct.toFixed(1)}%`}
          interactive={true}
          hasDetails={true}
          onDrillDown={() => handleKPIClick('nav')}
          additionalInfo={{
            breakdown: [
              { label: 'VERSO FUND', value: `${((data.kpis.currentNAV * 0.6) / 1000).toFixed(0)}K` },
              { label: 'REAL Empire', value: `${((data.kpis.currentNAV * 0.3) / 1000).toFixed(0)}K` }
            ],
            benchmark: { label: 'vs S&P 500', value: '+18.2%' }
          }}
        />

        <KPICard
          title="Capital Contributed"
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(data.kpis.totalContributed)}
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
          }).format(data.kpis.totalDistributions)}
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
          }).format(data.kpis.unfundedCommitment)}
          icon={Calendar}
          description="Remaining obligation"
        />

        <KPICard
          title="DPI"
          value={`${data.kpis.dpi.toFixed(2)}x`}
          icon={TrendingUp}
          description="Distributions to Paid-In Capital"
          trend={data.kpis.dpi > 0.5 ? 'up' : data.kpis.dpi > 0.25 ? 'neutral' : 'down'}
          trendValue={data.kpis.dpi > 1 ? 'Strong' : data.kpis.dpi > 0.5 ? 'Good' : 'Early'}
          interactive={true}
          hasDetails={true}
          onDrillDown={() => handleKPIClick('dpi')}
          additionalInfo={{
            breakdown: [
              { label: 'Return of Capital', value: `${(data.kpis.dpi * 0.7).toFixed(2)}x` },
              { label: 'Profit Distributions', value: `${(data.kpis.dpi * 0.3).toFixed(2)}x` }
            ],
            benchmark: { label: 'Industry Avg', value: '0.35x' }
          }}
        />

        <KPICard
          title="TVPI"
          value={`${data.kpis.tvpi.toFixed(2)}x`}
          icon={Target}
          description="Total Value to Paid-In Capital"
          trend={data.kpis.tvpi > 1.2 ? 'up' : data.kpis.tvpi > 1 ? 'neutral' : 'down'}
          trendValue={data.kpis.tvpi > 1.5 ? 'Excellent' : data.kpis.tvpi > 1.2 ? 'Good' : 'Fair'}
          interactive={true}
          hasDetails={true}
          onDrillDown={() => handleKPIClick('tvpi')}
          additionalInfo={{
            breakdown: [
              { label: 'Realized (DPI)', value: `${data.kpis.dpi.toFixed(2)}x` },
              { label: 'Unrealized (RVPI)', value: `${(data.kpis.tvpi - data.kpis.dpi).toFixed(2)}x` }
            ],
            benchmark: { label: 'Top Quartile', value: '1.45x' }
          }}
        />

        <KPICard
          title="IRR (Net)"
          value={`${(data.kpis.irr * 100).toFixed(1)}%`}
          icon={ArrowUpRight}
          description="Internal Rate of Return"
          trend={data.kpis.irr > 0.15 ? 'up' : data.kpis.irr > 0.08 ? 'neutral' : 'down'}
          trendValue={data.kpis.irr > 0.20 ? 'Outstanding' : data.kpis.irr > 0.15 ? 'Strong' : 'Moderate'}
          interactive={true}
          hasDetails={true}
          onDrillDown={() => handleKPIClick('irr')}
          additionalInfo={{
            breakdown: [
              { label: 'Gross IRR', value: `${((data.kpis.irr + 0.02) * 100).toFixed(1)}%` },
              { label: 'Net IRR', value: `${(data.kpis.irr * 100).toFixed(1)}%` }
            ],
            benchmark: { label: 'PE Benchmark', value: '12.5%' }
          }}
        />
      </div>

      {/* Performance Trends */}
      <PerformanceTrends investorIds={investorIds} selectedDealId={selectedDealId ?? undefined} />

      {/* Investment Vehicles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{selectedDealId ? 'Deal Vehicle' : 'Investment Vehicles'}</CardTitle>
            <CardDescription>
              {selectedDealId
                ? 'Vehicle associated with the selected deal'
                : 'Your positions across VERSO\'s investment platforms'
              }
            </CardDescription>
          </div>
          <Link href="/versotech_main/portfolio">
            <Button variant="outline" size="sm">
              View All Holdings
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.vehicles.slice(0, 3).map((vehicle) => (
              <Link key={vehicle.id} href={`/versotech_main/portfolio/${vehicle.id}`}>
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

      {/* Removed fake AI recommendations component */}

      {/* Quick Actions & Recent Activity */}
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
            <Link href="/versotech_main/documents">
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
              {data.recentActivity.length > 0 ? (
                data.recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg",
                      activity.read_status ? "bg-slate-50" : "bg-blue-50 border-l-4 border-blue-400"
                    )}
                  >
                    {activity.activity_type === 'document' && <FileText className="h-5 w-5 text-blue-600" />}
                    {activity.activity_type === 'valuation' && <TrendingUp className="h-5 w-5 text-green-600" />}
                    {activity.activity_type === 'distribution' && <Calendar className="h-5 w-5 text-green-600" />}
                    {activity.activity_type === 'deal' && <Building2 className="h-5 w-5 text-amber-600" />}
                    {activity.activity_type === 'message' && <MessageSquare className="h-5 w-5 text-purple-600" />}
                    {activity.activity_type === 'task' && <Clock className="h-5 w-5 text-orange-600" />}
                    {activity.activity_type === 'capital_call' && <Calendar className="h-5 w-5 text-red-600" />}
                    {activity.activity_type === 'allocation' && <Target className="h-5 w-5 text-indigo-600" />}

                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.created_at).toLocaleDateString()} •
                        {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {activity.importance === 'high' && !activity.read_status && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                    {!activity.read_status && activity.importance !== 'high' && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                    {activity.read_status && (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <Link href="/versotech_main/messages">
                <Button variant="ghost" size="sm" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View All Communications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Detail Modal */}
      <KPIDetailModal
        isOpen={showKPIModal}
        onClose={() => {
          setShowKPIModal(false)
          setSelectedKPI(null)
        }}
        kpiData={selectedKPI}
      />
    </div>
  )
}