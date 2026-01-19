import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'
import { sendPasswordResetEmail } from '@/lib/email/resend-service'
import { auditLogger, AuditEntities } from '@/lib/audit'

/**
 * POST /api/admin/users/[id]/reset-password
 *
 * Admin-initiated password reset. Generates a reset link using Supabase Auth Admin API
 * and sends it via Resend email service.
 *
 * Authorization: Requires super_admin permission OR CEO role
 */
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

    // Check if user is super admin OR CEO (using centralized auth helper)
    const hasAccess = await isSuperAdmin(supabase, user.id)
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id: targetUserId } = await params

    // Get the target user's email and profile info
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('email, display_name, deleted_at')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Don't allow password reset for deactivated users
    if (targetUser.deleted_at) {
      return NextResponse.json(
        { success: false, error: 'Cannot reset password for deactivated user' },
        { status: 400 }
      )
    }

    // Generate password reset link using Supabase Auth Admin API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectTo = `${appUrl}/versotech_main/reset-password`

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: targetUser.email,
      options: {
        redirectTo
      }
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[reset-password] Link generation error:', linkError)
      return NextResponse.json(
        { success: false, error: 'Failed to generate reset link' },
        { status: 500 }
      )
    }

    // Send the password reset email via Resend
    const resetUrl = linkData.properties.action_link

    const emailResult = await sendPasswordResetEmail({
      email: targetUser.email,
      displayName: targetUser.display_name,
      resetUrl
    })

    if (!emailResult.success) {
      console.error('[reset-password] Email send failed:', emailResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }

    // Log the action using standardized audit logger
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'password_reset_initiated',
      entity: AuditEntities.USERS,
      entity_id: targetUserId,
      metadata: {
        target_email: targetUser.email,
        target_name: targetUser.display_name,
        email_sent: true,
        initiated_by: 'admin'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent'
    })
  } catch (error) {
    console.error('[reset-password] API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
