import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createCapitalCallSchema = z.object({
  vehicle_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  call_pct: z.number().min(0).max(100),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['draft', 'pending', 'completed', 'cancelled']).optional().default('draft')
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

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

    if (!profile || !['staff_admin', 'staff_ops'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createCapitalCallSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, name')
      .eq('id', data.vehicle_id)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Create capital call
    const { data: capitalCall, error: insertError } = await supabase
      .from('capital_calls')
      .insert({
        vehicle_id: data.vehicle_id,
        name: data.name,
        call_pct: data.call_pct,
        due_date: data.due_date,
        status: data.status
      })
      .select()
      .single()

    if (insertError) {
      console.error('Capital call creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create capital call' },
        { status: 500 }
      )
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'capital_calls',
      entity_id: capitalCall.id,
      metadata: {
        vehicle_id: data.vehicle_id,
        vehicle_name: vehicle.name,
        name: data.name,
        call_pct: data.call_pct,
        due_date: data.due_date,
        status: data.status
      }
    })

    return NextResponse.json({
      success: true,
      capitalCall: {
        id: capitalCall.id,
        vehicleId: capitalCall.vehicle_id,
        vehicleName: vehicle.name,
        name: capitalCall.name,
        callPct: capitalCall.call_pct,
        dueDate: capitalCall.due_date,
        status: capitalCall.status
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Capital calls API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
