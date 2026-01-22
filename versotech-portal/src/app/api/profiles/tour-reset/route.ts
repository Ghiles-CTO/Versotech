import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/profiles/tour-reset
 *
 * Resets the tour completion flag for the current user.
 * This is useful for testing the tour functionality.
 */
export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ has_completed_platform_tour: false })
      .eq('id', user.id)

    if (updateError) {
      console.error('[tour-reset] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset tour', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Platform tour has been reset. Refresh the page to see the welcome modal.'
    })
  } catch (error) {
    console.error('[tour-reset] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
