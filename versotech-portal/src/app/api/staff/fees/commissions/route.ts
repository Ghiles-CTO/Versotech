/**
 * Commissions API Routes
 * GET /api/staff/fees/commissions - List introducer commissions with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // accrued, invoiced, paid
    const introducerId = searchParams.get('introducer_id');
    const dealId = searchParams.get('deal_id');

    // Build query
    let query = supabase
      .from('introducer_commissions')
      .select(`
        *,
        introducer:introducer_id(id, legal_name, contact_name, email, default_commission_bps),
        deal:deal_id(id, name),
        investor:investor_id(id, legal_name, display_name),
        introduction:introduction_id(id, prospect_email, introduced_at)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (introducerId) {
      query = query.eq('introducer_id', introducerId);
    }
    if (dealId) {
      query = query.eq('deal_id', dealId);
    }

    const { data: commissions, error } = await query;

    if (error) {
      console.error('Error fetching commissions:', error);
      return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 });
    }

    // Calculate summary stats
    const totalAccrued = commissions?.filter(c => c.status === 'accrued').reduce((sum, c) => sum + Number(c.accrual_amount), 0) || 0;
    const totalInvoiced = commissions?.filter(c => c.status === 'invoiced').reduce((sum, c) => sum + Number(c.accrual_amount), 0) || 0;
    const totalPaid = commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.accrual_amount), 0) || 0;
    const totalOverdue = commissions?.filter(c =>
      c.status !== 'paid' &&
      c.payment_due_date &&
      new Date(c.payment_due_date) < new Date()
    ).reduce((sum, c) => sum + Number(c.accrual_amount), 0) || 0;

    // Group by introducer
    const byIntroducer = commissions?.reduce((acc, comm) => {
      const introducerId = comm.introducer_id;
      if (!introducerId) return acc;

      if (!acc[introducerId]) {
        acc[introducerId] = {
          introducer: comm.introducer,
          commissions: [],
          totals: {
            accrued: 0,
            invoiced: 0,
            paid: 0,
            total: 0,
          },
        };
      }

      acc[introducerId].commissions.push(comm);
      acc[introducerId].totals.total += Number(comm.accrual_amount);

      if (comm.status === 'accrued') {
        acc[introducerId].totals.accrued += Number(comm.accrual_amount);
      } else if (comm.status === 'invoiced') {
        acc[introducerId].totals.invoiced += Number(comm.accrual_amount);
      } else if (comm.status === 'paid') {
        acc[introducerId].totals.paid += Number(comm.accrual_amount);
      }

      return acc;
    }, {} as Record<string, any>) || {};

    return NextResponse.json({
      data: commissions || [],
      summary: {
        total_accrued: totalAccrued,
        total_invoiced: totalInvoiced,
        total_paid: totalPaid,
        total_overdue: totalOverdue,
        total_owed: totalAccrued + totalInvoiced, // accrued + invoiced = what we still owe
      },
      by_introducer: Object.values(byIntroducer),
    });
  } catch (error) {
    console.error('Error in GET /api/staff/fees/commissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
