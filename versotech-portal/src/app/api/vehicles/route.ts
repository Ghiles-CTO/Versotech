import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeDeals = searchParams.get('includeDeals') === 'true'

    type AllocationQueryResult = {
      id: string
      units: number
      unit_price: number
      status: string
      approved_at: string | null
      deals: {
        id: string
        name: string
        deal_type: string
        status: string
        currency: string | null
        offer_unit_price: number | null
      } | null
      reservations: Array<{
        id: string
        requested_units: number
        status: string
        expires_at: string
      }> | null
    }
    
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

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    let vehiclesQuery = supabase
      .from('vehicles')
      .select(`
        *,
        subscriptions!inner (
          id,
          commitment,
          currency,
          status,
          investor_id
        ),
        positions!inner (
          units,
          cost_basis,
          last_nav,
          as_of_date,
          investor_id
        ),
        valuations (
          nav_total,
          nav_per_unit,
          as_of_date
        )
      `)

    // Get investor entities linked to this user (for all roles, needed for deals)
    let investorIds: string[] = []
    
    if (profile.role === 'investor') {
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      if (!investorLinks || investorLinks.length === 0) {
        return NextResponse.json({
          vehicles: [],
          deals: [],
          total: 0
        })
      }

      investorIds = investorLinks.map(link => link.investor_id)
      vehiclesQuery = vehiclesQuery
        .in('subscriptions.investor_id', investorIds)
        .in('positions.investor_id', investorIds)
    }

    // Apply filters
    const vehicleType = searchParams.get('type')
    if (vehicleType) {
      vehiclesQuery = vehiclesQuery.eq('type', vehicleType)
    }

    const { data: vehicles, error } = await vehiclesQuery

    if (error) {
      console.error('Vehicles query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      )
    }

    // Process and enhance vehicle data
    const enhancedVehicles = (vehicles || []).map(vehicle => {
      // Get the latest valuation
      const latestValuation = vehicle.valuations
        ?.sort((a: { as_of_date: string }, b: { as_of_date: string }) => new Date(b.as_of_date).getTime() - new Date(a.as_of_date).getTime())[0]

      // Calculate position data for investor
      let positionData = null
      if (profile.role === 'investor' && vehicle.positions?.length > 0) {
        const position = vehicle.positions[0] // Should be filtered by investor already
        const currentValue = position.units * (latestValuation?.nav_per_unit || position.last_nav || 0)
        const unrealizedGain = currentValue - (position.cost_basis || 0)
        const unrealizedGainPct = position.cost_basis > 0 ? (unrealizedGain / position.cost_basis) * 100 : 0

        positionData = {
          units: position.units,
          costBasis: position.cost_basis,
          currentValue: Math.round(currentValue),
          unrealizedGain: Math.round(unrealizedGain),
          unrealizedGainPct: Math.round(unrealizedGainPct * 100) / 100,
          lastUpdated: position.as_of_date
        }
      }

      // Get subscription data
      const subscription = vehicle.subscriptions?.[0]

      return {
        id: vehicle.id,
        name: vehicle.name,
        type: vehicle.type,
        domicile: vehicle.domicile,
        currency: vehicle.currency,
        created_at: vehicle.created_at,
        position: positionData,
        subscription: subscription ? {
          commitment: subscription.commitment,
          currency: subscription.currency,
          status: subscription.status
        } : null,
        valuation: latestValuation ? {
          navTotal: latestValuation.nav_total,
          navPerUnit: latestValuation.nav_per_unit,
          asOfDate: latestValuation.as_of_date
        } : null,
        performance: positionData ? {
          unrealizedGainPct: positionData.unrealizedGainPct
        } : null
      }
    }).filter(holding => {
      if (profile.role === 'investor') {
        const units = Number(holding.position?.units ?? 0)
        return units > 0
      }
      return true
    })

    // Fetch deal holdings if requested
    let dealHoldings = []
    
    if (includeDeals && profile.role === 'investor') {
      try {
        const { data: allocations } = await supabase
          .from('allocations')
          .select(`
            id,
            units,
            unit_price,
            status,
            approved_at,
            deals (
              id,
              name,
              deal_type,
              status,
              currency,
              offer_unit_price
            ),
            reservations (
              id,
              requested_units,
              status,
              expires_at
            )
          `)
          .in('investor_id', investorIds)
          .in('status', ['pending_review', 'approved', 'settled'])

        if (allocations) {
          const typedAllocations = allocations as AllocationQueryResult[]

          dealHoldings = typedAllocations.map((allocation) => {
            const deal = allocation.deals
            const currentValue = allocation.units * allocation.unit_price
            const spreadMarkup = allocation.unit_price - (deal?.offer_unit_price || 0)
            
            return {
              id: allocation.id,
              dealId: deal?.id,
              name: deal?.name || 'Unknown Deal',
              type: 'deal',
              dealType: deal?.deal_type || 'equity_secondary',
              status: allocation.status,
              currency: deal?.currency || 'USD',
              allocation: {
                units: allocation.units,
                unitPrice: allocation.unit_price,
                totalValue: currentValue,
                status: allocation.status,
                approvedAt: allocation.approved_at
              },
              spread: {
                markupPerUnit: spreadMarkup,
                totalMarkup: spreadMarkup * allocation.units,
                markupPct: deal?.offer_unit_price > 0 ? (spreadMarkup / deal.offer_unit_price) * 100 : 0
              },
              reservation: allocation.reservations?.[0] ? {
                id: allocation.reservations[0].id,
                requestedUnits: allocation.reservations[0].requested_units,
                status: allocation.reservations[0].status,
                expiresAt: allocation.reservations[0].expires_at
              } : null
            }
          })
        }
      } catch (error) {
        console.warn('Could not fetch deal holdings:', error)
        // Continue without deal data if deals feature not available
      }
    }

    return NextResponse.json({
      vehicles: enhancedVehicles,
      deals: dealHoldings,
      total: enhancedVehicles.length + dealHoldings.length
    })

  } catch (error) {
    console.error('Vehicles API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
