import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

const directorSchema = z.object({
  full_name: z.string().min(1, 'Director name is required'),
  role: z.string().optional(),
  email: z.string().email().optional(),
  effective_from: z.string().optional(),
  effective_to: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('entity_directors')
      .select('id, full_name, role, email, effective_from, effective_to, notes, created_at')
      .eq('vehicle_id', params.id)
      .order('effective_from', { ascending: false })

    if (error) {
      console.error('[Entities] Directors fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch directors' }, { status: 500 })
    }

    return NextResponse.json({ directors: data || [] })
  } catch (error) {
    console.error('[Entities] Directors GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    const validated = directorSchema.parse(body)

    const payload = {
      vehicle_id: params.id,
      full_name: validated.full_name,
      role: validated.role || null,
      email: validated.email || null,
      effective_from: validated.effective_from || new Date().toISOString(),
      effective_to: validated.effective_to || null,
      notes: validated.notes || null
    }

    const { data, error } = await serviceSupabase
      .from('entity_directors')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('[Entities] Director create error:', error)
      return NextResponse.json({ error: 'Failed to create director' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.VEHICLES,
      entity_id: params.id,
      metadata: {
        endpoint: `/api/entities/${params.id}/directors`,
        director_id: data.id,
        full_name: data.full_name
      }
    })

    return NextResponse.json({ director: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('[Entities] Directors POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const directorUpdateSchema = directorSchema.partial()

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    const { directorId } = validated as any
    if (!directorId) {
      return NextResponse.json({ error: 'directorId is required for updates' }, { status: 400 })
    }

    const updatePayload = {
      full_name: validated.full_name,
      role: validated.role,
      email: validated.email,
      effective_from: validated.effective_from,
      effective_to: validated.effective_to,
      notes: validated.notes
    }

    const { data, error } = await serviceSupabase
      .from('entity_directors')
      .update(updatePayload)
      .eq('vehicle_id', params.id)
      .eq('id', directorId)
      .select()
      .single()

    if (error || !data) {
      console.error('[Entities] Director update error:', error)
      return NextResponse.json({ error: 'Failed to update director', details: error?.message }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.VEHICLES,
      entity_id: params.id,
      metadata: {
        endpoint: `/api/entities/${params.id}/directors`,
        director_id: data.id
      }
    })

    return NextResponse.json({ director: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }

    console.error('[Entities] Directors PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url)
    const directorId = url.searchParams.get('directorId')

    if (!directorId) {
      return NextResponse.json({ error: 'directorId query parameter required' }, { status: 400 })
    }

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
      .eq('vehicle_id', params.id)
      .eq('id', directorId)

    if (error) {
      console.error('[Entities] Director delete error:', error)
      return NextResponse.json({ error: 'Failed to delete director' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.VEHICLES,
      entity_id: params.id,
      metadata: {
        endpoint: `/api/entities/${params.id}/directors`,
        director_id: directorId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Entities] Directors DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


