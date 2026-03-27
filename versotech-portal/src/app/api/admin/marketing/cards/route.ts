import { NextRequest, NextResponse } from 'next/server'

import { requireMarketingAdmin } from '@/lib/dashboard-marketing/auth'
import { buildMarketingCardsResponse } from '@/lib/dashboard-marketing/query'
import {
  marketingCardCreateSchema,
  normalizeMarketingCardInput,
} from '@/lib/dashboard-marketing/validation'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireMarketingAdmin()
  if (auth.response) {
    return auth.response
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient() as any
  const { data, error } = await supabase
    .from('dashboard_marketing_cards')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/marketing/cards] Failed to load cards:', error)
    return NextResponse.json({ error: 'Failed to load cards' }, { status: 500 })
  }

  return NextResponse.json(
    await buildMarketingCardsResponse(data ?? [], {
      supabase,
    })
  )
}

export async function POST(request: NextRequest) {
  const auth = await requireMarketingAdmin()
  if (auth.response) {
    return auth.response
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = marketingCardCreateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const normalized = normalizeMarketingCardInput(parsed.data)
  const supabase = createServiceClient() as any
  const payload = {
    ...normalized,
    // New cards should surface first until an admin manually reorders them.
    sort_order: 0,
    published_at: normalized.status === 'published' ? new Date().toISOString() : null,
    created_by: auth.user.id,
    updated_by: auth.user.id,
  }

  const { data, error } = await supabase
    .from('dashboard_marketing_cards')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    console.error('[admin/marketing/cards] Failed to create card:', error)
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }

  const response = await buildMarketingCardsResponse([data], { supabase })
  return NextResponse.json(response.items[0], { status: 201 })
}
