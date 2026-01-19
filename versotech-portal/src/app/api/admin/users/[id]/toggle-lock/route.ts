import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'
import { auditLogger, AuditEntities } from '@/lib/audit'

// NOTE: Lock functionality uses deleted_at as a soft-delete/deactivation mechanism
// Since profiles table doesn't have an is_locked column, we use deleted_at instead
// A non-null deleted_at means the user is "locked" (deactivated)

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

    // Cannot lock yourself
    if (targetUserId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot lock your own account' },
        { status: 400 }
      )
    }

    // Get current status (using deleted_at as lock indicator)
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('deleted_at, email, display_name')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const isCurrentlyLocked = targetUser.deleted_at !== null
    const newLockStatus = !isCurrentlyLocked

    // Update lock status using deleted_at
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ deleted_at: newLockStatus ? new Date().toISOString() : null })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('[toggle-lock] Update error:', updateError)
      return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 })
    }

    // Log the action using standardized audit logger
    await auditLogger.log({
      actor_user_id: user.id,
      action: newLockStatus ? 'user_locked' : 'user_unlocked',
      entity: AuditEntities.USERS,
      entity_id: targetUserId,
      metadata: {
        target_email: targetUser.email,
        target_name: targetUser.display_name,
        previous_status: isCurrentlyLocked ? 'locked' : 'unlocked',
        new_status: newLockStatus ? 'locked' : 'unlocked'
      }
    })

    return NextResponse.json({
      success: true,
      data: { is_locked: newLockStatus }
    })
  } catch (error) {
    console.error('[toggle-lock] API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
