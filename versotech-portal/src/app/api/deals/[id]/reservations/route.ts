import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating reservations
const createReservationSchema = z.object({
  investor_id: z.string().uuid('Valid investor ID is required'),
  requested_units: z.number().positive('Requested units must be positive'),
  proposed_unit_price: z.number().positive('Unit price must be positive'),
  hold_minutes: z.number().int().min(5).max(1440).default(30) // 5 minutes to 24 hours
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

    const dealId = params.id

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createReservationSchema.parse(body)

    // Check if user is authorized to create reservations for this investor
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

    // If not staff, check if user is linked to the investor
    if (!profile.role.startsWith('staff_')) {
      const { data: investorLink } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)
        .eq('investor_id', validatedData.investor_id)
        .single()

      if (!investorLink) {
        return NextResponse.json(
          { error: 'Not authorized to create reservations for this investor' },
          { status: 403 }
        )
      }
    }

    // Verify deal exists and is open for reservations
    const { data: deal } = await supabase
      .from('deals')
      .select('id, status, name')
      .eq('id', dealId)
      .single()

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    if (!['open', 'allocation_pending'].includes(deal.status)) {
      return NextResponse.json(
        { error: `Deal is not open for reservations. Status: ${deal.status}` },
        { status: 400 }
      )
    }

    // Call the database function to reserve inventory atomically
    const { data: reservationId, error } = await supabase
      .rpc('fn_reserve_inventory', {
        p_deal_id: dealId,
        p_investor_id: validatedData.investor_id,
        p_requested_units: validatedData.requested_units,
        p_proposed_unit_price: validatedData.proposed_unit_price,
        p_hold_minutes: validatedData.hold_minutes
      })

    if (error) {
      console.error('Reservation creation error:', error)
      
      // Handle specific error cases
      if (error.message.includes('Insufficient inventory')) {
        return NextResponse.json(
          { error: 'Insufficient inventory available for the requested amount' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Deal is not available')) {
        return NextResponse.json(
          { error: 'Deal is not currently accepting reservations' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create reservation' },
        { status: 500 }
      )
    }

    // Fetch the created reservation with details
    const { data: reservation } = await supabase
      .from('reservations')
      .select(`
        *,
        investors:investor_id (
          legal_name
        ),
        reservation_lot_items (
          units,
          share_lots:lot_id (
            unit_cost,
            source_id,
            share_sources:source_id (
              counterparty_name
            )
          )
        )
      `)
      .eq('id', reservationId)
      .single()

    // Log creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'reservations',
      entity_id: reservationId,
      metadata: {
        endpoint: `/api/deals/${dealId}/reservations`,
        deal_name: deal.name,
        investor_id: validatedData.investor_id,
        requested_units: validatedData.requested_units,
        proposed_unit_price: validatedData.proposed_unit_price
      }
    })

    return NextResponse.json(reservation, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/reservations POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const dealId = params.id
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('reservations')
      .select(`
        *,
        investors:investor_id (
          legal_name
        ),
        reservation_lot_items (
          units,
          share_lots:lot_id (
            unit_cost,
            share_sources:source_id (
              counterparty_name
            )
          )
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: reservations, error } = await query

    if (error) {
      console.error('Reservations fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reservations' },
        { status: 500 }
      )
    }

    // Log access
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'reservations',
      entity_id: dealId,
      metadata: {
        endpoint: `/api/deals/${dealId}/reservations`,
        reservation_count: reservations?.length || 0,
        status_filter: status
      }
    })

    return NextResponse.json({
      reservations: reservations || [],
      hasData: (reservations && reservations.length > 0)
    })

  } catch (error) {
    console.error('API /deals/[id]/reservations GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
