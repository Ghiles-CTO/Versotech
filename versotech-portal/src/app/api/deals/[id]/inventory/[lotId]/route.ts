import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

const updateShareLotSchema = z.object({
  unit_cost: z.number().positive().optional(),
  acquired_at: z.string().optional(),
  lockup_until: z.string().optional(),
  status: z.enum(['available', 'held', 'exhausted']).optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lotId: string }> }
) {
  try {
    const supabase = await createServiceClient()
    const regularSupabase = await createClient()
    
    const { data: { user }, error: authError } = await regularSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id: dealId, lotId } = await params
    const body = await request.json()
    const validatedData = updateShareLotSchema.parse(body)

    // Update share lot (prevent changing units_total or units_remaining directly)
    const { data: shareLot, error } = await supabase
      .from('share_lots')
      .update(validatedData)
      .eq('id', lotId)
      .eq('deal_id', dealId) // Ensure lot belongs to this deal
      .select(`
        *,
        share_sources (
          id,
          kind,
          counterparty_name,
          notes
        )
      `)
      .single()

    if (error) {
      console.error('Update share lot error:', error)
      return NextResponse.json(
        { error: 'Failed to update share lot' },
        { status: 500 }
      )
    }

    if (!shareLot) {
      return NextResponse.json(
        { error: 'Share lot not found' },
        { status: 404 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: 'share_lots',
      entity_id: lotId,
      metadata: {
        deal_id: dealId,
        updates: validatedData
      }
    })

    return NextResponse.json({ shareLot })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/inventory/[lotId] PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lotId: string }> }
) {
  try {
    const supabase = createServiceClient()
    const regularSupabase = await createClient()
    
    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id: dealId, lotId } = await params

    // Check if lot has any reservations or allocations
    const { data: reservationItems } = await supabase
      .from('reservation_lot_items')
      .select('reservation_id')
      .eq('lot_id', lotId)
      .limit(1)

    const { data: allocationItems } = await supabase
      .from('allocation_lot_items')
      .select('allocation_id')
      .eq('lot_id', lotId)
      .limit(1)

    if ((reservationItems && reservationItems.length > 0) || 
        (allocationItems && allocationItems.length > 0)) {
      return NextResponse.json(
        { error: 'Cannot delete share lot with active reservations or allocations' },
        { status: 400 }
      )
    }

    // Delete the share lot
    const { error } = await supabase
      .from('share_lots')
      .delete()
      .eq('id', lotId)
      .eq('deal_id', dealId)

    if (error) {
      console.error('Delete share lot error:', error)
      return NextResponse.json(
        { error: 'Failed to delete share lot' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: 'share_lots',
      entity_id: lotId,
      metadata: {
        deal_id: dealId
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API /deals/[id]/inventory/[lotId] DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
