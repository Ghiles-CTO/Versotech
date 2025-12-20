import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/investors/me/opportunities/:id
 * Fetch a single opportunity with full details, journey stages, and data room access
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor ID for this user
    const { data: investorLinks, error: linksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (linksError || !investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLinks[0].investor_id

    // Get investor's membership for this deal first (security check)
    const { data: membership } = await serviceSupabase
      .from('deal_memberships')
      .select('*')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .single()

    const effectiveInvestorId = membership?.investor_id || investorId

    // Check if investor has access to this deal (must be a member or deal is public)
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select(`
        *,
        vehicles (
          id,
          name,
          type,
          inception_date,
          target_size,
          currency
        )
      `)
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const isDealOpen = deal.status === 'open' || deal.status === 'allocation_pending'

    // Security: Only allow access if membership exists or deal is explicitly public
    if (!membership && !isDealOpen) {
      return NextResponse.json({ error: 'You do not have access to this opportunity' }, { status: 403 })
    }

    // Get data room access
    const { data: dataRoomAccess } = await serviceSupabase
      .from('deal_data_room_access')
      .select('*')
      .eq('deal_id', dealId)
      .eq('investor_id', effectiveInvestorId)
      .is('revoked_at', null)
      .order('granted_at', { ascending: false })
      .limit(1)
      .single()

    // Get subscription if exists
    const vehicleId = deal.vehicle_id
    let subscription = null
    if (vehicleId) {
      const { data: sub } = await serviceSupabase
        .from('subscriptions')
        .select(`
          id,
          status,
          commitment,
          funded_amount,
          pack_generated_at,
          pack_sent_at,
          signed_at,
          funded_at,
          activated_at,
          created_at
        `)
        .eq('vehicle_id', vehicleId)
        .eq('investor_id', effectiveInvestorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      subscription = sub
    }

    // Get journey stages using RPC function
    const { data: journeyStages } = await serviceSupabase
      .rpc('get_investor_journey_stage', {
        p_deal_id: dealId,
        p_investor_id: effectiveInvestorId
      })

    // Get fee structures for the deal
    const { data: feeStructures } = await serviceSupabase
      .from('deal_fee_structures')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: true })

    // Get FAQs for the deal
    const { data: faqs } = await serviceSupabase
      .from('deal_faqs')
      .select('*')
      .eq('deal_id', dealId)
      .order('display_order', { ascending: true })

    // Get data room documents if investor has access
    let dataRoomDocuments: any[] = []
    const hasDataRoomAccess = dataRoomAccess && !dataRoomAccess.revoked_at &&
      (!dataRoomAccess.expires_at || new Date(dataRoomAccess.expires_at) > new Date())

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
          document_expires_at
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
          uploaded_at: doc.created_at
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
      vehicle: deal.vehicles,

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
        requires_nda: !membership?.nda_signed_at
      },

      // Subscription status
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        commitment: subscription.commitment,
        funded_amount: subscription.funded_amount,
        pack_generated_at: subscription.pack_generated_at,
        pack_sent_at: subscription.pack_sent_at,
        signed_at: subscription.signed_at,
        funded_at: subscription.funded_at,
        activated_at: subscription.activated_at,
        is_signed: !!subscription.signed_at,
        is_funded: !!subscription.funded_at,
        is_active: !!subscription.activated_at
      } : null,

      // Fee structures
      fee_structures: feeStructures || [],

      // FAQs
      faqs: faqs || [],

      // Signatories for NDA/subscription signing
      signatories: signatories || [],

      // Computed flags for UI (Direct subscribe allows skipping NDA)
      can_express_interest: !membership?.interest_confirmed_at,
      can_sign_nda: !!membership?.interest_confirmed_at && !membership?.nda_signed_at,
      can_access_data_room: hasDataRoomAccess,
      can_subscribe: !subscription && isDealOpen,
      can_sign_subscription: subscription?.pack_sent_at && !subscription?.signed_at
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
