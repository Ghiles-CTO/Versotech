import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/deals/[id]/partners
 * Fetches all partners/introducers/commercial partners assigned to a deal via fee_plans
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: dealId } = await context.params
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch fee_plans with partner assignments for this deal
    const serviceSupabase = createServiceClient()

    const { data: feePlans, error } = await serviceSupabase
      .from('fee_plans')
      .select(`
        id,
        name,
        description,
        is_active,
        status,
        created_at,
        partner_id,
        introducer_id,
        commercial_partner_id,
        partner:partners(id, name, legal_name, status, contact_email),
        introducer:introducers(id, legal_name, status, contact_email),
        commercial_partner:commercial_partners(id, name, legal_name, status, contact_email),
        fee_components(id, kind, rate_bps, flat_amount, currency)
      `)
      .eq('deal_id', dealId)
      .or('partner_id.not.is.null,introducer_id.not.is.null,commercial_partner_id.not.is.null')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/deals/[id]/partners] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
    }

    // Transform the data to a cleaner format
    const assignments = (feePlans || []).map(fp => {
      // Determine entity type and data
      let entityType: string
      let entity: any

      if (fp.partner_id && fp.partner) {
        entityType = 'partner'
        entity = Array.isArray(fp.partner) ? fp.partner[0] : fp.partner
      } else if (fp.introducer_id && fp.introducer) {
        entityType = 'introducer'
        entity = Array.isArray(fp.introducer) ? fp.introducer[0] : fp.introducer
      } else if (fp.commercial_partner_id && fp.commercial_partner) {
        entityType = 'commercial_partner'
        entity = Array.isArray(fp.commercial_partner) ? fp.commercial_partner[0] : fp.commercial_partner
      } else {
        return null
      }

      return {
        fee_plan_id: fp.id,
        fee_plan_name: fp.name,
        fee_plan_status: fp.status || 'draft',
        is_active: fp.is_active,
        created_at: fp.created_at,
        entity_type: entityType,
        entity_id: entity?.id,
        entity_name: entity?.name || entity?.legal_name || 'Unknown',
        entity_status: entity?.status,
        entity_email: entity?.contact_email,
        fee_components: fp.fee_components || [],
      }
    }).filter(Boolean)

    return NextResponse.json({ data: assignments })
  } catch (error) {
    console.error('[GET /api/deals/[id]/partners] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/deals/[id]/partners
 * Assigns a partner/introducer/commercial partner to a deal by creating a fee_plan
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: dealId } = await context.params
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { entity_type, entity_id, fee_plan_name, fee_components } = body

    // Validate required fields
    if (!entity_type || !entity_id || !fee_plan_name) {
      return NextResponse.json(
        { error: 'Missing required fields: entity_type, entity_id, fee_plan_name' },
        { status: 400 }
      )
    }

    if (!['partner', 'introducer', 'commercial_partner'].includes(entity_type)) {
      return NextResponse.json(
        { error: 'Invalid entity_type. Must be partner, introducer, or commercial_partner' },
        { status: 400 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Verify the deal exists
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select('id, name, arranger_entity_id')
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Verify the entity exists
    const entityTable = entity_type === 'partner' ? 'partners'
      : entity_type === 'introducer' ? 'introducers'
      : 'commercial_partners'

    const { data: entity, error: entityError } = await serviceSupabase
      .from(entityTable)
      .select('id, status')
      .eq('id', entity_id)
      .single()

    if (entityError || !entity) {
      return NextResponse.json({ error: `${entity_type} not found` }, { status: 404 })
    }

    // Check if this entity is already assigned to this deal
    const entityColumn = entity_type === 'partner' ? 'partner_id'
      : entity_type === 'introducer' ? 'introducer_id'
      : 'commercial_partner_id'

    const { data: existingAssignment } = await serviceSupabase
      .from('fee_plans')
      .select('id')
      .eq('deal_id', dealId)
      .eq(entityColumn, entity_id)
      .single()

    if (existingAssignment) {
      return NextResponse.json(
        { error: `This ${entity_type.replace('_', ' ')} is already assigned to this deal` },
        { status: 409 }
      )
    }

    // Create the fee_plan record
    const feePlanData: any = {
      deal_id: dealId,
      name: fee_plan_name,
      is_active: true,
      is_default: false,
      status: 'draft',
      effective_from: new Date().toISOString().split('T')[0],
      created_by: user.id,
    }

    // Set the appropriate entity column
    if (entity_type === 'partner') {
      feePlanData.partner_id = entity_id
    } else if (entity_type === 'introducer') {
      feePlanData.introducer_id = entity_id
    } else {
      feePlanData.commercial_partner_id = entity_id
    }

    // If the deal has an arranger, set created_by_arranger_id
    if (deal.arranger_entity_id) {
      feePlanData.created_by_arranger_id = deal.arranger_entity_id
    }

    const { data: newFeePlan, error: createError } = await serviceSupabase
      .from('fee_plans')
      .insert(feePlanData)
      .select('id')
      .single()

    if (createError) {
      console.error('[POST /api/deals/[id]/partners] Create error:', createError)
      return NextResponse.json({ error: 'Failed to create fee plan' }, { status: 500 })
    }

    // Create fee components if provided
    if (fee_components && Array.isArray(fee_components) && fee_components.length > 0) {
      const componentsToInsert = fee_components
        // Filter: must have kind and either rate_bps or flat_amount (including 0 values)
        .filter(fc => fc.kind && (
          (fc.rate_bps !== undefined && fc.rate_bps !== null) ||
          (fc.flat_amount !== undefined && fc.flat_amount !== null)
        ))
        .map(fc => ({
          fee_plan_id: newFeePlan.id,
          kind: fc.kind,
          rate_bps: fc.rate_bps !== undefined && fc.rate_bps !== null ? fc.rate_bps : null,
          flat_amount: fc.flat_amount !== undefined && fc.flat_amount !== null ? fc.flat_amount : null,
          currency: fc.currency || 'USD',
        }))

      if (componentsToInsert.length > 0) {
        const { error: componentsError } = await serviceSupabase
          .from('fee_components')
          .insert(componentsToInsert)

        if (componentsError) {
          console.error('[POST /api/deals/[id]/partners] Components error:', componentsError)
          // Don't fail the whole operation, just log the error
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { fee_plan_id: newFeePlan.id }
    }, { status: 201 })

  } catch (error) {
    console.error('[POST /api/deals/[id]/partners] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/deals/[id]/partners
 * Removes a partner assignment by deleting the fee_plan
 * Query param: fee_plan_id
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: dealId } = await context.params
    const { searchParams } = new URL(request.url)
    const feePlanId = searchParams.get('fee_plan_id')

    if (!feePlanId) {
      return NextResponse.json({ error: 'Missing fee_plan_id parameter' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Verify the fee_plan exists and belongs to this deal
    const { data: feePlan, error: fpError } = await serviceSupabase
      .from('fee_plans')
      .select('id, deal_id')
      .eq('id', feePlanId)
      .eq('deal_id', dealId)
      .single()

    if (fpError || !feePlan) {
      return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 })
    }

    // Delete fee components first
    await serviceSupabase
      .from('fee_components')
      .delete()
      .eq('fee_plan_id', feePlanId)

    // Delete the fee plan
    const { error: deleteError } = await serviceSupabase
      .from('fee_plans')
      .delete()
      .eq('id', feePlanId)

    if (deleteError) {
      console.error('[DELETE /api/deals/[id]/partners] Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to remove partner' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/deals/[id]/partners] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
