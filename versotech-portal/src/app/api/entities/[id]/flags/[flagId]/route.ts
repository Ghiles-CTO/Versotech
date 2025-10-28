import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

const updateFlagSchema = z.object({
  title: z.string().min(1).optional(),
  severity: z.enum(['critical', 'warning', 'info', 'success']).optional(),
  flag_type: z.string().optional(),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  status: z.enum(['open', 'in_progress', 'closed']).optional(),
  resolution_notes: z.string().optional().nullable()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; flagId: string }> }
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

    const { id: vehicleId, flagId } = await params
    const body = await request.json().catch(() => ({}))
    const payload = updateFlagSchema.parse(body)

    const updates: Record<string, any> = { ...payload }

    if (payload.status === 'closed') {
      updates.resolved_at = new Date().toISOString()
      updates.resolved_by = user.id.startsWith('demo-') ? null : user.id
    } else if (payload.status) {
      updates.resolved_at = null
      updates.resolved_by = null
    }

    const { data: flag, error } = await serviceClient
      .from('entity_flags')
      .update(updates)
      .eq('vehicle_id', vehicleId)
      .eq('id', flagId)
      .select('*')
      .single()

    if (error || !flag) {
      console.error('[EntityFlags] Update error:', error)
      return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 })
    }

    await serviceClient.from('entity_events').insert({
      vehicle_id: vehicleId,
      event_type: 'flag_updated',
      description: `Flag ${flag.status === 'closed' ? 'resolved' : 'updated'}: ${flag.title}`,
      changed_by: user.id.startsWith('demo-') ? null : user.id,
      payload: {
        flag_id: flag.id,
        status: flag.status,
        severity: flag.severity
      }
    })

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.VEHICLES,
      entity_id: vehicleId,
      metadata: {
        endpoint: `/api/entities/${vehicleId}/flags/${flagId}`,
        flag_id: flagId,
        status: flag.status
      }
    })

    return NextResponse.json({ flag })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: (error as any).errors }, { status: 400 })
    }

    console.error('[EntityFlags] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; flagId: string }> }
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

    const { id: vehicleId, flagId } = await params

    const { error } = await serviceClient
      .from('entity_flags')
      .delete()
      .eq('vehicle_id', vehicleId)
      .eq('id', flagId)

    if (error) {
      console.error('[EntityFlags] Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete flag' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.VEHICLES,
      entity_id: vehicleId,
      metadata: {
        endpoint: `/api/entities/${vehicleId}/flags/${flagId}`,
        flag_id: flagId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[EntityFlags] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
