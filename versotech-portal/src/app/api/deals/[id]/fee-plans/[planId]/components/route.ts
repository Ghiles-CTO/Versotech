import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

const createFeeComponentSchema = z.object({
  kind: z.enum(['subscription', 'management', 'performance', 'spread_markup', 'flat', 'other', 'bd_fee', 'finra_fee']),
  calc_method: z.enum([
    'percent_of_investment',
    'percent_per_annum',
    'percent_of_profit',
    'per_unit_spread',
    'fixed',
    'percent_of_commitment',
    'percent_of_nav',
    'fixed_amount'
  ]).optional(),
  rate_bps: z.number().int().min(0).max(100000).optional(), // Max 1000%
  flat_amount: z.number().positive().optional(),
  frequency: z.enum(['one_time', 'annual', 'quarterly', 'monthly', 'on_exit', 'on_event']).default('one_time'),
  hurdle_rate_bps: z.number().int().min(0).optional(),
  has_high_water_mark: z.boolean().optional(),
  has_catchup: z.boolean().optional(),
  catchup_rate_bps: z.number().int().min(0).optional(),
  notes: z.string().optional()
}).refine(
  (data) => {
    // Validate that appropriate fields are provided based on calc_method
    if (data.calc_method) {
      return data.rate_bps !== undefined
    }
    if (data.kind === 'flat') {
      return data.flat_amount !== undefined
    }
    return true
  },
  { message: 'Must provide rate_bps for percentage methods or flat_amount for flat fees' }
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
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

    const { id: dealId, planId } = await params
    const body = await request.json()
    const validatedData = createFeeComponentSchema.parse(body)

    // Verify fee plan belongs to this deal
    const { data: feePlan } = await supabase
      .from('fee_plans')
      .select('id, deal_id')
      .eq('id', planId)
      .eq('deal_id', dealId)
      .single()

    if (!feePlan) {
      return NextResponse.json(
        { error: 'Fee plan not found' },
        { status: 404 }
      )
    }

    // Create fee component
    const { data: feeComponent, error } = await supabase
      .from('fee_components')
      .insert({
        fee_plan_id: planId,
        kind: validatedData.kind,
        calc_method: validatedData.calc_method,
        rate_bps: validatedData.rate_bps,
        flat_amount: validatedData.flat_amount,
        frequency: validatedData.frequency,
        hurdle_rate_bps: validatedData.hurdle_rate_bps,
        has_high_water_mark: validatedData.has_high_water_mark ?? false,
        has_catchup: validatedData.has_catchup ?? false,
        catchup_rate_bps: validatedData.catchup_rate_bps,
        notes: validatedData.notes
      })
      .select()
      .single()

    if (error) {
      console.error('Create fee component error:', error)
      return NextResponse.json(
        { error: 'Failed to create fee component' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'fee_components',
      entity_id: feeComponent.id,
      metadata: {
        fee_plan_id: planId,
        deal_id: dealId,
        kind: validatedData.kind,
        rate_bps: validatedData.rate_bps
      }
    })

    return NextResponse.json({ feeComponent }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/fee-plans/[planId]/components POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
