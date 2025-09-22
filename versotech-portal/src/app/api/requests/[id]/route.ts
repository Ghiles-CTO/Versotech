import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateRequestSchema = z.object({
  status: z.enum(['open', 'assigned', 'in_progress', 'ready', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  assigned_to: z.string().uuid().optional(),
  linked_workflow_run: z.string().uuid().optional(),
  result_doc_id: z.string().uuid().optional(),
  notes: z.string().optional()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const requestId = params.id

    // Get request details (RLS will filter based on user permissions)
    const { data: requestTicket, error } = await supabase
      .from('request_tickets')
      .select(`
        *,
        investors:investor_id (
          legal_name
        ),
        deals:deal_id (
          name
        ),
        created_by_profile:created_by (
          display_name,
          email
        ),
        assigned_to_profile:assigned_to (
          display_name,
          email
        ),
        result_document:result_doc_id (
          id,
          type,
          file_key,
          created_at
        ),
        workflow_run:linked_workflow_run (
          id,
          status,
          created_at,
          updated_at,
          workflows (
            key,
            schema
          )
        )
      `)
      .eq('id', requestId)
      .single()

    if (error || !requestTicket) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Log access
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: AuditEntities.REQUEST_TICKETS,
      entity_id: requestId,
      metadata: {
        endpoint: `/api/requests/${requestId}`,
        request_category: requestTicket.category,
        request_status: requestTicket.status
      }
    })

    return NextResponse.json(requestTicket)

  } catch (error) {
    console.error('Request detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Check if user is staff (only staff can update requests)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
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
    const validatedData = updateRequestSchema.parse(body)

    // Get current request for audit logging
    const { data: currentRequest } = await supabase
      .from('request_tickets')
      .select('status, subject, category')
      .eq('id', requestId)
      .single()

    if (!currentRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Update the request
    const { data: updatedRequest, error } = await supabase
      .from('request_tickets')
      .update(validatedData)
      .eq('id', requestId)
      .select(`
        *,
        investors:investor_id (
          legal_name
        ),
        deals:deal_id (
          name
        ),
        assigned_to_profile:assigned_to (
          display_name,
          email
        ),
        result_document:result_doc_id (
          id,
          type,
          file_key
        )
      `)
      .single()

    if (error) {
      console.error('Request update error:', error)
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      )
    }

    // Log update
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.REQUEST_TICKETS,
      entity_id: requestId,
      metadata: {
        endpoint: `/api/requests/${requestId}`,
        request_category: currentRequest.category,
        request_subject: currentRequest.subject,
        status_change: currentRequest.status !== validatedData.status ? {
          from: currentRequest.status,
          to: validatedData.status
        } : null,
        updated_fields: Object.keys(validatedData),
        assigned_to: validatedData.assigned_to
      }
    })

    return NextResponse.json(updatedRequest)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Request update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
