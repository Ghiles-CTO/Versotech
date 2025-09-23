import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id
    const serviceSupabase = createServiceClient()
    
    // Get the authenticated user from the service client
    const { data: { user }, error: authError } = await serviceSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff (only staff can finalize allocations)
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required to finalize allocations' },
        { status: 403 }
      )
    }

    // Verify reservation exists and is still pending
    const { data: reservation } = await serviceSupabase
      .from('reservations')
      .select(`
        *,
        deals (
          id,
          name,
          status
        ),
        investors (
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

    if (reservation.expires_at && new Date(reservation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Reservation has expired' },
        { status: 400 }
      )
    }

    // TODO: Check for approval in approvals table when approval system is implemented
    // For now, we'll proceed with staff approval being implicit

    // Call the database function to finalize allocation
    const { data: allocationResult, error: allocationError } = await serviceSupabase
      .rpc('fn_finalize_allocation', {
        p_reservation_id: reservationId,
        p_approver_id: user.id
      })

    if (allocationError) {
      console.error('Allocation error:', allocationError)
      return NextResponse.json(
        { error: allocationError.message || 'Failed to finalize allocation' },
        { status: 400 }
      )
    }

    const allocationId = allocationResult

    // Get the created allocation with details
    const { data: allocation } = await serviceSupabase
      .from('allocations')
      .select(`
        *,
        allocation_lot_items (
          lot_id,
          units,
          share_lots (
            unit_cost,
            currency,
            source_id,
            share_sources (
              kind,
              counterparty_name
            )
          )
        )
      `)
      .eq('id', allocationId)
      .single()

    // Log the allocation finalization
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.ALLOCATIONS,
      entity_id: allocationId,
      metadata: {
        reservation_id: reservationId,
        deal_id: reservation.deal_id,
        investor_id: reservation.investor_id,
        units: reservation.requested_units.toString(),
        unit_price: reservation.proposed_unit_price.toString(),
        approver: profile.display_name
      }
    })

    return NextResponse.json({
      success: true,
      allocation_id: allocationId,
      allocation,
      message: `Successfully allocated ${reservation.requested_units} units to ${reservation.investors?.legal_name}`
    })

  } catch (error) {
    console.error('Allocation finalization API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}