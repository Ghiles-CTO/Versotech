/**
 * Mark Invoice as Paid API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markInvoicePaidSchema } from '@/lib/fees/validation';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = markInvoicePaidSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const { paid_amount, paid_at, payment_reference } = validation.data;

    // Fetch current invoice
    const { data: currentInvoice } = await supabase
      .from('invoices')
      .select('total, paid_amount, balance_due')
      .eq('id', id)
      .single();

    if (!currentInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const newPaidAmount = (currentInvoice.paid_amount || 0) + paid_amount;
    const newBalanceDue = currentInvoice.total - newPaidAmount;
    const newStatus = newBalanceDue <= 0 ? 'paid' : 'partially_paid';

    // Update invoice
    // Note: balance_due is a generated column, it will auto-update when paid_amount changes
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        paid_amount: newPaidAmount,
        // balance_due is automatically calculated as (total - paid_amount)
        status: newStatus,
        paid_at: paid_at || new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error marking invoice as paid:', error);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }

    // Update related fee events if fully paid
    if (newStatus === 'paid') {
      await supabase
        .from('fee_events')
        .update({ status: 'paid' })
        .eq('invoice_id', id);
    }

    return NextResponse.json({ data: invoice, message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('Error in POST /api/staff/fees/invoices/[id]/mark-paid:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
