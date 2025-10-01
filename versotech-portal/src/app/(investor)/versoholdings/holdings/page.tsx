import { AppLayout } from '@/components/layout/app-layout'
import { EnhancedHoldingsPage } from '@/components/holdings/enhanced-holdings-page'
import { createClient } from '@/lib/supabase/server'

export default async function InvestorHoldings() {
  const supabase = await createClient()

  // Get current user - AppLayout already handles auth checks
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) {
    throw new Error('Authentication required')
  }

  // Get investor entities linked to this user
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  let initialData = null

  if (investorLinks && investorLinks.length > 0) {
    const investorIds = investorLinks.map(link => link.investor_id)

    try {
      
      // Optimize: Fetch all data in parallel instead of sequential
      const [kpiResponse, trendsResponse, breakdownResponse] = await Promise.allSettled([
        supabase.rpc('calculate_investor_kpis_with_deals', {
          investor_ids: investorIds
        }),
        supabase.rpc('get_portfolio_trends', {
          investor_ids: investorIds,
          days_back: 30
        }),
        supabase.rpc('get_investor_vehicle_breakdown', {
          investor_ids: investorIds
        })
      ])

      // Process KPI data with fallback
      let kpiData = null
      if (kpiResponse.status === 'fulfilled' && !kpiResponse.value.error) {
        kpiData = kpiResponse.value.data
      } else {

        const fallbackResponse = await supabase.rpc('calculate_investor_kpis', {
          investor_ids: investorIds
        })

        if (fallbackResponse.error) {
          throw fallbackResponse.error
        }

        // Extend fallback data with deal-specific fields
        kpiData = fallbackResponse.data?.map((row: any) => ({
          ...row,
          total_deals: 0,
          total_deal_value: 0,
          pending_allocations: 0
        }))
      }

      if (kpiData?.[0]) {
        const kpiResult = kpiData[0]

        // Process trends data
        const trendsData = trendsResponse.status === 'fulfilled' && !trendsResponse.value.error 
          ? trendsResponse.value.data 
          : null

        // Process breakdown data
        const breakdownData = breakdownResponse.status === 'fulfilled' && !breakdownResponse.value.error
          ? breakdownResponse.value.data
          : null

        // Prepare initial data for client component
        initialData = {
          kpis: {
            currentNAV: Math.round(parseFloat(kpiResult.current_nav) || 0),
            totalContributed: Math.round(parseFloat(kpiResult.total_contributed) || 0),
            totalDistributions: Math.round(parseFloat(kpiResult.total_distributions) || 0),
            unfundedCommitment: Math.round(parseFloat(kpiResult.unfunded_commitment) || 0),
            totalCommitment: Math.round(parseFloat(kpiResult.total_commitment) || 0),
            totalCostBasis: Math.round(parseFloat(kpiResult.total_cost_basis) || 0),
            unrealizedGain: Math.round(parseFloat(kpiResult.unrealized_gain) || 0),
            unrealizedGainPct: Math.round((parseFloat(kpiResult.unrealized_gain_pct) || 0) * 100) / 100,
            dpi: Math.round((parseFloat(kpiResult.dpi) || 0) * 10000) / 10000,
            tvpi: Math.round((parseFloat(kpiResult.tvpi) || 0) * 10000) / 10000,
            irr: Math.round((parseFloat(kpiResult.irr_estimate) || 0) * 100) / 100
          },
          trends: trendsData?.[0] ? {
            navChange: Math.round(parseFloat(trendsData[0].nav_change) || 0),
            navChangePct: Math.round((parseFloat(trendsData[0].nav_change_pct) || 0) * 100) / 100,
            performanceChange: Math.round((parseFloat(trendsData[0].performance_change) || 0) * 100) / 100,
            periodDays: parseInt(trendsData[0].period_days) || 30
          } : undefined,
          summary: {
            totalPositions: parseInt(kpiResult.total_positions) || 0,
            totalVehicles: parseInt(kpiResult.total_vehicles) || 0,
            totalDeals: parseInt(kpiResult.total_deals) || 0,
            totalDealValue: Math.round(parseFloat(kpiResult.total_deal_value) || 0),
            pendingAllocations: parseInt(kpiResult.pending_allocations) || 0,
            lastUpdated: new Date().toISOString()
          },
          asOfDate: new Date().toISOString(),
          vehicleBreakdown: breakdownData || []
        }
      }
    } catch (error) {
      console.error('Error fetching initial portfolio data:', error)
      // Let the client component handle the data fetching
    }
  }

  return (
    <AppLayout brand="versoholdings">
      <EnhancedHoldingsPage initialData={initialData} />
    </AppLayout>
  )
}

