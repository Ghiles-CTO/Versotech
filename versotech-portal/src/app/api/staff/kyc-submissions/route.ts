import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ENTITY_FILTER_COLUMN_MAP = {
  investor: 'investor_id',
  partner: 'partner_id',
  introducer: 'introducer_id',
  lawyer: 'lawyer_id',
  commercial_partner: 'commercial_partner_id',
  arranger: 'arranger_entity_id',
} as const

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

    if (!profile || !(profile.role.startsWith('staff_') || profile.role === 'ceo')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Use service client for staff queue reads to avoid persona-specific RLS gaps
    const serviceSupabase = createServiceClient()

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const investorId = searchParams.get('investor_id')
    const documentType = searchParams.get('document_type')
    const entityType = searchParams.get('entity_type')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '25')

    // Calculate range for pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Build query with proper table aliases and get count
    let query = serviceSupabase
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
        partner:partners(
          id,
          name,
          legal_name,
          contact_email,
          type,
          kyc_status
        ),
        introducer:introducers(
          id,
          display_name,
          legal_name,
          email,
          type,
          kyc_status
        ),
        lawyer:lawyers(
          id,
          firm_name,
          display_name,
          primary_contact_email,
          legal_entity_type,
          kyc_status
        ),
        commercial_partner:commercial_partners(
          id,
          name,
          legal_name,
          contact_email,
          type,
          kyc_status
        ),
        arranger_entity:arranger_entities(
          id,
          legal_name,
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
        partner_member:partner_members(
          id,
          full_name,
          role,
          role_title
        ),
        introducer_member:introducer_members(
          id,
          full_name,
          role,
          role_title
        ),
        lawyer_member:lawyer_members(
          id,
          full_name,
          role,
          role_title
        ),
        commercial_partner_member:commercial_partner_members(
          id,
          full_name,
          role,
          role_title
        ),
        arranger_member:arranger_members(
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
        reviewer:profiles!kyc_submissions_reviewed_by_fkey(
          id,
          display_name,
          email
        )
      `, { count: 'exact' })

    // Apply filters BEFORE pagination
    if (status) {
      query = query.eq('status', status)
    }
    if (investorId) {
      query = query.eq('investor_id', investorId)
    }
    if (documentType) {
      query = query.eq('document_type', documentType)
    }
    if (entityType) {
      const mappedColumn = ENTITY_FILTER_COLUMN_MAP[entityType as keyof typeof ENTITY_FILTER_COLUMN_MAP]
      if (!mappedColumn) {
        return NextResponse.json(
          { error: 'Invalid entity_type filter' },
          { status: 400 }
        )
      }
      query = query.not(mappedColumn, 'is', null)
    }

    // Apply ordering and pagination AFTER filters
    query = query
      .order('submitted_at', { ascending: false })
      .range(from, to)

    const { data: submissions, count, error: submissionsError } = await query

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json(
        { error: 'Failed to fetch KYC submissions' },
        { status: 500 }
      )
    }

    const normalizeEntity = (submission: any) => {
      const investorEntity = submission.investor
      if (investorEntity) return investorEntity

      if (submission.partner) {
        return {
          id: submission.partner.id,
          legal_name: submission.partner.legal_name || submission.partner.name,
          display_name: submission.partner.name || submission.partner.legal_name,
          email: submission.partner.contact_email || null,
          type: submission.partner.type || 'entity',
          kyc_status: submission.partner.kyc_status || null,
        }
      }

      if (submission.introducer) {
        return {
          id: submission.introducer.id,
          legal_name: submission.introducer.legal_name || submission.introducer.display_name,
          display_name: submission.introducer.display_name || submission.introducer.legal_name,
          email: submission.introducer.email || null,
          type: submission.introducer.type || 'entity',
          kyc_status: submission.introducer.kyc_status || null,
        }
      }

      if (submission.lawyer) {
        return {
          id: submission.lawyer.id,
          legal_name: submission.lawyer.firm_name || submission.lawyer.display_name,
          display_name: submission.lawyer.display_name || submission.lawyer.firm_name,
          email: submission.lawyer.primary_contact_email || null,
          type: submission.lawyer.legal_entity_type || 'entity',
          kyc_status: submission.lawyer.kyc_status || null,
        }
      }

      if (submission.commercial_partner) {
        return {
          id: submission.commercial_partner.id,
          legal_name: submission.commercial_partner.legal_name || submission.commercial_partner.name,
          display_name: submission.commercial_partner.name || submission.commercial_partner.legal_name,
          email: submission.commercial_partner.contact_email || null,
          type: submission.commercial_partner.type || 'entity',
          kyc_status: submission.commercial_partner.kyc_status || null,
        }
      }

      if (submission.arranger_entity) {
        return {
          id: submission.arranger_entity.id,
          legal_name: submission.arranger_entity.legal_name,
          display_name: submission.arranger_entity.legal_name,
          email: submission.arranger_entity.email || null,
          type: submission.arranger_entity.type || 'entity',
          kyc_status: submission.arranger_entity.kyc_status || null,
        }
      }

      return null
    }

    const normalizeMember = (submission: any) => {
      return (
        submission.investor_member ||
        submission.partner_member ||
        submission.introducer_member ||
        submission.lawyer_member ||
        submission.commercial_partner_member ||
        submission.arranger_member ||
        null
      )
    }

    const normalizedSubmissions = (submissions || []).map((submission: any) => ({
      ...submission,
      investor: normalizeEntity(submission),
      investor_member: normalizeMember(submission),
    }))

    // Get submission statistics using aggregation (more efficient)
    const { data: statsData } = await serviceSupabase
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
      draft: statusCounts['draft'] || 0,
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
      submissions: normalizedSubmissions,
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
