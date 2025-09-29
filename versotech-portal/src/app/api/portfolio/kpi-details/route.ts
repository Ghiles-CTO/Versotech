import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'

// Type definitions for KPI details response
interface KPIDetail {
  id: string
  name: string
  type: string
  value: number
  percentage: number
  metadata: {
    units?: number
    nav_per_unit?: number
    cost_basis?: number
    last_valuation_date?: string
    commitment?: number
    currency?: string
    contribution_count?: number
    last_contribution_date?: string
    distribution_count?: number
    last_distribution_date?: string
    status?: string
    company_name?: string
    sector?: string
    unit_price?: number
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const kpiType = searchParams.get('type') || 'nav_breakdown'

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
      return NextResponse.json({
        items: [],
        total: 0,
        kpiType,
        asOfDate: new Date().toISOString()
      })
    }

    const investorIds = investorLinks.map(link => link.investor_id)
    let items: KPIDetail[] = []
    let total = 0

    console.log(`Processing KPI details for type: ${kpiType}, investor IDs: ${investorIds.length}`)

    // First, let's get a count of actual holdings to validate our data against
    const { data: holdingsCount } = await supabase
      .from('positions')
      .select('id, vehicle_id, units, cost_basis')
      .in('investor_id', investorIds)
      .gt('units', 0)

    console.log(`Total holdings for investor: ${holdingsCount?.length || 0} positions`)

    switch (kpiType) {
      case 'nav_breakdown':
        // Try enhanced function first, fallback to manual query
        let { data: vehicleBreakdown, error: vehicleError } = await supabase
          .rpc('get_investor_vehicle_breakdown', {
            investor_ids: investorIds
          })

        console.log(`Vehicle breakdown query result: ${vehicleBreakdown?.length || 0} vehicles, error:`, vehicleError)

        if (vehicleError) {
          console.warn('Enhanced vehicle breakdown failed, using fallback:', vehicleError)
          
          // Fallback: Manual query combining positions, vehicles, and valuations
          console.log('Using manual fallback query for vehicle breakdown...')
          
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('positions')
            .select(`
              id,
              units,
              cost_basis,
              last_nav,
              as_of_date,
              vehicle_id,
              vehicles!inner (
                id,
                name,
                type,
                currency,
                domicile
              )
            `)
            .in('investor_id', investorIds)
            .gt('units', 0)

          console.log(`Fallback query result: ${fallbackData?.length || 0} positions, error:`, fallbackError)

          if (fallbackError) {
            console.error('Fallback query also failed:', fallbackError)
            return NextResponse.json({
              items: [],
              total: 0,
              kpiType,
              asOfDate: new Date().toISOString(),
              error: 'Failed to fetch vehicle data'
            })
          }

          if (fallbackData) {
            console.log(`Fallback positions data: ${fallbackData.length} positions found`)
            
            // Get latest valuations for these vehicles
            const vehicleIds = fallbackData.map(p => p.vehicle_id).filter(Boolean)
            console.log(`Looking up valuations for ${vehicleIds.length} vehicles:`, vehicleIds)
            
            const [valuationsResponse, subscriptionsResponse] = await Promise.allSettled([
              supabase
                .from('valuations')
                .select('vehicle_id, nav_per_unit, as_of_date')
                .in('vehicle_id', vehicleIds)
                .order('as_of_date', { ascending: false }),
              supabase
                .from('subscriptions')
                .select('vehicle_id, commitment, status, created_at')
                .in('vehicle_id', vehicleIds)
                .in('investor_id', investorIds)
            ])

            const latestValuations = valuationsResponse.status === 'fulfilled' ? valuationsResponse.value.data : []
            const subscriptions = subscriptionsResponse.status === 'fulfilled' ? subscriptionsResponse.value.data : []

            console.log(`Valuations query result: ${latestValuations?.length || 0} valuations`)
            console.log(`Subscriptions query result: ${subscriptions?.length || 0} subscriptions`)

            const valuationMap = latestValuations?.reduce((acc, val) => {
              if (!acc[val.vehicle_id]) {
                acc[val.vehicle_id] = val
              }
              return acc
            }, {} as any) || {}

            const subscriptionMap = subscriptions?.reduce((acc, sub) => {
              acc[sub.vehicle_id] = sub
              return acc
            }, {} as any) || {}

            vehicleBreakdown = fallbackData.map((position: any) => {
              const vehicle = position.vehicles
              const subscription = subscriptionMap[position.vehicle_id]
              const latestVal = valuationMap[position.vehicle_id]
              const navPerUnit = latestVal?.nav_per_unit || position.last_nav || 100 // Default to $100 if no NAV
              const currentValue = position.units * navPerUnit

              console.log(`Processing vehicle ${vehicle.name}: ${position.units} units @ $${navPerUnit} = $${currentValue}`)

      return {
                vehicle_id: position.vehicle_id,
                vehicle_name: vehicle.name,
                vehicle_type: vehicle.type,
                current_value: currentValue,
                cost_basis: position.cost_basis || 0,
                units: position.units,
                unrealized_gain: currentValue - (position.cost_basis || 0),
                unrealized_gain_pct: position.cost_basis > 0 ? ((currentValue - position.cost_basis) / position.cost_basis) * 100 : 0,
                commitment: subscription?.commitment || 0,
                nav_per_unit: navPerUnit,
                last_valuation_date: latestVal?.as_of_date || position.as_of_date
              }
            })
            
            console.log(`✅ Processed ${vehicleBreakdown.length} vehicle breakdowns successfully`)
          } else {
            console.error('❌ Fallback query returned no data - this is a serious data issue')
            vehicleBreakdown = []
          }
        }

        if (vehicleBreakdown && vehicleBreakdown.length > 0) {
          items = vehicleBreakdown.map((vehicle: any) => ({
            id: vehicle.vehicle_id,
            name: vehicle.vehicle_name,
            type: vehicle.vehicle_type || 'fund',
            value: parseFloat(vehicle.current_value) || 0,
            percentage: 0, // Will be calculated below
            metadata: {
              units: parseFloat(vehicle.units) || 0,
              nav_per_unit: parseFloat(vehicle.nav_per_unit) || 0,
              cost_basis: parseFloat(vehicle.cost_basis) || 0,
              last_valuation_date: vehicle.last_valuation_date,
              commitment: parseFloat(vehicle.commitment) || 0,
              currency: 'USD'
            }
          }))
          
          total = items.reduce((sum, item) => sum + item.value, 0)
          
          // Calculate percentages
          items = items.map(item => ({
            ...item,
            percentage: total > 0 ? (item.value / total) * 100 : 0
          }))
        }
        break

      case 'contributions_breakdown':
        // Get contributions by vehicle from cashflows table
        const { data: contributions, error: contributionsError } = await supabase
          .from('cashflows')
          .select(`
            vehicle_id,
            amount,
            date,
            vehicles (
              id,
              name,
              type
            )
          `)
          .in('investor_id', investorIds)
          .eq('type', 'call')
          .order('date', { ascending: false })

        console.log(`Contributions query result: ${contributions?.length || 0} cashflows, error:`, contributionsError)
        console.log('Contributions data sample:', contributions?.slice(0, 2))

        if (contributionsError || !contributions || contributions.length === 0) {
          console.warn('No cashflows data found, using position cost basis as fallback')
          console.log('Attempting fallback query for contributions...')
          
          // Fallback: Use cost basis from positions as proxy for contributions
          const { data: positionsData, error: positionsError } = await supabase
            .from('positions')
            .select(`
              id,
              cost_basis,
              as_of_date,
              vehicles (
                id,
                name,
                type
              ),
              subscriptions!inner (
                id,
                commitment,
                status
              )
            `)
            .in('investor_id', investorIds)
            .gt('cost_basis', 0)

          console.log(`Positions fallback query result: ${positionsData?.length || 0} positions, error:`, positionsError)

          if (positionsData && positionsData.length > 0) {
            console.log('Using positions cost basis as contributions proxy for', positionsData.length, 'holdings')
            
            items = positionsData.map((position: any) => ({
              id: position.vehicles.id,
              name: position.vehicles.name,
              type: position.vehicles.type || 'fund',
              value: parseFloat(position.cost_basis) || 0,
              percentage: 0,
              metadata: {
                contribution_count: 1, // Simplified for fallback
                last_contribution_date: position.as_of_date,
                currency: 'USD',
                cost_basis: parseFloat(position.cost_basis) || 0,
                commitment: position.subscriptions?.commitment || 0,
                status: position.subscriptions?.status || 'active',
                note: 'Estimated from cost basis (no cashflow records found)'
              }
            }))
          } else {
            console.error('No positions data found either - this indicates a data issue')
            console.log('Trying direct vehicle subscription query as final fallback...')
            
            // Final fallback: Use subscription commitments as proxy for contributions
            const { data: subscriptionData } = await supabase
              .from('subscriptions')
              .select(`
                id,
                commitment,
                created_at,
                status,
                vehicles (
                  id,
                  name,
                  type
                )
              `)
              .in('investor_id', investorIds)
              .eq('status', 'active')

            if (subscriptionData && subscriptionData.length > 0) {
              console.log(`Final fallback: using ${subscriptionData.length} subscription commitments`)
              
              items = subscriptionData.map((sub: any) => ({
                id: sub.vehicles.id,
                name: sub.vehicles.name,
                type: sub.vehicles.type || 'fund',
                value: parseFloat(sub.commitment) || 0,
                percentage: 0,
                metadata: {
                  contribution_count: 1,
                  last_contribution_date: sub.created_at,
                  currency: 'USD',
                  commitment: parseFloat(sub.commitment) || 0,
                  status: sub.status,
                  note: 'Estimated from subscription commitment (no position or cashflow data found)'
                }
              }))
            }
          }
        } else {
          // Process actual cashflows data
          console.log(`Processing ${contributions.length} actual cashflow contributions`)
          
          const contributionsByVehicle = contributions.reduce((acc: any, contrib: any) => {
            const vehicleId = contrib.vehicle_id
            if (!acc[vehicleId]) {
              acc[vehicleId] = {
                id: vehicleId,
                name: contrib.vehicles?.name || 'Unknown Vehicle',
                type: contrib.vehicles?.type || 'fund',
                value: 0,
                count: 0,
                last_date: contrib.date
              }
            }
            acc[vehicleId].value += parseFloat(contrib.amount) || 0
            acc[vehicleId].count += 1
            // Keep the most recent date
            if (contrib.date > acc[vehicleId].last_date) {
              acc[vehicleId].last_date = contrib.date
            }
            return acc
          }, {})

          items = Object.values(contributionsByVehicle).map((vehicle: any) => ({
            id: vehicle.id,
            name: vehicle.name,
            type: vehicle.type,
            value: vehicle.value,
            percentage: 0,
            metadata: {
              contribution_count: vehicle.count,
              last_contribution_date: vehicle.last_date,
              currency: 'USD',
              source: 'actual_cashflows'
            }
          }))
          
          console.log(`Processed contributions for ${items.length} vehicles from ${contributions.length} cashflows`)
        }

        if (items.length > 0) {
          total = items.reduce((sum, item) => sum + item.value, 0)
          items = items.map(item => ({
            ...item,
            percentage: total > 0 ? (item.value / total) * 100 : 0
          }))
        }
        break

      case 'distributions_breakdown':
        // Get distributions by vehicle
        const { data: distributions, error: distributionsError } = await supabase
          .from('cashflows')
          .select(`
            vehicle_id,
            amount,
            date,
            vehicles (
              id,
              name,
              type
            )
          `)
          .in('investor_id', investorIds)
          .eq('type', 'distribution')
          .order('date', { ascending: false })

        if (distributionsError || !distributions || distributions.length === 0) {
          console.warn('No distribution cashflows found')
          // For distributions, if no data exists, just return empty array
          // This is expected for early-stage investments
          items = []
          total = 0
        } else {
          const distributionsByVehicle = distributions.reduce((acc: any, distrib: any) => {
            const vehicleId = distrib.vehicle_id
            if (!acc[vehicleId]) {
              acc[vehicleId] = {
                id: vehicleId,
                name: distrib.vehicles?.name || 'Unknown Vehicle',
                type: distrib.vehicles?.type || 'fund',
                value: 0,
                count: 0,
                last_date: distrib.date
              }
            }
            acc[vehicleId].value += parseFloat(distrib.amount) || 0
            acc[vehicleId].count += 1
            if (distrib.date > acc[vehicleId].last_date) {
              acc[vehicleId].last_date = distrib.date
            }
            return acc
          }, {})

          items = Object.values(distributionsByVehicle).map((vehicle: any) => ({
            id: vehicle.id,
            name: vehicle.name,
            type: vehicle.type,
            value: vehicle.value,
            percentage: 0,
            metadata: {
              distribution_count: vehicle.count,
              last_distribution_date: vehicle.last_date,
              currency: 'USD'
            }
          }))

          total = items.reduce((sum, item) => sum + item.value, 0)
          
          items = items.map(item => ({
            ...item,
            percentage: total > 0 ? (item.value / total) * 100 : 0
          }))
        }
        break

      case 'deal_breakdown':
        // Get deal allocations (if deals feature is implemented)
        const { data: dealAllocations, error: dealsError } = await supabase
          .from('allocations')
          .select(`
            id,
            units,
            unit_price,
            status,
            deals (
              id,
              name,
              deal_type
            )
          `)
          .in('investor_id', investorIds)
          .in('status', ['approved', 'settled'])

        if (dealsError) {
          console.warn('Deals/allocations table not found or accessible:', dealsError)
          // Return empty result for deal breakdown if deals feature not implemented
          items = []
          total = 0
        } else if (dealAllocations && dealAllocations.length > 0) {
          items = dealAllocations.map((allocation: any) => ({
            id: allocation.id,
            name: allocation.deals?.name || `Deal ${allocation.id.slice(-8)}`,
            type: allocation.deals?.deal_type || 'deal',
            value: (parseFloat(allocation.units) || 0) * (parseFloat(allocation.unit_price) || 0),
            percentage: 0,
            metadata: {
              units: parseFloat(allocation.units) || 0,
              unit_price: parseFloat(allocation.unit_price) || 0,
              status: allocation.status,
              currency: 'USD'
            }
          }))

          total = items.reduce((sum, item) => sum + item.value, 0)
          
          items = items.map(item => ({
            ...item,
            percentage: total > 0 ? (item.value / total) * 100 : 0
          }))
        } else {
          // No deal allocations found
          items = []
          total = 0
        }
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported KPI type' },
          { status: 400 }
        )
    }

    // Sort items by value descending
    items.sort((a, b) => b.value - a.value)

    // Data validation and logging
    console.log(`KPI Details Final Result for ${kpiType}:`, {
      itemCount: items.length,
      totalValue: total,
      sampleItems: items.slice(0, 2).map(item => ({
        name: item.name,
        type: item.type,
        value: item.value,
        hasMetadata: !!item.metadata
      }))
    })

    // Critical data validation - compare with actual holdings count
    const expectedHoldingsCount = holdingsCount?.length || 0
    
    if (kpiType === 'nav_breakdown') {
      if (items.length === 0 && expectedHoldingsCount > 0) {
        console.error(`DATA MISMATCH: NAV breakdown returned 0 items but investor has ${expectedHoldingsCount} holdings!`)
      } else if (items.length !== expectedHoldingsCount) {
        console.warn(`DATA MISMATCH: NAV breakdown returned ${items.length} items but investor has ${expectedHoldingsCount} holdings`)
      } else {
        console.log(`✅ DATA CONSISTENT: NAV breakdown returned ${items.length} items matching ${expectedHoldingsCount} holdings`)
      }
    }
    
    if (kpiType === 'contributions_breakdown') {
      if (items.length === 0 && expectedHoldingsCount > 0) {
        console.error(`DATA MISMATCH: Contributions breakdown returned 0 items but investor has ${expectedHoldingsCount} holdings!`)
      } else {
        console.log(`✅ Contributions breakdown returned ${items.length} items (may be less than ${expectedHoldingsCount} holdings if some have no contributions)`)
      }
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'kpi_details',
      entity_id: user.id,
      metadata: {
        kpi_type: kpiType,
        item_count: items.length,
        total_value: total,
        has_data: items.length > 0
      }
    })

    return NextResponse.json({
      items,
      total,
      kpiType,
      asOfDate: new Date().toISOString(),
      debug: process.env.NODE_ENV === 'development' ? {
        queryType: kpiType,
        itemCount: items.length,
        totalValue: total,
        investorCount: investorIds.length
      } : undefined
    })

  } catch (error) {
    console.error('KPI Details API error:', error)
    console.error('Error details:', {
      kpiType,
      investorIds: investorIds?.length || 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        debug: process.env.NODE_ENV === 'development' ? {
          kpiType,
          investorIds: investorIds?.length || 0,
          errorDetails: error instanceof Error ? error.stack : String(error)
        } : undefined
      },
      { status: 500 }
    )
  }
}