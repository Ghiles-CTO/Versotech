import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
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

    const { id: dealId, userId } = await params

    // Check if user has active commitments or allocations
    const { data: commitments } = await supabase
      .from('deal_commitments')
      .select('id, status')
      .eq('deal_id', dealId)
      .eq('created_by', userId)
      .in('status', ['submitted', 'under_review', 'approved'])
      .limit(1)

    if (commitments && commitments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot remove member with active commitments. Cancel or reject commitments first.' },
        { status: 400 }
      )
    }

    // Delete membership
    const { error } = await supabase
      .from('deal_memberships')
      .delete()
      .eq('deal_id', dealId)
      .eq('user_id', userId)

    if (error) {
      console.error('Delete membership error:', error)
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: 'deal_memberships',
      entity_id: dealId,
      metadata: {
        removed_user_id: userId
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API /deals/[id]/members/[userId] DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
