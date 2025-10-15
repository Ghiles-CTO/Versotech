import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 25)
  const offset = Number(request.nextUrl.searchParams.get('offset') ?? 0)

  const { data, error: notificationsError } = await serviceSupabase
    .from('investor_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (notificationsError) {
    console.error('Failed to fetch notifications:', notificationsError)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }

  return NextResponse.json({ notifications: data ?? [] })
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
