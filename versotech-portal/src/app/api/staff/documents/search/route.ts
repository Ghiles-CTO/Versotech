import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'

// GET /api/staff/documents/search - Server-side document search
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error

    const { serviceSupabase } = auth

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const vehicleId = searchParams.get('vehicle_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 50
    const offset = (page - 1) * limit

    // Validate required search query
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query (q) is required' },
        { status: 400 }
      )
    }

    const searchTerm = query.trim()

    // Build search query with ILIKE for case-insensitive matching
    // Join to get vehicle and folder context for display
    let searchQuery = serviceSupabase
      .from('documents')
      .select(`
        id,
        name,
        type,
        file_size,
        status,
        created_at,
        updated_at,
        tags,
        current_version,
        document_expiry_date,
        watermark,
        folder:document_folders!documents_folder_id_fkey(id, name, path),
        vehicle:vehicles!documents_vehicle_id_fkey(id, name, type)
      `, { count: 'exact' })
      .ilike('name', `%${searchTerm}%`)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply optional vehicle filter
    if (vehicleId) {
      searchQuery = searchQuery.eq('vehicle_id', vehicleId)
    }

    const { data: results, error: searchError, count } = await searchQuery

    if (searchError) {
      console.error('[API] Search query error:', searchError)
      return NextResponse.json(
        {
          error: 'Search failed',
          details: searchError.message || 'Unknown database error'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      results: results || [],
      total: count || 0,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
        has_more: (count || 0) > offset + limit
      },
      query: searchTerm,
      vehicle_id: vehicleId
    })

  } catch (error) {
    console.error('Search GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
