import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Run auto-matching algorithm
export async function POST(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Run the fuzzy matching function
    const { data: matches, error } = await supabase.rpc('run_auto_match')

    if (error) {
      console.error('Auto-match error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      matches: matches?.length || 0,
      message: `Found ${matches?.length || 0} suggested matches`
    })

  } catch (error: any) {
    console.error('Auto-match error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to run auto-match'
    }, { status: 500 })
  }
}
