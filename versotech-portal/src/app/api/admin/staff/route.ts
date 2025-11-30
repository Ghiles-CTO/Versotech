import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Use regular client for authentication (reads cookies)
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    // Use service client for admin operations (bypasses RLS)
    const supabase = createServiceClient()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
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

    // Get all staff members
    const { data: staffMembers, error: staffError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        role,
        title,
        last_login_at,
        created_at,
        updated_at,
        deleted_at
      `)
      .in('role', ['staff_admin', 'staff_ops', 'staff_rm'])
      .order('created_at', { ascending: false })

    if (staffError) {
      console.error('Staff fetch error:', staffError)
      return NextResponse.json({ error: 'Failed to fetch staff members' }, { status: 500 })
    }

    // Get permissions for each staff member
    const { data: allPermissions } = await supabase
      .from('staff_permissions')
      .select('user_id, permission')
      .in('user_id', staffMembers?.map(s => s.id) || [])

    // Get activity stats for each staff member
    const staffWithStats = await Promise.all(
      (staffMembers || []).map(async (staff) => {
        // Get last activity
        const { data: lastActivity } = await supabase
          .from('audit_logs')
          .select('timestamp, action')
          .eq('actor_id', staff.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single()

        // Get login attempts in last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: recentLogins } = await supabase
          .from('login_attempts')
          .select('success')
          .eq('email', staff.email)
          .gte('created_at', twentyFourHoursAgo)

        const permissions = allPermissions?.filter(p => p.user_id === staff.id).map(p => p.permission) || []

        return {
          ...staff,
          status: staff.deleted_at ? 'inactive' : 'active',
          permissions,
          is_super_admin: permissions.includes('super_admin'),
          last_activity: lastActivity?.timestamp || null,
          last_action: lastActivity?.action || null,
          recent_login_count: recentLogins?.filter(l => l.success).length || 0,
          recent_failed_logins: recentLogins?.filter(l => !l.success).length || 0,
        }
      })
    )

    // Calculate summary statistics
    const stats = {
      total_staff: staffWithStats.length,
      active_staff: staffWithStats.filter(s => s.status === 'active').length,
      inactive_staff: staffWithStats.filter(s => s.status === 'inactive').length,
      super_admins: staffWithStats.filter(s => s.is_super_admin).length,
      by_role: {
        staff_admin: staffWithStats.filter(s => s.role === 'staff_admin').length,
        staff_ops: staffWithStats.filter(s => s.role === 'staff_ops').length,
        staff_rm: staffWithStats.filter(s => s.role === 'staff_rm').length,
      },
    }

    return NextResponse.json({
      success: true,
      data: {
        staff_members: staffWithStats,
        statistics: stats,
      },
    })
  } catch (error) {
    console.error('Staff list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}