import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { DEMO_COOKIE_NAME, parseDemoSession } from '@/lib/demo-session'

async function resolveClientAndUser() {
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)

  if (demoCookie) {
    const session = parseDemoSession(demoCookie.value)
    if (session && session.role?.startsWith('staff_')) {
      const client = createServiceClient()
      return { client, user: { id: session.id, role: session.role } }
    }
  }

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

  if (!profile || !profile.role?.startsWith('staff_')) {
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

    if (!assignee) {
      return NextResponse.json({ error: 'Assignee is required' }, { status: 400 })
    }

    const { data: assigneeProfile } = await client
      .from('profiles')
      .select('id, display_name, role, email')
      .eq('id', assignee)
      .maybeSingle()

    if (!assigneeProfile || !assigneeProfile.role?.startsWith('staff_')) {
      return NextResponse.json({ error: 'Invalid staff member' }, { status: 400 })
    }

    // Update only existing columns; set status to 'assigned'
    const { data: updateResult, error: updateError } = await client
      .from('request_tickets')
      .update({
        assigned_to: assigneeProfile.id,
        status: 'assigned',
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

    return NextResponse.json({ request: updateResult })
  } catch (error) {
    console.error('[assign-request] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


