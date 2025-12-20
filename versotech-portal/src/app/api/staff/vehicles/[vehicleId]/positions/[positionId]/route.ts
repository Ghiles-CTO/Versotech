import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updatePositionSchema = z.object({
  units: z.number().positive().optional(),
  cost_basis: z.number().nonnegative().optional(),
  last_nav: z.number().positive().optional(),
  as_of_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

async function requireStaff() {
  const authSupabase = await createClient()
  const { data: { user }, error: authError } = await authSupabase.auth.getUser()

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await authSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)) {
    return { error: NextResponse.json({ error: 'Staff access required' }, { status: 403 }) }
  }

  return { user }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string; positionId: string }> }
) {
  try {
    const staffCheck = await requireStaff()
    if (staffCheck.error) return staffCheck.error

    const { vehicleId, positionId } = await params
    const body = await request.json()
    const validation = updatePositionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid position data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const { data: existing, error: fetchError } = await supabase
      .from('positions')
      .select('*')
      .eq('id', positionId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    if (existing.vehicle_id !== vehicleId) {
      return NextResponse.json({ error: 'Position does not belong to this vehicle' }, { status: 409 })
    }

    const updates = validation.data
    const { data: updated, error: updateError } = await supabase
      .from('positions')
      .update(updates)
      .eq('id', positionId)
      .select()
      .single()

    if (updateError || !updated) {
      console.error('Position update error:', updateError)
      return NextResponse.json({ error: 'Failed to update position' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: staffCheck.user!.id,
      action: AuditActions.UPDATE,
      entity: 'positions',
      entity_id: positionId,
      metadata: {
        vehicle_id: vehicleId,
        previous_values: existing,
        updated_values: updates
      }
    })

    return NextResponse.json({ position: updated })
  } catch (error: any) {
    console.error('Position update error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string; positionId: string }> }
) {
  try {
    const staffCheck = await requireStaff()
    if (staffCheck.error) return staffCheck.error

    const { vehicleId, positionId } = await params
    const supabase = createServiceClient()

    const { data: existing, error: fetchError } = await supabase
      .from('positions')
      .select('*')
      .eq('id', positionId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    if (existing.vehicle_id !== vehicleId) {
      return NextResponse.json({ error: 'Position does not belong to this vehicle' }, { status: 409 })
    }

    const { error: deleteError } = await supabase
      .from('positions')
      .delete()
      .eq('id', positionId)

    if (deleteError) {
      console.error('Position delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete position' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: staffCheck.user!.id,
      action: AuditActions.DELETE,
      entity: 'positions',
      entity_id: positionId,
      metadata: {
        vehicle_id: vehicleId,
        deleted_data: existing
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Position delete error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

