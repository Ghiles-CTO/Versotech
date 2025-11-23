/**
 * Calculate Fee Events from Subscription
 * POST /api/staff/fees/events/calculate
 *
 * Triggered when subscription status changes to 'committed'
 * Calculates and creates fee events based on subscription amounts and fee plan frequency
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  calculateSubscriptionFeeEvents,
  createFeeEvents,
} from '@/lib/fees/subscription-fee-calculator';

const calculateFeeEventsSchema = z.object({
  subscription_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request
    const body = await request.json();
    const validation = calculateFeeEventsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues,
      }, { status: 400 });
    }

    const { subscription_id } = validation.data;

    // Fetch subscription details
    const { data: subscription, error: subError } = await serviceSupabase
      .from('subscriptions')
      .select(`
        *,
        investor:investors (
          id,
          legal_name
        ),
        deal:deals (
          id,
          name
        )
      `)
      .eq('id', subscription_id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({
        error: 'Subscription not found',
        details: subError?.message,
      }, { status: 404 });
    }

    // Verify subscription is in 'committed' status
    if (subscription.status !== 'committed') {
      return NextResponse.json({
        error: 'Invalid subscription status',
        details: `Subscription must be in 'committed' status. Current status: ${subscription.status}`,
      }, { status: 400 });
    }

    // Check if fee events already exist for this subscription
    const { data: existingEvents, error: eventsCheckError } = await serviceSupabase
      .from('fee_events')
      .select('id')
      .eq('allocation_id', subscription_id)
      .limit(1);

    if (eventsCheckError) {
      console.error('Error checking existing fee events:', eventsCheckError);
      return NextResponse.json({
        error: 'Failed to check existing fee events',
        details: eventsCheckError.message,
      }, { status: 500 });
    }

    if (existingEvents && existingEvents.length > 0) {
      return NextResponse.json({
        warning: 'Fee events already exist for this subscription',
        subscription_id,
        existing_events_count: existingEvents.length,
      }, { status: 200 });
    }

    // Calculate fee events
    const calculationResult = await calculateSubscriptionFeeEvents(
      serviceSupabase,
      subscription_id
    );

    if (!calculationResult.success || !calculationResult.feeEvents) {
      return NextResponse.json({
        error: 'Failed to calculate fee events',
        details: calculationResult.error,
      }, { status: 500 });
    }

    const { feeEvents } = calculationResult;

    if (feeEvents.length === 0) {
      return NextResponse.json({
        message: 'No fee events to create (subscription has no fees configured)',
        subscription_id,
      }, { status: 200 });
    }

    // Create fee events in database
    const creationResult = await createFeeEvents(
      serviceSupabase,
      subscription_id,
      subscription.investor_id,
      subscription.deal_id || null,
      subscription.fee_plan_id || null,
      feeEvents
    );

    if (!creationResult.success || !creationResult.feeEventIds) {
      return NextResponse.json({
        error: 'Failed to create fee events',
        details: creationResult.error,
      }, { status: 500 });
    }

    console.log(`Created ${creationResult.feeEventIds.length} fee events for subscription ${subscription_id}`);

    return NextResponse.json({
      success: true,
      message: `Created ${creationResult.feeEventIds.length} fee events`,
      data: {
        subscription_id,
        investor_id: subscription.investor_id,
        investor_name: (subscription as any).investor?.legal_name,
        deal_id: subscription.deal_id,
        deal_name: (subscription as any).deal?.name,
        fee_event_ids: creationResult.feeEventIds,
        fee_events_summary: feeEvents.map(fe => ({
          type: fe.fee_type,
          amount: fe.computed_amount,
          frequency: fe.frequency,
          payment_schedule: fe.payment_schedule,
        })),
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/staff/fees/events/calculate:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
