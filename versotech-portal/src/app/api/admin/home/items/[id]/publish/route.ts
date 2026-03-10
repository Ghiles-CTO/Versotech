import { NextRequest, NextResponse } from 'next/server'

import { auditLogger } from '@/lib/audit'
import { buildHomeItemPatchPayload, requireStaffActor, toHomeItem } from '@/lib/home/api'
import { assertHomeItemConflicts } from '@/lib/home/rules'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await requireStaffActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const { serviceSupabase, user } = access
  const { data: existing, error: existingError } = await serviceSupabase
    .from('home_items')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (existingError) {
    console.error('[admin/home/items/publish] Failed to load item:', existingError)
    return NextResponse.json({ error: 'Failed to load home item' }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json({ error: 'Home item not found' }, { status: 404 })
  }

  try {
    const payload = buildHomeItemPatchPayload(existing, { status: 'published' })
    await assertHomeItemConflicts(serviceSupabase, { id, ...payload }, { excludeId: id })

    const { data, error } = await serviceSupabase
      .from('home_items')
      .update({
        status: 'published',
        updated_by: user.id,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      console.error('[admin/home/items/publish] Failed to publish item:', error)
      return NextResponse.json({ error: 'Failed to publish home item' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: 'publish_home_item',
      entity: 'home_items',
      entity_id: data.id,
      metadata: { kind: data.kind },
    })

    return NextResponse.json({ item: toHomeItem(data) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to publish home item'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
