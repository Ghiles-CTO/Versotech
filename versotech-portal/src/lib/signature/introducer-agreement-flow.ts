import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  detectAnchors,
  getPlacementsFromAnchors,
  getRequiredAnchorsForIntroducerAgreement,
  validateRequiredAnchors,
} from './anchor-detector'
import { sendSignatureRequestEmail } from '@/lib/email/resend-service'
import { resolveIntroducerSignatories } from './introducer-signatories'
import { SignatureStorageManager } from './storage'
import { generateSigningUrl } from './token'
import type { SignaturePosition } from './types'

type AgreementRequestState = {
  id: string
  status: string
  signer_role: string
  signature_position: string | null
}

type IntroducerAgreementRecord = {
  id: string
  introducer_id: string
  arranger_id?: string | null
  deal_id?: string | null
  reference_number?: string | null
  default_commission_bps?: number | null
  performance_fee_bps?: number | null
  introducer?: any
  arranger?: any
  deal?: any
}

type ReleaseParams = {
  supabase: SupabaseClient
  agreement: IntroducerAgreementRecord
  signatureRequestId: string
  signedPdfPath: string
  signedPdfBytes?: Uint8Array | null
}

const INTERNAL_SIGNING_STATUSES = new Set([
  'approved',
  'pending_ceo_signature',
  'pending_arranger_signature',
])

function isDuplicateInsertError(error: unknown): boolean {
  const candidate = error as { code?: string; message?: string; details?: string } | null
  const combined = [candidate?.message, candidate?.details]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return candidate?.code === '23505' || combined.includes('duplicate key')
}

function buildSignerLabel(agreement: IntroducerAgreementRecord): string {
  const arrangerName = (agreement.arranger as any)?.legal_name || 'the arranger'
  return agreement.arranger_id ? `VERSO and ${arrangerName}` : 'VERSO'
}

async function getSignedPdfBytes(
  supabase: SupabaseClient,
  signedPdfPath: string,
  signedPdfBytes?: Uint8Array | null
): Promise<Uint8Array | null> {
  if (signedPdfBytes && signedPdfBytes.length > 0) {
    return signedPdfBytes
  }

  if (!signedPdfPath) {
    return null
  }

  try {
    const storage = new SignatureStorageManager(supabase)
    return await storage.downloadPDF(signedPdfPath)
  } catch (error) {
    console.error('❌ [INTRODUCER AGREEMENT FLOW] Failed to load signed PDF bytes:', error)
    return null
  }
}

export function canSignIntroducerAgreement(
  status: string | null | undefined,
  signerRole: 'admin' | 'arranger' | 'introducer',
  hasArranger: boolean
): boolean {
  if (!status) {
    return false
  }

  if (signerRole === 'introducer') {
    return status === 'pending_introducer_signature'
  }

  if (signerRole === 'arranger') {
    return hasArranger && INTERNAL_SIGNING_STATUSES.has(status)
  }

  return INTERNAL_SIGNING_STATUSES.has(status)
}

export function areRequiredIntroducerInternalSignaturesComplete(
  requests: AgreementRequestState[],
  hasArranger: boolean
): boolean {
  if (!requests.some((request) => request.signer_role === 'admin' && request.status === 'signed')) {
    return false
  }

  if (!hasArranger) {
    return true
  }

  return requests.some((request) => request.signer_role === 'arranger' && request.status === 'signed')
}

export async function maybeReleaseIntroducerAgreementCounterpartyRequests({
  supabase,
  agreement,
  signatureRequestId,
  signedPdfPath,
  signedPdfBytes,
}: ReleaseParams): Promise<'waiting_internal' | 'released'> {
  const hasArranger = !!agreement.arranger_id
  const now = new Date().toISOString()

  const { error: taskCompleteError } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: now,
    })
    .eq('related_entity_type', 'signature_request')
    .eq('related_entity_id', signatureRequestId)

  if (taskCompleteError) {
    console.warn('⚠️ [INTRODUCER AGREEMENT FLOW] Failed to complete internal signature task:', taskCompleteError)
  }

  const { data: existingRequests, error: requestsError } = await supabase
    .from('signature_requests')
    .select('id, status, signer_role, signature_position')
    .eq('introducer_agreement_id', agreement.id)

  if (requestsError || !existingRequests) {
    console.error('❌ [INTRODUCER AGREEMENT FLOW] Failed to fetch agreement signature requests:', requestsError)
    return 'waiting_internal'
  }

  if (!areRequiredIntroducerInternalSignaturesComplete(existingRequests, hasArranger)) {
    console.log('⏳ [INTRODUCER AGREEMENT FLOW] Waiting for remaining internal signatures before releasing introducer')
    return 'waiting_internal'
  }

  const introducer = agreement.introducer as any
  const signatoriesToNotify = await resolveIntroducerSignatories({
    supabase,
    introducerId: agreement.introducer_id,
    introducer: {
      legal_name: introducer?.legal_name,
      display_name: introducer?.display_name,
      first_name: introducer?.first_name,
      last_name: introducer?.last_name,
      email: introducer?.email,
      user_id: introducer?.user_id,
    },
    maxSignatories: 5,
  })

  if (signatoriesToNotify.length === 0) {
    throw new Error('No introducer signatories available to sign')
  }

  const currentPdfBytes = await getSignedPdfBytes(supabase, signedPdfPath, signedPdfBytes)
  let detectedAnchors: any[] | null = null

  if (currentPdfBytes && currentPdfBytes.length > 0) {
    try {
      detectedAnchors = await detectAnchors(currentPdfBytes)
      if (detectedAnchors.length > 0) {
        const requiredAnchors = getRequiredAnchorsForIntroducerAgreement(
          signatoriesToNotify.length,
          !!agreement.arranger_id
        )
        try {
          validateRequiredAnchors(detectedAnchors, requiredAnchors)
        } catch (anchorError) {
          console.warn('⚠️ [INTRODUCER AGREEMENT FLOW] Required anchors missing:', anchorError)
        }
      } else {
        console.warn('⚠️ [INTRODUCER AGREEMENT FLOW] No anchors detected in signed PDF')
      }
    } catch (anchorError) {
      console.error('❌ [INTRODUCER AGREEMENT FLOW] Failed to detect anchors:', anchorError)
      detectedAnchors = null
    }
  }

  const existingIntroducerRequests = existingRequests.filter(
    (request) => request.signer_role === 'introducer' && request.signature_position?.startsWith('party_b')
  )
  const existingRequestByPosition = new Map(
    existingIntroducerRequests
      .filter((request) => request.signature_position)
      .map((request) => [request.signature_position as string, request.id])
  )

  let firstSignatureRequestId = existingIntroducerRequests[0]?.id || null
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  const dealName =
    (agreement.deal as any)?.company_name || (agreement.deal as any)?.name || 'Investment Opportunity'
  const introducerName = introducer?.legal_name || 'Introducer'
  const subscriptionFeePercent = agreement.default_commission_bps
    ? (agreement.default_commission_bps / 100).toFixed(2)
    : '0'
  const performanceFeePercent = agreement.performance_fee_bps
    ? (agreement.performance_fee_bps / 100).toFixed(2)
    : null
  const feeDescription = performanceFeePercent
    ? `${subscriptionFeePercent}% subscription fee, ${performanceFeePercent}% performance fee`
    : `${subscriptionFeePercent}% subscription fee`
  const signerLabel = buildSignerLabel(agreement)

  for (const [index, signatory] of signatoriesToNotify.entries()) {
    const signaturePosition = (index === 0 ? 'party_b' : `party_b_${index + 1}`) as SignaturePosition
    const existingRequestId = existingRequestByPosition.get(signaturePosition)

    if (existingRequestId) {
      if (!firstSignatureRequestId) {
        firstSignatureRequestId = existingRequestId
      }
      continue
    }

    const signaturePlacements =
      detectedAnchors && detectedAnchors.length > 0
        ? getPlacementsFromAnchors(detectedAnchors, signaturePosition, 'introducer_agreement')
        : []

    if (detectedAnchors && detectedAnchors.length > 0 && signaturePlacements.length === 0) {
      console.warn(`⚠️ [INTRODUCER AGREEMENT FLOW] No anchor placements found for ${signaturePosition}`)
    }

    const signingToken = crypto.randomUUID()
    const { data: introducerSignatureRequest, error: sigReqError } = await supabase
      .from('signature_requests')
      .insert({
        introducer_id: agreement.introducer_id,
        introducer_agreement_id: agreement.id,
        deal_id: agreement.deal_id,
        investor_id: null,
        signer_user_id: signatory.user_id,
        signer_email: signatory.email,
        signer_name: signatory.name,
        document_type: 'introducer_agreement',
        signer_role: 'introducer',
        signature_position: signaturePosition,
        signing_token: signingToken,
        token_expires_at: expiresAt.toISOString(),
        unsigned_pdf_path: signedPdfPath,
        ...(signaturePlacements.length > 0
          ? { signature_placements: signaturePlacements }
          : {}),
        status: 'pending',
      })
      .select('id')
      .single()

    if (sigReqError || !introducerSignatureRequest) {
      if (isDuplicateInsertError(sigReqError)) {
        const { data: duplicateRequest } = await supabase
          .from('signature_requests')
          .select('id')
          .eq('introducer_agreement_id', agreement.id)
          .eq('signer_role', 'introducer')
          .eq('signature_position', signaturePosition)
          .in('status', ['pending', 'signed'])
          .maybeSingle()

        if (duplicateRequest?.id && !firstSignatureRequestId) {
          firstSignatureRequestId = duplicateRequest.id
        }
        continue
      }

      console.error(
        `❌ [INTRODUCER AGREEMENT FLOW] Failed to create introducer signature request for ${signatory.email}:`,
        sigReqError
      )
      continue
    }

    if (!firstSignatureRequestId) {
      firstSignatureRequestId = introducerSignatureRequest.id
    }

    let signingUrl = `/sign/${signingToken}`
    try {
      signingUrl = generateSigningUrl(signingToken)
    } catch (urlError) {
      console.warn('⚠️ [INTRODUCER AGREEMENT FLOW] Falling back to relative signing URL:', urlError)
    }

    const emailResult = await sendSignatureRequestEmail({
      email: signatory.email,
      signerName: signatory.name,
      documentType: 'introducer_agreement',
      signingUrl,
      expiresAt: expiresAt.toISOString(),
    })

    await supabase
      .from('signature_requests')
      .update({
        email_sent_at: emailResult.success ? now : null,
      })
      .eq('id', introducerSignatureRequest.id)

    if (!emailResult.success) {
      console.error(
        `⚠️ [INTRODUCER AGREEMENT FLOW] Failed to send signature email to ${signatory.email}:`,
        emailResult.error
      )
    }

    if (signatory.user_id) {
      const { error: taskError } = await supabase.from('tasks').insert({
        owner_user_id: signatory.user_id,
        owner_introducer_id: agreement.introducer_id,
        kind: 'countersignature',
        category: 'signatures',
        title: `Sign Your Introducer Agreement: ${dealName}`,
        description:
          `Please review and sign your introducer fee agreement.\n\n` +
          `• Deal: ${dealName}\n` +
          `• Your Commission: ${feeDescription}\n` +
          `• Reference: ${agreement.reference_number || 'N/A'}\n\n` +
          `${signerLabel} has already signed. After you sign, the agreement becomes active.`,
        status: 'pending',
        priority: 'high',
        related_entity_type: 'signature_request',
        related_entity_id: introducerSignatureRequest.id,
        related_deal_id: agreement.deal_id,
        due_at: expiresAt.toISOString(),
        action_url: signingUrl,
        instructions: {
          type: 'signature',
          action_url: signingUrl,
          signature_request_id: introducerSignatureRequest.id,
          document_type: 'introducer_agreement',
          introducer_id: agreement.introducer_id,
          introducer_name: introducerName,
          deal_name: dealName,
          agreement_id: agreement.id,
          reference_number: agreement.reference_number,
          fee_summary: feeDescription,
        },
      })

      if (taskError) {
        console.error(
          `⚠️ [INTRODUCER AGREEMENT FLOW] Failed to create introducer task for ${signatory.email}:`,
          taskError
        )
      }

      await supabase.from('investor_notifications').insert({
        user_id: signatory.user_id,
        investor_id: null,
        title: 'Introducer Agreement Ready for Your Signature',
        message: `Your introducer agreement for ${dealName} has been signed by ${signerLabel} and is ready for your signature.`,
        link: `/versotech_main/versosign`,
        type: 'action_required',
      })
    } else {
      console.log(
        `ℹ️ [INTRODUCER AGREEMENT FLOW] Signatory ${signatory.email} has no linked user. Email-only signing path used.`
      )
    }
  }

  if (!firstSignatureRequestId) {
    throw new Error('Failed to create introducer signature requests')
  }

  await supabase
    .from('introducer_agreements')
    .update({
      status: 'pending_introducer_signature',
      introducer_signature_request_id: firstSignatureRequestId,
      updated_at: now,
    })
    .eq('id', agreement.id)

  return 'released'
}
