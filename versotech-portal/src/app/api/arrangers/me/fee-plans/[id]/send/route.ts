/**
 * Send Fee Plan to Entity API
 * POST /api/arrangers/me/fee-plans/[id]/send
 * Sends notification to the linked partner/introducer/commercial_partner
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/arrangers/me/fee-plans/[id]/send
 * Send fee plan to assigned entity - changes status to 'sent' and notifies entity users
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

    // Verify user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    // Get fee plan with ownership verification and entity info
    const { data: feePlan, error: fetchError } = await serviceSupabase
      .from('fee_plans')
      .select(`
        *,
        deal:deal_id (id, name)
      `)
      .eq('id', id)
      .eq('created_by_arranger_id', arrangerUser.arranger_id)
      .single()

    if (fetchError || !feePlan) {
      return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 })
    }

    // Must have an entity to send to
    if (!feePlan.partner_id && !feePlan.introducer_id && !feePlan.commercial_partner_id) {
      return NextResponse.json(
        { error: 'Fee plan must be assigned to an entity before sending' },
        { status: 400 }
      )
    }

    // Atomic update: Only update if status is still 'draft' (prevents race condition)
    const { data: updatedPlan, error: updateError } = await serviceSupabase
      .from('fee_plans')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .neq('status', 'sent')  // Only update if not already sent (atomic check)
      .select('id')

    if (updateError) {
      console.error('[fee-plans/send] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update fee plan status' }, { status: 500 })
    }

    // If no rows updated, the plan was already sent (race condition handled)
    if (!updatedPlan || updatedPlan.length === 0) {
      return NextResponse.json(
        { error: 'Fee plan has already been sent' },
        { status: 409 }
      )
    }

    // Find users to notify based on entity type
    let entityUsers: { user_id: string }[] = []
    let entityName = ''
    let entityType = ''

    if (feePlan.partner_id) {
      entityType = 'partner'
      // Get partner name with error handling
      const { data: partner, error: partnerError } = await serviceSupabase
        .from('partners')
        .select('name, display_name')
        .eq('id', feePlan.partner_id)
        .single()

      if (partnerError || !partner) {
        console.error('[fee-plans/send] Partner lookup error:', partnerError)
        return NextResponse.json(
          { error: 'Assigned partner no longer exists' },
          { status: 400 }
        )
      }
      entityName = partner.display_name || partner.name || 'Partner'

      // Get partner users
      const { data } = await serviceSupabase
        .from('partner_users')
        .select('user_id')
        .eq('partner_id', feePlan.partner_id)
      entityUsers = data || []
    } else if (feePlan.introducer_id) {
      entityType = 'introducer'
      // Get introducer name with error handling
      const { data: introducer, error: introducerError } = await serviceSupabase
        .from('introducers')
        .select('legal_name')
        .eq('id', feePlan.introducer_id)
        .single()

      if (introducerError || !introducer) {
        console.error('[fee-plans/send] Introducer lookup error:', introducerError)
        return NextResponse.json(
          { error: 'Assigned introducer no longer exists' },
          { status: 400 }
        )
      }
      entityName = introducer.legal_name || 'Introducer'

      // Get introducer users
      const { data } = await serviceSupabase
        .from('introducer_users')
        .select('user_id')
        .eq('introducer_id', feePlan.introducer_id)
      entityUsers = data || []
    } else if (feePlan.commercial_partner_id) {
      entityType = 'commercial_partner'
      // Get commercial partner name with error handling
      const { data: cp, error: cpError } = await serviceSupabase
        .from('commercial_partners')
        .select('name, legal_name')
        .eq('id', feePlan.commercial_partner_id)
        .single()

      if (cpError || !cp) {
        console.error('[fee-plans/send] Commercial partner lookup error:', cpError)
        return NextResponse.json(
          { error: 'Assigned commercial partner no longer exists' },
          { status: 400 }
        )
      }
      entityName = cp.name || cp.legal_name || 'Commercial Partner'

      // Get commercial partner users
      const { data } = await serviceSupabase
        .from('commercial_partner_users')
        .select('user_id')
        .eq('commercial_partner_id', feePlan.commercial_partner_id)
      entityUsers = data || []
    }

    // Create notifications for all entity users
    let notificationStatus: 'sent' | 'failed' | 'no_users' = 'no_users'

    if (entityUsers.length > 0) {
      const dealName = (feePlan.deal as any)?.name
      const notifications = entityUsers.map((eu) => ({
        user_id: eu.user_id,
        investor_id: null, // This is an entity notification, not investor
        title: 'New Fee Model Shared',
        message: `A fee model "${feePlan.name}" has been shared with you${dealName ? ` for opportunity: ${dealName}` : ''}.`,
        link: `/versotech_main/fee-plans?highlight=${id}`,
        type: 'system',
      }))

      const { error: notifError } = await serviceSupabase
        .from('investor_notifications')
        .insert(notifications)

      if (notifError) {
        // Log but don't fail - the fee plan was already marked as sent
        console.error('[fee-plans/send] Notification error:', notifError)
        notificationStatus = 'failed'
      } else {
        notificationStatus = 'sent'
      }
    } else {
      console.warn(`[fee-plans/send] No users to notify for ${entityType}:${feePlan[`${entityType}_id` as keyof typeof feePlan]}`)
    }

    // Success log for audit trail
    console.info(`[fee-plans/send] Fee plan ${id} sent by user ${user.id} to ${entityType}:${entityName}`)

    return NextResponse.json({
      success: true,
      message: entityUsers.length > 0
        ? `Fee plan sent to ${entityName}`
        : `Fee plan marked as sent but ${entityName} has no users to notify`,
      notified_users: entityUsers.length,
      notification_status: notificationStatus,
    })
  } catch (error) {
    console.error('[fee-plans/send] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
