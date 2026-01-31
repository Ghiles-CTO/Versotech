import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'

// GET /api/staff/documents/search - Server-side document search
// Enhanced to search across document name, vehicle name, and deal name
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

    // Use RPC function to search across document name, vehicle name, and deal name
    const { data: results, error: searchError } = await serviceSupabase
      .rpc('search_documents_enhanced', {
        search_term: searchTerm,
        vehicle_filter: vehicleId || null,
        result_limit: limit,
        result_offset: offset
      })

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

    // Extract total count from first result (all rows have the same total_count)
    const totalCount = results?.[0]?.total_count || 0

    // Transform results to match expected format
    const transformedResults = (results || []).map((row: {
      id: string
      name: string
      type: string
      file_size_bytes: number
      status: string
      created_at: string
      updated_at: string
      tags: string[]
      current_version: number
      document_expiry_date: string
      watermark: Record<string, unknown>
      folder_id: string
      folder_name: string
      folder_path: string
      vehicle_id: string
      vehicle_name: string
      vehicle_type: string
      deal_id: string
      deal_name: string
      total_count: number
    }) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      file_size: row.file_size_bytes,  // Map to file_size for client compatibility
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      tags: row.tags,
      current_version: row.current_version,
      document_expiry_date: row.document_expiry_date,
      watermark: row.watermark,
      folder: row.folder_id ? {
        id: row.folder_id,
        name: row.folder_name,
        path: row.folder_path
      } : null,
      vehicle: row.vehicle_id ? {
        id: row.vehicle_id,
        name: row.vehicle_name,
        type: row.vehicle_type
      } : null,
      deal: row.deal_id ? {
        id: row.deal_id,
        name: row.deal_name
      } : null
    }))

    return NextResponse.json({
      results: transformedResults,
      total: totalCount,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalCount / limit),
        has_more: totalCount > offset + limit
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
