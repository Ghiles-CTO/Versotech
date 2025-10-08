import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'

/**
 * GET /api/profiles
 * List all user profiles with optional role filter
 * Authentication: Staff only
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
    const supabase = demoCookie ? createServiceClient() : await createClient()

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

