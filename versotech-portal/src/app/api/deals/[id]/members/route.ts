import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { createInvestorNotification } from '@/lib/notifications'

const addMemberSchema = z.object({
  user_id: z.string().uuid().optional(),
  investor_id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  role: z.enum([
    'investor',
    'co_investor',
    'partner_investor',
    'introducer_investor',
    'commercial_partner_investor',
    'spouse',
    'advisor',
    'lawyer',
    'banker',
    'introducer',
    'viewer',
    'verso_staff'
  ]),
  send_notification: z.boolean().default(true),
  // Referral tracking - who referred this investor to the deal
  referred_by_entity_id: z.string().uuid().optional(),
  referred_by_entity_type: z.enum(['partner', 'introducer', 'commercial_partner']).optional(),
  // Fee plan linkage - required when dispatching through an entity
  assigned_fee_plan_id: z.string().uuid().optional(),
  // Term sheet assignment - determines which fee structure investor sees
  term_sheet_id: z.string().uuid().optional()
}).refine(
  (data) => data.user_id || data.investor_id || data.email,
  { message: 'Must provide user_id, investor_id, or email' }
).refine(
  (data) => {
    // If one referral field is provided, both must be provided
    const hasEntityId = !!data.referred_by_entity_id
    const hasEntityType = !!data.referred_by_entity_type
    return hasEntityId === hasEntityType
  },
  { message: 'Both referred_by_entity_id and referred_by_entity_type must be provided together' }
).refine(
  (data) => {
    // If referred_by_entity_id is provided, assigned_fee_plan_id must also be provided
    if (data.referred_by_entity_id && !data.assigned_fee_plan_id) {
      return false
    }
    return true
  },
  {
    message: 'assigned_fee_plan_id is required when adding member through an introducer/partner',
    path: ['assigned_fee_plan_id']
  }
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: dealId } = await params

    // Fetch members with referrer, fee plan, and term sheet info
    const { data: members, error } = await supabase
      .from('deal_memberships')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        investors:investor_id (
          id,
          legal_name,
          type
        ),
        invited_by_profile:invited_by (
          display_name,
          email
        ),
        assigned_fee_plan:assigned_fee_plan_id (
          id,
          name,
          status,
          introducer:introducer_id (id, legal_name, display_name),
          partner:partner_id (id, name, legal_name),
          commercial_partner:commercial_partner_id (id, name, legal_name)
        ),
        assigned_term_sheet:term_sheet_id (
          id,
          version,
          status,
          subscription_fee_percent,
          management_fee_percent,
          carried_interest_percent
        )
      `)
      .eq('deal_id', dealId)
      .order('invited_at', { ascending: false })

    if (error) {
      console.error('Fetch members error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    return NextResponse.json({ members: members || [] })

  } catch (error) {
    console.error('API /deals/[id]/members GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const regularSupabase = await createClient()
    
    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id: dealId } = await params

    // Check deal status allows adding participants — only open/allocation_pending deals
    const { data: deal, error: dealFetchError } = await supabase
      .from('deals')
      .select('id, status')
      .eq('id', dealId)
      .single()

    if (dealFetchError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const dispatchableStatuses = ['open', 'allocation_pending']
    if (!dispatchableStatuses.includes(deal.status)) {
      return NextResponse.json(
        { error: `Cannot add participants when deal status is "${deal.status}". Change the deal status to "Open" first.` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = addMemberSchema.parse(body)

    // Resolve user_id from email or investor_id if not provided directly
    let resolvedUserId = validatedData.user_id
    let resolvedInvestorId = validatedData.investor_id

    if (!resolvedUserId) {
      if (validatedData.email) {
        // Find user by email
        const { data: userByEmail } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', validatedData.email)
          .single()

        if (!userByEmail) {
          return NextResponse.json(
            { error: 'User not found with provided email' },
            { status: 404 }
          )
        }

        resolvedUserId = userByEmail.id

        // Auto-populate investor_id if user has an investor profile
        // This ensures investor portal access works correctly even when staff adds by email
        const { data: investorLink } = await supabase
          .from('investor_users')
          .select('investor_id')
          .eq('user_id', resolvedUserId)
          .maybeSingle()

        if (investorLink) {
          resolvedInvestorId = investorLink.investor_id
        }
      } else if (validatedData.investor_id) {
        // Find primary user for investor
        const { data: investorUser } = await supabase
          .from('investor_users')
          .select('user_id')
          .eq('investor_id', validatedData.investor_id)
          .limit(1)
          .single()

        if (!investorUser) {
          return NextResponse.json(
            { error: 'No user found for provided investor' },
            { status: 404 }
          )
        }

        resolvedUserId = investorUser.user_id
        resolvedInvestorId = validatedData.investor_id
      }
    }

    if (!resolvedUserId) {
      return NextResponse.json(
        { error: 'Could not resolve user' },
        { status: 400 }
      )
    }

    // Fee plan validation: If adding through an entity, verify fee plan is accepted
    if (validatedData.referred_by_entity_id && validatedData.assigned_fee_plan_id) {
      // Build entity filter based on type
      const entityFilter = validatedData.referred_by_entity_type === 'partner'
        ? { partner_id: validatedData.referred_by_entity_id }
        : validatedData.referred_by_entity_type === 'introducer'
          ? { introducer_id: validatedData.referred_by_entity_id }
          : { commercial_partner_id: validatedData.referred_by_entity_id }

      // Verify the fee plan exists, is accepted, and belongs to the correct entity
      const { data: feePlan, error: feePlanError } = await supabase
        .from('fee_plans')
        .select('id, status, is_active, partner_id, introducer_id, commercial_partner_id')
        .eq('id', validatedData.assigned_fee_plan_id)
        .eq('deal_id', dealId)
        .match(entityFilter)
        .single()

      if (feePlanError || !feePlan) {
        return NextResponse.json({
          error: 'Invalid fee plan',
          message: 'The selected fee plan does not exist or does not belong to the specified entity for this deal.'
        }, { status: 400 })
      }

      if (!feePlan.is_active) {
        return NextResponse.json({
          error: 'Fee plan inactive',
          message: 'The selected fee plan is no longer active. Please select a different fee plan.'
        }, { status: 400 })
      }

      if (feePlan.status !== 'accepted') {
        const statusMessages: Record<string, string> = {
          draft: 'The fee plan has not been sent to the entity yet. Please send it for approval first.',
          sent: 'The fee plan has been sent but not yet accepted. Please wait for the entity to approve it.',
          rejected: 'The fee plan was rejected by the entity. Please create and send a new fee plan.',
          pending_signature: 'The fee plan is pending signature. Please wait for the signing process to complete.'
        }
        return NextResponse.json({
          error: 'Fee plan not accepted',
          message: statusMessages[feePlan.status] || `The fee plan status is '${feePlan.status}'. Only accepted fee plans can be used.`
        }, { status: 400 })
      }
    }

    // Term sheet validation: If provided, verify it exists and is published
    if (validatedData.term_sheet_id) {
      const { data: termSheet, error: termSheetError } = await supabase
        .from('deal_fee_structures')
        .select('id, status')
        .eq('id', validatedData.term_sheet_id)
        .eq('deal_id', dealId)
        .single()

      if (termSheetError || !termSheet) {
        return NextResponse.json({
          error: 'Invalid term sheet',
          message: 'The selected term sheet does not exist for this deal.'
        }, { status: 400 })
      }

      if (termSheet.status !== 'published') {
        return NextResponse.json({
          error: 'Term sheet not published',
          message: 'Only published term sheets can be assigned to investors.'
        }, { status: 400 })
      }
    }

    // Check if membership already exists
    const { data: existingMember } = await supabase
      .from('deal_memberships')
      .select('deal_id, user_id')
      .eq('deal_id', dealId)
      .eq('user_id', resolvedUserId)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this deal' },
        { status: 409 }
      )
    }

    // Create membership
    // Auto-accept when staff explicitly adds existing users
    const { data: membership, error } = await supabase
      .from('deal_memberships')
      .insert({
        deal_id: dealId,
        user_id: resolvedUserId,
        investor_id: resolvedInvestorId,
        role: validatedData.role,
        invited_by: user.id,
        accepted_at: new Date().toISOString(), // Auto-accept for staff-added members
        // Referral tracking - who referred this investor to the deal
        referred_by_entity_id: validatedData.referred_by_entity_id || null,
        referred_by_entity_type: validatedData.referred_by_entity_type || null,
        // Fee plan linkage - required when dispatching through an entity
        assigned_fee_plan_id: validatedData.assigned_fee_plan_id || null,
        // Term sheet assignment - determines which fee structure investor sees
        term_sheet_id: validatedData.term_sheet_id || null
      })
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        investors:investor_id (
          id,
          legal_name
        )
      `)
      .single()

    if (error) {
      console.error('Create membership error:', error)
      return NextResponse.json(
        { error: 'Failed to add member' },
        { status: 500 }
      )
    }

    // Send notification if requested
    if (validatedData.send_notification && resolvedUserId) {
      try {
        // Get deal name for notification
        const { data: deal } = await supabase
          .from('deals')
          .select('name')
          .eq('id', dealId)
          .single()

        const dealName = deal?.name || 'a deal'

        await createInvestorNotification({
          userId: resolvedUserId,
          investorId: resolvedInvestorId ?? undefined,
          title: 'Deal Invitation',
          message: `You've been invited to view ${dealName}. Review the deal details and data room.`,
          link: `/versotech_main/opportunities/${dealId}`,
          type: 'deal_invite',
          extraMetadata: {
            deal_id: dealId,
            role: validatedData.role,
            invited_by: user.id
          }
        })
      } catch (notificationError) {
        console.error('[deal-members] Failed to send notification:', notificationError)
      }
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'deal_memberships',
      entity_id: dealId,
      metadata: {
        added_user_id: resolvedUserId,
        role: validatedData.role,
        investor_id: resolvedInvestorId,
        referred_by_entity_id: validatedData.referred_by_entity_id || null,
        referred_by_entity_type: validatedData.referred_by_entity_type || null,
        assigned_fee_plan_id: validatedData.assigned_fee_plan_id || null,
        term_sheet_id: validatedData.term_sheet_id || null
      }
    })

    return NextResponse.json({ membership }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/members POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
