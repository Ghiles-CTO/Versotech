import { NextRequest, NextResponse } from 'next/server'

import { auditLogger, AuditActions } from '@/lib/audit'
import { buildHomeItemPatchPayload, requireStaffActor, toHomeItem } from '@/lib/home/api'
import { assertHomeItemConflicts } from '@/lib/home/rules'
import { homeItemPatchSchema } from '@/lib/home/validation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await requireStaffActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const { serviceSupabase, user } = access
  const patch = homeItemPatchSchema.safeParse(await request.json().catch(() => ({})))

  if (!patch.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: patch.error.flatten() },
      { status: 400 }
    )
  }

  const { data: existing, error: existingError } = await serviceSupabase
    .from('home_items')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (existingError) {
    console.error('[admin/home/items] Failed to load existing item:', existingError)
    return NextResponse.json({ error: 'Failed to load home item' }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json({ error: 'Home item not found' }, { status: 404 })
  }

  try {
    const payload = buildHomeItemPatchPayload(existing, patch.data)
    await assertHomeItemConflicts(serviceSupabase, { id, ...payload }, { excludeId: id })

    const { data, error } = await serviceSupabase
      .from('home_items')
      .update({
        ...payload,
        updated_by: user.id,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      console.error('[admin/home/items] Failed to update item:', error)
      return NextResponse.json({ error: 'Failed to update home item' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: `${AuditActions.UPDATE}_home_item`,
      entity: 'home_items',
      entity_id: data.id,
      metadata: {
        kind: data.kind,
        status: data.status,
      },
    })

    return NextResponse.json({ item: toHomeItem(data) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid home item payload'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await requireStaffActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const { serviceSupabase, user } = access

  const { data, error } = await serviceSupabase
    .from('home_items')
    .update({
      status: 'archived',
      featured_slot: null,
      updated_by: user.id,
    })
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[admin/home/items] Failed to archive item:', error)
    return NextResponse.json({ error: 'Failed to archive home item' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Home item not found' }, { status: 404 })
  }

  await auditLogger.log({
    actor_user_id: user.id,
    action: `${AuditActions.DELETE}_home_item`,
    entity: 'home_items',
    entity_id: data.id,
    metadata: {
      kind: data.kind,
      status: 'archived',
    },
  })

  return NextResponse.json({ item: toHomeItem(data) })
}
