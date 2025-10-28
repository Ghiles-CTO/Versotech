import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

const directorUpdateSchema = z.object({
  role: z.string().optional(),
  email: z.string().email().optional().nullable(),
  effective_from: z.string().optional(),
  effective_to: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; directorId: string }> }
) {
  try {
    const { id, directorId } = await params
    const serviceSupabase = createServiceClient()
    const clientSupabase = await createClient()

    const { user, error: authError } = await getAuthenticatedUser(clientSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(serviceSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const validated = directorUpdateSchema.parse(body)

    if (Object.keys(validated).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    // Filter out undefined values
    const updatePayload = Object.entries(validated).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, any>)

    const { data, error } = await serviceSupabase
      .from('entity_directors')
      .update(updatePayload)
      .eq('vehicle_id', id)
      .eq('id', directorId)
      .select()
      .single()

    if (error || !data) {
      console.error('[Entities] Director update error:', error)
      return NextResponse.json(
        { error: 'Failed to update director', details: error?.message },
        { status: 500 }
      )
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.VEHICLES,
      entity_id: id,
      metadata: {
        endpoint: `/api/entities/${id}/directors/${directorId}`,
        director_id: data.id,
        changes: updatePayload
      }
    })

    return NextResponse.json({ director: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }

    console.error('[Entities] Director PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; directorId: string }> }
) {
  try {
    const { id, directorId } = await params
    const serviceSupabase = createServiceClient()
    const clientSupabase = await createClient()

    const { user, error: authError } = await getAuthenticatedUser(clientSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(serviceSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { error } = await serviceSupabase
      .from('entity_directors')
      .delete()
      .eq('vehicle_id', id)
      .eq('id', directorId)

    if (error) {
      console.error('[Entities] Director delete error:', error)
      return NextResponse.json({ error: 'Failed to delete director' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.VEHICLES,
      entity_id: id,
      metadata: {
        endpoint: `/api/entities/${id}/directors/${directorId}`,
        director_id: directorId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Entities] Director DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
