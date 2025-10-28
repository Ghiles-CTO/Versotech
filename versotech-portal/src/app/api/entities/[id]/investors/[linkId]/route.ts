import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { mergeEntityInvestorData } from '@/lib/entities/entity-investor-utils'

const updateSchema = z.object({
  allocation_status: z.enum(['pending', 'committed', 'active', 'closed', 'cancelled']).optional(),
  relationship_role: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  subscription: z
    .object({
      commitment: z.number().nonnegative().optional(),
      currency: z.string().length(3).optional(),
      status: z.enum(['pending', 'committed', 'active', 'closed', 'cancelled']).optional(),
      effective_date: z.string().optional(),
      funding_due_at: z.string().optional(),
      units: z.number().nonnegative().optional(),
      acknowledgement_notes: z.string().optional().nullable()
    })
    .optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const { id: vehicleId, linkId } = await params

  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await isStaffUser(authClient, user)
    if (!staff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const payload = updateSchema.parse(body)
    const supabase = createServiceClient()

    const { data: existing, error: fetchError } = await supabase
      .from('entity_investors')
      .select('id, investor_id, subscription_id')
      .eq('vehicle_id', vehicleId)
      .eq('id', linkId)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Investor link not found' }, { status: 404 })
    }

    if (payload.subscription && existing.subscription_id) {
      const subInput = payload.subscription
      const { error: updateSubError } = await supabase
        .from('subscriptions')
        .update({
          commitment: subInput.commitment ?? undefined,
          currency: subInput.currency ? subInput.currency.toUpperCase() : undefined,
          status: subInput.status ?? undefined,
          effective_date: subInput.effective_date ?? undefined,
          funding_due_at: subInput.funding_due_at ?? undefined,
          units: subInput.units ?? undefined,
          acknowledgement_notes: subInput.acknowledgement_notes ?? undefined
        })
        .eq('id', existing.subscription_id)

      if (updateSubError) {
        console.error('Failed to update subscription:', updateSubError)
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
      }
    }

    const { data: updated, error: updateLinkError } = await supabase
      .from('entity_investors')
      .update({
        allocation_status: payload.allocation_status ?? undefined,
        relationship_role:
          'relationship_role' in payload ? (payload.relationship_role?.trim() || null) : undefined,
        notes: 'notes' in payload ? (payload.notes?.trim() || null) : undefined
      })
      .eq('id', linkId)
      .select(
        `
          id,
          subscription_id,
          relationship_role,
          allocation_status,
          invite_sent_at,
          created_at,
          updated_at,
          notes,
          investor:investors (
            id,
            legal_name,
            display_name,
            type,
            email,
            country,
            status,
            onboarding_status,
            aml_risk_rating
          ),
          subscription:subscriptions (
            id,
            commitment,
            currency,
            status,
            effective_date,
            funding_due_at,
            units,
            created_at,
            acknowledgement_notes
          )
        `
      )
      .single()

    if (updateLinkError || !updated) {
      console.error('Failed to update entity investor:', updateLinkError)
      return NextResponse.json({ error: 'Failed to update investor link' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.VEHICLES,
      entity_id: vehicleId,
      metadata: {
        action: 'update_investor_link',
        entity_investor_id: linkId,
        allocation_status: payload.allocation_status
      }
    })

    const merged = mergeEntityInvestorData({
      entityInvestors: [
        {
          ...updated,
          subscription_id: existing.subscription_id
        } as any
      ],
      subscriptions:
        existing.subscription_id && updated.subscription
          ? [
              {
                ...(updated.subscription as any)?.[0],
                id: (updated.subscription as any)?.[0]?.id,
                investor_id: existing.investor_id,
                vehicle_id: vehicleId,
                investor: updated.investor ?? null
              }
            ] as any
          : [] as any,
      holdings: [],
      deals: []
    })

    const investorSummary = merged[0] ?? updated

    return NextResponse.json({ investor: investorSummary })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: (error as any).errors }, { status: 400 })
    }

    console.error('Entity investor PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const { id: vehicleId, linkId } = await params

  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await isStaffUser(authClient, user)
    if (!staff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const supabase = createServiceClient()

    const { data: existing, error: fetchError } = await supabase
      .from('entity_investors')
      .select('id, investor_id, subscription_id')
      .eq('vehicle_id', vehicleId)
      .eq('id', linkId)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Investor link not found' }, { status: 404 })
    }

    // Cancel ALL subscriptions for this investor-vehicle pair
    // This includes subscription #1, #2, #3, etc. (follow-on investments)
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('investor_id', existing.investor_id)
      .eq('vehicle_id', vehicleId)

    if (subscriptionsError) {
      console.error('Failed to cancel subscriptions:', subscriptionsError)
      // Continue with deletion even if subscription update fails
    }

    // Also cancel any associated deal holdings for this investor-vehicle pair
    // First, get the list of deal IDs for this vehicle
    const { data: vehicleDeals } = await supabase
      .from('deals')
      .select('id')
      .eq('vehicle_id', vehicleId)

    if (vehicleDeals && vehicleDeals.length > 0) {
      const dealIds = vehicleDeals.map((deal) => deal.id)

      const { error: holdingsError } = await supabase
        .from('investor_deal_holdings')
        .update({ status: 'cancelled' })
        .eq('investor_id', existing.investor_id)
        .in('deal_id', dealIds)

      if (holdingsError) {
        console.error('Failed to cancel holdings:', holdingsError)
        // Continue with deletion even if holdings update fails
      }
    }

    const { error: deleteError } = await supabase
      .from('entity_investors')
      .delete()
      .eq('id', linkId)

    if (deleteError) {
      console.error('Failed to unlink investor:', deleteError)
      return NextResponse.json({ error: 'Failed to unlink investor' }, { status: 500 })
    }

    await supabase.from('entity_events').insert({
      vehicle_id: vehicleId,
      event_type: 'investor_unlinked',
      description: `Removed investor link ${existing.investor_id}`,
      changed_by: user.id.startsWith('demo-') ? null : user.id,
      payload: {
        investor_id: existing.investor_id,
        subscription_id: existing.subscription_id
      }
    })

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.VEHICLES,
      entity_id: vehicleId,
      metadata: {
        action: 'unlink_investor',
        entity_investor_id: linkId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Entity investor DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
