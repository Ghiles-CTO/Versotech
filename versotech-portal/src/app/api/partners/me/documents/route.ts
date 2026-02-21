/**
 * Partner Documents API (Self-Service)
 * GET /api/partners/me/documents - List partner's KYC documents
 * POST /api/partners/me/documents - Upload a new document
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { resolvePrimaryPersonaLink } from '@/lib/kyc/persona-link'
import {
  buildUploadDocumentMetadata,
  validateUploadDocumentMetadata,
} from '@/lib/kyc/upload-document-metadata'

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
    const { link: partnerUser, error: partnerError } = await resolvePrimaryPersonaLink<{
      partner_id: string
    }>({
      supabase: serviceSupabase,
      config: { userTable: 'partner_users', entityIdColumn: 'partner_id' },
      userId: user.id,
      select: 'partner_id',
    })

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
        partner_member_id,
        profiles:created_by(display_name, email)
      `)
      .eq('partner_id', partnerUser.partner_id)
      .order('created_at', { ascending: false })

    if (docsError) {
      console.error('Error fetching documents:', docsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Fetch entity members (directors/UBOs/signatories) for member-level KYC upload
    const { data: members, error: membersError } = await serviceSupabase
      .from('partner_members')
      .select(`
        id,
        full_name,
        first_name,
        last_name,
        role,
        is_signatory
      `)
      .eq('partner_id', partnerUser.partner_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching members:', membersError)
    }

    // Transform members for response
    const formattedMembers = members?.map(member => {
      const fullName =
        member.full_name ||
        [member.first_name, member.last_name].filter(Boolean).join(' ') ||
        'Unknown'
      return {
        id: member.id,
        full_name: fullName,
        role: member.role,
        is_signatory: member.is_signatory
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
      created_by: doc.profiles,
      partner_member_id: doc.partner_member_id
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
    const { link: partnerUser, error: partnerError } = await resolvePrimaryPersonaLink<{
      partner_id: string
    }>({
      supabase: serviceSupabase,
      config: { userTable: 'partner_users', entityIdColumn: 'partner_id' },
      userId: user.id,
      select: 'partner_id',
    })

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
    const partnerMemberId = formData.get('partner_member_id') as string | null
    const documentNumber = formData.get('documentNumber') as string | null
    const documentIssueDate = formData.get('documentIssueDate') as string | null
    const documentExpiryDate = formData.get('documentExpiryDate') as string | null
    const documentIssuingCountry = formData.get('documentIssuingCountry') as string | null
    const documentDate = formData.get('documentDate') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    const metadataValidationError = validateUploadDocumentMetadata(documentType, {
      documentNumber,
      documentIssueDate,
      documentExpiryDate,
      documentIssuingCountry,
      documentDate,
    })

    if (metadataValidationError) {
      return NextResponse.json({ error: metadataValidationError }, { status: 400 })
    }

    const documentMetadata = buildUploadDocumentMetadata(documentType, {
      documentNumber,
      documentIssueDate,
      documentExpiryDate,
      documentIssuingCountry,
      documentDate,
    })

    let resolvedPartnerMemberId: string | null = null
    if (partnerMemberId && partnerMemberId !== 'entity-level') {
      const { data: memberCheck, error: memberError } = await serviceSupabase
        .from('partner_members')
        .select('id')
        .eq('id', partnerMemberId)
        .eq('partner_id', partnerId)
        .eq('is_active', true)
        .maybeSingle()

      if (memberError || !memberCheck) {
        return NextResponse.json({ error: 'Invalid member selected' }, { status: 400 })
      }

      resolvedPartnerMemberId = memberCheck.id
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
        partner_member_id: resolvedPartnerMemberId,
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

    // Version-aware KYC submission entry (review queue source of truth)
    let versionQuery = serviceSupabase
      .from('kyc_submissions')
      .select('id, version')
      .eq('partner_id', partnerId)
      .eq('document_type', documentType)

    if (resolvedPartnerMemberId) {
      versionQuery = versionQuery.eq('partner_member_id', resolvedPartnerMemberId)
    } else {
      versionQuery = versionQuery.is('partner_member_id', null)
    }

    const { data: latestSubmission } = await versionQuery
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    const newVersion = latestSubmission ? latestSubmission.version + 1 : 1
    const previousSubmissionId = latestSubmission?.id || null

    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .insert({
        partner_id: partnerId,
        partner_member_id: resolvedPartnerMemberId,
        document_type: documentType,
        document_id: document.id,
        status: 'pending',
        version: newVersion,
        previous_submission_id: previousSubmissionId,
        document_date: documentMetadata.submission.document_date,
        document_valid_from: documentMetadata.submission.document_valid_from,
        document_valid_to: documentMetadata.submission.document_valid_to,
        expiry_date: documentMetadata.submission.expiry_date,
        submitted_at: new Date().toISOString(),
        metadata: {
          file_size: file.size,
          mime_type: file.type,
          original_filename: file.name,
          source: 'partner_profile_upload',
          selected_partner_member_id: resolvedPartnerMemberId,
          is_reupload: !!latestSubmission,
          document_fields: documentMetadata.metadataFields,
        }
      })
      .select('id, status')
      .single()

    if (submissionError) {
      console.error('KYC submission creation error:', submissionError)

      await serviceSupabase.from('documents').delete().eq('id', document.id)
      await serviceSupabase.storage
        .from(process.env.STORAGE_BUCKET_NAME || 'documents')
        .remove([fileKey])

      return NextResponse.json({ error: 'Failed to create KYC submission' }, { status: 500 })
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
      },
      submission_id: submission.id,
      submission_status: submission.status,
    })

  } catch (error) {
    console.error('Error in POST /api/partners/me/documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
