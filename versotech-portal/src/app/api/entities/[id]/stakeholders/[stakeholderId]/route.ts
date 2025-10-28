import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

const stakeholderUpdateSchema = z.object({
  role: z
    .enum(['lawyer', 'accountant', 'auditor', 'administrator', 'strategic_partner', 'shareholder', 'other'])
    .optional(),
  company_name: z.string().min(1, 'Company name is required').optional(),
  contact_person: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  effective_from: z.string().optional(),
  effective_to: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stakeholderId: string }> }
) {
  try {
    const { id, stakeholderId } = await params
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
    const validated = stakeholderUpdateSchema.parse(body)

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
      .from('entity_stakeholders')
      .update(updatePayload)
      .eq('vehicle_id', id)
      .eq('id', stakeholderId)
      .select()
      .single()

    if (error || !data) {
      console.error('[Entities] Stakeholder update error:', error)
      return NextResponse.json(
        { error: 'Failed to update stakeholder', details: error?.message },
        { status: 500 }
      )
    }

    // Create entity event
    await serviceSupabase.from('entity_events').insert({
      vehicle_id: id,
      event_type: 'stakeholder_updated',
      description: `Updated ${data.role}: ${data.company_name}`,
      changed_by: user.id
    })

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.VEHICLES,
      entity_id: id,
      metadata: {
        endpoint: `/api/entities/${id}/stakeholders/${stakeholderId}`,
        stakeholder_id: data.id,
        changes: updatePayload
      }
    })

    return NextResponse.json({ stakeholder: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }

    console.error('[Entities] Stakeholder PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; stakeholderId: string }> }
) {
  try {
    const { id, stakeholderId } = await params
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

    // Get stakeholder info before deletion for event logging
    const { data: stakeholder } = await serviceSupabase
      .from('entity_stakeholders')
      .select('role, company_name')
      .eq('vehicle_id', id)
      .eq('id', stakeholderId)
      .single()

    const { error } = await serviceSupabase
      .from('entity_stakeholders')
      .delete()
      .eq('vehicle_id', id)
      .eq('id', stakeholderId)

    if (error) {
      console.error('[Entities] Stakeholder delete error:', error)
      return NextResponse.json({ error: 'Failed to delete stakeholder' }, { status: 500 })
    }

    // Create entity event
    if (stakeholder) {
      await serviceSupabase.from('entity_events').insert({
        vehicle_id: id,
        event_type: 'stakeholder_removed',
        description: `Removed ${stakeholder.role}: ${stakeholder.company_name}`,
        changed_by: user.id
      })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.VEHICLES,
      entity_id: id,
      metadata: {
        endpoint: `/api/entities/${id}/stakeholders/${stakeholderId}`,
        stakeholder_id: stakeholderId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Entities] Stakeholder DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
