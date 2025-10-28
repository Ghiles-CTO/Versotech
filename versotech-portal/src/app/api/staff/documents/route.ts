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
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const limit = parseInt(searchParams.get('limit') || '200')
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

    // Apply filters
    if (folderIds && folderIds.length > 0 && includeSubfolders) {
      // Include documents from all folders (parent and descendants)
      query = query.in('folder_id', folderIds)
    } else if (folderId) {
      query = query.eq('folder_id', folderId)
    }

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,file_key.ilike.%${search}%`)
    }

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

