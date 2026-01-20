import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'

// Activity log item type for export
export interface ActivityLogItem {
  id: string
  action: string
  rawAction: string
  timestamp: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
}

export interface ActivityResponse {
  success: boolean
  data?: {
    logs: ActivityLogItem[]
    hasMore: boolean
    total: number
    actionTypes: string[]
  }
  error?: string
}

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

    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(req.url)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const actionFilter = searchParams.get('action') // Optional action type filter

    // First, get distinct action types for the filter dropdown
    const { data: actionTypesData } = await supabase
      .from('audit_logs')
      .select('action')
      .eq('actor_id', targetUserId)
      .order('action')

    // Extract unique action types
    const actionTypes = [...new Set(actionTypesData?.map(a => a.action) || [])]

    // Build the query for activity logs
    let logsQuery = supabase
      .from('audit_logs')
      .select('id, action, timestamp, entity_type, entity_id, action_details, ip_address, user_agent', { count: 'exact' })
      .eq('actor_id', targetUserId)

    // Apply action filter if provided
    if (actionFilter) {
      logsQuery = logsQuery.eq('action', actionFilter)
    }

    // Apply ordering and pagination
    const { data: logs, error, count } = await logsQuery
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[activity] Fetch error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch activity' }, { status: 500 })
    }

    const formattedLogs: ActivityLogItem[] = logs?.map((log) => ({
      id: log.id,
      action: log.action.replace(/_/g, ' '),
      rawAction: log.action,
      timestamp: log.timestamp,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      details: log.action_details as Record<string, unknown> | null,
      ip_address: log.ip_address,
      user_agent: log.user_agent
    })) || []

    const total = count || 0
    const hasMore = offset + limit < total

    return NextResponse.json({
      success: true,
      data: {
        logs: formattedLogs,
        hasMore,
        total,
        actionTypes
      }
    } as ActivityResponse)
  } catch (error) {
    console.error('[activity] API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
