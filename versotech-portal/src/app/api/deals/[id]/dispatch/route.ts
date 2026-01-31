import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const dispatchSchema = z.object({
  user_ids: z.array(z.string().uuid()).min(1, 'At least one user must be selected'),
  role: z.enum([
    'investor',
    'co_investor',
    'partner_investor',
    'introducer_investor',
    'commercial_partner_investor',
    'commercial_partner_proxy'
  ]).default('investor'),
  // Fee plan fields - required when dispatching investors through an entity
  referred_by_entity_id: z.string().uuid().optional(),
  referred_by_entity_type: z.enum(['partner', 'introducer', 'commercial_partner']).optional(),
  assigned_fee_plan_id: z.string().uuid().optional()
}).refine(
  // If referred_by_entity_id is provided, assigned_fee_plan_id must also be provided
  (data) => {
    if (data.referred_by_entity_id && !data.assigned_fee_plan_id) {
      return false
    }
    return true
  },
  {
    message: 'assigned_fee_plan_id is required when dispatching through an introducer/partner',
    path: ['assigned_fee_plan_id']
  }
)

/**
 * POST /api/deals/:id/dispatch
 * CEO/Staff dispatch users to a deal
 *
 * Creates deal_memberships with dispatched_at timestamp set.
 * This authorizes entity users (partners, introducers, etc.) to invest in the deal.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id
    })

    const hasCeoAccess = personas?.some(
      (p: { persona_type: string }) => p.persona_type === 'ceo'
    ) || false

    if (!hasCeoAccess) {
      return NextResponse.json({ error: 'Forbidden: CEO access required' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = dispatchSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { user_ids, role, referred_by_entity_id, referred_by_entity_type, assigned_fee_plan_id } = validation.data

    // Fee plan validation: If dispatching through an entity, verify fee plan is accepted
    if (referred_by_entity_id && assigned_fee_plan_id) {
      // Build entity filter based on type
      const entityFilter = referred_by_entity_type === 'partner'
        ? { partner_id: referred_by_entity_id }
        : referred_by_entity_type === 'introducer'
          ? { introducer_id: referred_by_entity_id }
          : { commercial_partner_id: referred_by_entity_id }

      // Verify the fee plan exists, is accepted, and belongs to the correct entity
      const { data: feePlan, error: feePlanError } = await serviceSupabase
        .from('fee_plans')
        .select('id, status, is_active, partner_id, introducer_id, commercial_partner_id')
        .eq('id', assigned_fee_plan_id)
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
          message: statusMessages[feePlan.status] || `The fee plan status is '${feePlan.status}'. Only accepted fee plans can be used for dispatch.`
        }, { status: 400 })
      }
    }

    // For introducer_investor role, verify all users have valid introducer agreements
    if (role === 'introducer_investor') {
      // Get introducer links for users being dispatched
      const { data: introducerLinks } = await serviceSupabase
        .from('introducer_users')
        .select('user_id, introducer_id')
        .in('user_id', user_ids)

      if (introducerLinks && introducerLinks.length > 0) {
        const introducerIds = [...new Set(introducerLinks.map(l => l.introducer_id))]

        // Check for valid signed agreements
        const today = new Date().toISOString().split('T')[0]
        const { data: validAgreements } = await serviceSupabase
          .from('introducer_agreements')
          .select('introducer_id, signed_date, expiry_date, status')
          .in('introducer_id', introducerIds)
          .eq('status', 'active')
          .not('signed_date', 'is', null)
          .or(`expiry_date.is.null,expiry_date.gte.${today}`)

        const introducersWithValidAgreement = new Set(
          (validAgreements || []).map(a => a.introducer_id)
        )

        // Find users whose introducer lacks valid agreement
        const usersWithoutValidAgreement = introducerLinks
          .filter(l => !introducersWithValidAgreement.has(l.introducer_id))
          .map(l => l.user_id)

        if (usersWithoutValidAgreement.length > 0) {
          // Get names for error message
          const { data: profiles } = await serviceSupabase
            .from('profiles')
            .select('id, display_name')
            .in('id', usersWithoutValidAgreement)

          const names = (profiles || []).map(p => p.display_name).join(', ')

          return NextResponse.json({
            error: 'Introducer agreement required',
            message: `Cannot dispatch users without signed introducer agreement: ${names}. The introducer must sign a fee agreement before being authorized to introduce investors to deals.`,
            users_blocked: usersWithoutValidAgreement
          }, { status: 400 })
        }
      }
    }

    // Verify deal exists
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select('id, name, status')
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Check deal status allows dispatching
    if (deal.status === 'closed' || deal.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot dispatch to a closed or cancelled deal' },
        { status: 400 }
      )
    }

    // Get existing memberships to avoid duplicates
    const { data: existingMemberships } = await serviceSupabase
      .from('deal_memberships')
      .select('user_id')
      .eq('deal_id', dealId)
      .in('user_id', user_ids)

    const existingUserIds = new Set((existingMemberships || []).map(m => m.user_id))
    const newUserIds = user_ids.filter(id => !existingUserIds.has(id))

    if (newUserIds.length === 0) {
      return NextResponse.json(
        { error: 'All selected users are already members of this deal' },
        { status: 400 }
      )
    }

    // Get user profiles and investor links for the new users
    const { data: userProfiles } = await serviceSupabase
      .from('profiles')
      .select('id, email, display_name')
      .in('id', newUserIds)

    // Get investor_id for users who are investors
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('user_id, investor_id')
      .in('user_id', newUserIds)

    const investorIdMap = new Map(
      (investorLinks || []).map(l => [l.user_id, l.investor_id])
    )

    // MODE 1: For commercial_partner_investor role, auto-create investor records if needed
    if (role === 'commercial_partner_investor') {
      const nowTs = new Date().toISOString()
      // Get CP users that don't have investor links
      const usersWithoutInvestorId = newUserIds.filter(uid => !investorIdMap.has(uid))

      if (usersWithoutInvestorId.length > 0) {
        // Get commercial partner data for these users
        const { data: cpUsers } = await serviceSupabase
          .from('commercial_partner_users')
          .select(`
            user_id,
            commercial_partner_id,
            commercial_partner:commercial_partner_id (
              id,
              legal_name,
              display_name,
              email,
              type,
              address_line_1,
              city,
              country,
              postal_code,
              kyc_status
            )
          `)
          .in('user_id', usersWithoutInvestorId)

        // Create investor records for each CP
        for (const cpUser of cpUsers || []) {
          const cp = cpUser.commercial_partner as any
          if (!cp) continue

          // Check if CP already has an investor record (avoid duplicates)
          const { data: existingInvestor } = await serviceSupabase
            .from('investors')
            .select('id')
            .eq('commercial_partner_id', cp.id)
            .maybeSingle()

          let investorId: string

          if (existingInvestor) {
            investorId = existingInvestor.id
          } else {
            // Create new investor record from CP data
            const { data: newInvestor, error: createInvestorError } = await serviceSupabase
              .from('investors')
              .insert({
                type: 'entity',
                legal_name: cp.legal_name || cp.display_name,
                display_name: cp.display_name || cp.legal_name,
                email: cp.email,
                address_line_1: cp.address_line_1,
                city: cp.city,
                country: cp.country,
                postal_code: cp.postal_code,
                kyc_status: cp.kyc_status === 'approved' ? 'verified' : 'pending',
                commercial_partner_id: cp.id, // Link back to CP
                created_at: nowTs,
                updated_at: nowTs
              })
              .select('id')
              .single()

            if (createInvestorError || !newInvestor) {
              console.error('Failed to create investor for CP:', createInvestorError)
              continue
            }

            investorId = newInvestor.id
          }

          // Create investor_users link
          const { data: existingLink } = await serviceSupabase
            .from('investor_users')
            .select('user_id')
            .eq('user_id', cpUser.user_id)
            .eq('investor_id', investorId)
            .maybeSingle()

          if (!existingLink) {
            await serviceSupabase
              .from('investor_users')
              .insert({
                user_id: cpUser.user_id,
                investor_id: investorId,
                role: 'signatory',
                is_primary: true,
                created_at: nowTs
              })
          }

          // Update the map with the new investor ID
          investorIdMap.set(cpUser.user_id, investorId)
        }
      }
    }

    // Filter out blacklisted investors
    const blockedUserIds: string[] = []
    const investorIdsForStatus = [...new Set((investorLinks || [])
      .map(link => link.investor_id)
      .filter(Boolean))]

    if (investorIdsForStatus.length > 0) {
      const { data: investorStatuses } = await serviceSupabase
        .from('investors')
        .select('id, status, account_approval_status')
        .in('id', investorIdsForStatus)

      const blockedInvestorIds = new Set(
        (investorStatuses || [])
          .filter(record => {
            const investorStatus = record.status?.toLowerCase()
            const approvalStatus = record.account_approval_status?.toLowerCase()
            return investorStatus === 'unauthorized' ||
              investorStatus === 'blacklisted' ||
              approvalStatus === 'unauthorized'
          })
          .map(record => record.id)
      )

      blockedUserIds.push(
        ...(investorLinks || [])
          .filter(link => blockedInvestorIds.has(link.investor_id))
          .map(link => link.user_id)
      )
    }

    const dispatchUserIds = blockedUserIds.length > 0
      ? newUserIds.filter(id => !blockedUserIds.includes(id))
      : newUserIds

    if (dispatchUserIds.length === 0) {
      return NextResponse.json(
        {
          error: 'Cannot dispatch blacklisted users',
          users_blocked: blockedUserIds
        },
        { status: 400 }
      )
    }

    // Create memberships
    const now = new Date().toISOString()
    const membershipsToCreate = dispatchUserIds.map(userId => ({
      deal_id: dealId,
      user_id: userId,
      investor_id: investorIdMap.get(userId) || null,
      role,
      invited_by: user.id,
      invited_at: now,
      dispatched_at: now, // Key field that authorizes entity users
      // Fee plan linkage - set when dispatching through an introducer/partner
      referred_by_entity_id: referred_by_entity_id || null,
      referred_by_entity_type: referred_by_entity_type || null,
      assigned_fee_plan_id: assigned_fee_plan_id || null
    }))

    const { data: createdMemberships, error: createError } = await serviceSupabase
      .from('deal_memberships')
      .insert(membershipsToCreate)
      .select()

    if (createError) {
      console.error('Error creating memberships:', createError)
      return NextResponse.json(
        { error: 'Failed to dispatch users to deal' },
        { status: 500 }
      )
    }

    // Log audit event
    await serviceSupabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'deal_dispatch',
        entity_type: 'deal',
        entity_id: dealId,
        details: {
          dispatched_users: dispatchUserIds,
          role,
          skipped_existing: user_ids.length - newUserIds.length,
          skipped_blacklisted: blockedUserIds,
          deal_name: deal.name,
          // Fee plan linkage audit trail
          referred_by_entity_id: referred_by_entity_id || null,
          referred_by_entity_type: referred_by_entity_type || null,
          assigned_fee_plan_id: assigned_fee_plan_id || null
        },
        created_at: now
      })

    // TODO: Send notifications to dispatched users
    // This could trigger an n8n workflow or send emails directly

    return NextResponse.json({
      success: true,
      dispatched_count: dispatchUserIds.length,
      skipped_count: user_ids.length - newUserIds.length,
      blocked_count: blockedUserIds.length,
      users_blocked: blockedUserIds,
      memberships: createdMemberships
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/deals/:id/dispatch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/deals/:id/dispatch
 * Get dispatch status and available users for a deal
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id
    })

    const hasCeoAccess = personas?.some(
      (p: { persona_type: string }) => p.persona_type === 'ceo'
    ) || false

    if (!hasCeoAccess) {
      return NextResponse.json({ error: 'Forbidden: CEO access required' }, { status: 403 })
    }

    // Get current memberships
    const { data: memberships } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        user_id,
        role,
        dispatched_at,
        profiles:user_id (
          id,
          display_name,
          email
        )
      `)
      .eq('deal_id', dealId)

    // Get available users not in the deal
    const existingUserIds = (memberships || []).map(m => m.user_id)

    let { data: availableUsers } = await serviceSupabase
      .from('profiles')
      .select('id, display_name, email, role')
      .in('role', ['investor', 'partner', 'introducer', 'commercial_partner', 'lawyer', 'multi_persona'])
      .not('id', 'in', existingUserIds.length > 0 ? `(${existingUserIds.join(',')})` : '()')
      .order('display_name')

    if (availableUsers && availableUsers.length > 0) {
      const availableUserIds = availableUsers.map(user => user.id)
      const { data: investorLinks } = await serviceSupabase
        .from('investor_users')
        .select('user_id, investor_id')
        .in('user_id', availableUserIds)

      const investorIds = [...new Set((investorLinks || [])
        .map(link => link.investor_id)
        .filter(Boolean))]

      if (investorIds.length > 0) {
        const { data: investorStatuses } = await serviceSupabase
          .from('investors')
          .select('id, status, account_approval_status')
          .in('id', investorIds)

        const blockedInvestorIds = new Set(
          (investorStatuses || [])
            .filter(record => {
              const investorStatus = record.status?.toLowerCase()
              const approvalStatus = record.account_approval_status?.toLowerCase()
              return investorStatus === 'unauthorized' ||
                investorStatus === 'blacklisted' ||
                approvalStatus === 'unauthorized'
            })
            .map(record => record.id)
        )

        const blockedUserIds = new Set(
          (investorLinks || [])
            .filter(link => blockedInvestorIds.has(link.investor_id))
            .map(link => link.user_id)
        )

        availableUsers = availableUsers.filter(user => !blockedUserIds.has(user.id))
      }
    }

    return NextResponse.json({
      deal_id: dealId,
      current_members: memberships || [],
      available_users: availableUsers || []
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/deals/:id/dispatch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
