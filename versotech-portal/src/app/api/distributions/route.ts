import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createDistributionSchema = z.object({
  vehicle_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  classification: z.string().optional()
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

    if (!profile || !['staff_admin', 'staff_ops', 'ceo'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createDistributionSchema.safeParse(body)

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

    // Create distribution
    const { data: distribution, error: insertError } = await supabase
      .from('distributions')
      .insert({
        vehicle_id: data.vehicle_id,
        name: data.name,
        amount: data.amount,
        date: data.date,
        classification: data.classification
      })
      .select()
      .single()

    if (insertError) {
      console.error('Distribution creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create distribution' },
        { status: 500 }
      )
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'distributions',
      entity_id: distribution.id,
      metadata: {
        vehicle_id: data.vehicle_id,
        vehicle_name: vehicle.name,
        name: data.name,
        amount: data.amount,
        date: data.date,
        classification: data.classification
      }
    })

    return NextResponse.json({
      success: true,
      distribution: {
        id: distribution.id,
        vehicleId: distribution.vehicle_id,
        vehicleName: vehicle.name,
        name: distribution.name,
        amount: distribution.amount,
        date: distribution.date,
        classification: distribution.classification
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Distributions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
