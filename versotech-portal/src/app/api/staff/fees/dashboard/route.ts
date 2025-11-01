/**
 * Fees Dashboard API Route
 * Returns KPIs and overview data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString();
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch fee events for revenue calculations
    const { data: feeEvents } = await supabase
      .from('fee_events')
      .select('computed_amount, event_date, status')
      .eq('status', 'paid');

    const ytdFees = feeEvents?.filter(e => e.event_date >= yearStart).reduce((sum, e) => sum + e.computed_amount, 0) || 0;
    const mtdFees = feeEvents?.filter(e => e.event_date >= monthStart).reduce((sum, e) => sum + e.computed_amount, 0) || 0;
    const qtdFees = feeEvents?.filter(e => e.event_date >= quarterStart).reduce((sum, e) => sum + e.computed_amount, 0) || 0;

    // Fetch invoice statistics
    const { data: invoices } = await supabase
      .from('invoices')
      .select('status, total, balance_due, due_date');

    const outstanding = invoices?.filter(i => ['sent', 'partially_paid'].includes(i.status)) || [];
    const overdue = invoices?.filter(i => ['sent', 'partially_paid', 'overdue'].includes(i.status) && new Date(i.due_date) < now) || [];

    const outstandingAmount = outstanding.reduce((sum, i) => sum + (i.balance_due || i.total), 0);
    const overdueAmount = overdue.reduce((sum, i) => sum + (i.balance_due || i.total), 0);

    // Fetch upcoming fees
    const { data: upcomingSchedules } = await supabase
      .from('fee_schedules')
      .select('*, fee_component:fee_components(*), investor:investors(display_name)')
      .eq('status', 'active')
      .lte('next_due_date', next30Days)
      .order('next_due_date');

    const upcomingFeesAmount = upcomingSchedules?.reduce((sum, schedule) => {
      // Simplified calculation - would need actual allocation amounts
      return sum + 1000; // Placeholder
    }, 0) || 0;

    // Fetch introducer commissions
    const { data: commissions } = await supabase
      .from('introducer_commissions')
      .select('accrual_amount, status')
      .in('status', ['accrued', 'approved']);

    const commissionsOwed = commissions?.reduce((sum, c) => sum + c.accrual_amount, 0) || 0;

    // Return KPIs
    return NextResponse.json({
      data: {
        total_fees_ytd: ytdFees,
        total_fees_mtd: mtdFees,
        total_fees_qtd: qtdFees,
        outstanding_invoices_count: outstanding.length,
        outstanding_invoices_amount: outstandingAmount,
        overdue_invoices_count: overdue.length,
        overdue_invoices_amount: overdueAmount,
        upcoming_fees_30days: upcomingFeesAmount,
        upcoming_fees_count: upcomingSchedules?.length || 0,
        introducer_commissions_owed: commissionsOwed,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/staff/fees/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
