import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Get investors list for staff dropdowns with optional search
 * API Route: /api/staff/investors?search=john
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user (handles both real auth and demo mode)
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const userRole = user.user_metadata?.role || user.role
    if (!['staff_admin', 'staff_ops', 'staff_rm'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized - Staff access required' }, { status: 403 })
    }

    // Use service client to bypass RLS since we've already verified staff access
    const serviceClient = createServiceClient()

    // Get search parameter
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    // Build query
    let query = serviceClient
      .from('investors')
      .select('id, legal_name, email, status, type')
      .order('legal_name', { ascending: true })

    // Apply search filter if provided
    if (search && search.trim().length > 0) {
      query = query.or(`legal_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Limit results
    query = query.limit(50)

    const { data: investors, error } = await query

    if (error) {
      console.error('Error fetching investors:', error)
      return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 })
    }

    return NextResponse.json({
      investors: investors || []
    })

  } catch (error) {
    console.error('Investors API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
