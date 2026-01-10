import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { validateDocument, isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, title')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)) {
      return NextResponse.json({ error: 'Staff access required for document upload' }, { status: 403 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('type') as string
    const documentName = formData.get('name') as string
    const description = formData.get('description') as string
    const ownerInvestorId = formData.get('owner_investor_id') as string
    const vehicleId = formData.get('vehicle_id') as string
    const entityId = formData.get('entity_id') as string
    const arrangerEntityId = formData.get('arranger_entity_id') as string
    const introducerId = formData.get('introducer_id') as string
    const lawyerId = formData.get('lawyer_id') as string
    const partnerId = formData.get('partner_id') as string
    const commercialPartnerId = formData.get('commercial_partner_id') as string
    const folderId = formData.get('folder_id') as string
    const tags = formData.get('tags') as string
    const isConfidential = formData.get('confidential') === 'true'

    // Member ID params (Phase 4: Member document support)
    const investorMemberId = formData.get('investor_member_id') as string
    const arrangerMemberId = formData.get('arranger_member_id') as string
    const partnerMemberId = formData.get('partner_member_id') as string
    const introducerMemberId = formData.get('introducer_member_id') as string
    const lawyerMemberId = formData.get('lawyer_member_id') as string
    const commercialPartnerMemberId = formData.get('commercial_partner_member_id') as string

    // Document validation params (Phase 5: Strict validation)
    const documentDateStr = formData.get('document_date') as string
    const documentExpiryDateStr = formData.get('document_expiry_date') as string
    const documentIssueDateStr = formData.get('document_issue_date') as string
    const staffOverride = formData.get('staff_override') === 'true'
    const overrideReason = formData.get('override_reason') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    // ============================================================
    // Phase 5: STRICT Document Validation
    // ============================================================
    const documentDate = documentDateStr ? new Date(documentDateStr) : null
    const documentExpiryDate = documentExpiryDateStr ? new Date(documentExpiryDateStr) : null
    const documentIssueDate = documentIssueDateStr ? new Date(documentIssueDateStr) : null

    // Validate document based on type
    const validationResult = validateDocument({
      documentType,
      documentDate,
      expiryDate: documentExpiryDate,
      issueDate: documentIssueDate,
      isStaffOverride: staffOverride,
      overrideReason,
    })

    // Block invalid documents based on validation result
    if (!validationResult.isValid) {
      // Check if override is allowed and provided
      if (validationResult.canOverride && staffOverride && overrideReason) {
        // Allow upload with override - log the override
        console.log(`[Document Upload] Staff override applied by ${user.id}: ${overrideReason}`)
      } else {
        // Block the upload
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
        }, { status: 422 }) // 422 Unprocessable Entity
      }
    }
    
    // Parse tags
    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []

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
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: PDF, DOCX, XLSX, TXT, JPG, PNG' 
      }, { status: 400 })
    }

    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 50MB' 
      }, { status: 400 })
    }

    // Generate secure file key
    const fileExtension = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = crypto.randomBytes(16).toString('hex')
    const fileKey = `${documentType}/${timestamp}-${randomId}.${fileExtension}`

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(process.env.STORAGE_BUCKET_NAME || 'documents')
      .upload(fileKey, fileBuffer, {
        contentType: file.type,
        metadata: {
          uploaded_by: user.id,
          uploaded_at: new Date().toISOString(),
          original_name: file.name,
          document_type: documentType,
          confidential: isConfidential.toString()
        }
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Create watermark metadata
    const watermarkData = {
      uploaded_by: profile.title || user.email,
      uploaded_at: new Date().toISOString(),
      document_classification: isConfidential ? 'CONFIDENTIAL' : 'INTERNAL',
      verso_holdings_notice: "Property of VERSO Holdings - Authorized Use Only",
      compliance_notice: "Subject to BVI FSC regulation and GDPR data protection",
      original_filename: file.name,
      file_hash: crypto.createHash('sha256').update(fileBuffer).digest('hex')
    }

    // Create document record in database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        name: documentName || file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: description || null,
        file_key: fileKey,
        type: documentType,
        folder_id: folderId || null,
        tags: tagArray.length > 0 ? tagArray : null,
        // Entity references
        owner_investor_id: ownerInvestorId || null,
        vehicle_id: vehicleId || null,
        entity_id: entityId || null,
        arranger_entity_id: arrangerEntityId || null,
        introducer_id: introducerId || null,
        lawyer_id: lawyerId || null,
        partner_id: partnerId || null,
        commercial_partner_id: commercialPartnerId || null,
        // Member references (Phase 4)
        investor_member_id: investorMemberId || null,
        arranger_member_id: arrangerMemberId || null,
        partner_member_id: partnerMemberId || null,
        introducer_member_id: introducerMemberId || null,
        lawyer_member_id: lawyerMemberId || null,
        commercial_partner_member_id: commercialPartnerMemberId || null,
        // Document validation fields (Phase 5)
        document_date: documentDate || null,
        document_expiry_date: documentExpiryDate || null,
        document_issue_date: documentIssueDate || null,
        validation_status: validationResult.status,
        validation_notes: validationResult.warnings.length > 0 ? validationResult.warnings.join('; ') : null,
        validated_at: new Date().toISOString(),
        validated_by: user.id,
        // File metadata
        file_size_bytes: file.size,
        mime_type: file.type,
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
      // If database insert fails, clean up uploaded file
      await supabase.storage
        .from(process.env.STORAGE_BUCKET_NAME || 'documents')
        .remove([fileKey])
        
      console.error('Document record creation error:', docError)
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    // Create initial version record
    await supabase
      .from('document_versions')
      .insert({
        document_id: document.id,
        version_number: 1,
        file_key: fileKey,
        file_size_bytes: file.size,
        mime_type: file.type,
        created_by: user.id
      })

    // Log document upload for audit trail
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DOCUMENT_UPLOAD,
      entity: AuditEntities.DOCUMENTS,
      entity_id: document.id,
      metadata: {
        file_key: fileKey,
        document_type: documentType,
        file_size: file.size,
        file_type: file.type,
        original_name: file.name,
        confidential: isConfidential,
        // Entity IDs
        owner_investor_id: ownerInvestorId,
        vehicle_id: vehicleId,
        arranger_entity_id: arrangerEntityId,
        introducer_id: introducerId,
        lawyer_id: lawyerId,
        partner_id: partnerId,
        commercial_partner_id: commercialPartnerId,
        // Member IDs (Phase 4)
        investor_member_id: investorMemberId,
        arranger_member_id: arrangerMemberId,
        partner_member_id: partnerMemberId,
        introducer_member_id: introducerMemberId,
        lawyer_member_id: lawyerMemberId,
        commercial_partner_member_id: commercialPartnerMemberId,
        // Validation info (Phase 5)
        validation_status: validationResult.status,
        validation_warnings: validationResult.warnings,
        staff_override: staffOverride,
        override_reason: overrideReason,
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
      },
      upload_info: {
        path: uploadData.path,
        size: file.size,
        content_type: file.type
      }
    })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

