import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use regular client for authentication (reads cookies)
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client for admin operations
    const supabase = createServiceClient()

    // Check if user has super_admin or manage_staff permission
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['super_admin', 'manage_staff'])
      .limit(1)
      .single()

    if (!permission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: staffId } = await params

    // Prevent self-deactivation
    if (staffId === user.id) {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
    }

    // Check if staff member exists and is a staff role
    const { data: staffProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, display_name')
      .eq('id', staffId)
      .in('role', ['staff_admin', 'staff_ops', 'staff_rm'])
      .single()

    if (profileError || !staffProfile) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // Soft delete - set deleted_at timestamp
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to deactivate staff member' }, { status: 500 })
    }

    // Revoke all permissions
    await supabase
      .from('staff_permissions')
      .delete()
      .eq('user_id', staffId)

    // Ban auth account (876000h = 100 years)
    const { error: authError } = await supabase.auth.admin.updateUserById(
      staffId,
      { ban_duration: '876000h' }
    )

    if (authError) {
      console.error('Auth update error:', authError)
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        event_type: 'authorization',
        actor_id: user.id,
        action: 'staff_deactivated',
        entity_type: 'profiles',
        entity_id: staffId,
        action_details: {
          deactivated_email: staffProfile.email,
          deactivated_role: staffProfile.role,
          deactivated_name: staffProfile.display_name,
        },
        timestamp: new Date().toISOString()
      })

    // Invalidate all sessions for the deactivated user
    // This would be done via Supabase admin API in production

    return NextResponse.json({
      success: true,
      message: 'Staff member deactivated successfully',
      data: {
        user_id: staffId,
        email: staffProfile.email,
        deactivated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Staff deactivation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}