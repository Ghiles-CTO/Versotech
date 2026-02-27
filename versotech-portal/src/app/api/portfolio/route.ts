import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'
import {
  computePositionMetrics,
  resolveCurrentPricePerShare,
  summarizeSubscriptions,
  toNumber
} from '@/lib/portfolio/investor-metrics'

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
        .select('investor_id, vehicle_id, units, cost_basis, last_nav')
        .in('investor_id', investorIds)
        .gt('units', 0)

      const { data: subscriptions } = await serviceSupabase
        .from('subscriptions')
        .select('id, investor_id, vehicle_id, commitment, funded_amount, currency, status, performance_fee_tier1_percent, price_per_share, effective_date, funding_due_at, committed_at, created_at')
        .in('investor_id', investorIds)

      const { data: cashflows } = await serviceSupabase
        .from('cashflows')
        .select('investor_id, vehicle_id, amount, type')
        .in('investor_id', investorIds)

      const vehicleIds = Array.from(
        new Set([
          ...(positions || []).map((p) => p.vehicle_id).filter(Boolean),
          ...(subscriptions || []).map((s) => s.vehicle_id).filter(Boolean),
          ...(cashflows || []).map((c) => c.vehicle_id).filter(Boolean)
        ])
      )

      const { data: vehicles } = vehicleIds.length
        ? await serviceSupabase
            .from('vehicles')
            .select('id, currency')
            .in('id', vehicleIds)
        : { data: [] }

      const vehicleCurrency = new Map<string, string>()
      ;(vehicles || []).forEach((v) => {
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
      ;(valuations || []).forEach((valuation) => {
        const parsedNav = toNumber(valuation.nav_per_unit)
        if (valuation.vehicle_id && !latestValuation.has(valuation.vehicle_id) && parsedNav !== null && parsedNav > 0) {
          latestValuation.set(valuation.vehicle_id, parsedNav)
        }
      })

      const pairToSubscriptions = new Map<string, any[]>()
      ;(subscriptions || []).forEach((sub) => {
        if (!sub.vehicle_id || !sub.investor_id) return
        const key = `${sub.investor_id}:${sub.vehicle_id}`
        const existing = pairToSubscriptions.get(key)
        if (existing) {
          existing.push(sub)
        } else {
          pairToSubscriptions.set(key, [sub])
        }
      })

      const pairToSummary = new Map<string, ReturnType<typeof summarizeSubscriptions>>()
      pairToSubscriptions.forEach((items, key) => {
        pairToSummary.set(
          key,
          summarizeSubscriptions(items, items[0]?.currency || vehicleCurrency.get(items[0]?.vehicle_id) || 'USD')
        )
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

      const positionPairs = new Set<string>()

      ;(positions || []).forEach((position) => {
        const units = toNumber(position.units) ?? 0
        if (units <= 0 || !position.vehicle_id || !position.investor_id) return

        const pairKey = `${position.investor_id}:${position.vehicle_id}`
        positionPairs.add(pairKey)
        const summary = pairToSummary.get(pairKey) || summarizeSubscriptions([], vehicleCurrency.get(position.vehicle_id) || 'USD')

        const fallbackCostBasis = toNumber(position.cost_basis) ?? 0
        const subscriptionAmount = summary.commitmentTotal > 0 ? summary.commitmentTotal : fallbackCostBasis
        const currentPricePerShare = resolveCurrentPricePerShare({
          latestValuationNav: latestValuation.get(position.vehicle_id) ?? null,
          subscriptionPricePerShare: summary.pricePerShare,
          subscriptionAmount,
          units,
          positionLastNav: position.last_nav
        })
        const metrics = computePositionMetrics({
          units,
          subscriptionAmount,
          currentPricePerShare,
          performanceFeeRate: summary.performanceFeeRate
        })

        const currency = summary.currency || vehicleCurrency.get(position.vehicle_id) || 'USD'
        const entry = ensure(currency)
        entry.current_nav += metrics.currentValue
        entry.total_cost_basis += metrics.subscriptionAmount
        entry.total_positions += 1
        entry.total_commitment += summary.commitmentTotal
        entry.vehicles.add(position.vehicle_id)
      })

      pairToSummary.forEach((summary, pairKey) => {
        if (positionPairs.has(pairKey) || summary.commitmentTotal <= 0) return
        const [, vehicleId] = pairKey.split(':')
        const currency = summary.currency || vehicleCurrency.get(vehicleId) || 'USD'
        const entry = ensure(currency)
        entry.total_commitment += summary.commitmentTotal
        if (vehicleId) entry.vehicles.add(vehicleId)
      })

      ;(cashflows || []).forEach((cashflow) => {
        const currency = vehicleCurrency.get(cashflow.vehicle_id) || 'USD'
        const entry = ensure(currency)
        const amount = toNumber(cashflow.amount) ?? 0
        if (cashflow.type === 'call') {
          entry.total_contributed += amount
        } else if (cashflow.type === 'distribution') {
          entry.total_distributions += amount
        }
      })

      const entries: CurrencyBreakdownEntry[] = []
      for (const [currency, entry] of breakdown.entries()) {
        const unfunded = Math.max(entry.total_commitment - entry.total_contributed, 0)
        const hasPositionExposure = entry.total_positions > 0 && entry.total_cost_basis > 0
        const subscriptionAmount = hasPositionExposure ? entry.total_cost_basis : 0
        const unrealizedGain = hasPositionExposure ? entry.current_nav - subscriptionAmount : 0
        const unrealizedGainPct = subscriptionAmount > 0 ? (unrealizedGain / subscriptionAmount) * 100 : 0
        const dpi = entry.total_contributed > 0 ? entry.total_distributions / entry.total_contributed : 0
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

    const buildVehicleBreakdown = async (): Promise<VehicleBreakdown[]> => {
      const { data: positions } = await serviceSupabase
        .from('positions')
        .select('investor_id, vehicle_id, units, cost_basis, last_nav, as_of_date')
        .in('investor_id', investorIds)
        .gt('units', 0)

      if (!positions || positions.length === 0) {
        return []
      }

      const vehicleIds = Array.from(new Set(positions.map((position) => position.vehicle_id).filter(Boolean)))

      const [vehiclesResponse, subscriptionsResponse, valuationsResponse, cashflowsResponse] = await Promise.all([
        serviceSupabase
          .from('vehicles')
          .select('id, name, type, logo_url, currency')
          .in('id', vehicleIds),
        serviceSupabase
          .from('subscriptions')
          .select('id, investor_id, vehicle_id, commitment, funded_amount, currency, status, performance_fee_tier1_percent, price_per_share, effective_date, funding_due_at, committed_at, created_at')
          .in('investor_id', investorIds)
          .in('vehicle_id', vehicleIds),
        serviceSupabase
          .from('valuations')
          .select('vehicle_id, nav_per_unit, as_of_date')
          .in('vehicle_id', vehicleIds)
          .order('as_of_date', { ascending: false }),
        serviceSupabase
          .from('cashflows')
          .select('investor_id, vehicle_id, amount, type')
          .in('investor_id', investorIds)
          .in('vehicle_id', vehicleIds)
      ])

      const vehicles = vehiclesResponse.data || []
      const subscriptions = subscriptionsResponse.data || []
      const valuations = valuationsResponse.data || []
      const cashflows = cashflowsResponse.data || []

      const vehicleMeta = new Map<string, any>()
      vehicles.forEach((vehicle) => {
        if (vehicle.id) vehicleMeta.set(vehicle.id, vehicle)
      })

      const latestValuation = new Map<string, { navPerUnit: number; asOfDate: string | null }>()
      valuations.forEach((valuation) => {
        const parsedNav = toNumber(valuation.nav_per_unit)
        if (!valuation.vehicle_id || latestValuation.has(valuation.vehicle_id) || parsedNav === null || parsedNav <= 0) {
          return
        }
        latestValuation.set(valuation.vehicle_id, {
          navPerUnit: parsedNav,
          asOfDate: valuation.as_of_date || null
        })
      })

      const pairToSubscriptions = new Map<string, any[]>()
      subscriptions.forEach((sub) => {
        if (!sub.vehicle_id || !sub.investor_id) return
        const key = `${sub.investor_id}:${sub.vehicle_id}`
        const existing = pairToSubscriptions.get(key)
        if (existing) {
          existing.push(sub)
        } else {
          pairToSubscriptions.set(key, [sub])
        }
      })

      const pairToSummary = new Map<string, ReturnType<typeof summarizeSubscriptions>>()
      pairToSubscriptions.forEach((items, key) => {
        pairToSummary.set(
          key,
          summarizeSubscriptions(items, items[0]?.currency || vehicleMeta.get(items[0]?.vehicle_id)?.currency || 'USD')
        )
      })

      const vehicleTotals = new Map<string, {
        currentValue: number
        costBasis: number
        units: number
        commitment: number
        contributed: number
        distributed: number
        weightedPriceSum: number
        weightedUnits: number
        fallbackDate: string | null
      }>()

      const ensureVehicle = (vehicleId: string) => {
        if (!vehicleTotals.has(vehicleId)) {
          vehicleTotals.set(vehicleId, {
            currentValue: 0,
            costBasis: 0,
            units: 0,
            commitment: 0,
            contributed: 0,
            distributed: 0,
            weightedPriceSum: 0,
            weightedUnits: 0,
            fallbackDate: null
          })
        }
        return vehicleTotals.get(vehicleId)!
      }

      positions.forEach((position) => {
        if (!position.vehicle_id || !position.investor_id) return
        const units = toNumber(position.units) ?? 0
        if (units <= 0) return

        const pairKey = `${position.investor_id}:${position.vehicle_id}`
        const summary = pairToSummary.get(pairKey)
          || summarizeSubscriptions([], vehicleMeta.get(position.vehicle_id)?.currency || 'USD')

        const fallbackCostBasis = toNumber(position.cost_basis) ?? 0
        const subscriptionAmount = summary.commitmentTotal > 0 ? summary.commitmentTotal : fallbackCostBasis
        const currentPricePerShare = resolveCurrentPricePerShare({
          latestValuationNav: latestValuation.get(position.vehicle_id)?.navPerUnit ?? null,
          subscriptionPricePerShare: summary.pricePerShare,
          subscriptionAmount,
          units,
          positionLastNav: position.last_nav
        })
        const metrics = computePositionMetrics({
          units,
          subscriptionAmount,
          currentPricePerShare,
          performanceFeeRate: summary.performanceFeeRate
        })

        const entry = ensureVehicle(position.vehicle_id)
        entry.currentValue += metrics.currentValue
        entry.costBasis += metrics.subscriptionAmount
        entry.units += metrics.units
        entry.commitment += summary.commitmentTotal
        entry.weightedPriceSum += metrics.currentPricePerShare * metrics.units
        entry.weightedUnits += metrics.units
        if (!entry.fallbackDate && position.as_of_date) {
          entry.fallbackDate = position.as_of_date
        }
      })

      cashflows.forEach((cashflow) => {
        if (!cashflow.vehicle_id) return
        const entry = ensureVehicle(cashflow.vehicle_id)
        const amount = toNumber(cashflow.amount) ?? 0
        if (cashflow.type === 'call') {
          entry.contributed += amount
        } else if (cashflow.type === 'distribution') {
          entry.distributed += amount
        }
      })

      const result: VehicleBreakdown[] = []
      vehicleTotals.forEach((entry, vehicleId) => {
        const meta = vehicleMeta.get(vehicleId)
        const valuation = latestValuation.get(vehicleId)
        const navPerUnit = valuation?.navPerUnit
          ?? (entry.weightedUnits > 0 ? entry.weightedPriceSum / entry.weightedUnits : 0)
        const unrealizedGain = entry.currentValue - entry.costBasis
        const unrealizedGainPct = entry.costBasis > 0 ? (unrealizedGain / entry.costBasis) * 100 : 0

        result.push({
          vehicleId,
          vehicleName: meta?.name || 'Unknown Vehicle',
          vehicleType: meta?.type || 'fund',
          logoUrl: meta?.logo_url || null,
          currentValue: Math.round(entry.currentValue),
          costBasis: Math.round(entry.costBasis),
          units: entry.units,
          unrealizedGain: Math.round(unrealizedGain),
          unrealizedGainPct: Math.round(unrealizedGainPct * 100) / 100,
          commitment: Math.round(entry.commitment),
          contributed: Math.round(entry.contributed),
          distributed: Math.round(entry.distributed),
          navPerUnit,
          lastValuationDate: valuation?.asOfDate || entry.fallbackDate || null,
          currency: meta?.currency || null
        })
      })

      return result.sort((left, right) => right.currentValue - left.currentValue)
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

    const currentNAV = Math.round(parseFloat(kpiResult.current_nav) || 0)
    const totalCommitment = Math.round(parseFloat(kpiResult.total_commitment) || 0)
    const fallbackCostBasis = Math.round(parseFloat(kpiResult.total_cost_basis) || 0)
    const subscriptionAmount = totalCommitment > 0 ? totalCommitment : fallbackCostBasis
    const unrealizedGain = currentNAV - subscriptionAmount
    const unrealizedGainPct = subscriptionAmount > 0 ? (unrealizedGain / subscriptionAmount) * 100 : 0

    // Prepare KPI response with proper number formatting
    let kpis: PortfolioKPIs = {
      currentNAV,
      totalContributed: Math.round(parseFloat(kpiResult.total_contributed) || 0),
      totalDistributions: Math.round(parseFloat(kpiResult.total_distributions) || 0),
      unfundedCommitment: Math.round(parseFloat(kpiResult.unfunded_commitment) || 0),
      totalCommitment,
      totalCostBasis: subscriptionAmount,
      unrealizedGain: Math.round(unrealizedGain),
      unrealizedGainPct: Math.round(unrealizedGainPct * 100) / 100,
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
    if (currencyBreakdown.length > 0) {
      const aggregate = currencyBreakdown.reduce(
        (acc, entry) => {
          acc.currentNAV += entry.kpis.currentNAV
          acc.totalContributed += entry.kpis.totalContributed
          acc.totalDistributions += entry.kpis.totalDistributions
          acc.unfundedCommitment += entry.kpis.unfundedCommitment
          acc.totalCommitment += entry.kpis.totalCommitment
          acc.totalCostBasis += entry.kpis.totalCostBasis
          acc.totalPositions += entry.summary.totalPositions
          acc.totalVehicles += entry.summary.totalVehicles
          return acc
        },
        {
          currentNAV: 0,
          totalContributed: 0,
          totalDistributions: 0,
          unfundedCommitment: 0,
          totalCommitment: 0,
          totalCostBasis: 0,
          totalPositions: 0,
          totalVehicles: 0
        }
      )

      const unrealizedGain = aggregate.currentNAV - aggregate.totalCostBasis
      const unrealizedGainPct = aggregate.totalCostBasis > 0
        ? (unrealizedGain / aggregate.totalCostBasis) * 100
        : 0
      const dpi = aggregate.totalContributed > 0
        ? aggregate.totalDistributions / aggregate.totalContributed
        : 0
      const tvpi = aggregate.totalContributed > 0
        ? (aggregate.currentNAV + aggregate.totalDistributions) / aggregate.totalContributed
        : 0
      const irr = aggregate.totalContributed > 0 && tvpi > 1
        ? Math.min(Math.max((tvpi - 1) * 10, 0), 100)
        : 0

      kpis = {
        currentNAV: Math.round(aggregate.currentNAV),
        totalContributed: Math.round(aggregate.totalContributed),
        totalDistributions: Math.round(aggregate.totalDistributions),
        unfundedCommitment: Math.round(aggregate.unfundedCommitment),
        totalCommitment: Math.round(aggregate.totalCommitment),
        totalCostBasis: Math.round(aggregate.totalCostBasis),
        unrealizedGain: Math.round(unrealizedGain),
        unrealizedGainPct: Math.round(unrealizedGainPct * 100) / 100,
        dpi: Math.round(dpi * 10000) / 10000,
        tvpi: Math.round(tvpi * 10000) / 10000,
        irr: Math.round(irr * 100) / 100
      }

      response.kpis = kpis
      response.hasData = kpis.currentNAV > 0 || kpis.totalContributed > 0
      response.summary.totalPositions = aggregate.totalPositions
      response.summary.totalVehicles = aggregate.totalVehicles
    }

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
        buildVehicleBreakdown().then(data => ({
          type: 'breakdown',
          result: { data, error: null }
        }))
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
              .map((vehicle: any) => vehicle.vehicleId || vehicle.vehicle_id || vehicle.id)
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
              const vehicleId = vehicle.vehicleId || vehicle.vehicle_id || vehicle.id
              return {
                vehicleId,
                vehicleName: vehicle.vehicleName || vehicle.name || vehicle.vehicle_name,
                vehicleType: vehicle.vehicleType || vehicle.vehicle_type || 'fund',
                logoUrl: vehicle.logoUrl || vehicle.logo_url || null,
                currentValue: Math.round(parseFloat(vehicle.currentValue ?? vehicle.current_value) || 0),
                costBasis: Math.round(parseFloat(vehicle.costBasis ?? vehicle.cost_basis) || 0),
                units: parseFloat(vehicle.units) || 0,
                unrealizedGain: Math.round(parseFloat(vehicle.unrealizedGain ?? vehicle.unrealized_gain) || 0),
                unrealizedGainPct: Math.round((parseFloat(vehicle.unrealizedGainPct ?? vehicle.unrealized_gain_pct) || 0) * 100) / 100,
                commitment: Math.round(parseFloat(vehicle.commitment) || 0),
                contributed: Math.round(parseFloat(vehicle.contributed) || 0),
                distributed: Math.round(parseFloat(vehicle.distributed) || 0),
                navPerUnit: parseFloat(vehicle.navPerUnit ?? vehicle.nav_per_unit) || 0,
                lastValuationDate: vehicle.lastValuationDate || vehicle.as_of_date || null,
                currency: currencyMap[vehicleId] || vehicle.currency || null
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
