import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { calculateSubscriptionFeeEvents, createFeeEvents } from '@/lib/fees/subscription-fee-calculator'

const updateSubscriptionSchema = z.object({
  commitment: z.number().positive('Commitment must be positive').optional(),
  currency: z.string().length(3, 'Currency must be 3 letters').toUpperCase().optional(),
  status: z.enum(['pending', 'committed', 'active', 'closed', 'cancelled']).optional(),
  effective_date: z.string().optional().nullable(),
  funding_due_at: z.string().optional().nullable(),
  acknowledgement_notes: z.string().optional().nullable()
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ investorId: string; subscriptionId: string }> }
) {
  const { investorId, subscriptionId } = await params

  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await isStaffUser(authClient, user)
    if (!staff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const supabase = createServiceClient()

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(
        `
          *,
          vehicle:vehicles (
            id,
            name,
            type,
            currency
          ),
          investor:investors (
            id,
            legal_name,
            display_name
          )
        `
      )
      .eq('id', subscriptionId)
      .eq('investor_id', investorId)
      .single()

    if (error || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('[Subscription GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ investorId: string; subscriptionId: string }> }
) {
  const { investorId, subscriptionId } = await params

  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await isStaffUser(authClient, user)
    if (!staff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const updates = updateSubscriptionSchema.parse(body)

    const supabase = createServiceClient()

    // Verify subscription exists and belongs to investor
    const { data: existing, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, subscription_number, vehicle_id, investor_id, status')
      .eq('id', subscriptionId)
      .eq('investor_id', investorId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Update subscription (immutable: investor_id, vehicle_id, subscription_number)
    const { data: updated, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        commitment: updates.commitment,
        currency: updates.currency,
        status: updates.status,
        effective_date: updates.effective_date,
        funding_due_at: updates.funding_due_at,
        acknowledgement_notes: updates.acknowledgement_notes
      })
      .eq('id', subscriptionId)
      .select(
        `
          *,
          vehicle:vehicles (
            id,
            name
          ),
          investor:investors (
            id,
            legal_name
          )
        `
      )
      .single()

    if (updateError || !updated) {
      console.error('[Subscription PATCH] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    // Update entity_investor allocation_status if status changed
    if (updates.status) {
      await supabase
        .from('entity_investors')
        .update({ allocation_status: updates.status })
        .eq('vehicle_id', existing.vehicle_id)
        .eq('investor_id', existing.investor_id)
    }

    // AUTO-CALCULATE FEE EVENTS when subscription becomes 'committed'
    let feeEventsCreated = false
    if (updates.status === 'committed' && existing.status !== 'committed') {
      console.log(`[Subscription PATCH] Auto-calculating fee events for subscription ${subscriptionId}`)

      // Check if fee events already exist
      const { data: existingFeeEvents } = await supabase
        .from('fee_events')
        .select('id')
        .eq('allocation_id', subscriptionId)
        .limit(1)

      if (!existingFeeEvents || existingFeeEvents.length === 0) {
        // Calculate fee events from subscription
        const calculationResult = await calculateSubscriptionFeeEvents(supabase, subscriptionId)

        if (calculationResult.success && calculationResult.feeEvents && calculationResult.feeEvents.length > 0) {
          // Create fee events in database
          const creationResult = await createFeeEvents(
            supabase,
            subscriptionId,
            existing.investor_id,
            null, // subscriptions don't have deal_id, only vehicle_id
            calculationResult.feeEvents
          )

          if (creationResult.success) {
            feeEventsCreated = true
            console.log(`[Subscription PATCH] Created ${creationResult.feeEventIds?.length || 0} fee events`)
          } else {
            console.error('[Subscription PATCH] Failed to create fee events:', creationResult.error)
          }
        }
      } else {
        console.log(`[Subscription PATCH] Fee events already exist for subscription ${subscriptionId}`)
      }
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.SUBSCRIPTIONS,
      entity_id: subscriptionId,
      metadata: {
        updates,
        subscription_number: existing.subscription_number,
        fee_events_created: feeEventsCreated
      }
    })

    return NextResponse.json({
      subscription: updated,
      message: `Updated subscription #${existing.subscription_number}`,
      fee_events_created: feeEventsCreated
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error('[Subscription PATCH] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ investorId: string; subscriptionId: string }> }
) {
  const { investorId, subscriptionId } = await params

  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await isStaffUser(authClient, user)
    if (!staff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const supabase = createServiceClient()

    // Verify subscription exists and belongs to investor
    const { data: existing, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, subscription_number, vehicle_id, investor_id, status')
      .eq('id', subscriptionId)
      .eq('investor_id', investorId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (existing.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 400 }
      )
    }

    // Soft delete: set status to cancelled (do NOT delete record)
    const { data: cancelled, error: cancelError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled'
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (cancelError || !cancelled) {
      console.error('[Subscription DELETE] Cancel error:', cancelError)
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      )
    }

    // Update entity_investor allocation_status
    await supabase
      .from('entity_investors')
      .update({ allocation_status: 'cancelled' })
      .eq('vehicle_id', existing.vehicle_id)
      .eq('investor_id', existing.investor_id)

    // Cancel related holdings
    const { data: deals } = await supabase
      .from('deals')
      .select('id')
      .eq('vehicle_id', existing.vehicle_id)

    if (deals && deals.length > 0) {
      const dealIds = deals.map((d) => d.id)
      await supabase
        .from('investor_deal_holdings')
        .update({ status: 'cancelled' })
        .eq('investor_id', existing.investor_id)
        .in('deal_id', dealIds)
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.SUBSCRIPTIONS,
      entity_id: subscriptionId,
      metadata: {
        subscription_number: existing.subscription_number,
        vehicle_id: existing.vehicle_id,
        action: 'cancelled'
      }
    })

    return NextResponse.json({
      message: `Cancelled subscription #${existing.subscription_number}`,
      subscription: cancelled
    })
  } catch (error) {
    console.error('[Subscription DELETE] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
