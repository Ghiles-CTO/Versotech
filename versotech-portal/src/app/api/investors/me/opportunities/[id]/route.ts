import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  getCycleStage,
  getLatestActiveOrRecentCycle,
  isDealClosedForInvestmentRounds,
  isTermSheetClosedForInvestmentRounds,
  LIVE_CYCLE_STATUSES,
  updateDealInvestmentCycleProgress,
} from '@/lib/deals/investment-cycles'

type SubscriptionDocumentSummary = {
  status: string
  signatories: Array<{
    name: string
    email: string
    status: string
    signed_at: string | null
  }>
  unsigned_url: string | null
  signed_url: string | null
}
interface RouteParams {
  params: Promise<{ id: string }>
}

const MEMBER_SIGNATORY_FILTER = 'is_signatory.eq.true,role.eq.authorized_signatory'

/**
 * GET /api/investors/me/opportunities/:id
 * Fetch a single opportunity with full details, journey stages, and data room access
 *
 * For MODE 2 (commercial_partner_proxy): Pass ?client_investor_id=xxx to view client's dataroom
 */
export async function GET(request: Request, { params }: RouteParams) {
  console.log('🔴 [opportunities/[id]] GET handler called')
  const { id: dealId } = await params
  console.log('🔴 [opportunities/[id]] dealId:', dealId)
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  // Get client_investor_id from query params for MODE 2 proxy access
  const url = new URL(request.url)
  const clientInvestorId = url.searchParams.get('client_investor_id')
  const requestedCycleId = url.searchParams.get('cycle_id')

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's membership for this deal first (security check)
    // This works for ALL personas: investors, partners, introducers, CPs, lawyers, arrangers
    const { data: membership } = await serviceSupabase
      .from('deal_memberships')
      .select('*')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .maybeSingle()

    // Get investor ID for this user (optional - only investors have this)
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    const investorId = investorLinks?.[0]?.investor_id || null

    // MODE 2: For commercial_partner_proxy role, allow viewing client's dataroom
    let effectiveInvestorId = membership?.investor_id || investorId
    let isProxyMode = false
    let proxyClientName: string | null = null

    if (clientInvestorId && membership?.role === 'commercial_partner_proxy') {
      // Validate that this user's CP has access to the client
      const { data: cpLink } = await serviceSupabase
        .from('commercial_partner_users')
        .select('commercial_partner_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cpLink) {
        // Check if client is linked to this CP
        const { data: clientLink } = await serviceSupabase
          .from('commercial_partner_clients')
          .select('id, client_name, client_investor_id')
          .eq('commercial_partner_id', cpLink.commercial_partner_id)
          .eq('client_investor_id', clientInvestorId)
          .eq('is_active', true)
          .maybeSingle()

        if (clientLink) {
          // Valid client - use their investor_id for dataroom access
          effectiveInvestorId = clientInvestorId
          isProxyMode = true
          proxyClientName = clientLink.client_name
          console.log('🔵 [opportunities/[id]] MODE 2: Viewing as proxy for client:', proxyClientName)
        } else {
          return NextResponse.json({ error: 'Client not authorized for this commercial partner' }, { status: 403 })
        }
      }
    }

    let investorAccountApprovalStatus: string | null = null
    let investorKycStatus: string | null = null
    let isAccountApproved: boolean | null = null

    if (effectiveInvestorId) {
      const { data: investorRecord, error: investorError } = await serviceSupabase
        .from('investors')
        .select('account_approval_status, kyc_status, status')
        .eq('id', effectiveInvestorId)
        .maybeSingle()

      if (investorError) {
        console.error('[opportunities/[id]] Failed to fetch investor account approval:', investorError)
      } else if (investorRecord) {
        const investorStatus = investorRecord.status?.toLowerCase() ?? null
        const isUnauthorized = investorStatus === 'unauthorized' || investorStatus === 'blacklisted' ||
          investorRecord.account_approval_status === 'unauthorized'

        investorAccountApprovalStatus = isUnauthorized
          ? 'unauthorized'
          : investorRecord.account_approval_status ?? null
        investorKycStatus = investorRecord.kyc_status ?? null
        isAccountApproved = investorAccountApprovalStatus === 'approved'
      }
    }

    // Check if investor has access to this deal (must be a member or deal is public)
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      console.error('[GET opportunity] Deal query failed:', { dealId, dealError, deal })
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // DEBUG: Log what deal was fetched to verify correct data
    console.log('🔵 [opportunities/[id]] Deal fetched:', {
      requestedId: dealId,
      returnedId: deal.id,
      returnedName: deal.name,
      match: dealId === deal.id
    })

    // Fetch vehicle separately if it exists
    let vehicle = null
    if (deal.vehicle_id) {
      const { data: v } = await serviceSupabase
        .from('vehicles')
        .select('id, name, type, formation_date, currency, entity_code, series_number')
        .eq('id', deal.vehicle_id)
        .single()
      vehicle = v
    }

    const isDealOpen = deal.status === 'open' || deal.status === 'allocation_pending'
    const isDealRoundOpen = !isDealClosedForInvestmentRounds(deal)

    // Security: Only allow access if membership exists or deal is explicitly public
    if (!membership && !isDealOpen) {
      return NextResponse.json({ error: 'You do not have access to this opportunity' }, { status: 403 })
    }

    // Get data room access (use maybeSingle as record might not exist)
    const { data: dataRoomAccess } = await serviceSupabase
      .from('deal_data_room_access')
      .select('*')
      .eq('deal_id', dealId)
      .eq('investor_id', effectiveInvestorId)
      .is('revoked_at', null)
      .order('granted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let investmentCycles: any[] = []
    let cycleSubscriptionsById = new Map<string, any>()
    let cycleSubmissionsById = new Map<string, any>()
    let termSheetsById = new Map<string, any>()
    let subscriptionSignatureSummaryById = new Map<string, {
      status: 'not_started' | 'pending' | 'complete'
      signedPath: string | null
    }>()
    let subscriptionPackDocumentsBySubscriptionId = new Map<string, SubscriptionDocumentSummary>()
    let certificateDocumentsBySubscriptionId = new Map<string, {
      status: string
      url: string | null
    } | null>()
    let ndaDocumentSummary: SubscriptionDocumentSummary = {
      status: 'not_started',
      signatories: [],
      unsigned_url: null,
      signed_url: null,
    }

    if (effectiveInvestorId) {
      const { data: rawCycles } = await serviceSupabase
        .from('deal_investment_cycles' as any)
        .select('*')
        .eq('deal_id', dealId)
        .eq('investor_id', effectiveInvestorId)
        .order('sequence_number', { ascending: false })
        .order('created_at', { ascending: false })

      investmentCycles = rawCycles || []

      const cycleIds = investmentCycles.map(cycle => cycle.id).filter(Boolean)
      const cycleTermSheetIds = investmentCycles.map(cycle => cycle.term_sheet_id).filter(Boolean)

      if (cycleTermSheetIds.length > 0) {
        const { data: termSheets } = await serviceSupabase
          .from('deal_fee_structures')
          .select('*')
          .in('id', cycleTermSheetIds)

        termSheetsById = new Map((termSheets || []).map(termSheet => [termSheet.id, termSheet]))
      }

      if (cycleIds.length > 0) {
        const [{ data: cycleSubscriptions }, { data: cycleSubmissions }] = await Promise.all([
          serviceSupabase
            .from('subscriptions')
            .select(`
              id,
              cycle_id,
              term_sheet_id,
              status,
              commitment,
              currency,
              funded_amount,
              pack_generated_at,
              pack_sent_at,
              signed_at,
              funded_at,
              activated_at,
              created_at
            `)
            .in('cycle_id', cycleIds)
            .order('created_at', { ascending: false }),
          serviceSupabase
            .from('deal_subscription_submissions')
            .select('id, cycle_id, status, submitted_at, payload_json, formal_subscription_id')
            .in('cycle_id', cycleIds)
            .order('submitted_at', { ascending: false }),
        ])

        for (const sub of cycleSubscriptions || []) {
          if (sub.cycle_id && !cycleSubscriptionsById.has(sub.cycle_id)) {
            cycleSubscriptionsById.set(sub.cycle_id, sub)
          }
        }

        for (const submission of cycleSubmissions || []) {
          if (submission.cycle_id && !cycleSubmissionsById.has(submission.cycle_id)) {
            cycleSubmissionsById.set(submission.cycle_id, submission)
          }
        }

        const subscriptionIds = (cycleSubscriptions || []).map(sub => sub.id).filter(Boolean)
        if (subscriptionIds.length > 0) {
          const [{ data: subscriptionSignatures }, { data: subscriptionPackDocuments }, { data: certificateDocuments }] = await Promise.all([
            serviceSupabase
              .from('signature_requests')
              .select('subscription_id, status, signed_pdf_path, unsigned_pdf_path, signer_name, signer_email, signature_timestamp')
              .in('subscription_id', subscriptionIds)
              .eq('document_type', 'subscription')
              .order('created_at', { ascending: false }),
            serviceSupabase
              .from('documents')
              .select('subscription_id, file_key, signature_status, created_at')
              .in('subscription_id', subscriptionIds)
              .eq('type', 'subscription_pack')
              .eq('is_published', true)
              .order('created_at', { ascending: false }),
            serviceSupabase
              .from('documents')
              .select('subscription_id, file_key, created_at')
              .in('subscription_id', subscriptionIds)
              .eq('type', 'certificate')
              .order('created_at', { ascending: false }),
          ])

          const signaturesBySubscriptionId = new Map<string, any[]>()
          for (const signature of subscriptionSignatures || []) {
            if (!signature.subscription_id) continue
            const existing = signaturesBySubscriptionId.get(signature.subscription_id) || []
            existing.push(signature)
            signaturesBySubscriptionId.set(signature.subscription_id, existing)
          }

          const packDocumentBySubscriptionId = new Map<string, { file_key: string | null; signature_status: string | null }>()
          for (const document of subscriptionPackDocuments || []) {
            if (!document.subscription_id || packDocumentBySubscriptionId.has(document.subscription_id)) continue
            packDocumentBySubscriptionId.set(document.subscription_id, {
              file_key: document.file_key,
              signature_status: document.signature_status,
            })
          }

          for (const [subscriptionId, signatures] of signaturesBySubscriptionId.entries()) {
            const allSigned = signatures.length > 0 && signatures.every(signature => signature.status === 'signed')
            subscriptionSignatureSummaryById.set(subscriptionId, {
              status: allSigned ? 'complete' : signatures.length > 0 ? 'pending' : 'not_started',
              signedPath: allSigned
                ? signatures.find(signature => signature.signed_pdf_path)?.signed_pdf_path || null
                : null,
            })
          }

          for (const [subscriptionId, document] of packDocumentBySubscriptionId.entries()) {
            const existing = subscriptionSignatureSummaryById.get(subscriptionId)
            if (existing?.signedPath) continue
            const isComplete = document.signature_status === 'complete' && !!document.file_key
            subscriptionSignatureSummaryById.set(subscriptionId, {
              status: isComplete ? 'complete' : existing?.status || 'not_started',
              signedPath: isComplete ? document.file_key : existing?.signedPath || null,
            })
          }

          for (const subscriptionId of subscriptionIds) {
            const signatures = signaturesBySubscriptionId.get(subscriptionId) || []
            const allSigned = signatures.length > 0 && signatures.every(signature => signature.status === 'signed')
            const someSigned = signatures.some(signature => signature.status === 'signed')
            const publishedDocument = packDocumentBySubscriptionId.get(subscriptionId)
            const hasPublishedSignedPack = publishedDocument?.signature_status === 'complete' && !!publishedDocument.file_key

            subscriptionPackDocumentsBySubscriptionId.set(subscriptionId, {
              status: allSigned
                ? 'complete'
                : hasPublishedSignedPack
                  ? 'complete'
                  : someSigned
                    ? 'partial'
                    : signatures.length > 0
                      ? 'pending'
                      : 'not_started',
              signatories: signatures.map(signature => ({
                name: signature.signer_name,
                email: signature.signer_email,
                status: signature.status,
                signed_at: signature.signature_timestamp,
              })),
              unsigned_url: signatures.find(signature => signature.unsigned_pdf_path)?.unsigned_pdf_path || null,
              signed_url: allSigned
                ? signatures.find(signature => signature.signed_pdf_path)?.signed_pdf_path || null
                : hasPublishedSignedPack
                  ? publishedDocument?.file_key || null
                  : null,
            })
          }

          const latestCertificateBySubscriptionId = new Map<string, string | null>()
          for (const document of certificateDocuments || []) {
            if (!document.subscription_id || latestCertificateBySubscriptionId.has(document.subscription_id)) continue
            latestCertificateBySubscriptionId.set(document.subscription_id, document.file_key || null)
          }

          for (const sub of cycleSubscriptions || []) {
            if (!sub?.id) continue
            if (!sub.activated_at) {
              certificateDocumentsBySubscriptionId.set(sub.id, null)
              continue
            }

            const certificatePath = latestCertificateBySubscriptionId.get(sub.id) || null
            certificateDocumentsBySubscriptionId.set(sub.id, certificatePath ? {
              status: 'available',
              url: certificatePath,
            } : {
              status: 'generating',
              url: null,
            })
          }
        }
      }
    }

    if (effectiveInvestorId) {
      const { data: ndaSignatures } = await serviceSupabase
        .from('signature_requests')
        .select('signer_name, signer_email, status, signature_timestamp, unsigned_pdf_path, signed_pdf_path')
        .eq('deal_id', dealId)
        .eq('investor_id', effectiveInvestorId)
        .eq('document_type', 'nda')
        .order('created_at', { ascending: true })

      const ndaSigs = ndaSignatures || []
      const ndaAllSigned = ndaSigs.length > 0 && ndaSigs.every(signature => signature.status === 'signed')
      const ndaSomeSigned = ndaSigs.some(signature => signature.status === 'signed')

      ndaDocumentSummary = {
        status: ndaAllSigned ? 'complete' : ndaSomeSigned ? 'partial' : ndaSigs.length > 0 ? 'pending' : 'not_started',
        signatories: ndaSigs.map(signature => ({
          name: signature.signer_name,
          email: signature.signer_email,
          status: signature.status,
          signed_at: signature.signature_timestamp,
        })),
        unsigned_url: ndaSigs.find(signature => signature.unsigned_pdf_path)?.unsigned_pdf_path || null,
        signed_url: ndaAllSigned ? ndaSigs.find(signature => signature.signed_pdf_path)?.signed_pdf_path || null : null,
      }
    }

    const chronologicalCycles = [...investmentCycles].sort((left, right) => {
      const leftSequence = Number(left.sequence_number || 0)
      const rightSequence = Number(right.sequence_number || 0)
      if (leftSequence !== rightSequence) return leftSequence - rightSequence
      return new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
    })

    const selectedCycle =
      investmentCycles.find(cycle => cycle.id === requestedCycleId) ||
      investmentCycles.find(cycle => LIVE_CYCLE_STATUSES.includes(cycle.status)) ||
      investmentCycles.find(cycle => cycle.status === 'funded' || cycle.status === 'active') ||
      investmentCycles[0] ||
      null
    const primaryJourneyCycle = chronologicalCycles[0] || selectedCycle || null

    // Get subscription if exists (use maybeSingle as subscription might not exist)
    const vehicleId = deal.vehicle_id
    let subscription = selectedCycle ? cycleSubscriptionsById.get(selectedCycle.id) || null : null
    let subscriptionSubmission: {
      id: string
      status: string
      submitted_at: string | null
      payload_json?: Record<string, any>
      formal_subscription_id?: string | null
    } | null = selectedCycle ? cycleSubmissionsById.get(selectedCycle.id) || null : null
    let subscriptionDocuments: {
      nda: {
        status: string
        signatories: Array<{
          name: string
          email: string
          status: string
          signed_at: string | null
        }>
        unsigned_url: string | null
        signed_url: string | null
      }
      subscription_pack: {
        status: string
        signatories: Array<{
          name: string
          email: string
          status: string
          signed_at: string | null
        }>
        unsigned_url: string | null
        signed_url: string | null
      }
      certificate: {
        status: string
        url: string | null
      } | null
    } | null = null

    // Query subscription by deal_id (NOT vehicle_id) to ensure deal-specific data
    // Multiple deals can share the same vehicle_id, so using vehicle_id would
    // return subscriptions from wrong deals (e.g., both Anthropic deals share a vehicle)
    if (!subscription && dealId && !selectedCycle) {
      const { data: sub } = await serviceSupabase
        .from('subscriptions')
        .select(`
          id,
          status,
          commitment,
          currency,
          funded_amount,
          pack_generated_at,
          pack_sent_at,
          signed_at,
          funded_at,
          activated_at,
          created_at
        `)
        .eq('deal_id', dealId)
        .eq('investor_id', effectiveInvestorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      subscription = sub
    }

    // Fetch signature documents for this subscription
    if (subscription) {
      subscriptionDocuments = {
        nda: ndaDocumentSummary,
        subscription_pack: subscriptionPackDocumentsBySubscriptionId.get(subscription.id) || {
          status: 'not_started',
          signatories: [],
          unsigned_url: null,
          signed_url: null,
        },
        certificate: certificateDocumentsBySubscriptionId.get(subscription.id) || null,
      }
    }

    if (effectiveInvestorId && !subscriptionSubmission && !selectedCycle) {
      const { data: submission } = await serviceSupabase
        .from('deal_subscription_submissions')
        .select('id, status, submitted_at')
        .eq('deal_id', dealId)
        .eq('investor_id', effectiveInvestorId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      subscriptionSubmission = submission ?? null
    }

    // Get journey stages using RPC function
    const { data: journeyStages } = await serviceSupabase
      .rpc('get_investor_journey_stage', {
        p_deal_id: dealId,
        p_investor_id: effectiveInvestorId
      })

    // Get fee structures for the deal
    // PERSONA ACCESS RULES (per Fred's meeting requirements):
    // - Introducers: CANNOT see term sheet (fee structures)
    // - Lawyers: CANNOT see term sheet (fee structures)
    // - All others (investors, partners, arrangers, CPs): CAN see term sheet
    const isRestrictedFromTermSheet = membership?.role === 'introducer' || membership?.role === 'lawyer'

    let feeStructures: any[] = []
    if (!isRestrictedFromTermSheet) {
      if (selectedCycle?.term_sheet_id) {
        const selectedTermSheet = termSheetsById.get(selectedCycle.term_sheet_id)
        if (selectedTermSheet) {
          feeStructures = [selectedTermSheet]
        }
      } else if (membership?.term_sheet_id) {
        // Fetch ONLY the assigned term sheet - this ensures different investor classes
        // see their specific fee structure based on how they were dispatched
        const { data: assignedTermSheet } = await serviceSupabase
          .from('deal_fee_structures')
          .select('*')
          .eq('id', membership.term_sheet_id)
          .single()

        if (assignedTermSheet) {
          feeStructures = [assignedTermSheet]
        }
      }

	      // Only show a default published term sheet for a fresh/public opportunity view.
	      // Once an investor already has a membership or cycle, we should never silently
	      // swap in another term sheet because that can display the wrong economics.
	      if (feeStructures.length === 0 && !selectedCycle && !membership?.term_sheet_id) {
	        const { data: fallbackTermSheet } = await serviceSupabase
	          .from('deal_fee_structures')
	          .select('*')
          .eq('deal_id', dealId)
          .eq('status', 'published')
          .order('created_at', { ascending: true })
          .limit(1)

        feeStructures = fallbackTermSheet || []
      }
    }

    // Get FAQs for the deal
    const { data: faqs } = await serviceSupabase
      .from('deal_faqs')
      .select('*')
      .eq('deal_id', dealId)
      .order('display_order', { ascending: true })

    // Get all authorized signatories for the investor entity
    const { data: allSignatories } = await serviceSupabase
      .from('investor_members')
      .select('id')
      .eq('investor_id', effectiveInvestorId)
      .eq('is_active', true)
      .or(MEMBER_SIGNATORY_FILTER)

    // Check if ALL signatories have signed NDA for this deal (entity-level check)
    // Per Fred's requirement: ALL signatories must sign before ANY entity user gets data room access
    let allSignatoriesSignedNda = true
    if (allSignatories && allSignatories.length > 0) {
      const { data: ndaSignatures } = await serviceSupabase
        .from('signature_requests')
        .select('member_id')
        .eq('deal_id', dealId)
        .eq('investor_id', effectiveInvestorId)
        .eq('document_type', 'nda')
        .not('signature_timestamp', 'is', null)

      const signedMemberIds = new Set((ndaSignatures || []).map(sig => sig.member_id))
      allSignatoriesSignedNda = allSignatories.every(sig => signedMemberIds.has(sig.id))
    }

    // Get data room documents if investor has access
    // PERSONA ACCESS RULES (per Fred's meeting requirements):
    // - Introducers: NEVER get data room access
    // - Lawyers: NEVER get data room access
    // - Arrangers: AUTOMATIC access (no NDA required)
    // - All others (investors, partners, CPs): Access after NDA signed
    const isRestrictedFromDataRoom = membership?.role === 'introducer' || membership?.role === 'lawyer'
    const isArrangerWithAutoAccess = membership?.role === 'arranger'

    let dataRoomDocuments: any[] = []
    let hasDataRoomAccess = false

    if (isRestrictedFromDataRoom) {
      // Introducers and lawyers NEVER get data room access
      hasDataRoomAccess = false
    } else if (isArrangerWithAutoAccess) {
      // Arrangers get AUTOMATIC access - no NDA required (per Fred: "doesn't need to sign an NDA so it's automatic")
      hasDataRoomAccess = true
    } else {
      // Check if access was already legitimately granted (grandfathering)
      // This handles the case where new signatories are added AFTER NDA was signed
      // - Expiry check is preserved (7-day access period still enforced)
      // - Revocation check is preserved
      // - New investors still need ALL signatories to sign before first access
      const accessRecordValid = dataRoomAccess &&
        !dataRoomAccess.revoked_at &&
        (!dataRoomAccess.expires_at || new Date(dataRoomAccess.expires_at) > new Date())

      const accessAlreadyGranted = membership?.data_room_granted_at && accessRecordValid

      // Grant access if: already granted (grandfather) OR all current signatories have signed
      hasDataRoomAccess = accessAlreadyGranted || (allSignatoriesSignedNda && accessRecordValid)
    }

    if (hasDataRoomAccess) {
      const { data: docs } = await serviceSupabase
        .from('deal_data_room_documents')
        .select(`
          id,
          deal_id,
          file_name,
          file_key,
          folder,
          file_size_bytes,
          mime_type,
          document_notes,
          created_at,
          document_expires_at,
          is_featured,
          external_link
        `)
        .eq('deal_id', dealId)
        .eq('visible_to_investors', true)
        .is('replaced_by_id', null)
        .order('folder', { ascending: true })
        .order('file_name', { ascending: true })

      const now = new Date()
      dataRoomDocuments = (docs || [])
        .filter(doc => !doc.document_expires_at || new Date(doc.document_expires_at) > now)
        .map(doc => ({
          id: doc.id,
          file_name: doc.file_name || 'Document',
          file_type: doc.mime_type || 'application/octet-stream',
          file_size: doc.file_size_bytes ? Number(doc.file_size_bytes) : 0,
          category: doc.folder || 'General',
          description: doc.document_notes || null,
          uploaded_at: doc.created_at,
          is_featured: doc.is_featured || false,
          external_link: doc.external_link || null,
          file_key: doc.file_key || null
        }))
    }

    // Fetch featured documents separately — available without data room access
    // but still blocked for introducers/lawyers
    let featuredDocuments: any[] = []
    if (!isRestrictedFromDataRoom) {
      const { data: featuredDocs } = await serviceSupabase
        .from('deal_data_room_documents')
        .select(`
          id,
          file_name,
          file_key,
          folder,
          file_size_bytes,
          mime_type,
          document_notes,
          created_at,
          document_expires_at,
          is_featured,
          external_link
        `)
        .eq('deal_id', dealId)
        .eq('is_featured', true)
        .eq('visible_to_investors', true)
        .is('replaced_by_id', null)
        .order('file_name', { ascending: true })

      const now = new Date()
      featuredDocuments = (featuredDocs || [])
        .filter(doc => !doc.document_expires_at || new Date(doc.document_expires_at) > now)
        .map(doc => ({
          id: doc.id,
          file_name: doc.file_name || 'Document',
          file_type: doc.mime_type || 'application/octet-stream',
          file_size: doc.file_size_bytes ? Number(doc.file_size_bytes) : 0,
          category: doc.folder || 'General',
          description: doc.document_notes || null,
          uploaded_at: doc.created_at,
          is_featured: true,
          external_link: doc.external_link || null,
          file_key: doc.file_key || null
        }))
    }

    // Get investor's authorized signatories
    const { data: signatories } = await serviceSupabase
      .from('investor_members')
      .select('id, full_name, email, role, is_signatory')
      .eq('investor_id', effectiveInvestorId)
      .eq('is_active', true)
      .or(MEMBER_SIGNATORY_FILTER)

    // Get NDA signing link for the current user (if they are a signatory)
    let ndaSigningUrl: string | null = null
    if (effectiveInvestorId) {
      const { data: linkedMember } = await serviceSupabase
        .from('investor_members')
        .select('id')
        .eq('investor_id', effectiveInvestorId)
        .eq('linked_user_id', user.id)
        .eq('is_active', true)
        .or(MEMBER_SIGNATORY_FILTER)
        .maybeSingle()

      if (linkedMember?.id) {
        const { data: ndaRequest } = await serviceSupabase
          .from('signature_requests')
          .select('signing_token, token_expires_at, status')
          .eq('deal_id', dealId)
          .eq('investor_id', effectiveInvestorId)
          .eq('member_id', linkedMember.id)
          .eq('document_type', 'nda')
          .in('status', ['pending', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (ndaRequest?.signing_token && ndaRequest?.token_expires_at) {
          const expiresAt = new Date(ndaRequest.token_expires_at)
          if (expiresAt > new Date()) {
            ndaSigningUrl = `/sign/${ndaRequest.signing_token}`
          }
        }
      }
    }

    const primaryJourneySubscription = primaryJourneyCycle
      ? cycleSubscriptionsById.get(primaryJourneyCycle.id) || null
      : null
    const primaryJourneySignatureSummary = primaryJourneySubscription?.id
      ? subscriptionSignatureSummaryById.get(primaryJourneySubscription.id) || null
      : null
    const subPackComplete = subscriptionDocuments?.subscription_pack.status === 'complete'
    const primarySubPackComplete = primaryJourneySignatureSummary?.status === 'complete'

    // Calculate current journey stage
    // Use actual document completion for signed stage, not subscription.signed_at
    // which may be set prematurely in multi-signatory flows
    const currentStage = primaryJourneyCycle
      ? getCycleStage({
          ...primaryJourneyCycle,
          pack_generated_at: primaryJourneySubscription?.pack_generated_at || primaryJourneyCycle.pack_generated_at,
          pack_sent_at: primaryJourneySubscription?.pack_sent_at || primaryJourneyCycle.pack_sent_at,
          signed_at: (primarySubPackComplete ? primaryJourneySubscription?.signed_at : null) || primaryJourneyCycle.signed_at,
          funded_at: primaryJourneySubscription?.funded_at || primaryJourneyCycle.funded_at,
          activated_at: primaryJourneySubscription?.activated_at || primaryJourneyCycle.activated_at,
        })
      : (() => {
          if (subscription?.activated_at || subscription?.status === 'active') return 10
          if (subscription?.funded_at || subscription?.status === 'funded') return 9
          if (subPackComplete && subscription?.signed_at) return 8
          if (subscription?.pack_sent_at) return 7
          if (subscription?.pack_generated_at) return 6
          if (membership?.data_room_granted_at) return 5
          if (membership?.nda_signed_at) return 4
          if (membership?.interest_confirmed_at) return 3
          if (membership?.viewed_at) return 2
          if (membership?.dispatched_at) return 1
          return 0
        })()

    // Build the response
    const hasPendingSubmission = subscriptionSubmission?.status === 'pending_review'
    const canInvestWithMembershipRole =
      !membership?.role ||
      ['investor', 'partner_investor', 'introducer_investor', 'commercial_partner_investor', 'co_investor'].includes(membership.role)
    const canInvestInCurrentContext =
      canInvestWithMembershipRole ||
      (isProxyMode && membership?.role === 'commercial_partner_proxy')
    const selectedCycleIsLive = selectedCycle ? LIVE_CYCLE_STATUSES.includes(selectedCycle.status) : false
    const hasAnyLiveCycle = investmentCycles.some(cycle => LIVE_CYCLE_STATUSES.includes(cycle.status))
    const latestEligibleReinvestmentCycleId = !hasAnyLiveCycle
      ? investmentCycles.find(cycle => {
          if (!['funded', 'active'].includes(cycle.status)) return false
          const cycleTermSheet = termSheetsById.get(cycle.term_sheet_id) || null
          return cycleTermSheet?.status === 'published' && !isTermSheetClosedForInvestmentRounds(cycleTermSheet)
        })?.id || null
      : null

    const cycleCards = investmentCycles.map(cycle => {
      const cycleSubscription = cycleSubscriptionsById.get(cycle.id) || null
      const cycleSubmission = cycleSubmissionsById.get(cycle.id) || null
      const cycleTermSheet = termSheetsById.get(cycle.term_sheet_id) || null
      const signatureSummary = cycleSubscription?.id
        ? subscriptionSignatureSummaryById.get(cycleSubscription.id) || null
        : null
      const latestAmount =
        cycleSubscription?.commitment ??
        cycleSubmission?.payload_json?.amount ??
        cycleSubmission?.payload_json?.subscription_amount ??
        null
      const cycleStage = getCycleStage({
        ...cycle,
        pack_generated_at: cycleSubscription?.pack_generated_at || cycle.pack_generated_at,
        pack_sent_at: cycleSubscription?.pack_sent_at || cycle.pack_sent_at,
        signed_at: (signatureSummary?.status === 'complete' ? cycleSubscription?.signed_at : null) || cycle.signed_at,
        funded_at: cycleSubscription?.funded_at || cycle.funded_at,
        activated_at: cycleSubscription?.activated_at || cycle.activated_at,
      })
      const canContinue =
        isAccountApproved === true &&
        canInvestInCurrentContext &&
        !cycleSubscription &&
        cycleSubmission?.status !== 'pending_review' &&
        LIVE_CYCLE_STATUSES.includes(cycle.status) &&
        isDealRoundOpen &&
        !isTermSheetClosedForInvestmentRounds(cycleTermSheet)
      const canInvestMore =
        isDealRoundOpen &&
        isAccountApproved === true &&
        canInvestInCurrentContext &&
        ['funded', 'active'].includes(cycle.status) &&
        cycleTermSheet?.status === 'published' &&
        !isTermSheetClosedForInvestmentRounds(cycleTermSheet) &&
        cycle.id === latestEligibleReinvestmentCycleId
      const primaryAction =
        canContinue
          ? {
              type: 'continue_cycle' as const,
              label: 'Continue Subscription',
              cycle_id: cycle.id,
              term_sheet_id: cycle.term_sheet_id,
            }
          : canInvestMore
            ? {
                type: 'start_new_cycle' as const,
                label: 'Invest More',
                cycle_id: null,
                term_sheet_id: cycle.term_sheet_id,
              }
            : {
                type: 'none' as const,
                label: null,
                cycle_id: null,
                term_sheet_id: cycle.term_sheet_id,
              }

      return {
        id: cycle.id,
        sequence_number: cycle.sequence_number,
        status: cycle.status,
        stage: cycleStage,
        term_sheet_id: cycle.term_sheet_id,
        term_sheet: cycleTermSheet
          ? {
              id: cycleTermSheet.id,
              version: cycleTermSheet.version,
              status: cycleTermSheet.status,
              minimum_ticket: cycleTermSheet.minimum_ticket,
              maximum_ticket: cycleTermSheet.maximum_ticket,
              subscription_fee_percent: cycleTermSheet.subscription_fee_percent,
            }
          : null,
        latest_amount: latestAmount,
        submission: cycleSubmission
          ? {
              id: cycleSubmission.id,
              status: cycleSubmission.status,
              submitted_at: cycleSubmission.submitted_at,
            }
          : null,
        subscription: cycleSubscription
          ? {
              id: cycleSubscription.id,
              status: cycleSubscription.status,
              commitment: cycleSubscription.commitment,
              currency: cycleSubscription.currency || deal.currency || 'USD',
              funded_amount: cycleSubscription.funded_amount,
              pack_generated_at: cycleSubscription.pack_generated_at,
              pack_sent_at: cycleSubscription.pack_sent_at,
              signed_at: cycleSubscription.signed_at,
              funded_at: cycleSubscription.funded_at,
              activated_at: cycleSubscription.activated_at,
            }
          : null,
        can_continue: canContinue,
        can_invest_more: canInvestMore,
        primary_action: primaryAction,
      }
    })

    const subscriptionEntries = cycleCards
      .map(cycle => {
        if (!cycle.subscription && !cycle.submission) return null

        const signatureSummary = cycle.subscription?.id
          ? subscriptionSignatureSummaryById.get(cycle.subscription.id) || null
          : null
        const isSigned = signatureSummary?.status === 'complete'
        const isFunded = !!cycle.subscription?.funded_at || cycle.status === 'funded' || cycle.status === 'active'
        const isActive = !!cycle.subscription?.activated_at || cycle.status === 'active'

        let statusKey: 'pending_review' | 'awaiting_signature' | 'awaiting_funding' | 'funded' | 'active' = 'pending_review'
        let statusLabel = 'Pending Review'

        if (isActive) {
          statusKey = 'active'
          statusLabel = 'Active Investment'
        } else if (isFunded) {
          statusKey = 'funded'
          statusLabel = 'Funded'
        } else if (isSigned) {
          statusKey = 'awaiting_funding'
          statusLabel = 'Awaiting Funding'
        } else if (cycle.subscription) {
          statusKey = 'awaiting_signature'
          statusLabel = 'Awaiting Signature'
        }

        return {
          id: cycle.id,
          sequence_number: cycle.sequence_number,
          amount: cycle.latest_amount,
          currency: cycle.subscription?.currency || deal.currency || 'USD',
          funded_amount: cycle.subscription?.funded_amount || null,
          submitted_at: cycle.submission?.submitted_at || null,
          created_at: cycle.subscription?.pack_generated_at || cycle.submission?.submitted_at || null,
          status: statusKey,
          status_label: statusLabel,
          is_reinvestment: cycle.sequence_number > 1,
          milestones: {
            confirmed: !!cycle.submission || !!cycle.subscription || cycle.stage >= 4,
            signed: isSigned || isFunded || isActive,
            funded: isFunded || isActive,
            active: isActive,
          },
          documents: {
            nda: ndaDocumentSummary,
            subscription_pack: cycle.subscription?.id
              ? subscriptionPackDocumentsBySubscriptionId.get(cycle.subscription.id) || {
                  status: 'not_started',
                  signatories: [],
                  unsigned_url: null,
                  signed_url: null,
                }
              : {
                  status: 'not_started',
                  signatories: [],
                  unsigned_url: null,
                  signed_url: null,
                },
            certificate: cycle.subscription?.id
              ? certificateDocumentsBySubscriptionId.get(cycle.subscription.id) || null
              : null,
            signed_pack_available: !!signatureSummary?.signedPath,
            signed_pack_path: signatureSummary?.signedPath || null,
          },
          can_invest_more: !!cycle.can_invest_more,
        }
      })
      .filter(Boolean)

    const latestReinvestmentCycle = [...chronologicalCycles]
      .reverse()
      .find(cycle => {
        if (!primaryJourneyCycle || cycle.id === primaryJourneyCycle.id) return false
        const cycleSubscription = cycleSubscriptionsById.get(cycle.id) || null
        const cycleSignatureSummary = cycleSubscription?.id
          ? subscriptionSignatureSummaryById.get(cycleSubscription.id) || null
          : null
        const cycleStage = getCycleStage({
          ...cycle,
          pack_generated_at: cycleSubscription?.pack_generated_at || cycle.pack_generated_at,
          pack_sent_at: cycleSubscription?.pack_sent_at || cycle.pack_sent_at,
          signed_at: (cycleSignatureSummary?.status === 'complete' ? cycleSubscription?.signed_at : null) || cycle.signed_at,
          funded_at: cycleSubscription?.funded_at || cycle.funded_at,
          activated_at: cycleSubscription?.activated_at || cycle.activated_at,
        })
        return cycleStage >= 4
      }) || null

    const latestReinvestmentSubscription = latestReinvestmentCycle
      ? cycleSubscriptionsById.get(latestReinvestmentCycle.id) || null
      : null
    const latestReinvestmentSignatureSummary = latestReinvestmentSubscription?.id
      ? subscriptionSignatureSummaryById.get(latestReinvestmentSubscription.id) || null
      : null
    const reinvestmentBranch = latestReinvestmentCycle && primaryJourneyCycle && ['funded', 'active'].includes(primaryJourneyCycle.status)
      ? {
          confirmed_at:
            latestReinvestmentCycle.submission_pending_at ||
            latestReinvestmentCycle.approved_at ||
            cycleSubmissionsById.get(latestReinvestmentCycle.id)?.submitted_at ||
            null,
          signed_at:
            (latestReinvestmentSignatureSummary?.status === 'complete'
              ? latestReinvestmentSubscription?.signed_at
              : null) || latestReinvestmentCycle.signed_at || null,
          funded_at:
            latestReinvestmentSubscription?.funded_at ||
            latestReinvestmentCycle.funded_at ||
            latestReinvestmentCycle.activated_at ||
            null,
        }
      : null

    const opportunity = {
      id: deal.id,
      name: deal.name,
      description: deal.description,
      investment_thesis: deal.investment_thesis,
      status: deal.status,
      deal_type: deal.deal_type,
      currency: deal.currency || 'USD',
      minimum_investment: deal.minimum_investment,
      maximum_investment: deal.maximum_investment,
      target_amount: deal.target_amount,
      raised_amount: deal.raised_amount,
      offer_unit_price: deal.offer_unit_price,
      open_at: deal.open_at,
      close_at: deal.close_at,
      company_name: deal.company_name,
      company_logo_url: deal.company_logo_url,
      company_website: deal.company_website,
      sector: deal.sector,
      stage: deal.stage,
      location: deal.location,
      stock_type: deal.stock_type,
      deal_round: deal.deal_round,
      vehicle: vehicle,
      account_approval_status: investorAccountApprovalStatus,
      kyc_status: investorKycStatus,
      is_account_approved: isAccountApproved,

      // Membership status
      has_membership: !!membership,
      membership: membership ? {
        role: membership.role,
        dispatched_at: membership.dispatched_at,
        viewed_at: membership.viewed_at,
        interest_confirmed_at: membership.interest_confirmed_at,
        nda_signed_at: membership.nda_signed_at,
        data_room_granted_at: membership.data_room_granted_at
      } : null,

      // Journey progress
      journey: {
        current_stage: currentStage,
        stages: journeyStages || [],
        summary: {
          received: primaryJourneyCycle?.dispatched_at || selectedCycle?.dispatched_at || membership?.dispatched_at || null,
          viewed: primaryJourneyCycle?.viewed_at || selectedCycle?.viewed_at || membership?.viewed_at || null,
          interest_confirmed: primaryJourneyCycle?.interest_confirmed_at || selectedCycle?.interest_confirmed_at || membership?.interest_confirmed_at || null,
          nda_signed: membership?.nda_signed_at || null,
          data_room_access: membership?.data_room_granted_at || null,
          pack_generated: primaryJourneySubscription?.pack_generated_at || primaryJourneyCycle?.pack_generated_at || null,
          pack_sent: primaryJourneySubscription?.pack_sent_at || primaryJourneyCycle?.pack_sent_at || null,
          signed: (primarySubPackComplete ? primaryJourneySubscription?.signed_at : null) || primaryJourneyCycle?.signed_at || null,
          funded: primaryJourneySubscription?.funded_at || primaryJourneyCycle?.funded_at || null,
          active: primaryJourneySubscription?.activated_at || primaryJourneyCycle?.activated_at || null
        }
      },

      // Data room access
      data_room: {
        has_access: hasDataRoomAccess,
        access_details: dataRoomAccess ? {
          granted_at: dataRoomAccess.granted_at,
          expires_at: dataRoomAccess.expires_at,
          auto_granted: dataRoomAccess.auto_granted
        } : null,
        documents: dataRoomDocuments,
        featured_documents: featuredDocuments,
        requires_nda: !allSignatoriesSignedNda,
        nda_status: {
          all_signed: allSignatoriesSignedNda,
          total_signatories: allSignatories?.length || 0,
          message: allSignatories && allSignatories.length > 0 && !allSignatoriesSignedNda
            ? `All ${allSignatories.length} authorized signatories must sign the NDA to unlock the data room`
            : null
        }
      },

      // Subscription status
      // Use actual document completion (all signatories signed) instead of trusting
      // subscriptions.signed_at which may be set prematurely in multi-signatory flows
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        commitment: subscription.commitment,
        currency: subscription.currency || deal.currency || 'USD',
        funded_amount: subscription.funded_amount,
        pack_generated_at: subscription.pack_generated_at,
        pack_sent_at: subscription.pack_sent_at,
        signed_at: subscriptionDocuments?.subscription_pack.status === 'complete'
          ? subscription.signed_at
          : null,
        funded_at: subscription.funded_at,
        activated_at: subscription.activated_at,
        created_at: subscription.created_at,
        is_signed: subscriptionDocuments?.subscription_pack.status === 'complete',
        is_funded: !!subscription.funded_at || subscription.status === 'funded' || subscription.status === 'active',
        is_active: !!subscription.activated_at || subscription.status === 'active',
        documents: subscriptionDocuments
      } : null,
      subscription_submission: subscriptionSubmission,
      active_cycle_id: selectedCycle?.id || null,
      cycles: cycleCards,
      subscription_entries: subscriptionEntries,
      reinvestment_branch: reinvestmentBranch,

      // Fee structures
      fee_structures: feeStructures || [],

      // FAQs
      faqs: faqs || [],

      // Signatories for NDA/subscription signing
      signatories: signatories || [],
      nda_signing_url: ndaSigningUrl,

      // Computed flags for UI
      // Only show express interest for users with an investor persona
      can_express_interest: effectiveInvestorId !== null && isAccountApproved === true && !membership?.interest_confirmed_at,
      can_sign_nda: isAccountApproved === true && !!ndaSigningUrl && !membership?.nda_signed_at,
      can_access_data_room: hasDataRoomAccess,
      // SECURITY FIX: Only allow subscription for roles that permit investing
      // commercial_partner_proxy has its own endpoint at /api/commercial-partners/proxy-subscribe
      // Must have an investor profile (effectiveInvestorId) to be able to subscribe
      can_subscribe:
        effectiveInvestorId !== null &&
        isAccountApproved === true &&
        !subscription &&
        !hasPendingSubmission &&
        isDealRoundOpen &&
        canInvestInCurrentContext &&
        (!selectedCycle || selectedCycleIsLive),
      // Indicate if user is tracking-only (cannot invest)
      is_tracking_only: !!membership?.role && !['investor', 'partner_investor', 'introducer_investor', 'commercial_partner_investor', 'co_investor'].includes(membership.role),
      can_sign_subscription: subscription?.pack_sent_at && !subscription?.signed_at,

      // MODE 2: Proxy mode info for commercial partners viewing on behalf of clients
      proxy_mode: isProxyMode ? {
        is_proxy: true,
        client_name: proxyClientName,
        client_investor_id: clientInvestorId
      } : null,

      // Indicate if user can use proxy mode (has commercial_partner_proxy role)
      can_use_proxy_mode: membership?.role === 'commercial_partner_proxy',

      // PERSONA-BASED ACCESS CONTROLS (per Fred's meeting requirements)
      // These flags tell the frontend which sections to hide/show
      access_controls: {
        // Introducers and lawyers cannot see the term sheet
        can_view_term_sheet: !isRestrictedFromTermSheet,
        // Introducers and lawyers never get data room access
        can_view_data_room: !isRestrictedFromDataRoom,
        // Arrangers get automatic access without NDA
        has_auto_data_room_access: isArrangerWithAutoAccess,
        // Reason for restrictions (for UI messaging)
        restriction_reason: isRestrictedFromTermSheet || isRestrictedFromDataRoom
          ? `As ${membership?.role === 'introducer' ? 'an introducer' : 'a lawyer'}, you do not have access to ${isRestrictedFromTermSheet && isRestrictedFromDataRoom ? 'the term sheet or data room' : isRestrictedFromTermSheet ? 'the term sheet' : 'the data room'} for this deal.`
          : null
      }
    }

    return NextResponse.json({ opportunity })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/opportunities/:id:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/investors/me/opportunities/:id
 * Record view or express interest in an opportunity
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const action = body.action as string
    const cycleId = typeof body.cycle_id === 'string' ? body.cycle_id : null

    // Validate action
    const validActions = ['view', 'express_interest']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get investor ID
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLinks[0].investor_id

    // Check if membership exists (use user_id for PK)
    const { data: existingMembership } = await serviceSupabase
      .from('deal_memberships')
      .select('*')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .single()

    if (action === 'view') {
      let cycleToMark = null as { id: string; viewed_at: string | null } | null

      if (cycleId) {
        const { data: explicitCycle } = await serviceSupabase
          .from('deal_investment_cycles' as any)
          .select('id, viewed_at')
          .eq('id', cycleId)
          .eq('deal_id', dealId)
          .eq('investor_id', investorId)
          .maybeSingle()

        cycleToMark = explicitCycle ?? null
      } else {
        const latestCycle = await getLatestActiveOrRecentCycle(serviceSupabase, dealId, investorId)
        cycleToMark = latestCycle ? { id: latestCycle.id, viewed_at: latestCycle.viewed_at } : null
      }

      if (existingMembership) {
        // Update viewed_at if not already set
        if (!existingMembership.viewed_at) {
          await serviceSupabase
            .from('deal_memberships')
            .update({ viewed_at: new Date().toISOString() })
            .eq('deal_id', dealId)
            .eq('user_id', user.id)
        }
      } else {
        // Create new membership with viewed_at (for direct view without dispatch)
        await serviceSupabase
          .from('deal_memberships')
          .insert({
            deal_id: dealId,
            user_id: user.id,
            investor_id: investorId,
            role: 'investor',
            viewed_at: new Date().toISOString()
          })
      }

      if (cycleToMark && !cycleToMark.viewed_at) {
        await updateDealInvestmentCycleProgress({
          supabase: serviceSupabase,
          cycleId: cycleToMark.id,
          status: 'viewed',
          timestamps: {
            viewed_at: new Date().toISOString(),
          },
        })
      }

      return NextResponse.json({ success: true, action: 'viewed' })
    }

    if (action === 'express_interest') {
      if (!existingMembership) {
        // Create membership with viewed_at only — interest_confirmed_at should only
        // be set when the investor submits a subscription (Subscribe Directly flow)
        await serviceSupabase
          .from('deal_memberships')
          .insert({
            deal_id: dealId,
            user_id: user.id,
            investor_id: investorId,
            role: 'investor',
            viewed_at: new Date().toISOString()
          })
      } else if (!existingMembership.viewed_at) {
        // Ensure viewed_at is set
        await serviceSupabase
          .from('deal_memberships')
          .update({
            viewed_at: new Date().toISOString()
          })
          .eq('deal_id', dealId)
          .eq('user_id', user.id)
      }

      return NextResponse.json({ success: true, action: 'interest_expressed' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Unexpected error in POST /api/investors/me/opportunities/:id:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
