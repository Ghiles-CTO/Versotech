import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET: Fetch version history for a document
 * Follows the replaced_by_id chain to build complete version history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: dealId, documentId } = await params

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

    const isStaff = profile?.role?.startsWith('staff_')
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()

    // Get all documents in the version chain
    // This includes the current document and all its predecessors
    const versions: any[] = []
    const visitedIds = new Set<string>()
    
    // Start with the current document
    let currentId: string | null = documentId
    
    // Walk backwards through the chain (find documents that point to this one)
    const { data: allDocs } = await serviceSupabase
      .from('deal_data_room_documents')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })

    if (!allDocs) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Build version chain
    const docMap = new Map(allDocs.map(doc => [doc.id, doc]))
    const targetDoc = docMap.get(documentId)

    if (!targetDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Find all documents in the same version family
    // Start with the current document and work backwards
    const versionFamily: any[] = []
    
    // Find the root (oldest) document
    let rootDoc = targetDoc
    for (const doc of allDocs) {
      if (doc.replaced_by_id === rootDoc.id) {
        rootDoc = doc
      }
    }

    // Now collect all versions from root to current
    versionFamily.push(rootDoc)
    let nextId = rootDoc.replaced_by_id
    
    while (nextId && !visitedIds.has(nextId)) {
      visitedIds.add(nextId)
      const nextDoc = docMap.get(nextId)
      if (!nextDoc) break
      versionFamily.push(nextDoc)
      nextId = nextDoc.replaced_by_id
    }

    // Sort by version number
    versionFamily.sort((a, b) => (b.version || 0) - (a.version || 0))

    return NextResponse.json({
      success: true,
      versions: versionFamily
    })

  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST: Upload a replacement version
 * Creates new document record linked to previous version
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: dealId, documentId } = await params

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

    const isStaff = profile?.role?.startsWith('staff_')
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()

    // Get current document
    const { data: currentDoc, error: fetchError } = await serviceSupabase
      .from('deal_data_room_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchError || !currentDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Parse form data for new file
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload new version
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileKey = `deals/${dealId}/${currentDoc.folder}/${timestamp}-${sanitizedFileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await serviceSupabase.storage
      .from('deal-documents')
      .upload(fileKey, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Create new document record
    const newVersion = currentDoc.version + 1
    const { data: newDoc, error: createError } = await serviceSupabase
      .from('deal_data_room_documents')
      .insert({
        deal_id: dealId,
        folder: currentDoc.folder,
        file_key: fileKey,
        file_name: file.name,
        visible_to_investors: currentDoc.visible_to_investors,
        file_size_bytes: file.size,
        mime_type: file.type,
        version: newVersion,
        tags: currentDoc.tags,
        document_notes: currentDoc.document_notes,
        created_by: user.id
      })
      .select()
      .single()

    if (createError) {
      console.error('Create error:', createError)
      // Clean up uploaded file
      await serviceSupabase.storage.from('deal-documents').remove([fileKey])
      return NextResponse.json({ error: 'Failed to create new version' }, { status: 500 })
    }

    // Update old document to point to new version
    await serviceSupabase
      .from('deal_data_room_documents')
      .update({ replaced_by_id: newDoc.id })
      .eq('id', documentId)

    return NextResponse.json({
      success: true,
      document: newDoc
    })

  } catch (error) {
    console.error('Error creating version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

