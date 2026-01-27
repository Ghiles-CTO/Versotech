import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/staff/documents/data-room/[dealId]
 *
 * Lists all data room documents for a specific deal.
 * Staff-only endpoint for the Staff Documents page data room integration.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await params

  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: profile } = await clientSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Verify deal exists and get deal info
    const serviceSupabase = createServiceClient()
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select('id, name, vehicle_id')
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Get query params for optional filtering
    const searchParams = request.nextUrl.searchParams
    const folder = searchParams.get('folder')
    const search = searchParams.get('search')

    // Fetch data room documents
    let query = serviceSupabase
      .from('deal_data_room_documents')
      .select(`
        id,
        deal_id,
        folder,
        file_key,
        file_name,
        visible_to_investors,
        tags,
        document_expires_at,
        document_notes,
        version,
        file_size_bytes,
        mime_type,
        external_link,
        is_featured,
        created_by,
        created_at,
        updated_at
      `)
      .eq('deal_id', dealId)
      .is('replaced_by_id', null) // Only show current versions (not replaced documents)
      .order('created_at', { ascending: false })

    // Apply optional filters
    if (folder) {
      query = query.eq('folder', folder)
    }

    if (search) {
      query = query.ilike('file_name', `%${search}%`)
    }

    const { data: documents, error: docsError } = await query

    if (docsError) {
      console.error('Error fetching data room documents:', docsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Get unique folders for folder navigation
    const { data: folderData } = await serviceSupabase
      .from('deal_data_room_documents')
      .select('folder')
      .eq('deal_id', dealId)
      .is('replaced_by_id', null)

    const uniqueFolders = [...new Set(folderData?.map(d => d.folder).filter(Boolean) || [])]

    return NextResponse.json({
      documents: documents || [],
      total: documents?.length || 0,
      deal: {
        id: deal.id,
        name: deal.name,
        vehicle_id: deal.vehicle_id
      },
      folders: uniqueFolders.sort()
    })

  } catch (error) {
    console.error('Error in data room documents endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
