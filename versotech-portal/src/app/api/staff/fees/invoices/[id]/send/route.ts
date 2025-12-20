/**
 * Send Invoice API Route
 * Marks invoice as 'sent' (simplified - no actual email sending)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch full invoice with details for PDF generation
    const { data: fullInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        investor:investors(id, display_name, email, legal_name),
        deal:deals(id, name),
        lines:invoice_lines(*, fee_event:fee_events(*))
      `)
      .eq('id', id)
      .single();

    if (fetchError || !fullInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if invoice is already sent
    if (fullInvoice.status === 'sent') {
      return NextResponse.json({
        message: 'Invoice has already been sent',
        data: fullInvoice
      }, { status: 200 });
    }

    // Simplified: Just mark as sent without actually sending email
    // No PDF generation, no n8n webhook, just update status
    console.log('[Invoice Send] Marking invoice as sent (simplified mode):', id);

    // Update invoice status to 'sent'
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Invoice Send] Error updating invoice status:', error);
      return NextResponse.json({
        error: 'Failed to update invoice status',
        details: error.message
      }, { status: 500 });
    }

    console.log('[Invoice Send] Invoice status updated to sent:', id);

    return NextResponse.json({
      data: invoice,
      message: 'Invoice marked as sent successfully'
    });

  } catch (error) {
    console.error('[Invoice Send] Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}