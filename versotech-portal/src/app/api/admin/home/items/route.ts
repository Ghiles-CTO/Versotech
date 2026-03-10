import { NextRequest, NextResponse } from 'next/server'

import { auditLogger, AuditActions } from '@/lib/audit'
import { requireStaffActor, buildHomeItemCreatePayload, toHomeItem } from '@/lib/home/api'
import { assertHomeItemConflicts } from '@/lib/home/rules'

export async function GET(request: NextRequest) {
  const access = await requireStaffActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const { serviceSupabase } = access
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const kind = searchParams.get('kind')

  let query = serviceSupabase
    .from('home_items')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('featured_slot', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (kind) {
    query = query.eq('kind', kind)
  }

  const { data, error } = await query

  if (error) {
    console.error('[admin/home/items] Failed to fetch items:', error)
    return NextResponse.json({ error: 'Failed to load home items' }, { status: 500 })
  }

  return NextResponse.json({ items: (data ?? []).map(toHomeItem) })
}

export async function POST(request: NextRequest) {
  const access = await requireStaffActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const { serviceSupabase, user } = access

  try {
    const payload = buildHomeItemCreatePayload(await request.json().catch(() => ({})))
    await assertHomeItemConflicts(serviceSupabase, payload)

    const { data, error } = await serviceSupabase
      .from('home_items')
      .insert({
        ...payload,
        created_by: user.id,
        updated_by: user.id,
      })
      .select('*')
      .single()

    if (error || !data) {
      console.error('[admin/home/items] Failed to create item:', error)
      return NextResponse.json({ error: 'Failed to create home item' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: `${AuditActions.CREATE}_home_item`,
      entity: 'home_items',
      entity_id: data.id,
      metadata: {
        kind: data.kind,
        status: data.status,
      },
    })

    return NextResponse.json({ item: toHomeItem(data) }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid home item payload'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
