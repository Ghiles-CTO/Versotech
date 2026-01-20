import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/api-auth'

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

    // Check permissions (CEO bypasses this check via hasPermission)
    const canAccess = await hasPermission(supabase, user.id, ['super_admin', 'manage_staff'])

    if (!canAccess) {
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
        password_set
      `)
      .in('role', ['staff_admin', 'staff_ops', 'staff_rm', 'ceo'])
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

    // Get assigned investor counts (primary + secondary RM)
    const staffIds = staffMembers?.map(s => s.id) || []

    const { data: primaryAssignments } = await supabase
      .from('investors')
      .select('primary_rm')
      .in('primary_rm', staffIds)

    const { data: secondaryAssignments } = await supabase
      .from('investors')
      .select('secondary_rm')
      .in('secondary_rm', staffIds)

    // Count assignments per staff member
    const assignmentCounts: Record<string, number> = {}
    staffIds.forEach(id => { assignmentCounts[id] = 0 })
    primaryAssignments?.forEach(a => {
      if (a.primary_rm) assignmentCounts[a.primary_rm] = (assignmentCounts[a.primary_rm] || 0) + 1
    })
    secondaryAssignments?.forEach(a => {
      if (a.secondary_rm) assignmentCounts[a.secondary_rm] = (assignmentCounts[a.secondary_rm] || 0) + 1
    })

    // Get 7-day activity counts for activity score
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: activityCounts } = await supabase
      .from('audit_logs')
      .select('actor_id')
      .in('actor_id', staffIds)
      .gte('created_at', sevenDaysAgo)

    // Count activities per staff member
    const activityScores: Record<string, number> = {}
    staffIds.forEach(id => { activityScores[id] = 0 })
    activityCounts?.forEach(a => {
      if (a.actor_id) activityScores[a.actor_id] = (activityScores[a.actor_id] || 0) + 1
    })

    // Get activity stats for each staff member
    const staffWithStats = await Promise.all(
      (staffMembers || []).map(async (staff) => {
        // Get last activity from audit_logs (correct column: created_at, not timestamp)
        const { data: lastActivity } = await supabase
          .from('audit_logs')
          .select('created_at, action')
          .eq('actor_id', staff.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get failed login attempts from audit_logs (no login_attempts table exists)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: failedLogins } = await supabase
          .from('audit_logs')
          .select('id')
          .eq('actor_id', staff.id)
          .eq('action', 'login_failed')
          .gte('created_at', twentyFourHoursAgo)

        const permissions = allPermissions?.filter(p => p.user_id === staff.id).map(p => p.permission) || []

        return {
          ...staff,
          status: staff.password_set === false ? 'invited' : 'active',
          permissions,
          is_super_admin: permissions.includes('super_admin'),
          last_activity: lastActivity?.created_at || null,
          last_action: lastActivity?.action || null,
          recent_login_count: 0, // Would need to track successful logins in audit_logs
          recent_failed_logins: failedLogins?.length || 0,
          assigned_investors: assignmentCounts[staff.id] || 0,
          activity_score_7d: activityScores[staff.id] || 0,
        }
      })
    )

    // Calculate summary statistics
    const stats = {
      total_staff: staffWithStats.length,
      active_staff: staffWithStats.filter(s => s.status === 'active').length,
      invited_staff: staffWithStats.filter(s => s.status === 'invited').length,
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