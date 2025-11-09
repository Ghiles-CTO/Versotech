import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: dealId } = await params

    // Get deal with related data
    const { data: deal, error } = await supabase
      .from('deals')
      .select(`
        *,
        vehicles (
          id,
          name,
          type,
          currency
        ),
        deal_memberships (
          user_id,
          investor_id,
          role,
          invited_at,
          accepted_at,
          profiles:user_id (
            id,
            display_name,
            email
          ),
          investors:investor_id (
            id,
            legal_name
          )
        ),
        fee_plans (
          id,
          name,
          description,
          is_default,
          fee_components (
            id,
            kind,
            calc_method,
            rate_bps,
            flat_amount,
            frequency,
            notes
          )
        ),
        share_lots (
          id,
          source_id,
          units_total,
          unit_cost,
          units_remaining,
          status,
          acquired_at,
          lockup_until,
          share_sources:source_id (
            kind,
            counterparty_name
          )
        )
      `)
      .eq('id', dealId)
      .single()

    if (error || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Get inventory summary using the database function
    const { data: inventorySummary } = await supabase
      .rpc('fn_deal_inventory_summary', { p_deal_id: dealId })
      .single()

    // REMOVED: reservations table deleted - deprecated workflow

    const { data: allocations } = await supabase
      .from('allocations')
      .select(`
        id,
        investor_id,
        unit_price,
        units,
        status,
        approved_at,
        investors:investor_id (
          legal_name
        )
      `)
      .eq('deal_id', dealId)
      .order('approved_at', { ascending: false })
      .limit(10)

    // Log access
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: AuditEntities.DEALS,
      entity_id: dealId,
      metadata: {
        endpoint: `/api/deals/${dealId}`,
        deal_name: deal.name,
        deal_status: deal.status
      }
    })

    return NextResponse.json({
      deal,
      inventorySummary,
      allocations: allocations || []
      // reservations removed - table deleted
    })

  } catch (error) {
    console.error('API /deals/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServiceClient()

    // Get the authenticated user from regular client
    const regularSupabase = await createClient()
    const { data: { user }, error: authError } = await regularSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    const { id: dealId } = await params
    const updates = await request.json()

    // Remove any fields that shouldn't be updated directly
    delete updates.id
    delete updates.created_at
    delete updates.created_by

    // Update the deal
    const { data: deal, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', dealId)
      .select()
      .single()

    if (error) {
      console.error('Deal update error:', error)
      return NextResponse.json(
        { error: 'Failed to update deal' },
        { status: 500 }
      )
    }

    // Log update
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.DEALS,
      entity_id: dealId,
      metadata: {
        endpoint: `/api/deals/${dealId}`,
        updated_fields: Object.keys(updates),
        deal_name: deal?.name
      }
    })

    return NextResponse.json(deal)

  } catch (error) {
    console.error('API /deals/[id] PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

