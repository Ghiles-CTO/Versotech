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
  formation_date: z.string().optional().nullable(),
  legal_jurisdiction: z.string().optional().nullable(),
  registration_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all vehicles
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(
        'id, name, type, domicile, currency, formation_date, legal_jurisdiction, registration_number, notes, created_at'
      )
      .order('created_at', { ascending: false })

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
    const validatedData = createVehicleSchema.parse(body)

    const payload = {
      name: validatedData.name,
      type: validatedData.type,
      domicile: validatedData.domicile,
      currency: validatedData.currency,
      formation_date: validatedData.formation_date || null,
      legal_jurisdiction: validatedData.legal_jurisdiction?.trim() || null,
      registration_number: validatedData.registration_number?.trim() || null,
      notes: validatedData.notes?.trim() || null
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