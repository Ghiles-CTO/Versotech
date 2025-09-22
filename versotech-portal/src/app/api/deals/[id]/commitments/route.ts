import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating commitments
const createCommitmentSchema = z.object({
  investor_id: z.string().uuid('Valid investor ID is required'),
  requested_units: z.number().positive().optional(),
  requested_amount: z.number().positive().optional(),
  selected_fee_plan_id: z.string().uuid('Valid fee plan ID is required')
}).refine(
  (data) => data.requested_units || data.requested_amount,
  'Either requested_units or requested_amount must be provided'
)

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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

    const dealId = params.id

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createCommitmentSchema.parse(body)

    // Check if user is authorized to create commitments for this investor
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

    // If not staff, check if user is linked to the investor
    if (!profile.role.startsWith('staff_')) {
      const { data: investorLink } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)
        .eq('investor_id', validatedData.investor_id)
        .single()

      if (!investorLink) {
        return NextResponse.json(
          { error: 'Not authorized to create commitments for this investor' },
          { status: 403 }
        )
      }
    }

    // Verify deal and fee plan exist
    const { data: deal } = await supabase
      .from('deals')
      .select('id, name, status, offer_unit_price')
      .eq('id', dealId)
      .single()

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    const { data: feePlan } = await supabase
      .from('fee_plans')
      .select('id, name, deal_id')
      .eq('id', validatedData.selected_fee_plan_id)
      .eq('deal_id', dealId)
      .single()

    if (!feePlan) {
      return NextResponse.json(
        { error: 'Fee plan not found for this deal' },
        { status: 400 }
      )
    }

    // Calculate missing values
    let finalRequestedUnits = validatedData.requested_units
    let finalRequestedAmount = validatedData.requested_amount

    if (!finalRequestedUnits && finalRequestedAmount && deal.offer_unit_price) {
      finalRequestedUnits = finalRequestedAmount / deal.offer_unit_price
    }

    if (!finalRequestedAmount && finalRequestedUnits && deal.offer_unit_price) {
      finalRequestedAmount = finalRequestedUnits * deal.offer_unit_price
    }

    // Create the commitment
    const { data: commitment, error } = await supabase
      .from('deal_commitments')
      .insert({
        deal_id: dealId,
        investor_id: validatedData.investor_id,
        requested_units: finalRequestedUnits,
        requested_amount: finalRequestedAmount,
        selected_fee_plan_id: validatedData.selected_fee_plan_id,
        status: 'submitted',
        created_by: user.id
      })
      .select(`
        *,
        deals:deal_id (
          name
        ),
        investors:investor_id (
          legal_name
        ),
        fee_plans:selected_fee_plan_id (
          name,
          description
        )
      `)
      .single()

    if (error) {
      console.error('Commitment creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create commitment' },
        { status: 500 }
      )
    }

    // Create or update investor terms
    await supabase
      .from('investor_terms')
      .upsert({
        deal_id: dealId,
        investor_id: validatedData.investor_id,
        selected_fee_plan_id: validatedData.selected_fee_plan_id,
        status: 'active'
      }, {
        onConflict: 'deal_id,investor_id',
        ignoreDuplicates: false
      })

    // Generate term sheet (this would typically trigger an n8n workflow)
    // For now, we'll create a placeholder term sheet record
    const { data: termSheet } = await supabase
      .from('term_sheets')
      .insert({
        deal_id: dealId,
        investor_id: validatedData.investor_id,
        fee_plan_id: validatedData.selected_fee_plan_id,
        price_per_unit: deal.offer_unit_price,
        currency: 'USD',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        status: 'draft',
        terms_data: {
          commitment_amount: finalRequestedAmount,
          commitment_units: finalRequestedUnits,
          offer_price: deal.offer_unit_price,
          fee_plan: feePlan.name,
          generated_at: new Date().toISOString()
        },
        created_by: user.id
      })
      .select()
      .single()

    // Update commitment with term sheet reference
    if (termSheet) {
      await supabase
        .from('deal_commitments')
        .update({ term_sheet_id: termSheet.id })
        .eq('id', commitment.id)
    }

    // Log commitment creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'deal_commitments',
      entity_id: commitment.id,
      metadata: {
        endpoint: `/api/deals/${dealId}/commitments`,
        deal_name: deal.name,
        investor_id: validatedData.investor_id,
        requested_units: finalRequestedUnits,
        requested_amount: finalRequestedAmount,
        fee_plan_name: feePlan.name,
        term_sheet_id: termSheet?.id
      }
    })

    return NextResponse.json({
      commitment,
      termSheet,
      message: 'Commitment created successfully. Term sheet will be generated shortly.'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/commitments POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    const dealId = params.id
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('deal_commitments')
      .select(`
        *,
        investors:investor_id (
          legal_name
        ),
        fee_plans:selected_fee_plan_id (
          name,
          description
        ),
        term_sheets:term_sheet_id (
          id,
          status,
          valid_until,
          doc_id
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: commitments, error } = await query

    if (error) {
      console.error('Commitments fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch commitments' },
        { status: 500 }
      )
    }

    // Log access
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'deal_commitments',
      entity_id: dealId,
      metadata: {
        endpoint: `/api/deals/${dealId}/commitments`,
        commitment_count: commitments?.length || 0,
        status_filter: status
      }
    })

    return NextResponse.json({
      commitments: commitments || [],
      hasData: (commitments && commitments.length > 0)
    })

  } catch (error) {
    console.error('API /deals/[id]/commitments GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
