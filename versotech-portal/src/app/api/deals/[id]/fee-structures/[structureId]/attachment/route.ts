import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * Check if user has access to view this term sheet based on their persona
 * Returns { allowed: boolean, reason?: string }
 */
async function checkTermsheetAccess(
  serviceSupabase: ReturnType<typeof createServiceClient>,
  userId: string,
  dealId: string,
  structureId: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Get user personas
  const { data: personas, error: personaError } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: userId,
  })

  console.log('🔍 [TERMSHEET ACCESS] userId:', userId)
  console.log('🔍 [TERMSHEET ACCESS] personas:', JSON.stringify(personas))
  console.log('🔍 [TERMSHEET ACCESS] personaError:', personaError)

  if (personaError || !personas || personas.length === 0) {
    console.log('🔍 [TERMSHEET ACCESS] No personas found, denying access')
    return { allowed: false, reason: 'No personas found' }
  }

  // Check persona types
  const isStaff = personas.some((p: any) => p.persona_type === 'staff')
  const isCeo = personas.some((p: any) => p.persona_type === 'ceo')
  const investorPersona = personas.find((p: any) => p.persona_type === 'investor')
  const partnerPersona = personas.find((p: any) => p.persona_type === 'partner')
  const commercialPartnerPersona = personas.find((p: any) => p.persona_type === 'commercial_partner')
  const arrangerPersona = personas.find((p: any) => p.persona_type === 'arranger')

  console.log('🔍 [TERMSHEET ACCESS] isStaff:', isStaff, 'isCeo:', isCeo)

  // Staff and CEO have full access
  if (isStaff || isCeo) {
    console.log('🔍 [TERMSHEET ACCESS] Granting access - staff/ceo')
    return { allowed: true }
  }

  // Verify the fee structure is published (non-staff can only view published termsheets)
  const { data: feeStructure } = await serviceSupabase
    .from('deal_fee_structures')
    .select('status')
    .eq('id', structureId)
    .eq('deal_id', dealId)
    .single()

  if (!feeStructure || feeStructure.status !== 'published') {
    return { allowed: false, reason: 'Term sheet not published' }
  }

  // Investor: Check deal membership
  if (investorPersona) {
    const { data: membership } = await serviceSupabase
      .from('deal_memberships')
      .select('deal_id')
      .eq('deal_id', dealId)
      .eq('investor_id', investorPersona.entity_id)
      .maybeSingle()

    if (membership) {
      return { allowed: true }
    }
  }

  // Partner: Check fee_plans or deal_memberships referrals
  if (partnerPersona) {
    // Check if partner has a fee plan for this term sheet
    const { data: feePlan } = await serviceSupabase
      .from('fee_plans')
      .select('id')
      .eq('deal_id', dealId)
      .eq('partner_id', partnerPersona.entity_id)
      .maybeSingle()

    if (feePlan) {
      return { allowed: true }
    }

    // Check if partner has referred investors to this deal
    const { data: referral } = await serviceSupabase
      .from('deal_memberships')
      .select('deal_id')
      .eq('deal_id', dealId)
      .eq('referred_by_entity_type', 'partner')
      .eq('referred_by_entity_id', partnerPersona.entity_id)
      .limit(1)
      .maybeSingle()

    if (referral) {
      return { allowed: true }
    }
  }

  // Commercial Partner: Same logic as partner
  if (commercialPartnerPersona) {
    const { data: feePlan } = await serviceSupabase
      .from('fee_plans')
      .select('id')
      .eq('deal_id', dealId)
      .eq('commercial_partner_id', commercialPartnerPersona.entity_id)
      .maybeSingle()

    if (feePlan) {
      return { allowed: true }
    }

    const { data: referral } = await serviceSupabase
      .from('deal_memberships')
      .select('deal_id')
      .eq('deal_id', dealId)
      .eq('referred_by_entity_type', 'commercial_partner')
      .eq('referred_by_entity_id', commercialPartnerPersona.entity_id)
      .limit(1)
      .maybeSingle()

    if (referral) {
      return { allowed: true }
    }
  }

  // Arranger: Check if deal belongs to their vehicle
  if (arrangerPersona) {
    const { data: deal } = await serviceSupabase
      .from('deals')
      .select('vehicle_id')
      .eq('id', dealId)
      .single()

    if (deal?.vehicle_id) {
      const { data: vehicle } = await serviceSupabase
        .from('vehicles')
        .select('arranger_entity_id')
        .eq('id', deal.vehicle_id)
        .single()

      if (vehicle?.arranger_entity_id === arrangerPersona.entity_id) {
        return { allowed: true }
      }
    }
  }

  return { allowed: false, reason: 'Access denied' }
}

/**
 * GET /api/deals/[id]/fee-structures/[structureId]/attachment
 * Get signed URL for term sheet attachment preview/download
 *
 * Access: Staff, Investors (with deal membership), Partners/Commercial Partners (with referrals or fee plans), Arrangers (for their vehicles)
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

  const serviceSupabase = createServiceClient()

  // Check persona-based access
  const accessCheck = await checkTermsheetAccess(serviceSupabase, user.id, dealId, structureId)
  if (!accessCheck.allowed) {
    return NextResponse.json({ error: accessCheck.reason || 'Access denied' }, { status: 403 })
  }

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

  // Term sheets are stored in 'deal-documents' bucket
  const bucket = 'deal-documents'

  // Create signed URL for preview (1 hour expiry)
  const { data: signedUrlData, error: signedUrlError } = await serviceSupabase.storage
    .from(bucket)
    .createSignedUrl(feeStructure.term_sheet_attachment_key, 3600)

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Failed to create signed URL:', signedUrlError)
    // Check if file doesn't exist in storage (data inconsistency)
    if (signedUrlError?.message?.includes('not found') || (signedUrlError as any)?.statusCode === '404') {
      // Clear the stale attachment key
      await serviceSupabase
        .from('deal_fee_structures')
        .update({ term_sheet_attachment_key: null, updated_at: new Date().toISOString() })
        .eq('id', structureId)
        .eq('deal_id', dealId)
      return NextResponse.json({ error: 'Term sheet document not found. Please upload a new one.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to generate preview URL' }, { status: 500 })
  }

  return NextResponse.json({
    url: signedUrlData.signedUrl,
    key: feeStructure.term_sheet_attachment_key
  })
}

const ATTACHMENT_BUCKET = 'deal-documents'
const MAX_ATTACHMENT_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
])
const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx'])

async function authenticateStaffUser() {
  const clientSupabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null
    } as const
  }

  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!(profile?.role?.startsWith('staff_') || profile?.role === 'ceo')) {
    return {
      error: NextResponse.json({ error: 'Staff access required' }, { status: 403 }),
      user: null
    } as const
  }

  return { error: null, user } as const
}

async function getFeeStructure(
  serviceSupabase: ReturnType<typeof createServiceClient>,
  dealId: string,
  structureId: string
) {
  const { data: feeStructure, error: fetchError } = await serviceSupabase
    .from('deal_fee_structures')
    .select('term_sheet_attachment_key')
    .eq('deal_id', dealId)
    .eq('id', structureId)
    .single()

  if (fetchError || !feeStructure) {
    return {
      error: NextResponse.json({ error: 'Term sheet not found' }, { status: 404 }),
      feeStructure: null
    } as const
  }

  return { error: null, feeStructure } as const
}

function isAllowedAttachment(fileName: string, mimeType?: string | null) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (ALLOWED_EXTENSIONS.has(extension)) return true
  if (mimeType && ALLOWED_MIME_TYPES.has(mimeType)) return true
  return false
}

function buildAttachmentFileKey(dealId: string, structureId: string, fileName: string) {
  const timestamp = Date.now()
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `term-sheets/${dealId}/${structureId}/${timestamp}-${sanitizedName}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; structureId: string }> }
) {
  const { id: dealId, structureId } = await params

  const auth = await authenticateStaffUser()
  if (auth.error) return auth.error
  const user = auth.user

  const serviceSupabase = createServiceClient()
  const feeStructureResult = await getFeeStructure(serviceSupabase, dealId, structureId)
  if (feeStructureResult.error) return feeStructureResult.error
  const feeStructure = feeStructureResult.feeStructure

  const contentType = request.headers.get('content-type') || ''

  // Presigned flow: JSON metadata only.
  if (contentType.includes('application/json')) {
    const body = await request.json()
    const { fileName, fileSize, contentType: fileContentType } = body as {
      fileName?: string
      fileSize?: number
      contentType?: string
    }

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 })
    }

    if (!isAllowedAttachment(fileName, fileContentType ?? null)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload a PDF, DOC, or DOCX term sheet.' },
        { status: 400 }
      )
    }

    if (fileSize && fileSize > MAX_ATTACHMENT_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 50MB' },
        { status: 400 }
      )
    }

    const fileKey = buildAttachmentFileKey(dealId, structureId, fileName)

    const { data, error } = await serviceSupabase.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUploadUrl(fileKey)

    if (error) {
      console.error('Failed to create term sheet attachment upload URL', error)
      return NextResponse.json(
        { error: 'Failed to create attachment upload URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      fileKey,
      token: data.token
    })
  }

  // Legacy fallback: direct multipart upload through API.
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  if (!isAllowedAttachment(file.name, file.type || null)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Upload a PDF, DOC, or DOCX term sheet.' },
      { status: 400 }
    )
  }

  if (file.size > MAX_ATTACHMENT_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File size too large. Maximum size is 50MB' },
      { status: 400 }
    )
  }

  const fileKey = buildAttachmentFileKey(dealId, structureId, file.name)

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await serviceSupabase.storage
      .from(ATTACHMENT_BUCKET)
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
      await serviceSupabase.storage.from(ATTACHMENT_BUCKET).remove([fileKey])
      return NextResponse.json(
        { error: 'Failed to update term sheet record' },
        { status: 500 }
      )
    }

    if (feeStructure.term_sheet_attachment_key && feeStructure.term_sheet_attachment_key !== fileKey) {
      await serviceSupabase.storage.from(ATTACHMENT_BUCKET).remove([feeStructure.term_sheet_attachment_key])
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; structureId: string }> }
) {
  const { id: dealId, structureId } = await params

  const auth = await authenticateStaffUser()
  if (auth.error) return auth.error
  const user = auth.user

  const serviceSupabase = createServiceClient()
  const feeStructureResult = await getFeeStructure(serviceSupabase, dealId, structureId)
  if (feeStructureResult.error) return feeStructureResult.error
  const feeStructure = feeStructureResult.feeStructure

  const body = await request.json()
  const { fileKey, fileName, fileSize, mimeType } = body as {
    fileKey?: string
    fileName?: string
    fileSize?: number
    mimeType?: string
  }

  if (!fileKey || !fileName) {
    return NextResponse.json({ error: 'fileKey and fileName are required' }, { status: 400 })
  }

  if (!fileKey.startsWith(`term-sheets/${dealId}/${structureId}/`)) {
    return NextResponse.json({ error: 'Invalid file key for term sheet' }, { status: 400 })
  }

  if (!isAllowedAttachment(fileName, mimeType ?? null)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Upload a PDF, DOC, or DOCX term sheet.' },
      { status: 400 }
    )
  }

  if (fileSize && fileSize > MAX_ATTACHMENT_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File size too large. Maximum size is 50MB' },
      { status: 400 }
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
    console.error('Failed to confirm term sheet attachment', updateError)
    await serviceSupabase.storage.from(ATTACHMENT_BUCKET).remove([fileKey])
    return NextResponse.json(
      { error: 'Failed to update term sheet record' },
      { status: 500 }
    )
  }

  if (feeStructure.term_sheet_attachment_key && feeStructure.term_sheet_attachment_key !== fileKey) {
    await serviceSupabase.storage.from(ATTACHMENT_BUCKET).remove([feeStructure.term_sheet_attachment_key])
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
      file_name: fileName,
      file_size: fileSize ?? 0,
      upload_method: 'presigned'
    }
  })

  return NextResponse.json({
    success: true,
    term_sheet_attachment_key: fileKey
  })
}
