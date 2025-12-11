import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createPositionSchema = z.object({
  investor_id: z.string().uuid(),
  units: z.number().positive(),
  cost_basis: z.number().nonnegative().optional(),
  last_nav: z.number().positive().optional(),
  as_of_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

async function requireStaff() {
  const authSupabase = await createClient()
  const { data: { user }, error: authError } = await authSupabase.auth.getUser()

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await authSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
    return { error: NextResponse.json({ error: 'Staff access required' }, { status: 403 }) }
  }

  return { user }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const staffCheck = await requireStaff()
    if (staffCheck.error) return staffCheck.error

    const { vehicleId } = await params
    const supabase = createServiceClient()

    const { data: positions, error } = await supabase
      .from('positions')
      .select(`
        *,
        investor:investors (
          id,
          legal_name,
          display_name,
          type,
          email
        )
      `)
      .eq('vehicle_id', vehicleId)
      .order('as_of_date', { ascending: false })

    if (error) {
      console.error('Positions fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
    }

    return NextResponse.json({ positions: positions || [] })
  } catch (error: any) {
    console.error('Positions GET error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const staffCheck = await requireStaff()
    if (staffCheck.error) return staffCheck.error

    const { vehicleId } = await params
    const body = await request.json()
    const validation = createPositionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid position data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const payload = { ...validation.data, vehicle_id: vehicleId }

    const { data: position, error: upsertError } = await supabase
      .from('positions')
      .upsert(payload, { onConflict: 'investor_id,vehicle_id' })
      .select()
      .single()

    if (upsertError || !position) {
      console.error('Position upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to save position' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: staffCheck.user!.id,
      action: AuditActions.CREATE,
      entity: 'positions',
      entity_id: position.id,
      metadata: payload
    })

    return NextResponse.json({ position }, { status: 201 })
  } catch (error: any) {
    console.error('Positions POST error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

