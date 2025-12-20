import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'

// Type definitions for enhanced portfolio response
interface PortfolioKPIs {
  currentNAV: number
  totalContributed: number
  totalDistributions: number
  unfundedCommitment: number
  totalCommitment: number
  totalCostBasis: number
  unrealizedGain: number
  unrealizedGainPct: number
  dpi: number
  tvpi: number
  irr: number
}

interface PortfolioTrends {
  navChange: number
  navChangePct: number
  performanceChange: number
  periodDays: number
}

interface VehicleBreakdown {
  vehicleId: string
  vehicleName: string
  vehicleType: string
  logoUrl?: string | null
  currentValue: number
  costBasis: number
  units: number
  unrealizedGain: number
  unrealizedGainPct: number
  commitment: number
  contributed: number
  distributed: number
  navPerUnit: number
  lastValuationDate: string | null
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeBreakdown = searchParams.get('breakdown') === 'true'
    const includeTrends = searchParams.get('trends') === 'true'

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'investor') {
      return NextResponse.json(
        { error: 'Investor access required' },
        { status: 403 }
      )
    }

    // Get investor entities linked to this user
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      const emptyResponse = {
        kpis: {
          currentNAV: 0,
          totalContributed: 0,
          totalDistributions: 0,
          unfundedCommitment: 0,
          totalCommitment: 0,
          totalCostBasis: 0,
          unrealizedGain: 0,
          unrealizedGainPct: 0,
          dpi: 0,
          tvpi: 0,
          irr: 0
        },
        hasData: false,
        asOfDate: new Date().toISOString(),
        summary: {
          totalPositions: 0,
          totalVehicles: 0,
          lastUpdated: new Date().toISOString()
        }
      }

      if (includeBreakdown) {
        (emptyResponse as any).vehicleBreakdown = []
      }

      if (includeTrends) {
        (emptyResponse as any).trends = {
          navChange: 0,
          navChangePct: 0,
          performanceChange: 0,
          periodDays: 30
        }
      }

      return NextResponse.json(emptyResponse)
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Calculate comprehensive KPIs using enhanced database function that includes deals
    let kpiData: any
    const { data, error: kpiError } = await supabase
      .rpc('calculate_investor_kpis_with_deals', {
        investor_ids: investorIds
      })
    kpiData = data

    if (kpiError) {
      console.error('KPI calculation error:', kpiError)

      // Try fallback to original function if enhanced version fails
      console.log('Attempting fallback to basic KPI calculation...')
      const { data: fallbackKpiData, error: fallbackError } = await supabase
        .rpc('calculate_investor_kpis', {
          investor_ids: investorIds
        })

      if (fallbackError) {
        console.error('Fallback KPI calculation also failed:', fallbackError)
        throw new Error(`Failed to calculate KPIs: ${kpiError.message}`)
      }

      // Use fallback data with extended structure (set deal-specific fields to 0)
      const enhancedFallbackData = fallbackKpiData?.map((row: any) => ({
        ...row,
        total_deals: 0,
        total_deal_value: 0,
        pending_allocations: 0
      }))

      kpiData = enhancedFallbackData
      console.log('Using fallback KPI data')
    }

    const kpiResult = kpiData?.[0]
    if (!kpiResult) {
      throw new Error('No KPI data returned from calculation')
    }

    // Prepare KPI response with proper number formatting
    const kpis: PortfolioKPIs = {
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
    }

    // Base response object
    const response: any = {
      kpis,
      hasData: kpis.currentNAV > 0 || kpis.totalContributed > 0,
      asOfDate: new Date().toISOString(),
      summary: {
        totalPositions: parseInt(kpiResult.total_positions) || 0,
        totalVehicles: parseInt(kpiResult.total_vehicles) || 0,
        totalDeals: parseInt(kpiResult.total_deals) || 0,
        totalDealValue: Math.round(parseFloat(kpiResult.total_deal_value) || 0),
        pendingAllocations: parseInt(kpiResult.pending_allocations) || 0,
        lastUpdated: new Date().toISOString()
      }
    }

    // Optimize: Fetch trends and breakdown in parallel if requested
    const parallelQueries = []
    
    if (includeTrends) {
      parallelQueries.push(
        supabase.rpc('get_portfolio_trends', {
          investor_ids: investorIds,
          days_back: 30
        }).then(result => ({ type: 'trends', result }))
      )
    }

    if (includeBreakdown) {
      parallelQueries.push(
        supabase.rpc('get_investor_vehicle_breakdown', {
          investor_ids: investorIds
        }).then(result => ({ type: 'breakdown', result }))
      )
    }

    if (parallelQueries.length > 0) {
      console.time('parallel-optional-queries')
      
      const results = await Promise.allSettled(parallelQueries)
      
      console.timeEnd('parallel-optional-queries')

      // Process results
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { type, result: queryResult } = result.value
          
          if (type === 'trends' && !queryResult.error && queryResult.data?.[0]) {
            const trendResult = queryResult.data[0]
            response.trends = {
              navChange: Math.round(parseFloat(trendResult.nav_change) || 0),
              navChangePct: Math.round((parseFloat(trendResult.nav_change_pct) || 0) * 100) / 100,
              performanceChange: Math.round((parseFloat(trendResult.performance_change) || 0) * 100) / 100,
              periodDays: parseInt(trendResult.period_days) || 30
            }
            console.log('✅ Portfolio trends calculated successfully')
          } else if (type === 'trends') {
            console.warn('Portfolio trends failed:', queryResult.error)
          }
          
          if (type === 'breakdown' && !queryResult.error && queryResult.data) {
            response.vehicleBreakdown = queryResult.data.map((vehicle: any): VehicleBreakdown => ({
              vehicleId: vehicle.id,
              vehicleName: vehicle.name,
              vehicleType: vehicle.vehicle_type || 'fund',
              logoUrl: vehicle.logo_url || null,
              currentValue: Math.round(parseFloat(vehicle.current_value) || 0),
              costBasis: Math.round(parseFloat(vehicle.cost_basis) || 0),
              units: parseFloat(vehicle.units) || 0,
              unrealizedGain: Math.round(parseFloat(vehicle.unrealized_gain) || 0),
              unrealizedGainPct: Math.round((parseFloat(vehicle.unrealized_gain_pct) || 0) * 100) / 100,
              commitment: Math.round(parseFloat(vehicle.commitment) || 0),
              contributed: Math.round(parseFloat(vehicle.contributed) || 0),
              distributed: Math.round(parseFloat(vehicle.distributed) || 0),
              navPerUnit: parseFloat(vehicle.nav_per_unit) || 0,
              lastValuationDate: vehicle.as_of_date || null
            }))
            console.log(`✅ Vehicle breakdown calculated successfully: ${response.vehicleBreakdown.length} vehicles`)
          } else if (type === 'breakdown') {
            console.warn('Vehicle breakdown failed:', queryResult.error)
          }
        } else {
          console.warn('Parallel query failed:', result.reason)
        }
      }
    }

    // Log portfolio access for audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'portfolio_data',
      entity_id: user.id,
      metadata: {
        endpoint: '/api/portfolio',
        current_nav: kpis.currentNAV,
        position_count: response.summary.totalPositions,
        vehicle_count: response.summary.totalVehicles,
        include_breakdown: includeBreakdown,
        include_trends: includeTrends
      }
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}