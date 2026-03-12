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

  await Promise.all(
    parsed.data.itemIds.map((id, index) =>
      supabase
        .from('dashboard_marketing_cards')
        .update({
          sort_order: index,
          updated_by: auth.user.id,
        })
        .eq('id', id)
    )
  )

  return NextResponse.json({ success: true })
}
