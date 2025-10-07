import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

// Schema for adding share lot
const createShareLotSchema = z.object({
  source_id: z.string().uuid().optional(),
  source_type: z.enum(['company', 'fund', 'colleague', 'other']),
  counterparty_name: z.string().optional(),
  units_total: z.number().positive(),
  unit_cost: z.number().positive(),
  currency: z.string().default('USD'),
  acquired_at: z.string().optional(),
  lockup_until: z.string().optional(),
  notes: z.string().optional()
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

    // Fetch share lots with source info
    const { data: shareLots, error } = await supabase
      .from('share_lots')
      .select(`
        *,
        share_sources (
          id,
          kind,
          counterparty_name,
          notes
        )
      `)
      .eq('deal_id', dealId)
      .order('acquired_at', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Fetch share lots error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch inventory' },
        { status: 500 }
      )
    }

    return NextResponse.json({ inventory: shareLots || [] })

  } catch (error) {
    console.error('API /deals/[id]/inventory GET error:', error)
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

    // Check if user is staff (works with both real auth and demo mode)
    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id: dealId } = await params
    const body = await request.json()
    const validatedData = createShareLotSchema.parse(body)

    // Create or get share source if needed
    let sourceId = validatedData.source_id

    if (!sourceId) {
      // Create new share source
      const { data: newSource, error: sourceError } = await supabase
        .from('share_sources')
        .insert({
          kind: validatedData.source_type,
          counterparty_name: validatedData.counterparty_name,
          notes: validatedData.notes
        })
        .select()
        .single()

      if (sourceError) {
        console.error('Create source error:', sourceError)
        return NextResponse.json(
          { error: 'Failed to create share source' },
          { status: 500 }
        )
      }

      sourceId = newSource.id
    }

    // Create share lot
    const { data: shareLot, error } = await supabase
      .from('share_lots')
      .insert({
        deal_id: dealId,
        source_id: sourceId,
        units_total: validatedData.units_total,
        unit_cost: validatedData.unit_cost,
        currency: validatedData.currency,
        acquired_at: validatedData.acquired_at,
        lockup_until: validatedData.lockup_until,
        units_remaining: validatedData.units_total, // Initially all units available
        status: 'available'
      })
      .select(`
        *,
        share_sources (
          id,
          kind,
          counterparty_name,
          notes
        )
      `)
      .single()

    if (error) {
      console.error('Create share lot error:', error)
      return NextResponse.json(
        { error: 'Failed to create share lot' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'share_lots',
      entity_id: shareLot.id,
      metadata: {
        deal_id: dealId,
        units_total: validatedData.units_total,
        unit_cost: validatedData.unit_cost
      }
    })

    return NextResponse.json({ shareLot }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/inventory POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}