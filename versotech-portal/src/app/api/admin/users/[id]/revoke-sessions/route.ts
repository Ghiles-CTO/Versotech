import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'
import { auditLogger, AuditEntities } from '@/lib/audit'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check if user is super admin
    const hasAccess = await isSuperAdmin(supabase, user.id)
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id: targetUserId } = await params

    // Cannot revoke your own sessions through this endpoint
    if (targetUserId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot revoke your own sessions through admin panel' },
        { status: 400 }
      )
    }

    // Get user info for audit logging
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Use Supabase Admin Auth API to sign out the user from all sessions
    // This invalidates all refresh tokens for the user
    const { error: signOutError } = await supabase.auth.admin.signOut(targetUserId, 'global')

    if (signOutError) {
      console.error('[revoke-sessions] Sign out error:', signOutError)
      return NextResponse.json(
        { success: false, error: 'Failed to revoke sessions' },
        { status: 500 }
      )
    }

    // Log the action
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'sessions_revoked',
      entity: AuditEntities.USERS,
      entity_id: targetUserId,
      metadata: {
        target_email: targetUser.email,
        target_name: targetUser.display_name,
        scope: 'global'
      }
    })

    return NextResponse.json({
      success: true,
      data: { revoked: true }
    })
  } catch (error) {
    console.error('[revoke-sessions] API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
