import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Get recent activity from audit_log (last 100 events)
    const { data: activities, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        created_at,
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        profiles!audit_logs_user_id_fkey (
          display_name
        )
      `)
      .order('created_at', { ascending: false })
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
