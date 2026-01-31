import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'

// GET /api/staff/documents - List documents with advanced filtering
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const folderId = searchParams.get('folder_id')
    const folderIds = searchParams.getAll('folder_ids') // For recursive folder search
    const includeSubfolders = searchParams.get('include_subfolders') === 'true'
    const vehicleId = searchParams.get('vehicle_id')
    const dealId = searchParams.get('deal_id')
    const participantId = searchParams.get('participant_id') || searchParams.get('investor_id')
    const participantType =
      searchParams.get('participant_type') ||
      (searchParams.get('investor_id') ? 'investor' : null)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    // Use higher limit when searching to ensure client-side filter has enough data
    const defaultLimit = search ? '1000' : '200'
    const limit = parseInt(searchParams.get('limit') || defaultLimit)
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Build query
    let query = serviceSupabase
      .from('documents')
      .select(`
        *,
        folder:document_folders(id, name, path, folder_type),
        vehicle:vehicles!documents_vehicle_id_fkey(id, name, type),
        investor:investors!documents_owner_investor_id_fkey(id, legal_name),
        deal:deals!documents_deal_id_fkey(id, name, status),
        created_by_profile:profiles!documents_created_by_fkey(display_name, email),
        current_approval:document_approvals(id, status, review_notes, reviewed_at, reviewed_by_profile:profiles!document_approvals_reviewed_by_fkey(display_name)),
        publishing_schedule:document_publishing_schedule(id, publish_at, unpublish_at, published)
      `, { count: 'exact' })

    const hasParticipantFilter = !!participantId && !!participantType
    let subscriptionIds: string[] = []
    let submissionIds: string[] = []

    if (hasParticipantFilter && participantType === 'investor') {
      let subsQuery = serviceSupabase
        .from('subscriptions')
        .select('id')
        .eq('investor_id', participantId)

      let submissionsQuery = serviceSupabase
        .from('deal_subscription_submissions')
        .select('id')
        .eq('investor_id', participantId)

      if (dealId) {
        subsQuery = subsQuery.eq('deal_id', dealId)
        submissionsQuery = submissionsQuery.eq('deal_id', dealId)
      }

      const { data: subs } = await subsQuery
      subscriptionIds = (subs || []).map(s => s.id)

      const { data: submissions } = await submissionsQuery
      submissionIds = (submissions || []).map(s => s.id)
    }

    // Apply filters
    if (!hasParticipantFilter) {
      if (folderIds && folderIds.length > 0 && includeSubfolders) {
        // Include documents from all folders (parent and descendants)
        query = query.in('folder_id', folderIds)
      } else if (folderId) {
        query = query.eq('folder_id', folderId)
      }
    }

    if (vehicleId && !hasParticipantFilter) {
      query = query.eq('vehicle_id', vehicleId)
    }

    if (dealId && !hasParticipantFilter) {
      query = query.eq('deal_id', dealId)
    }

    if (hasParticipantFilter) {
      if (participantType === 'investor') {
        const orConditions = [`owner_investor_id.eq.${participantId}`]
        if (subscriptionIds.length > 0) {
          orConditions.push(`subscription_id.in.(${subscriptionIds.join(',')})`)
        }
        if (submissionIds.length > 0) {
          orConditions.push(`subscription_submission_id.in.(${submissionIds.join(',')})`)
        }
        query = query.or(orConditions.join(','))
      } else if (participantType === 'partner') {
        query = query.eq('partner_id', participantId)
      } else if (participantType === 'introducer') {
        query = query.eq('introducer_id', participantId)
      } else if (participantType === 'commercial_partner') {
        query = query.eq('commercial_partner_id', participantId)
      }
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    // Note: Search filtering is handled client-side to enable searching across
    // joined tables (vehicle name, folder path, etc.) which is not easily
    // supported by Supabase query builder. Server returns all matching folder
    // documents and client filters by all fields.

    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: documents, error: documentsError, count } = await query

    if (documentsError) {
      console.error('[API] Documents query error:', documentsError)
      console.error('[API] Error details:', JSON.stringify(documentsError, null, 2))
      return NextResponse.json(
        { 
          error: 'Failed to fetch documents',
          details: documentsError.message || 'Unknown database error',
          code: documentsError.code,
          hint: documentsError.hint
        },
        { status: 500 }
      )
    }

    // Get statistics
    const { data: stats } = await serviceSupabase
      .from('documents')
      .select('status')
      .then((result: any) => {
        const statusCounts: Record<string, number> = {
          draft: 0,
          pending_approval: 0,
          approved: 0,
          published: 0,
          archived: 0
        }

        result.data?.forEach((doc: any) => {
          const status = doc.status || 'draft'
          statusCounts[status] = (statusCounts[status] || 0) + 1
        })

        return { data: statusCounts }
      })

    return NextResponse.json({
      documents: documents || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
        current_page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil((count || 0) / limit)
      },
      stats: stats || {},
      filters_applied: {
        folder_id: folderId,
        vehicle_id: vehicleId,
        deal_id: dealId,
        participant_id: participantId,
        participant_type: participantType,
        status,
        search,
        type,
        tags
      }
    })

  } catch (error) {
    console.error('Documents GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
