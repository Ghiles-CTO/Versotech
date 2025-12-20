import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/support/default-staff
 * Returns the default staff member for support questions
 * Uses service client to bypass RLS (investors can't see staff profiles)
 */
export async function GET() {
  try {
    // 1. Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Use service client to bypass RLS (investors can't see staff profiles)
    const serviceSupabase = createServiceClient()

    // Get a staff_admin user for support (deterministic ordering by created_at)
    const { data: staffAdmin, error } = await serviceSupabase
      .from('profiles')
      .select('id, display_name')
      .eq('role', 'staff_admin')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error || !staffAdmin) {
      console.error('[Support API] No staff admin found:', error)
      return NextResponse.json(
        { error: 'No support team member available' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      staff_id: staffAdmin.id,
      display_name: staffAdmin.display_name
    })
  } catch (error) {
    console.error('[Support API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
