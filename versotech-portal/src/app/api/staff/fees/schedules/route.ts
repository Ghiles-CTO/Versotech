/**
 * Fee Schedules API Routes
 * Calculates upcoming recurring fees from subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createFeeScheduleSchema } from '@/lib/fees/validation';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceSupabase = createServiceClient();
    const daysAhead = parseInt(request.nextUrl.searchParams.get('days') || '60');

    // Calculate date range
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    // Fetch all committed subscriptions with recurring fees
    const { data: subscriptions, error: subsError } = await serviceSupabase
      .from('subscriptions')
      .select(`
        id,
        subscription_number,
        commitment,
        effective_date,
        created_at,
        subscription_fee_percent,
        subscription_fee_amount,
        management_fee_percent,
        management_fee_amount,
        management_fee_frequency,
        investor:investors(id, legal_name, display_name),
        vehicle:vehicles(id, name),
        fee_plan:fee_plans(
          id,
          components:fee_components(kind, frequency, payment_schedule)
        )
      `)
      .eq('status', 'committed');

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    // Calculate upcoming fees
    const upcomingFees: any[] = [];

    for (const sub of (subscriptions as any[]) || []) {
      const startDate = sub.effective_date ? new Date(sub.effective_date) : new Date(sub.created_at);

      // Helper to calculate next due date based on frequency
      const calculateNextDueDate = (frequency: string, lastPayment: Date = startDate): Date | null => {
        const next = new Date(lastPayment);

        switch (frequency) {
          case 'monthly':
            next.setMonth(next.getMonth() + 1);
            break;
          case 'quarterly':
            next.setMonth(next.getMonth() + 3);
            break;
          case 'annual':
            next.setFullYear(next.getFullYear() + 1);
            break;
          default:
            return null;
        }

        return next;
      };

      // Check management fee
      if (sub.management_fee_percent || sub.management_fee_amount) {
        const frequency = sub.management_fee_frequency || 'annual';
        const amount = sub.management_fee_amount || (sub.commitment * (sub.management_fee_percent / 100));

        let nextDue = calculateNextDueDate(frequency, startDate);

        // If the calculated date is in the past, keep adding periods until we get a future date
        while (nextDue && nextDue < today) {
          nextDue = calculateNextDueDate(frequency, nextDue);
        }

        // If next due date is within our range, add to upcoming fees
        if (nextDue && nextDue <= futureDate) {
          upcomingFees.push({
            id: `${sub.id}-management`,
            subscription_id: sub.id,
            subscription_number: sub.subscription_number,
            investor: sub.investor,
            vehicle: sub.vehicle,
            fee_type: 'management',
            fee_name: 'Management Fee',
            amount,
            frequency,
            next_due_date: nextDue.toISOString().split('T')[0],
            status: 'scheduled',
          });
        }
      }

      // Check subscription fee (if recurring)
      if (sub.subscription_fee_percent || sub.subscription_fee_amount) {
        // Check if fee plan has recurring subscription fee
        const hasRecurringSubscriptionFee = sub.fee_plan?.components?.some(
          (c: any) => c.kind === 'subscription' && c.frequency !== 'one_time'
        );

        if (hasRecurringSubscriptionFee) {
          const component = sub.fee_plan.components.find((c: any) => c.kind === 'subscription');
          const frequency = component.frequency;
          const amount = sub.subscription_fee_amount || (sub.commitment * (sub.subscription_fee_percent / 100));

          let nextDue = calculateNextDueDate(frequency, startDate);

          while (nextDue && nextDue < today) {
            nextDue = calculateNextDueDate(frequency, nextDue);
          }

          if (nextDue && nextDue <= futureDate) {
            upcomingFees.push({
              id: `${sub.id}-subscription`,
              subscription_id: sub.id,
              subscription_number: sub.subscription_number,
              investor: sub.investor,
              vehicle: sub.vehicle,
              fee_type: 'subscription',
              fee_name: 'Subscription Fee',
              amount,
              frequency,
              next_due_date: nextDue.toISOString().split('T')[0],
              status: 'scheduled',
            });
          }
        }
      }
    }

    // Sort by next_due_date
    upcomingFees.sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime());

    // Calculate summary
    const totalAmount = upcomingFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const byMonth = upcomingFees.reduce((acc, fee) => {
      const month = new Date(fee.next_due_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      if (!acc[month]) {
        acc[month] = {
          fees: [],
          total: 0,
        };
      }
      acc[month].fees.push(fee);
      acc[month].total += Number(fee.amount);
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      data: upcomingFees,
      summary: {
        total_scheduled: upcomingFees.length,
        total_amount: totalAmount,
        date_range: {
          from: today.toISOString().split('T')[0],
          to: futureDate.toISOString().split('T')[0],
        },
      },
      by_month: byMonth,
    });
  } catch (error) {
    console.error('Error in GET /api/staff/fees/schedules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = createFeeScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const { data: schedule, error } = await supabase
      .from('fee_schedules')
      .insert({
        ...validation.data,
        completed_periods: 0,
        next_due_date: validation.data.start_date,
        status: 'active',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating schedule:', error);
      return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
    }

    return NextResponse.json({ data: schedule }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/staff/fees/schedules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
