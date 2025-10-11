import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

/**
 * GET /api/profiles
 * List all user profiles with optional role filter
 * Authentication: Staff only
 */
export async function GET(request: Request) {
  try {
    // Verify staff authentication
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }
    
    // Use service client for data fetching (bypasses RLS)
    const supabase = createServiceClient()

    // Parse query params
    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role')

    // Build query
    let query = supabase
      .from('profiles')
      .select('id, display_name, email, role, title')
      .order('display_name')

    // Apply role filter if provided (handles comma-separated values)
    if (roleFilter) {
      const roles = roleFilter.split(',').map(r => r.trim())
      if (roles.length === 1) {
        query = query.eq('role', roles[0])
      } else {
        query = query.in('role', roles)
      }
    }

    const { data: profiles, error } = await query

    if (error) {
      console.error('Fetch profiles error:', error)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    return NextResponse.json({ profiles: profiles || [] })
  } catch (error) {
    console.error('API /profiles GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

