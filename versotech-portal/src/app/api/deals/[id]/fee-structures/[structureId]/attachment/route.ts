import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/deals/[id]/fee-structures/[structureId]/attachment
 * Get signed URL for term sheet attachment preview/download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; structureId: string }> }
) {
  const { id: dealId, structureId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!(profile?.role?.startsWith('staff_') || profile?.role === 'ceo')) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const serviceSupabase = createServiceClient()

  // Fetch the term sheet to get attachment key
  const { data: feeStructure, error: fetchError } = await serviceSupabase
    .from('deal_fee_structures')
    .select('term_sheet_attachment_key')
    .eq('deal_id', dealId)
    .eq('id', structureId)
    .single()

  if (fetchError || !feeStructure) {
    return NextResponse.json({ error: 'Term sheet not found' }, { status: 404 })
  }

  if (!feeStructure.term_sheet_attachment_key) {
    return NextResponse.json({ error: 'No attachment uploaded' }, { status: 404 })
  }

  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents'

  // Create signed URL for preview (1 hour expiry)
  const { data: signedUrlData, error: signedUrlError } = await serviceSupabase.storage
    .from(bucket)
    .createSignedUrl(feeStructure.term_sheet_attachment_key, 3600)

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Failed to create signed URL:', signedUrlError)
    return NextResponse.json({ error: 'Failed to generate preview URL' }, { status: 500 })
  }

  return NextResponse.json({
    url: signedUrlData.signedUrl,
    key: feeStructure.term_sheet_attachment_key
  })
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; structureId: string }> }
) {
  const { id: dealId, structureId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!(profile?.role?.startsWith('staff_') || profile?.role === 'ceo')) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Upload a PDF or DOCX term sheet.' },
      { status: 400 }
    )
  }

  const serviceSupabase = createServiceClient()

  // Fetch existing record to remove previous attachment if necessary
  const { data: feeStructure, error: fetchError } = await serviceSupabase
    .from('deal_fee_structures')
    .select('term_sheet_attachment_key')
    .eq('deal_id', dealId)
    .eq('id', structureId)
    .single()

  if (fetchError || !feeStructure) {
    return NextResponse.json({ error: 'Term sheet not found' }, { status: 404 })
  }

  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents'
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileKey = `term-sheets/${dealId}/${structureId}/${timestamp}-${sanitizedName}`

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await serviceSupabase.storage
      .from(bucket)
      .upload(fileKey, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Failed to upload term sheet attachment', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload term sheet attachment' },
        { status: 500 }
      )
    }

    const { error: updateError } = await serviceSupabase
      .from('deal_fee_structures')
      .update({
        term_sheet_attachment_key: fileKey,
        updated_at: new Date().toISOString()
      })
      .eq('id', structureId)
      .eq('deal_id', dealId)

    if (updateError) {
      console.error('Failed to update deal_fee_structures with attachment', updateError)
      // Clean up uploaded file
      await serviceSupabase.storage.from(bucket).remove([fileKey])
      return NextResponse.json(
        { error: 'Failed to update term sheet record' },
        { status: 500 }
      )
    }

    if (feeStructure.term_sheet_attachment_key && feeStructure.term_sheet_attachment_key !== fileKey) {
      await serviceSupabase.storage.from(bucket).remove([feeStructure.term_sheet_attachment_key])
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.DEALS,
      entity_id: structureId,
      metadata: {
        type: 'term_sheet_attachment_uploaded',
        deal_id: dealId,
        storage_key: fileKey,
        file_name: file.name,
        file_size: file.size
      }
    })

    return NextResponse.json({
      success: true,
      term_sheet_attachment_key: fileKey
    })
  } catch (error) {
    console.error('Unexpected error uploading term sheet attachment', error)
    return NextResponse.json(
      { error: 'Unexpected error uploading term sheet attachment' },
      { status: 500 }
    )
  }
}
