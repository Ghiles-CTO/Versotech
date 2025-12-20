import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

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

    // Cannot lock yourself
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot lock your own account' },
        { status: 400 }
      )
    }

    // Get current status (using deleted_at as lock indicator)
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('deleted_at, email')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isCurrentlyLocked = targetUser.deleted_at !== null
    const newLockStatus = !isCurrentlyLocked

    // Update lock status using deleted_at
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ deleted_at: newLockStatus ? new Date().toISOString() : null })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('Toggle lock error:', updateError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: newLockStatus ? 'user_locked' : 'user_unlocked',
      entity_type: 'user',
      entity_id: targetUserId,
      before_value: { locked: isCurrentlyLocked },
      after_value: { locked: newLockStatus },
    })

    return NextResponse.json({
      success: true,
      data: { is_locked: newLockStatus },
    })
  } catch (error) {
    console.error('Toggle lock API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
