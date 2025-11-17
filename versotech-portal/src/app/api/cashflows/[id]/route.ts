import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateCashflowSchema = z.object({
  type: z.enum(['call', 'distribution']).optional(),
  amount: z.number().min(0).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ref_id: z.string().uuid().nullable().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: cashflowId } = await params

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
    const validationResult = updateCashflowSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const updates = validationResult.data

    // Get existing cashflow
    const { data: existingCashflow, error: fetchError } = await supabase
      .from('cashflows')
      .select(`
        *,
        investors (id, legal_name, display_name),
        vehicles (id, name)
      `)
      .eq('id', cashflowId)
      .single()

    if (fetchError || !existingCashflow) {
      return NextResponse.json(
        { error: 'Cashflow not found' },
        { status: 404 }
      )
    }

    // If ref_id is being updated, verify it exists
    if (updates.ref_id !== undefined && updates.ref_id !== null) {
      const refType = updates.type || existingCashflow.type
      const refTable = refType === 'call' ? 'capital_calls' : 'distributions'
      const { data: refRecord, error: refError } = await supabase
        .from(refTable)
        .select('id')
        .eq('id', updates.ref_id)
        .single()

      if (refError || !refRecord) {
        return NextResponse.json(
          { error: `Referenced ${refTable.slice(0, -1)} not found` },
          { status: 404 }
        )
      }
    }

    // Update cashflow
    const { data: updatedCashflow, error: updateError } = await supabase
      .from('cashflows')
      .update(updates)
      .eq('id', cashflowId)
      .select()
      .single()

    if (updateError) {
      console.error('Cashflow update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update cashflow' },
        { status: 500 }
      )
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: 'cashflows',
      entity_id: cashflowId,
      metadata: {
        investor_id: existingCashflow.investor_id,
        investor_name: existingCashflow.investors?.display_name || existingCashflow.investors?.legal_name,
        vehicle_id: existingCashflow.vehicle_id,
        vehicle_name: existingCashflow.vehicles?.name,
        previous_values: {
          type: existingCashflow.type,
          amount: existingCashflow.amount,
          date: existingCashflow.date,
          ref_id: existingCashflow.ref_id
        },
        updated_values: updates
      }
    })

    return NextResponse.json({
      success: true,
      cashflow: {
        id: updatedCashflow.id,
        investorId: updatedCashflow.investor_id,
        investorName: existingCashflow.investors?.display_name || existingCashflow.investors?.legal_name,
        vehicleId: updatedCashflow.vehicle_id,
        vehicleName: existingCashflow.vehicles?.name,
        type: updatedCashflow.type,
        amount: updatedCashflow.amount,
        date: updatedCashflow.date,
        refId: updatedCashflow.ref_id
      }
    })

  } catch (error) {
    console.error('Cashflows API error:', error)
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
    const { id: cashflowId } = await params

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

    // Get existing cashflow before deletion
    const { data: existingCashflow, error: fetchError } = await supabase
      .from('cashflows')
      .select(`
        *,
        investors (id, legal_name, display_name),
        vehicles (id, name)
      `)
      .eq('id', cashflowId)
      .single()

    if (fetchError || !existingCashflow) {
      return NextResponse.json(
        { error: 'Cashflow not found' },
        { status: 404 }
      )
    }

    // Delete cashflow
    const { error: deleteError } = await supabase
      .from('cashflows')
      .delete()
      .eq('id', cashflowId)

    if (deleteError) {
      console.error('Cashflow deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete cashflow' },
        { status: 500 }
      )
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: 'cashflows',
      entity_id: cashflowId,
      metadata: {
        investor_id: existingCashflow.investor_id,
        investor_name: existingCashflow.investors?.display_name || existingCashflow.investors?.legal_name,
        vehicle_id: existingCashflow.vehicle_id,
        vehicle_name: existingCashflow.vehicles?.name,
        deleted_data: {
          type: existingCashflow.type,
          amount: existingCashflow.amount,
          date: existingCashflow.date,
          ref_id: existingCashflow.ref_id
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cashflow deleted successfully'
    })

  } catch (error) {
    console.error('Cashflows API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
