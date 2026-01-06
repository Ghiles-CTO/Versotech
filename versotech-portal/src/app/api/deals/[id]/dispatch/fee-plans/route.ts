import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const querySchema = z.object({
  entity_id: z.string().uuid(),
  entity_type: z.enum(['partner', 'introducer', 'commercial_partner']),
  term_sheet_id: z.string().uuid().optional() // Filter fee plans by term sheet
})

/**
 * GET /api/deals/:id/dispatch/fee-plans
 * Query fee plans available for dispatching investors through an entity
 *
 * Query params:
 * - entity_id: UUID of the partner/introducer/commercial_partner
 * - entity_type: 'partner' | 'introducer' | 'commercial_partner'
 *
 * Returns:
 * - fee_plans: Array of fee plans for this entity+deal
 * - can_dispatch: Boolean indicating if dispatch is allowed
 * - message: Error/info message if dispatch is blocked
 *
 * Business Rule: Only fee plans with status='accepted' can be used for dispatch.
 * If no accepted fee plans exist, dispatch is blocked.
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

    const hasStaffAccess = personas?.some(
      (p: { persona_type: string }) => p.persona_type === 'staff'
    ) || false

    if (!hasStaffAccess) {
      return NextResponse.json({ error: 'Forbidden: Staff access required' }, { status: 403 })
    }

    // Parse query params
    const url = new URL(request.url)
    const queryParams = {
      entity_id: url.searchParams.get('entity_id'),
      entity_type: url.searchParams.get('entity_type'),
      term_sheet_id: url.searchParams.get('term_sheet_id') || undefined
    }

    const validation = querySchema.safeParse(queryParams)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { entity_id, entity_type, term_sheet_id } = validation.data

    // Build entity filter based on type
    const entityFilter = entity_type === 'partner'
      ? { partner_id: entity_id }
      : entity_type === 'introducer'
        ? { introducer_id: entity_id }
        : { commercial_partner_id: entity_id }

    // Query fee plans for this entity and deal
    let query = serviceSupabase
      .from('fee_plans')
      .select(`
        id,
        name,
        description,
        status,
        is_default,
        is_active,
        accepted_at,
        accepted_by,
        created_at,
        term_sheet_id,
        fee_components (
          id,
          kind,
          rate_bps,
          flat_amount,
          calc_method,
          frequency
        )
      `)
      .eq('deal_id', dealId)
      .eq('is_active', true)
      .match(entityFilter)
      .order('created_at', { ascending: false })

    // Filter by term sheet if provided (required for proper fee plan selection)
    if (term_sheet_id) {
      query = query.eq('term_sheet_id', term_sheet_id)
    }

    const { data: feePlans, error: feePlansError } = await query

    if (feePlansError) {
      console.error('Error fetching fee plans:', feePlansError)
      return NextResponse.json(
        { error: 'Failed to fetch fee plans' },
        { status: 500 }
      )
    }

    // Categorize fee plans by status
    const acceptedPlans = (feePlans || []).filter(fp => fp.status === 'accepted')
    const sentPlans = (feePlans || []).filter(fp => fp.status === 'sent')
    const draftPlans = (feePlans || []).filter(fp => fp.status === 'draft')
    const rejectedPlans = (feePlans || []).filter(fp => fp.status === 'rejected')

    // Determine if dispatch is allowed
    const canDispatch = acceptedPlans.length > 0

    // Build appropriate message
    let message: string | null = null
    if (!canDispatch) {
      if (feePlans?.length === 0) {
        message = `No fee plan has been created for this ${entity_type}. Create and send a fee plan first.`
      } else if (sentPlans.length > 0) {
        message = `Fee plan has been sent but not yet accepted by the ${entity_type}. Waiting for approval.`
      } else if (draftPlans.length > 0) {
        message = `Fee plan exists in draft status. Send it to the ${entity_type} for acceptance.`
      } else if (rejectedPlans.length > 0) {
        message = `Fee plan was rejected by the ${entity_type}. Create and send a new fee plan.`
      }
    }

    // Get entity name for UI display
    const entityTable = entity_type === 'partner'
      ? 'partners'
      : entity_type === 'introducer'
        ? 'introducers'
        : 'commercial_partners'

    const { data: entity } = await serviceSupabase
      .from(entityTable)
      .select('id, legal_name, display_name')
      .eq('id', entity_id)
      .single()

    return NextResponse.json({
      deal_id: dealId,
      entity_id,
      entity_type,
      entity_name: entity?.display_name || entity?.legal_name || 'Unknown',
      term_sheet_id: term_sheet_id || null, // Include filter context in response
      fee_plans: feePlans || [],
      accepted_plans: acceptedPlans,
      can_dispatch: canDispatch,
      message,
      summary: {
        total: feePlans?.length || 0,
        accepted: acceptedPlans.length,
        sent: sentPlans.length,
        draft: draftPlans.length,
        rejected: rejectedPlans.length
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/deals/:id/dispatch/fee-plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
