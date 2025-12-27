/**
 * Fee Payment Confirmation API
 * POST /api/escrow/[subscriptionId]/confirm-payment
 *
 * Lawyer confirms fee payment has been processed
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { z } from 'zod'

const paymentTypeEnum = z.enum(['partner', 'introducer', 'commercial_partner', 'seller'])

const confirmPaymentSchema = z.object({
  payment_type: paymentTypeEnum,
  recipient_id: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().uuid('Invalid recipient ID').optional()
  ),
  amount: z.number().positive('Amount must be positive'),
  bank_reference: z.string().optional(),
  confirmation_notes: z.string().optional(),
  fee_event_id: z.string().uuid().optional() // Optional: link to specific fee event
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subscriptionId } = await params
    const supabase = await createClient()

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a lawyer
    const { data: lawyerUser } = await supabase
      .from('lawyer_users')
      .select('lawyer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!lawyerUser) {
      return NextResponse.json({ error: 'Not authorized - lawyer access required' }, { status: 403 })
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        deal_id,
        investor_id,
        deals (id, name)
      `)
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Verify lawyer is assigned to this deal
    const { data: assignment } = await supabase
      .from('deal_lawyer_assignments')
      .select('id')
      .eq('deal_id', subscription.deal_id)
      .eq('lawyer_id', lawyerUser.lawyer_id)
      .maybeSingle()

    if (!assignment) {
      // Fallback check
      const { data: fallbackLawyer } = await supabase
        .from('lawyers')
        .select('assigned_deals')
        .eq('id', lawyerUser.lawyer_id)
        .maybeSingle()

      const assignedDeals = fallbackLawyer?.assigned_deals || []
      if (!assignedDeals.includes(subscription.deal_id)) {
        return NextResponse.json({ error: 'Not assigned to this deal' }, { status: 403 })
      }
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = confirmPaymentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 })
    }

    const { payment_type, recipient_id, amount, bank_reference, confirmation_notes, fee_event_id } = validation.data

    if (payment_type !== 'seller' && !recipient_id) {
      return NextResponse.json({
        error: 'Recipient is required for this payment type'
      }, { status: 400 })
    }

    const resolvedRecipientId = payment_type === 'seller' ? null : recipient_id || null

    // Get recipient details for notification
    let recipientName = 'Unknown'
    let recipientUserId: string | null = null

    if (payment_type === 'partner' && resolvedRecipientId) {
      const { data: partner } = await supabase
        .from('partners')
        .select('legal_name, display_name')
        .eq('id', resolvedRecipientId)
        .maybeSingle()
      recipientName = partner?.display_name || partner?.legal_name || 'Partner'

      // Get partner users for notification
      const { data: partnerUsers } = await supabase
        .from('partner_users')
        .select('user_id')
        .eq('partner_id', resolvedRecipientId)
      recipientUserId = partnerUsers?.[0]?.user_id || null
    } else if (payment_type === 'introducer' && resolvedRecipientId) {
      const { data: introducer } = await supabase
        .from('introducers')
        .select('legal_name, display_name')
        .eq('id', resolvedRecipientId)
        .maybeSingle()
      recipientName = introducer?.display_name || introducer?.legal_name || 'Introducer'

      // Get introducer users for notification
      const { data: introducerUsers } = await supabase
        .from('introducer_users')
        .select('user_id')
        .eq('introducer_id', resolvedRecipientId)
      recipientUserId = introducerUsers?.[0]?.user_id || null
    } else if (payment_type === 'commercial_partner' && resolvedRecipientId) {
      const { data: cp } = await supabase
        .from('commercial_partners')
        .select('legal_name, display_name')
        .eq('id', resolvedRecipientId)
        .maybeSingle()
      recipientName = cp?.display_name || cp?.legal_name || 'Commercial Partner'

      // Get CP users for notification
      const { data: cpUsers } = await supabase
        .from('commercial_partner_users')
        .select('user_id')
        .eq('commercial_partner_id', resolvedRecipientId)
      recipientUserId = cpUsers?.[0]?.user_id || null
    } else if (payment_type === 'seller') {
      recipientName = 'Seller'
      // Seller notification would go to deal owner/CEO
    }

    // Update fee_event status if provided
    if (fee_event_id) {
      const { error: feeUpdateError } = await supabase
        .from('fee_events')
        .update({
          status: 'paid',
          processed_at: new Date().toISOString(),
          notes: confirmation_notes ? `Payment confirmed: ${confirmation_notes}` : `Payment confirmed. Amount: ${amount}. Bank ref: ${bank_reference || 'N/A'}`
        })
        .eq('id', fee_event_id)
        .in('status', ['accrued', 'invoiced'])

      if (feeUpdateError) {
        console.error('Failed to update fee event:', feeUpdateError)
        // Continue anyway - the payment confirmation is more important
      }
    }

    const dealName = (subscription.deals as any)?.name || 'Unknown Deal'

    // Notify the recipient if we have their user_id
    if (recipientUserId) {
      await supabase.from('investor_notifications').insert({
        user_id: recipientUserId,
        investor_id: null,
        title: 'Payment Confirmed',
        message: `Payment of ${amount.toLocaleString()} confirmed for ${dealName}`,
        link: `/versotech_main/transactions`
      })
    }

    // Notify CEO/staff_admin
    const { data: staffAdmins } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['ceo', 'staff_admin'])

    if (staffAdmins && staffAdmins.length > 0) {
      const notifications = staffAdmins.map(admin => ({
        user_id: admin.id,
        investor_id: null,
        title: `${payment_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Payment Confirmed`,
        message: `Lawyer confirmed ${amount.toLocaleString()} payment to ${recipientName} for ${dealName}`,
        link: `/versotech_main/deals/${subscription.deal_id}`
      }))

      await supabase.from('investor_notifications').insert(notifications)
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: fee_event_id ? AuditEntities.FEE_EVENTS : AuditEntities.SUBSCRIPTIONS,
      entity_id: fee_event_id || subscriptionId,
      metadata: {
        event: 'fee_payment_confirmed',
        payment_type,
        recipient_id: resolvedRecipientId,
        recipient_name: recipientName,
        amount,
        bank_reference,
        confirmation_notes,
        fee_event_id,
        lawyer_id: lawyerUser.lawyer_id
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        subscription_id: subscriptionId,
        payment_type,
        recipient_name: recipientName,
        amount,
        message: `Payment of ${amount.toLocaleString()} to ${recipientName} confirmed`
      }
    })

  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
