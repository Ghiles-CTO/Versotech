import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'
import { auditLogger, AuditEntities } from '@/lib/audit'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check if user is super admin OR CEO (using centralized auth helper)
    const hasAccess = await isSuperAdmin(supabase, user.id)
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id: targetUserId } = await params

    // Cannot deactivate yourself
    if (targetUserId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot deactivate your own account' },
        { status: 400 }
      )
    }

    // Get current status using deleted_at (soft delete pattern)
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('deleted_at, email, display_name')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (targetUser.deleted_at !== null) {
      return NextResponse.json({ success: false, error: 'User is already inactive' }, { status: 400 })
    }

    // Soft delete: set deleted_at to current timestamp
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('[deactivate] Update error:', updateError)
      return NextResponse.json({ success: false, error: 'Failed to deactivate user' }, { status: 500 })
    }

    // Log the action using standardized audit logger
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'user_deactivated',
      entity: AuditEntities.USERS,
      entity_id: targetUserId,
      metadata: {
        target_email: targetUser.email,
        target_name: targetUser.display_name
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User deactivated'
    })
  } catch (error) {
    console.error('[deactivate] API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
