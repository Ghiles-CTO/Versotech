import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { validateDocument } from '@/lib/validation/document-validation'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1GB

async function authenticateStaff() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null, profile: null } as const
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, title')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)) {
    return { error: NextResponse.json({ error: 'Staff access required' }, { status: 403 }), user: null, profile: null } as const
  }

  return { error: null, user, profile } as const
}

/**
 * POST — Generate a presigned upload URL for direct browser-to-storage upload.
 * This bypasses the Vercel 4.5 MB body limit since only JSON metadata is sent
 * through the serverless function; the actual file goes directly to Supabase Storage.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateStaff()
    if (auth.error) return auth.error

    const body = await request.json()
    const { fileName, contentType, fileSize, documentType } = body

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: 'documentType is required' }, { status: 400 })
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File size too large. Maximum size is 1GB'
      }, { status: 400 })
    }

    // Generate secure file key
    const fileExtension = fileName.split('.').pop()
    const timestamp = Date.now()
    const randomId = crypto.randomBytes(16).toString('hex')
    const fileKey = `${documentType}/${timestamp}-${randomId}.${fileExtension}`

    const serviceSupabase = createServiceClient()
    const storageBucket = process.env.STORAGE_BUCKET_NAME || 'documents'

    const { data, error } = await serviceSupabase.storage
      .from(storageBucket)
      .createSignedUploadUrl(fileKey)

    if (error) {
      console.error('Presigned URL error:', error)
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      fileKey,
      token: data.token
    })
  } catch (error) {
    console.error('Presigned upload error:', error)
    return NextResponse.json({ error: 'Unexpected error creating upload URL' }, { status: 500 })
  }
}

/**
 * PUT — Confirm that a presigned upload completed and create the DB record.
 * Called after the browser has directly uploaded the file to Supabase Storage.
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateStaff()
    if (auth.error) return auth.error
    const { user, profile } = auth

    const body = await request.json()
    const {
      fileKey,
      fileName,
      fileSize,
      mimeType,
      documentType,
      documentName,
      description,
      folderId,
      vehicleId,
      entityId,
      tags,
      confidential,
      // Entity references
      ownerInvestorId,
      arrangerEntityId,
      introducerId,
      lawyerId,
      partnerId,
      commercialPartnerId,
      // Member references
      investorMemberId,
      arrangerMemberId,
      partnerMemberId,
      introducerMemberId,
      lawyerMemberId,
      commercialPartnerMemberId,
      // Document validation
      documentDate,
      documentExpiryDate,
      documentIssueDate,
      staffOverride,
      overrideReason,
    } = body

    if (!fileKey || !fileName || !documentType) {
      return NextResponse.json(
        { error: 'fileKey, fileName, and documentType are required' },
        { status: 400 }
      )
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File size too large. Maximum size is 1GB'
      }, { status: 400 })
    }

    // Document validation
    const parsedDocDate = documentDate ? new Date(documentDate) : null
    const parsedExpiryDate = documentExpiryDate ? new Date(documentExpiryDate) : null
    const parsedIssueDate = documentIssueDate ? new Date(documentIssueDate) : null

    const validationResult = validateDocument({
      documentType,
      documentDate: parsedDocDate,
      expiryDate: parsedExpiryDate,
      issueDate: parsedIssueDate,
      isStaffOverride: staffOverride,
      overrideReason,
    })

    if (!validationResult.isValid) {
      if (validationResult.canOverride && staffOverride && overrideReason) {
        console.log(`[Document Upload] Staff override applied by ${user.id}: ${overrideReason}`)
      } else {
        return NextResponse.json({
          error: validationResult.errors[0] || 'Document validation failed',
          validation: {
            status: validationResult.status,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            canOverride: validationResult.canOverride,
            daysUntilExpiry: validationResult.daysUntilExpiry,
            documentAgeInDays: validationResult.documentAgeInDays,
          }
        }, { status: 422 })
      }
    }

    const tagArray = tags ? (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : tags) : []
    const isConfidential = confidential === true || confidential === 'true'

    const serviceSupabase = createServiceClient()
    const storageBucket = process.env.STORAGE_BUCKET_NAME || 'documents'

    // Create watermark metadata
    const watermarkData = {
      uploaded_by: profile.title || user.email,
      uploaded_at: new Date().toISOString(),
      document_classification: isConfidential ? 'CONFIDENTIAL' : 'INTERNAL',
      verso_holdings_notice: "Property of V E R S O - Authorized Use Only",
      compliance_notice: "Subject to BVI FSC regulation and GDPR data protection",
      original_filename: fileName,
    }

    // Create document record in database
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .insert({
        name: documentName || fileName.replace(/\.[^/.]+$/, ''),
        description: description || null,
        file_key: fileKey,
        type: documentType,
        folder_id: folderId || null,
        tags: tagArray.length > 0 ? tagArray : null,
        owner_investor_id: ownerInvestorId || null,
        vehicle_id: vehicleId || null,
        entity_id: entityId || null,
        arranger_entity_id: arrangerEntityId || null,
        introducer_id: introducerId || null,
        lawyer_id: lawyerId || null,
        partner_id: partnerId || null,
        commercial_partner_id: commercialPartnerId || null,
        investor_member_id: investorMemberId || null,
        arranger_member_id: arrangerMemberId || null,
        partner_member_id: partnerMemberId || null,
        introducer_member_id: introducerMemberId || null,
        lawyer_member_id: lawyerMemberId || null,
        commercial_partner_member_id: commercialPartnerMemberId || null,
        document_date: parsedDocDate || null,
        document_expiry_date: parsedExpiryDate || null,
        document_issue_date: parsedIssueDate || null,
        validation_status: validationResult.status,
        validation_notes: validationResult.warnings.length > 0 ? validationResult.warnings.join('; ') : null,
        validated_at: new Date().toISOString(),
        validated_by: user.id,
        file_size_bytes: fileSize || 0,
        mime_type: mimeType || 'application/octet-stream',
        current_version: 1,
        status: 'draft',
        is_published: false,
        created_by: user.id,
        watermark: watermarkData
      })
      .select(`
        *,
        investors:investors!documents_owner_investor_id_fkey(legal_name),
        vehicles:vehicles!documents_vehicle_id_fkey(name, type),
        folder:document_folders(id, name, path)
      `)
      .single()

    if (docError) {
      // Clean up uploaded file
      await serviceSupabase.storage.from(storageBucket).remove([fileKey])
      console.error('Document record creation error:', docError)
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    // Create initial version record
    await serviceSupabase
      .from('document_versions')
      .insert({
        document_id: document.id,
        version_number: 1,
        file_key: fileKey,
        file_size_bytes: fileSize || 0,
        mime_type: mimeType || 'application/octet-stream',
        created_by: user.id
      })

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DOCUMENT_UPLOAD,
      entity: AuditEntities.DOCUMENTS,
      entity_id: document.id,
      metadata: {
        file_key: fileKey,
        document_type: documentType,
        file_size: fileSize,
        file_type: mimeType,
        original_name: fileName,
        confidential: isConfidential,
        upload_method: 'presigned',
        owner_investor_id: ownerInvestorId,
        vehicle_id: vehicleId,
        validation_status: validationResult.status,
        staff_override: staffOverride,
      }
    })

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        file_key: document.file_key,
        type: document.type,
        created_at: document.created_at,
        watermark: watermarkData,
        investor: document.investors,
        vehicle: document.vehicles
      }
    })

  } catch (error) {
    console.error('Document confirm upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
