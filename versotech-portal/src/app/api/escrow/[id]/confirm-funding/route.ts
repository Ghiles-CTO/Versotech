/**
 * Escrow Funding Confirmation API
 * POST /api/escrow/[subscriptionId]/confirm-funding
 *
 * Lawyer confirms funding has been received in escrow
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { z } from 'zod'

const confirmFundingSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  confirmation_notes: z.string().optional(),
  bank_reference: z.string().optional()
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
        commitment,
        currency,
        status,
        funded_amount,
        deals (id, name)
      `)
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Verify lawyer is assigned to this deal via deal_lawyer_assignments
    const { data: assignment } = await supabase
      .from('deal_lawyer_assignments')
      .select('id')
      .eq('deal_id', subscription.deal_id)
      .eq('lawyer_id', lawyerUser.lawyer_id)
      .maybeSingle()

    // Fallback: check lawyers.assigned_deals array
    if (!assignment) {
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
    const validation = confirmFundingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 })
    }

    const { amount, confirmation_notes, bank_reference } = validation.data
    const commitment = Number(subscription.commitment || 0)
    const currentFunded = Number(subscription.funded_amount || 0)

    // Idempotency check: If subscription is already fully funded, reject
    if (commitment > 0 && subscription.status === 'active' && currentFunded >= commitment) {
      return NextResponse.json({
        error: 'Subscription is already fully funded',
        data: {
          subscription_id: subscriptionId,
          current_funded: currentFunded,
          commitment: commitment,
          status: subscription.status
        }
      }, { status: 409 }) // Conflict
    }

    const remaining = commitment > 0 ? Math.max(commitment - currentFunded, 0) : 0

    // Prevent over-funding
    if (commitment > 0 && amount > remaining) {
      return NextResponse.json({
        error: `Amount would exceed commitment. Maximum additional funding allowed: ${remaining.toLocaleString()} ${subscription.currency || 'USD'}`,
        data: {
          current_funded: currentFunded,
          commitment: commitment,
          max_allowed: remaining
        }
      }, { status: 400 })
    }

    // Calculate new funded amount
    const newFundedAmount = commitment > 0 ? Math.min(currentFunded + amount, commitment) : currentFunded + amount
    const newOutstandingAmount = commitment > 0 ? Math.max(commitment - newFundedAmount, 0) : null

    // Determine new status based on funding level
    // NOTE: Status changes to 'funded' here, NOT 'active'
    // 'active' status + position + certificate + commissions are set at DEAL CLOSE (see deal-close-handler.ts)
    let newStatus = subscription.status
    if (commitment > 0 && newFundedAmount >= commitment) {
      newStatus = 'funded' // Fully funded - awaiting deal close
    } else if (newFundedAmount > 0) {
      newStatus = 'partially_funded'
    }

    // Update subscription
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        funded_amount: newFundedAmount,
        funded_at: commitment > 0 && newFundedAmount >= commitment ? new Date().toISOString() : null,
        status: newStatus,
        outstanding_amount: newOutstandingAmount
      })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Failed to update subscription:', updateError)
      return NextResponse.json({ error: 'Failed to confirm funding' }, { status: 500 })
    }

    // Get deal name for notification
    const dealName = (subscription.deals as any)?.name || 'Unknown Deal'

    // Create notification for CEO/staff_admin users
    const { data: staffAdmins } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['ceo', 'staff_admin'])

    if (staffAdmins && staffAdmins.length > 0) {
      const notifications = staffAdmins.map(admin => ({
        user_id: admin.id,
        investor_id: null,
        title: 'Escrow Funding Confirmed',
        message: `Lawyer confirmed ${amount.toLocaleString()} ${subscription.currency || 'USD'} received for ${dealName}. Status: ${newStatus}`,
        link: `/versotech_main/deals/${subscription.deal_id}`
      }))

      await supabase.from('investor_notifications').insert(notifications)
    }

    // === NOTIFY ARRANGER USERS ===
    // Get the deal's arranger entity
    const { data: dealWithArranger } = await supabase
      .from('deals')
      .select('arranger_entity_id')
      .eq('id', subscription.deal_id)
      .single()

    if (dealWithArranger?.arranger_entity_id) {
      // Get all users linked to this arranger
      const { data: arrangerUsers } = await supabase
        .from('arranger_users')
        .select('user_id')
        .eq('arranger_id', dealWithArranger.arranger_entity_id)

      if (arrangerUsers && arrangerUsers.length > 0) {
        const arrangerNotifications = arrangerUsers.map((au: any) => ({
          user_id: au.user_id,
          investor_id: null,  // Important: null for non-investor personas
          title: 'Escrow Funding Confirmed',
          message: `${amount.toLocaleString()} ${subscription.currency || 'USD'} confirmed for ${dealName}. Status: ${newStatus}`,
          link: `/versotech_main/my-mandates/${subscription.deal_id}`,
          deal_id: subscription.deal_id,
          type: 'deal'
        }))

        await supabase.from('investor_notifications').insert(arrangerNotifications)
      }
    }

    // NOTE: Introducer commission creation is now handled at DEAL CLOSE
    // See: src/lib/deals/deal-close-handler.ts
    // This ensures commissions are only created after the deal officially closes,
    // not just when funding is received (per Fred's requirements 2024)

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.SUBSCRIPTIONS,
      entity_id: subscriptionId,
      metadata: {
        event: 'escrow_funding_confirmed',
        amount_confirmed: amount,
        bank_reference,
        confirmation_notes,
        previous_funded: currentFunded,
        new_funded: newFundedAmount,
        new_status: newStatus,
        lawyer_id: lawyerUser.lawyer_id
      }
    })

    const remainingAfter = commitment > 0 ? Math.max(commitment - newFundedAmount, 0) : 0

    return NextResponse.json({
      success: true,
      data: {
        subscription_id: subscriptionId,
        amount_confirmed: amount,
        total_funded: newFundedAmount,
        commitment: commitment,
        status: newStatus,
        message: commitment > 0 && newStatus === 'active'
          ? 'Subscription is now fully funded and active'
          : `Funding confirmed. ${remainingAfter.toLocaleString()} remaining`
      }
    })

  } catch (error) {
    console.error('Confirm funding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
