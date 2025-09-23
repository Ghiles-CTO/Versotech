import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating deal commitments
const createCommitmentSchema = z.object({
  investor_id: z.string().uuid('Invalid investor ID'),
  requested_units: z.number().positive('Requested units must be positive').optional(),
  requested_amount: z.number().positive('Requested amount must be positive').optional(),
  selected_fee_plan_id: z.string().uuid('Invalid fee plan ID').optional()
}).refine(
  data => data.requested_units || data.requested_amount,
  { message: "Either requested_units or requested_amount must be provided" }
)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = params.id
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validation = createCommitmentSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { investor_id, requested_units, requested_amount, selected_fee_plan_id } = validation.data

    // Verify user has permission to create commitments for this investor
    const { data: investorLink } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('investor_id', investor_id)
      .eq('user_id', user.id)
      .single()

    // Also check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role && ['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)
    
    if (!investorLink && !isStaff) {
      return NextResponse.json(
        { error: 'Not authorized to create commitments for this investor' },
        { status: 403 }
      )
    }

    // Verify deal exists and is open
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

    if (!['open', 'allocation_pending'].includes(deal.status)) {
      return NextResponse.json(
        { error: `Deal is not open for commitments. Current status: ${deal.status}` },
        { status: 400 }
      )
    }

    // Get or create default fee plan if none specified
    let finalFeeplanId = selected_fee_plan_id
    
    if (!finalFeeplanId) {
      const { data: defaultFeePlan } = await supabase
        .from('fee_plans')
        .select('id')
        .eq('deal_id', dealId)
        .eq('is_default', true)
        .single()
      
      finalFeeplanId = defaultFeePlan?.id
    }

    // Create the commitment
    const { data: commitment, error: commitmentError } = await serviceSupabase
      .from('deal_commitments')
      .insert({
        deal_id: dealId,
        investor_id,
        requested_units,
        requested_amount,
        selected_fee_plan_id: finalFeeplanId,
        status: 'submitted',
        created_by: user.id
      })
      .select(`
        *,
        investors (
          legal_name
        ),
        fee_plans:selected_fee_plan_id (
          name,
          description
        )
      `)
      .single()

    if (commitmentError) {
      console.error('Commitment creation error:', commitmentError)
      return NextResponse.json(
        { error: 'Failed to create commitment' },
        { status: 500 }
      )
    }

    // TODO: Trigger n8n workflow to generate term sheet
    // This would call an n8n webhook to generate a personalized term sheet PDF
    // For now, we'll create a placeholder term sheet record

    let termSheetId = null
    if (finalFeeplanId) {
      const { data: termSheet, error: termSheetError } = await serviceSupabase
        .from('term_sheets')
        .insert({
          deal_id: dealId,
          investor_id,
          fee_plan_id: finalFeeplanId,
          price_per_unit: deal.offer_unit_price,
          currency: 'USD',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          status: 'draft',
          version: 1,
          terms_data: {
            requested_units,
            requested_amount,
            commitment_date: new Date().toISOString()
          },
          created_by: user.id
        })
        .select('id')
        .single()

      if (!termSheetError) {
        termSheetId = termSheet.id
        
        // Update commitment with term sheet reference
        await serviceSupabase
          .from('deal_commitments')
          .update({ term_sheet_id: termSheetId })
          .eq('id', commitment.id)
      }
    }

    // Log the commitment creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.DEALS,
      entity_id: commitment.id,
      metadata: {
        deal_id: dealId,
        investor_id,
        requested_units: requested_units?.toString(),
        requested_amount: requested_amount?.toString(),
        fee_plan_id: finalFeeplanId,
        term_sheet_id: termSheetId,
        created_by: profile?.display_name
      }
    })

    return NextResponse.json({
      success: true,
      commitment_id: commitment.id,
      term_sheet_id: termSheetId,
      commitment,
      message: `Successfully created commitment for ${commitment.investors?.legal_name}`
    })

  } catch (error) {
    console.error('Commitment creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to view commitments for a deal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = params.id
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get commitments for this deal (RLS will filter appropriately)
    const { data: commitments, error } = await supabase
      .from('deal_commitments')
      .select(`
        *,
        investors (
          legal_name,
          country
        ),
        fee_plans:selected_fee_plan_id (
          name,
          description
        ),
        term_sheets:term_sheet_id (
          id,
          status,
          version,
          valid_until
        ),
        created_by_profile:created_by (
          display_name
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching commitments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch commitments' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const totalUnits = commitments?.reduce((sum, c) => sum + parseFloat(c.requested_units || '0'), 0) || 0
    const totalAmount = commitments?.reduce((sum, c) => sum + parseFloat(c.requested_amount || '0'), 0) || 0
    const commitmentsByStatus = commitments?.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      commitments: commitments || [],
      summary: {
        total_units: totalUnits,
        total_amount: totalAmount,
        commitment_count: commitments?.length || 0,
        by_status: commitmentsByStatus
      }
    })

  } catch (error) {
    console.error('Commitments GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}