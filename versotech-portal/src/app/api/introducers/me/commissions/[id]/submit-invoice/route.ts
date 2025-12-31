/**
 * Submit Invoice API (Introducer Portal)
 * POST /api/introducers/me/commissions/[id]/submit-invoice
 *
 * Allows introducers to submit their invoice for a commission.
 * Implements User Story Row 34: Notification on invoice received
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const submitInvoiceSchema = z.object({
  invoice_document_id: z.string().uuid(), // Document ID from storage
  invoice_number: z.string().optional(), // Optional invoice reference number
  notes: z.string().optional(), // Optional notes
})

/**
 * POST /api/introducers/me/commissions/[id]/submit-invoice
 * Submit invoice for a commission (introducer portal)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is linked to an introducer
    const { data: introducerUser, error: introducerError } = await serviceSupabase
      .from('introducer_users')
      .select('introducer_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (introducerError || !introducerUser) {
      return NextResponse.json({ error: 'Not an introducer' }, { status: 403 })
    }

    const introducerId = introducerUser.introducer_id

    // Get introducer info for notifications
    const { data: introducer } = await serviceSupabase
      .from('introducers')
      .select('id, legal_name')
      .eq('id', introducerId)
      .single()

    // Parse and validate body
    const body = await request.json()
    const validation = submitInvoiceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    // Fetch commission and verify ownership
    const { data: commission, error: fetchError } = await serviceSupabase
      .from('introducer_commissions')
      .select(`
        id,
        status,
        accrual_amount,
        currency,
        introducer_id,
        arranger_id,
        deal_id,
        notes,
        deal:deals(id, name)
      `)
      .eq('id', id)
      .eq('introducer_id', introducerId)
      .single()

    if (fetchError || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Validate status - must be 'invoice_requested'
    if (commission.status !== 'invoice_requested') {
      return NextResponse.json(
        { error: `Cannot submit invoice for commission with status '${commission.status}'. Must be 'invoice_requested'.` },
        { status: 400 }
      )
    }

    // Verify document exists in storage
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('id, file_name')
      .eq('id', data.invoice_document_id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Invoice document not found' }, { status: 404 })
    }

    // Update commission status to 'invoiced'
    const invoiceNotes = data.notes
      ? `Invoice submitted: ${data.invoice_number || document.file_name}. Notes: ${data.notes}`
      : `Invoice submitted: ${data.invoice_number || document.file_name}`

    const { data: updatedCommission, error: updateError } = await serviceSupabase
      .from('introducer_commissions')
      .update({
        status: 'invoiced',
        invoice_id: data.invoice_document_id,
        notes: commission.notes
          ? `${commission.notes}\n\n${invoiceNotes}`
          : invoiceNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[submit-invoice] Error updating commission:', updateError)
      return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
    }

    // Format amount for notification
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: commission.currency || 'USD',
    }).format(commission.accrual_amount)

    const deal = Array.isArray(commission.deal) ? commission.deal[0] : commission.deal

    // Notify arranger users that invoice has been submitted
    if (commission.arranger_id) {
      const { data: arrangerUsers } = await serviceSupabase
        .from('arranger_users')
        .select('user_id')
        .eq('arranger_id', commission.arranger_id)

      if (arrangerUsers && arrangerUsers.length > 0) {
        const notifications = arrangerUsers.map(au => ({
          user_id: au.user_id,
          investor_id: null,
          title: 'Invoice Received',
          message: `Invoice received from ${introducer?.legal_name || 'Introducer'} for ${formattedAmount}${deal ? ` (${deal.name})` : ''}.`,
          link: '/versotech_main/my-introducers',
          type: 'info' as const,
        }))

        await serviceSupabase.from('investor_notifications').insert(notifications)
        console.log('[submit-invoice] Sent', notifications.length, 'notifications to arranger users')
      }
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'invoice_submitted',
      entity_type: 'introducer_commission',
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Introducer submitted invoice for commission',
        introducer_id: introducerId,
        introducer_name: introducer?.legal_name,
        arranger_id: commission.arranger_id,
        deal_id: commission.deal_id,
        amount: commission.accrual_amount,
        currency: commission.currency,
        invoice_document_id: data.invoice_document_id,
        invoice_number: data.invoice_number,
      },
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      data: updatedCommission,
      message: 'Invoice submitted successfully',
    })
  } catch (error) {
    console.error('[submit-invoice] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
