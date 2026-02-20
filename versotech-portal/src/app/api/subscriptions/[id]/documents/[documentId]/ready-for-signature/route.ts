import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getCeoSigner } from '@/lib/staff/ceo-signer'
import { convertDocxToPdf } from '@/lib/gotenberg/convert'

// Schema for multi-signatory support with optional arranger countersigning
const requestSchema = z.object({
  signatory_member_ids: z.array(z.string().uuid()).optional(),
  // If no signatory_member_ids provided, falls back to investor email (backwards compatible)
  countersigner_type: z.enum(['ceo', 'arranger']).optional().default('ceo'),
  arranger_id: z.string().uuid().optional(),
  // arranger_id is required when countersigner_type is 'arranger'
}).optional()

type SignatureFailureReason = 'anchor_missing' | 'pdf_parse' | 'signer_config' | 'unknown'
type SignatureFailurePhase = 'issuer' | 'arranger' | 'investor' | 'regeneration' | 'unknown'

class SignatureWorkflowStepError extends Error {
  readonly phase: SignatureFailurePhase
  readonly reason: SignatureFailureReason

  constructor(phase: SignatureFailurePhase, reason: SignatureFailureReason, message: string) {
    super(message)
    this.name = 'SignatureWorkflowStepError'
    this.phase = phase
    this.reason = reason
  }
}

function classifySignatureFailureReason(message: string): SignatureFailureReason {
  const lower = message.toLowerCase()

  if (
    lower.includes('sig_anchor') ||
    lower.includes('signature anchor') ||
    lower.includes('anchor_not_found') ||
    lower.includes('missing_anchors') ||
    lower.includes('no signature anchors found') ||
    lower.includes('pdf has no signature anchor markers')
  ) {
    return 'anchor_missing'
  }

  if (
    lower.includes('dommatrix') ||
    lower.includes('cannot polyfill') ||
    lower.includes('@napi-rs/canvas') ||
    lower.includes('pdf parsing error') ||
    lower.includes('failed to fetch pdf for signature anchor detection')
  ) {
    return 'pdf_parse'
  }

  if (
    lower.includes('no ceo') ||
    lower.includes('no arranger signer') ||
    lower.includes('no email configured')
  ) {
    return 'signer_config'
  }

  return 'unknown'
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

async function readErrorMessageFromResponse(response: Response): Promise<string> {
  const raw = await response.text()
  if (!raw) return `${response.status} ${response.statusText}`

  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed?.details === 'string' && parsed.details.length > 0) {
      if (typeof parsed?.error === 'string' && parsed.error.length > 0) {
        return `${parsed.error}: ${parsed.details}`
      }
      return parsed.details
    }
    if (typeof parsed?.error === 'string' && parsed.error.length > 0) {
      return parsed.error
    }
  } catch {
    // raw text fallback below
  }

  return raw
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: subscriptionId, documentId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify staff access
  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role, display_name, email')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'
  if (!isStaff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  // Parse request body for signatory selection
  let body: { signatory_member_ids?: string[]; countersigner_type?: 'ceo' | 'arranger'; arranger_id?: string } = {}
  try {
    const rawBody = await request.text()
    if (rawBody) {
      body = JSON.parse(rawBody)
      const validation = requestSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      }
    }
  } catch {
    // Empty body is OK - use default behavior
  }

  // Note: arranger_id validation is only needed for legacy documents without stored countersigner
  // New documents have countersigner info stored at generation time

  const serviceSupabase = createServiceClient()

  // Get document and subscription details
  const { data: document } = await serviceSupabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('subscription_id', subscriptionId)
    .single()

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Check if document is DOCX - if so, convert to PDF first
  // If already PDF, use directly (no conversion needed!)
  const isDocx = document.mime_type?.includes('wordprocessingml') ||
                 document.mime_type?.includes('msword') ||
                 document.file_key?.toLowerCase().endsWith('.docx') ||
                 document.file_key?.toLowerCase().endsWith('.doc')

  const isPdf = document.mime_type === 'application/pdf' ||
                document.file_key?.toLowerCase().endsWith('.pdf')

  let signableDocument = document

  if (isPdf) {
    console.log('✅ [READY-FOR-SIGNATURE] Document is already PDF, skipping conversion')
  } else if (isDocx) {
    console.log('📄 [READY-FOR-SIGNATURE] DOCX detected, converting to PDF via Gotenberg')

    // Download the DOCX from storage
    const { data: docxData, error: downloadError } = await serviceSupabase.storage
      .from('deal-documents')
      .download(document.file_key)

    if (downloadError || !docxData) {
      console.error('❌ Failed to download DOCX for conversion:', downloadError)
      return NextResponse.json({
        error: 'Failed to download document for conversion',
        details: downloadError?.message
      }, { status: 500 })
    }

    // Convert to Buffer
    const docxBuffer = Buffer.from(await docxData.arrayBuffer())
    console.log('📥 Downloaded DOCX:', { size: docxBuffer.length })

    // Convert to PDF via Gotenberg
    // Ensure filename has .docx extension (Gotenberg requires it)
    let docxFilename = document.name || 'document.docx'
    if (!docxFilename.toLowerCase().endsWith('.docx') && !docxFilename.toLowerCase().endsWith('.doc')) {
      docxFilename = `${docxFilename}.docx`
    }
    const conversionResult = await convertDocxToPdf(docxBuffer, docxFilename)

    if (!conversionResult.success || !conversionResult.pdfBuffer) {
      console.error('❌ Gotenberg conversion failed:', conversionResult.error)
      return NextResponse.json({
        error: 'Failed to convert DOCX to PDF',
        details: conversionResult.error || 'Conversion service unavailable'
      }, { status: 500 })
    }

    console.log('✅ DOCX converted to PDF:', {
      input_size: docxBuffer.length,
      output_size: conversionResult.pdfBuffer.length
    })

    // Upload the PDF to storage
    const pdfFileName = document.file_key.replace(/\.(docx?|DOCX?)$/, '.pdf')
    const pdfFileKey = pdfFileName.includes('/converted/')
      ? pdfFileName
      : pdfFileName.replace(/\/([^/]+)$/, '/converted/$1')

    const { error: uploadError } = await serviceSupabase.storage
      .from('deal-documents')
      .upload(pdfFileKey, conversionResult.pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Failed to upload converted PDF:', uploadError)
      return NextResponse.json({
        error: 'Failed to save converted PDF',
        details: uploadError.message
      }, { status: 500 })
    }

    console.log('📤 Uploaded converted PDF:', pdfFileKey)

    // Create a new document record for the PDF
    const pdfDocName = (document.name || 'Document').replace(/\.(docx?|DOCX?)$/i, '.pdf')
    const { data: pdfDocument, error: pdfDocError } = await serviceSupabase
      .from('documents')
      .insert({
        subscription_id: subscriptionId,
        deal_id: document.deal_id,
        vehicle_id: document.vehicle_id,
        folder_id: document.folder_id,
        type: 'subscription_pack',
        name: pdfDocName,
        file_key: pdfFileKey,
        mime_type: 'application/pdf',
        file_size_bytes: conversionResult.pdfBuffer.length,
        status: 'final',
        ready_for_signature: false,
        current_version: 1,
        created_by: user.id
      })
      .select()
      .single()

    if (pdfDocError || !pdfDocument) {
      console.error('❌ Failed to create PDF document record:', pdfDocError)
      return NextResponse.json({
        error: 'Failed to create document record for converted PDF',
        details: pdfDocError?.message
      }, { status: 500 })
    }

    console.log('✅ Created PDF document record:', pdfDocument.id)

    // Update the original DOCX document status to indicate it has been converted
    await serviceSupabase
      .from('documents')
      .update({
        status: 'draft',
        metadata: { converted_to_pdf: pdfDocument.id, converted_at: new Date().toISOString() }
      })
      .eq('id', document.id)

    // Use the new PDF document for signature
    signableDocument = pdfDocument

    console.log('🔄 Proceeding with converted PDF for signature:', {
      original_docx_id: document.id,
      new_pdf_id: pdfDocument.id
    })
  } else if (document.mime_type && !document.mime_type.includes('pdf')) {
    // Not DOCX and not PDF - unsupported format
    return NextResponse.json({
      error: 'Unsupported file format. Only PDF and DOCX files can be sent for signature.',
      details: `Current file type: ${document.mime_type}`
    }, { status: 400 })
  }

  // Get subscription with investor details
  // NOTE: do not require investor_users join here; signature workflow must still run
  // for investors that have not been linked to user accounts yet.
  console.log('🔍 [READY-FOR-SIGNATURE] Fetching subscription...')
  const { data: subscription } = await serviceSupabase
    .from('subscriptions')
    .select(`
      *,
      investor:investors(
        id,
        type,
        legal_name,
        display_name,
        email
      ),
      vehicle:vehicles(id, name)
    `)
    .eq('id', subscriptionId)
    .single()

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }
  console.log('✅ [READY-FOR-SIGNATURE] Subscription fetched:', { investor_type: subscription.investor?.type })

  // Determine signatories
  console.log('🔍 [READY-FOR-SIGNATURE] Determining signatories...')
  type Signatory = { id: string; full_name: string; email: string }
  let signatories: Signatory[] = []

  if (body.signatory_member_ids && body.signatory_member_ids.length > 0) {
    // Multi-signatory mode: fetch selected members
    const { data: members, error: membersError } = await serviceSupabase
      .from('investor_members')
      .select('id, full_name, email')
      .in('id', body.signatory_member_ids)
      .eq('investor_id', subscription.investor_id)
      .eq('is_active', true)

    if (membersError || !members || members.length === 0) {
      return NextResponse.json({
        error: 'Selected signatories not found',
        details: 'Could not find the specified signatory members'
      }, { status: 400 })
    }

    signatories = members.map(m => ({
      id: m.id,
      full_name: m.full_name,
      email: m.email
    }))
  } else {
    // Check if investor is entity type - auto-fetch signatories from investor_members
    const isEntityInvestor = subscription.investor.type === 'entity' ||
                             subscription.investor.type === 'institutional'

    if (isEntityInvestor) {
      // Fetch authorized signatories for entity investor
      const { data: entityMembers } = await serviceSupabase
        .from('investor_members')
        .select('id, full_name, email')
        .eq('investor_id', subscription.investor_id)
        .eq('is_signatory', true)
        .eq('is_active', true)

      if (entityMembers && entityMembers.length > 0) {
        signatories = entityMembers.map(m => ({
          id: m.id,
          full_name: m.full_name,
          email: m.email
        }))
        console.log(`👥 [READY-FOR-SIGNATURE] Auto-fetched ${signatories.length} signatories for entity investor`)
      } else {
        // Entity but no signatories marked - fall back to investor name
        console.warn('[READY-FOR-SIGNATURE] Entity investor has no signatories marked, using investor name')
        signatories = [{
          id: 'investor_primary',
          full_name: subscription.investor.legal_name || subscription.investor.display_name,
          email: subscription.investor.email
        }]
      }
    } else {
      // Individual investor: use investor's primary email
      signatories = [{
        id: 'investor_primary',
        full_name: subscription.investor.legal_name || subscription.investor.display_name,
        email: subscription.investor.email
      }]
    }
  }

  // Create signature requests - COMPANY SIGNS FIRST, then investors.
  // This ensures the company (arranger/CEO) approves the document before investors sign.
  console.log('✅ [READY-FOR-SIGNATURE] Signatories determined:', signatories.length)

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const requestCookie = request.headers.get('cookie') || ''

  const createSignatureRequestViaApi = async (
    phase: SignatureFailurePhase,
    payload: Record<string, unknown>
  ): Promise<any> => {
    const response = await fetch(`${appBaseUrl}/api/signature/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const apiMessage = await readErrorMessageFromResponse(response)
      const reason = classifySignatureFailureReason(apiMessage)
      throw new SignatureWorkflowStepError(
        phase,
        reason,
        `Failed to create ${phase} signature request: ${apiMessage}`
      )
    }

    return response.json()
  }

  const getSignedUrlForDocument = async (fileKey: string): Promise<string> => {
    const { data } = await serviceSupabase.storage
      .from('deal-documents')
      .createSignedUrl(fileKey, 7 * 24 * 60 * 60) // 7 days

    if (!data?.signedUrl) {
      throw new SignatureWorkflowStepError(
        'unknown',
        'unknown',
        'Failed to generate document URL'
      )
    }

    return data.signedUrl
  }

  const clearPendingSignatureRequests = async (targetDocumentId: string): Promise<void> => {
    const { error } = await serviceSupabase
      .from('signature_requests')
      .delete()
      .eq('document_id', targetDocumentId)
      .eq('status', 'pending')

    if (error) {
      console.warn('⚠️ [READY-FOR-SIGNATURE] Failed to clear partial signature requests:', error.message)
    }
  }

  const regenerateAndLoadReplacementDocument = async (
    previousDocumentId: string
  ): Promise<any> => {
    console.warn('♻️ [READY-FOR-SIGNATURE] Anchor/PDF failure detected, attempting one auto-regeneration before retry')

    const regenResponse = await fetch(`${appBaseUrl}/api/subscriptions/${subscriptionId}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(requestCookie ? { cookie: requestCookie } : {}),
      },
      body: JSON.stringify({ format: 'pdf' }),
    })

    if (!regenResponse.ok) {
      const regenError = await readErrorMessageFromResponse(regenResponse)
      const regenReason = classifySignatureFailureReason(regenError)
      throw new SignatureWorkflowStepError(
        'regeneration',
        regenReason,
        `Auto-regeneration failed: ${regenError}`
      )
    }

    const regenData = await regenResponse.json().catch(() => ({}))
    const regeneratedDocumentId = typeof regenData?.document_id === 'string' && regenData.document_id.length > 0
      ? regenData.document_id
      : null

    let replacementDocument: any = null
    if (regeneratedDocumentId) {
      const { data } = await serviceSupabase
        .from('documents')
        .select('*')
        .eq('id', regeneratedDocumentId)
        .eq('subscription_id', subscriptionId)
        .single()
      replacementDocument = data
    } else {
      const { data } = await serviceSupabase
        .from('documents')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .eq('mime_type', 'application/pdf')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      replacementDocument = data
    }

    if (!replacementDocument) {
      throw new SignatureWorkflowStepError(
        'regeneration',
        'unknown',
        'Auto-regeneration completed but no replacement PDF document was found'
      )
    }

    if (replacementDocument.id === previousDocumentId) {
      throw new SignatureWorkflowStepError(
        'regeneration',
        'unknown',
        'Auto-regeneration did not produce a new document to retry'
      )
    }

    await clearPendingSignatureRequests(previousDocumentId)

    console.log('✅ [READY-FOR-SIGNATURE] Auto-regeneration produced replacement PDF:', {
      old_document_id: previousDocumentId,
      new_document_id: replacementDocument.id,
      file_key: replacementDocument.file_key,
    })

    return replacementDocument
  }

  const runSignatureWorkflowForDocument = async (targetDocument: any): Promise<NextResponse> => {
    const targetDocumentId = targetDocument.id as string

    // Check for existing signature requests to prevent duplicates
    console.log('🔍 [READY-FOR-SIGNATURE] Checking existing requests for document:', targetDocumentId)
    const { data: existingRequests } = await serviceSupabase
      .from('signature_requests')
      .select('id, signer_role, status')
      .eq('document_id', targetDocumentId)
      .in('status', ['pending', 'signed'])

    if (existingRequests && existingRequests.length > 0) {
      const pendingCount = existingRequests.filter(r => r.status === 'pending').length
      const signedCount = existingRequests.filter(r => r.status === 'signed').length

      return NextResponse.json({
        error: 'Signature requests already exist for this document',
        details: `Found ${pendingCount} pending and ${signedCount} signed signature request(s). Cannot create duplicates.`,
        existing_requests: existingRequests.map(r => ({ id: r.id, role: r.signer_role, status: r.status }))
      }, { status: 409 }) // 409 Conflict
    }

    console.log('✅ [READY-FOR-SIGNATURE] No existing requests, proceeding...')
    const signedUrl = await getSignedUrlForDocument(targetDocument.file_key)
    console.log('✅ [READY-FOR-SIGNATURE] Got signed URL')

    // ============================================================
    // STEP 1: CREATE ISSUER (party_b) SIGNATURE REQUEST
    // ============================================================
    console.log('🔍 [READY-FOR-SIGNATURE] Creating ISSUER (party_b) signature request...')

    const ceoSigner = await getCeoSigner(serviceSupabase)
    if (!ceoSigner || !ceoSigner.email) {
      console.error('[ready-for-signature] CRITICAL: No CEO signer configured in ceo_users table')
      return NextResponse.json({
        error: 'No CEO/Issuer signer configured. Please add a CEO user with can_sign=true in the CEO settings.'
      }, { status: 400 })
    }

    const issuerEmail = ceoSigner.email
    const issuerName = ceoSigner.displayName

    const issuerSigPayload = {
      investor_id: subscription.investor_id,
      signer_email: issuerEmail,
      signer_name: issuerName,
      document_type: 'subscription',
      google_drive_url: signedUrl,
      signer_role: 'admin',
      signature_position: 'party_b',
      subscription_id: subscriptionId,
      document_id: targetDocumentId,
      deal_id: subscription.deal_id
    }

    const issuerSigData = await createSignatureRequestViaApi('issuer', issuerSigPayload)
    console.log('✅ [READY-FOR-SIGNATURE] Issuer (party_b) signature request created')

    // ============================================================
    // STEP 1.5: CREATE ARRANGER (party_c) SIGNATURE REQUEST
    // ============================================================
    console.log('🔍 [READY-FOR-SIGNATURE] Creating arranger (party_c) signature request...')

    let arrangerSigData = null
    const { data: dealForArranger, error: dealError } = await serviceSupabase
      .from('deals')
      .select('arranger_entity_id')
      .eq('id', subscription.deal_id)
      .single()

    if (dealError) {
      console.error('❌ [READY-FOR-SIGNATURE] Failed to fetch deal for arranger:', dealError.message)
    }

    if (dealForArranger?.arranger_entity_id) {
      const { data: arrangerEntity, error: entityError } = await serviceSupabase
        .from('arranger_entities')
        .select('legal_name')
        .eq('id', dealForArranger.arranger_entity_id)
        .single()

      if (entityError) {
        console.error('❌ [READY-FOR-SIGNATURE] Failed to fetch arranger entity:', entityError.message)
      }

      const { data: arrangerUser, error: userError } = await serviceSupabase
        .from('arranger_users')
        .select('user_id')
        .eq('arranger_id', dealForArranger.arranger_entity_id)
        .eq('can_sign', true)
        .eq('is_primary', true)
        .maybeSingle()

      if (userError) {
        console.error('❌ [READY-FOR-SIGNATURE] Failed to fetch primary arranger user:', userError.message)
      }

      let arrangerUserId = arrangerUser?.user_id
      if (!arrangerUserId) {
        const { data: anySigningUser, error: fallbackError } = await serviceSupabase
          .from('arranger_users')
          .select('user_id')
          .eq('arranger_id', dealForArranger.arranger_entity_id)
          .eq('can_sign', true)
          .limit(1)
          .maybeSingle()

        if (fallbackError) {
          console.error('❌ [READY-FOR-SIGNATURE] Failed to fetch fallback arranger user:', fallbackError.message)
        }
        arrangerUserId = anySigningUser?.user_id
      }

      if (arrangerUserId) {
        const { data: arrangerProfile, error: profileError } = await serviceSupabase
          .from('profiles')
          .select('email, display_name')
          .eq('id', arrangerUserId)
          .single()

        if (profileError) {
          console.error('❌ [READY-FOR-SIGNATURE] Failed to fetch arranger profile:', profileError.message)
        }

        if (arrangerProfile?.email) {
          const arrangerSigPayload = {
            investor_id: subscription.investor_id,
            signer_email: arrangerProfile.email,
            signer_name: arrangerProfile.display_name || arrangerEntity?.legal_name || 'Arranger',
            document_type: 'subscription',
            google_drive_url: signedUrl,
            signer_role: 'arranger',
            signature_position: 'party_c',
            subscription_id: subscriptionId,
            document_id: targetDocumentId,
            deal_id: subscription.deal_id
          }

          arrangerSigData = await createSignatureRequestViaApi('arranger', arrangerSigPayload)
          console.log('✅ [READY-FOR-SIGNATURE] Arranger (party_c) signature request created:', arrangerSigData.signature_request_id)
        } else {
          console.error('❌ [READY-FOR-SIGNATURE] FATAL: Arranger user has no email configured')
          return NextResponse.json({
            error: `Arranger user for ${arrangerEntity?.legal_name || 'arranger entity'} has no email configured. Please update the arranger user's profile.`
          }, { status: 400 })
        }
      } else {
        console.error('❌ [READY-FOR-SIGNATURE] FATAL: No arranger user with can_sign=true found for arranger_id:', dealForArranger.arranger_entity_id)
        return NextResponse.json({
          error: `No arranger signer configured for ${arrangerEntity?.legal_name || 'arranger entity'}. Please configure an arranger user with can_sign=true.`
        }, { status: 400 })
      }
    } else {
      console.error('❌ [READY-FOR-SIGNATURE] FATAL: No arranger entity linked to deal:', subscription.deal_id)
      return NextResponse.json({
        error: 'No arranger entity linked to this deal. Subscription packs require an arranger to sign as party_c. Please link an arranger entity to the deal.'
      }, { status: 400 })
    }

    // ============================================================
    // STEP 2: CREATE INVESTOR SIGNATURE REQUESTS (AFTER COMPANY)
    // ============================================================
    console.log('🔍 [READY-FOR-SIGNATURE] Creating investor signature requests (they sign AFTER company)...')
    const signerPositions = ['party_a', 'party_a_2', 'party_a_3', 'party_a_4', 'party_a_5']
    const investorSignatureRequests = []

    for (let i = 0; i < signatories.length; i++) {
      const signatory = signatories[i]
      const position = signerPositions[i] || `party_a_${i + 1}`

      const investorSigPayload = {
        investor_id: subscription.investor_id,
        signer_email: signatory.email,
        signer_name: signatory.full_name,
        document_type: 'subscription',
        google_drive_url: signedUrl,
        signer_role: 'investor',
        signature_position: position,
        subscription_id: subscriptionId,
        document_id: targetDocumentId,
        deal_id: subscription.deal_id,
        member_id: signatory.id !== 'investor_primary' ? signatory.id : undefined,
        total_party_a_signatories: signatories.length
      }

      const investorSigData = await createSignatureRequestViaApi('investor', investorSigPayload)
      investorSignatureRequests.push({
        signatory: signatory.full_name,
        email: signatory.email,
        ...investorSigData
      })
    }

    console.log('✅ [READY-FOR-SIGNATURE] All investor signatures created')

    await serviceSupabase
      .from('documents')
      .update({
        ready_for_signature: true,
        status: 'pending_signature',
        signature_status: 'pending'
      })
      .eq('id', targetDocumentId)

    const now = new Date().toISOString()
    // Always record the latest send attempt for operational visibility.
    await serviceSupabase
      .from('subscriptions')
      .update({ pack_sent_at: now })
      .eq('id', subscriptionId)
    await serviceSupabase
      .from('subscriptions')
      .update({ pack_generated_at: now })
      .eq('id', subscriptionId)
      .is('pack_generated_at', null)

    if (subscription.deal_id) {
      const { data: deal } = await serviceSupabase
        .from('deals')
        .select('arranger_entity_id, name')
        .eq('id', subscription.deal_id)
        .single()

      if (deal?.arranger_entity_id) {
        const { data: arrangerUsers } = await serviceSupabase
          .from('arranger_users')
          .select('user_id')
          .eq('arranger_id', deal.arranger_entity_id)

        if (arrangerUsers && arrangerUsers.length > 0) {
          const investorName = subscription.investor?.display_name || subscription.investor?.legal_name || 'Investor'
          const dealName = deal.name || 'the deal'
          const notifications = arrangerUsers.map((au: { user_id: string }) => ({
            user_id: au.user_id,
            investor_id: null,
            title: 'Subscription Pack Sent',
            message: `Subscription pack for ${investorName} (${dealName}) has been sent for signature.`,
            link: '/versotech_main/versosign'
          }))
          await serviceSupabase.from('investor_notifications').insert(notifications)
        }
      }
    }

    console.log('✅ Multi-signatory signature requests created for subscription pack:', {
      document_id: targetDocumentId,
      investor_requests: investorSignatureRequests.length,
      issuer_request: issuerSigData.signature_request_id,
      arranger_request: arrangerSigData?.signature_request_id || null
    })

    return NextResponse.json({
      success: true,
      investor_signature_requests: investorSignatureRequests,
      issuer_request: issuerSigData,
      issuer_name: issuerName,
      arranger_request: arrangerSigData,
      countersigner_request: issuerSigData,
      countersigner_type: 'ceo' as const,
      countersigner_name: issuerName,
      total_signatories: signatories.length + 1 + (arrangerSigData ? 1 : 0)
    })
  }

  let retryAttempted = false
  let activeDocument = signableDocument

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await runSignatureWorkflowForDocument(activeDocument)
    } catch (error) {
      const message = normalizeErrorMessage(error)
      const phase = error instanceof SignatureWorkflowStepError ? error.phase : 'unknown'
      const reason = error instanceof SignatureWorkflowStepError
        ? error.reason
        : classifySignatureFailureReason(message)

      console.error('Error creating signature requests:', {
        message,
        phase,
        reason,
        attempt: attempt + 1,
        document_id: activeDocument?.id
      })

      const shouldRetry = !retryAttempted && (reason === 'anchor_missing' || reason === 'pdf_parse')
      if (shouldRetry) {
        retryAttempted = true
        try {
          activeDocument = await regenerateAndLoadReplacementDocument(activeDocument.id)
          continue
        } catch (regenError) {
          const regenMessage = normalizeErrorMessage(regenError)
          const regenReason = regenError instanceof SignatureWorkflowStepError
            ? regenError.reason
            : classifySignatureFailureReason(regenMessage)
          return NextResponse.json({
            error: 'Failed to initiate signature workflow',
            details: regenMessage,
            phase: 'regeneration',
            reason: regenReason,
            retry_attempted: true,
            document_id: activeDocument?.id
          }, { status: 500 })
        }
      }

      return NextResponse.json({
        error: 'Failed to initiate signature workflow',
        details: message,
        phase,
        reason,
        retry_attempted: retryAttempted,
        document_id: activeDocument?.id
      }, { status: 500 })
    }
  }

  return NextResponse.json({
    error: 'Failed to initiate signature workflow',
    details: 'Unexpected retry flow termination',
    phase: 'unknown',
    reason: 'unknown',
    retry_attempted: retryAttempted,
    document_id: activeDocument?.id
  }, { status: 500 })
}
