import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const workflowKey = searchParams.get('workflow_key')

    let query = supabase
      .from('workflow_runs')
      .select('id, workflow_key, status, started_at, completed_at, error_message, duration_ms')
      .order('started_at', { ascending: false })
      .limit(limit)

    if (workflowKey) {
      query = query.eq('workflow_key', workflowKey)
    }

    const { data: runs, error } = await query

    if (error) {
      console.error('Workflow runs fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch workflow runs' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        runs,
      },
    })
  } catch (error) {
    console.error('Workflow runs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
