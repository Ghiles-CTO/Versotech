/**
 * Investor Sell Request API
 * POST /api/investor/sell-request - Create sell request
 * GET /api/investor/sell-request - Get investor's sell requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { auditLogger, AuditActions } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const sellRequestSchema = z.object({
  subscription_id: z.string().uuid(),
  amount_to_sell: z.number().positive(),
  asking_price_per_unit: z.number().positive().optional(),
  notes: z.string().max(1000).optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor_id for this user
    const { data: investorUser } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .single()

    if (!investorUser) {
      return NextResponse.json({ error: 'Not an investor' }, { status: 403 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    const validation = sellRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 })
    }

    const { subscription_id, amount_to_sell, asking_price_per_unit, notes } = validation.data

    // Verify subscription belongs to investor and is active
    const { data: subscription, error: subError } = await serviceSupabase
      .from('subscriptions')
      .select(`
        id,
        deal_id,
        vehicle_id,
        commitment,
        funded_amount,
        status,
        investor_id,
        vehicle:vehicles(name)
      `)
      .eq('id', subscription_id)
      .eq('investor_id', investorUser.investor_id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({
        error: 'Subscription not found or does not belong to you'
      }, { status: 404 })
    }

    if (subscription.status !== 'active') {
      return NextResponse.json({
        error: 'Only active subscriptions can be sold',
        current_status: subscription.status
      }, { status: 400 })
    }

    // Validate amount doesn't exceed funded amount
    const fundedAmount = Number(subscription.funded_amount) || 0
    if (amount_to_sell > fundedAmount) {
      return NextResponse.json({
        error: `Amount to sell (${amount_to_sell}) exceeds funded amount (${fundedAmount})`
      }, { status: 400 })
    }

    // Check for existing pending request for this subscription
    const { data: existing } = await serviceSupabase
      .from('investor_sale_requests')
      .select('id, status')
      .eq('subscription_id', subscription_id)
      .in('status', ['pending', 'approved', 'matched', 'in_progress'])
      .single()

    if (existing) {
      return NextResponse.json({
        error: 'You already have a pending sale request for this position',
        existing_request_id: existing.id,
        existing_status: existing.status
      }, { status: 400 })
    }

    // Create sell request
    const { data: sellRequest, error: insertError } = await serviceSupabase
      .from('investor_sale_requests')
      .insert({
        investor_id: investorUser.investor_id,
        subscription_id: subscription_id,
        deal_id: subscription.deal_id,
        vehicle_id: subscription.vehicle_id,
        amount_to_sell,
        asking_price_per_unit: asking_price_per_unit || null,
        notes: notes || null,
        created_by: user.id,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create sell request:', insertError)
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
    }

    // Create approval for CEO
    const vehicleName = (subscription.vehicle as { name?: string })?.name || 'vehicle'
    const { error: approvalError } = await serviceSupabase.from('approvals').insert({
      entity_type: 'sale_request',
      entity_id: sellRequest.id,
      action: 'approve',
      requested_by: user.id,
      related_investor_id: investorUser.investor_id,
      related_deal_id: subscription.deal_id,
      status: 'pending',
      priority: 'medium',
      request_reason: `Investor wants to sell ${amount_to_sell.toLocaleString()} from their position in ${vehicleName}`,
      entity_metadata: {
        subscription_id,
        amount_to_sell,
        asking_price_per_unit: asking_price_per_unit || null,
        vehicle_name: vehicleName,
        vehicle_id: subscription.vehicle_id,
        notes: notes || null
      }
    })
    if (approvalError) {
      console.error('Failed to create sale request approval:', approvalError)
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'investor_sale_requests' as any,
      entity_id: sellRequest.id,
      metadata: {
        subscription_id,
        amount_to_sell,
        asking_price_per_unit,
        vehicle_id: subscription.vehicle_id,
        deal_id: subscription.deal_id
      }
    })

    return NextResponse.json({
      success: true,
      data: sellRequest,
      message: 'Sale request submitted successfully. You will be notified when there is an update.'
    }, { status: 201 })

  } catch (error) {
    console.error('Sell request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor_id for this user
    const { data: investorUser } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .single()

    if (!investorUser) {
      return NextResponse.json({ error: 'Not an investor' }, { status: 403 })
    }

    // Get all sale requests for this investor
    const { data: requests, error: fetchError } = await serviceSupabase
      .from('investor_sale_requests')
      .select(`
        *,
        subscription:subscriptions(
          id,
          commitment,
          funded_amount,
          currency,
          vehicle:vehicles(id, name, type)
        ),
        deal:deals(id, name)
      `)
      .eq('investor_id', investorUser.investor_id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Failed to fetch sell requests:', fetchError)
      return NextResponse.json({ error: 'Failed to load requests' }, { status: 500 })
    }

    return NextResponse.json({ data: requests || [] })

  } catch (error) {
    console.error('Get sell requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
