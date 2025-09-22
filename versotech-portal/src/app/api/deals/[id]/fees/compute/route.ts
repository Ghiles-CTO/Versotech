import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    
    // Get the authenticated user from regular client
    const regularSupabase = await createClient()
    const { data: { user }, error: authError } = await regularSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dealId = params.id

    // Check if user is staff
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

    // Get request parameters
    const body = await request.json()
    const asOfDate = body.as_of_date || new Date().toISOString().split('T')[0]

    // Verify deal exists
    const { data: deal } = await supabase
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
    const { data: eventsCreated, error } = await supabase
      .rpc('fn_compute_fee_events', {
        p_deal_id: dealId,
        p_as_of_date: asOfDate
      })

    if (error) {
      console.error('Fee computation error:', error)
      return NextResponse.json(
        { error: 'Failed to compute fee events' },
        { status: 500 }
      )
    }

    // Get the newly created fee events to return details
    const { data: feeEvents } = await supabase
      .from('fee_events')
      .select(`
        *,
        investors:investor_id (
          legal_name
        ),
        fee_components:fee_component_id (
          kind,
          calc_method,
          rate_bps
        )
      `)
      .eq('deal_id', dealId)
      .eq('event_date', asOfDate)
      .eq('status', 'accrued')
      .order('created_at', { ascending: false })

    // Log fee computation
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'COMPUTE_FEES',
      entity: 'fee_events',
      entity_id: dealId,
      metadata: {
        endpoint: `/api/deals/${dealId}/fees/compute`,
        deal_name: deal.name,
        as_of_date: asOfDate,
        events_created: eventsCreated,
        event_ids: feeEvents?.map(fe => fe.id) || []
      }
    })

    return NextResponse.json({
      success: true,
      eventsCreated,
      asOfDate,
      feeEvents: feeEvents || [],
      message: `Successfully computed ${eventsCreated} fee events for ${asOfDate}`
    })

  } catch (error) {
    console.error('API /deals/[id]/fees/compute POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
