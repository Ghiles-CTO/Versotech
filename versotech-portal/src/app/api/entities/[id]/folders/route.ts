import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/entities/[id]/folders - List folders for an entity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const entityId = id

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role?.startsWith('staff_')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get folders for this entity
    const { data: folders, error: foldersError } = await supabase
      .from('document_folders')
      .select('*')
      .eq('vehicle_id', entityId)
      .order('path', { ascending: true })

    if (foldersError) {
      console.error('[API] Folders query error:', foldersError)
      return NextResponse.json(
        { error: 'Failed to fetch folders', details: foldersError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      folders: folders || [],
      total: folders?.length || 0
    })

  } catch (error) {
    console.error('[API] Folders GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/entities/[id]/folders - Create a new folder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const entityId = id

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role?.startsWith('staff_')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, parent_folder_id, folder_type = 'custom' } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    }

    // Build path
    const sanitizedName = name.trim()
    let resolvedParentId: string | null = parent_folder_id || null
    let path = sanitizedName
    let parentPath = ''

    if (resolvedParentId) {
      const { data: parentFolder } = await supabase
        .from('document_folders')
        .select('path, vehicle_id')
        .eq('id', resolvedParentId)
        .single()

      if (!parentFolder) {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 })
      }

      if (parentFolder.vehicle_id !== entityId) {
        return NextResponse.json({ error: 'Parent folder belongs to different entity' }, { status: 400 })
      }

      parentPath = parentFolder.path
      path = `${parentPath}/${sanitizedName}`
    } else {
      const { data: rootFolder } = await supabase
        .from('document_folders')
        .select('id, path')
        .eq('vehicle_id', entityId)
        .in('folder_type', ['vehicle_root', 'entity'])
        .is('parent_folder_id', null)
        .maybeSingle()

      if (rootFolder) {
        resolvedParentId = rootFolder.id
        parentPath = rootFolder.path
        path = `${rootFolder.path}/${sanitizedName}`
      } else {
        path = sanitizedName.startsWith('/') ? sanitizedName : `/${sanitizedName}`
      }
    }

    path = path.replace(/\/{2,}/g, '/')

    // Check if folder with same path already exists
    const { data: existingFolder } = await supabase
      .from('document_folders')
      .select('id')
      .eq('vehicle_id', entityId)
      .eq('path', path)
      .maybeSingle()

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists in this location' },
        { status: 409 }
      )
    }

    // Create folder
    const { data: newFolder, error: insertError } = await supabase
      .from('document_folders')
      .insert({
        vehicle_id: entityId,
        parent_folder_id: resolvedParentId,
        name: sanitizedName,
        path: path,
        folder_type: folder_type,
        created_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('[API] Folder insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create folder', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ folder: newFolder }, { status: 201 })

  } catch (error) {
    console.error('[API] Folders POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
