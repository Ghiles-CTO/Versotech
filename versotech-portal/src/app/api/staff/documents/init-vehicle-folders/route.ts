import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'

// POST /api/staff/documents/init-vehicle-folders - Create default folders for a vehicle
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Parse request body
    const body = await request.json()
    const { vehicle_id } = body

    if (!vehicle_id) {
      return NextResponse.json(
        { error: 'vehicle_id is required' },
        { status: 400 }
      )
    }

    // Validate userId is a UUID (for demo accounts compatibility)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const createdBy = uuidRegex.test(userId) ? userId : null

    // Call database function to create default folders
    const { error: funcError } = await serviceSupabase.rpc(
      'create_default_vehicle_folders',
      {
        p_vehicle_id: vehicle_id,
        p_created_by: createdBy
      }
    )

    if (funcError) {
      console.error('Create default folders error:', funcError)
      return NextResponse.json(
        { error: 'Failed to create default folders' },
        { status: 500 }
      )
    }

    // Fetch created folders
    const { data: folders } = await serviceSupabase
      .from('document_folders')
      .select('*')
      .eq('vehicle_id', vehicle_id)
      .order('path', { ascending: true })

    return NextResponse.json({
      success: true,
      folders: folders || [],
      count: folders?.length || 0
    })

  } catch (error) {
    console.error('Init vehicle folders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

