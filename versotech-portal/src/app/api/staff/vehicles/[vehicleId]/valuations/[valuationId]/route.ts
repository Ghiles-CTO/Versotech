import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateValuationSchema = z.object({
  nav_total: z.number().positive().optional(),
  nav_per_unit: z.number().positive().optional(),
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

  if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
    return { error: NextResponse.json({ error: 'Staff access required' }, { status: 403 }) }
  }

  return { user }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string; valuationId: string }> }
) {
  try {
    const staffCheck = await requireStaff()
    if (staffCheck.error) return staffCheck.error

    const { vehicleId, valuationId } = await params
    const body = await request.json()
    const validation = updateValuationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid valuation data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data: existing, error: fetchError } = await supabase
      .from('valuations')
      .select('*')
      .eq('id', valuationId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Valuation not found' }, { status: 404 })
    }

    if (existing.vehicle_id !== vehicleId) {
      return NextResponse.json({ error: 'Valuation does not belong to this vehicle' }, { status: 409 })
    }

    const updates = validation.data
    const { data: updated, error: updateError } = await supabase
      .from('valuations')
      .update(updates)
      .eq('id', valuationId)
      .select()
      .single()

    if (updateError || !updated) {
      console.error('Valuation update error:', updateError)
      return NextResponse.json({ error: 'Failed to update valuation' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: staffCheck.user!.id,
      action: AuditActions.UPDATE,
      entity: 'valuations',
      entity_id: valuationId,
      metadata: {
        vehicle_id: vehicleId,
        previous_values: existing,
        updated_values: updates
      }
    })

    return NextResponse.json({ valuation: updated })
  } catch (error: any) {
    console.error('Valuation update error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string; valuationId: string }> }
) {
  try {
    const staffCheck = await requireStaff()
    if (staffCheck.error) return staffCheck.error

    const { vehicleId, valuationId } = await params
    const supabase = createServiceClient()

    const { data: existing, error: fetchError } = await supabase
      .from('valuations')
      .select('*')
      .eq('id', valuationId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Valuation not found' }, { status: 404 })
    }

    if (existing.vehicle_id !== vehicleId) {
      return NextResponse.json({ error: 'Valuation does not belong to this vehicle' }, { status: 409 })
    }

    const { error: deleteError } = await supabase
      .from('valuations')
      .delete()
      .eq('id', valuationId)

    if (deleteError) {
      console.error('Valuation delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete valuation' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: staffCheck.user!.id,
      action: AuditActions.DELETE,
      entity: 'valuations',
      entity_id: valuationId,
      metadata: {
        vehicle_id: vehicleId,
        deleted_data: existing
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Valuation delete error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

