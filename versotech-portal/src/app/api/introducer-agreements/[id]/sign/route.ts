/**
 * Initiate Signing for Introducer Agreement
 * POST /api/introducer-agreements/[id]/sign - Create signature request and return signing URL
 *
 * Signing Flow:
 * - If agreement has arranger_id: CEO + Arranger sign internally → then Introducer
 * - If no arranger_id: CEO signs first → then Introducer
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { SignatureStorageManager } from '@/lib/signature/storage'
import { detectAnchors, getPlacementsFromAnchors } from '@/lib/signature/anchor-detector'
import { canSignIntroducerAgreement } from '@/lib/signature/introducer-agreement-flow'
import { readActivePersonaCookieValues } from '@/lib/kyc/active-introducer-link'

async function getInternalSignaturePlacements(
  supabase: ReturnType<typeof createServiceClient>,
  pdfPath: string | null
) {
  if (!pdfPath) {
    return {
      partyAPlacements: null,
      partyCPlacements: null,
    }
  }

  try {
    const storage = new SignatureStorageManager(supabase)
    const pdfBytes = await storage.downloadPDF(pdfPath)
    const anchors = await detectAnchors(pdfBytes)

    if (anchors.length === 0) {
      console.warn('⚠️ [introducer-agreements/sign] No anchors detected in PDF')
      return {
        partyAPlacements: null,
        partyCPlacements: null,
      }
    }

    const partyAPlacements = getPlacementsFromAnchors(anchors, 'party_a', 'introducer_agreement')
    const partyCPlacements = getPlacementsFromAnchors(anchors, 'party_c', 'introducer_agreement')

    return {
      partyAPlacements: partyAPlacements.length > 0 ? partyAPlacements : null,
      partyCPlacements: partyCPlacements.length > 0 ? partyCPlacements : null,
    }
  } catch (error) {
    console.error('❌ [introducer-agreements/sign] Failed to detect anchors:', error)
    return {
      partyAPlacements: null,
      partyCPlacements: null,
    }
  }
}

function isDuplicateSignatureRequestError(error: unknown): boolean {
  const candidate = error as { code?: string; message?: string; details?: string } | null
  const combined = [candidate?.message, candidate?.details]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return candidate?.code === '23505' || combined.includes('duplicate key')
}

async function getReusableSignatureRequest(
  serviceSupabase: ReturnType<typeof createServiceClient>,
  requestId: string | null | undefined
) {
  if (!requestId) {
    return null
  }

  const { data: existingRequest } = await serviceSupabase
    .from('signature_requests')
    .select('id, signing_token, token_expires_at, status')
    .eq('id', requestId)
    .single()

  if (!existingRequest) {
    return null
  }

  if (existingRequest.status !== 'pending') {
    return existingRequest
  }

  const expiresAt = new Date(existingRequest.token_expires_at)
  if (expiresAt <= new Date()) {
    return null
  }

  return existingRequest
}

async function createInternalSignatureRequest(params: {
  serviceSupabase: ReturnType<typeof createServiceClient>
  agreement: any
  actorUserId: string
  actorEmail: string
  actorName: string
  signerRole: 'admin' | 'arranger'
  signaturePosition: 'party_a' | 'party_c'
  signatureRequestField: 'ceo_signature_request_id' | 'arranger_signature_request_id'
  signerType: 'ceo' | 'arranger'
  previousStatus: string
  nextStatus: 'pending_ceo_signature' | 'pending_arranger_signature'
  signaturePlacements: any[] | null
}) {
  const {
    serviceSupabase,
    agreement,
    actorUserId,
    actorEmail,
    actorName,
    signerRole,
    signaturePosition,
    signatureRequestField,
    signerType,
    previousStatus,
    nextStatus,
    signaturePlacements,
  } = params

  const signingToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { data: signatureRequest, error: createError } = await serviceSupabase
    .from('signature_requests')
    .insert({
      investor_id: agreement.introducer_id,
      introducer_id: agreement.introducer_id,
      introducer_agreement_id: agreement.id,
      signer_email: actorEmail,
      signer_name: actorName,
      document_type: 'introducer_agreement',
      signer_role: signerRole,
      signature_position: signaturePosition,
      signing_token: signingToken,
      token_expires_at: expiresAt.toISOString(),
      unsigned_pdf_path: agreement.pdf_url,
      ...(signaturePlacements && signaturePlacements.length > 0
        ? { signature_placements: signaturePlacements }
        : {}),
      status: 'pending',
      created_by: actorUserId,
    })
    .select('id')
    .single()

  if (createError || !signatureRequest) {
    if (isDuplicateSignatureRequestError(createError)) {
      const { data: duplicateRequest } = await serviceSupabase
        .from('signature_requests')
        .select('id, signing_token, token_expires_at, status')
        .eq('introducer_agreement_id', agreement.id)
        .eq('signer_role', signerRole)
        .eq('signature_position', signaturePosition)
        .in('status', ['pending', 'signed'])
        .maybeSingle()

      if (duplicateRequest) {
        return duplicateRequest.status === 'pending' ? duplicateRequest : null
      }
    }

    console.error(`[introducer-agreements/sign] Create ${signerType} signature request error:`, createError)
    return null
  }

  await serviceSupabase
    .from('introducer_agreements')
    .update({
      [signatureRequestField]: signatureRequest.id,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', agreement.id)

  await auditLogger.log({
    actor_user_id: actorUserId,
    action: AuditActions.AGREEMENT_SIGNED,
    entity: AuditEntities.INTRODUCER_AGREEMENTS,
    entity_id: agreement.id,
    metadata: {
      introducer_id: agreement.introducer_id,
      arranger_id: agreement.arranger_id,
      signer_role: signerType,
      previous_status: previousStatus,
      new_status: nextStatus,
      signature_request_id: signatureRequest.id,
    },
  })

  return {
    id: signatureRequest.id,
    signing_token: signingToken,
    token_expires_at: expiresAt.toISOString(),
    status: 'pending',
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Get agreement with introducer and arranger details
    const { data: agreement, error: fetchError } = await serviceSupabase
      .from('introducer_agreements')
      .select(`
        *,
        introducer:introducer_id (
          id,
          legal_name,
          email,
          contact_name
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // Get arranger info if applicable
    // Note: arranger_entities has no 'company_name' - use legal_name only
    let arrangerEntity = null
    if (agreement.arranger_id) {
      const { data: arranger } = await serviceSupabase
        .from('arranger_entities')
        .select('id, legal_name')
        .eq('id', agreement.arranger_id)
        .single()
      arrangerEntity = arranger
    }

    // Check user role using persona system
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id,
    })

    const isStaff = personas?.some(
      (p: any) => p.persona_type === 'staff' && ['staff_admin', 'ceo', 'staff_member'].includes(p.role_in_entity)
    )

    // Check if user is an arranger for this agreement
    const arrangerPersona = personas?.find(
      (p: any) => p.persona_type === 'arranger' && p.entity_id === agreement.arranger_id
    )
    const { cookiePersonaType, cookiePersonaId } = readActivePersonaCookieValues(request.cookies)
    const isActiveArrangerContext =
      !cookiePersonaType ||
      (cookiePersonaType === 'arranger' &&
        !!agreement.arranger_id &&
        (!cookiePersonaId || cookiePersonaId === agreement.arranger_id))
    const isArrangerForAgreement =
      !!arrangerPersona &&
      !!agreement.arranger_id &&
      isActiveArrangerContext

    // Check if user is an introducer for this agreement
    const introducerPersona = personas?.find(
      (p: any) => p.persona_type === 'introducer' && p.entity_id === agreement.introducer_id
    )
    const isIntroducerForAgreement =
      !!introducerPersona &&
      (!cookiePersonaType ||
        (cookiePersonaType === 'introducer' &&
          (!cookiePersonaId || cookiePersonaId === agreement.introducer_id)))

    if (
      !isStaff &&
      !!cookiePersonaType &&
      cookiePersonaType !== 'staff' &&
      !isArrangerForAgreement &&
      !isIntroducerForAgreement
    ) {
      return NextResponse.json(
        { error: 'Switch to the linked introducer or arranger profile to sign this agreement.' },
        { status: 403 }
      )
    }

    const hasArranger = !!agreement.arranger_id
    const { partyAPlacements, partyCPlacements } = await getInternalSignaturePlacements(
      serviceSupabase,
      agreement.pdf_url
    )

    // Handle Arranger signing
    if (isArrangerForAgreement && canSignIntroducerAgreement(agreement.status, 'arranger', hasArranger)) {
      const existingRequest = await getReusableSignatureRequest(
        serviceSupabase,
        agreement.arranger_signature_request_id
      )

      if (existingRequest?.status === 'pending') {
        return NextResponse.json({
          signing_url: `/sign/${existingRequest.signing_token}`,
          pdf_url: agreement.pdf_url,
        })
      }

      const signatureRequest = await createInternalSignatureRequest({
        serviceSupabase,
        agreement,
        actorUserId: user.id,
        actorEmail: user.email || '',
        actorName: user.user_metadata?.full_name || arrangerEntity?.legal_name || 'Arranger',
        signerRole: 'arranger',
        signaturePosition: 'party_c',
        signatureRequestField: 'arranger_signature_request_id',
        signerType: 'arranger',
        previousStatus: agreement.status,
        nextStatus: 'pending_ceo_signature',
        signaturePlacements: partyCPlacements,
      })

      if (!signatureRequest) {
        return NextResponse.json({ error: 'Failed to create signature request' }, { status: 500 })
      }

      return NextResponse.json({
        signing_url: `/sign/${signatureRequest.signing_token}`,
        pdf_url: agreement.pdf_url,
        expires_at: signatureRequest.token_expires_at,
        signer_type: 'arranger',
      })
    }

    // Handle CEO signing
    if (isStaff && canSignIntroducerAgreement(agreement.status, 'admin', hasArranger)) {
      const existingRequest = await getReusableSignatureRequest(
        serviceSupabase,
        agreement.ceo_signature_request_id
      )

      if (existingRequest?.status === 'pending') {
        return NextResponse.json({
          signing_url: `/sign/${existingRequest.signing_token}`,
          pdf_url: agreement.pdf_url,
        })
      }

      const signatureRequest = await createInternalSignatureRequest({
        serviceSupabase,
        agreement,
        actorUserId: user.id,
        actorEmail: user.email || '',
        actorName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'CEO',
        signerRole: 'admin',
        signaturePosition: 'party_a',
        signatureRequestField: 'ceo_signature_request_id',
        signerType: 'ceo',
        previousStatus: agreement.status,
        nextStatus: 'pending_ceo_signature',
        signaturePlacements: partyAPlacements,
      })

      if (!signatureRequest) {
        return NextResponse.json({ error: 'Failed to create signature request' }, { status: 500 })
      }

      return NextResponse.json({
        signing_url: `/sign/${signatureRequest.signing_token}`,
        pdf_url: agreement.pdf_url,
        expires_at: signatureRequest.token_expires_at,
        signer_type: 'ceo',
      })
    }

    // Handle Introducer signing (status = 'pending_introducer_signature')
    if (isIntroducerForAgreement && agreement.status === 'pending_introducer_signature') {
      if (agreement.introducer_signature_request_id) {
        const { data: existingRequest } = await serviceSupabase
          .from('signature_requests')
          .select('signing_token, token_expires_at, status')
          .eq('id', agreement.introducer_signature_request_id)
          .single()

        if (existingRequest && existingRequest.status === 'pending') {
          const expiresAt = new Date(existingRequest.token_expires_at)
          if (expiresAt > new Date()) {
            return NextResponse.json({
              signing_url: `/sign/${existingRequest.signing_token}`,
              pdf_url: agreement.signed_pdf_url || agreement.pdf_url,
            })
          }
        }
      }

      return NextResponse.json(
        { error: 'No valid signature request found. Please contact support.' },
        { status: 400 }
      )
    }

    // Provide helpful error messages
    if (isStaff && !canSignIntroducerAgreement(agreement.status, 'admin', hasArranger)) {
      return NextResponse.json(
        { error: `Cannot sign agreement in status: ${agreement.status}. It is not ready for internal signature.` },
        { status: 400 }
      )
    }

    if (isArrangerForAgreement && !canSignIntroducerAgreement(agreement.status, 'arranger', hasArranger)) {
      return NextResponse.json(
        { error: `Cannot sign agreement in status: ${agreement.status}. It is not ready for arranger signature.` },
        { status: 400 }
      )
    }

    if (isIntroducerForAgreement && agreement.status !== 'pending_introducer_signature') {
      const firstSigner = hasArranger ? 'CEO and arranger' : 'CEO'
      return NextResponse.json(
        { error: `Cannot sign agreement in status: ${agreement.status}. ${firstSigner} must sign first.` },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Unauthorized to sign this agreement' }, { status: 403 })
  } catch (error) {
    console.error('[introducer-agreements/sign] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
