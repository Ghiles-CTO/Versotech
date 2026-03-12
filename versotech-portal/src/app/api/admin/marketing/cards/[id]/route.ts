import { NextRequest, NextResponse } from 'next/server'

import { requireMarketingAdmin } from '@/lib/dashboard-marketing/auth'
import {
  marketingCardCreateSchema,
  marketingCardPatchSchema,
  normalizeMarketingCardInput,
} from '@/lib/dashboard-marketing/validation'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMarketingAdmin()
  if (auth.response) {
    return auth.response
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const patchParsed = marketingCardPatchSchema.safeParse(await request.json())
  if (!patchParsed.success) {
    return NextResponse.json({ error: patchParsed.error.flatten() }, { status: 400 })
  }

  const { id } = await params
  const supabase = createServiceClient() as any
  const { data: existing, error: fetchError } = await supabase
    .from('dashboard_marketing_cards')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const merged = {
    ...existing,
    ...patchParsed.data,
  }

  const createParsed = marketingCardCreateSchema.safeParse(merged)
  if (!createParsed.success) {
    return NextResponse.json({ error: createParsed.error.flatten() }, { status: 400 })
  }

  const normalized = normalizeMarketingCardInput(createParsed.data)
  const nextStatus = patchParsed.data.status ?? existing.status

  const payload = {
    ...normalized,
    updated_by: auth.user.id,
    published_at:
      nextStatus === 'published'
        ? existing.published_at ?? new Date().toISOString()
        : null,
  }

  const { data, error } = await supabase
    .from('dashboard_marketing_cards')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    console.error('[admin/marketing/cards] Failed to update card:', error)
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMarketingAdmin()
  if (auth.response) {
    return auth.response
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createServiceClient() as any
  const { data: existing, error: fetchError } = await supabase
    .from('dashboard_marketing_cards')
    .select('id, image_storage_path, video_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const storagePaths = [existing.image_storage_path, existing.video_storage_path].filter(Boolean)
  if (storagePaths.length > 0) {
    const { error: removeError } = await supabase.storage.from('public-assets').remove(storagePaths)
    if (removeError) {
      console.warn('[admin/marketing/cards] Failed to remove stored assets:', removeError)
    }
  }

  const { error } = await supabase
    .from('dashboard_marketing_cards')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[admin/marketing/cards] Failed to delete card:', error)
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
