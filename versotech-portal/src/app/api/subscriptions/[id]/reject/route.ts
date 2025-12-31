/**
 * Subscription Pack Rejection API
 * POST /api/subscriptions/[id]/reject
 *
 * Allows staff/arrangers to reject a subscription pack and notify relevant parties
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { z } from 'zod'

const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(1000),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subscriptionId } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff or arranger
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'

    // Check if user is an arranger
    const { data: arrangerUser } = await supabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!isStaff && !arrangerUser) {
      return NextResponse.json({ error: 'Staff or arranger access required' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = rejectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 })
    }

    const { reason, notes } = validation.data

    // Get subscription details
    const { data: subscription, error: subError } = await serviceSupabase
      .from('subscriptions')
      .select(`
        id,
        deal_id,
        investor_id,
        status,
        commitment,
        currency,
        investors (id, display_name, legal_name),
        deals (id, name, arranger_entity_id)
      `)
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // If arranger, verify they own this deal
    if (arrangerUser && !isStaff) {
      const dealArrangerId = (subscription.deals as any)?.arranger_entity_id
      if (dealArrangerId !== arrangerUser.arranger_id) {
        return NextResponse.json({ error: 'Not authorized for this subscription' }, { status: 403 })
      }
    }

    // Check if subscription can be rejected (must be in pending/committed state)
    const rejectableStatuses = ['pending', 'committed', 'pending_signature']
    if (!rejectableStatuses.includes(subscription.status)) {
      return NextResponse.json({
        error: `Cannot reject subscription with status: ${subscription.status}`,
        details: `Subscription must be in one of these statuses: ${rejectableStatuses.join(', ')}`
      }, { status: 400 })
    }

    // Update subscription status to rejected
    const { error: updateError } = await serviceSupabase
      .from('subscriptions')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejection_notes: notes || null,
        rejected_at: new Date().toISOString(),
        rejected_by: user.id,
      })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Failed to reject subscription:', updateError)
      return NextResponse.json({ error: 'Failed to reject subscription' }, { status: 500 })
    }

    const investorName = (subscription.investors as any)?.display_name ||
                         (subscription.investors as any)?.legal_name || 'Investor'
    const dealName = (subscription.deals as any)?.name || 'the deal'
    const arrangerEntityId = (subscription.deals as any)?.arranger_entity_id

    // Notify arranger users (if rejection was by staff)
    if (isStaff && arrangerEntityId) {
      const { data: arrangerUsers } = await serviceSupabase
        .from('arranger_users')
        .select('user_id')
        .eq('arranger_id', arrangerEntityId)

      if (arrangerUsers && arrangerUsers.length > 0) {
        const arrangerNotifications = arrangerUsers.map((au: { user_id: string }) => ({
          user_id: au.user_id,
          investor_id: null,
          title: 'Subscription Pack Rejected',
          message: `${investorName}'s subscription for ${dealName} was rejected. Reason: ${reason}`,
          link: `/versotech_main/my-mandates/${subscription.deal_id}`,
        }))

        await serviceSupabase.from('investor_notifications').insert(arrangerNotifications)
      }
    }

    // Notify investor
    const { data: investorUsers } = await serviceSupabase
      .from('investor_users')
      .select('user_id')
      .eq('investor_id', subscription.investor_id)

    if (investorUsers && investorUsers.length > 0) {
      const investorNotifications = investorUsers.map((iu: { user_id: string }) => ({
        user_id: iu.user_id,
        investor_id: subscription.investor_id,
        title: 'Subscription Rejected',
        message: `Your subscription for ${dealName} has been rejected. Reason: ${reason}`,
        link: `/versotech_main/portfolio`,
      }))

      await serviceSupabase.from('investor_notifications').insert(investorNotifications)
    }

    // Notify staff admins (if rejection was by arranger)
    if (arrangerUser && !isStaff) {
      const { data: staffAdmins } = await serviceSupabase
        .from('profiles')
        .select('id')
        .in('role', ['ceo', 'staff_admin'])
        .limit(10)

      if (staffAdmins && staffAdmins.length > 0) {
        const staffNotifications = staffAdmins.map((admin: { id: string }) => ({
          user_id: admin.id,
          investor_id: null,
          title: 'Subscription Rejected by Arranger',
          message: `${investorName}'s subscription for ${dealName} was rejected by arranger. Reason: ${reason}`,
          link: `/versotech_main/deals/${subscription.deal_id}`,
        }))

        await serviceSupabase.from('investor_notifications').insert(staffNotifications)
      }
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.SUBSCRIPTIONS,
      entity_id: subscriptionId,
      metadata: {
        event: 'subscription_rejected',
        reason,
        notes,
        previous_status: subscription.status,
        rejected_by_role: isStaff ? 'staff' : 'arranger',
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        subscription_id: subscriptionId,
        status: 'rejected',
        reason,
        message: `Subscription for ${investorName} has been rejected`,
      }
    })

  } catch (error) {
    console.error('Reject subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
