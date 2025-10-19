import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

const createVehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required'),
  type: z.enum(['fund', 'spv', 'securitization', 'note', 'other']),
  domicile: z.string().min(1, 'Domicile is required'),
  currency: z.string().default('USD'),
  entity_code: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  investment_name: z.string().optional().nullable(),
  former_entity: z.string().optional().nullable(),
  status: z.enum(['LIVE', 'CLOSED', 'TBD']).optional().nullable(),
  formation_date: z.string().optional().nullable(),
  legal_jurisdiction: z.string().optional().nullable(),
  registration_number: z.string().optional().nullable(),
  reporting_type: z
    .enum(['Not Required', 'Company Only', 'Online only', 'Company + Online'])
    .optional()
    .nullable(),
  requires_reporting: z.boolean().optional().nullable(),
  notes: z.string().optional().nullable(),
  logo_url: z.string().url('Logo must be a valid URL').optional().nullable(),
  website_url: z.string().url('Website must be a valid URL').optional().nullable()
})

export async function GET(request: NextRequest) {
  try {
    const clientSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(clientSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const includeRelated = searchParams.get('related') === 'true'
    const includeDeals = searchParams.get('includeDeals') === 'true'

    // Use service client for data fetching (bypasses RLS)
    const supabase = createServiceClient()

    // Check if user is investor or staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // If investor portal and requesting related data
    if (profile.role === 'investor' && (includeRelated || includeDeals)) {
      // Get investor entities linked to this user
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      if (!investorLinks || investorLinks.length === 0) {
        console.log('No investor links found for user')
        return NextResponse.json({ 
          vehicles: [],
          deals: []
        })
      }

      const investorIds = investorLinks.map(link => link.investor_id)
      console.log('Fetching data for investor IDs:', investorIds)

      // Get vehicles that investor has subscriptions to
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('vehicle_id')
        .in('investor_id', investorIds)

      if (subsError) {
        console.error('Subscriptions fetch error:', subsError)
        return NextResponse.json(
          { error: 'Failed to fetch subscriptions', details: subsError.message },
          { status: 500 }
        )
      }

      const vehicleIds = [...new Set(subscriptions?.map(s => s.vehicle_id).filter(Boolean) || [])]
      console.log('Found vehicle IDs from subscriptions:', vehicleIds)

      if (vehicleIds.length === 0) {
        console.log('No vehicle IDs found, returning empty')
        return NextResponse.json({ 
          vehicles: [],
          deals: []
        })
      }

      // Fetch vehicles with related data
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .in('id', vehicleIds)
        .order('created_at', { ascending: false })

      if (vehiclesError) {
        console.error('Fetch vehicles error:', vehiclesError)
        return NextResponse.json(
          { error: 'Failed to fetch vehicles', details: vehiclesError.message },
          { status: 500 }
        )
      }

      console.log(`Found ${vehicles?.length || 0} vehicles for investor`)

      // Enrich vehicles with subscription, position, and valuation data
      const enrichedVehicles = await Promise.all((vehicles || []).map(async (vehicle) => {
        // Get subscription data
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .in('investor_id', investorIds)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Get position data
        const { data: position } = await supabase
          .from('positions')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .in('investor_id', investorIds)
          .order('as_of_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Get latest valuation
        const { data: valuation } = await supabase
          .from('valuations')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .order('as_of_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Calculate current value and gains
        const units = position?.units || 0
        const costBasis = position?.cost_basis || 0
        const navPerUnit = valuation?.nav_per_unit || 0
        const currentValue = units * navPerUnit
        const unrealizedGain = currentValue - costBasis
        const unrealizedGainPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0

        return {
          id: vehicle.id,
          name: vehicle.name,
          type: vehicle.type,
          domicile: vehicle.domicile,
          currency: vehicle.currency,
          created_at: vehicle.created_at,
          position: position ? {
            units,
            costBasis,
            currentValue,
            unrealizedGain,
            unrealizedGainPct,
            lastUpdated: position.as_of_date
          } : null,
          subscription: subscription ? {
            commitment: parseFloat(subscription.commitment || 0),
            currency: subscription.currency,
            status: subscription.status
          } : null,
          valuation: valuation ? {
            navTotal: parseFloat(valuation.nav_total || 0),
            navPerUnit: parseFloat(valuation.nav_per_unit || 0),
            asOfDate: valuation.as_of_date
          } : null,
          performance: {
            unrealizedGainPct
          }
        }
      }))

      // Get deal allocations if requested
      let dealHoldings = []
      if (includeDeals) {
        // Get allocations for this investor
        const { data: allocations } = await supabase
          .from('allocations')
          .select(`
            id,
            unit_price,
            units,
            status,
            approved_at,
            deals!inner(
              id,
              name,
              deal_type,
              status,
              currency
            )
          `)
          .in('investor_id', investorIds)
          .eq('status', 'approved')

        dealHoldings = (allocations || []).map((allocation: any) => {
          const totalValue = allocation.units * allocation.unit_price
          const deal = allocation.deals
          
          return {
            id: allocation.id,
            dealId: deal.id,
            name: deal.name,
            type: 'deal',
            dealType: deal.deal_type,
            status: deal.status,
            currency: deal.currency,
            allocation: {
              units: parseFloat(allocation.units),
              unitPrice: parseFloat(allocation.unit_price),
              totalValue,
              status: allocation.status,
              approvedAt: allocation.approved_at
            },
            spread: {
              markupPerUnit: 0,
              totalMarkup: 0,
              markupPct: 0
            }
          }
        })
      }

      return NextResponse.json({ 
        vehicles: enrichedVehicles,
        deals: dealHoldings
      })
    }

    // Standard staff/admin fetch - return all vehicles with all fields
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('entity_code', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Fetch vehicles error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      )
    }

    return NextResponse.json({ vehicles: vehicles || [] })

  } catch (error) {
    console.error('API /vehicles GET error:', error)
      return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const regularSupabase = await createClient()
    
    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff (works with both real auth and demo mode)
    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const sanitizedBody = {
      ...body,
      entity_code: typeof body.entity_code === 'string' ? body.entity_code.trim() || null : body.entity_code ?? null,
      platform: typeof body.platform === 'string' ? body.platform.trim() || null : body.platform ?? null,
      investment_name:
        typeof body.investment_name === 'string' ? body.investment_name.trim() || null : body.investment_name ?? null,
      former_entity:
        typeof body.former_entity === 'string' ? body.former_entity.trim() || null : body.former_entity ?? null,
      status: typeof body.status === 'string' ? body.status.trim() || null : body.status ?? null,
      legal_jurisdiction:
        typeof body.legal_jurisdiction === 'string' ? body.legal_jurisdiction.trim() || null : body.legal_jurisdiction ?? null,
      registration_number:
        typeof body.registration_number === 'string' ? body.registration_number.trim() || null : body.registration_number ?? null,
      reporting_type:
        typeof body.reporting_type === 'string' ? body.reporting_type.trim() || null : body.reporting_type ?? null,
      notes: typeof body.notes === 'string' ? body.notes.trim() || null : body.notes ?? null,
      logo_url: typeof body.logo_url === 'string' ? body.logo_url.trim() || null : body.logo_url ?? null,
      website_url: typeof body.website_url === 'string' ? body.website_url.trim() || null : body.website_url ?? null,
      requires_reporting:
        typeof body.requires_reporting === 'boolean'
          ? body.requires_reporting
          : Boolean(body.requires_reporting)
    }
    const validatedData = createVehicleSchema.parse(sanitizedBody)

    const payload = {
      name: validatedData.name,
      type: validatedData.type,
      domicile: validatedData.domicile,
      currency: validatedData.currency?.trim().toUpperCase() || 'USD',
      entity_code: validatedData.entity_code || null,
      platform: validatedData.platform || null,
      investment_name: validatedData.investment_name || null,
      former_entity: validatedData.former_entity || null,
      status: validatedData.status || 'LIVE',
      formation_date: validatedData.formation_date || null,
      legal_jurisdiction: validatedData.legal_jurisdiction || null,
      registration_number: validatedData.registration_number || null,
      reporting_type: validatedData.reporting_type || 'Not Required',
      requires_reporting:
        typeof validatedData.requires_reporting === 'boolean' ? validatedData.requires_reporting : false,
      notes: validatedData.notes || null,
      logo_url: validatedData.logo_url?.trim() || null,
      website_url: validatedData.website_url?.trim() || null
    }

    // Check if vehicle with same name already exists
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('id, name')
      .eq('name', validatedData.name)
      .single()

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'A vehicle with this name already exists' },
        { status: 409 }
      )
    }

    // Create the vehicle
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('Vehicle creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create vehicle' },
        { status: 500 }
      )
    }

    // Log creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'vehicles',
      entity_id: vehicle.id,
      metadata: {
        endpoint: '/api/vehicles',
        vehicle_name: vehicle.name,
        vehicle_type: vehicle.type,
        domicile: vehicle.domicile
      }
    })

    return NextResponse.json({ vehicle }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /vehicles POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
