import { NextResponse } from 'next/server'

import { requireInvestorActor, toHomeItem } from '@/lib/home/api'
import { buildHomeFeedResponse, isHomeItemActive } from '@/lib/home/query'

export async function GET() {
  const access = await requireInvestorActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const { serviceSupabase } = access
  const { data, error } = await serviceSupabase
    .from('home_items')
    .select('*')
    .eq('status', 'published')

  if (error) {
    console.error('[home] Failed to fetch published home items:', error)
    return NextResponse.json({ error: 'Failed to load home content' }, { status: 500 })
  }

  const activeItems = (data ?? []).map(toHomeItem).filter((item) => isHomeItemActive(item))

  return NextResponse.json(buildHomeFeedResponse(activeItems))
}
