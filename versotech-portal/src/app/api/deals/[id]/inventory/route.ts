import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: dealId } = await params
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to this deal
    const { data: dealAccess } = await supabase
      .from('deal_memberships')
      .select('deal_id')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .single()

    if (!dealAccess) {
      return NextResponse.json(
        { error: 'Access denied to this deal' },
        { status: 403 }
      )
    }

    // Get share lots for this deal
    const { data: shareLots, error: lotsError } = await supabase
      .from('share_lots')
      .select('*')
      .eq('deal_id', dealId)
      .order('acquired_at', 'asc')

    if (lotsError) {
      console.error('Share lots fetch error:', lotsError)
      return NextResponse.json(
        { error: 'Failed to fetch inventory' },
        { status: 500 }
      )
    }

    // Get reservations for this deal
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .eq('deal_id', dealId)

    if (reservationsError) {
      console.error('Reservations fetch error:', reservationsError)
      return NextResponse.json(
        { error: 'Failed to fetch reservations' },
        { status: 500 }
      )
    }

    // Get allocations for this deal
    const { data: allocations, error: allocationsError } = await supabase
      .from('allocations')
      .select('*')
      .eq('deal_id', dealId)

    if (allocationsError) {
      console.error('Allocations fetch error:', allocationsError)
      return NextResponse.json(
        { error: 'Failed to fetch allocations' },
        { status: 500 }
      )
    }

    // Calculate inventory summary
    const totalUnits = shareLots?.reduce((sum, lot) => sum + lot.units_total, 0) || 0
    const availableUnits = shareLots?.reduce((sum, lot) => sum + lot.units_remaining, 0) || 0
    const reservedUnits = reservations?.reduce((sum, res) => sum + res.requested_units, 0) || 0
    const allocatedUnits = allocations?.reduce((sum, alloc) => sum + alloc.units, 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        deal_id: dealId,
        share_lots: shareLots || [],
        reservations: reservations || [],
        allocations: allocations || [],
        summary: {
          total_units: totalUnits,
          available_units: availableUnits,
          reserved_units: reservedUnits,
          allocated_units: allocatedUnits
        }
      }
    })

  } catch (error) {
    console.error('Deal inventory API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}