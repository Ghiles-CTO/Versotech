import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Reject a suggested match
export async function POST(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { suggested_match_id } = await req.json()

    if (!suggested_match_id) {
      return NextResponse.json({ error: 'Missing suggested_match_id' }, { status: 400 })
    }

    const supabase = await createClient()

    // Just delete the suggested match
    const { error } = await supabase
      .from('suggested_matches')
      .delete()
      .eq('id', suggested_match_id)

    if (error) {
      console.error('Failed to reject match:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Match rejected'
    })

  } catch (error: any) {
    console.error('Reject match error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to reject match'
    }, { status: 500 })
  }
}
