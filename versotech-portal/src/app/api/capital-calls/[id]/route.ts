import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateCapitalCallSchema = z.object({
  name: z.string().min(1).optional(),
  call_pct: z.number().min(0).max(100).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['draft', 'pending', 'completed', 'cancelled']).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: capitalCallId } = await params

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
    const validationResult = updateCapitalCallSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const updates = validationResult.data

    // Get existing capital call
    const { data: existingCall, error: fetchError } = await supabase
      .from('capital_calls')
      .select('*, vehicles(name)')
      .eq('id', capitalCallId)
      .single()

    if (fetchError || !existingCall) {
      return NextResponse.json(
        { error: 'Capital call not found' },
        { status: 404 }
      )
    }

    // Update capital call
    const { data: updatedCall, error: updateError } = await supabase
      .from('capital_calls')
      .update(updates)
      .eq('id', capitalCallId)
      .select()
      .single()

    if (updateError) {
      console.error('Capital call update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update capital call' },
        { status: 500 }
      )
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: 'capital_calls',
      entity_id: capitalCallId,
      metadata: {
        vehicle_id: existingCall.vehicle_id,
        vehicle_name: existingCall.vehicles?.name,
        previous_values: {
          name: existingCall.name,
          call_pct: existingCall.call_pct,
          due_date: existingCall.due_date,
          status: existingCall.status
        },
        updated_values: updates
      }
    })

    return NextResponse.json({
      success: true,
      capitalCall: {
        id: updatedCall.id,
        vehicleId: updatedCall.vehicle_id,
        vehicleName: existingCall.vehicles?.name,
        name: updatedCall.name,
        callPct: updatedCall.call_pct,
        dueDate: updatedCall.due_date,
        status: updatedCall.status
      }
    })

  } catch (error) {
    console.error('Capital calls API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: capitalCallId } = await params

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to check role (only admin can delete)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'staff_admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get existing capital call before deletion
    const { data: existingCall, error: fetchError } = await supabase
      .from('capital_calls')
      .select('*, vehicles(name)')
      .eq('id', capitalCallId)
      .single()

    if (fetchError || !existingCall) {
      return NextResponse.json(
        { error: 'Capital call not found' },
        { status: 404 }
      )
    }

    // Check if there are any cashflows referencing this capital call
    const { data: relatedCashflows, error: cashflowError } = await supabase
      .from('cashflows')
      .select('id')
      .eq('ref_id', capitalCallId)
      .limit(1)

    if (cashflowError) {
      console.error('Error checking related cashflows:', cashflowError)
    }

    if (relatedCashflows && relatedCashflows.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete capital call with associated cashflows. Please delete cashflows first.' },
        { status: 409 }
      )
    }

    // Delete capital call
    const { error: deleteError } = await supabase
      .from('capital_calls')
      .delete()
      .eq('id', capitalCallId)

    if (deleteError) {
      console.error('Capital call deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete capital call' },
        { status: 500 }
      )
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: 'capital_calls',
      entity_id: capitalCallId,
      metadata: {
        vehicle_id: existingCall.vehicle_id,
        vehicle_name: existingCall.vehicles?.name,
        deleted_data: {
          name: existingCall.name,
          call_pct: existingCall.call_pct,
          due_date: existingCall.due_date,
          status: existingCall.status
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Capital call deleted successfully'
    })

  } catch (error) {
    console.error('Capital calls API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
