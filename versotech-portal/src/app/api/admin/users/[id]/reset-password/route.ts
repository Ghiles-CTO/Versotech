import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check if user is super admin
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'super_admin')
      .single()

    if (!permission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: targetUserId } = await params

    // Get the target user's email
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Send password reset email using Supabase Auth Admin API
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: targetUser.email,
    })

    if (resetError) {
      console.error('Password reset error:', resetError)
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'password_reset_initiated',
      entity_type: 'user',
      entity_id: targetUserId,
      after_value: { target_email: targetUser.email },
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent',
    })
  } catch (error) {
    console.error('Password reset API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
