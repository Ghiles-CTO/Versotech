/**
 * Individual Invoice API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateInvoiceSchema, markInvoicePaidSchema } from '@/lib/fees/validation';
import { validateInvoiceTotal, InvoiceLineWithFeeEvent } from '@/lib/fees/calculations';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        investor:investors(id, display_name, email),
        deal:deals(id, name),
        lines:invoice_lines(*, fee_event:fee_events(*))
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }

    // Validate invoice total matches sum of linked fee events
    const validation = validateInvoiceTotal({
      invoiceTotal: Number(invoice.total) || 0,
      invoiceSubtotal: Number(invoice.subtotal) || 0,
      lines: (invoice.lines || []) as InvoiceLineWithFeeEvent[],
    });

    return NextResponse.json({
      data: invoice,
      validation,
    });
  } catch (error) {
    console.error('Error in GET /api/staff/fees/invoices/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = updateInvoiceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({ ...validation.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }

    return NextResponse.json({ data: invoice });
  } catch (error) {
    console.error('Error in PUT /api/staff/fees/invoices/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
