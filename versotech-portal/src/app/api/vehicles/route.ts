import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeRelated = searchParams.get('related') === 'true'

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // If not requesting related data, return simple list
    if (!includeRelated) {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id, name, type, currency, status')
        .order('name', { ascending: true })

      if (error) {
        console.error('Vehicles fetch error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch vehicles' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        vehicles: vehicles || []
      })
    }

    // Get investor IDs for this user
    const serviceSupabase = createServiceClient()
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({
        vehicles: []
      })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Fetch vehicles with related positions, subscriptions, and valuations
    // We use LEFT JOIN to get all related data, then filter in JavaScript
    // This is more efficient than complex database filtering for this use case
    const { data: vehicles, error } = await serviceSupabase
      .from('vehicles')
      .select(`
        id,
        name,
        type,
        domicile,
        currency,
        created_at,
        status,
        positions!left (
          id,
          investor_id,
          units,
          cost_basis,
          last_nav,
          as_of_date
        ),
        subscriptions!left (
          id,
          investor_id,
          commitment,
          currency,
          status,
          effective_date,
          funding_due_at,
          units,
          funded_amount,
          current_nav
        ),
        valuations!left (
          id,
          nav_total,
          nav_per_unit,
          as_of_date
        )
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Vehicles with related data fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles with related data', details: error.message },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedVehicles = (vehicles || []).map((vehicle: any) => {
      // Filter positions and subscriptions for this investor
      const investorPositions = (vehicle.positions || []).filter((p: any) =>
        investorIds.includes(p.investor_id)
      )
      const investorSubscriptions = (vehicle.subscriptions || []).filter((s: any) =>
        investorIds.includes(s.investor_id)
      )

      // Get the most recent valuation
      const sortedValuations = (vehicle.valuations || []).sort((a: any, b: any) =>
        new Date(b.as_of_date).getTime() - new Date(a.as_of_date).getTime()
      )
      const latestValuation = sortedValuations[0] || null

      // Get primary position and subscription
      const position = investorPositions[0] || null
      const subscription = investorSubscriptions[0] || null

      // Calculate derived values
      let positionData = null
      if (position) {
        const units = parseFloat(position.units || 0)
        const costBasis = parseFloat(position.cost_basis || 0)
        const navPerUnit = latestValuation?.nav_per_unit
          ? parseFloat(latestValuation.nav_per_unit)
          : parseFloat(position.last_nav || 0)
        const currentValue = units * navPerUnit
        const unrealizedGain = currentValue - costBasis
        const unrealizedGainPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0

        positionData = {
          units,
          costBasis,
          currentValue,
          unrealizedGain,
          unrealizedGainPct,
          lastUpdated: position.as_of_date || latestValuation?.as_of_date || null
        }
      }

      let subscriptionData = null
      if (subscription) {
        subscriptionData = {
          commitment: subscription.commitment ? parseFloat(subscription.commitment) : null,
          currency: subscription.currency || vehicle.currency,
          status: subscription.status || 'pending',
          effective_date: subscription.effective_date || null,
          funding_due_at: subscription.funding_due_at || null,
          units: subscription.units ? parseFloat(subscription.units) : null,
          funded_amount: subscription.funded_amount ? parseFloat(subscription.funded_amount) : null,
          current_nav: subscription.current_nav ? parseFloat(subscription.current_nav) : null
        }
      }

      let valuationData = null
      if (latestValuation) {
        valuationData = {
          navTotal: latestValuation.nav_total ? parseFloat(latestValuation.nav_total) : 0,
          navPerUnit: latestValuation.nav_per_unit ? parseFloat(latestValuation.nav_per_unit) : 0,
          asOfDate: latestValuation.as_of_date
        }
      }

      return {
        id: vehicle.id,
        name: vehicle.name,
        type: vehicle.type,
        domicile: vehicle.domicile,
        currency: vehicle.currency,
        created_at: vehicle.created_at,
        status: vehicle.status,
        position: positionData,
        subscription: subscriptionData,
        valuation: valuationData,
        performance: positionData ? {
          unrealizedGainPct: positionData.unrealizedGainPct
        } : null
      }
    })

    // Filter out vehicles with no position or subscription
    const filteredVehicles = transformedVehicles.filter((v: any) =>
      v.position !== null || v.subscription !== null
    )

    return NextResponse.json({
      vehicles: filteredVehicles
    })

  } catch (error) {
    console.error('API /vehicles error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
