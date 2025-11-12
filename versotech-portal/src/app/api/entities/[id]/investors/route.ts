import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { mergeEntityInvestorData } from '@/lib/entities/entity-investor-utils'

const subscriptionSchema = z
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

const linkExistingSchema = z.object({
  investor_id: z.string().uuid(),
  relationship_role: z.string().optional().nullable(),
  allocation_status: z.enum(['pending', 'committed', 'active', 'closed', 'cancelled']).optional(),
  notes: z.string().optional().nullable(),
  send_invite: z.boolean().optional(),
  subscription: subscriptionSchema
})

const newInvestorSchema = z.object({
  investor: z.object({
    legal_name: z.string().min(1, 'Legal name is required'),
    display_name: z.string().optional().nullable(),
    type: z.enum(['individual', 'institutional', 'entity', 'family_office', 'fund']).optional().nullable(),
    email: z.string().email().or(z.literal('')).optional().nullable(),
    phone: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    country_of_incorporation: z.string().optional().nullable(),
    tax_residency: z.string().optional().nullable()
  }),
  relationship_role: z.string().optional().nullable(),
  allocation_status: z.enum(['pending', 'committed', 'active', 'closed', 'cancelled']).optional(),
  notes: z.string().optional().nullable(),
  send_invite: z.boolean().optional(),
  subscription: subscriptionSchema
})

type LinkPayload = z.infer<typeof linkExistingSchema> | z.infer<typeof newInvestorSchema>

const sanitize = (value?: string | null) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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

    const [
      { data: entityInvestors, error: entityError },
      { data: subscriptions, error: subsError },
      { data: deals, error: dealsError }
    ] = await Promise.all([
      supabase
        .from('entity_investors')
        .select(
          `
            id,
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
        .eq('vehicle_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('subscriptions')
        .select(
          `
            id,
            investor_id,
            vehicle_id,
            commitment,
            currency,
            status,
            effective_date,
            funding_due_at,
            units,
            acknowledgement_notes,
            created_at,
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
            )
          `
        )
        .eq('vehicle_id', id),
      supabase
        .from('deals')
        .select('id, name')
        .eq('vehicle_id', id)
    ])

    if (entityError) {
      console.error('Entity investors fetch error:', entityError)
      return NextResponse.json({ error: 'Failed to load investors' }, { status: 500 })
    }

    if (subsError) {
      console.error('Subscriptions fetch error:', subsError)
    }

    if (dealsError) {
      console.error('Deals fetch error for investor view:', dealsError)
    }

    let holdings: any[] = []
    if (deals && deals.length > 0) {
      const dealIds = deals.map((deal) => deal.id).filter(Boolean)
      if (dealIds.length > 0) {
        const { data: holdingRows, error: holdingsError } = await supabase
          .from('investor_deal_holdings')
          .select(
            `
              id,
              investor_id,
              deal_id,
              subscription_submission_id,
              status,
              subscribed_amount,
              currency,
              effective_date,
              funding_due_at,
              funded_at,
              created_at,
              updated_at,
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
              )
            `
          )
          .in('deal_id', dealIds)

        if (holdingsError) {
          console.error('Holdings fetch error:', holdingsError)
        } else {
          holdings = holdingRows ?? []
        }
      }
    }

    const mergedInvestors = mergeEntityInvestorData({
      entityInvestors: (entityInvestors ?? []) as any,
      subscriptions: (subscriptions ?? []) as any,
      holdings,
      deals: (deals ?? []) as any
    })

    return NextResponse.json({ investors: mergedInvestors })
  } catch (error) {
    console.error('Entity investors GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: vehicleId } = await params

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

    // DEPRECATION WARNING: This endpoint bypasses the multi-subscription system
    // Use POST /api/investors/[investorId]/subscriptions instead
    // This endpoint creates subscription #1 only and does not support follow-on subscriptions
    console.warn(
      '[DEPRECATED] POST /api/entities/[id]/investors bypasses subscription_number system. ' +
      'Use POST /api/investors/[investorId]/subscriptions for proper multi-subscription support.'
    )

    const rawBody = await request.json().catch(() => ({}))
    let payload: LinkPayload

    if ('investor_id' in rawBody && rawBody.investor_id) {
      payload = linkExistingSchema.parse(rawBody)
    } else {
      payload = newInvestorSchema.parse(rawBody)
    }

    const supabase = createServiceClient()

    let investorId: string
    let subscriptionId: string | null = null
    let allocationStatus =
      'allocation_status' in payload && payload.allocation_status
        ? payload.allocation_status
        : 'pending'
    const notes =
      'notes' in payload ? sanitize(payload.notes) : null
    const relationshipRole =
      'relationship_role' in payload ? sanitize(payload.relationship_role) : null

    if ('investor_id' in payload) {
      investorId = payload.investor_id
    } else {
      const investorInput = payload.investor
      const legalName = investorInput.legal_name.trim()
      const email = sanitize(investorInput.email)?.toLowerCase() ?? null

      const { data: existing } = await supabase
        .from('investors')
        .select('id')
        .eq('legal_name', legalName)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: 'Investor with this legal name already exists' },
          { status: 409 }
        )
      }

      if (email) {
        const { data: existingEmail } = await supabase
          .from('investors')
          .select('id')
          .eq('email', email)
          .maybeSingle()

        if (existingEmail) {
          return NextResponse.json(
            { error: 'Investor with this email already exists' },
            { status: 409 }
          )
        }
      }

      const { data: newInvestor, error: createError } = await supabase
        .from('investors')
        .insert({
          legal_name: legalName,
          display_name: sanitize(investorInput.display_name) ?? legalName,
          type: investorInput.type ?? null,
          email,
          phone: sanitize(investorInput.phone),
          country: sanitize(investorInput.country),
          country_of_incorporation: sanitize(investorInput.country_of_incorporation),
          tax_residency: sanitize(investorInput.tax_residency),
          created_by: user.id.startsWith('demo-') ? null : user.id
        })
        .select('id')
        .single()

      if (createError || !newInvestor) {
        console.error('Failed to create investor:', createError)
        return NextResponse.json({ error: 'Failed to create investor' }, { status: 500 })
      }

      investorId = newInvestor.id

      await auditLogger.log({
        actor_user_id: user.id,
        action: AuditActions.CREATE,
        entity: AuditEntities.INVESTORS,
        entity_id: investorId,
        metadata: {
          source: 'entity_link',
          vehicle_id: vehicleId
        }
      })
    }

    let createdHolding: any | null = null

    let activeDeal: { id: string; name?: string | null } | null = null

    if ('subscription' in payload && payload.subscription) {
      const subInput = payload.subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          investor_id: investorId,
          vehicle_id: vehicleId,
          commitment: subInput.commitment ?? null,
          currency: subInput.currency ? subInput.currency.toUpperCase() : 'USD',
          status: subInput.status ?? 'pending',
          effective_date: subInput.effective_date ?? null,
          funding_due_at: subInput.funding_due_at ?? null,
          units: subInput.units ?? null,
          acknowledgement_notes: subInput.acknowledgement_notes ?? null
        })
        .select(
          `
            id,
            investor_id,
            vehicle_id,
            commitment,
            currency,
            status,
            effective_date,
            funding_due_at,
            units,
            acknowledgement_notes,
            created_at
          `
        )
        .single()

      if (subscriptionError || !subscription) {
        console.error('Failed to create subscription:', subscriptionError)
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
      }

      subscriptionId = subscription.id
      allocationStatus = subscription.status ?? allocationStatus

      await auditLogger.log({
        actor_user_id: user.id,
        action: AuditActions.SUBSCRIPTION_CREATED,
        entity: AuditEntities.SUBSCRIPTIONS,
        entity_id: subscription.id,
        metadata: {
          vehicle_id: vehicleId,
          investor_id: investorId,
          status: subscription.status
        }
      })

      // Create holding for investor portal (requires an active deal)
      const { data: latestDeal } = await supabase
        .from('deals')
        .select('id, name, currency')
        .eq('vehicle_id', vehicleId)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestDeal) {
        activeDeal = latestDeal
        const holdingCurrency = subInput.currency?.toUpperCase() || (activeDeal as any).currency || 'USD'
        const holdingStatus = subInput.status === 'active' ? 'funded' : 'pending_funding'

        const { data: insertedHolding, error: holdingError } = await supabase
          .from('investor_deal_holdings')
          .insert({
            investor_id: investorId,
            deal_id: latestDeal.id,
            subscription_submission_id: subscriptionId,
            status: holdingStatus,
            subscribed_amount: subInput.commitment ?? 0,
            currency: holdingCurrency,
            effective_date: subInput.effective_date || new Date().toISOString().slice(0, 10),
            funding_due_at: subInput.funding_due_at || null,
            funded_at: subInput.status === 'active' ? new Date().toISOString() : null
          })
          .select(
            `
              id,
              investor_id,
              deal_id,
              subscription_submission_id,
              status,
              subscribed_amount,
              currency,
              effective_date,
              funding_due_at,
              funded_at,
              created_at,
              updated_at,
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
              )
            `
          )
          .single()

        if (holdingError) {
          console.error('Failed to create holding:', holdingError)
          // Continue anyway - holding is supplementary for investor portal
        } else {
          createdHolding = insertedHolding
        }
      } else {
        console.log('No active deal found for vehicle, skipping holding creation')
      }
    }

    const { data: entityInvestor, error: entityError } = await supabase
      .from('entity_investors')
      .insert({
        vehicle_id: vehicleId,
        investor_id: investorId,
        relationship_role: relationshipRole,
        allocation_status: allocationStatus,
        notes,
        invite_sent_at: ('send_invite' in payload && payload.send_invite) ? new Date().toISOString() : null,
        created_by: user.id.startsWith('demo-') ? null : user.id
      })
      .select(
        `
          id,
          relationship_role,
          allocation_status,
          invite_sent_at,
          created_at,
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

    if (entityError || !entityInvestor) {
      console.error('Failed to link investor:', entityError)
      return NextResponse.json({ error: 'Failed to link investor' }, { status: 500 })
    }

    await supabase.from('entity_events').insert({
      vehicle_id: vehicleId,
      event_type: 'investor_linked',
      description: `Linked investor ${(entityInvestor.investor as any)?.[0]?.legal_name ?? investorId} (${allocationStatus})`,
      changed_by: user.id.startsWith('demo-') ? null : user.id,
      payload: {
        investor_id: investorId,
        allocation_status: allocationStatus
      }
    })

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.VEHICLES,
      entity_id: vehicleId,
      metadata: {
        action: 'link_investor',
        investor_id: investorId,
        entity_investor_id: entityInvestor.id,
        allocation_status: allocationStatus
      }
    })

    const merged = mergeEntityInvestorData({
      entityInvestors: [
        {
          ...entityInvestor
        } as any
      ],
      subscriptions:
        subscriptionId && entityInvestor.subscription
          ? [
              {
                ...(entityInvestor.subscription as any)?.[0],
                id: (entityInvestor.subscription as any)?.[0]?.id,
                investor_id: investorId,
                vehicle_id: vehicleId,
                investor: entityInvestor.investor ?? null
              }
            ] as any
          : subscriptionId && !entityInvestor.subscription
            ? [
                {
                  id: subscriptionId,
                  investor_id: investorId,
                  vehicle_id: vehicleId,
                  commitment: payload.subscription?.commitment ?? null,
                  currency: payload.subscription?.currency?.toUpperCase() ?? 'USD',
                  status: payload.subscription?.status ?? 'pending',
                  effective_date: payload.subscription?.effective_date ?? null,
                  funding_due_at: payload.subscription?.funding_due_at ?? null,
                  units: payload.subscription?.units ?? null,
                  acknowledgement_notes: payload.subscription?.acknowledgement_notes ?? null,
                  created_at: entityInvestor.created_at,
                  investor: entityInvestor.investor ?? null
                }
              ]
            : [],
      holdings: createdHolding ? [createdHolding] : [],
      deals: activeDeal ? [activeDeal] : []
    })

    const investorSummary = merged[0] ?? entityInvestor

    return NextResponse.json({ investor: investorSummary }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error('Entity investors POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
