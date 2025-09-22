import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: vehicleId } = await params
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
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

    // Get vehicle details
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // For investors, check if they have access to this vehicle
    let hasAccess = false
    let investorIds: string[] = []

    if (profile.role === 'investor') {
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      if (investorLinks) {
        investorIds = investorLinks.map(link => link.investor_id)
        
        // Check if investor has subscription to this vehicle
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('vehicle_id', vehicleId)
          .in('investor_id', investorIds)
          .single()

        hasAccess = !!subscription
      }
    } else {
      // Staff have access to all vehicles
      hasAccess = true
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this vehicle' },
        { status: 403 }
      )
    }

    // Get valuations
    const { data: valuations } = await supabase
      .from('valuations')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('as_of_date', { ascending: false })

    // Get capital calls
    const { data: capitalCalls } = await supabase
      .from('capital_calls')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('due_date', { ascending: false })

    // Get distributions
    const { data: distributions } = await supabase
      .from('distributions')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false })

    // Get documents (filtered by access rights)
    let documentsQuery = supabase
      .from('documents')
      .select('id, type, created_at, created_by')
      .eq('vehicle_id', vehicleId)

    if (profile.role === 'investor') {
      // Investors can only see their own documents or vehicle-level documents
      documentsQuery = documentsQuery.or(`owner_investor_id.in.(${investorIds.join(',')}),owner_investor_id.is.null`)
    }

    const { data: documents } = await documentsQuery.order('created_at', { ascending: false })

    let positionData = null
    let subscriptionData = null
    let cashflowData = null

    if (profile.role === 'investor') {
      // Get investor's position in this vehicle
      const { data: position } = await supabase
        .from('positions')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .in('investor_id', investorIds)
        .single()

      if (position) {
        const latestValuation = valuations?.[0]
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

      // Get subscription details
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .in('investor_id', investorIds)
        .single()

      if (subscription) {
        subscriptionData = {
          commitment: subscription.commitment,
          currency: subscription.currency,
          status: subscription.status,
          signedDate: subscription.created_at
        }
      }

      // Get cashflow history
      const { data: cashflows } = await supabase
        .from('cashflows')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .in('investor_id', investorIds)
        .order('date', { ascending: false })

      if (cashflows) {
        const contributions = cashflows
          .filter(cf => cf.type === 'call')
          .reduce((sum, cf) => sum + (cf.amount || 0), 0)

        const distributionsReceived = cashflows
          .filter(cf => cf.type === 'distribution')
          .reduce((sum, cf) => sum + (cf.amount || 0), 0)

        cashflowData = {
          totalContributions: Math.round(contributions),
          totalDistributions: Math.round(distributionsReceived),
          unfundedCommitment: Math.round(Math.max(0, (subscriptionData?.commitment || 0) - contributions)),
          history: cashflows.map(cf => ({
            type: cf.type,
            amount: cf.amount,
            date: cf.date,
            reference: cf.ref_id
          }))
        }
      }
    }

    return NextResponse.json({
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        type: vehicle.type,
        domicile: vehicle.domicile,
        currency: vehicle.currency,
        created_at: vehicle.created_at
      },
      position: positionData,
      subscription: subscriptionData,
      cashflows: cashflowData,
      valuations: valuations?.map(v => ({
        navTotal: v.nav_total,
        navPerUnit: v.nav_per_unit,
        asOfDate: v.as_of_date
      })) || [],
      capitalCalls: capitalCalls?.map(cc => ({
        id: cc.id,
        name: cc.name,
        callPct: cc.call_pct,
        dueDate: cc.due_date,
        status: cc.status
      })) || [],
      distributions: distributions?.map(d => ({
        id: d.id,
        name: d.name,
        amount: d.amount,
        date: d.date,
        classification: d.classification
      })) || [],
      documents: documents?.map(doc => ({
        id: doc.id,
        type: doc.type,
        createdAt: doc.created_at
      })) || []
    })

  } catch (error) {
    console.error('Vehicle detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}