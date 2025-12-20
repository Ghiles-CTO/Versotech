/**
 * Cron Job: Generate Scheduled Fee Events
 * Runs daily to generate recurring management fees based on fee_schedules
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'

async function handleCronRequest(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {

    const supabase = createServiceClient();
    const today = new Date().toISOString().split('T')[0];

    // Find all active schedules due today or earlier
    const { data: dueSchedules, error: schedError } = await supabase
      .from('fee_schedules')
      .select(`
        *,
        fee_component:fee_components(*),
        investor:investors(id, email),
        allocation:subscriptions(commitment, funded_amount)
      `)
      .eq('status', 'active')
      .lte('next_due_date', today);

    if (schedError) {
      console.error('Error fetching due schedules:', schedError);
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }

    if (!dueSchedules || dueSchedules.length === 0) {
      return NextResponse.json({
        message: 'No fees due today',
        processed: 0,
      });
    }

    const results = {
      processed: 0,
      errors: 0,
      feeEvents: [] as string[],
    };

    // Process each schedule
    for (const schedule of dueSchedules) {
      try {
        const allocation = schedule.allocation as any;
        const feeComponent = schedule.fee_component as any;

        // Calculate fee amount
        const baseAmount = allocation?.commitment || allocation?.funded_amount || 0;
        const rateBps = feeComponent?.rate_bps || 0;
        const computedAmount = (baseAmount * rateBps) / 10000;

        // Create fee event
        const { data: feeEvent, error: eventError } = await supabase
          .from('fee_events')
          .insert({
            deal_id: schedule.deal_id,
            investor_id: schedule.investor_id,
            allocation_id: schedule.allocation_id,
            fee_component_id: schedule.fee_component_id,
            fee_type: feeComponent.kind,
            event_date: today,
            period_start_date: schedule.next_due_date,
            base_amount: baseAmount,
            computed_amount: computedAmount,
            rate_bps: rateBps,
            currency: 'USD',
            status: 'accrued',
          })
          .select('id')
          .single();

        if (eventError) {
          console.error(`Error creating fee event for schedule ${schedule.id}:`, eventError);
          results.errors++;
          continue;
        }

        results.feeEvents.push(feeEvent.id);

        // Calculate next due date
        const currentDue = new Date(schedule.next_due_date!);
        const nextDue = new Date(currentDue);

        // Increment based on frequency
        switch (feeComponent.frequency) {
          case 'annual':
            nextDue.setFullYear(nextDue.getFullYear() + 1);
            break;
          case 'quarterly':
            nextDue.setMonth(nextDue.getMonth() + 3);
            break;
          case 'monthly':
            nextDue.setMonth(nextDue.getMonth() + 1);
            break;
        }

        const completedPeriods = schedule.completed_periods + 1;
        const isComplete = completedPeriods >= schedule.total_periods;

        // Update schedule
        await supabase
          .from('fee_schedules')
          .update({
            completed_periods: completedPeriods,
            next_due_date: isComplete ? null : nextDue.toISOString().split('T')[0],
            status: isComplete ? 'completed' : 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', schedule.id);

        // TODO: Auto-create invoice if enabled
        // TODO: Create reminder task

        results.processed++;
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      message: 'Scheduled fees processed',
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in generate-scheduled cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Vercel cron uses GET requests
export async function GET(request: NextRequest) {
  return handleCronRequest(request)
}

export async function POST(request: NextRequest) {
  return handleCronRequest(request)
}
