import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  assertPublishedDealTermSheet,
  getOrCreateSubmissionCycle,
  type SubmissionCycleIntent,
  updateDealInvestmentCycleProgress,
} from '@/lib/deals/investment-cycles'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const proxySubscribeSchema = z.object({
  deal_id: z.string().uuid(),
  client_investor_id: z.string().uuid(),
  commitment: z.number().positive(),
  stock_type: z.enum(['common', 'preferred', 'convertible', 'warrant', 'bond', 'note', 'other']).optional().default('common'),
  notes: z.string().optional(),
  intent: z.enum(['continue_cycle', 'start_new_cycle']).optional().nullable(),
  cycle_id: z.string().uuid().optional().nullable(),
  term_sheet_id: z.string().uuid().optional().nullable(),
  proxy_authorization_doc_id: z.string().uuid().optional() // Optional reference to authorization document
})

/**
 * POST /api/commercial-partners/proxy-subscribe
 * Commercial Partner submits a subscription on behalf of a client investor
 *
 * This is "MODE 2" - Commercial Partner acts as proxy for their client
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a commercial partner with proxy capability
    const { data: cpLinks } = await serviceSupabase
      .from('commercial_partner_users')
      .select(`
        commercial_partner_id,
        can_execute_for_clients,
        role,
        commercial_partners (
          id,
          name,
          legal_name,
          status,
          cp_type
        )
      `)
      .eq('user_id', user.id)
      .eq('can_execute_for_clients', true)

    if (!cpLinks || cpLinks.length === 0) {
      return NextResponse.json({
        error: 'Forbidden',
        message: 'You are not authorized to execute subscriptions for clients. Contact your administrator to enable proxy capability.'
      }, { status: 403 })
    }

    const cpLink = cpLinks[0]
    const commercialPartner = cpLink.commercial_partners as any

    if (commercialPartner?.status !== 'active') {
      return NextResponse.json({
        error: 'Commercial partner not active',
        message: 'Your commercial partner account is not active.'
      }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = proxySubscribeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const {
      deal_id,
      client_investor_id,
      commitment,
      stock_type,
      notes,
      intent,
      cycle_id,
      term_sheet_id,
      proxy_authorization_doc_id,
    } = validation.data

    // Verify deal exists and is open
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select('id, name, status, vehicle_id, currency')
      .eq('id', deal_id)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    if (deal.status !== 'open' && deal.status !== 'allocation_pending') {
      return NextResponse.json({
        error: 'Deal not open for subscriptions',
        message: `Deal is currently ${deal.status}`
      }, { status: 400 })
    }

    // SECURITY: Verify the commercial partner user has been dispatched to this deal
    // This prevents CPs from subscribing to deals they don't have access to
    // NOTE: deal_memberships uses composite key (deal_id, user_id), not a separate id column
    const { data: cpDealMembership } = await serviceSupabase
      .from('deal_memberships')
      .select('deal_id, user_id, role, dispatched_at')
      .eq('deal_id', deal_id)
      .eq('user_id', user.id)
      .in('role', ['commercial_partner_investor', 'commercial_partner_proxy'])
      .maybeSingle()

    if (!cpDealMembership) {
      return NextResponse.json({
        error: 'Not authorized for this deal',
        message: 'You have not been dispatched to this deal. Contact your relationship manager for access.'
      }, { status: 403 })
    }

    // Verify client investor exists
    const { data: clientInvestor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('id, legal_name, type, kyc_status')
      .eq('id', client_investor_id)
      .single()

    if (investorError || !clientInvestor) {
      return NextResponse.json({ error: 'Client investor not found' }, { status: 404 })
    }

    const { data: clientInvestorUser } = await serviceSupabase
      .from('investor_users')
      .select('user_id')
      .eq('investor_id', client_investor_id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    // Verify client investor has completed KYC
    if (clientInvestor.kyc_status !== 'approved' && clientInvestor.kyc_status !== 'verified') {
      return NextResponse.json({
        error: 'Client KYC not complete',
        message: 'Client investor must complete KYC before subscribing.',
        kyc_status: clientInvestor.kyc_status
      }, { status: 400 })
    }

    const resolvedIntent: SubmissionCycleIntent | null =
      intent || (cycle_id ? 'continue_cycle' : term_sheet_id ? 'start_new_cycle' : null)

    if (!resolvedIntent) {
      return NextResponse.json({
        error: 'Subscription intent is required',
        message: 'Specify whether this proxy action is continuing a round or starting a new one.'
      }, { status: 400 })
    }

    if (resolvedIntent === 'continue_cycle' && !cycle_id) {
      return NextResponse.json({
        error: 'cycle_id is required',
        message: 'Continuing a proxy round requires an existing cycle.'
      }, { status: 400 })
    }

    let effectiveTermSheetId = term_sheet_id || null

    if (resolvedIntent === 'continue_cycle' && cycle_id) {
      const { data: selectedCycle } = await serviceSupabase
        .from('deal_investment_cycles' as any)
        .select('term_sheet_id')
        .eq('id', cycle_id)
        .maybeSingle()
      effectiveTermSheetId = selectedCycle?.term_sheet_id || null
    }

    if (resolvedIntent === 'start_new_cycle' && !effectiveTermSheetId) {
      return NextResponse.json({
        error: 'No term sheet assigned',
        message: 'Starting a proxy round requires an explicit published term sheet.'
      }, { status: 400 })
    }

    if (resolvedIntent === 'start_new_cycle' && effectiveTermSheetId) {
      try {
        await assertPublishedDealTermSheet(serviceSupabase, deal_id, effectiveTermSheetId)
      } catch (termSheetError) {
        return NextResponse.json({
          error: 'Invalid term sheet',
          message: termSheetError instanceof Error
            ? termSheetError.message
            : 'Starting a proxy round requires a published term sheet for this deal.'
        }, { status: 400 })
      }
    }

    const cycle = await getOrCreateSubmissionCycle(serviceSupabase, {
      dealId: deal_id,
      investorId: client_investor_id,
      userId: clientInvestorUser?.user_id || user.id,
      role: 'commercial_partner_investor',
      cycleId: cycle_id || null,
      termSheetId: effectiveTermSheetId,
      createdBy: user.id,
      referredByEntityId: cpLink.commercial_partner_id,
      referredByEntityType: 'commercial_partner',
      intent: resolvedIntent,
    })

    const now = new Date().toISOString()
    const { data: submission, error: subError } = await serviceSupabase
      .from('deal_subscription_submissions')
      .insert({
        deal_id,
        investor_id: client_investor_id,
        cycle_id: cycle.id,
        term_sheet_id: cycle.term_sheet_id,
        payload_json: {
          amount: commitment,
          currency: deal.currency || 'USD',
          bank_confirmation: true,
          notes: notes || null,
          proxy_submitted: true,
          proxy_user_id: user.id,
          proxy_commercial_partner_id: cpLink.commercial_partner_id,
          proxy_authorization_doc_id: proxy_authorization_doc_id || null,
          stock_type,
        },
        status: 'pending_review',
        created_by: user.id,
        subscription_type: 'personal',
      })
      .select()
      .single()

    if (subError) {
      console.error('Error creating proxy subscription:', subError)
      return NextResponse.json({ error: 'Failed to create subscription request' }, { status: 500 })
    }

    try {
      await updateDealInvestmentCycleProgress({
        supabase: serviceSupabase,
        cycleId: cycle.id,
        status: 'submission_pending_review',
        timestamps: {
          viewed_at: cycle.viewed_at || now,
          interest_confirmed_at: cycle.interest_confirmed_at || now,
          submission_pending_at: now,
        },
      })
    } catch (cycleUpdateError) {
      console.error('Failed to update proxy cycle after submission creation:', cycleUpdateError)
    }

    // Log audit event
    await serviceSupabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'proxy_subscription_created',
      entity_type: 'subscription_submission',
      entity_id: submission.id,
      details: {
        deal_id,
        deal_name: deal.name,
        client_investor_id,
        client_name: clientInvestor.legal_name,
        commitment,
        commercial_partner_id: cpLink.commercial_partner_id,
        commercial_partner_name: commercialPartner?.name,
        proxy_authorization_doc_id
      },
      created_at: now
    })

    // Create notification for client investor's users
    const { data: clientUsers } = await serviceSupabase
      .from('investor_users')
      .select('user_id')
      .eq('investor_id', client_investor_id)

    if (clientUsers && clientUsers.length > 0) {
      const notifications = clientUsers.map(u => ({
        user_id: u.user_id,
        investor_id: client_investor_id,
        title: 'Subscription Request Submitted',
        message: `${commercialPartner?.name} has submitted a subscription request of ${commitment.toLocaleString()} for ${deal.name} on your behalf.`,
        link: `/versotech_main/opportunities/${deal_id}?cycle=${cycle.id}`,
        metadata: {
          type: 'proxy_subscription',
          submission_id: submission.id,
          deal_id,
          commercial_partner_id: cpLink.commercial_partner_id
        }
      }))

      await serviceSupabase.from('investor_notifications').insert(notifications)
    }

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      cycle,
      message: `Subscription request submitted on behalf of ${clientInvestor.legal_name}`,
      proxy_mode: true,
      client: {
        id: client_investor_id,
        name: clientInvestor.legal_name,
        type: clientInvestor.type
      },
      deal: {
        id: deal_id,
        name: deal.name
      },
      commitment,
      status: 'pending'
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/commercial-partners/proxy-subscribe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/commercial-partners/proxy-subscribe
 * Get list of clients available for proxy subscription
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a commercial partner with proxy capability
    const { data: cpLinks } = await serviceSupabase
      .from('commercial_partner_users')
      .select(`
        commercial_partner_id,
        can_execute_for_clients,
        commercial_partners (
          id,
          name,
          status
        )
      `)
      .eq('user_id', user.id)
      .eq('can_execute_for_clients', true)

    // Return empty response if not a commercial partner (don't 403, just indicate no proxy capability)
    if (!cpLinks || cpLinks.length === 0) {
      return NextResponse.json({
        commercial_partner_id: null,
        commercial_partner_name: null,
        clients: [],
        can_execute_for_clients: false
      })
    }

    const cpId = cpLinks[0].commercial_partner_id

    // Get clients from commercial_partner_clients table (primary source)
    const { data: cpClients } = await serviceSupabase
      .from('commercial_partner_clients')
      .select(`
        id,
        client_name,
        client_email,
        client_type,
        client_investor_id,
        is_active,
        investor:client_investor_id (
          id,
          legal_name,
          type,
          kyc_status
        )
      `)
      .eq('commercial_partner_id', cpId)
      .eq('is_active', true)
      .order('client_name')

    // Also get legacy clients linked via investors.commercial_partner_id
    const { data: legacyClients } = await serviceSupabase
      .from('investors')
      .select(`
        id,
        legal_name,
        type,
        kyc_status
      `)
      .eq('commercial_partner_id', cpId)
      .eq('status', 'active')
      .order('legal_name')

    // Combine and dedupe clients (client_investor_id from cpClients overlaps with legacyClients)
    const clientInvestorIds = new Set((cpClients || []).map(c => c.client_investor_id).filter(Boolean))
    const uniqueLegacyClients = (legacyClients || []).filter(lc => !clientInvestorIds.has(lc.id))

    // Format clients for response
    // IMPORTANT: Field names must match the Client interface in proxy-mode-context.tsx
    // Interface expects: { id, name, investor_type, kyc_status }
    const formattedClients = [
      // Clients from commercial_partner_clients (with or without linked investors)
      ...(cpClients || [])
        .map(c => {
          const investor = c.investor as any
          return {
            id: investor?.id || null,  // null if no investor linked
            name: investor?.legal_name || c.client_name,
            investor_type: investor?.type || c.client_type || 'entity',
            kyc_status: investor?.kyc_status || 'not_linked',  // Custom status for unlinked
            client_record_id: c.id // Include the client record ID for reference
          }
        }),
      // Legacy clients directly linked to CP
      ...uniqueLegacyClients.map(lc => ({
        id: lc.id,
        name: lc.legal_name,
        investor_type: lc.type,
        kyc_status: lc.kyc_status
      }))
    ]

    return NextResponse.json({
      commercial_partner_id: cpId,
      commercial_partner_name: (cpLinks[0].commercial_partners as any)?.name,
      clients: formattedClients,
      can_execute_for_clients: true
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/commercial-partners/proxy-subscribe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
