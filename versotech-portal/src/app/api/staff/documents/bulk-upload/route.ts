import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'
import crypto from 'crypto'

interface UploadResult {
  success: boolean
  file_name: string
  document_id?: string
  error?: string
}

// POST /api/staff/documents/bulk-upload - Upload multiple documents
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Parse multipart form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folderId = formData.get('folder_id') as string | null
    const vehicleId = formData.get('vehicle_id') as string | null
    const documentType = formData.get('type') as string || 'Other'
    const tags = formData.get('tags') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 files allowed per upload' },
        { status: 400 }
      )
    }

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png'
    ]

    const maxSize = 50 * 1024 * 1024 // 50MB per file
    const results: UploadResult[] = []
    const storageBucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents'

    // Parse tags
    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []

    // Validate userId is a UUID (for demo accounts compatibility)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const createdBy = uuidRegex.test(userId) ? userId : null

    // Process each file
    for (const file of files) {
      try {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          results.push({
            success: false,
            file_name: file.name,
            error: 'Invalid file type'
          })
          continue
        }

        // Validate file size
        if (file.size > maxSize) {
          results.push({
            success: false,
            file_name: file.name,
            error: 'File too large (max 50MB)'
          })
          continue
        }

        // Generate file key
        const timestamp = new Date().toISOString().split('T')[0]
        const randomString = crypto.randomBytes(8).toString('hex')
        const fileExtension = file.name.split('.').pop()
        const fileKey = `documents/${timestamp}/${randomString}.${fileExtension}`

        // Upload to storage
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        
        const { error: uploadError } = await serviceSupabase.storage
          .from(storageBucket)
          .upload(fileKey, fileBuffer, {
            contentType: file.type,
            cacheControl: '3600'
          })

        if (uploadError) {
          console.error('File upload error:', uploadError)
          results.push({
            success: false,
            file_name: file.name,
            error: 'Upload failed'
          })
          continue
        }

        // Create watermark data
        const watermarkData = {
          uploaded_by: 'Staff User',
          uploaded_at: new Date().toISOString(),
          document_classification: 'CONFIDENTIAL',
          verso_holdings_notice: 'Property of VERSO Holdings',
          original_filename: file.name,
          file_hash: crypto.createHash('sha256').update(fileBuffer).digest('hex')
        }

        // Create document record
        const { data: document, error: docError } = await serviceSupabase
          .from('documents')
          .insert({
            name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            file_key: fileKey,
            type: documentType,
            folder_id: folderId || null,
            vehicle_id: vehicleId || null,
            file_size_bytes: file.size,
            mime_type: file.type,
            tags: tagArray.length > 0 ? tagArray : null,
            created_by: createdBy,
            watermark: watermarkData,
            status: 'draft',
            is_published: false,
            current_version: 1
          })
          .select('id')
          .single()

        if (docError) {
          // Clean up uploaded file
          await serviceSupabase.storage.from(storageBucket).remove([fileKey])
          
          console.error('Document record creation error:', docError)
          results.push({
            success: false,
            file_name: file.name,
            error: 'Failed to create document record'
          })
          continue
        }

        // Create initial version record
        await serviceSupabase
          .from('document_versions')
          .insert({
            document_id: document.id,
            version_number: 1,
            file_key: fileKey,
            file_size_bytes: file.size,
            mime_type: file.type,
            created_by: createdBy
          })

        results.push({
          success: true,
          file_name: file.name,
          document_id: document.id
        })

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        results.push({
          success: false,
          file_name: file.name,
          error: 'Processing error'
        })
      }
    }

    // Count successes and failures
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    // Audit log
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.DOCUMENT_UPLOAD,
      entity: AuditEntities.DOCUMENTS,
      entity_id: userId,
      metadata: {
        action_type: 'bulk_upload',
        total_files: files.length,
        successful: successCount,
        failed: failureCount,
        folder_id: folderId,
        vehicle_id: vehicleId,
        document_type: documentType
      }
    })

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: files.length,
        successful: successCount,
        failed: failureCount
      }
    })

  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

