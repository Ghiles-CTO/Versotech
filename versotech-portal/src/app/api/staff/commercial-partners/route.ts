import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/staff/commercial-partners?search=...
 * Lightweight list endpoint for staff selectors.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const serviceClient = createServiceClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limitParam = parseInt(searchParams.get('limit') || '500', 10)
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 2000) : 500

    let query = serviceClient
      .from('commercial_partners')
      .select('id, name, legal_name, contact_name, contact_email, email, status, type')
      .order('name', { ascending: true })

    if (search && search.trim().length > 0) {
      query = query.or(
        `name.ilike.%${search}%,legal_name.ilike.%${search}%,contact_email.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data: commercialPartners, error } = await query.limit(limit)

    if (error) {
      console.error('Error fetching commercial partners:', error)
      return NextResponse.json({ error: 'Failed to fetch commercial partners' }, { status: 500 })
    }

    return NextResponse.json({ commercial_partners: commercialPartners || [] })
  } catch (error) {
    console.error('Commercial partners API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
