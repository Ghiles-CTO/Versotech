import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const MAX_VERSION_FILE_SIZE = 1024 * 1024 * 1024 // 1GB

async function authenticateStaffUser() {
  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null
    } as const
  }

  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'
  if (!isStaff) {
    return {
      error: NextResponse.json({ error: 'Staff access required' }, { status: 403 }),
      user: null
    } as const
  }

  return { error: null, user } as const
}

async function getCurrentDocument(serviceSupabase: ReturnType<typeof createServiceClient>, documentId: string) {
  const { data: currentDoc, error } = await serviceSupabase
    .from('deal_data_room_documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (error || !currentDoc) {
    return {
      error: NextResponse.json({ error: 'Document not found' }, { status: 404 }),
      currentDoc: null
    } as const
  }

  return { error: null, currentDoc } as const
}

/**
 * GET: Fetch version history for a document.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: dealId, documentId } = await params

  try {
    const auth = await authenticateStaffUser()
    if (auth.error) return auth.error

    const serviceSupabase = createServiceClient()

    const visitedIds = new Set<string>()
    const { data: allDocs } = await serviceSupabase
      .from('deal_data_room_documents')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })

    if (!allDocs) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const docMap = new Map(allDocs.map(doc => [doc.id, doc]))
    const targetDoc = docMap.get(documentId)

    if (!targetDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const versionFamily: any[] = []

    let rootDoc = targetDoc
    for (const doc of allDocs) {
      if (doc.replaced_by_id === rootDoc.id) {
        rootDoc = doc
      }
    }

    versionFamily.push(rootDoc)
    let nextId = rootDoc.replaced_by_id

    while (nextId && !visitedIds.has(nextId)) {
      visitedIds.add(nextId)
      const nextDoc = docMap.get(nextId)
      if (!nextDoc) break
      versionFamily.push(nextDoc)
      nextId = nextDoc.replaced_by_id
    }

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
 * POST:
 * - JSON body: generate presigned upload URL for direct browser upload.
 * - Multipart body: legacy upload path (kept for backward compatibility).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: dealId, documentId } = await params

  try {
    const auth = await authenticateStaffUser()
    if (auth.error) return auth.error
    const user = auth.user

    const serviceSupabase = createServiceClient()
    const current = await getCurrentDocument(serviceSupabase, documentId)
    if (current.error) return current.error

    const currentDoc = current.currentDoc

    const contentType = request.headers.get('content-type') || ''

    // Presigned step: expects JSON metadata only.
    if (contentType.includes('application/json')) {
      const body = await request.json()
      const { fileName, fileSize } = body as { fileName?: string; fileSize?: number }

      if (!fileName) {
        return NextResponse.json({ error: 'fileName is required' }, { status: 400 })
      }

      if (fileSize && fileSize > MAX_VERSION_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File size too large. Maximum size is 1GB' },
          { status: 400 }
        )
      }

      const timestamp = Date.now()
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileKey = `deals/${dealId}/${currentDoc.folder}/${timestamp}-${sanitizedFileName}`

      const { data, error } = await serviceSupabase.storage
        .from('deal-documents')
        .createSignedUploadUrl(fileKey)

      if (error) {
        console.error('Version presigned URL error:', error)
        return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
      }

      return NextResponse.json({
        signedUrl: data.signedUrl,
        fileKey,
        token: data.token
      })
    }

    // Legacy fallback: direct multipart upload through API.
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_VERSION_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 1GB' },
        { status: 400 }
      )
    }

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
      console.error('Version upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const newVersion = Number(currentDoc.version || 0) + 1
    const { data: newDoc, error: createError } = await serviceSupabase
      .from('deal_data_room_documents')
      .insert({
        deal_id: dealId,
        folder: currentDoc.folder,
        file_key: fileKey,
        file_name: file.name,
        visible_to_investors: currentDoc.visible_to_investors,
        is_featured: currentDoc.is_featured,
        file_size_bytes: file.size,
        mime_type: file.type || 'application/octet-stream',
        version: newVersion,
        tags: currentDoc.tags,
        document_notes: currentDoc.document_notes,
        created_by: user.id
      })
      .select()
      .single()

    if (createError || !newDoc) {
      console.error('Version create error:', createError)
      await serviceSupabase.storage.from('deal-documents').remove([fileKey])
      return NextResponse.json({ error: 'Failed to create new version' }, { status: 500 })
    }

    const { error: linkError } = await serviceSupabase
      .from('deal_data_room_documents')
      .update({ replaced_by_id: newDoc.id })
      .eq('id', documentId)

    if (linkError) {
      console.error('Version link error:', linkError)
      return NextResponse.json({ error: 'Failed to finalize version chain' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document: newDoc
    })

  } catch (error) {
    console.error('Error creating version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT: Confirm a direct-to-storage version upload and create replacement version record.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: dealId, documentId } = await params

  try {
    const auth = await authenticateStaffUser()
    if (auth.error) return auth.error
    const user = auth.user

    const serviceSupabase = createServiceClient()
    const current = await getCurrentDocument(serviceSupabase, documentId)
    if (current.error) return current.error

    const currentDoc = current.currentDoc
    const body = await request.json()
    const { fileKey, fileName, fileSize, mimeType } = body as {
      fileKey?: string
      fileName?: string
      fileSize?: number
      mimeType?: string
    }

    if (!fileKey || !fileName) {
      return NextResponse.json({ error: 'fileKey and fileName are required' }, { status: 400 })
    }

    if (!fileKey.startsWith(`deals/${dealId}/`)) {
      return NextResponse.json({ error: 'Invalid file key for deal' }, { status: 400 })
    }

    if (fileSize && fileSize > MAX_VERSION_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 1GB' },
        { status: 400 }
      )
    }

    const newVersion = Number(currentDoc.version || 0) + 1
    const { data: newDoc, error: createError } = await serviceSupabase
      .from('deal_data_room_documents')
      .insert({
        deal_id: dealId,
        folder: currentDoc.folder,
        file_key: fileKey,
        file_name: fileName,
        visible_to_investors: currentDoc.visible_to_investors,
        is_featured: currentDoc.is_featured,
        file_size_bytes: fileSize || 0,
        mime_type: mimeType || 'application/octet-stream',
        version: newVersion,
        tags: currentDoc.tags,
        document_notes: currentDoc.document_notes,
        created_by: user.id
      })
      .select()
      .single()

    if (createError || !newDoc) {
      console.error('Version confirm create error:', createError)
      await serviceSupabase.storage.from('deal-documents').remove([fileKey])
      return NextResponse.json({ error: 'Failed to create new version' }, { status: 500 })
    }

    const { error: linkError } = await serviceSupabase
      .from('deal_data_room_documents')
      .update({ replaced_by_id: newDoc.id })
      .eq('id', documentId)

    if (linkError) {
      console.error('Version confirm link error:', linkError)
      return NextResponse.json({ error: 'Failed to finalize version chain' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document: newDoc
    })

  } catch (error) {
    console.error('Error confirming version upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
