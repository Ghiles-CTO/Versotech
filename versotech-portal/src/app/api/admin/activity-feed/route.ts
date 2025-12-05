import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check if user has super_admin permission
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'super_admin')
      .single()

    if (!permission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get recent activity from audit_logs (last 100 events)
    const { data: activities, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        timestamp,
        actor_id,
        actor_name,
        action,
        entity_type,
        entity_id,
        before_value,
        after_value
      `)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Activity feed error:', error)
      return NextResponse.json({ error: 'Failed to fetch activity feed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: activities || [],
    })
  } catch (error) {
    console.error('Activity feed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
