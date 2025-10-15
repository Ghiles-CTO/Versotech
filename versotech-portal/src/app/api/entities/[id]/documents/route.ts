import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { z } from 'zod'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(client)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Staff get everything, investors rely on RLS to filter
    const { data, error } = await client
      .from('documents')
      .select('id, name, type, created_at, created_by, entity_id, deal_id, vehicle_id')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Entities] Documents fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json({ documents: data || [] })
  } catch (error) {
    console.error('[Entities] Documents GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const uploadSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  document_id: z.string().uuid('document_id is required'),
  description: z.string().optional()
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const validated = uploadSchema.parse(body)

    const { data: existingDoc, error: fetchError } = await serviceSupabase
      .from('documents')
      .select('id, entity_id')
      .eq('id', validated.document_id)
      .single()

    if (fetchError || !existingDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const { data: updatedDoc, error: updateError } = await serviceSupabase
      .from('documents')
      .update({
        entity_id: id,
        name: validated.name || existingDoc.name,
        type: validated.type || existingDoc.type,
        description: validated.description || null
      })
      .eq('id', validated.document_id)
      .select()
      .single()

    if (updateError) {
      console.error('[Entities] Document link error:', updateError)
      return NextResponse.json({ error: 'Failed to link document' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.VEHICLES,
      entity_id: id,
      metadata: {
        endpoint: `/api/entities/${id}/documents`,
        document_id: updatedDoc.id
      }
    })

    return NextResponse.json({ document: updatedDoc })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('[Entities] Documents POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


