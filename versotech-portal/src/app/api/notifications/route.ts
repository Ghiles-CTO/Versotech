import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 50)
  const offset = Number(request.nextUrl.searchParams.get('offset') ?? 0)
  const type = request.nextUrl.searchParams.get('type')
  const createdByMe = request.nextUrl.searchParams.get('created_by_me') === 'true'
  const dealId = request.nextUrl.searchParams.get('deal_id')

  // Build base query - explicit columns per codebase rules
  let query = serviceSupabase
    .from('investor_notifications')
    .select('id, user_id, investor_id, title, message, link, read_at, created_at, type, created_by, deal_id')

  if (createdByMe) {
    // Show notifications I created for others
    query = query.eq('created_by', user.id)
  } else {
    // Show notifications addressed to me
    query = query.eq('user_id', user.id)
  }

  // Apply type filter if specified
  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  // Apply deal filter if specified
  if (dealId) {
    query = query.eq('deal_id', dealId)
  }

  const { data, error: notificationsError } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (notificationsError) {
    console.error('Failed to fetch notifications:', notificationsError)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }

  // Get unique notification types for filter dropdown
  const { data: typesData } = await serviceSupabase
    .from('investor_notifications')
    .select('type')
    .eq('user_id', user.id)
    .not('type', 'is', null)

  const uniqueTypes = [...new Set((typesData || []).map(t => t.type).filter(Boolean))]

  return NextResponse.json({
    notifications: data ?? [],
    types: uniqueTypes
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const ids: string[] = Array.isArray(body?.ids) ? body.ids : []

  if (!ids.length) {
    return NextResponse.json({ error: 'No notification ids provided' }, { status: 400 })
  }

  const { error: updateError } = await serviceSupabase
    .from('investor_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .in('id', ids)

  if (updateError) {
    console.error('Failed to mark notifications read:', updateError)
    return NextResponse.json({ error: 'Failed to mark notifications read' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
