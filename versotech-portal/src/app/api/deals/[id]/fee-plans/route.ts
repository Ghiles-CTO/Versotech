import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { createFeePlanSchema } from '@/lib/fees/validation'

const createDealFeePlanSchema = createFeePlanSchema.omit({ deal_id: true })

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

    // Fetch fee plans with components, term sheet, entity info, and generated agreements
    const { data: feePlans, error } = await supabase
      .from('fee_plans')
      .select(`
        *,
        fee_components (
          id,
          kind,
          calc_method,
          rate_bps,
          flat_amount,
          frequency,
          hurdle_rate_bps,
          has_high_water_mark,
          has_catchup,
          catchup_rate_bps,
          notes,
          duration_periods,
          duration_unit,
          payment_schedule,
          base_calculation,
          tier_threshold_multiplier,
          next_tier_component_id
        ),
        term_sheet:term_sheet_id (
          id,
          version,
          status,
          term_sheet_date,
          subscription_fee_percent,
          management_fee_percent,
          carried_interest_percent
        ),
        introducer:introducer_id (
          id,
          legal_name,
          contact_name,
          email
        ),
        partner:partner_id (
          id,
          name,
          legal_name,
          contact_name,
          contact_email
        ),
        commercial_partner:commercial_partner_id (
          id,
          name,
          legal_name,
          contact_name,
          contact_email
        ),
        introducer_agreement:generated_agreement_id (
          id,
          reference_number,
          status,
          pdf_url
        ),
        placement_agreement:generated_placement_agreement_id (
          id,
          reference_number,
          status,
          pdf_url
        )
      `)
      .eq('deal_id', dealId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch fee plans error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch fee plans' },
        { status: 500 }
      )
    }

    return NextResponse.json({ feePlans: feePlans || [] })

  } catch (error) {
    console.error('API /deals/[id]/fee-plans GET error:', error)
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
    const body = await request.json()
    const validation = createDealFeePlanSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { components, ...feePlanData } = validation.data

    // Validate term sheet belongs to this deal and is published
    const { data: termSheet, error: termSheetError } = await supabase
      .from('deal_fee_structures')
      .select('id, status')
      .eq('id', feePlanData.term_sheet_id)
      .eq('deal_id', dealId)
      .single()

    if (termSheetError || !termSheet) {
      return NextResponse.json(
        { error: 'Invalid term sheet', details: 'The selected term sheet does not belong to this deal' },
        { status: 400 }
      )
    }

    if (termSheet.status !== 'published') {
      return NextResponse.json(
        { error: 'Term sheet not published', details: 'Fee plans must be linked to a published term sheet' },
        { status: 400 }
      )
    }

    // If setting as default, unset other defaults first
    if (feePlanData.is_default) {
      await supabase
        .from('fee_plans')
        .update({ is_default: false })
        .eq('deal_id', dealId)
        .eq('is_default', true)
    }

    // Create fee plan
    const { data: feePlan, error } = await supabase
      .from('fee_plans')
      .insert({
        ...feePlanData,
        deal_id: dealId,
        is_active: true,
        created_by: user.id,
        effective_from: feePlanData.effective_from || new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (error) {
      console.error('Create fee plan error:', error)
      return NextResponse.json(
        { error: 'Failed to create fee plan' },
        { status: 500 }
      )
    }

    // Create fee components (if provided)
    if (components && components.length > 0) {
      const componentInserts = components.map((component) => ({
        ...component,
        fee_plan_id: feePlan.id,
      }))

      const { error: componentsError } = await supabase
        .from('fee_components')
        .insert(componentInserts)

      if (componentsError) {
        console.error('Create fee components error:', componentsError)
        return NextResponse.json(
          { error: 'Failed to create fee components' },
          { status: 500 }
        )
      }
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'fee_plans',
      entity_id: feePlan.id,
      metadata: {
        deal_id: dealId,
        name: feePlanData.name,
        term_sheet_id: feePlanData.term_sheet_id,
        is_default: feePlanData.is_default
      }
    })

    return NextResponse.json({ feePlan }, { status: 201 })

  } catch (error) {
    console.error('API /deals/[id]/fee-plans POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
