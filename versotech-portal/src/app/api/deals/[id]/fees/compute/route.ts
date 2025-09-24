import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for fee computation
const computeFeesSchema = z.object({
  as_of_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = params.id
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff (only staff can compute fees)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required to compute fees' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const validation = computeFeesSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { as_of_date } = validation.data
    const computeDate = as_of_date || new Date().toISOString().split('T')[0]

    // Now use service client for database operations
    const serviceSupabase = createServiceClient()

    // Verify deal exists
    const { data: deal } = await serviceSupabase
      .from('deals')
      .select('id, name, status')
      .eq('id', dealId)
      .single()

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Call the database function to compute fee events
    const { data: eventsCreated, error: computeError } = await serviceSupabase
      .rpc('fn_compute_fee_events', {
        p_deal_id: dealId,
        p_as_of_date: computeDate
      })

    if (computeError) {
      console.error('Fee computation error:', computeError)
      return NextResponse.json(
        { error: computeError.message || 'Failed to compute fee events' },
        { status: 500 }
      )
    }

    // Get the newly created fee events for this deal
    const { data: feeEvents } = await serviceSupabase
      .from('fee_events')
      .select(`
        *,
        investors (
          legal_name
        ),
        fee_components (
          kind,
          calc_method,
          rate_bps,
          frequency
        )
      `)
      .eq('deal_id', dealId)
      .eq('event_date', computeDate)
      .eq('status', 'accrued')
      .order('created_at', { ascending: false })

    // Log the fee computation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.FEE_EVENTS,
      entity_id: dealId,
      metadata: {
        deal_id: dealId,
        as_of_date: computeDate,
        events_created: eventsCreated,
        computed_by: profile.display_name
      }
    })

    return NextResponse.json({
      success: true,
      events_created: eventsCreated,
      as_of_date: computeDate,
      fee_events: feeEvents || [],
      message: `Successfully computed ${eventsCreated} fee events for ${deal.name} as of ${computeDate}`
    })

  } catch (error) {
    console.error('Fee computation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to view computed fee events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dealId } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const status = searchParams.get('status') || 'accrued'
    const fromDate = searchParams.get('from_date')
    const toDate = searchParams.get('to_date')

    // Use service client for database operations
    const serviceSupabase = createServiceClient()

    // Build query
    let query = serviceSupabase
      .from('fee_events')
      .select(`
        *,
        investors (
          legal_name
        ),
        fee_components (
          kind,
          calc_method,
          rate_bps,
          frequency,
          fee_plans (
            name,
            description
          )
        )
      `)
      .eq('deal_id', dealId)
      .eq('status', status)

    if (fromDate) {
      query = query.gte('event_date', fromDate)
    }
    if (toDate) {
      query = query.lte('event_date', toDate)
    }

    const { data: feeEvents, error } = await query
      .order('event_date', { ascending: false })

    if (error) {
      console.error('Error fetching fee events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch fee events' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const totalAmount = feeEvents?.reduce((sum, event) => sum + parseFloat(event.computed_amount || '0'), 0) || 0
    const eventsByType = feeEvents?.reduce((acc, event) => {
      const kind = event.fee_components?.kind || 'unknown'
      acc[kind] = (acc[kind] || 0) + parseFloat(event.computed_amount || '0')
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      fee_events: feeEvents || [],
      summary: {
        total_amount: totalAmount,
        events_count: feeEvents?.length || 0,
        by_type: eventsByType
      }
    })

  } catch (error) {
    console.error('Fee events GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}