import { NextRequest, NextResponse } from 'next/server'

import { auditLogger } from '@/lib/audit'
import { requireStaffActor, toHomeItem } from '@/lib/home/api'
import { homeItemsReorderSchema } from '@/lib/home/validation'

type ReorderCandidate = {
  id: string
  status: string
  starts_at: string | null
  ends_at: string | null
  featured_slot: number | null
}

function timestampOrDefault(value: string | null | undefined, fallback: number) {
  if (!value) return fallback
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? fallback : parsed
}

function overlap(left: ReorderCandidate, right: ReorderCandidate) {
  const leftStart = timestampOrDefault(left.starts_at, Number.NEGATIVE_INFINITY)
  const leftEnd = timestampOrDefault(left.ends_at, Number.POSITIVE_INFINITY)
  const rightStart = timestampOrDefault(right.starts_at, Number.NEGATIVE_INFINITY)
  const rightEnd = timestampOrDefault(right.ends_at, Number.POSITIVE_INFINITY)

  return leftStart < rightEnd && rightStart < leftEnd
}

export async function POST(request: NextRequest) {
  const access = await requireStaffActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const { serviceSupabase, user } = access
  const parsed = homeItemsReorderSchema.safeParse(await request.json().catch(() => ({})))

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const ids = parsed.data.items.map((item) => item.id)
  const { data: existingRows, error: existingError } = await serviceSupabase
    .from('home_items')
    .select('id, status, starts_at, ends_at, featured_slot')
    .in('id', ids)

  if (existingError) {
    console.error('[admin/home/items/reorder] Failed to load items:', existingError)
    return NextResponse.json({ error: 'Failed to load home items' }, { status: 500 })
  }

  if ((existingRows ?? []).length !== ids.length) {
    return NextResponse.json({ error: 'One or more home items were not found' }, { status: 404 })
  }

  const existingMap = new Map((existingRows ?? []).map((row) => [row.id, row]))
  const candidates = parsed.data.items.map((item) => ({
    id: item.id,
    status: existingMap.get(item.id)?.status ?? 'draft',
    starts_at: existingMap.get(item.id)?.starts_at ?? null,
    ends_at: existingMap.get(item.id)?.ends_at ?? null,
    featured_slot:
      item.featured_slot === undefined
        ? existingMap.get(item.id)?.featured_slot ?? null
        : item.featured_slot,
  }))

  const { data: otherPublishedFeatured, error: otherError } = await serviceSupabase
    .from('home_items')
    .select('id, status, starts_at, ends_at, featured_slot')
    .eq('status', 'published')
    .not('featured_slot', 'is', null)

  if (otherError) {
    console.error('[admin/home/items/reorder] Failed to load published featured items:', otherError)
    return NextResponse.json({ error: 'Failed to validate featured slot conflicts' }, { status: 500 })
  }

  const externalCandidates = (otherPublishedFeatured ?? []).filter((row) => !ids.includes(row.id))
  const publishedCandidates = candidates.filter(
    (candidate) => candidate.status === 'published' && candidate.featured_slot != null
  )

  for (const candidate of publishedCandidates) {
    for (const other of [...externalCandidates, ...publishedCandidates.filter((item) => item.id !== candidate.id)]) {
      if (
        other.featured_slot != null &&
        other.featured_slot === candidate.featured_slot &&
        overlap(candidate, other)
      ) {
        return NextResponse.json(
          { error: `Featured slot ${candidate.featured_slot} has an overlapping published item` },
          { status: 409 }
        )
      }
    }
  }

  for (const item of parsed.data.items) {
    const { error } = await serviceSupabase
      .from('home_items')
      .update({
        sort_order: item.sort_order,
        ...(item.featured_slot !== undefined ? { featured_slot: item.featured_slot } : {}),
        updated_by: user.id,
      })
      .eq('id', item.id)

    if (error) {
      console.error('[admin/home/items/reorder] Failed to update item order:', error)
      return NextResponse.json({ error: 'Failed to reorder home items' }, { status: 500 })
    }
  }

  const { data: updatedRows, error: updatedError } = await serviceSupabase
    .from('home_items')
    .select('*')
    .in('id', ids)

  if (updatedError) {
    console.error('[admin/home/items/reorder] Failed to reload items:', updatedError)
    return NextResponse.json({ error: 'Failed to load reordered items' }, { status: 500 })
  }

  await auditLogger.log({
    actor_user_id: user.id,
    action: 'reorder_home_items',
    entity: 'home_items',
    metadata: { item_ids: ids },
  })

  return NextResponse.json({ items: (updatedRows ?? []).map(toHomeItem) })
}
