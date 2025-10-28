import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'
import { z } from 'zod'

// Validation schemas
const updateFolderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  parent_folder_id: z.string().uuid().nullable().optional()
})

// PATCH /api/staff/documents/folders/:id - Update folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Validate userId is a UUID (for demo accounts compatibility)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const createdBy = uuidRegex.test(userId) ? userId : null

    // Parse and validate request body
    const body = await request.json()
    const validation = updateFolderSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (validation.error as any).errors },
        { status: 400 }
      )
    }

    const updates = validation.data

    // Get existing folder
    const { data: existingFolder, error: fetchError } = await serviceSupabase
      .from('document_folders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Prevent moving vehicle_root folders
    if (updates.parent_folder_id !== undefined && existingFolder.folder_type === 'vehicle_root') {
      return NextResponse.json(
        { error: 'Cannot move vehicle root folders' },
        { status: 400 }
      )
    }

    // Calculate new path if name or parent changes
    let newPath = existingFolder.path
    if (updates.name || updates.parent_folder_id !== undefined) {
      const name = updates.name || existingFolder.name
      
      if (updates.parent_folder_id === null) {
        // Moving to root
        newPath = `/${name}`
      } else if (updates.parent_folder_id) {
        // Moving to another folder
        const { data: newParent } = await serviceSupabase
          .from('document_folders')
          .select('path')
          .eq('id', updates.parent_folder_id)
          .single()

        if (!newParent) {
          return NextResponse.json(
            { error: 'Parent folder not found' },
            { status: 404 }
          )
        }

        newPath = `${newParent.path}/${name}`
      } else if (existingFolder.parent_folder_id) {
        // Just renaming, keep same parent
        const { data: currentParent } = await serviceSupabase
          .from('document_folders')
          .select('path')
          .eq('id', existingFolder.parent_folder_id)
          .single()

        if (currentParent) {
          newPath = `${currentParent.path}/${name}`
        } else {
          newPath = `/${name}`
        }
      } else {
        // Root folder rename
        newPath = `/${name}`
      }

      // Check for path conflicts
      if (newPath !== existingFolder.path) {
        const { data: conflictFolder } = await serviceSupabase
          .from('document_folders')
          .select('id')
          .eq('path', newPath)
          .single()

        if (conflictFolder) {
          return NextResponse.json(
            { error: 'A folder with this path already exists' },
            { status: 409 }
          )
        }
      }
    }

    // Update folder
    const { data: folder, error: updateError } = await serviceSupabase
      .from('document_folders')
      .update({
        ...updates,
        path: newPath
      })
      .eq('id', id)
      .select(`
        *,
        vehicle:vehicles(id, name, type),
        created_by_profile:profiles!document_folders_created_by_fkey(display_name, email)
      `)
      .single()

    if (updateError) {
      console.error('Folder update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update folder' },
        { status: 500 }
      )
    }

    // Update paths of all child folders recursively
    if (newPath !== existingFolder.path) {
      await updateChildFolderPaths(serviceSupabase, id, existingFolder.path, newPath)
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.UPDATE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: id,
      metadata: {
        folder_name: folder.name,
        old_path: existingFolder.path,
        new_path: newPath,
        updates
      }
    })

    return NextResponse.json({ folder })

  } catch (error) {
    console.error('Folder PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/staff/documents/folders/:id - Delete folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Get folder details
    const { data: folder, error: fetchError } = await serviceSupabase
      .from('document_folders')
      .select('name, path, folder_type')
      .eq('id', id)
      .single()

    if (fetchError || !folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of vehicle_root folders
    if (folder.folder_type === 'vehicle_root') {
      return NextResponse.json(
        { error: 'Cannot delete vehicle root folders' },
        { status: 400 }
      )
    }

    // Check if folder has documents
    const { count: documentCount } = await serviceSupabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('folder_id', id)

    if (documentCount && documentCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete folder with documents',
          details: `This folder contains ${documentCount} document(s). Please move or delete them first.`
        },
        { status: 400 }
      )
    }

    // Check if folder has subfolders
    const { count: subfolderCount } = await serviceSupabase
      .from('document_folders')
      .select('*', { count: 'exact', head: true })
      .eq('parent_folder_id', id)

    if (subfolderCount && subfolderCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete folder with subfolders',
          details: `This folder contains ${subfolderCount} subfolder(s). Please delete them first.`
        },
        { status: 400 }
      )
    }

    // Delete folder
    const { error: deleteError } = await serviceSupabase
      .from('document_folders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Folder deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete folder' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.DELETE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: id,
      metadata: {
        folder_name: folder.name,
        folder_path: folder.path,
        folder_type: folder.folder_type
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Folder DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to update child folder paths recursively
async function updateChildFolderPaths(
  supabase: any,
  parentId: string,
  oldParentPath: string,
  newParentPath: string
) {
  // Get all child folders
  const { data: children } = await supabase
    .from('document_folders')
    .select('id, name, path')
    .eq('parent_folder_id', parentId)

  if (!children || children.length === 0) {
    return
  }

  // Update each child's path
  for (const child of children) {
    const newPath = child.path.replace(oldParentPath, newParentPath)
    
    await supabase
      .from('document_folders')
      .update({ path: newPath })
      .eq('id', child.id)

    // Recursively update grandchildren
    await updateChildFolderPaths(supabase, child.id, child.path, newPath)
  }
}

