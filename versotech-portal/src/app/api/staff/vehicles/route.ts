import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Get vehicles list for staff dropdowns with optional investor filter
 * API Route: /api/staff/vehicles?investor_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user (handles both real auth and demo mode)
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const userRole = user.user_metadata?.role || user.role
    if (!['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized - Staff access required' }, { status: 403 })
    }

    // Use service client to bypass RLS since we've already verified staff access
    const serviceClient = createServiceClient()

    // Get optional investor_id filter
    const { searchParams } = new URL(request.url)
    const investorId = searchParams.get('investor_id')

    // Build query
    let query = serviceClient
      .from('vehicles')
      .select('id, name, type, domicile, currency')
      .order('name', { ascending: true })

    // If investor_id provided, filter to vehicles where investor has positions
    if (investorId) {
      // Get vehicles where the investor has active positions
      const { data: positions } = await serviceClient
        .from('positions')
        .select('vehicle_id')
        .eq('investor_id', investorId)

      if (positions && positions.length > 0) {
        const vehicleIds = positions.map(p => p.vehicle_id).filter(Boolean)
        if (vehicleIds.length > 0) {
          query = query.in('id', vehicleIds)
        }
      } else {
        // If no positions found, return all vehicles (staff can see all)
        // Don't return empty array
      }
    }

    const { data: vehicles, error } = await query

    if (error) {
      console.error('Error fetching vehicles:', error)
      return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
    }

    return NextResponse.json({
      vehicles: vehicles || []
    })

  } catch (error) {
    console.error('Vehicles API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

