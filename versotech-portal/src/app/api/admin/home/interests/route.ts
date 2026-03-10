import { NextRequest, NextResponse } from 'next/server'

import { requireStaffActor } from '@/lib/home/api'

export async function GET(request: NextRequest) {
  const access = await requireStaffActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const { serviceSupabase } = access
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const itemId = searchParams.get('home_item_id')

  let query = serviceSupabase
    .from('home_interest_submissions')
    .select(`
      *,
      home_item:home_items(id, title, kind),
      investor:investors(id, legal_name),
      user_profile:profiles(id, email, display_name)
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (itemId) {
    query = query.eq('home_item_id', itemId)
  }

  const { data, error } = await query

  if (error) {
    console.error('[admin/home/interests] Failed to fetch interests:', error)
    return NextResponse.json({ error: 'Failed to load home interest submissions' }, { status: 500 })
  }

  return NextResponse.json({ interests: data ?? [] })
}
