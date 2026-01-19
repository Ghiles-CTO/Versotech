import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'

export async function GET(
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

    // Fetch activity logs for the user
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('id, action, timestamp, entity_type, entity_id, action_details, ip_address, user_agent')
      .eq('actor_id', targetUserId)
      .order('timestamp', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[activity] Fetch error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch activity' }, { status: 500 })
    }

    const formattedLogs = logs?.map((log) => ({
      id: log.id,
      action: log.action.replace(/_/g, ' '),
      timestamp: log.timestamp,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      details: log.action_details,
      ip_address: log.ip_address,
      user_agent: log.user_agent
    }))

    return NextResponse.json({
      success: true,
      data: {
        logs: formattedLogs
      }
    })
  } catch (error) {
    console.error('[activity] API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
