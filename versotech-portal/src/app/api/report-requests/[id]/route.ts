import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/report-requests/[id]
 * Check status of a specific report request
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get investor IDs for the current user
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json(
        { error: 'No investor access' },
        { status: 403 }
      )
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Fetch the report request with enhanced relations
    const { data: reportRequest, error } = await supabase
      .from('report_requests')
      .select(`
        *,
        vehicles (id, name, type),
        documents (id, type, file_key, created_at),
        workflow_runs (id, status, created_at, updated_at),
        created_by_profile:created_by (id, display_name, email)
      `)
      .eq('id', id)
      .in('investor_id', investorIds)
      .single()

    if (error || !reportRequest) {
      return NextResponse.json(
        { error: 'Report request not found or access denied' },
        { status: 404 }
      )
    }

    // Calculate progress metrics
    const createdAt = new Date(reportRequest.created_at).getTime()
    const now = Date.now()
    const elapsedMs = now - createdAt

    let progress = 0
    if (reportRequest.status === 'queued') {
      progress = 10
    } else if (reportRequest.status === 'processing') {
      // Estimate progress based on time elapsed (max 90%)
      const estimatedDuration = 5 * 60 * 1000 // 5 minutes default
      progress = Math.min(90, 10 + (elapsedMs / estimatedDuration) * 80)
    } else if (reportRequest.status === 'ready') {
      progress = 100
    } else if (reportRequest.status === 'failed') {
      progress = 0
    }

    return NextResponse.json({
      id: reportRequest.id,
      status: reportRequest.status,
      report_type: reportRequest.report_type,
      vehicle_id: reportRequest.vehicle_id,
      vehicle: reportRequest.vehicles,
      result_doc_id: reportRequest.result_doc_id,
      document: reportRequest.documents,
      workflow_run_id: reportRequest.workflow_run_id,
      workflow_run: reportRequest.workflow_runs,
      error_message: reportRequest.error_message,
      created_at: reportRequest.created_at,
      completed_at: reportRequest.completed_at,
      created_by: reportRequest.created_by_profile,
      progress,
      elapsed_ms: elapsedMs
    })

  } catch (error) {
    console.error('Error fetching report request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
