import { NextRequest, NextResponse } from 'next/server'

import { auditLogger } from '@/lib/audit'
import { requireStaffActor, toHomeItem } from '@/lib/home/api'

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
  const { data, error } = await serviceSupabase
    .from('home_items')
    .update({
      status: 'draft',
      updated_by: user.id,
    })
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[admin/home/items/unpublish] Failed to unpublish item:', error)
    return NextResponse.json({ error: 'Failed to unpublish home item' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Home item not found' }, { status: 404 })
  }

  await auditLogger.log({
    actor_user_id: user.id,
    action: 'unpublish_home_item',
    entity: 'home_items',
    entity_id: data.id,
    metadata: { kind: data.kind },
  })

  return NextResponse.json({ item: toHomeItem(data) })
}
