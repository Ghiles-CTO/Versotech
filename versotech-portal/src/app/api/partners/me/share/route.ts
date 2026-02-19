import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * POST /api/partners/me/share
 *
 * PRD Rows 95-96: Partner shares deal with investor
 *
 * Row 95: Share to INVESTOR only
 * Row 96: Share to INVESTOR + INTRODUCER (co-referral)
 *
 * Creates deal_membership with referral tracking and dispatches the investor to the deal.
 * Automatically applies the partner's fee model.
 */

const shareSchema = z.object({
  deal_id: z.string().uuid('Invalid deal ID'),
  investor_id: z.string().uuid('Invalid investor ID'),
  introducer_id: z.string().uuid('Invalid introducer ID').optional().nullable()
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a partner
    const { data: partnerUser, error: partnerUserError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (partnerUserError) {
      console.error('[share] Partner lookup error:', partnerUserError)
      return NextResponse.json({ error: 'Failed to verify partner status' }, { status: 500 })
    }

    if (!partnerUser?.partner_id) {
      return NextResponse.json({ error: 'Forbidden: Partner access required' }, { status: 403 })
    }

    const partnerId = partnerUser.partner_id

    // Parse and validate request body
    const body = await request.json()
    const validation = shareSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { deal_id, investor_id, introducer_id } = validation.data

    // Verify deal exists and is open
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select('id, name, status, vehicle_id')
      .eq('id', deal_id)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const dispatchableStatuses = ['open', 'allocation_pending']
    if (!dispatchableStatuses.includes(deal.status)) {
      return NextResponse.json(
        { error: `Cannot share a deal when status is "${deal.status}". The deal must be Open.` },
        { status: 400 }
      )
    }

    // Verify partner has access to this deal
    const { data: partnerMembership, error: partnerMembershipError } = await serviceSupabase
      .from('deal_memberships')
      .select('deal_id')
      .eq('deal_id', deal_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (partnerMembershipError || !partnerMembership) {
      return NextResponse.json(
        { error: 'You do not have access to share this deal' },
        { status: 403 }
      )
    }

    // Verify investor exists
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('id, legal_name, display_name, email')
      .eq('id', investor_id)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    // Check if investor already has membership for this deal
    const { data: existingMembership, error: existingError } = await serviceSupabase
      .from('deal_memberships')
      .select('deal_id, investor_id')
      .eq('deal_id', deal_id)
      .eq('investor_id', investor_id)
      .maybeSingle()

    if (existingMembership) {
      return NextResponse.json(
        { error: 'This investor already has access to this deal' },
        { status: 400 }
      )
    }

    // Get investor's user(s) to create membership
    const { data: investorUsers, error: investorUsersError } = await serviceSupabase
      .from('investor_users')
      .select('user_id')
      .eq('investor_id', investor_id)

    if (investorUsersError) {
      console.error('[share] Error fetching investor users:', investorUsersError)
      return NextResponse.json(
        { error: 'Failed to find investor users' },
        { status: 500 }
      )
    }

    if (!investorUsers || investorUsers.length === 0) {
      return NextResponse.json(
        { error: 'Investor has no linked user accounts' },
        { status: 400 }
      )
    }

    // Verify introducer if provided (PRD Row 96)
    let introducerName: string | null = null
    if (introducer_id) {
      const { data: introducer, error: introducerError } = await serviceSupabase
        .from('introducers')
        .select('id, name')
        .eq('id', introducer_id)
        .single()

      if (introducerError || !introducer) {
        return NextResponse.json({ error: 'Introducer not found' }, { status: 404 })
      }
      introducerName = introducer.name
    }

    const now = new Date().toISOString()

    // Create deal_membership for each investor user
    const membershipsToCreate = investorUsers.map(iu => ({
      deal_id,
      user_id: iu.user_id,
      investor_id,
      role: 'investor', // Standard investor role
      referred_by_entity_type: 'partner',
      referred_by_entity_id: partnerId,
      co_referrer_entity_type: introducer_id ? 'introducer' : null,
      co_referrer_entity_id: introducer_id || null,
      invited_by: user.id,
      invited_at: now,
      dispatched_at: now // Key field - authorizes investor to view the deal
    }))

    const { data: createdMemberships, error: createError } = await serviceSupabase
      .from('deal_memberships')
      .insert(membershipsToCreate)
      .select()

    if (createError) {
      console.error('[share] Error creating memberships:', createError)
      return NextResponse.json(
        { error: 'Failed to share deal with investor' },
        { status: 500 }
      )
    }

    // Get partner info for notification
    const { data: partnerInfo } = await serviceSupabase
      .from('partners')
      .select('name')
      .eq('id', partnerId)
      .single()

    // Create notifications for investor users
    const investorNotifications = investorUsers.map(iu => ({
      user_id: iu.user_id,
      investor_id,
      deal_id,
      type: 'deal_shared',
      title: 'New Investment Opportunity',
      message: `${partnerInfo?.name || 'A partner'} has shared "${deal.name}" with you.`,
      link: `/versotech_main/opportunities/${deal_id}`,
      created_at: now
      // read_at is null by default (unread)
    }))

    const { error: notifError } = await serviceSupabase
      .from('investor_notifications')
      .insert(investorNotifications)

    if (notifError) {
      console.warn('[share] Failed to create investor notifications:', notifError)
      // Don't fail the request, just log it
    }

    // Notify staff/arrangers about the share (for tracking)
    await serviceSupabase
      .from('notifications')
      .insert({
        user_id: null, // Will be picked up by all staff
        type: 'partner_deal_share',
        title: 'Partner Shared Deal',
        message: `${partnerInfo?.name || 'Partner'} shared "${deal.name}" with ${investor.display_name || investor.legal_name}${introducerName ? ` (co-referred with ${introducerName})` : ''}.`,
        data: {
          deal_id,
          investor_id,
          partner_id: partnerId,
          introducer_id: introducer_id || null
        },
        read: false
      })

    // Log audit event
    await serviceSupabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'partner_share_deal',
        entity_type: 'deal_membership',
        entity_id: deal_id,
        details: {
          deal_id,
          deal_name: deal.name,
          investor_id,
          investor_name: investor.display_name || investor.legal_name,
          partner_id: partnerId,
          introducer_id: introducer_id || null,
          memberships_created: createdMemberships?.length || 0
        },
        created_at: now
      })

    return NextResponse.json({
      success: true,
      message: 'Deal shared successfully',
      investor_name: investor.display_name || investor.legal_name,
      deal_name: deal.name,
      memberships_created: createdMemberships?.length || 0
    })

  } catch (error) {
    console.error('Unexpected error in POST /api/partners/me/share:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
