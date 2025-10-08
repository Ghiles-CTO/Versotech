import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import type { UpdateRequestTicket } from '@/types/reports'
import { validateRequestUpdate } from '@/lib/reports/validation'
import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'

/**
 * GET /api/requests/[id]
 * Get details of a specific request ticket
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

    // Fetch the request ticket with full relations
    const { data: ticket, error } = await supabase
      .from('request_tickets')
      .select(`
        *,
        investor:investors!request_tickets_investor_id_fkey (id, legal_name),
        created_by_profile:profiles!request_tickets_created_by_fkey (id, display_name, email),
        assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name, email),
        documents:documents!request_tickets_result_doc_id_fkey (id, file_key, type, created_at),
        deal:deals!request_tickets_deal_id_fkey (id, name)
      `)
      .eq('id', id)
      .single()

    if (error || !ticket) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check access: must be creator or staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role?.startsWith('staff_')
    const isCreator = ticket.created_by === user.id

    if (!isStaff && !isCreator) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Calculate if overdue
    const isOverdue = ticket.status !== 'closed' && ticket.status !== 'ready' &&
      new Date(ticket.due_date) < new Date()

    return NextResponse.json({
      ...ticket,
      is_overdue: isOverdue,
      time_remaining_ms: new Date(ticket.due_date).getTime() - Date.now()
    })

  } catch (error) {
    console.error('Error fetching request ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/requests/[id]
 * Update request ticket (staff only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateRequestTicket = await request.json()

    // Validate update data
    const validation = validateRequestUpdate(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0].message, errors: validation.errors },
        { status: 400 }
      )
    }

    // Check for demo session or real auth
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
    let userId: string
    let isStaff = false
    let supabase: any

    if (demoCookie) {
      const demoSession = parseDemoSession(demoCookie.value)
      if (demoSession && demoSession.role.startsWith('staff_')) {
        userId = demoSession.id
        isStaff = true
        supabase = createServiceClient() // Use service client to bypass RLS
      } else {
        return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
      }
    } else {
      supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      userId = user.id

      // Verify staff role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !profile.role.startsWith('staff_')) {
        return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
      }
      isStaff = true
    }

    // Fetch original ticket for audit trail
    const { data: originalTicket } = await supabase
      .from('request_tickets')
      .select('investor_id, subject, status')
      .eq('id', id)
      .single()

    if (!originalTicket) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Prepare update object
    const updates: any = {}
    if (body.status) updates.status = body.status
    if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to
    if (body.priority) updates.priority = body.priority
    if (body.completion_note) updates.completion_note = body.completion_note
    if (body.result_doc_id) updates.result_doc_id = body.result_doc_id

    // closed_at column not present in current schema; skip timestamping

    // Update the ticket
    const { data: updatedTicket, error: updateError } = await supabase
      .from('request_tickets')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        investor:investors!request_tickets_investor_id_fkey (id, legal_name),
        created_by_profile:profiles!request_tickets_created_by_fkey (id, display_name, email),
        assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name, email),
        documents:documents!request_tickets_result_doc_id_fkey (id, file_key, type)
      `)
      .single()

    if (updateError || !updatedTicket) {
      console.error('Failed to update request ticket:', updateError)
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      )
    }

    // Create activity feed entry for status changes
    if (body.status && body.status !== originalTicket.status) {
      const activityTitle = body.status === 'closed' ? 'Request Completed' :
        body.status === 'ready' ? 'Request Ready' :
          body.status === 'in_progress' ? 'Request In Progress' :
            'Request Updated'

      await supabase.from('activity_feed').insert({
        investor_id: originalTicket.investor_id,
        activity_type: 'message',
        title: activityTitle,
        description: originalTicket.subject,
        importance: body.status === 'closed' || body.status === 'ready' ? 'high' : 'normal',
        entity_type: 'request_ticket',
        entity_id: id,
        read_status: false
      })
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: userId,
      action: 'request_updated',
      entity: 'request_tickets',
      entity_id: id,
      metadata: {
        changes: updates,
        previous_status: originalTicket.status,
        new_status: body.status
      }
    })

    return NextResponse.json({
      ticket: updatedTicket,
      message: 'Request updated successfully'
    })

  } catch (error) {
    console.error('Request update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
