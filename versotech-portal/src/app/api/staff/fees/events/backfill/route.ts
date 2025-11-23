/**
 * Backfill Fee Events for Existing Committed Subscriptions
 * POST /api/staff/fees/events/backfill
 *
 * One-time migration to create fee events for subscriptions
 * that were committed before auto-calculation was implemented
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  calculateSubscriptionFeeEvents,
  createFeeEvents,
} from '@/lib/fees/subscription-fee-calculator';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

    // Auth check - only staff admins can run migrations
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is staff admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'staff_admin') {
      return NextResponse.json({ error: 'Staff admin access required' }, { status: 403 });
    }

    console.log('[Fee Events Backfill] Starting migration...');

    // Get all committed subscriptions created after 2025-10-30
    // This excludes the 610 historical subscriptions that are already "done and finished"
    const { data: subscriptions, error: subsError } = await serviceSupabase
      .from('subscriptions')
      .select('id, subscription_number, investor_id, vehicle_id, fee_plan_id, created_at')
      .eq('status', 'committed')
      .gte('created_at', '2025-10-31T00:00:00Z');

    if (subsError) {
      console.error('[Fee Events Backfill] Error fetching subscriptions:', subsError);
      return NextResponse.json({
        error: 'Failed to fetch subscriptions',
        details: subsError.message,
      }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        message: 'No committed subscriptions found',
        processed: 0,
      });
    }

    console.log(`[Fee Events Backfill] Found ${subscriptions.length} committed subscriptions`);

    const results = {
      total: subscriptions.length,
      processed: 0,
      skipped: 0,
      failed: 0,
      created_events: 0,
      errors: [] as Array<{ subscription_id: string; error: string }>,
    };

    // Process each subscription
    for (const sub of subscriptions) {
      try {
        // Check if fee events already exist
        const { data: existingEvents } = await serviceSupabase
          .from('fee_events')
          .select('id')
          .eq('allocation_id', sub.id)
          .limit(1);

        if (existingEvents && existingEvents.length > 0) {
          console.log(`[Fee Events Backfill] Skipping subscription ${sub.subscription_number} - fee events already exist`);
          results.skipped++;
          continue;
        }

        // Calculate fee events
        const calculationResult = await calculateSubscriptionFeeEvents(serviceSupabase, sub.id);

        if (!calculationResult.success) {
          console.error(`[Fee Events Backfill] Failed to calculate for subscription ${sub.subscription_number}:`, calculationResult.error);
          results.failed++;
          results.errors.push({
            subscription_id: sub.id,
            error: calculationResult.error || 'Unknown error',
          });
          continue;
        }

        if (!calculationResult.feeEvents || calculationResult.feeEvents.length === 0) {
          console.log(`[Fee Events Backfill] No fee events for subscription ${sub.subscription_number} - no fees configured`);
          results.skipped++;
          continue;
        }

        // Create fee events (subscriptions don't have deal_id, only vehicle_id)
        const creationResult = await createFeeEvents(
          serviceSupabase,
          sub.id,
          sub.investor_id,
          null, // deal_id - subscriptions are linked to vehicles, not deals
          sub.fee_plan_id || null,
          calculationResult.feeEvents
        );

        if (!creationResult.success) {
          console.error(`[Fee Events Backfill] Failed to create events for subscription ${sub.subscription_number}:`, creationResult.error);
          results.failed++;
          results.errors.push({
            subscription_id: sub.id,
            error: creationResult.error || 'Unknown error',
          });
          continue;
        }

        results.processed++;
        results.created_events += creationResult.feeEventIds?.length || 0;
        console.log(`[Fee Events Backfill] Created ${creationResult.feeEventIds?.length || 0} fee events for subscription ${sub.subscription_number}`);

      } catch (error) {
        console.error(`[Fee Events Backfill] Exception processing subscription ${sub.subscription_number}:`, error);
        results.failed++;
        results.errors.push({
          subscription_id: sub.id,
          error: error instanceof Error ? error.message : 'Unknown exception',
        });
      }
    }

    console.log('[Fee Events Backfill] Migration complete:', results);

    return NextResponse.json({
      success: true,
      message: 'Fee events backfill completed',
      results,
    }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/staff/fees/events/backfill:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
