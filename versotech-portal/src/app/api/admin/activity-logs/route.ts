import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check permissions
    const { data: permissions } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['super_admin', 'manage_investors', 'view_investors', 'manage_introducers', 'view_audit_logs'])

    if (!permissions || permissions.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entityId')
    const entityTypes = searchParams.get('entityTypes')?.split(',') || []
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    if (!entityId) {
      return NextResponse.json({ error: 'entityId is required' }, { status: 400 })
    }

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('audit_logs')
      .select('id, timestamp, event_type, action, actor_name, actor_email, action_details', { count: 'exact' })
      .eq('entity_id', entityId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Filter by entity types if provided
    if (entityTypes.length > 0) {
      query = query.in('entity_type', entityTypes)
    }

    const { data: logs, error, count } = await query

    if (error) {
      console.error('Activity logs fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
    }

    const hasMore = count ? offset + pageSize < count : false

    return NextResponse.json({
      logs: logs || [],
      hasMore,
      total: count || 0,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Activity logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
