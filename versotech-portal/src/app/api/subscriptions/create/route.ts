import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await requireStaffAuth()
    const supabase = await createClient()

    const body = await request.json()
    const {
      investor_id,
      vehicle_id,
      commitment,
      currency,
      status,
      effective_date,
      funding_due_at,
      units,
      acknowledgement_notes,
    } = body

    // Validate required fields
    if (!investor_id || !vehicle_id || !commitment) {
      return NextResponse.json(
        { error: 'investor_id, vehicle_id, and commitment are required' },
        { status: 400 }
      )
    }

    // Get the next subscription number for this investor-vehicle combination
    const { data: existingSubs, error: countError } = await supabase
      .from('subscriptions')
      .select('subscription_number')
      .order('subscription_number', { ascending: false })
      .limit(1)

    if (countError) {
      console.error('[Create Subscription] Error counting subscriptions:', countError)
      return NextResponse.json(
        { error: 'Failed to generate subscription number', details: countError.message },
        { status: 500 }
      )
    }

    // Generate next subscription number (globally unique)
    const nextNumber = existingSubs && existingSubs.length > 0
      ? existingSubs[0].subscription_number + 1
      : 100001

    // Create the subscription
    const { data: newSubscription, error: createError } = await supabase
      .from('subscriptions')
      .insert({
        investor_id,
        vehicle_id,
        subscription_number: nextNumber,
        commitment,
        currency: currency || 'USD',
        status: status || 'pending',
        effective_date: effective_date || null,
        funding_due_at: funding_due_at || null,
        units: units || null,
        acknowledgement_notes: acknowledgement_notes || null,
      })
      .select(`
        *,
        investor:investors (
          id,
          legal_name,
          type,
          country
        ),
        vehicle:vehicles (
          id,
          name,
          type,
          currency,
          entity_code
        )
      `)
      .single()

    if (createError) {
      console.error('[Create Subscription] Error creating subscription:', createError)
      return NextResponse.json(
        { error: 'Failed to create subscription', details: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: newSubscription,
    })
  } catch (error) {
    console.error('[Create Subscription] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
