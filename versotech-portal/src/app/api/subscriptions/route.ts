import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { calculateSubscriptionFeeEvents, createFeeEvents } from '@/lib/fees/subscription-fee-calculator'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireStaffAuth()
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicle')
    const investorId = searchParams.get('investor_id')
    const status = searchParams.get('status')
    const search = searchParams.get('q')
    // Default to fetching ALL subscriptions (no pagination by default)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null
    const page = limit ? parseInt(searchParams.get('page') || '1') : null
    const offset = limit && page ? (page - 1) * limit : null

    // Build query
    let query = supabase
      .from('subscriptions')
      .select(
        `
          *,
          investor:investors (
            id,
            legal_name,
            type,
            country,
            kyc_status
          ),
          vehicle:vehicles (
            id,
            name,
            type,
            currency,
            status,
            entity_code
          )
        `,
        { count: 'exact' }
      )
      .order('subscription_number', { ascending: false })

    // Apply filters
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }

    if (investorId) {
      query = query.eq('investor_id', investorId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      // Search by subscription number or investor name
      const searchNum = parseInt(search)
      if (!isNaN(searchNum)) {
        query = query.eq('subscription_number', searchNum)
      } else {
        // This requires a join query - we'll handle it differently
        query = query.or(`investor.legal_name.ilike.%${search}%`)
      }
    }

    // Apply pagination only if limit is specified
    if (offset !== null && limit !== null) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data: subscriptions, error, count } = await query

    if (error) {
      console.error('[Subscriptions API] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions', details: error.message },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const allSubscriptionsQuery = await supabase
      .from('subscriptions')
      .select('status, commitment, currency, funding_due_at')

    const allSubs = allSubscriptionsQuery.data || []

    const summary = {
      total: count || 0,
      by_status: allSubs.reduce((acc, sub) => {
        acc[sub.status] = (acc[sub.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      by_currency: allSubs.reduce((acc, sub) => {
        acc[sub.currency || 'USD'] = (acc[sub.currency || 'USD'] || 0) + (sub.commitment || 0)
        return acc
      }, {} as Record<string, number>),
      total_commitment: allSubs.reduce((sum, sub) => sum + (sub.commitment || 0), 0),
      overdue_count: allSubs.filter(
        (sub) =>
          sub.status === 'committed' &&
          sub.funding_due_at &&
          new Date(sub.funding_due_at) < new Date()
      ).length,
      overdue_amount: allSubs
        .filter(
          (sub) =>
            sub.status === 'committed' &&
            sub.funding_due_at &&
            new Date(sub.funding_due_at) < new Date()
        )
        .reduce((sum, sub) => sum + (sub.commitment || 0), 0),
    }

    return NextResponse.json({
      data: subscriptions || [],
      subscriptions: subscriptions || [],
      summary,
      pagination: limit ? {
        page: page || 1,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      } : null,
    })
  } catch (error) {
    console.error('[Subscriptions API] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Bulk update endpoint
export async function PATCH(request: NextRequest) {
  try {
    await requireStaffAuth()
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const body = await request.json()
    const { subscription_ids, updates } = body

    if (!subscription_ids || !Array.isArray(subscription_ids) || subscription_ids.length === 0) {
      return NextResponse.json(
        { error: 'subscription_ids array is required' },
        { status: 400 }
      )
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'updates object is required' },
        { status: 400 }
      )
    }

    // Validate allowed fields
    const allowedFields = ['status', 'effective_date', 'funding_due_at', 'acknowledgement_notes']
    const updateFields = Object.keys(updates)
    const invalidFields = updateFields.filter((field) => !allowedFields.includes(field))

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      )
    }

    // If status is being changed to 'committed', fetch subscriptions to check old status
    let subsToAutoCalculateFees: string[] = []
    if (updates.status === 'committed') {
      const { data: existingSubs } = await serviceSupabase
        .from('subscriptions')
        .select('id, status')
        .in('id', subscription_ids)

      // Only auto-calculate fees for subscriptions that are NOT already committed
      subsToAutoCalculateFees = (existingSubs || [])
        .filter((sub) => sub.status !== 'committed')
        .map((sub) => sub.id)
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', subscription_ids)

    if (error) {
      console.error('[Subscriptions API] Bulk update error:', error)
      return NextResponse.json(
        { error: 'Failed to update subscriptions', details: error.message },
        { status: 500 }
      )
    }

    // AUTO-CALCULATE FEE EVENTS for subscriptions that became 'committed'
    let feeEventsCreatedCount = 0
    if (subsToAutoCalculateFees.length > 0) {
      console.log(`[Subscriptions API] Auto-calculating fee events for ${subsToAutoCalculateFees.length} subscription(s)`)

      for (const subId of subsToAutoCalculateFees) {
        // Check if fee events already exist
        const { data: existingFeeEvents } = await serviceSupabase
          .from('fee_events')
          .select('id')
          .eq('allocation_id', subId)
          .limit(1)

        if (!existingFeeEvents || existingFeeEvents.length === 0) {
          // Get subscription details
          const { data: sub } = await serviceSupabase
            .from('subscriptions')
            .select('investor_id, vehicle_id, fee_plan_id')
            .eq('id', subId)
            .single()

          if (sub) {
            // Calculate fee events
            const calculationResult = await calculateSubscriptionFeeEvents(serviceSupabase, subId)

            if (calculationResult.success && calculationResult.feeEvents && calculationResult.feeEvents.length > 0) {
              // Create fee events (subscriptions don't have deal_id)
              const creationResult = await createFeeEvents(
                serviceSupabase,
                subId,
                sub.investor_id,
                null, // subscriptions are linked to vehicles, not deals
                sub.fee_plan_id || null,
                calculationResult.feeEvents
              )

              if (creationResult.success) {
                feeEventsCreatedCount++
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${subscription_ids.length} subscription(s)`,
      updated_count: subscription_ids.length,
      fee_events_created_for: feeEventsCreatedCount,
    })
  } catch (error) {
    console.error('[Subscriptions API] PATCH exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export subscriptions
export async function POST(request: NextRequest) {
  try {
    await requireStaffAuth()
    const supabase = await createClient()

    const body = await request.json()
    const { subscription_ids, format = 'csv' } = body

    let query = supabase
      .from('subscriptions')
      .select(
        `
          *,
          investor:investors (
            legal_name,
            type,
            country
          ),
          vehicle:vehicles (
            name,
            type,
            currency
          )
        `
      )
      .order('subscription_number', { ascending: true })

    if (subscription_ids && Array.isArray(subscription_ids) && subscription_ids.length > 0) {
      query = query.in('id', subscription_ids)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions for export' },
        { status: 500 }
      )
    }

    // For now, return JSON - CSV formatting can be added later
    return NextResponse.json({
      data,
      count: data?.length || 0,
      format,
    })
  } catch (error) {
    console.error('[Subscriptions API] Export exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
