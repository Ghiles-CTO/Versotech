import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'
import crypto from 'crypto'

// GET /api/staff/documents/:id/versions - List all versions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Get all versions
    const { data: versions, error: versionsError } = await serviceSupabase
      .from('document_versions')
      .select(`
        *,
        created_by_profile:profiles!document_versions_created_by_fkey(display_name, email)
      `)
      .eq('document_id', id)
      .order('version_number', { ascending: false })

    if (versionsError) {
      console.error('Versions query error:', versionsError)
      return NextResponse.json(
        { error: 'Failed to fetch versions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      versions: versions || [],
      total: versions?.length || 0
    })

  } catch (error) {
    console.error('Versions GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/staff/documents/:id/versions - Upload new version
export async function POST(
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

    // Get document
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('current_version, name, folder_id')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const changesDescription = formData.get('changes_description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOCX, XLSX, TXT, JPEG, PNG' },
        { status: 400 }
      )
    }

    const maxSize = 1024 * 1024 * 1024 // 1GB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 1GB' },
        { status: 400 }
      )
    }

    // Calculate new version number
    const newVersionNumber = (document.current_version || 1) + 1

    // Generate file key
    const timestamp = new Date().toISOString().split('T')[0]
    const randomString = crypto.randomBytes(8).toString('hex')
    const fileExtension = file.name.split('.').pop()
    const fileKey = `documents/${timestamp}/${randomString}_v${newVersionNumber}.${fileExtension}`

    // Upload to storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const storageBucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents'
    
    const { error: uploadError } = await serviceSupabase.storage
      .from(storageBucket)
      .upload(fileKey, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('File upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create version record
    const { data: version, error: versionError } = await serviceSupabase
      .from('document_versions')
      .insert({
        document_id: id,
        version_number: newVersionNumber,
        file_key: fileKey,
        file_size_bytes: file.size,
        mime_type: file.type,
        changes_description: changesDescription || null,
        created_by: createdBy
      })
      .select(`
        *,
        created_by_profile:profiles!document_versions_created_by_fkey(display_name, email)
      `)
      .single()

    if (versionError) {
      // Clean up uploaded file
      await serviceSupabase.storage.from(storageBucket).remove([fileKey])
      
      console.error('Version record creation error:', versionError)
      return NextResponse.json(
        { error: 'Failed to create version record' },
        { status: 500 }
      )
    }

    // Update document with new version and file key
    const { error: updateError } = await serviceSupabase
      .from('documents')
      .update({
        current_version: newVersionNumber,
        file_key: fileKey,
        file_size_bytes: file.size,
        mime_type: file.type
      })
      .eq('id', id)

    if (updateError) {
      console.error('Document update error:', updateError)
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.UPDATE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: id,
      metadata: {
        action_type: 'new_version',
        version_number: newVersionNumber,
        file_key: fileKey,
        file_size: file.size,
        changes_description: changesDescription
      }
    })

    return NextResponse.json({ version }, { status: 201 })

  } catch (error) {
    console.error('Version POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

