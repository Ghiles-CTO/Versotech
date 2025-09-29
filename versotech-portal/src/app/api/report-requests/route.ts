import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'

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

    // Get report requests for this investor
    const { data: requests, error } = await supabase
      .from('report_requests')
      .select(`
        *,
        vehicles (id, name, type),
        documents (id, type, file_key)
      `)
      .in('investor_id', investorIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Report requests query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch report requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      requests: requests || []
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
    const body = await request.json()
    
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

    const investorId = investorLinks[0].investor_id // Use first investor entity

    // Validate request body
    const { reportType, vehicleId, filters, priority = 'normal' } = body

    if (!reportType) {
      return NextResponse.json(
        { error: 'Report type is required' },
        { status: 400 }
      )
    }

    // Create report request
    const { data: reportRequest, error: createError } = await supabase
      .from('report_requests')
      .insert({
        investor_id: investorId,
        vehicle_id: vehicleId || null,
        filters: filters || {},
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

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'report_request',
      entity_id: reportRequest.id,
      metadata: {
        report_type: reportType,
        vehicle_id: vehicleId,
        filters: filters,
        priority
      }
    })

    // TODO: Trigger n8n workflow for report generation
    // This would typically send a webhook to n8n with report parameters

    return NextResponse.json({
      id: reportRequest.id,
      status: 'queued',
      message: 'Report request submitted successfully'
    })

  } catch (error) {
    console.error('Report request creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}