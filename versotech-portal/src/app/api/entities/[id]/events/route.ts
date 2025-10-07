import { NextResponse } from 'next/server'
import { createSmartClient } from '@/lib/supabase/smart-client'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSmartClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    const { id } = await params

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { data: events, error } = await supabase
      .from('entity_events')
      .select(`
        id,
        event_type,
        description,
        payload,
        created_at,
        changed_by_profile:changed_by (
          id,
          display_name,
          email
        )
      `)
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Entity events fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    return NextResponse.json({ events: events || [] })

  } catch (error) {
    console.error('Entity events API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}