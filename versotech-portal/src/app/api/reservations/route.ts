import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating reservations
const createReservationSchema = z.object({
  deal_id: z.string().uuid(),
  investor_id: z.string().uuid(),
  requested_units: z.number().positive(),
  proposed_unit_price: z.number().positive(),
  notes: z.string().optional(),
  hold_minutes: z.number().min(5).max(120).default(30)
})

export async function POST(request: NextRequest) {
  try {
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

    // Validate request body
    const body = await request.json()
    const validatedData = createReservationSchema.parse(body)

    // Verify user has access to this investor
    const { data: investorAccess } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .eq('investor_id', validatedData.investor_id)
      .single()

    if (!investorAccess) {
      return NextResponse.json(
        { error: 'Access denied to this investor profile' },
        { status: 403 }
      )
    }

    // Verify user has access to this deal
    const { data: dealAccess } = await supabase
      .from('deal_memberships')
      .select('deal_id')
      .eq('deal_id', validatedData.deal_id)
      .eq('user_id', user.id)
      .single()

    if (!dealAccess) {
      return NextResponse.json(
        { error: 'Access denied to this deal' },
        { status: 403 }
      )
    }

    // Use service client to create reservation (bypasses RLS)
    const expiresAt = new Date(Date.now() + validatedData.hold_minutes * 60 * 1000)
    
    const { data: reservation, error: reservationError } = await serviceSupabase
      .from('reservations')
      .insert({
        deal_id: validatedData.deal_id,
        investor_id: validatedData.investor_id,
        requested_units: validatedData.requested_units,
        proposed_unit_price: validatedData.proposed_unit_price,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        created_by: user.id
      })
      .select()
      .single()

    if (reservationError) {
      console.error('Reservation creation error:', reservationError)
      return NextResponse.json(
        { error: 'Failed to create reservation', details: reservationError.message },
        { status: 500 }
      )
    }

    // TODO: Implement inventory allocation logic here
    // This would call the fn_reserve_inventory function mentioned in the PRD
    // For now, we'll just create the reservation record

    return NextResponse.json({
      success: true,
      data: reservation
    })

  } catch (error) {
    console.error('Reservation API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Get investor IDs for this user
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json(
        { error: 'No investor profile found' },
        { status: 404 }
      )
    }

    const investorIds = investorLinks.map(link => link.investor_id)
    const dealId = searchParams.get('deal_id')

    let query = supabase
      .from('reservations')
      .select(`
        *,
        deals (
          id,
          name,
          status
        )
      `)
      .in('investor_id', investorIds)
      .order('created_at', { ascending: false })

    if (dealId) {
      query = query.eq('deal_id', dealId)
    }

    const { data: reservations, error } = await query

    if (error) {
      console.error('Reservations fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reservations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: reservations
    })

  } catch (error) {
    console.error('Reservations GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
