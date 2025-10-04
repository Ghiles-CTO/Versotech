import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import type { CreateCustomRequest, CreateCustomRequestResponse, RequestTicketListResponse } from '@/types/reports'
import { validateCustomRequest, sanitizeCustomRequestData } from '@/lib/reports/validation'
import { DEFAULT_PAGE_SIZE } from '@/lib/reports/constants'

/**
 * GET /api/requests
 * List custom requests for the current investor
 */
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get investor entities linked to this user
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ tickets: [], totalCount: 0, overdueCount: 0 })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Get request tickets with enhanced relations
    const { data: tickets, error } = await supabase
      .from('request_tickets')
      .select(`
        *,
        investor:investors!request_tickets_investor_id_fkey (id, legal_name),
        created_by_profile:profiles!request_tickets_created_by_fkey (id, display_name, email),
        assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name, email),
        documents:documents!request_tickets_result_doc_id_fkey (id, file_key, type, created_at)
      `)
      .in('investor_id', investorIds)
      .order('created_at', { ascending: false })
      .limit(DEFAULT_PAGE_SIZE)

    if (error) {
      console.error('Request tickets query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch request tickets' },
        { status: 500 }
      )
    }

    // Count overdue tickets
    const overdueCount = tickets?.filter(ticket => {
      if (ticket.status === 'closed' || ticket.status === 'ready') return false
      return new Date(ticket.due_date) < new Date()
    }).length || 0

    return NextResponse.json({
      tickets: tickets || [],
      totalCount: tickets?.length || 0,
      overdueCount
    } as RequestTicketListResponse)

  } catch (error) {
    console.error('Request tickets API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/requests
 * Create a new custom request ticket
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body: CreateCustomRequest = await request.json()

    // Sanitize and validate request data
    const sanitized = sanitizeCustomRequestData(body)
    const validation = validateCustomRequest(sanitized)

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

    // Create request ticket (due_date will be auto-set by database trigger)
    const { data: ticket, error: createError } = await supabase
      .from('request_tickets')
      .insert({
        investor_id: investorId,
        created_by: user.id,
        category: sanitized.category,
        subject: sanitized.subject,
        details: sanitized.details || null,
        priority: sanitized.priority || 'normal',
        status: 'open',
        deal_id: sanitized.dealId || null
      })
      .select(`
        *,
        investor:investors!request_tickets_investor_id_fkey (id, legal_name)
      `)
      .single()

    if (createError || !ticket) {
      console.error('Failed to create request ticket:', createError)
      return NextResponse.json(
        { error: 'Failed to create request' },
        { status: 500 }
      )
    }

    // Create activity feed entry
    await supabase.from('activity_feed').insert({
      investor_id: investorId,
      activity_type: 'message',
      title: 'New Request Submitted',
      description: sanitized.subject,
      importance: sanitized.priority === 'high' ? 'high' : 'normal',
      entity_type: 'request_ticket',
      entity_id: ticket.id,
      read_status: false
    })

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'request_created',
      entity: 'request_tickets',
      entity_id: ticket.id,
      metadata: {
        category: sanitized.category,
        priority: sanitized.priority,
        subject: sanitized.subject
      }
    })

    return NextResponse.json({
      id: ticket.id,
      due_date: ticket.due_date,
      message: 'Request submitted successfully'
    } as CreateCustomRequestResponse, { status: 201 })

  } catch (error) {
    console.error('Request creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
