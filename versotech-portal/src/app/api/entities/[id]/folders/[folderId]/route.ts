import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/entities/[id]/folders/[folderId] - Update folder (rename, move)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; folderId: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, folderId } = await params
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
    const { name, parent_folder_id } = body

    // Get current folder
    const { data: currentFolder, error: fetchError } = await supabase
      .from('document_folders')
      .select('*, vehicle_id, path, parent_folder_id')
      .eq('id', folderId)
      .single()

    if (fetchError || !currentFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    if (currentFolder.vehicle_id !== entityId) {
      return NextResponse.json({ error: 'Folder belongs to different entity' }, { status: 400 })
    }

    // Prevent renaming/moving root folders
    if (currentFolder.folder_type === 'vehicle_root') {
      return NextResponse.json(
        { error: 'Cannot modify root folder' },
        { status: 400 }
      )
    }

    let newPath = currentFolder.path
    const updates: any = {}

    // Handle rename
    if (name && name.trim() !== '' && name !== currentFolder.name) {
      const nameParts = currentFolder.path.split('/')
      nameParts[nameParts.length - 1] = name.trim()
      newPath = nameParts.join('/')
      updates.name = name.trim()
      updates.path = newPath
    }

    // Handle move to different parent
    if (parent_folder_id !== undefined && parent_folder_id !== currentFolder.parent_folder_id) {
      if (parent_folder_id === null) {
        // Moving to root
        newPath = updates.name || currentFolder.name
      } else {
        // Moving to another folder
        if (parent_folder_id === folderId) {
          return NextResponse.json(
            { error: 'Cannot move folder into itself' },
            { status: 400 }
          )
        }

        const { data: newParent } = await supabase
          .from('document_folders')
          .select('path, vehicle_id')
          .eq('id', parent_folder_id)
          .single()

        if (!newParent) {
          return NextResponse.json({ error: 'Target parent folder not found' }, { status: 404 })
        }

        if (newParent.vehicle_id !== entityId) {
          return NextResponse.json(
            { error: 'Cannot move folder to different entity' },
            { status: 400 }
          )
        }

        // Check for circular reference
        if (newParent.path.startsWith(currentFolder.path + '/')) {
          return NextResponse.json(
            { error: 'Cannot move folder into its own subfolder' },
            { status: 400 }
          )
        }

        newPath = `${newParent.path}/${updates.name || currentFolder.name}`
      }

      updates.parent_folder_id = parent_folder_id
      updates.path = newPath
    }

    // Check if new path conflicts with existing folder
    if (updates.path && updates.path !== currentFolder.path) {
      const { data: existingFolder } = await supabase
        .from('document_folders')
        .select('id')
        .eq('vehicle_id', entityId)
        .eq('path', updates.path)
        .neq('id', folderId)
        .maybeSingle()

      if (existingFolder) {
        return NextResponse.json(
          { error: 'A folder with this name already exists in the target location' },
          { status: 409 }
        )
      }
    }

    // Update folder
    const { data: updatedFolder, error: updateError } = await supabase
      .from('document_folders')
      .update(updates)
      .eq('id', folderId)
      .select()
      .single()

    if (updateError) {
      console.error('[API] Folder update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update folder', details: updateError.message },
        { status: 500 }
      )
    }

    // If path changed, update all descendant folders' paths
    if (updates.path && updates.path !== currentFolder.path) {
      const oldPrefix = currentFolder.path + '/'
      const newPrefix = updates.path + '/'

      const { data: descendants } = await supabase
        .from('document_folders')
        .select('id, path')
        .eq('vehicle_id', entityId)
        .like('path', `${currentFolder.path}/%`)

      if (descendants && descendants.length > 0) {
        const descendantUpdates = descendants.map(desc => ({
          id: desc.id,
          path: desc.path.replace(oldPrefix, newPrefix)
        }))

        for (const desc of descendantUpdates) {
          await supabase
            .from('document_folders')
            .update({ path: desc.path })
            .eq('id', desc.id)
        }
      }
    }

    return NextResponse.json({ folder: updatedFolder })

  } catch (error) {
    console.error('[API] Folder PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/entities/[id]/folders/[folderId] - Delete folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; folderId: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, folderId } = await params
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

    // Get folder
    const { data: folder, error: fetchError } = await supabase
      .from('document_folders')
      .select('vehicle_id, folder_type')
      .eq('id', folderId)
      .single()

    if (fetchError || !folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    if (folder.vehicle_id !== entityId) {
      return NextResponse.json({ error: 'Folder belongs to different entity' }, { status: 400 })
    }

    // Prevent deleting root folders or system folders
    if (folder.folder_type === 'vehicle_root' || folder.folder_type === 'category') {
      return NextResponse.json(
        { error: 'Cannot delete system folders' },
        { status: 400 }
      )
    }

    // Check if folder has documents
    const { data: documents } = await supabase
      .from('documents')
      .select('id')
      .eq('folder_id', folderId)
      .limit(1)

    if (documents && documents.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder that contains documents. Move or delete documents first.' },
        { status: 400 }
      )
    }

    // Check if folder has subfolders
    const { data: subfolders } = await supabase
      .from('document_folders')
      .select('id')
      .eq('parent_folder_id', folderId)
      .limit(1)

    if (subfolders && subfolders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder that contains subfolders. Delete subfolders first.' },
        { status: 400 }
      )
    }

    // Delete folder (CASCADE will handle foreign keys)
    const { error: deleteError } = await supabase
      .from('document_folders')
      .delete()
      .eq('id', folderId)

    if (deleteError) {
      console.error('[API] Folder delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete folder', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API] Folder DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
