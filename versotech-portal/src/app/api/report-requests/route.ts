import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import type { CreateReportRequest, CreateReportResponse } from '@/types/reports'
import { REPORT_TYPES, DUPLICATE_DETECTION_WINDOW, DEFAULT_PAGE_SIZE } from '@/lib/reports/constants'
import { validateReportRequest } from '@/lib/reports/validation'
import { getAppUrl } from '@/lib/signature/token'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'investor') {
      return NextResponse.json(
        { error: 'Investor access required' },
        { status: 403 }
      )
    }

    // Get investor entities linked to this user
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ requests: [] })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Get report requests for this investor with enhanced relations
    const { data: requests, error } = await supabase
      .from('report_requests')
      .select(`
        *,
        vehicles (id, name, type),
        documents (id, type, file_key, created_at),
        workflow_runs (id, status, created_at, updated_at)
      `)
      .in('investor_id', investorIds)
      .order('created_at', { ascending: false })
      .limit(DEFAULT_PAGE_SIZE)

    if (error) {
      console.error('Report requests query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch report requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      requests: requests || [],
      totalCount: requests?.length || 0
    })

  } catch (error) {
    console.error('Report requests API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body: CreateReportRequest = await request.json()

    // Validate request data
    const validation = validateReportRequest(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0].message, errors: validation.errors },
        { status: 400 }
      )
    }

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile and investor links
    const [{ data: profile }, { data: investorLinks }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase.from('investor_users').select('investor_id').eq('user_id', user.id)
    ])

    if (!profile || profile.role !== 'investor') {
      return NextResponse.json(
        { error: 'Investor access required' },
        { status: 403 }
      )
    }

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json(
        { error: 'No investor entities found' },
        { status: 403 }
      )
    }

    const investorId = investorLinks[0].investor_id

    // Check for duplicate recent requests (within 5 minutes)
    const duplicateWindow = new Date(Date.now() - DUPLICATE_DETECTION_WINDOW).toISOString()
    const { data: duplicates } = await supabase
      .from('report_requests')
      .select('id, status, created_at')
      .eq('investor_id', investorId)
      .eq('report_type', body.reportType)
      .eq('vehicle_id', body.vehicleId || null)
      .gte('created_at', duplicateWindow)
      .in('status', ['queued', 'processing'])

    if (duplicates && duplicates.length > 0) {
      console.log('Duplicate report request detected, reusing existing:', duplicates[0].id)
      return NextResponse.json({
        id: duplicates[0].id,
        status: duplicates[0].status,
        message: 'Similar report already in progress',
        estimated_completion: new Date(
          new Date(duplicates[0].created_at).getTime() + REPORT_TYPES[body.reportType].sla
        ).toISOString()
      } as CreateReportResponse)
    }

    // Create report request
    const filterPayload = {
      ...body.filters,
      scope: body.scope || 'all',
      from_date: body.fromDate || null,
      to_date: body.toDate || null,
      year: body.year || null,
      currency: body.currency || null,
      include_excel: body.includeExcel ?? false,
      include_pdf: body.includePdf ?? true,
      include_benchmark: (body as any).includeBenchmark ?? false,
      notes: body.notes || null
    }

    const { data: reportRequest, error: createError } = await supabase
      .from('report_requests')
      .insert({
        investor_id: investorId,
        vehicle_id: body.vehicleId || null,
        report_type: body.reportType,
        filters: filterPayload,
        status: 'queued',
        created_by: user.id
      })
      .select()
      .single()

    if (createError) {
      console.error('Failed to create report request:', createError)
      return NextResponse.json(
        { error: 'Failed to create report request' },
        { status: 500 }
      )
    }

    // Trigger n8n workflow
    const workflowKey = REPORT_TYPES[body.reportType].workflowKey
    const workflowPayload = {
      entity_type: 'report_request',
      entity_id: reportRequest.id,
      payload: {
        report_request_id: reportRequest.id,
        investor_id: investorId,
        vehicle_id: body.vehicleId || null,
        report_type: body.reportType,
          filters: filterPayload
      }
    }

    try {
      const triggerResponse = await fetch(
        `${getAppUrl()}/api/workflows/${workflowKey}/trigger`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify(workflowPayload)
        }
      )

      if (!triggerResponse.ok) {
        console.error('Workflow trigger failed:', await triggerResponse.text())
        // Continue anyway - webhook will be retried
      } else {
        const { workflow_run_id } = await triggerResponse.json()

        // Link workflow run to report request
        if (workflow_run_id) {
          await supabase
            .from('report_requests')
            .update({ workflow_run_id, status: 'processing' })
            .eq('id', reportRequest.id)
        }
      }
    } catch (workflowError) {
      console.error('Error triggering workflow:', workflowError)
      // Continue - report is queued, can be triggered manually
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.REPORT_REQUESTED,
      entity: 'report_requests',
      entity_id: reportRequest.id,
      metadata: {
        report_type: body.reportType,
        vehicle_id: body.vehicleId,
        filters: filterPayload
      }
    })

    // Create activity feed entry
    await supabase.from('activity_feed').insert({
      investor_id: investorId,
      activity_type: 'document',
      title: 'Report Generation Started',
      description: `Generating ${REPORT_TYPES[body.reportType].label}`,
      importance: 'normal',
      entity_type: 'report_request',
      entity_id: reportRequest.id
    })

    const estimatedCompletion = new Date(
      Date.now() + REPORT_TYPES[body.reportType].sla
    ).toISOString()

    return NextResponse.json({
      id: reportRequest.id,
      status: 'queued',
      estimated_completion: estimatedCompletion,
      message: 'Report generation started'
    } as CreateReportResponse)

  } catch (error) {
    console.error('Report request creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}