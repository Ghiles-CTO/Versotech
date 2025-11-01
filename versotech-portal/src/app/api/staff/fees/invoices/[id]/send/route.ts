/**
 * Send Invoice API Route
 * Only marks invoice as 'sent' if webhook succeeds
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

    // Check if n8n webhook URL is configured
    const webhookUrl = process.env.N8N_INVOICE_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('[Invoice Send] No N8N_INVOICE_WEBHOOK_URL configured');
      return NextResponse.json({
        error: 'Email service not configured',
        details: 'Please configure N8N_INVOICE_WEBHOOK_URL in environment variables'
      }, { status: 503 }); // 503 Service Unavailable
    }

    // Try to trigger n8n webhook first
    console.log('[Invoice Send] Triggering n8n webhook for invoice:', id);

    let webhookSuccess = false;
    let webhookError: string | null = null;

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow: 'generate-and-send-invoice',
          invoice_id: id,
          invoice_number: fullInvoice.invoice_number,
          investor: {
            id: fullInvoice.investor?.id,
            name: fullInvoice.investor?.display_name || fullInvoice.investor?.legal_name,
            email: fullInvoice.investor?.email
          },
          deal_name: fullInvoice.deal?.name,
          total: fullInvoice.total,
          due_date: fullInvoice.due_date,
          line_items: fullInvoice.lines?.map((line: any) => ({
            description: line.description,
            amount: line.amount,
            quantity: line.quantity,
            unit_price: line.unit_price
          }))
        })
      });

      webhookSuccess = webhookResponse.ok;

      if (!webhookSuccess) {
        const errorText = await webhookResponse.text();
        webhookError = `Webhook returned status ${webhookResponse.status}: ${errorText}`;
        console.error('[Invoice Send] n8n webhook failed:', webhookError);
      } else {
        console.log('[Invoice Send] n8n webhook triggered successfully');
      }

    } catch (error) {
      webhookError = error instanceof Error ? error.message : 'Unknown webhook error';
      console.error('[Invoice Send] Error calling n8n webhook:', error);
      webhookSuccess = false;
    }

    // If webhook failed, return error without updating status
    if (!webhookSuccess) {
      return NextResponse.json({
        error: 'Failed to send invoice',
        details: webhookError || 'Webhook request failed'
      }, { status: 502 }); // 502 Bad Gateway
    }

    // Only update invoice status to 'sent' if webhook succeeded
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
      // Webhook succeeded but DB update failed - this is a warning
      return NextResponse.json({
        warning: 'Invoice sent via email but status update failed',
        error: error.message,
        data: fullInvoice
      }, { status: 200 }); // Still return 200 since email was sent
    }

    console.log('[Invoice Send] Invoice successfully sent and status updated:', id);

    return NextResponse.json({
      data: invoice,
      message: 'Invoice sent successfully'
    });

  } catch (error) {
    console.error('[Invoice Send] Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}