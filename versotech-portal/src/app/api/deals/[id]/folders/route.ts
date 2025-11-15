import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

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

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Use service client to bypass RLS
    const serviceSupabase = createServiceClient()

    // Get the deal to find its vehicle
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select('id, name, vehicle_id')
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    if (!deal.vehicle_id) {
      return NextResponse.json(
        { error: 'Deal has no associated vehicle' },
        { status: 400 }
      )
    }

    // Get the deal's folders from the document_folders table
    // Look for folders that belong to this deal (under /VehicleName/Deals/DealName/*)
    const { data: folders, error: foldersError } = await serviceSupabase
      .from('document_folders')
      .select('id, name, path, folder_type, parent_folder_id')
      .eq('vehicle_id', deal.vehicle_id)
      .like('path', `%/Deals/${deal.name}/%`)
      .order('path')

    if (foldersError) {
      console.error('Error fetching deal folders:', foldersError)
      return NextResponse.json(
        { error: 'Failed to fetch folders' },
        { status: 500 }
      )
    }

    // If no deal-specific folders found, try to create them
    if (!folders || folders.length === 0) {
      console.log(`No folders found for deal ${deal.name}, they should be created by trigger`)

      // Try to manually create folders if triggers haven't fired
      const { data: createdFolders, error: createError } = await serviceSupabase
        .rpc('auto_create_deal_folder_for_existing', {
          p_deal_id: dealId,
          p_created_by: user.id
        })

      if (createError) {
        console.error('Error creating deal folders:', createError)
        // Continue anyway, return empty folders
      }

      // Try fetching again after creation attempt
      const { data: retryFolders } = await serviceSupabase
        .from('document_folders')
        .select('id, name, path, folder_type, parent_folder_id')
        .eq('vehicle_id', deal.vehicle_id)
        .like('path', `%/Deals/${deal.name}/%`)
        .order('path')

      return NextResponse.json({
        success: true,
        folders: retryFolders || [],
        deal: {
          id: deal.id,
          name: deal.name,
          vehicle_id: deal.vehicle_id
        }
      })
    }

    // Return the folders
    return NextResponse.json({
      success: true,
      folders: folders,
      deal: {
        id: deal.id,
        name: deal.name,
        vehicle_id: deal.vehicle_id
      }
    })

  } catch (error) {
    console.error('Deal folders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}