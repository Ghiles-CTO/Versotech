import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role.startsWith('staff_')) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const since = request.nextUrl.searchParams.get('since') ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await serviceSupabase
    .from('deal_activity_events')
    .select('event_type, occurred_at')
    .eq('deal_id', dealId)
    .gte('occurred_at', since)

  if (error) {
    console.error('Failed to fetch deal activity events', error)
    return NextResponse.json({ error: 'Failed to load activity summary' }, { status: 500 })
  }

  const summary = data?.reduce<Record<string, number>>((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] ?? 0) + 1
    return acc
  }, {}) ?? {}

  return NextResponse.json({
    deal_id: dealId,
    since,
    summary,
    total_events: data?.length ?? 0
  })
}
