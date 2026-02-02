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

  // Term sheets are stored in 'deal-documents' bucket
  const bucket = 'deal-documents'
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
