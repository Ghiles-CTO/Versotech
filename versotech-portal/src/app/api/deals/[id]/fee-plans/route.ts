import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

const createFeePlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  is_default: z.boolean().default(false)
})

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

    // Fetch fee plans with components
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
          high_watermark,
          notes
        )
      `)
      .eq('deal_id', dealId)
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
    const validatedData = createFeePlanSchema.parse(body)

    // If setting as default, unset other defaults first
    if (validatedData.is_default) {
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
        deal_id: dealId,
        name: validatedData.name,
        description: validatedData.description,
        is_default: validatedData.is_default
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

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'fee_plans',
      entity_id: feePlan.id,
      metadata: {
        deal_id: dealId,
        name: validatedData.name,
        is_default: validatedData.is_default
      }
    })

    return NextResponse.json({ feePlan }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/fee-plans POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
