/**
 * Arranger Documents API (Self-Service)
 * GET /api/arrangers/me/documents - List arranger's KYC documents
 * POST /api/arrangers/me/documents - Upload a new document
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'text/plain'
]

/**
 * GET /api/arrangers/me/documents
 * List documents for the current arranger entity, including member info
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get arranger entity for current user
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    // Fetch documents for this arranger entity
    const { data: documents, error: docsError } = await serviceSupabase
      .from('documents')
      .select(`
        id,
        name,
        type,
        file_key,
        file_size_bytes,
        mime_type,
        created_at,
        created_by,
        arranger_user_id,
        profiles:created_by(display_name, email)
      `)
      .eq('arranger_entity_id', arrangerUser.arranger_id)
      .order('created_at', { ascending: false })

    if (docsError) {
      console.error('Error fetching documents:', docsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Fetch arranger members for the member selector
    const { data: members, error: membersError } = await serviceSupabase
      .from('arranger_users')
      .select(`
        user_id,
        role,
        is_primary,
        profiles:user_id(display_name, email)
      `)
      .eq('arranger_id', arrangerUser.arranger_id)

    if (membersError) {
      console.error('Error fetching members:', membersError)
    }

    // Transform members for response
    const formattedMembers = members?.map(member => ({
      id: member.user_id,
      full_name: (member.profiles as any)?.display_name || (member.profiles as any)?.email || 'Unknown',
      role: member.role,
      is_primary: member.is_primary
    })) || []

    // Transform documents for response
    const formattedDocs = documents?.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      file_key: doc.file_key,
      file_name: doc.name,
      file_size_bytes: doc.file_size_bytes,
      created_at: doc.created_at,
      created_by: doc.profiles,
      arranger_user_id: doc.arranger_user_id
    })) || []

    return NextResponse.json({
      documents: formattedDocs,
      members: formattedMembers
    })

  } catch (error) {
    console.error('Error in GET /api/arrangers/me/documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/arrangers/me/documents
 * Upload a document for the current arranger entity
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get arranger entity for current user
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Get user profile for watermark
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .single()

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('type') as string
    const documentName = formData.get('name') as string
    const arrangerUserId = formData.get('arranger_user_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    // If arranger_user_id provided, validate it belongs to this arranger
    if (arrangerUserId && arrangerUserId !== 'entity-level') {
      const { data: memberCheck, error: memberError } = await serviceSupabase
        .from('arranger_users')
        .select('user_id')
        .eq('arranger_id', arrangerId)
        .eq('user_id', arrangerUserId)
        .maybeSingle()

      if (memberError || !memberCheck) {
        return NextResponse.json({ error: 'Invalid member selected' }, { status: 400 })
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, WEBP, TXT'
      }, { status: 400 })
    }

    // Generate secure file path
    const timestamp = Date.now()
    const randomId = crypto.randomBytes(16).toString('hex')
    const fileExt = file.name.split('.').pop()
    const fileKey = `arranger-kyc/${arrangerId}/${documentType}/${timestamp}-${randomId}.${fileExt}`

    // Upload file to storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from(process.env.STORAGE_BUCKET_NAME || 'documents')
      .upload(fileKey, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Create watermark metadata
    const watermarkData = {
      uploaded_by: profile?.display_name || profile?.email || user.email,
      uploaded_at: new Date().toISOString(),
      document_classification: 'CONFIDENTIAL',
      entity_type: 'arranger',
      arranger_id: arrangerId,
      file_hash: crypto.createHash('sha256').update(Buffer.from(fileBuffer)).digest('hex').substring(0, 16)
    }

    // Create document record
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .insert({
        name: documentName || file.name.replace(/\.[^/.]+$/, ''),
        type: documentType,
        file_key: uploadData.path,
        arranger_entity_id: arrangerId,
        arranger_user_id: (arrangerUserId && arrangerUserId !== 'entity-level') ? arrangerUserId : null,
        file_size_bytes: file.size,
        mime_type: file.type,
        current_version: 1,
        status: 'draft',
        is_published: true,
        created_by: user.id,
        watermark: watermarkData
      })
      .select()
      .single()

    if (docError) {
      console.error('Document creation error:', docError)
      // Clean up uploaded file
      await serviceSupabase.storage
        .from(process.env.STORAGE_BUCKET_NAME || 'documents')
        .remove([fileKey])

      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'compliance',
      actor_id: user.id,
      action: 'arranger_document_uploaded',
      entity_type: 'document',
      entity_id: document.id,
      action_details: {
        document_type: documentType,
        file_name: file.name,
        file_size: file.size,
        arranger_id: arrangerId
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        file_key: document.file_key,
        created_at: document.created_at
      }
    })

  } catch (error) {
    console.error('Error in POST /api/arrangers/me/documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
