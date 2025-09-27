import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating commitments
const createCommitmentSchema = z.object({
  deal_id: z.string().uuid(),
  investor_id: z.string().uuid(),
  requested_units: z.number().positive(),
  requested_amount: z.number().positive(),
  selected_fee_plan_id: z.string().uuid().optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
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

    // Validate request body
    const body = await request.json()
    const validatedData = createCommitmentSchema.parse(body)

    // Verify user has access to this investor
    const { data: investorAccess } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .eq('investor_id', validatedData.investor_id)
      .single()

    if (!investorAccess) {
      return NextResponse.json(
        { error: 'Access denied to this investor profile' },
        { status: 403 }
      )
    }

    // Verify user has access to this deal
    const { data: dealAccess } = await supabase
      .from('deal_memberships')
      .select('deal_id')
      .eq('deal_id', validatedData.deal_id)
      .eq('user_id', user.id)
      .single()

    if (!dealAccess) {
      return NextResponse.json(
        { error: 'Access denied to this deal' },
        { status: 403 }
      )
    }

    // Verify fee plan exists and belongs to this deal (if provided)
    if (validatedData.selected_fee_plan_id) {
      const { data: feePlan } = await supabase
        .from('fee_plans')
        .select('id')
        .eq('id', validatedData.selected_fee_plan_id)
        .eq('deal_id', validatedData.deal_id)
        .single()

      if (!feePlan) {
        return NextResponse.json(
          { error: 'Invalid fee plan for this deal' },
          { status: 400 }
        )
      }
    }

    // Use service client to create commitment (bypasses RLS)
    const { data: commitment, error: commitmentError } = await serviceSupabase
      .from('deal_commitments')
      .insert({
        deal_id: validatedData.deal_id,
        investor_id: validatedData.investor_id,
        requested_units: validatedData.requested_units,
        requested_amount: validatedData.requested_amount,
        selected_fee_plan_id: validatedData.selected_fee_plan_id || null,
        notes: validatedData.notes || null,
        status: 'submitted',
        created_by: user.id
      })
      .select()
      .single()

    if (commitmentError) {
      console.error('Commitment creation error:', commitmentError)
      return NextResponse.json(
        { error: 'Failed to create commitment', details: commitmentError.message },
        { status: 500 }
      )
    }

    // Create term sheet if fee plan is selected
    if (validatedData.selected_fee_plan_id) {
      const { error: termSheetError } = await serviceSupabase
        .from('term_sheets')
        .insert({
          deal_id: validatedData.deal_id,
          investor_id: validatedData.investor_id,
          fee_plan_id: validatedData.selected_fee_plan_id,
          price_per_unit: validatedData.requested_amount / validatedData.requested_units,
          currency: 'USD', // TODO: Get from deal
          status: 'draft',
          terms_data: {
            requested_units: validatedData.requested_units,
            requested_amount: validatedData.requested_amount,
            notes: validatedData.notes
          },
          created_by: user.id
        })

      if (termSheetError) {
        console.warn('Term sheet creation failed:', termSheetError)
        // Don't fail the whole operation for this
      }
    }

    return NextResponse.json({
      success: true,
      data: commitment
    })

  } catch (error) {
    console.error('Commitment API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get investor IDs for this user
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json(
        { error: 'No investor profile found' },
        { status: 404 }
      )
    }

    const investorIds = investorLinks.map(link => link.investor_id)
    const dealId = searchParams.get('deal_id')

    let query = supabase
      .from('deal_commitments')
      .select(`
        *,
        deals (
          id,
          name,
          status
        ),
        fee_plans (
          id,
          name,
          description
        )
      `)
      .in('investor_id', investorIds)
      .order('created_at', { ascending: false })

    if (dealId) {
      query = query.eq('deal_id', dealId)
    }

    const { data: commitments, error } = await query

    if (error) {
      console.error('Commitments fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch commitments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: commitments
    })

  } catch (error) {
    console.error('Commitments GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
