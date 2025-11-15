import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/webp'
]

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'investor') {
      return NextResponse.json(
        { error: 'Investor access required' },
        { status: 403 }
      )
    }

    // Get investor ID for this user
    const { data: investorUser } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .single()

    if (!investorUser) {
      return NextResponse.json(
        { error: 'No investor profile found' },
        { status: 404 }
      )
    }

    const investorId = investorUser.investor_id

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const customLabel = formData.get('customLabel') as string | null // User-defined label for custom document types
    const expiryDate = formData.get('expiryDate') as string | null
    const notes = formData.get('notes') as string | null
    const taskId = formData.get('taskId') as string | null
    const entityId = formData.get('entityId') as string | null // For counterparty entity KYC

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      )
    }

    // No validation on document type - users can specify any type
    // customLabel provides user-friendly display name for custom types

    // Validate entity belongs to investor if provided
    if (entityId) {
      const { data: entity, error: entityError } = await serviceSupabase
        .from('investor_counterparty')
        .select('id')
        .eq('id', entityId)
        .eq('investor_id', investorId)
        .eq('is_active', true)
        .single()

      if (entityError || !entity) {
        return NextResponse.json(
          { error: 'Invalid entity ID or entity does not belong to this investor' },
          { status: 400 }
        )
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and image files are allowed.' },
        { status: 400 }
      )
    }

    // Generate unique file path (serviceSupabase already declared at function start)
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomId}.${fileExt}`
    const filePath = entityId
      ? `kyc/${investorId}/entities/${entityId}/${fileName}`
      : `kyc/${investorId}/${fileName}`

    // Upload file to storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from(process.env.STORAGE_BUCKET_NAME || 'documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create document record
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .insert({
        owner_investor_id: investorId,
        type: 'KYC',
        file_key: uploadData.path,
        name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type,
        is_published: true,
        created_by: user.id,
        watermark: {
          uploaded_by: profile.display_name || profile.email,
          uploaded_at: new Date().toISOString(),
          document_classification: 'CONFIDENTIAL',
          file_hash: randomId // Simplified - in production use actual hash
        }
      })
      .select()
      .single()

    if (docError) {
      console.error('Document creation error:', docError)
      // Clean up uploaded file
      await serviceSupabase.storage
        .from(process.env.STORAGE_BUCKET_NAME || 'documents')
        .remove([filePath])

      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      )
    }

    // Check for existing submissions to handle versioning
    let versionQuery = serviceSupabase
      .from('kyc_submissions')
      .select('id, version')
      .eq('document_type', documentType)
      .order('version', { ascending: false })
      .limit(1)

    // Filter by either investor_id or counterparty_entity_id
    if (entityId) {
      versionQuery = versionQuery.eq('counterparty_entity_id', entityId)
    } else {
      versionQuery = versionQuery.eq('investor_id', investorId).is('counterparty_entity_id', null)
    }

    const { data: latestSubmission } = await versionQuery.single()

    const newVersion = latestSubmission ? latestSubmission.version + 1 : 1
    const previousSubmissionId = latestSubmission?.id || null

    // Create KYC submission record
    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .insert({
        investor_id: entityId ? null : investorId,
        counterparty_entity_id: entityId || null,
        document_type: documentType,
        custom_label: customLabel || null, // Store user-defined label
        document_id: document.id,
        status: 'pending',
        version: newVersion,
        previous_submission_id: previousSubmissionId,
        expiry_date: expiryDate || null,
        metadata: {
          file_size: file.size,
          mime_type: file.type,
          original_filename: file.name,
          notes: notes || null,
          is_reupload: !!latestSubmission,
          entity_id: entityId || null
        }
      })
      .select()
      .single()

    if (submissionError) {
      console.error('KYC submission creation error:', submissionError)

      // Clean up orphaned document record
      await serviceSupabase
        .from('documents')
        .delete()
        .eq('id', document.id)

      // Clean up uploaded file from storage
      await serviceSupabase.storage
        .from(process.env.STORAGE_BUCKET_NAME || 'documents')
        .remove([filePath])

      console.log('Cleaned up orphaned document and storage file after submission creation failure')

      return NextResponse.json(
        { error: 'Failed to create KYC submission' },
        { status: 500 }
      )
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'kyc_document_uploaded',
      entity_type: 'kyc_submission',
      entity_id: submission.id,
      details: {
        document_type: documentType,
        file_name: file.name,
        file_size: file.size
      }
    })

    // Auto-complete related task if taskId provided
    let taskCompleted = false
    if (taskId) {
      // First check if task exists and belongs to user
      const { data: existingTask, error: taskCheckError } = await serviceSupabase
        .from('tasks')
        .select('id, status, owner_user_id')
        .eq('id', taskId)
        .single()

      if (taskCheckError || !existingTask) {
        console.warn(`Task ${taskId} not found or error:`, taskCheckError)
      } else if (existingTask.owner_user_id !== user.id) {
        console.warn(`Task ${taskId} does not belong to user ${user.id}`)
      } else if (existingTask.status === 'completed') {
        console.warn(`Task ${taskId} is already completed`)
        taskCompleted = true // Still count as completed for response
      } else {
        // Task exists, belongs to user, and is not completed - complete it
        const { error: updateError } = await serviceSupabase
          .from('tasks')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            completed_by: user.id,
            metadata: {
              completed_via: 'document_upload',
              document_id: document.id,
              submission_id: submission.id
            }
          })
          .eq('id', taskId)

        if (updateError) {
          console.error(`Failed to complete task ${taskId}:`, updateError)
        } else {
          taskCompleted = true
        }
      }
    }

    return NextResponse.json({
      success: true,
      document_id: document.id,
      submission_id: submission.id,
      status: submission.status,
      task_completed: taskCompleted
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
