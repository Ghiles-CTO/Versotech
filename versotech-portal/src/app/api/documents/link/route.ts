import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

const linkSchema = z.object({
  name: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  entity_id: z.string().uuid().optional().nullable(),
  vehicle_id: z.string().uuid().optional().nullable(),
  deal_id: z.string().uuid().optional().nullable(),
  folder_id: z.string().uuid().optional().nullable(),
  owner_investor_id: z.string().uuid().optional().nullable(),
  external_url: z.string().url('A valid URL is required'),
  link_type: z.string().optional().nullable(),
  tags: z.array(z.string()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await isStaffUser(authClient, user)
    if (!staff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const payload = await request.json().catch(() => ({}))
    const parsed = linkSchema.parse(payload)

    if (!parsed.entity_id && !parsed.vehicle_id && !parsed.deal_id) {
      return NextResponse.json(
        { error: 'Document must be scoped to an entity, vehicle, or deal' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const now = new Date().toISOString()

    const insertPayload = {
      name: parsed.name || 'External Document',
      type: parsed.type || 'link',
      description: parsed.description || null,
      entity_id: parsed.entity_id || parsed.vehicle_id || null,
      vehicle_id: parsed.vehicle_id || parsed.entity_id || null,
      deal_id: parsed.deal_id || null,
      folder_id: parsed.folder_id || null,
      owner_investor_id: parsed.owner_investor_id || null,
      external_url: parsed.external_url,
      link_type: parsed.link_type,
      tags: parsed.tags || null,
      status: 'published',
      is_published: true,
      published_at: now,
      created_by: user.id.startsWith('demo-') ? null : user.id,
      current_version: 1
    }

    const { data: document, error } = await supabase
      .from('documents')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error || !document) {
      console.error('Document link creation error:', error)
      return NextResponse.json({ error: 'Failed to create document link' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: document.id,
      metadata: {
        type: 'external_link',
        external_url: parsed.external_url,
        vehicle_id: parsed.vehicle_id || parsed.entity_id,
        deal_id: parsed.deal_id
      }
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    console.error('Document link API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
