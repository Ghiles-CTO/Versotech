import { NextRequest, NextResponse } from 'next/server'

import { requireMarketingAdmin } from '@/lib/dashboard-marketing/auth'
import { marketingCardsReorderSchema } from '@/lib/dashboard-marketing/validation'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = await requireMarketingAdmin()
  if (auth.response) {
    return auth.response
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = marketingCardsReorderSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createServiceClient() as any
  const { data: existingCards, error: existingCardsError } = await supabase
    .from('dashboard_marketing_cards')
    .select('id')

  if (existingCardsError) {
    console.error('[admin/marketing/cards/reorder] Failed to load cards for reorder:', existingCardsError)
    return NextResponse.json({ error: 'Failed to reorder cards' }, { status: 500 })
  }

  const existingIds = new Set((existingCards ?? []).map((card: { id: string }) => card.id))
  const requestedIds = parsed.data.itemIds

  const isSameCardSet =
    requestedIds.length === existingIds.size &&
    requestedIds.every((id) => existingIds.has(id)) &&
    new Set(requestedIds).size === requestedIds.length

  if (!isSameCardSet) {
    return NextResponse.json({ error: 'Reorder request must include every card exactly once' }, { status: 400 })
  }

  const reorderResults = await Promise.all(
    requestedIds.map((id, index) =>
      supabase
        .from('dashboard_marketing_cards')
        .update({
          sort_order: index,
          updated_by: auth.user.id,
        })
        .eq('id', id)
    )
  )

  const reorderError = reorderResults.find((result: { error?: unknown }) => result?.error)
  if (reorderError) {
    console.error('[admin/marketing/cards/reorder] Failed to reorder cards:', reorderError)
    return NextResponse.json({ error: 'Failed to reorder cards' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
