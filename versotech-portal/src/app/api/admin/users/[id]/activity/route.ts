import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
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

    // Fetch activity logs for the user
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('id, action, timestamp, entity_type, entity_id, after_value, ip_address, user_agent')
      .eq('actor_id', targetUserId)
      .order('timestamp', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Activity fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
    }

    const formattedLogs = logs?.map((log) => ({
      id: log.id,
      action: log.action.replace(/_/g, ' '),
      timestamp: log.timestamp,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
    }))

    return NextResponse.json({
      success: true,
      data: {
        logs: formattedLogs,
      },
    })
  } catch (error) {
    console.error('Activity API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
