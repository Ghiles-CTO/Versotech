import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'
import { auditLogger, AuditEntities } from '@/lib/audit'

/**
 * PATCH /api/admin/users/[id]/reactivate
 *
 * Reactivates a previously deactivated user by clearing their deleted_at timestamp.
 * This restores their access to the platform.
 *
 * Authorization: Requires super_admin permission OR CEO role
 */
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

    // Get the target user's current status
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('deleted_at, email, display_name')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Check if user is actually deactivated
    if (targetUser.deleted_at === null) {
      return NextResponse.json(
        { success: false, error: 'User is already active' },
        { status: 400 }
      )
    }

    // Reactivate: clear deleted_at timestamp
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ deleted_at: null })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('[reactivate] Update error:', updateError)
      return NextResponse.json({ success: false, error: 'Failed to reactivate user' }, { status: 500 })
    }

    // Log the action using standardized audit logger
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'user_reactivated',
      entity: AuditEntities.USERS,
      entity_id: targetUserId,
      metadata: {
        target_email: targetUser.email,
        target_name: targetUser.display_name,
        previous_deleted_at: targetUser.deleted_at
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User reactivated'
    })
  } catch (error) {
    console.error('[reactivate] API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
