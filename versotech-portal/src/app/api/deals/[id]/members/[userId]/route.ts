import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { z } from 'zod'

const patchSchema = z.object({
  referred_by_entity_id: z.string().uuid(),
  referred_by_entity_type: z.enum(['introducer', 'partner', 'commercial_partner']),
  assigned_fee_plan_id: z.string().uuid(),
  role: z.enum(['introducer_investor', 'partner_investor', 'commercial_partner_investor']).optional()
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
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

    const { id: dealId, userId } = await params

    // REMOVED: deal_commitments check - table deleted
    // Commitments workflow replaced by deal_subscription_submissions

    // Delete membership
    const { error } = await supabase
      .from('deal_memberships')
      .delete()
      .eq('deal_id', dealId)
      .eq('user_id', userId)

    if (error) {
      console.error('Delete membership error:', error)
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: 'deal_memberships',
      entity_id: dealId,
      metadata: {
        removed_user_id: userId
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API /deals/[id]/members/[userId] DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/deals/:id/members/:userId
 *
 * Updates an existing deal membership with introducer/partner linkage.
 * Used for dispatching an investor to an introducer.
 *
 * Request body:
 * {
 *   referred_by_entity_id: string,      // UUID of the introducer/partner
 *   referred_by_entity_type: 'introducer' | 'partner' | 'commercial_partner',
 *   assigned_fee_plan_id: string,       // UUID of the fee plan to apply
 *   role?: 'introducer_investor' | 'partner_investor' | 'commercial_partner_investor'
 * }
 *
 * Validations:
 * - Fee plan must be 'accepted' and 'is_active'
 * - Fee plan must be on the same term sheet as the membership
 * - For introducers: Agreement must be 'active'
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
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

    const { id: dealId, userId } = await params
    const body = await request.json()

    // Validate request body
    const validation = patchSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { referred_by_entity_id, referred_by_entity_type, assigned_fee_plan_id, role } = validation.data

    // Fetch current membership to get term_sheet_id
    const { data: membership, error: membershipError } = await supabase
      .from('deal_memberships')
      .select('deal_id, user_id, investor_id, role, term_sheet_id, referred_by_entity_id')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      )
    }

    if (membership.referred_by_entity_id) {
      return NextResponse.json(
        { error: 'This investor is already linked to a referrer' },
        { status: 400 }
      )
    }

    // Validate fee plan
    const { data: feePlan, error: feePlanError } = await supabase
      .from('fee_plans')
      .select('id, status, is_active, term_sheet_id, introducer_id, partner_id, commercial_partner_id')
      .eq('id', assigned_fee_plan_id)
      .single()

    if (feePlanError || !feePlan) {
      return NextResponse.json(
        { error: 'Fee plan not found' },
        { status: 404 }
      )
    }

    if (feePlan.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Fee plan must be accepted before dispatching investors' },
        { status: 400 }
      )
    }

    if (!feePlan.is_active) {
      return NextResponse.json(
        { error: 'Fee plan is not active' },
        { status: 400 }
      )
    }

    // Validate term sheet match
    if (feePlan.term_sheet_id !== membership.term_sheet_id) {
      return NextResponse.json(
        { error: 'Fee plan term sheet does not match investor term sheet' },
        { status: 400 }
      )
    }

    // Validate entity ownership of fee plan
    const entityColumn = referred_by_entity_type === 'introducer' ? 'introducer_id'
      : referred_by_entity_type === 'partner' ? 'partner_id'
      : 'commercial_partner_id'

    if (feePlan[entityColumn] !== referred_by_entity_id) {
      return NextResponse.json(
        { error: 'Fee plan does not belong to the specified entity' },
        { status: 400 }
      )
    }

    // For introducers, validate that the agreement is active
    if (referred_by_entity_type === 'introducer') {
      const { data: agreement, error: agreementError } = await supabase
        .from('introducer_agreements')
        .select('id, status')
        .eq('deal_id', dealId)
        .eq('introducer_id', referred_by_entity_id)
        .eq('fee_plan_id', assigned_fee_plan_id)
        .eq('status', 'active')
        .maybeSingle()

      if (agreementError) {
        console.error('Error checking agreement:', agreementError)
        return NextResponse.json(
          { error: 'Failed to verify introducer agreement' },
          { status: 500 }
        )
      }

      if (!agreement) {
        return NextResponse.json(
          { error: 'No active introducer agreement found for this fee plan' },
          { status: 400 }
        )
      }
    }

    // Determine the new role
    const newRole = role || (
      referred_by_entity_type === 'introducer' ? 'introducer_investor' :
      referred_by_entity_type === 'partner' ? 'partner_investor' :
      'commercial_partner_investor'
    )

    // Update the membership
    const { error: updateError } = await supabase
      .from('deal_memberships')
      .update({
        referred_by_entity_id,
        referred_by_entity_type,
        assigned_fee_plan_id,
        role: newRole,
        dispatched_at: new Date().toISOString()
      })
      .eq('deal_id', dealId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Update membership error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update membership' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: 'deal_memberships',
      entity_id: dealId,
      metadata: {
        updated_user_id: userId,
        referred_by_entity_id,
        referred_by_entity_type,
        assigned_fee_plan_id,
        new_role: newRole
      }
    })

    return NextResponse.json({
      success: true,
      message: `Investor successfully linked to ${referred_by_entity_type}`
    })

  } catch (error) {
    console.error('API /deals/[id]/members/[userId] PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
