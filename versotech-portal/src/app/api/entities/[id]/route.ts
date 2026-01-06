import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: entityId } = await params

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get entity details with all fields and related service providers
    const { data: entity, error: entityError } = await supabase
      .from('vehicles')
      .select(`
        *,
        arranger_entity:arranger_entities!vehicles_arranger_entity_id_fkey (
          id,
          legal_name,
          email
        ),
        lawyer:lawyers!vehicles_lawyer_id_fkey (
          id,
          firm_name,
          display_name,
          primary_contact_email
        ),
        managing_partner:profiles!vehicles_managing_partner_id_fkey (
          id,
          display_name,
          email
        )
      `)
      .eq('id', entityId)
      .single()

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      )
    }

    // Fetch entity-specific data in parallel (for staff portal)
    const [
      { data: directors },
      { data: stakeholders },
      { data: folders },
      { data: flags },
      { data: deals },
      { data: entityEvents },
      { data: entityInvestors }
    ] = await Promise.all([
      supabase
        .from('entity_directors')
        .select('*')
        .eq('vehicle_id', entityId)
        .order('created_at', { ascending: false }),
      supabase
        .from('entity_stakeholders')
        .select('*')
        .eq('vehicle_id', entityId)
        .order('created_at', { ascending: false }),
      supabase
        .from('document_folders')
        .select('id, parent_folder_id, name, path, folder_type, created_at, updated_at')
        .eq('vehicle_id', entityId)
        .order('path', { ascending: true }),
      supabase
        .from('entity_flags')
        .select('*')
        .eq('vehicle_id', entityId)
        .eq('is_resolved', false)
        .order('severity', { ascending: true }),
      supabase
        .from('deals')
        .select('id, name, status, deal_type, currency, created_at')
        .eq('vehicle_id', entityId)
        .order('created_at', { ascending: false }),
      supabase
        .from('entity_events')
        .select(`
          id,
          event_type,
          description,
          payload,
          created_at,
          changed_by_profile:profiles!entity_events_changed_by_fkey(id, display_name, email)
        `)
        .eq('vehicle_id', entityId)
        .order('created_at', { ascending: false})
        .limit(50),
      supabase
        .from('entity_investors')
        .select(`
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
            acknowledgement_notes,
            created_at
          )
        `)
        .eq('vehicle_id', entityId)
        .order('created_at', { ascending: false })
    ])

    // For investors, check if they have access to this entity
    let hasAccess = false
    let investorIds: string[] = []

    if (profile.role === 'investor') {
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      if (investorLinks) {
        investorIds = investorLinks.map(link => link.investor_id)

        // Check if investor has subscription to this entity
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('vehicle_id', entityId)
          .in('investor_id', investorIds)
          .single()

        hasAccess = !!subscription
      }
    } else {
      // Staff have access to all entities
      hasAccess = true
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this entity' },
        { status: 403 }
      )
    }

    // Get valuations
    const { data: valuations } = await supabase
      .from('valuations')
      .select('*')
      .eq('vehicle_id', entityId)
      .order('as_of_date', { ascending: false })

    // Get capital calls
    const { data: capitalCalls } = await supabase
      .from('capital_calls')
      .select('*')
      .eq('vehicle_id', entityId)
      .order('due_date', { ascending: false })

    // Get distributions
    const { data: distributions } = await supabase
      .from('distributions')
      .select('*')
      .eq('vehicle_id', entityId)
      .order('date', { ascending: false })

    // Get documents (filtered by access rights)
    let documentsQuery = supabase
      .from('documents')
      .select('id, type, created_at, created_by')
      .eq('vehicle_id', entityId)

    if (profile.role === 'investor') {
      // Investors can only see their own documents or entity-level documents
      if (investorIds.length > 0) {
        const investorList = investorIds.join(',')
        documentsQuery = documentsQuery.or(`owner_investor_id.in.(${investorList}),owner_investor_id.is.null`)
      } else {
        documentsQuery = documentsQuery.is('owner_investor_id', null)
      }
    }

    const { data: documents } = await documentsQuery.order('created_at', { ascending: false })

    let positionData = null
    let subscriptionData = null
    let cashflowData = null

    if (profile.role === 'investor') {
      // Get investor's position in this entity
      const { data: position } = await supabase
        .from('positions')
        .select('*')
        .eq('vehicle_id', entityId)
        .in('investor_id', investorIds)
        .single()

      if (position) {
        const latestValuation = valuations?.[0]
        const currentValue = position.units * (latestValuation?.nav_per_unit || position.last_nav || 0)
        const unrealizedGain = currentValue - (position.cost_basis || 0)
        const unrealizedGainPct = position.cost_basis > 0 ? (unrealizedGain / position.cost_basis) * 100 : 0

        positionData = {
          units: position.units,
          costBasis: position.cost_basis,
          currentValue: Math.round(currentValue),
          unrealizedGain: Math.round(unrealizedGain),
          unrealizedGainPct: Math.round(unrealizedGainPct * 100) / 100,
          lastUpdated: position.as_of_date
        }
      }

      // Get subscription details
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('vehicle_id', entityId)
        .in('investor_id', investorIds)
        .single()

      if (subscription) {
        subscriptionData = {
          commitment: subscription.commitment,
          currency: subscription.currency,
          status: subscription.status,
          signedDate: subscription.created_at
        }
      }

      // Get cashflow history
      const { data: cashflows } = await supabase
        .from('cashflows')
        .select('*')
        .eq('vehicle_id', entityId)
        .in('investor_id', investorIds)
        .order('date', { ascending: false })

      if (cashflows) {
        const contributions = cashflows
          .filter(cf => cf.type === 'call')
          .reduce((sum, cf) => sum + (cf.amount || 0), 0)

        const distributionsReceived = cashflows
          .filter(cf => cf.type === 'distribution')
          .reduce((sum, cf) => sum + (cf.amount || 0), 0)

        cashflowData = {
          totalContributions: Math.round(contributions),
          totalDistributions: Math.round(distributionsReceived),
          unfundedCommitment: Math.round(Math.max(0, (subscriptionData?.commitment || 0) - contributions)),
          history: cashflows.map(cf => ({
            type: cf.type,
            amount: cf.amount,
            date: cf.date,
            reference: cf.ref_id
          }))
        }
      }
    }

    return NextResponse.json({
      entity: entity, // Return all entity fields
      directors: directors || [],
      stakeholders: stakeholders || [],
      folders: folders || [],
      flags: flags || [],
      deals: deals || [],
      investors: entityInvestors || [],
      entity_events: entityEvents || [],
      position: positionData,
      subscription: subscriptionData,
      cashflows: cashflowData,
      valuations: valuations?.map(v => ({
        navTotal: v.nav_total,
        navPerUnit: v.nav_per_unit,
        asOfDate: v.as_of_date
      })) || [],
      capitalCalls: capitalCalls?.map(cc => ({
        id: cc.id,
        name: cc.name,
        callPct: cc.call_pct,
        dueDate: cc.due_date,
        status: cc.status
      })) || [],
      distributions: distributions?.map(d => ({
        id: d.id,
        name: d.name,
        amount: d.amount,
        date: d.date,
        classification: d.classification
      })) || [],
      documents: documents?.map(doc => ({
        id: doc.id,
        type: doc.type,
        createdAt: doc.created_at
      })) || []
    })

  } catch (error) {
    console.error('Entity detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const updateEntitySchema = z.object({
  name: z.string().min(1, 'Vehicle name is required').optional(),
  entity_code: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  investment_name: z.string().optional().nullable(),
  former_entity: z.string().optional().nullable(),
  status: z.enum(['LIVE', 'CLOSED', 'TBD']).optional().nullable(),
  type: z.enum(['fund', 'spv', 'securitization', 'note', 'venture_capital', 'private_equity', 'real_estate', 'other']).optional(),
  domicile: z.string().optional().nullable(),
  currency: z.string().length(3, 'Currency must be 3 letters').optional(),
  formation_date: z.string().optional().nullable(),
  legal_jurisdiction: z.string().optional().nullable(),
  registration_number: z.string().optional().nullable(),
  reporting_type: z.enum(['Not Required', 'Company Only', 'Online only', 'Company + Online']).optional().nullable(),
  requires_reporting: z.boolean().optional().nullable(),
  notes: z.string().optional().nullable(),
  logo_url: z.string().url('Logo must be a valid URL').optional().nullable(),
  website_url: z.string().url('Website must be a valid URL').optional().nullable(),
  address: z.string().optional().nullable(),
  arranger_entity_id: z.string().uuid('Arranger must be a valid UUID').optional().nullable(),
  lawyer_id: z.string().uuid('Lawyer must be a valid UUID').optional().nullable(),
  managing_partner_id: z.string().uuid('Managing partner must be a valid UUID').optional().nullable()
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const regularSupabase = await createClient()
    const { id: entityId } = await params

    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const sanitizedBody = {
      ...body,
      logo_url: typeof body.logo_url === 'string' ? body.logo_url.trim() || null : body.logo_url ?? null,
      website_url: typeof body.website_url === 'string' ? body.website_url.trim() || null : body.website_url ?? null
    }
    const validatedData = updateEntitySchema.parse(sanitizedBody)

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const payload = {
      ...validatedData,
      currency: validatedData.currency
        ? validatedData.currency.toUpperCase()
        : undefined,
      legal_jurisdiction: validatedData.legal_jurisdiction?.trim(),
      registration_number: validatedData.registration_number?.trim(),
      notes: validatedData.notes?.trim(),
      logo_url:
        validatedData.logo_url === undefined
          ? undefined
          : validatedData.logo_url?.trim() || null,
      website_url:
        validatedData.website_url === undefined
          ? undefined
          : validatedData.website_url?.trim() || null,
      address: validatedData.address?.trim() || null,
      arranger_entity_id: validatedData.arranger_entity_id || null,
      lawyer_id: validatedData.lawyer_id || null,
      managing_partner_id: validatedData.managing_partner_id || null
    }

    const { data: entity, error } = await supabase
      .from('vehicles')
      .update(payload)
      .eq('id', entityId)
      .select('*')
      .single()

    if (error || !entity) {
      console.error('Entity update error:', error)
      return NextResponse.json(
        { error: 'Failed to update entity', details: error?.message },
        { status: 500 }
      )
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.VEHICLES,
      entity_id: entity.id,
      metadata: {
        endpoint: `/api/entities/${entityId}`,
        ...validatedData
      }
    })

    // Create entity event
    await supabase.from('entity_events').insert({
      vehicle_id: entityId,
      event_type: 'entity_updated',
      description: `Entity updated: ${Object.keys(validatedData).join(', ')}`,
      changed_by: user.id
    })

    return NextResponse.json({ entity })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Entity update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const regularSupabase = await createClient()
    const { id: entityId } = await params

    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Check for dependencies before deletion
    const [
      { data: directors, count: directorsCount },
      { data: stakeholders, count: stakeholdersCount },
      { data: investors, count: investorsCount },
      { data: documents, count: documentsCount },
      { data: folders, count: foldersCount },
      { data: deals, count: dealsCount },
      { data: subscriptions, count: subscriptionsCount },
      { data: valuations, count: valuationsCount }
    ] = await Promise.all([
      supabase.from('entity_directors').select('*', { count: 'exact', head: true }).eq('vehicle_id', entityId),
      supabase.from('entity_stakeholders').select('*', { count: 'exact', head: true }).eq('vehicle_id', entityId),
      supabase.from('entity_investors').select('*', { count: 'exact', head: true }).eq('vehicle_id', entityId),
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('vehicle_id', entityId),
      supabase.from('document_folders').select('*', { count: 'exact', head: true }).eq('vehicle_id', entityId),
      supabase.from('deals').select('*', { count: 'exact', head: true }).eq('vehicle_id', entityId),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('vehicle_id', entityId),
      supabase.from('valuations').select('*', { count: 'exact', head: true }).eq('vehicle_id', entityId)
    ])

    // Return dependency information
    const dependencies = {
      directors: directorsCount || 0,
      stakeholders: stakeholdersCount || 0,
      investors: investorsCount || 0,
      documents: documentsCount || 0,
      folders: foldersCount || 0,
      deals: dealsCount || 0,
      subscriptions: subscriptionsCount || 0,
      valuations: valuationsCount || 0
    }

    const hasDependencies = Object.values(dependencies).some(count => count > 0)

    // Get entity name for confirmation
    const { data: entity } = await supabase
      .from('vehicles')
      .select('name')
      .eq('id', entityId)
      .single()

    if (hasDependencies) {
      return NextResponse.json(
        {
          error: 'Cannot delete entity with dependencies',
          dependencies,
          entityName: entity?.name || 'Unknown'
        },
        { status: 409 }
      )
    }

    // Delete the entity
    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', entityId)

    if (deleteError) {
      console.error('Entity delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete entity', details: deleteError.message },
        { status: 500 }
      )
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.VEHICLES,
      entity_id: entityId,
      metadata: {
        endpoint: `/api/entities/${entityId}`,
        entity_name: entity?.name
      }
    })

    return NextResponse.json({ success: true, entityName: entity?.name })

  } catch (error) {
    console.error('Entity delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
