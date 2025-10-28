import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

const createFlagSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  flag_type: z.string().min(1, 'Flag type is required'),
  severity: z.enum(['critical', 'warning', 'info', 'success']).default('warning'),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  status: z.enum(['open', 'in_progress', 'closed']).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = createServiceClient()
    const isStaff = await isStaffUser(serviceClient, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id } = await params
    const statusFilter = request.nextUrl.searchParams.get('status')

    let query = serviceClient
      .from('entity_flags')
      .select('*')
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false })

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('[EntityFlags] Fetch error:', error)
      return NextResponse.json({ error: 'Failed to load flags' }, { status: 500 })
    }

    return NextResponse.json({ flags: data || [] })
  } catch (error) {
    console.error('[EntityFlags] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = createServiceClient()
    const isStaff = await isStaffUser(serviceClient, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const payload = createFlagSchema.parse(body)
    const { id: vehicleId } = await params

    const { data: flag, error } = await serviceClient
      .from('entity_flags')
      .insert({
        vehicle_id: vehicleId,
        title: payload.title.trim(),
        flag_type: payload.flag_type,
        severity: payload.severity,
        description: payload.description?.trim() || null,
        status: payload.status || 'open',
        due_date: payload.due_date || null
      })
      .select('*')
      .single()

    if (error || !flag) {
      console.error('[EntityFlags] Create error:', error)
      return NextResponse.json({ error: 'Failed to create flag' }, { status: 500 })
    }

    await serviceClient.from('entity_events').insert({
      vehicle_id: vehicleId,
      event_type: 'flag_created',
      description: `Flag created: ${flag.title}`,
      changed_by: user.id.startsWith('demo-') ? null : user.id,
      payload: {
        flag_id: flag.id,
        severity: flag.severity,
        flag_type: flag.flag_type
      }
    })

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.VEHICLES,
      entity_id: vehicleId,
      metadata: {
        endpoint: `/api/entities/${vehicleId}/flags`,
        flag_id: flag.id,
        severity: flag.severity
      }
    })

    return NextResponse.json({ flag }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: (error as any).errors }, { status: 400 })
    }

    console.error('[EntityFlags] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
