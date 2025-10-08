import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'
import { createSmartClient } from '@/lib/supabase/smart-client'

type RequestFilters = {
  status?: string | null
  category?: string | null
  priority?: string | null
  assigned_to?: string | null
  overdue_only?: string | null
  q?: string | null
}

async function getAuthenticatedStaff(supabase: any) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile?.role?.startsWith('staff_')) {
      return { user: null, error: new Error('Staff access required'), role: null }
    }
    return { user, error, role: profile.role } as const
  }

  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
  if (demoCookie) {
    const demoSession = parseDemoSession(demoCookie.value)
    if (demoSession && demoSession.role.startsWith('staff_')) {
      return {
        user: { id: demoSession.id, email: demoSession.email },
        error: null,
        role: demoSession.role,
        isDemo: true,
      } as const
    }
  }

  return { user: null, error: error || new Error('Unauthorized'), role: null } as const
}

export async function GET(request: Request) {
  try {
    const supabase = await createSmartClient()
    const { user, error, role, isDemo } = await getAuthenticatedStaff(supabase)

    if (error || !user || !role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters: RequestFilters = {
      status: searchParams.get('status'),
      category: searchParams.get('category'),
      priority: searchParams.get('priority'),
      assigned_to: searchParams.get('assigned_to'),
      overdue_only: searchParams.get('overdue_only'),
      q: searchParams.get('q'),
    }

    let query = supabase
      .from('request_tickets')
      .select(
        `
        *,
        investor:investors!request_tickets_investor_id_fkey (id, legal_name),
        created_by_profile:profiles!request_tickets_created_by_fkey (id, display_name, email),
        assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name, email)
      `,
      )
      .order('created_at', { ascending: false })

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority)
    }
    
    // Handle 'assigned_to = me' filter - skip for demo users with non-UUID IDs
    if (filters.assigned_to === 'me') {
      // Check if user.id is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(user.id)) {
        query = query.eq('assigned_to', user.id)
      } else {
        // For demo users, return empty results for 'my tasks'
        query = query.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    } else if (filters.assigned_to && filters.assigned_to !== 'all') {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    // Overdue filtering requires due_date which doesn't exist in current schema; ignore for now
    if (filters.q) {
      const search = filters.q
      query = query.or(
        `subject.ilike.%${search}%,details.ilike.%${search}%,investor.legal_name.ilike.%${search}%,assigned_to_profile.display_name.ilike.%${search}%`,
      )
    }

    const { data: requests, error: fetchError } = await query

    if (fetchError) {
      console.error('[StaffRequests] Error fetching requests:', fetchError)
      return NextResponse.json(
        {
          error: 'Failed to fetch requests',
          details: fetchError.message,
          hint: fetchError.hint,
          code: fetchError.code,
          status: 500,
        },
        { status: 500 },
      )
    }

    const statsQuery = supabase
      .from('request_tickets')
      .select('status', { count: 'exact', head: false })

    const { data: allTickets, error: statsError } = await statsQuery

    if (statsError) {
      console.warn('[StaffRequests] Stats query failed, continuing with stats=null', statsError)
    }

    const stats = allTickets
      ? {
          total_requests: allTickets.length,
          open_count: allTickets.filter((ticket: any) => ticket.status === 'open').length,
          in_progress_count: allTickets.filter((ticket: any) => ['assigned', 'in_progress'].includes(ticket.status)).length,
          ready_count: allTickets.filter((ticket: any) => ticket.status === 'ready').length,
          overdue_count: 0,
          avg_fulfillment_time_hours: null,
          sla_compliance_rate: null,
        }
      : null

    return NextResponse.json({
      requests: requests || [],
      stats,
      hasData: Boolean(requests && requests.length > 0) || Boolean(isDemo),
    })
  } catch (err) {
    console.error('[StaffRequests] Unexpected error:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err),
        status: 500,
      },
      { status: 500 },
    )
  }
}


