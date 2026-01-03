/**
 * Partner Documents API (Self-Service)
 * GET /api/partners/me/documents - List partner's KYC documents
 * POST /api/partners/me/documents - Upload a new document
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
 * GET /api/partners/me/documents
 * List documents for the current partner entity, including member info
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

    // Get partner entity for current user
    const { data: partnerUser, error: partnerError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (partnerError || !partnerUser?.partner_id) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 })
    }

    // Fetch documents for this partner entity
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
        profiles:created_by(display_name, email)
      `)
      .eq('partner_id', partnerUser.partner_id)
      .order('created_at', { ascending: false })

    if (docsError) {
      console.error('Error fetching documents:', docsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Fetch partner members for the member selector
    const { data: members, error: membersError } = await serviceSupabase
      .from('partner_users')
      .select(`
        user_id,
        role,
        is_primary,
        profiles:user_id(display_name, email)
      `)
      .eq('partner_id', partnerUser.partner_id)

    if (membersError) {
      console.error('Error fetching members:', membersError)
    }

    // Transform members for response
    const formattedMembers = members?.map(member => {
      const profile = member.profiles as unknown as { display_name?: string; email?: string } | null
      return {
        id: member.user_id,
        full_name: profile?.display_name || profile?.email || 'Unknown',
        role: member.role,
        is_primary: member.is_primary
      }
    }) || []

    // Transform documents for response
    const formattedDocs = documents?.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      file_key: doc.file_key,
      file_name: doc.name,
      file_size_bytes: doc.file_size_bytes,
      created_at: doc.created_at,
      created_by: doc.profiles
    })) || []

    return NextResponse.json({
      documents: formattedDocs,
      members: formattedMembers
    })

  } catch (error) {
    console.error('Error in GET /api/partners/me/documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/partners/me/documents
 * Upload a document for the current partner entity
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

    // Get partner entity for current user
    const { data: partnerUser, error: partnerError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (partnerError || !partnerUser?.partner_id) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 })
    }

    const partnerId = partnerUser.partner_id

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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
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
    const fileKey = `partner-kyc/${partnerId}/${documentType}/${timestamp}-${randomId}.${fileExt}`

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
      entity_type: 'partner',
      partner_id: partnerId,
      file_hash: crypto.createHash('sha256').update(Buffer.from(fileBuffer)).digest('hex').substring(0, 16)
    }

    // Create document record
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .insert({
        name: documentName || file.name.replace(/\.[^/.]+$/, ''),
        type: documentType,
        file_key: uploadData.path,
        partner_id: partnerId,
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
      action: 'partner_document_uploaded',
      entity_type: 'document',
      entity_id: document.id,
      action_details: {
        document_type: documentType,
        file_name: file.name,
        file_size: file.size,
        partner_id: partnerId
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
    console.error('Error in POST /api/partners/me/documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
