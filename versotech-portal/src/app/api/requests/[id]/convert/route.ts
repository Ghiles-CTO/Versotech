import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const convertRequestSchema = z.object({
  workflow_key: z.string().min(1, 'Workflow key is required'),
  form_inputs: z.record(z.any()).optional()
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServiceClient()
    
    // Get the authenticated user from regular client
    const regularSupabase = await createClient()
    const { data: { user }, error: authError } = await regularSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, title')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    const requestId = params.id

    // Parse and validate request body
    const body = await request.json()
    const validatedData = convertRequestSchema.parse(body)

    // Get the original request
    const { data: originalRequest, error: requestError } = await supabase
      .from('request_tickets')
      .select(`
        *,
        investors:investor_id (
          legal_name
        ),
        deals:deal_id (
          name
        )
      `)
      .eq('id', requestId)
      .single()

    if (requestError || !originalRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Get workflow configuration
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('key', validatedData.workflow_key)
      .single()

    if (workflowError || !workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Check if user is authorized for this workflow
    if (workflow.allowed_titles && !workflow.allowed_titles.includes(profile.title)) {
      return NextResponse.json(
        { error: 'Insufficient permissions for this workflow' },
        { status: 403 }
      )
    }

    // Prepare workflow payload combining request context with form inputs
    const workflowPayload = {
      ...validatedData.form_inputs,
      // Context from original request
      original_request: {
        id: originalRequest.id,
        category: originalRequest.category,
        subject: originalRequest.subject,
        details: originalRequest.details,
        priority: originalRequest.priority,
        investor_id: originalRequest.investor_id,
        deal_id: originalRequest.deal_id,
        investor_name: originalRequest.investors?.legal_name,
        deal_name: originalRequest.deals?.name
      },
      // Conversion context
      converted_by: user.id,
      converted_at: new Date().toISOString()
    }

    // Create workflow run
    const { data: workflowRun, error: runError } = await supabase
      .from('workflow_runs')
      .insert({
        workflow_id: workflow.id,
        triggered_by: user.id,
        payload: workflowPayload,
        status: 'queued'
      })
      .select()
      .single()

    if (runError) {
      console.error('Error creating workflow run:', runError)
      return NextResponse.json(
        { error: 'Failed to create workflow run' },
        { status: 500 }
      )
    }

    // Update the original request to link it to the workflow run
    const { error: linkError } = await supabase
      .from('request_tickets')
      .update({
        linked_workflow_run: workflowRun.id,
        status: 'in_progress',
        assigned_to: user.id
      })
      .eq('id', requestId)

    if (linkError) {
      console.error('Error linking request to workflow:', linkError)
      // Don't fail the whole operation, just log the error
    }

    // Log the conversion
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'CONVERT_REQUEST_TO_WORKFLOW',
      entity: AuditEntities.REQUEST_TICKETS,
      entity_id: requestId,
      metadata: {
        endpoint: `/api/requests/${requestId}/convert`,
        workflow_key: validatedData.workflow_key,
        workflow_run_id: workflowRun.id,
        original_category: originalRequest.category,
        original_subject: originalRequest.subject,
        investor_id: originalRequest.investor_id,
        deal_id: originalRequest.deal_id
      }
    })

    return NextResponse.json({
      success: true,
      workflowRun,
      message: `Request converted to ${validatedData.workflow_key} workflow`,
      request: {
        id: requestId,
        status: 'in_progress',
        linked_workflow_run: workflowRun.id
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Request conversion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
