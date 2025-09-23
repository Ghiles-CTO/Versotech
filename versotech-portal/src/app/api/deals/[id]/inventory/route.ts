import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Get current inventory summary using the database function
    const { data: inventorySummary, error } = await supabase
      .rpc('fn_deal_inventory_summary', { p_deal_id: dealId })
      .single()

    if (error) {
      console.error('Inventory fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch inventory data' },
        { status: 500 }
      )
    }

    // Format response to match component expectations
    const inventoryData = {
      units_available: inventorySummary?.units_available || 0,
      active_reservations: inventorySummary?.active_reservations || 0,
      utilization_percent: inventorySummary?.utilization_percent || '0',
      total_units: inventorySummary?.total_units || 0,
      last_updated: new Date().toISOString()
    }

    return NextResponse.json(inventoryData)

  } catch (error) {
    console.error('API /deals/[id]/inventory error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}