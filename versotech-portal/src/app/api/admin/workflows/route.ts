import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { processWorkflows } from '@/lib/workflows'

export async function GET() {
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

    // Fetch workflow configurations from database
    const { data: workflowConfigs } = await supabase
      .from('workflows')
      .select('key, is_active')

    const configMap = new Map(workflowConfigs?.map((w) => [w.key, w.is_active]) || [])

    // Fetch workflow run statistics
    const { data: runStats } = await supabase
      .from('workflow_runs')
      .select('workflow_key, status, duration_ms, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Calculate stats per workflow
    const statsMap: Record<
      string,
      {
        total_runs: number
        successful_runs: number
        failed_runs: number
        total_duration: number
        last_run_at: string | null
      }
    > = {}

    runStats?.forEach((run) => {
      if (!statsMap[run.workflow_key]) {
        statsMap[run.workflow_key] = {
          total_runs: 0,
          successful_runs: 0,
          failed_runs: 0,
          total_duration: 0,
          last_run_at: null,
        }
      }

      const stat = statsMap[run.workflow_key]
      stat.total_runs++
      if (run.status === 'completed') stat.successful_runs++
      if (run.status === 'failed') stat.failed_runs++
      if (run.duration_ms) stat.total_duration += run.duration_ms
      if (!stat.last_run_at || run.created_at > stat.last_run_at) {
        stat.last_run_at = run.created_at
      }
    })

    // Build workflow list from definitions
    const workflows = processWorkflows.map((def) => {
      const stats = statsMap[def.key] || {
        total_runs: 0,
        successful_runs: 0,
        failed_runs: 0,
        total_duration: 0,
        last_run_at: null,
      }

      return {
        id: def.key,
        key: def.key,
        title: def.title,
        category: def.category,
        enabled: configMap.get(def.key) ?? true, // Read from DB, default to true
        success_rate:
          stats.total_runs > 0
            ? Math.round((stats.successful_runs / stats.total_runs) * 100)
            : 100,
        total_runs: stats.total_runs,
        successful_runs: stats.successful_runs,
        failed_runs: stats.failed_runs,
        last_run_at: stats.last_run_at,
        avg_duration_ms:
          stats.total_runs > 0 ? Math.round(stats.total_duration / stats.total_runs) : 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        workflows,
      },
    })
  } catch (error) {
    console.error('Workflows API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
