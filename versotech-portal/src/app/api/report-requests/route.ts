import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Get report requests for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to determine access level
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Get report requests (RLS policy handles investor vs staff access)
    const { data: reportRequests, error } = await supabase
      .from('report_requests')
      .select(`
        *,
        investors:investor_id (
          legal_name,
          country
        ),
        vehicles:vehicle_id (
          name,
          type,
          currency
        ),
        result_document:result_doc_id (
          id,
          file_key,
          type,
          created_at
        ),
        created_by_profile:created_by (
          display_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching report requests:', error)
      return NextResponse.json({ error: 'Failed to fetch report requests' }, { status: 500 })
    }

    return NextResponse.json({
      report_requests: reportRequests || []
    })

  } catch (error) {
    console.error('Report requests API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new report request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      report_type, 
      vehicle_id, 
      filters = {}, 
      priority = 'normal',
      description 
    } = await request.json()

    if (!report_type) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // For investors, get their linked investor entities
    let investorId = null
    if (profile?.role === 'investor') {
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      investorId = investorLinks?.investor_id
      
      if (!investorId) {
        return NextResponse.json({ 
          error: 'No investor profile found for your account' 
        }, { status: 400 })
      }
    }

    // Create report request
    const { data: reportRequest, error: requestError } = await supabase
      .from('report_requests')
      .insert({
        investor_id: investorId,
        vehicle_id: vehicle_id || null,
        filters: {
          ...filters,
          report_type,
          priority,
          description,
          requested_at: new Date().toISOString()
        },
        status: 'queued',
        created_by: user.id
      })
      .select(`
        *,
        investors:investor_id (
          legal_name,
          country
        ),
        vehicles:vehicle_id (
          name,
          type
        )
      `)
      .single()

    if (requestError) {
      console.error('Error creating report request:', requestError)
      return NextResponse.json({ error: 'Failed to create report request' }, { status: 500 })
    }

    // Trigger n8n workflow for report generation
    try {
      const workflowPayload = {
        entity_type: 'report_request',
        entity_id: reportRequest.id,
        payload: {
          report_type,
          investor_id: investorId,
          vehicle_id: vehicle_id || null,
          filters,
          priority,
          description,
          user_email: user.email,
          user_id: user.id
        }
      }

      const response = await fetch(`${request.nextUrl.origin}/api/workflows/reporting-agent/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || ''
        },
        body: JSON.stringify(workflowPayload)
      })

      if (!response.ok) {
        console.warn('Failed to trigger workflow, but report request created')
        
        // Update status to indicate manual processing needed
        await supabase
          .from('report_requests')
          .update({ 
            status: 'manual_processing_required',
            filters: {
              ...reportRequest.filters,
              workflow_trigger_failed: true,
              manual_processing_note: 'Automatic workflow trigger failed, requires manual processing'
            }
          })
          .eq('id', reportRequest.id)
      }

    } catch (workflowError) {
      console.warn('Workflow trigger error:', workflowError)
      // Don't fail the request creation, just mark for manual processing
    }

    // Log report request creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.REPORT_REQUESTED,
      entity: AuditEntities.REQUEST_TICKETS,
      entity_id: reportRequest.id,
      metadata: {
        report_type,
        investor_id: investorId,
        vehicle_id,
        priority,
        has_filters: Object.keys(filters).length > 0
      }
    })

    return NextResponse.json({
      success: true,
      report_request: reportRequest,
      message: 'Report request submitted successfully. You will be notified when it is ready.'
    })

  } catch (error) {
    console.error('Create report request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

