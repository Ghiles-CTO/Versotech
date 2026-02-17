import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * POST — Generate a presigned upload URL for direct browser-to-storage upload.
 * This bypasses the Vercel 4.5 MB body limit since only JSON metadata is sent
 * through the serverless function; the actual file goes directly to Supabase Storage.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

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

    const body = await request.json()
    const { fileName, folder, contentType, fileSize } = body

    if (!fileName || !folder) {
      return NextResponse.json({ error: 'fileName and folder are required' }, { status: 400 })
    }

    // Validate folder path
    if (folder.includes('..') || folder.startsWith('/') || folder.includes('//')) {
      return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 })
    }

    // Validate file size (1GB max)
    const maxSize = 1024 * 1024 * 1024
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json({
        error: 'File size too large. Maximum size is 1GB'
      }, { status: 400 })
    }

    // Generate unique file key
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileKey = `deals/${dealId}/${folder}/${timestamp}-${sanitizedFileName}`

    // Create presigned upload URL via service client
    const serviceSupabase = createServiceClient()
    const { data, error } = await serviceSupabase.storage
      .from('deal-documents')
      .createSignedUploadUrl(fileKey)

    if (error) {
      console.error('Presigned URL error:', error)
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      fileKey,
      token: data.token
    })
  } catch (error) {
    console.error('Presigned upload error:', error)
    return NextResponse.json(
      { error: 'Unexpected error creating upload URL' },
      { status: 500 }
    )
  }
}

/**
 * PUT — Confirm that a presigned upload completed and create the DB record.
 * Called after the browser has directly uploaded the file to Supabase Storage.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

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

    const body = await request.json()
    const { fileKey, fileName, folder, fileSize, mimeType, visibleToInvestors, isFeatured } = body

    if (!fileKey || !fileName || !folder) {
      return NextResponse.json(
        { error: 'fileKey, fileName, and folder are required' },
        { status: 400 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Create database record
    const { data: document, error: dbError } = await serviceSupabase
      .from('deal_data_room_documents')
      .insert({
        deal_id: dealId,
        folder,
        file_key: fileKey,
        file_name: fileName,
        visible_to_investors: (isFeatured ?? false) ? true : (visibleToInvestors ?? false),
        is_featured: isFeatured ?? false,
        file_size_bytes: fileSize || 0,
        mime_type: mimeType || 'application/octet-stream',
        version: 1,
        created_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Clean up uploaded file to prevent orphans
      await serviceSupabase.storage.from('deal-documents').remove([fileKey])
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.DEALS,
      entity_id: dealId,
      metadata: {
        type: 'data_room_document_uploaded',
        document_id: document.id,
        file_name: fileName,
        folder,
        visible_to_investors: visibleToInvestors ?? false,
        file_size: fileSize || 0,
        upload_method: 'presigned'
      }
    })

    return NextResponse.json({
      success: true,
      document
    })
  } catch (error) {
    console.error('Confirm upload error:', error)
    return NextResponse.json(
      { error: 'Unexpected error confirming upload' },
      { status: 500 }
    )
  }
}
