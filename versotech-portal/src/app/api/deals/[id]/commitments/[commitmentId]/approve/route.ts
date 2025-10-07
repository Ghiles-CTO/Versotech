import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

const approveCommitmentSchema = z.object({
  notes: z.string().optional(),
  hold_minutes: z.number().positive().default(2880) // 48 hours default
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commitmentId: string }> }
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

    const { id: dealId, commitmentId } = await params
    const body = await request.json()
    const validatedData = approveCommitmentSchema.parse(body)

    // Get commitment details
    const { data: commitment, error: commitmentError } = await supabase
      .from('deal_commitments')
      .select(`
        *,
        deals!inner(
          id,
          status,
          offer_unit_price
        )
      `)
      .eq('id', commitmentId)
      .eq('deal_id', dealId)
      .single()

    if (commitmentError || !commitment) {
      return NextResponse.json(
        { error: 'Commitment not found' },
        { status: 404 }
      )
    }

    if (commitment.status !== 'submitted' && commitment.status !== 'under_review') {
      return NextResponse.json(
        { error: `Cannot approve commitment with status: ${commitment.status}` },
        { status: 400 }
      )
    }

    // Update commitment status
    await supabase
      .from('deal_commitments')
      .update({ status: 'approved' })
      .eq('id', commitmentId)

    // Create approval record
    const { data: approval } = await supabase
      .from('approvals')
      .insert({
        entity_type: 'deal_commitment',
        entity_id: commitmentId,
        action: 'approve',
        status: 'approved',
        requested_by: commitment.created_by,
        assigned_to: user.id,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        notes: validatedData.notes,
        related_deal_id: dealId,
        related_investor_id: commitment.investor_id
      })
      .select()
      .single()

    // Call fn_reserve_inventory to create reservation
    try {
      const { data: reservationId, error: reserveError } = await supabase
        .rpc('fn_reserve_inventory', {
          p_deal_id: dealId,
          p_investor_id: commitment.investor_id,
          p_requested_units: commitment.requested_units,
          p_proposed_unit_price: commitment.deals.offer_unit_price || 0,
          p_hold_minutes: validatedData.hold_minutes
        })

      if (reserveError) {
        console.error('Reserve inventory error:', reserveError)
        
        // Rollback commitment approval
        await supabase
          .from('deal_commitments')
          .update({ status: 'submitted' })
          .eq('id', commitmentId)

        // Mark approval as failed
        if (approval) {
          await supabase
            .from('approvals')
            .update({
              status: 'rejected',
              rejection_reason: `Insufficient inventory: ${reserveError.message}`
            })
            .eq('id', approval.id)
        }

        return NextResponse.json(
          { error: `Failed to reserve inventory: ${reserveError.message}` },
          { status: 400 }
        )
      }

      // Audit log
      await auditLogger.log({
        actor_user_id: user.id,
        action: AuditActions.UPDATE,
        entity: 'deal_commitments',
        entity_id: commitmentId,
        metadata: {
          deal_id: dealId,
          investor_id: commitment.investor_id,
          action: 'approved',
          reservation_id: reservationId,
          notes: validatedData.notes
        }
      })

      // TODO: Send notification to investor

      return NextResponse.json({
        commitment: {
          ...commitment,
          status: 'approved'
        },
        reservation_id: reservationId,
        approval
      })

    } catch (error) {
      console.error('Reservation creation failed:', error)
      return NextResponse.json(
        { error: 'Failed to create reservation' },
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

    console.error('API /deals/[id]/commitments/[id]/approve POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
