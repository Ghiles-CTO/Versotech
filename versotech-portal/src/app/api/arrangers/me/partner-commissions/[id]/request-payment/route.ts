/**
 * Request Payment API for Partner Commissions
 * POST /api/arrangers/me/partner-commissions/[id]/request-payment
 *
 * Creates payment request to lawyer/CEO for commission payout.
 * Implements User Story Row 16: Request payment to Lawyer(s)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const requestPaymentSchema = z.object({
  lawyer_id: z.string().uuid().optional(), // Optional - specific lawyer to notify
  notes: z.string().optional(), // Payment notes/instructions
})

/**
 * POST /api/arrangers/me/partner-commissions/[id]/request-payment
 * Request payment approval from lawyer/CEO
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

    // Check if user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Parse body
    const body = await request.json().catch(() => ({}))
    const validation = requestPaymentSchema.safeParse(body)
    const requestData = validation.success ? validation.data : {}

    // Fetch commission with partner and deal info
    const { data: commission, error: fetchError } = await serviceSupabase
      .from('partner_commissions')
      .select(`
        id,
        status,
        accrual_amount,
        currency,
        partner_id,
        deal_id,
        invoice_id,
        notes,
        partner:partners(id, name, legal_name),
        deal:deals(id, name)
      `)
      .eq('id', id)
      .eq('arranger_id', arrangerId)
      .single()

    if (fetchError || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Validate status - must be 'invoiced'
    if (commission.status !== 'invoiced') {
      return NextResponse.json(
        { error: `Cannot request payment for commission with status '${commission.status}'. Must be 'invoiced'.` },
        { status: 400 }
      )
    }

    const partner = Array.isArray(commission.partner) ? commission.partner[0] : commission.partner
    const deal = Array.isArray(commission.deal) ? commission.deal[0] : commission.deal

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: commission.currency || 'USD',
    }).format(commission.accrual_amount)

    // Require at least one lawyer assignment before requesting payment
    if (!commission.deal_id) {
      return NextResponse.json(
        { error: 'Deal assignment required before requesting payment' },
        { status: 400 }
      )
    }

    const { data: lawyerAssignments } = await serviceSupabase
      .from('deal_lawyer_assignments')
      .select('lawyer_id')
      .eq('deal_id', commission.deal_id)

    if (!lawyerAssignments || lawyerAssignments.length === 0) {
      return NextResponse.json(
        { error: 'Assign a lawyer to this deal before requesting payment' },
        { status: 400 }
      )
    }

    // Collect recipients to notify
    const notificationsToCreate: any[] = []

    // 1. Notify assigned lawyers
    const lawyerIds = lawyerAssignments.map(a => a.lawyer_id)
    const { data: lawyerUsers } = await serviceSupabase
      .from('lawyer_users')
      .select('user_id, lawyer_id')
      .in('lawyer_id', lawyerIds)

    if (lawyerUsers) {
      for (const lu of lawyerUsers) {
        notificationsToCreate.push({
          user_id: lu.user_id,
          investor_id: null,
          title: 'Payment Request - Partner Commission',
          message: `Payment of ${formattedAmount} requested for ${partner?.name || partner?.legal_name || 'Partner'}${deal ? ` (${deal.name})` : ''}.`,
          link: `/versotech_main/lawyer-reconciliation`,
          type: 'action_required',
        })
      }
    }

    // 2. Notify CEO/staff_admin users
    const { data: ceoUsers } = await serviceSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'staff_admin')
      .limit(5)

    if (ceoUsers) {
      for (const ceo of ceoUsers) {
        notificationsToCreate.push({
          user_id: ceo.id,
          investor_id: null,
          title: 'Payment Request - Partner Commission',
          message: `Payment of ${formattedAmount} requested for ${partner?.name || partner?.legal_name || 'Partner'}${deal ? ` (${deal.name})` : ''}.`,
          link: `/versotech_main/staff/fees`,
          type: 'action_required',
        })
      }
    }

    // 3. If specific lawyer requested, prioritize them
    if (requestData.lawyer_id) {
      const { data: specificLawyerUsers } = await serviceSupabase
        .from('lawyer_users')
        .select('user_id')
        .eq('lawyer_id', requestData.lawyer_id)

      if (specificLawyerUsers) {
        for (const lu of specificLawyerUsers) {
          // Avoid duplicate notifications
          if (!notificationsToCreate.some(n => n.user_id === lu.user_id)) {
            notificationsToCreate.push({
              user_id: lu.user_id,
              investor_id: null,
              title: 'Payment Request - Partner Commission (Priority)',
              message: `Payment of ${formattedAmount} requested for ${partner?.name || partner?.legal_name || 'Partner'}${deal ? ` (${deal.name})` : ''}. Please process.`,
              link: `/versotech_main/lawyer-reconciliation`,
              type: 'action_required',
            })
          }
        }
      }
    }

    // Send all notifications
    if (notificationsToCreate.length > 0) {
      await serviceSupabase.from('investor_notifications').insert(notificationsToCreate)
      console.log('[partner-request-payment] Sent', notificationsToCreate.length, 'notifications')
    }

    // Update commission notes with payment request info
    const paymentRequestNote = `Payment requested on ${new Date().toISOString().split('T')[0]}${requestData.notes ? `: ${requestData.notes}` : ''}`
    const updatedNotes = commission.notes
      ? `${commission.notes}\n\n${paymentRequestNote}`
      : paymentRequestNote

    await serviceSupabase
      .from('partner_commissions')
      .update({
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'payment_requested',
      entity_type: 'partner_commission',
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Payment requested for partner commission',
        partner_id: commission.partner_id,
        partner_name: partner?.name || partner?.legal_name,
        deal_id: commission.deal_id,
        amount: commission.accrual_amount,
        currency: commission.currency,
        notifications_sent: notificationsToCreate.length,
        specific_lawyer_id: requestData.lawyer_id,
      },
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Payment request sent to ${notificationsToCreate.length} recipient(s)`,
      notifications_sent: notificationsToCreate.length,
    })
  } catch (error) {
    console.error('[partner-request-payment] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
