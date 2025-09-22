import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServiceClient()
    
    // Get the authenticated user from regular client
    const regularSupabase = await createClient()
    const { data: { user }, error: authError } = await regularSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reservationId = params.id

    // Check if user is staff or has approval permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, title')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Staff access required for finalizing allocations' },
        { status: 403 }
      )
    }

    // Get reservation details first to validate
    const { data: reservation } = await supabase
      .from('reservations')
      .select(`
        *,
        deals:deal_id (
          id,
          name,
          status
        ),
        investors:investor_id (
          legal_name
        )
      `)
      .eq('id', reservationId)
      .single()

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    if (reservation.status !== 'pending') {
      return NextResponse.json(
        { error: `Reservation is not pending. Current status: ${reservation.status}` },
        { status: 400 }
      )
    }

    // Check if reservation has expired
    if (new Date(reservation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Reservation has expired' },
        { status: 400 }
      )
    }

    // TODO: In a complete implementation, you would check for approvals here
    // For now, we'll assume staff approval is sufficient
    
    // Call the database function to finalize the allocation
    const { data: allocationId, error } = await supabase
      .rpc('fn_finalize_allocation', {
        p_reservation_id: reservationId,
        p_approver_id: user.id
      })

    if (error) {
      console.error('Allocation finalization error:', error)
      
      if (error.message.includes('Reservation is not pending')) {
        return NextResponse.json(
          { error: 'Reservation is no longer available for allocation' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to finalize allocation' },
        { status: 500 }
      )
    }

    // Fetch the created allocation with details
    const { data: allocation } = await supabase
      .from('allocations')
      .select(`
        *,
        deals:deal_id (
          id,
          name
        ),
        investors:investor_id (
          legal_name
        ),
        allocation_lot_items (
          units,
          share_lots:lot_id (
            unit_cost,
            share_sources:source_id (
              counterparty_name
            )
          )
        )
      `)
      .eq('id', allocationId)
      .single()

    // Log allocation creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'allocations',
      entity_id: allocationId,
      metadata: {
        endpoint: `/api/reservations/${reservationId}/finalize`,
        deal_id: reservation.deal_id,
        deal_name: reservation.deals?.name,
        investor_id: reservation.investor_id,
        investor_name: reservation.investors?.legal_name,
        units: reservation.requested_units,
        unit_price: reservation.proposed_unit_price,
        total_value: reservation.requested_units * reservation.proposed_unit_price,
        original_reservation_id: reservationId
      }
    })

    return NextResponse.json({
      allocation,
      message: 'Allocation finalized successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('API /reservations/[id]/finalize POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
