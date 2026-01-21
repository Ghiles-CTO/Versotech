import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/api-auth'

/**
 * GET /api/admin/staff/[id]/assigned-investors
 * Returns investors where the staff member is assigned as primary_rm or secondary_rm
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params

    // Use regular client for authentication
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    // Use service client for admin operations (bypasses RLS)
    const supabase = createServiceClient()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const canAccess = await hasPermission(supabase, user.id, ['super_admin', 'manage_staff', 'view_staff'])

    if (!canAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get investors where this staff is primary RM
    const { data: primaryAssigned, error: primaryError } = await supabase
      .from('investors')
      .select('id, legal_name, display_name, status, type, created_at')
      .eq('primary_rm', staffId)
      .order('display_name', { ascending: true })

    if (primaryError) {
      console.error('Primary assignments fetch error:', primaryError)
      return NextResponse.json({ error: 'Failed to fetch primary assignments' }, { status: 500 })
    }

    // Get investors where this staff is secondary RM
    const { data: secondaryAssigned, error: secondaryError } = await supabase
      .from('investors')
      .select('id, legal_name, display_name, status, type, created_at')
      .eq('secondary_rm', staffId)
      .order('display_name', { ascending: true })

    if (secondaryError) {
      console.error('Secondary assignments fetch error:', secondaryError)
      return NextResponse.json({ error: 'Failed to fetch secondary assignments' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        primary: primaryAssigned || [],
        secondary: secondaryAssigned || [],
        total: (primaryAssigned?.length || 0) + (secondaryAssigned?.length || 0),
      },
    })
  } catch (error) {
    console.error('Assigned investors fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
