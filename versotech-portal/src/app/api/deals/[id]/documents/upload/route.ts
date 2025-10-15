import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export const dynamic = 'force-dynamic'

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

    const isStaff = profile?.role?.startsWith('staff_')
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'Misc'
    const visibleToInvestors = formData.get('visible_to_investors') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate unique file key
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileKey = `deals/${dealId}/${folder}/${timestamp}-${sanitizedFileName}`

    // Upload to Supabase Storage
    const serviceSupabase = createServiceClient()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await serviceSupabase.storage
      .from('deal-documents')
      .upload(fileKey, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage', details: uploadError },
        { status: 500 }
      )
    }

    // Create database record
    const { data: document, error: dbError } = await serviceSupabase
      .from('deal_data_room_documents')
      .insert({
        deal_id: dealId,
        folder,
        file_key: fileKey,
        file_name: file.name,
        visible_to_investors: visibleToInvestors,
        file_size_bytes: file.size,
        mime_type: file.type,
        version: 1,
        created_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Clean up uploaded file
      await serviceSupabase.storage.from('deal-documents').remove([fileKey])
      return NextResponse.json(
        { error: 'Failed to create document record', details: dbError },
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
        file_name: file.name,
        folder,
        visible_to_investors: visibleToInvestors,
        file_size: file.size
      }
    })

    return NextResponse.json({
      success: true,
      document
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

