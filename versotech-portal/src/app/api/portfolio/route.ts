import { createClient, createServiceClient } from '@/lib/supabase/server'
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

interface CurrencyBreakdownEntry {
  currency: string
  kpis: PortfolioKPIs
  summary: {
    totalPositions: number
    totalVehicles: number
  }
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
  currency?: string | null
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

    // Get investor entities linked to this user
    // Check investor_users linkage FIRST - this supports dual-persona users
    // who may have a different profile.role but ARE linked to investor entities
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    // If no investor linkage exists, check if user has investor role as fallback
    // If no investor links, return empty portfolio data
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

    // Service client for currency-aware aggregation (avoids RLS issues)
    const serviceSupabase = createServiceClient()

    const buildCurrencyBreakdown = async (): Promise<CurrencyBreakdownEntry[]> => {
      const { data: positions } = await serviceSupabase
        .from('positions')
        .select('vehicle_id, units, cost_basis, last_nav')
        .in('investor_id', investorIds)

      const { data: subscriptions } = await serviceSupabase
        .from('subscriptions')
        .select('vehicle_id, commitment, status, currency')
        .in('investor_id', investorIds)

      const { data: cashflows } = await serviceSupabase
        .from('cashflows')
        .select('vehicle_id, amount, type')
        .in('investor_id', investorIds)

      const vehicleIds = Array.from(
        new Set([
          ...(positions || []).map(p => p.vehicle_id).filter(Boolean),
          ...(subscriptions || []).map(s => s.vehicle_id).filter(Boolean),
          ...(cashflows || []).map(c => c.vehicle_id).filter(Boolean)
        ])
      )

      const { data: vehicles } = vehicleIds.length
        ? await serviceSupabase
            .from('vehicles')
            .select('id, currency')
            .in('id', vehicleIds)
        : { data: [] }

      const vehicleCurrency = new Map<string, string>()
      ;(vehicles || []).forEach(v => {
        if (v.id) vehicleCurrency.set(v.id, v.currency || 'USD')
      })

      const { data: valuations } = vehicleIds.length
        ? await serviceSupabase
            .from('valuations')
            .select('vehicle_id, nav_per_unit, as_of_date')
            .in('vehicle_id', vehicleIds)
            .order('as_of_date', { ascending: false })
        : { data: [] }

      const latestValuation = new Map<string, number>()
      ;(valuations || []).forEach(v => {
        if (v.vehicle_id && !latestValuation.has(v.vehicle_id) && v.nav_per_unit !== null) {
          latestValuation.set(v.vehicle_id, parseFloat(v.nav_per_unit))
        }
      })

      const breakdown = new Map<string, {
        current_nav: number
        total_contributed: number
        total_distributions: number
        total_commitment: number
        total_cost_basis: number
        total_positions: number
        vehicles: Set<string>
      }>()

      const ensure = (currency: string) => {
        if (!breakdown.has(currency)) {
          breakdown.set(currency, {
            current_nav: 0,
            total_contributed: 0,
            total_distributions: 0,
            total_commitment: 0,
            total_cost_basis: 0,
            total_positions: 0,
            vehicles: new Set()
          })
        }
        return breakdown.get(currency)!
      }

      ;(positions || []).forEach(p => {
        const units = parseFloat(p.units || 0)
        if (units <= 0) return
        const currency = vehicleCurrency.get(p.vehicle_id) || 'USD'
        const entry = ensure(currency)
        const navPerUnit = latestValuation.get(p.vehicle_id) ?? (p.last_nav ? parseFloat(p.last_nav) : 0)
        entry.current_nav += units * (navPerUnit || 0)
        entry.total_cost_basis += parseFloat(p.cost_basis || 0)
        entry.total_positions += 1
        if (p.vehicle_id) entry.vehicles.add(p.vehicle_id)
      })

      ;(subscriptions || []).forEach(s => {
        if (!['active', 'pending'].includes(s.status || '')) return
        const currency = s.currency || vehicleCurrency.get(s.vehicle_id) || 'USD'
        const entry = ensure(currency)
        entry.total_commitment += parseFloat(s.commitment || 0)
      })

      ;(cashflows || []).forEach(cf => {
        const currency = vehicleCurrency.get(cf.vehicle_id) || 'USD'
        const entry = ensure(currency)
        if (cf.type === 'call') {
          entry.total_contributed += parseFloat(cf.amount || 0)
        } else if (cf.type === 'distribution') {
          entry.total_distributions += parseFloat(cf.amount || 0)
        }
      })

      const entries: CurrencyBreakdownEntry[] = []
      for (const [currency, entry] of breakdown.entries()) {
        const unfunded = Math.max(entry.total_commitment - entry.total_contributed, 0)
        const unrealizedGain = entry.current_nav - entry.total_cost_basis
        const unrealizedGainPct = entry.total_cost_basis > 0
          ? (unrealizedGain / entry.total_cost_basis) * 100
          : 0
        const dpi = entry.total_contributed > 0
          ? entry.total_distributions / entry.total_contributed
          : 0
        const tvpi = entry.total_contributed > 0
          ? (entry.current_nav + entry.total_distributions) / entry.total_contributed
          : 0
        const irr = entry.total_contributed > 0 && tvpi > 1
          ? Math.min(Math.max((tvpi - 1) * 10, 0), 100)
          : 0

        entries.push({
          currency,
          kpis: {
            currentNAV: Math.round(entry.current_nav),
            totalContributed: Math.round(entry.total_contributed),
            totalDistributions: Math.round(entry.total_distributions),
            unfundedCommitment: Math.round(unfunded),
            totalCommitment: Math.round(entry.total_commitment),
            totalCostBasis: Math.round(entry.total_cost_basis),
            unrealizedGain: Math.round(unrealizedGain),
            unrealizedGainPct: Math.round(unrealizedGainPct * 100) / 100,
            dpi: Math.round(dpi * 10000) / 10000,
            tvpi: Math.round(tvpi * 10000) / 10000,
            irr: Math.round(irr * 100) / 100
          },
          summary: {
            totalPositions: entry.total_positions,
            totalVehicles: entry.vehicles.size
          }
        })
      }

      return entries.sort((a, b) => a.currency.localeCompare(b.currency))
    }

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

    const currencyBreakdown = await buildCurrencyBreakdown()
    response.currencyBreakdown = currencyBreakdown
    response.hasMixedCurrency = currencyBreakdown.length > 1
    response.primaryCurrency = currencyBreakdown.length === 1 ? currencyBreakdown[0].currency : null

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
            const breakdownVehicleIds = queryResult.data
              .map((vehicle: any) => vehicle.vehicle_id || vehicle.id)
              .filter(Boolean)

            const currencyMap: Record<string, string> = {}
            if (breakdownVehicleIds.length) {
              const { data: vehicleRows } = await serviceSupabase
                .from('vehicles')
                .select('id, currency')
                .in('id', breakdownVehicleIds)
              vehicleRows?.forEach((v: any) => {
                if (v.id) currencyMap[v.id] = v.currency || 'USD'
              })
            }

            response.vehicleBreakdown = queryResult.data.map((vehicle: any): VehicleBreakdown => {
              const vehicleId = vehicle.vehicle_id || vehicle.id
              return {
                vehicleId,
                vehicleName: vehicle.name || vehicle.vehicle_name,
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
                lastValuationDate: vehicle.as_of_date || null,
                currency: currencyMap[vehicleId] || null
              }
            })
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
