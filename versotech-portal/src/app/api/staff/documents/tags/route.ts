import { NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'

// GET /api/staff/documents/tags - Get all unique document tags
export async function GET() {
  try {
    // Authenticate staff user
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error

    const { serviceSupabase } = auth

    // Call RPC function to get distinct tags efficiently
    // Uses SQL: SELECT DISTINCT unnest(tags) FROM documents ORDER BY tag
    const { data: tagRows, error } = await serviceSupabase
      .rpc('get_distinct_document_tags')

    if (error) {
      console.error('[API] Tags query error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch tags',
          details: error.message || 'Unknown database error'
        },
        { status: 500 }
      )
    }

    // Extract tag strings from result rows
    const tags = (tagRows || []).map((row: { tag: string }) => row.tag)

    return NextResponse.json({ tags })

  } catch (error) {
    console.error('Tags GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
