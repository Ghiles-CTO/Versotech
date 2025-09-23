import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating reservations
const createReservationSchema = z.object({
  investor_id: z.string().uuid('Invalid investor ID'),
  requested_units: z.number().positive('Requested units must be positive'),
  proposed_unit_price: z.number().positive('Proposed unit price must be positive'),
  hold_minutes: z.number().int().min(1).max(1440).default(30) // 1 min to 24 hours
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = params.id
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validation = createReservationSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { investor_id, requested_units, proposed_unit_price, hold_minutes } = validation.data

    // Verify user has permission to create reservations for this investor
    const { data: investorLink } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('investor_id', investor_id)
      .eq('user_id', user.id)
      .single()

    // Also check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role && ['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)
    
    if (!investorLink && !isStaff) {
      return NextResponse.json(
        { error: 'Not authorized to create reservations for this investor' },
        { status: 403 }
      )
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
        { error: `Deal is not open for reservations. Current status: ${deal.status}` },
        { status: 400 }
      )
    }

    // Call the database function to reserve inventory
    const { data: reservationResult, error: reservationError } = await serviceSupabase
      .rpc('fn_reserve_inventory', {
        p_deal_id: dealId,
        p_investor_id: investor_id,
        p_requested_units: requested_units,
        p_proposed_unit_price: proposed_unit_price,
        p_hold_minutes: hold_minutes
      })

    if (reservationError) {
      console.error('Reservation error:', reservationError)
      return NextResponse.json(
        { error: reservationError.message || 'Failed to create reservation' },
        { status: 400 }
      )
    }

    const reservationId = reservationResult

    // Get the created reservation with details
    const { data: reservation } = await supabase
      .from('reservations')
      .select(`
        *,
        reservation_lot_items (
          lot_id,
          units,
          share_lots (
            unit_cost,
            currency
          )
        )
      `)
      .eq('id', reservationId)
      .single()

    // Log the reservation creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.RESERVATIONS,
      entity_id: reservationId,
      metadata: {
        deal_id: dealId,
        investor_id,
        requested_units: requested_units.toString(),
        proposed_unit_price: proposed_unit_price.toString(),
        hold_minutes
      }
    })

    return NextResponse.json({
      success: true,
      reservation_id: reservationId,
      reservation,
      message: `Successfully reserved ${requested_units} units for ${hold_minutes} minutes`
    })

  } catch (error) {
    console.error('Reservation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get reservations for a deal
export async function GET(
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

    // Get reservations for this deal (RLS will filter appropriately)
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        *,
        investors (
          legal_name
        ),
        reservation_lot_items (
          lot_id,
          units,
          share_lots (
            unit_cost,
            currency,
            source_id,
            share_sources (
              kind,
              counterparty_name
            )
          )
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reservations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reservations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reservations: reservations || []
    })

  } catch (error) {
    console.error('Reservations GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}