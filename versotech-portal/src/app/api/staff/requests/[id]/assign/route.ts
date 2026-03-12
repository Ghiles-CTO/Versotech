import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger } from '@/lib/audit'

async function resolveClientAndUser() {
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()
  
  if (!user) {
    return { client, user: null }
  }

  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !(profile.role?.startsWith('staff_') || profile.role === 'ceo')) {
    return { client, user: null }
  }

  return { client, user: { id: user.id, role: profile.role } }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { client, user } = await resolveClientAndUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing request identifier' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const assignee = typeof body.assigned_to === 'string' ? body.assigned_to.trim() : null
    const note = typeof body.note === 'string' ? body.note.trim() : null

    if (!assignee) {
      return NextResponse.json({ error: 'Assignee is required' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()

    const { data: currentRequest } = await serviceSupabase
      .from('request_tickets')
      .select(`
        id,
        subject,
        status,
        assigned_to,
        assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name, email)
      `)
      .eq('id', id)
      .maybeSingle()

    if (!currentRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const { data: assigneeProfile } = await client
      .from('profiles')
      .select('id, display_name, role, email')
      .eq('id', assignee)
      .maybeSingle()

    if (!assigneeProfile || !(assigneeProfile.role?.startsWith('staff_') || assigneeProfile.role === 'ceo')) {
      return NextResponse.json({ error: 'Invalid staff member' }, { status: 400 })
    }

    // Update only existing columns; set status to 'assigned'
    const { data: updateResult, error: updateError } = await client
      .from('request_tickets')
      .update({
        assigned_to: assigneeProfile.id,
        assigned_at: new Date().toISOString(),
        status: currentRequest.status === 'open' ? 'assigned' : currentRequest.status,
      })
      .eq('id', id)
      .select(
        `
        *,
        investor:investors (id, legal_name),
        created_by_profile:profiles!request_tickets_created_by_fkey (id, display_name),
        assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name)
      `,
      )
      .single()

    if (updateError || !updateResult) {
      console.error('[assign-request] Update failed', updateError)
      return NextResponse.json({ error: 'Failed to assign request' }, { status: 500 })
    }

    const previousAssignee = Array.isArray(currentRequest.assigned_to_profile)
      ? currentRequest.assigned_to_profile[0]
      : currentRequest.assigned_to_profile
    const wasReassignment = Boolean(currentRequest.assigned_to) && currentRequest.assigned_to !== assigneeProfile.id

    await auditLogger.log({
      actor_user_id: user.id,
      action: wasReassignment ? 'request_reassigned' : 'request_assigned',
      entity: 'request_tickets',
      entity_id: id,
      metadata: {
        summary: wasReassignment
          ? `Reassigned to ${assigneeProfile.display_name || assigneeProfile.email}`
          : `Assigned to ${assigneeProfile.display_name || assigneeProfile.email}`,
        previous_assignee_id: previousAssignee?.id || null,
        previous_assignee_name: previousAssignee?.display_name || previousAssignee?.email || null,
        assignee_id: assigneeProfile.id,
        assignee_name: assigneeProfile.display_name || assigneeProfile.email,
        previous_status: currentRequest.status,
        new_status: currentRequest.status === 'open' ? 'assigned' : currentRequest.status,
        note: note || null,
      },
    })

    return NextResponse.json({ request: updateResult })
  } catch (error) {
    console.error('[assign-request] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
