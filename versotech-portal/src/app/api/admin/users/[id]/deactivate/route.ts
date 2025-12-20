import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
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

    // Cannot deactivate yourself
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      )
    }

    // Get current status using deleted_at (soft delete pattern)
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('deleted_at, email')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.deleted_at !== null) {
      return NextResponse.json({ error: 'User is already inactive' }, { status: 400 })
    }

    // Soft delete: set deleted_at to current timestamp
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('Deactivate error:', updateError)
      return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'user_deactivated',
      entity_type: 'user',
      entity_id: targetUserId,
      before_value: { active: true },
      after_value: { active: false },
    })

    return NextResponse.json({
      success: true,
      message: 'User deactivated',
    })
  } catch (error) {
    console.error('Deactivate API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
