import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

const createOrUpdateAccessSchema = z.object({
  investor_id: z.string().uuid(),
  expires_at: z.string().datetime().optional().nullable(),
  auto_granted: z.boolean().optional().default(false),
  notes: z.string().max(2000).optional().nullable()
})

const revokeSchema = z.object({
  access_id: z.string().uuid().optional(),
  investor_id: z.string().uuid().optional(),
  reason: z.string().max(2000).optional().nullable()
}).refine(
  data => data.access_id || data.investor_id,
  { message: 'access_id or investor_id must be provided' }
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') ?? false

  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  const investorIds = investorLinks?.map(link => link.investor_id) ?? []

  if (!isStaff && investorIds.length === 0) {
    return NextResponse.json(
      { error: 'No investor profile associated with this account' },
      { status: 403 }
    )
  }

  const query = serviceSupabase
    .from('deal_data_room_access')
    .select(
      `
        *,
        investors (
          id,
          legal_name
        )
      `
    )
    .eq('deal_id', dealId)
    .order('granted_at', { ascending: false })

  if (!isStaff) {
    query.in('investor_id', investorIds)
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch data room access:', error)
    return NextResponse.json({ error: 'Failed to fetch data room access' }, { status: 500 })
  }

  return NextResponse.json({ access: data ?? [] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = createOrUpdateAccessSchema.safeParse(body ?? {})

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: (parsed.error as any).errors },
      { status: 400 }
    )
  }

  const { investor_id, expires_at, auto_granted, notes } = parsed.data

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role?.startsWith('staff_')) {
    return NextResponse.json(
      { error: 'Only staff members can manage data room access' },
      { status: 403 }
    )
  }

  const normalizedExpiresAt = expires_at ? new Date(expires_at).toISOString() : null

  const { data: existing } = await serviceSupabase
    .from('deal_data_room_access')
    .select('*')
    .eq('deal_id', dealId)
    .eq('investor_id', investor_id)
    .is('revoked_at', null)
    .maybeSingle()

  let accessRecord
  if (existing) {
    const { data, error } = await serviceSupabase
      .from('deal_data_room_access')
      .update({
        expires_at: normalizedExpiresAt ?? existing.expires_at,
        revoked_at: null,
        revoked_by: null,
        auto_granted,
        notes,
        granted_by: user.id,
        granted_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error) {
      console.error('Failed to update data room access:', error)
      return NextResponse.json({ error: 'Failed to update access' }, { status: 500 })
    }
    accessRecord = data
  } else {
    const { data, error } = await serviceSupabase
      .from('deal_data_room_access')
      .insert({
        deal_id: dealId,
        investor_id,
        expires_at: normalizedExpiresAt,
        auto_granted,
        notes,
        granted_by: user.id
      })
      .select('*')
      .single()

    if (error) {
      console.error('Failed to create data room access:', error)
      return NextResponse.json({ error: 'Failed to create access' }, { status: 500 })
    }
    accessRecord = data
  }

  await auditLogger.log({
    actor_user_id: user.id,
    action: AuditActions.UPDATE,
    entity: AuditEntities.DEALS,
    entity_id: accessRecord.id,
    metadata: {
      type: 'data_room_access',
      deal_id: dealId,
      investor_id,
      expires_at: accessRecord.expires_at,
      auto_granted
    }
  })

  return NextResponse.json({
    success: true,
    access: accessRecord
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = revokeSchema.safeParse(body ?? {})

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: (parsed.error as any).errors },
      { status: 400 }
    )
  }

  const { access_id, investor_id, reason } = parsed.data

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role?.startsWith('staff_')) {
    return NextResponse.json(
      { error: 'Only staff members can revoke data room access' },
      { status: 403 }
    )
  }

  const query = serviceSupabase
    .from('deal_data_room_access')
    .update({
      revoked_at: new Date().toISOString(),
      revoked_by: user.id,
      notes: reason
        ? `${reason}${reason.trim().endsWith('.') ? '' : '.'} Revoked by ${profile.display_name ?? 'staff user'}.`
        : null
    })
    .eq('deal_id', dealId)

  if (access_id) {
    query.eq('id', access_id)
  } else if (investor_id) {
    query.eq('investor_id', investor_id).is('revoked_at', null)
  }

  const { data, error } = await query.select('*')

  if (error) {
    console.error('Failed to revoke data room access:', error)
    return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 })
  }

  await auditLogger.log({
    actor_user_id: user.id,
    action: AuditActions.UPDATE,
    entity: AuditEntities.DEALS,
    entity_id: dealId,
    metadata: {
      type: 'data_room_access_revoked',
      access_id: access_id ?? null,
      investor_id: investor_id ?? null,
      reason
    }
  })

  return NextResponse.json({
    success: true,
    revoked: data ?? []
  })
}
