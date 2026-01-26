import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'
import { z } from 'zod'

// Validation schemas
const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(255),
  parent_folder_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional(),
  folder_type: z.enum(['vehicle_root', 'category', 'custom'])
})

// GET /api/staff/documents/folders - List all folders
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const vehicleId = searchParams.get('vehicle_id')
    const folderType = searchParams.get('folder_type')
    const includeTree = searchParams.get('tree') === 'true'

    // Build query
    let query = serviceSupabase
      .from('document_folders')
      .select(`
        *,
        vehicle:vehicles(id, name, type),
        created_by_profile:profiles!document_folders_created_by_fkey(display_name, email)
      `)
      .order('path', { ascending: true })

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }

    if (folderType) {
      query = query.eq('folder_type', folderType)
    }

    const { data: folders, error: foldersError } = await query

    if (foldersError) {
      console.error('[API] Folders query error:', foldersError)
      console.error('[API] Error details:', JSON.stringify(foldersError, null, 2))
      return NextResponse.json(
        {
          error: 'Failed to fetch folders',
          details: foldersError.message || 'Unknown database error',
          code: foldersError.code,
          hint: foldersError.hint
        },
        { status: 500 }
      )
    }

    // Get document counts for all folders (single query to avoid N+1)
    const { data: documentCounts, error: docCountError } = await serviceSupabase
      .from('documents')
      .select('id, folder_id')
      .not('folder_id', 'is', null)

    if (docCountError) {
      console.error('[API] Document counts query error:', docCountError)
      return NextResponse.json(
        { error: 'Failed to fetch document counts', details: docCountError.message },
        { status: 500 }
      )
    }

    // Count documents per folder
    const countsByFolder = new Map<string, number>()
    documentCounts?.forEach((doc: { id: string; folder_id: string }) => {
      const folderId = doc.folder_id
      countsByFolder.set(folderId, (countsByFolder.get(folderId) || 0) + 1)
    })

    // If tree structure is requested, build hierarchy
    if (includeTree) {
      const tree = buildFolderTree(folders || [], documentCounts || [])
      return NextResponse.json({ folders: tree, total: folders?.length || 0 })
    }

    // Add document_count to each folder for flat response
    const foldersWithCounts = (folders || []).map((folder: { id: string; [key: string]: unknown }) => ({
      ...folder,
      document_count: countsByFolder.get(folder.id) || 0
    }))

    return NextResponse.json({
      folders: foldersWithCounts,
      total: foldersWithCounts.length
    })

  } catch (error) {
    console.error('Folders GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/staff/documents/folders - Create new folder
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Parse and validate request body
    const body = await request.json()
    const validation = createFolderSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('[API] Validation failed:', (validation.error as any).errors)
      return NextResponse.json(
        { error: 'Invalid request data', details: (validation.error as any).errors },
        { status: 400 }
      )
    }

    const { name, parent_folder_id, folder_type } = validation.data
    let vehicle_id = validation.data.vehicle_id

    // If creating subfolder, inherit vehicle_id from parent
    if (parent_folder_id && !vehicle_id) {
      const { data: parentFolder } = await serviceSupabase
        .from('document_folders')
        .select('vehicle_id')
        .eq('id', parent_folder_id)
        .single()

      if (parentFolder) {
        vehicle_id = parentFolder.vehicle_id
      }
    }

    // Build folder path
    let path = `/${name}`
    if (parent_folder_id) {
      const { data: parentFolder } = await serviceSupabase
        .from('document_folders')
        .select('path')
        .eq('id', parent_folder_id)
        .single()

      if (parentFolder) {
        path = `${parentFolder.path}/${name}`
      }
    } else if (vehicle_id && folder_type === 'vehicle_root') {
      // For vehicle root, use vehicle name
      const { data: vehicle } = await serviceSupabase
        .from('vehicles')
        .select('name')
        .eq('id', vehicle_id)
        .single()

      if (vehicle) {
        path = `/${vehicle.name}`
      }
    }

    // Check for duplicate path
    const { data: existingFolder } = await serviceSupabase
      .from('document_folders')
      .select('id')
      .eq('path', path)
      .single()

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this path already exists' },
        { status: 409 }
      )
    }

    // Validate userId is a UUID (for demo accounts compatibility)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const createdBy = uuidRegex.test(userId) ? userId : null

    // Create folder
    const { data: folder, error: createError } = await serviceSupabase
      .from('document_folders')
      .insert({
        name,
        path,
        parent_folder_id: parent_folder_id || null,
        vehicle_id: vehicle_id || null,
        folder_type,
        created_by: createdBy
      })
      .select(`
        *,
        vehicle:vehicles(id, name, type),
        created_by_profile:profiles!document_folders_created_by_fkey(display_name, email)
      `)
      .single()

    if (createError) {
      console.error('Folder creation error:', createError)
      return NextResponse.json(
        { error: 'Failed to create folder' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.CREATE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: folder.id,
      metadata: {
        folder_name: name,
        folder_path: path,
        folder_type,
        vehicle_id,
        parent_folder_id
      }
    })

    return NextResponse.json({ folder }, { status: 201 })

  } catch (error) {
    console.error('Folders POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to build folder tree
function buildFolderTree(folders: any[], documentCounts: any[]): any[] {
  const folderMap = new Map()
  const tree: any[] = []

  // Count documents per folder
  const countsByFolder = new Map<string, number>()
  documentCounts.forEach(doc => {
    const folderId = doc.folder_id
    countsByFolder.set(folderId, (countsByFolder.get(folderId) || 0) + 1)
  })

  // Create map of all folders with document counts
  folders.forEach(folder => {
    folderMap.set(folder.id, {
      ...folder,
      children: [],
      document_count: countsByFolder.get(folder.id) || 0
    })
  })

  // Build tree structure
  folders.forEach(folder => {
    const node = folderMap.get(folder.id)
    if (folder.parent_folder_id) {
      const parent = folderMap.get(folder.parent_folder_id)
      if (parent) {
        parent.children.push(node)
      } else {
        tree.push(node)
      }
    } else {
      tree.push(node)
    }
  })

  // Recursive function to aggregate document counts from all descendants
  function aggregateCounts(node: any): number {
    let total = node.document_count || 0
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        total += aggregateCounts(child)
      })
    }
    node.document_count = total
    return total
  }

  // Apply recursive counting to all root nodes
  tree.forEach(root => aggregateCounts(root))

  return tree
}

