/**
 * Staff Sell Requests List API
 * GET /api/staff/sell-requests - List all sell requests (staff view)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    const staffRoles = ['staff_admin', 'ceo', 'staff_ops', 'lawyer']
    if (!profile || !staffRoles.includes(profile.role || '')) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Parse query params for filtering with validation
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Validate and clamp pagination params
    const rawLimit = parseInt(searchParams.get('limit') || '50', 10)
    const rawOffset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = Number.isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 100)  // Clamp: 1-100
    const offset = Number.isNaN(rawOffset) ? 0 : Math.max(rawOffset, 0)  // Must be >= 0

    // Build query
    let query = serviceSupabase
      .from('investor_sale_requests')
      .select(`
        *,
        investor:investors(id, legal_name, email, investor_type),
        subscription:subscriptions(id, commitment, funded_amount, currency),
        deal:deals(id, name),
        vehicle:vehicles(id, name, type)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter if provided
    if (status) {
      const statuses = status.split(',')
      query = query.in('status', statuses)
    }

    const { data: requests, count, error: fetchError } = await query

    if (fetchError) {
      console.error('Failed to fetch sell requests:', fetchError)
      return NextResponse.json({ error: 'Failed to load requests' }, { status: 500 })
    }

    // Get summary counts
    const { data: statusCounts } = await serviceSupabase
      .from('investor_sale_requests')
      .select('status')

    const summary = {
      pending: 0,
      approved: 0,
      matched: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0
    }

    statusCounts?.forEach(r => {
      if (r.status in summary) {
        summary[r.status as keyof typeof summary]++
      }
    })

    return NextResponse.json({
      data: requests || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      },
      summary
    })

  } catch (error) {
    console.error('List sell requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
