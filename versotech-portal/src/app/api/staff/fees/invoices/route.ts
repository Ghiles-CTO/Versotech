/**
 * Invoices API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInvoiceSchema, invoiceFiltersSchema } from '@/lib/fees/validation';
import { validateInvoiceTotal, InvoiceLineWithFeeEvent } from '@/lib/fees/calculations';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validation = invoiceFiltersSchema.safeParse(searchParams);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid filters' }, { status: 400 });
    }

    const filters = validation.data;
    let query = supabase
      .from('invoices')
      .select(`
        *,
        investor:investors(id, legal_name, display_name, email),
        deal:deals(id, name),
        lines:invoice_lines(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (filters.investor_id) query = query.eq('investor_id', filters.investor_id);
    if (filters.deal_id) query = query.eq('deal_id', filters.deal_id);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.date_from) query = query.gte('due_date', filters.date_from);
    if (filters.date_to) query = query.lte('due_date', filters.date_to);

    const { data, error, count } = await query;
    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    // Add validation info to each invoice
    const invoicesWithValidation = (data || []).map((invoice: any) => {
      const validation = validateInvoiceTotal({
        invoiceTotal: Number(invoice.total) || 0,
        invoiceSubtotal: Number(invoice.subtotal) || 0,
        lines: (invoice.lines || []) as InvoiceLineWithFeeEvent[],
      });

      return {
        ...invoice,
        has_discrepancy: validation.hasDiscrepancy,
        discrepancy_amount: validation.discrepancyAmount,
      };
    });

    return NextResponse.json({ data: invoicesWithValidation, count });
  } catch (error) {
    console.error('Error in GET /api/staff/fees/invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = createInvoiceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const { fee_event_ids, custom_line_items, ...invoiceData } = validation.data;

    // Fetch fee events to calculate totals
    const { data: feeEvents, error: eventsError } = await supabase
      .from('fee_events')
      .select('*')
      .in('id', fee_event_ids);

    if (eventsError || !feeEvents) {
      return NextResponse.json({ error: 'Failed to fetch fee events' }, { status: 500 });
    }

    // Calculate invoice totals
    const feeEventsTotal = feeEvents.reduce((sum, event) => sum + event.computed_amount, 0);
    const customTotal = custom_line_items?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const subtotal = feeEventsTotal + customTotal;
    const total = subtotal; // Add tax calculation if needed

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // Create invoice
    // Note: balance_due is a generated column, so we don't insert it
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        ...invoiceData,
        invoice_number: invoiceNumber,
        subtotal,
        total,
        // balance_due is automatically calculated as (total - paid_amount)
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }

    // Create invoice lines from fee events
    const feeEventLines = feeEvents.map(event => {
      // Map fee_type to invoice line kind
      // 'flat' = commitment/investment amount (kind: 'other')
      // All other fees = actual fees (kind: 'fee')
      const kind = event.fee_type === 'flat' ? 'other' : 'fee';

      // Create better descriptions
      let description = '';
      if (event.fee_type === 'flat') {
        description = `Investment commitment${event.allocation_id ? ' - subscription' : ''}`;
      } else if (event.fee_type === 'subscription') {
        description = 'Subscription fee';
      } else if (event.fee_type === 'management') {
        description = 'Management fee';
      } else if (event.fee_type === 'spread_markup') {
        description = 'Spread markup fee';
      } else if (event.fee_type === 'bd_fee') {
        description = 'Broker-dealer fee';
      } else if (event.fee_type === 'finra_fee') {
        description = 'FINRA regulatory fee';
      } else if (event.fee_type === 'performance') {
        description = 'Performance fee';
      } else {
        description = `${event.fee_type} fee`;
      }

      return {
        invoice_id: invoice.id,
        fee_event_id: event.id,
        kind,
        description,
        quantity: 1,
        unit_price: event.computed_amount,
        amount: event.computed_amount,
      };
    });

    // Add custom line items
    const customLines = custom_line_items?.map(item => ({
      ...item,
      invoice_id: invoice.id,
    })) || [];

    const allLines = [...feeEventLines, ...customLines];

    const { data: lines, error: linesError } = await supabase
      .from('invoice_lines')
      .insert(allLines)
      .select();

    if (linesError) {
      console.error('Error creating invoice lines:', linesError);
      await supabase.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json({ error: 'Failed to create invoice lines' }, { status: 500 });
    }

    // Update fee events to invoiced status
    await supabase
      .from('fee_events')
      .update({ status: 'invoiced', invoice_id: invoice.id })
      .in('id', fee_event_ids);

    return NextResponse.json({ data: { ...invoice, lines } }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/staff/fees/invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
