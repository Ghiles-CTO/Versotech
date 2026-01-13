import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
interface RouteParams {
  params: Promise<{ id: string }>
}

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
        .select('id, name, type, formation_date, currency')
        .eq('id', deal.vehicle_id)
        .single()
      vehicle = v
    }

    const isDealOpen = deal.status === 'open' || deal.status === 'allocation_pending'

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

    // Get subscription if exists (use maybeSingle as subscription might not exist)
    const vehicleId = deal.vehicle_id
    let subscription = null
    let subscriptionSubmission: { id: string; status: string; submitted_at: string | null } | null = null
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
    if (dealId) {
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

      // Fetch signature documents for this subscription
      if (sub) {
        // Get NDA signature requests for this deal/investor
        const { data: ndaSignatures } = await serviceSupabase
          .from('signature_requests')
          .select('id, signer_name, signer_email, status, signature_timestamp, unsigned_pdf_path, signed_pdf_path')
          .eq('deal_id', dealId)
          .eq('investor_id', effectiveInvestorId)
          .eq('document_type', 'nda')
          .order('created_at', { ascending: true })

        // Get subscription pack signature requests
        const { data: subPackSignatures } = await serviceSupabase
          .from('signature_requests')
          .select('id, signer_name, signer_email, status, signature_timestamp, unsigned_pdf_path, signed_pdf_path')
          .eq('subscription_id', sub.id)
          .eq('document_type', 'subscription')
          .order('created_at', { ascending: true })

        // Calculate NDA status
        const ndaSigs = ndaSignatures || []
        const ndaAllSigned = ndaSigs.length > 0 && ndaSigs.every(s => s.status === 'signed')
        const ndaSomeSigned = ndaSigs.some(s => s.status === 'signed')
        const ndaStatus = ndaAllSigned ? 'complete' : ndaSomeSigned ? 'partial' : ndaSigs.length > 0 ? 'pending' : 'not_started'

        // Calculate subscription pack status
        const subSigs = subPackSignatures || []
        const subAllSigned = subSigs.length > 0 && subSigs.every(s => s.status === 'signed')
        const subSomeSigned = subSigs.some(s => s.status === 'signed')
        const subStatus = subAllSigned ? 'complete' : subSomeSigned ? 'partial' : subSigs.length > 0 ? 'pending' : 'not_started'

        // Get the first available PDF paths (they're the same for all signatories of same doc type)
        const ndaUnsignedPath = ndaSigs.find(s => s.unsigned_pdf_path)?.unsigned_pdf_path || null
        const ndaSignedPath = ndaAllSigned ? ndaSigs.find(s => s.signed_pdf_path)?.signed_pdf_path : null
        const subUnsignedPath = subSigs.find(s => s.unsigned_pdf_path)?.unsigned_pdf_path || null
        const subSignedPath = subAllSigned ? subSigs.find(s => s.signed_pdf_path)?.signed_pdf_path : null

        subscriptionDocuments = {
          nda: {
            status: ndaStatus,
            signatories: ndaSigs.map(s => ({
              name: s.signer_name,
              email: s.signer_email,
              status: s.status,
              signed_at: s.signature_timestamp
            })),
            unsigned_url: ndaUnsignedPath,
            signed_url: ndaSignedPath
          },
          subscription_pack: {
            status: subStatus,
            signatories: subSigs.map(s => ({
              name: s.signer_name,
              email: s.signer_email,
              status: s.status,
              signed_at: s.signature_timestamp
            })),
            unsigned_url: subUnsignedPath,
            signed_url: subSignedPath
          },
          // Certificate - lookup from documents table if subscription is activated
          certificate: await (async () => {
            if (!sub.activated_at) return null

            // Check for actual certificate document
            const { data: certDoc } = await serviceSupabase
              .from('documents')
              .select('id, file_key')
              .eq('subscription_id', sub.id)
              .eq('type', 'certificate')
              .maybeSingle()

            if (certDoc) {
              return {
                status: 'available',
                document_id: certDoc.id,
                url: certDoc.file_key
              }
            }

            // Certificate not yet generated
            return {
              status: 'generating',
              document_id: null,
              url: null
            }
          })()
        }
      }
    }

    if (effectiveInvestorId) {
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
      // Check if investor has an assigned term sheet (from dispatch)
      if (membership?.term_sheet_id) {
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

      // Fallback: If no assigned term sheet or it wasn't found, get first published
      // This handles backward compatibility for existing memberships
      if (feeStructures.length === 0) {
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
      .eq('role', 'authorized_signatory')
      .eq('is_active', true)

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
      // Standard entity-level NDA check: ALL signatories must have signed before granting data room access
      hasDataRoomAccess = allSignatoriesSignedNda &&
        dataRoomAccess && !dataRoomAccess.revoked_at &&
        (!dataRoomAccess.expires_at || new Date(dataRoomAccess.expires_at) > new Date())
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

    // Get investor's authorized signatories
    const { data: signatories } = await serviceSupabase
      .from('investor_members')
      .select('id, full_name, email, role')
      .eq('investor_id', effectiveInvestorId)
      .eq('role', 'authorized_signatory')
      .eq('is_active', true)

    // Calculate current journey stage
    let currentStage = 0
    if (subscription?.activated_at) currentStage = 10
    else if (subscription?.funded_at) currentStage = 9
    else if (subscription?.signed_at) currentStage = 8
    else if (subscription?.pack_sent_at) currentStage = 7
    else if (subscription?.pack_generated_at) currentStage = 6
    else if (membership?.data_room_granted_at) currentStage = 5
    else if (membership?.nda_signed_at) currentStage = 4
    else if (membership?.interest_confirmed_at) currentStage = 3
    else if (membership?.viewed_at) currentStage = 2
    else if (membership?.dispatched_at) currentStage = 1

    // Build the response
    const hasPendingSubmission = subscriptionSubmission?.status === 'pending_review'

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
          received: membership?.dispatched_at || null,
          viewed: membership?.viewed_at || null,
          interest_confirmed: membership?.interest_confirmed_at || null,
          nda_signed: membership?.nda_signed_at || null,
          data_room_access: membership?.data_room_granted_at || null,
          pack_generated: subscription?.pack_generated_at || null,
          pack_sent: subscription?.pack_sent_at || null,
          signed: subscription?.signed_at || null,
          funded: subscription?.funded_at || null,
          active: subscription?.activated_at || null
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
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        commitment: subscription.commitment,
        currency: subscription.currency || deal.currency || 'USD',
        funded_amount: subscription.funded_amount,
        pack_generated_at: subscription.pack_generated_at,
        pack_sent_at: subscription.pack_sent_at,
        signed_at: subscription.signed_at,
        funded_at: subscription.funded_at,
        activated_at: subscription.activated_at,
        created_at: subscription.created_at,
        is_signed: !!subscription.signed_at,
        is_funded: !!subscription.funded_at,
        is_active: !!subscription.activated_at,
        documents: subscriptionDocuments
      } : null,
      subscription_submission: subscriptionSubmission,

      // Fee structures
      fee_structures: feeStructures || [],

      // FAQs
      faqs: faqs || [],

      // Signatories for NDA/subscription signing
      signatories: signatories || [],

      // Computed flags for UI
      // Only show express interest for users with an investor persona
      can_express_interest: effectiveInvestorId !== null && !membership?.interest_confirmed_at,
      can_sign_nda: !!membership?.interest_confirmed_at && !membership?.nda_signed_at,
      can_access_data_room: hasDataRoomAccess,
      // SECURITY FIX: Only allow subscription for roles that permit investing
      // commercial_partner_proxy has its own endpoint at /api/commercial-partners/proxy-subscribe
      // Must have an investor profile (effectiveInvestorId) to be able to subscribe
      can_subscribe: effectiveInvestorId !== null && !subscription && !hasPendingSubmission && isDealOpen && (
        !membership?.role || // Public deal without membership (user still needs investor profile - checked above)
        ['investor', 'partner_investor', 'introducer_investor', 'commercial_partner_investor', 'co_investor'].includes(membership.role)
      ),
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

      return NextResponse.json({ success: true, action: 'viewed' })
    }

    if (action === 'express_interest') {
      if (!existingMembership) {
        // Create membership and express interest in one go
        await serviceSupabase
          .from('deal_memberships')
          .insert({
            deal_id: dealId,
            user_id: user.id,
            investor_id: investorId,
            role: 'investor',
            viewed_at: new Date().toISOString(),
            interest_confirmed_at: new Date().toISOString()
          })
      } else if (!existingMembership.interest_confirmed_at) {
        // Update existing membership
        await serviceSupabase
          .from('deal_memberships')
          .update({
            interest_confirmed_at: new Date().toISOString(),
            viewed_at: existingMembership.viewed_at || new Date().toISOString()
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
