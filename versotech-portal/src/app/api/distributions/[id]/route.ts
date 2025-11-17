import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateDistributionSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  classification: z.string().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: distributionId } = await params

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
    const validationResult = updateDistributionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const updates = validationResult.data

    // Get existing distribution
    const { data: existingDist, error: fetchError } = await supabase
      .from('distributions')
      .select('*, vehicles(name)')
      .eq('id', distributionId)
      .single()

    if (fetchError || !existingDist) {
      return NextResponse.json(
        { error: 'Distribution not found' },
        { status: 404 }
      )
    }

    // Update distribution
    const { data: updatedDist, error: updateError } = await supabase
      .from('distributions')
      .update(updates)
      .eq('id', distributionId)
      .select()
      .single()

    if (updateError) {
      console.error('Distribution update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update distribution' },
        { status: 500 }
      )
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: 'distributions',
      entity_id: distributionId,
      metadata: {
        vehicle_id: existingDist.vehicle_id,
        vehicle_name: existingDist.vehicles?.name,
        previous_values: {
          name: existingDist.name,
          amount: existingDist.amount,
          date: existingDist.date,
          classification: existingDist.classification
        },
        updated_values: updates
      }
    })

    return NextResponse.json({
      success: true,
      distribution: {
        id: updatedDist.id,
        vehicleId: updatedDist.vehicle_id,
        vehicleName: existingDist.vehicles?.name,
        name: updatedDist.name,
        amount: updatedDist.amount,
        date: updatedDist.date,
        classification: updatedDist.classification
      }
    })

  } catch (error) {
    console.error('Distributions API error:', error)
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
    const { id: distributionId } = await params

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

    // Get existing distribution before deletion
    const { data: existingDist, error: fetchError } = await supabase
      .from('distributions')
      .select('*, vehicles(name)')
      .eq('id', distributionId)
      .single()

    if (fetchError || !existingDist) {
      return NextResponse.json(
        { error: 'Distribution not found' },
        { status: 404 }
      )
    }

    // Check if there are any cashflows referencing this distribution
    const { data: relatedCashflows, error: cashflowError } = await supabase
      .from('cashflows')
      .select('id')
      .eq('ref_id', distributionId)
      .limit(1)

    if (cashflowError) {
      console.error('Error checking related cashflows:', cashflowError)
    }

    if (relatedCashflows && relatedCashflows.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete distribution with associated cashflows. Please delete cashflows first.' },
        { status: 409 }
      )
    }

    // Delete distribution
    const { error: deleteError } = await supabase
      .from('distributions')
      .delete()
      .eq('id', distributionId)

    if (deleteError) {
      console.error('Distribution deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete distribution' },
        { status: 500 }
      )
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: 'distributions',
      entity_id: distributionId,
      metadata: {
        vehicle_id: existingDist.vehicle_id,
        vehicle_name: existingDist.vehicles?.name,
        deleted_data: {
          name: existingDist.name,
          amount: existingDist.amount,
          date: existingDist.date,
          classification: existingDist.classification
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Distribution deleted successfully'
    })

  } catch (error) {
    console.error('Distributions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
