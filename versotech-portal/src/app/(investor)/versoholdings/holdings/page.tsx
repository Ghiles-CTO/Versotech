import { AppLayout } from '@/components/layout/app-layout'
import { HoldingsPage } from '@/components/holdings/holdings-page'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

  let initialData: any = null

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
        // Manually query vehicle breakdown since RPC function has ambiguity error
        supabase
          .from('vehicles')
          .select(`
            id,
            name,
            type,
            positions!inner(
              units,
              cost_basis,
              last_nav
            ),
            valuations(
              nav_per_unit,
              as_of_date
            )
          `)
          .in('positions.investor_id', investorIds)
          .gt('positions.units', 0)
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
        let breakdownData: any[] = []
        if (breakdownResponse.status === 'fulfilled' && !breakdownResponse.value.error && breakdownResponse.value.data) {
          // Transform the vehicle data into the expected format
          breakdownData = breakdownResponse.value.data.map((vehicle: any) => {
            const position = vehicle.positions?.[0] || {}
            const latestValuation = vehicle.valuations?.sort((a: any, b: any) => 
              new Date(b.as_of_date).getTime() - new Date(a.as_of_date).getTime()
            )[0]
            
            const navPerUnit = latestValuation?.nav_per_unit || position.last_nav || 0
            const units = parseFloat(position.units || 0)
            const currentValue = units * parseFloat(navPerUnit)
            
            return {
              vehicle_id: vehicle.id,
              vehicle_name: vehicle.name,
              vehicle_type: vehicle.type,
              current_value: currentValue.toFixed(2),
              units: units,
              cost_basis: parseFloat(position.cost_basis || 0),
              nav_per_unit: navPerUnit
            }
          })
        }

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
      <HoldingsPage initialData={initialData} />
    </AppLayout>
  )
}

