import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { sendDealDispatchFanout } from '@/lib/deals/dispatch-fanout'
import {
  buildIntroducerCommercialBlockPayload,
  getIntroducerCommercialEligibility,
} from '@/lib/introducers/commercial-eligibility'
import {
  createOrResumeDealInvestmentCycle,
  LIVE_CYCLE_STATUSES,
} from '@/lib/deals/investment-cycles'

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
    const regularSupabase = await createClient()
    const serviceSupabase = createServiceClient()
    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(serviceSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id: dealId } = await params

    const { data: members, error } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        deal_id,
        user_id,
        investor_id,
        role,
        invited_at,
        accepted_at,
        dispatched_at,
        viewed_at,
        interest_confirmed_at,
        nda_signed_at,
        data_room_granted_at,
        invited_by,
        referred_by_entity_id,
        referred_by_entity_type,
        assigned_fee_plan_id,
        term_sheet_id,
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

    const memberships = members || []
    const feePlanIds = Array.from(
      new Set(memberships.map((member: any) => member.assigned_fee_plan_id).filter(Boolean))
    ) as string[]

    const feePlansResult = feePlanIds.length
      ? await serviceSupabase
          .from('fee_plans')
          .select(`
            id,
            name,
            status,
            term_sheet_id,
            introducer_id,
            partner_id,
            commercial_partner_id
          `)
          .in('id', feePlanIds)
      : { data: [], error: null }

    if (feePlansResult.error) {
      console.error('Fetch related member fee plans error:', feePlansResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch member fee plans' },
        { status: 500 }
      )
    }

    const rawFeePlans = (feePlansResult.data || []) as any[]
    const termSheetIds = Array.from(
      new Set([
        ...memberships.map((member: any) => member.term_sheet_id).filter(Boolean),
        ...rawFeePlans.map((feePlan: any) => feePlan.term_sheet_id).filter(Boolean),
      ])
    ) as string[]
    const partnerIds = Array.from(
      new Set([
        ...memberships
          .filter((member: any) => member.referred_by_entity_type === 'partner')
          .map((member: any) => member.referred_by_entity_id)
          .filter(Boolean),
        ...rawFeePlans.map((feePlan: any) => feePlan.partner_id).filter(Boolean),
      ])
    ) as string[]
    const introducerIds = Array.from(
      new Set([
        ...memberships
          .filter((member: any) => member.referred_by_entity_type === 'introducer')
          .map((member: any) => member.referred_by_entity_id)
          .filter(Boolean),
        ...rawFeePlans.map((feePlan: any) => feePlan.introducer_id).filter(Boolean),
      ])
    ) as string[]
    const commercialPartnerIds = Array.from(
      new Set([
        ...memberships
          .filter((member: any) => member.referred_by_entity_type === 'commercial_partner')
          .map((member: any) => member.referred_by_entity_id)
          .filter(Boolean),
        ...rawFeePlans.map((feePlan: any) => feePlan.commercial_partner_id).filter(Boolean),
      ])
    ) as string[]

    const [termSheetsResult, partnersResult, introducersResult, commercialPartnersResult] = await Promise.all([
      termSheetIds.length
        ? serviceSupabase
            .from('deal_fee_structures')
            .select(`
              id,
              version,
              status,
              term_sheet_date,
              published_at,
              issuer,
              vehicle,
              transaction_type,
              product_description,
              subscription_fee_percent,
              management_fee_percent,
              carried_interest_percent
            `)
            .in('id', termSheetIds)
        : Promise.resolve({ data: [], error: null }),
      partnerIds.length
        ? serviceSupabase
            .from('partners')
            .select('id, name, legal_name, contact_name, contact_email')
            .in('id', partnerIds)
        : Promise.resolve({ data: [], error: null }),
      introducerIds.length
        ? serviceSupabase
            .from('introducers')
            .select('id, display_name, legal_name, email')
            .in('id', introducerIds)
        : Promise.resolve({ data: [], error: null }),
      commercialPartnerIds.length
        ? serviceSupabase
            .from('commercial_partners')
            .select('id, name, legal_name, contact_name, contact_email')
            .in('id', commercialPartnerIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (termSheetsResult.error || partnersResult.error || introducersResult.error || commercialPartnersResult.error) {
      console.error('Fetch related member data error:', {
        termSheetsError: termSheetsResult.error,
        partnersError: partnersResult.error,
        introducersError: introducersResult.error,
        commercialPartnersError: commercialPartnersResult.error,
      })
      return NextResponse.json(
        { error: 'Failed to fetch member details' },
        { status: 500 }
      )
    }

    const partnersById = new Map(
      ((partnersResult.data || []) as any[]).map(partner => [partner.id, partner])
    )
    const introducersById = new Map(
      ((introducersResult.data || []) as any[]).map(introducer => [introducer.id, introducer])
    )
    const commercialPartnersById = new Map(
      ((commercialPartnersResult.data || []) as any[]).map(partner => [partner.id, partner])
    )
    const termSheetsById = new Map(
      ((termSheetsResult.data || []) as any[]).map(termSheet => [termSheet.id, termSheet])
    )

    const feePlansById = new Map(
      rawFeePlans.map(feePlan => [
        feePlan.id,
        {
          ...feePlan,
          term_sheet: feePlan.term_sheet_id ? termSheetsById.get(feePlan.term_sheet_id) || null : null,
          introducer: feePlan.introducer_id ? introducersById.get(feePlan.introducer_id) || null : null,
          partner: feePlan.partner_id ? partnersById.get(feePlan.partner_id) || null : null,
          commercial_partner: feePlan.commercial_partner_id
            ? commercialPartnersById.get(feePlan.commercial_partner_id) || null
            : null,
        }
      ])
    )

    const investorIds = Array.from(
      new Set(memberships.map((member: any) => member.investor_id).filter(Boolean))
    ) as string[]

    const memberCyclesResult = investorIds.length
      ? await serviceSupabase
          .from('deal_investment_cycles' as any)
          .select(`
            id,
            deal_id,
            investor_id,
            term_sheet_id,
            role,
            status,
            referred_by_entity_id,
            referred_by_entity_type,
            assigned_fee_plan_id,
            sequence_number
          `)
          .eq('deal_id', dealId)
          .in('investor_id', investorIds)
          .order('sequence_number', { ascending: false })
          .order('created_at', { ascending: false })
      : { data: [], error: null }

    if (memberCyclesResult.error) {
      console.error('Fetch member cycles error:', memberCyclesResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch member cycle details' },
        { status: 500 }
      )
    }

    const cyclesByInvestorId = new Map<string, any[]>()
    for (const cycle of (memberCyclesResult.data || []) as any[]) {
      const existing = cyclesByInvestorId.get(cycle.investor_id) || []
      existing.push(cycle)
      cyclesByInvestorId.set(cycle.investor_id, existing)
    }

    const enrichedMembers = memberships.map((member: any) => {
      const investorCycles = member.investor_id ? cyclesByInvestorId.get(member.investor_id) || [] : []
      const selectedCycle =
        investorCycles.find(cycle => LIVE_CYCLE_STATUSES.includes(cycle.status)) ||
        investorCycles[0] ||
        null
      const resolvedFeePlanId = selectedCycle?.assigned_fee_plan_id || member.assigned_fee_plan_id
      const resolvedTermSheetId = selectedCycle?.term_sheet_id || member.term_sheet_id
      const resolvedReferrerType = selectedCycle?.referred_by_entity_type || member.referred_by_entity_type
      const resolvedReferrerId = selectedCycle?.referred_by_entity_id || member.referred_by_entity_id
      const assignedFeePlan = resolvedFeePlanId
        ? feePlansById.get(resolvedFeePlanId) || null
        : null
      let referrerEntity = null

      if (resolvedReferrerType === 'partner' && resolvedReferrerId) {
        referrerEntity = partnersById.get(resolvedReferrerId) || null
      }
      if (resolvedReferrerType === 'introducer' && resolvedReferrerId) {
        referrerEntity = introducersById.get(resolvedReferrerId) || null
      }
      if (resolvedReferrerType === 'commercial_partner' && resolvedReferrerId) {
        referrerEntity = commercialPartnersById.get(resolvedReferrerId) || null
      }

      if (!referrerEntity && assignedFeePlan) {
        referrerEntity =
          assignedFeePlan.introducer ||
          assignedFeePlan.partner ||
          assignedFeePlan.commercial_partner ||
          null
      }

      return {
        ...member,
        active_cycle: selectedCycle,
        assigned_fee_plan: assignedFeePlan,
        assigned_term_sheet: resolvedTermSheetId
          ? termSheetsById.get(resolvedTermSheetId) || null
          : assignedFeePlan?.term_sheet || null,
        referrer_entity: referrerEntity,
      }
    })

    return NextResponse.json({ members: enrichedMembers })

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

    if (
      validatedData.referred_by_entity_type === 'introducer' &&
      validatedData.referred_by_entity_id
    ) {
      const eligibility = await getIntroducerCommercialEligibility({
        supabase,
        introducerId: validatedData.referred_by_entity_id,
      })

      if (!eligibility) {
        return NextResponse.json({ error: 'Failed to verify introducer eligibility' }, { status: 500 })
      }

      if (!eligibility.eligible) {
        return NextResponse.json(buildIntroducerCommercialBlockPayload(eligibility), {
          status: 409,
        })
      }
    }

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
      if (validatedData.referred_by_entity_type === 'introducer') {
        const eligibility = await getIntroducerCommercialEligibility({
          supabase,
          introducerId: validatedData.referred_by_entity_id,
        })

        if (!eligibility) {
          return NextResponse.json({ error: 'Failed to verify introducer eligibility' }, { status: 500 })
        }

        if (!eligibility.eligible) {
          return NextResponse.json(
            buildIntroducerCommercialBlockPayload(eligibility),
            { status: 409 }
          )
        }
      }

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

    const dispatchTimestamp = new Date().toISOString()

    // Check if membership already exists
    const { data: existingMember } = await supabase
      .from('deal_memberships')
      .select(`
        deal_id,
        user_id,
        investor_id,
        role,
        referred_by_entity_id,
        referred_by_entity_type,
        assigned_fee_plan_id,
        term_sheet_id
      `)
      .eq('deal_id', dealId)
      .eq('user_id', resolvedUserId)
      .maybeSingle()

    if (existingMember) {
      if (!validatedData.term_sheet_id || !resolvedInvestorId) {
        return NextResponse.json(
          { error: 'User is already a member of this deal' },
          { status: 409 }
        )
      }

      let cycle = null
      let cycleResult = null
      try {
        cycleResult = await createOrResumeDealInvestmentCycle({
          supabase,
          dealId,
          userId: resolvedUserId,
          investorId: resolvedInvestorId,
          termSheetId: validatedData.term_sheet_id,
          role: validatedData.role,
          createdBy: user.id,
          referredByEntityId: validatedData.referred_by_entity_id || null,
          referredByEntityType: validatedData.referred_by_entity_type || null,
          assignedFeePlanId: validatedData.assigned_fee_plan_id || null,
          dispatchTimestamp,
        })
        cycle = cycleResult.cycle
      } catch (cycleError) {
        console.error('Create/resume cycle error:', cycleError)
        if (
          cycleError instanceof Error &&
          (
            cycleError.message.includes('active term sheet workflow') ||
            cycleError.message.includes('Commercial changes are only allowed')
          )
        ) {
          return NextResponse.json(
            {
              error: cycleError.message,
              message: cycleError.message,
              reasonCode: 'active_workflow_blocked',
            },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { error: 'Failed to create investment cycle for member' },
          { status: 500 }
        )
      }

      const membershipPatch: Record<string, unknown> = {
        investor_id: resolvedInvestorId,
        role: cycle?.role || validatedData.role,
        dispatched_at: dispatchTimestamp,
        term_sheet_id: cycle?.term_sheet_id || validatedData.term_sheet_id,
        assigned_fee_plan_id: cycle?.assigned_fee_plan_id || null,
        referred_by_entity_id: cycle?.referred_by_entity_id || null,
        referred_by_entity_type: cycle?.referred_by_entity_type || null,
      }

      const { data: updatedMembership, error: updateMembershipError } = await supabase
        .from('deal_memberships')
        .update(membershipPatch)
        .eq('deal_id', dealId)
        .eq('user_id', resolvedUserId)
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

      if (updateMembershipError || !updatedMembership) {
        console.error('Update membership error:', updateMembershipError)
        return NextResponse.json(
          { error: 'Failed to update existing member' },
          { status: 500 }
        )
      }

      if (validatedData.send_notification && resolvedUserId) {
        try {
          const { data: currentDeal } = await supabase
            .from('deals')
            .select('name')
            .eq('id', dealId)
            .single()

          const fanout = await sendDealDispatchFanout({
            supabase,
            dealId,
            dealName: currentDeal?.name || 'a deal',
            seedUserIds: [resolvedUserId],
            investorIds: [resolvedInvestorId],
            initiatedByUserId: user.id,
            role: validatedData.role,
            notificationLink: cycle ? `/versotech_main/opportunities/${dealId}?cycle=${cycle.id}` : undefined,
          })

          if (!fanout.success) {
            console.warn('[deal-members] Notification/email fanout completed with warnings:', fanout.errors)
          }
        } catch (notificationError) {
          console.error('[deal-members] Failed to send notification/email fanout:', notificationError)
        }
      }

      await auditLogger.log({
        actor_user_id: user.id,
        action: AuditActions.UPDATE,
        entity: 'deal_memberships',
        entity_id: dealId,
        metadata: {
          updated_user_id: resolvedUserId,
          role: validatedData.role,
          investor_id: resolvedInvestorId,
          referred_by_entity_id: validatedData.referred_by_entity_id || null,
          referred_by_entity_type: validatedData.referred_by_entity_type || null,
          assigned_fee_plan_id: validatedData.assigned_fee_plan_id || null,
          term_sheet_id: validatedData.term_sheet_id,
          cycle_id: cycle?.id || null,
        }
      })

      return NextResponse.json(
        {
          membership: updatedMembership,
          cycle,
          created: cycleResult?.created ?? false,
          resumed: cycleResult?.resumed ?? true,
          dispatch_action: cycleResult?.action ?? 'resumed',
          replaced_cycle_id: cycleResult?.replacedCycleId ?? null,
        },
        { status: 200 }
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
        dispatched_at: validatedData.term_sheet_id ? dispatchTimestamp : null,
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

    let cycle = null
    if (validatedData.term_sheet_id && resolvedInvestorId) {
      try {
        const cycleResult = await createOrResumeDealInvestmentCycle({
          supabase,
          dealId,
          userId: resolvedUserId,
          investorId: resolvedInvestorId,
          termSheetId: validatedData.term_sheet_id,
          role: validatedData.role,
          createdBy: user.id,
          referredByEntityId: validatedData.referred_by_entity_id || null,
          referredByEntityType: validatedData.referred_by_entity_type || null,
          assignedFeePlanId: validatedData.assigned_fee_plan_id || null,
          dispatchTimestamp,
        })
        cycle = cycleResult.cycle
      } catch (cycleError) {
        console.error('Create cycle error:', cycleError)
        await supabase
          .from('deal_memberships')
          .delete()
          .eq('deal_id', dealId)
          .eq('user_id', resolvedUserId)
        return NextResponse.json(
          {
            error: cycleError instanceof Error ? cycleError.message : 'Failed to create investment cycle for member',
          },
          {
            status:
              cycleError instanceof Error &&
              cycleError.message.includes('active term sheet workflow')
                ? 409
                : 500,
          }
        )
      }
    }

    // Send notification/email fanout if requested
    if (validatedData.send_notification && resolvedUserId) {
      try {
        // Get deal name for notification
        const { data: deal } = await supabase
          .from('deals')
          .select('name')
          .eq('id', dealId)
          .single()

        const dealName = deal?.name || 'a deal'

        const fanout = await sendDealDispatchFanout({
          supabase,
          dealId,
          dealName,
          seedUserIds: [resolvedUserId],
          investorIds: [resolvedInvestorId ?? null],
          initiatedByUserId: user.id,
          role: validatedData.role,
          notificationLink: cycle ? `/versotech_main/opportunities/${dealId}?cycle=${cycle.id}` : undefined,
        })

        if (!fanout.success) {
          console.warn('[deal-members] Notification/email fanout completed with warnings:', fanout.errors)
        }
      } catch (notificationError) {
        console.error('[deal-members] Failed to send notification/email fanout:', notificationError)
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
        term_sheet_id: validatedData.term_sheet_id || null,
        cycle_id: cycle?.id || null,
      }
    })

    return NextResponse.json({ membership, cycle }, { status: 201 })

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
