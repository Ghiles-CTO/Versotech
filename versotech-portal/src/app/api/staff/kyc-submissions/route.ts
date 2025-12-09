import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile and verify staff access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const investorId = searchParams.get('investor_id')
    const documentType = searchParams.get('document_type')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '25')

    // Calculate range for pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Build query with proper table aliases and get count
    let query = supabase
      .from('kyc_submissions')
      .select(`
        *,
        investor:investors(
          id,
          legal_name,
          display_name,
          email,
          type,
          kyc_status
        ),
        counterparty_entity:investor_counterparty(
          id,
          legal_name,
          entity_type
        ),
        investor_member:investor_members(
          id,
          full_name,
          role,
          role_title
        ),
        document:documents(
          id,
          name,
          file_key,
          file_size_bytes,
          mime_type,
          created_at
        ),
        reviewer:profiles(
          id,
          display_name,
          email
        )
      `, { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(from, to)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (investorId) {
      query = query.eq('investor_id', investorId)
    }
    if (documentType) {
      query = query.eq('document_type', documentType)
    }

    const { data: submissions, count, error: submissionsError } = await query

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json(
        { error: 'Failed to fetch KYC submissions' },
        { status: 500 }
      )
    }

    // Get submission statistics using aggregation (more efficient)
    const { data: statsData } = await supabase
      .from('kyc_submissions')
      .select('status')

    // Count by status in memory (Supabase doesn't have built-in GROUP BY in JS client)
    const statusCounts: Record<string, number> = {}
    if (statsData) {
      for (const row of statsData) {
        statusCounts[row.status] = (statusCounts[row.status] || 0) + 1
      }
    }

    const statistics = {
      total: statsData?.length || 0,
      pending: statusCounts['pending'] || 0,
      under_review: statusCounts['under_review'] || 0,
      approved: statusCounts['approved'] || 0,
      rejected: statusCounts['rejected'] || 0,
      expired: statusCounts['expired'] || 0
    }

    // Calculate pagination info
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    return NextResponse.json({
      success: true,
      submissions: submissions || [],
      statistics,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('KYC submissions GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
