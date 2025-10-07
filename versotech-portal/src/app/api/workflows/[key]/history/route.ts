import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = await createClient()
    const user = await requireStaffAuth()
    const { key } = await params

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit') ?? 10), 50)

    const { data: runs, error } = await supabase
      .from('workflow_runs')
      .select('id, status, created_at, updated_at, error_message')
      .eq('workflow_key', key)
      .eq('triggered_by', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch workflow runs' }, { status: 500 })
    }

    return NextResponse.json({ runs: runs ?? [] })
  } catch (error) {
    console.error('Workflow history error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


