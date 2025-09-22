import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
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
        positions (
          units,
          cost_basis,
          last_nav,
          as_of_date
        ),
        valuations (
          nav_total,
          nav_per_unit,
          as_of_date
        )
      `)

    // For investors, only show vehicles they have access to
    if (profile.role === 'investor') {
      // Get investor entities linked to this user
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      if (!investorLinks || investorLinks.length === 0) {
        return NextResponse.json({
          vehicles: [],
          total: 0
        })
      }

      const investorIds = investorLinks.map(link => link.investor_id)
      vehiclesQuery = vehiclesQuery.in('subscriptions.investor_id', investorIds)
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
    const enhancedVehicles = vehicles?.map(vehicle => {
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
    }) || []

    return NextResponse.json({
      vehicles: enhancedVehicles,
      total: enhancedVehicles.length
    })

  } catch (error) {
    console.error('Vehicles API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}