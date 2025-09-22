import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
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

    // Parse query parameters
    const upcoming = searchParams.get('upcoming') === 'true'
    const vehicleId = searchParams.get('vehicle_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('capital_calls')
      .select(`
        *,
        vehicles (
          id,
          name,
          type,
          currency
        )
      `)

    // For investors, only show capital calls for vehicles they have access to
    if (profile.role === 'investor') {
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      if (!investorLinks || investorLinks.length === 0) {
        return NextResponse.json({
          capitalCalls: [],
          hasData: false
        })
      }

      const investorIds = investorLinks.map(link => link.investor_id)
      
      // Filter to only vehicles the investor has subscriptions to
      const { data: subscribedVehicles } = await supabase
        .from('subscriptions')
        .select('vehicle_id')
        .in('investor_id', investorIds)
        .eq('status', 'active')

      if (!subscribedVehicles || subscribedVehicles.length === 0) {
        return NextResponse.json({
          capitalCalls: [],
          hasData: false
        })
      }

      const vehicleIds = subscribedVehicles.map(s => s.vehicle_id)
      query = query.in('vehicle_id', vehicleIds)
    }

    // Apply filters
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (upcoming) {
      // Show only future capital calls
      query = query.gte('due_date', new Date().toISOString().split('T')[0])
    }

    const { data: capitalCalls, error } = await query
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Capital calls fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch capital calls' },
        { status: 500 }
      )
    }

    // Calculate additional information for each capital call
    const enhancedCapitalCalls = await Promise.all(
      (capitalCalls || []).map(async (call) => {
        let investorAmount = null
        
        if (profile.role === 'investor') {
          // Calculate this investor's portion of the capital call
          const { data: investorLinks } = await supabase
            .from('investor_users')
            .select('investor_id')
            .eq('user_id', user.id)

          if (investorLinks) {
            const investorIds = investorLinks.map(link => link.investor_id)
            
            // Get investor's subscription to this vehicle
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('commitment')
              .eq('vehicle_id', call.vehicle_id)
              .in('investor_id', investorIds)
              .eq('status', 'active')
              .single()

            if (subscription && call.call_pct) {
              investorAmount = (subscription.commitment * call.call_pct) / 100
            }
          }
        }

        return {
          ...call,
          investorAmount,
          daysUntilDue: call.due_date ? 
            Math.ceil((new Date(call.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
            null
        }
      })
    )

    // Log access
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'capital_calls',
      entity_id: user.id,
      metadata: {
        endpoint: '/api/capital-calls',
        role: profile.role,
        capital_call_count: enhancedCapitalCalls.length,
        filters: { upcoming, vehicle_id: vehicleId, status }
      }
    })

    return NextResponse.json({
      capitalCalls: enhancedCapitalCalls,
      hasData: enhancedCapitalCalls.length > 0
    })

  } catch (error) {
    console.error('Capital calls API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
