/**
 * Fees Dashboard API Route
 * Returns KPIs and overview data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addCurrencyAmount } from '@/lib/currency-totals';

interface CommissionRow {
  accrual_amount: number;
  status: string;
  paid_at: string | null;
  currency?: string | null;
}

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
      .select('computed_amount, event_date, status, currency')
      .eq('status', 'paid');

    const ytdFees = feeEvents?.filter(e => e.event_date >= yearStart).reduce((sum, e) => sum + e.computed_amount, 0) || 0;
    const mtdFees = feeEvents?.filter(e => e.event_date >= monthStart).reduce((sum, e) => sum + e.computed_amount, 0) || 0;
    const qtdFees = feeEvents?.filter(e => e.event_date >= quarterStart).reduce((sum, e) => sum + e.computed_amount, 0) || 0;
    const ytdFeesByCurrency = (feeEvents || [])
      .filter(e => e.event_date >= yearStart)
      .reduce<Record<string, number>>((acc, event) => {
        addCurrencyAmount(acc, event.computed_amount, event.currency);
        return acc;
      }, {});
    const mtdFeesByCurrency = (feeEvents || [])
      .filter(e => e.event_date >= monthStart)
      .reduce<Record<string, number>>((acc, event) => {
        addCurrencyAmount(acc, event.computed_amount, event.currency);
        return acc;
      }, {});

    // Fetch invoice statistics
    const { data: invoices } = await supabase
      .from('invoices')
      .select('status, total, balance_due, due_date, currency');

    const outstanding = invoices?.filter(i => ['sent', 'partially_paid'].includes(i.status)) || [];
    const overdue = invoices?.filter(i => ['sent', 'partially_paid', 'overdue'].includes(i.status) && new Date(i.due_date) < now) || [];

    const outstandingAmount = outstanding.reduce((sum, i) => sum + (i.balance_due || i.total), 0);
    const overdueAmount = overdue.reduce((sum, i) => sum + (i.balance_due || i.total), 0);
    const outstandingAmountByCurrency = outstanding.reduce<Record<string, number>>((acc, invoice) => {
      addCurrencyAmount(acc, invoice.balance_due || invoice.total, invoice.currency);
      return acc;
    }, {});
    const overdueAmountByCurrency = overdue.reduce<Record<string, number>>((acc, invoice) => {
      addCurrencyAmount(acc, invoice.balance_due || invoice.total, invoice.currency);
      return acc;
    }, {});

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

    // Fetch all commissions from all 3 tables
    const [introducerRes, partnerRes, commercialPartnerRes] = await Promise.all([
      supabase
        .from('introducer_commissions')
        .select('accrual_amount, status, paid_at, currency'),
      supabase
        .from('partner_commissions')
        .select('accrual_amount, status, paid_at, currency'),
      supabase
        .from('commercial_partner_commissions')
        .select('accrual_amount, status, paid_at, currency'),
    ]);

    const introducerCommissions: CommissionRow[] = introducerRes.data || [];
    const partnerCommissions: CommissionRow[] = partnerRes.data || [];
    const commercialPartnerCommissions: CommissionRow[] = commercialPartnerRes.data || [];

    // Helper to calculate commission totals for a single table
    const calculateCommissionTotals = (commissions: CommissionRow[]) => {
      const accrued = commissions
        .filter(c => c.status === 'accrued')
        .reduce((sum, c) => sum + Number(c.accrual_amount), 0);
      const invoiced = commissions
        .filter(c => c.status === 'invoiced')
        .reduce((sum, c) => sum + Number(c.accrual_amount), 0);
      const paid = commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + Number(c.accrual_amount), 0);
      const paidYtd = commissions
        .filter(c => c.status === 'paid' && c.paid_at && c.paid_at >= yearStart)
        .reduce((sum, c) => sum + Number(c.accrual_amount), 0);
      const owedByCurrency = commissions
        .filter(c => c.status === 'accrued' || c.status === 'invoiced')
        .reduce<Record<string, number>>((acc, c) => {
          addCurrencyAmount(acc, c.accrual_amount, c.currency);
          return acc;
        }, {});
      const paidByCurrency = commissions
        .filter(c => c.status === 'paid' && c.paid_at && c.paid_at >= yearStart)
        .reduce<Record<string, number>>((acc, c) => {
          addCurrencyAmount(acc, c.accrual_amount, c.currency);
          return acc;
        }, {});
      return { accrued, invoiced, paid, paidYtd, owed: accrued + invoiced, owedByCurrency, paidByCurrency };
    };

    const introducerTotals = calculateCommissionTotals(introducerCommissions);
    const partnerTotals = calculateCommissionTotals(partnerCommissions);
    const commercialPartnerTotals = calculateCommissionTotals(commercialPartnerCommissions);

    // Calculate aggregated totals across all 3 tables
    const commissionSummary = {
      total_owed: introducerTotals.owed + partnerTotals.owed + commercialPartnerTotals.owed,
      total_accrued: introducerTotals.accrued + partnerTotals.accrued + commercialPartnerTotals.accrued,
      total_invoiced: introducerTotals.invoiced + partnerTotals.invoiced + commercialPartnerTotals.invoiced,
      total_paid_ytd: introducerTotals.paidYtd + partnerTotals.paidYtd + commercialPartnerTotals.paidYtd,
      total_owed_by_currency: [introducerTotals.owedByCurrency, partnerTotals.owedByCurrency, commercialPartnerTotals.owedByCurrency]
        .reduce<Record<string, number>>((acc, totals) => {
          Object.entries(totals).forEach(([currency, amount]) => {
            addCurrencyAmount(acc, amount, currency);
          });
          return acc;
        }, {}),
      total_paid_ytd_by_currency: [introducerTotals.paidByCurrency, partnerTotals.paidByCurrency, commercialPartnerTotals.paidByCurrency]
        .reduce<Record<string, number>>((acc, totals) => {
          Object.entries(totals).forEach(([currency, amount]) => {
            addCurrencyAmount(acc, amount, currency);
          });
          return acc;
        }, {}),
      by_entity_type: {
        introducer: {
          owed: introducerTotals.owed,
          paid: introducerTotals.paidYtd,
          owed_by_currency: introducerTotals.owedByCurrency,
          paid_by_currency: introducerTotals.paidByCurrency,
        },
        partner: {
          owed: partnerTotals.owed,
          paid: partnerTotals.paidYtd,
          owed_by_currency: partnerTotals.owedByCurrency,
          paid_by_currency: partnerTotals.paidByCurrency,
        },
        commercial_partner: {
          owed: commercialPartnerTotals.owed,
          paid: commercialPartnerTotals.paidYtd,
          owed_by_currency: commercialPartnerTotals.owedByCurrency,
          paid_by_currency: commercialPartnerTotals.paidByCurrency,
        },
      },
    };

    // Return KPIs
    return NextResponse.json({
      data: {
        total_fees_ytd: ytdFees,
        total_fees_ytd_by_currency: ytdFeesByCurrency,
        total_fees_mtd: mtdFees,
        total_fees_mtd_by_currency: mtdFeesByCurrency,
        total_fees_qtd: qtdFees,
        outstanding_invoices_count: outstanding.length,
        outstanding_invoices_amount: outstandingAmount,
        outstanding_invoices_amount_by_currency: outstandingAmountByCurrency,
        overdue_invoices_count: overdue.length,
        overdue_invoices_amount: overdueAmount,
        overdue_invoices_amount_by_currency: overdueAmountByCurrency,
        upcoming_fees_30days: upcomingFeesAmount,
        upcoming_fees_count: upcomingSchedules?.length || 0,
        introducer_commissions_owed: introducerTotals.owed, // Legacy field for backward compatibility
        commission_summary: commissionSummary,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/staff/fees/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
