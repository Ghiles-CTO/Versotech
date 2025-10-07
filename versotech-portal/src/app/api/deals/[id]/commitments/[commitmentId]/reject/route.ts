import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

const rejectCommitmentSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters')
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
    const validatedData = rejectCommitmentSchema.parse(body)

    // Get commitment details
    const { data: commitment, error: commitmentError } = await supabase
      .from('deal_commitments')
      .select('*')
      .eq('id', commitmentId)
      .eq('deal_id', dealId)
      .single()

    if (commitmentError || !commitment) {
      return NextResponse.json(
        { error: 'Commitment not found' },
        { status: 404 }
      )
    }

    if (commitment.status === 'rejected' || commitment.status === 'cancelled') {
      return NextResponse.json(
        { error: `Commitment already ${commitment.status}` },
        { status: 400 }
      )
    }

    // Update commitment status
    const { error: updateError } = await supabase
      .from('deal_commitments')
      .update({ status: 'rejected' })
      .eq('id', commitmentId)

    if (updateError) {
      console.error('Update commitment error:', updateError)
      return NextResponse.json(
        { error: 'Failed to reject commitment' },
        { status: 500 }
      )
    }

    // Create approval record
    await supabase
      .from('approvals')
      .insert({
        entity_type: 'deal_commitment',
        entity_id: commitmentId,
        action: 'reject',
        status: 'rejected',
        requested_by: commitment.created_by,
        assigned_to: user.id,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: validatedData.reason,
        related_deal_id: dealId,
        related_investor_id: commitment.investor_id
      })

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: 'deal_commitments',
      entity_id: commitmentId,
      metadata: {
        deal_id: dealId,
        investor_id: commitment.investor_id,
        action: 'rejected',
        reason: validatedData.reason
      }
    })

    // TODO: Send notification to investor with rejection reason

    return NextResponse.json({
      commitment: {
        ...commitment,
        status: 'rejected'
      },
      rejection_reason: validatedData.reason
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/commitments/[id]/reject POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
