import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id: vehicleId } = params
    
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

const updateVehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required').optional(),
  type: z.enum(['fund', 'spv', 'securitization', 'note', 'other']).optional(),
  domicile: z.string().min(1, 'Domicile is required').optional(),
  currency: z.string().length(3, 'Currency must be 3 letters').optional(),
  formation_date: z.string().optional().nullable(),
  legal_jurisdiction: z.string().optional().nullable(),
  registration_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    const regularSupabase = await createClient()
    const { id: vehicleId } = params

    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateVehicleSchema.parse(body)

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const payload = {
      ...validatedData,
      currency: validatedData.currency
        ? validatedData.currency.toUpperCase()
        : undefined,
      legal_jurisdiction: validatedData.legal_jurisdiction?.trim(),
      registration_number: validatedData.registration_number?.trim(),
      notes: validatedData.notes?.trim()
    }

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update(payload)
      .eq('id', vehicleId)
      .select('id, name, type, domicile, currency, formation_date, legal_jurisdiction, registration_number, notes, created_at')
      .single()

    if (error || !vehicle) {
      console.error('Vehicle update error:', error)
      return NextResponse.json(
        { error: 'Failed to update vehicle', details: error?.message },
        { status: 500 }
      )
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.VEHICLES,
      entity_id: vehicle.id,
      metadata: {
        endpoint: `/api/vehicles/${vehicleId}`,
        ...validatedData
      }
    })

    return NextResponse.json({ vehicle })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Vehicle update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}