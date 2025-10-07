import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = await createClient()
    const user = await requireStaffAuth()
    const { key } = await params

    const { data, error } = await supabase
      .from('workflow_runs')
      .select('id, status, created_at, updated_at')
      .eq('workflow_key', key)
      .eq('triggered_by', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch recent runs' }, { status: 500 })
    }

    return NextResponse.json({ recentRuns: data ?? [] })
  } catch (error) {
    console.error('Recent runs error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


