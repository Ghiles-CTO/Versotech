import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, getUserRole } from '@/lib/api-auth'

const finalizeAllocationSchema = z.object({
  reservation_id: z.string().uuid(),
  notes: z.string().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const regularSupabase = await createClient()
    
    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check staff role (must be admin or RM for finalizing allocations)
    const userRole = await getUserRole(supabase, user)
    if (!userRole || !['staff_admin', 'staff_rm'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Admin or RM access required to finalize allocations' },
        { status: 403 }
      )
    }

    const { id: dealId } = await params
    const body = await request.json()
    const validatedData = finalizeAllocationSchema.parse(body)

    // Verify reservation belongs to this deal and is pending
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select(`
        *,
        deals!inner(
          id,
          status,
          vehicle_id
        )
      `)
      .eq('id', validatedData.reservation_id)
      .eq('deal_id', dealId)
      .single()

    if (reservationError || !reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    if (reservation.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot finalize reservation with status: ${reservation.status}` },
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

    // Call fn_finalize_allocation database function
    try {
      const { data: allocationId, error: finalizeError } = await supabase
        .rpc('fn_finalize_allocation', {
          p_reservation_id: validatedData.reservation_id,
          p_approver_id: user.id
        })

      if (finalizeError) {
        console.error('Finalize allocation error:', finalizeError)
        return NextResponse.json(
          { error: `Failed to finalize allocation: ${finalizeError.message}` },
          { status: 400 }
        )
      }

      // Get the created allocation details
      const { data: allocation } = await supabase
        .from('allocations')
        .select(`
          *,
          investors(
            id,
            legal_name
          )
        `)
        .eq('id', allocationId)
        .single()

      // Create approval record
      await supabase
        .from('approvals')
        .insert({
          entity_type: 'allocation',
          entity_id: allocationId,
          action: 'approve',
          status: 'approved',
          requested_by: reservation.created_by,
          assigned_to: user.id,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          notes: validatedData.notes,
          related_deal_id: dealId,
          related_investor_id: reservation.investor_id
        })

      // Audit log
      await auditLogger.log({
        actor_user_id: user.id,
        action: AuditActions.CREATE,
        entity: 'allocations',
        entity_id: allocationId,
        metadata: {
          deal_id: dealId,
          investor_id: reservation.investor_id,
          reservation_id: validatedData.reservation_id,
          units: allocation?.units,
          unit_price: allocation?.unit_price,
          notes: validatedData.notes
        }
      })

      // TODO: Send notification to investor with allocation confirmation

      return NextResponse.json({
        allocation_id: allocationId,
        allocation,
        message: 'Allocation finalized successfully'
      })

    } catch (error) {
      console.error('Allocation finalization failed:', error)
      return NextResponse.json(
        { error: 'Failed to finalize allocation' },
        { status: 500 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/allocations/finalize POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
