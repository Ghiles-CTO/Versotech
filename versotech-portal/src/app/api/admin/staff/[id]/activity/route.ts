import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Query params validation
const activityQuerySchema = z.object({
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  action_type: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['super_admin', 'manage_staff', 'view_audit_logs'])
      .limit(1)
      .single()

    if (!permission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const queryParams = activityQuerySchema.parse({
      from_date: searchParams.get('from_date') || undefined,
      to_date: searchParams.get('to_date') || undefined,
      limit: searchParams.get('limit') || 100,
      offset: searchParams.get('offset') || 0,
      action_type: searchParams.get('action_type') || undefined,
    })

    const { id: staffId } = await params

    // Get staff member info
    const { data: staffProfile } = await supabase
      .from('profiles')
      .select('id, email, display_name, role')
      .eq('id', staffId)
      .single()

    if (!staffProfile) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // Build query
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('actor_id', staffId)
      .order('timestamp', { ascending: false })
      .range(queryParams.offset, queryParams.offset + queryParams.limit - 1)

    if (queryParams.from_date) {
      query = query.gte('timestamp', queryParams.from_date)
    }

    if (queryParams.to_date) {
      query = query.lte('timestamp', queryParams.to_date)
    }

    if (queryParams.action_type) {
      query = query.eq('action', queryParams.action_type)
    }

    const { data: activities, error: queryError, count } = await query

    if (queryError) {
      console.error('Query error:', queryError)
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }

    // Aggregate activity statistics
    const stats = {
      total_actions: count || 0,
      actions_today: 0,
      actions_this_week: 0,
      actions_this_month: 0,
      most_common_action: null as string | null,
      last_activity: null as string | null,
    }

    if (activities && activities.length > 0) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      activities.forEach(activity => {
        const activityDate = new Date(activity.timestamp)
        if (activityDate >= today) stats.actions_today++
        if (activityDate >= weekAgo) stats.actions_this_week++
        if (activityDate >= monthAgo) stats.actions_this_month++
      })

      // Find most common action
      const actionCounts: Record<string, number> = {}
      activities.forEach(activity => {
        actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1
      })

      const sortedActions = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])
      if (sortedActions.length > 0) {
        stats.most_common_action = sortedActions[0][0]
      }

      stats.last_activity = activities[0].timestamp
    }

    return NextResponse.json({
      success: true,
      data: {
        staff_member: {
          id: staffProfile.id,
          email: staffProfile.email,
          display_name: staffProfile.display_name,
          role: staffProfile.role,
        },
        statistics: stats,
        activities: activities || [],
        pagination: {
          total: count || 0,
          limit: queryParams.limit,
          offset: queryParams.offset,
          has_more: (count || 0) > queryParams.offset + queryParams.limit,
        },
      },
    })
  } catch (error) {
    console.error('Activity fetch error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}