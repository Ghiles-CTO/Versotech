import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const proxySubscribeSchema = z.object({
  deal_id: z.string().uuid(),
  client_investor_id: z.string().uuid(),
  commitment: z.number().positive(),
  stock_type: z.enum(['ordinary', 'preference', 'convertible']).optional().default('ordinary'),
  notes: z.string().optional(),
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

    const { deal_id, client_investor_id, commitment, stock_type, notes, proxy_authorization_doc_id } = validation.data

    // Verify deal exists and is open
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select('id, name, status, vehicle_id, minimum_investment, maximum_investment')
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
    const { data: cpDealMembership } = await serviceSupabase
      .from('deal_memberships')
      .select('id, role, dispatched_at')
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

    // Verify client investor has completed KYC
    if (clientInvestor.kyc_status !== 'approved' && clientInvestor.kyc_status !== 'verified') {
      return NextResponse.json({
        error: 'Client KYC not complete',
        message: 'Client investor must complete KYC before subscribing.',
        kyc_status: clientInvestor.kyc_status
      }, { status: 400 })
    }

    // Check commitment limits
    if (deal.minimum_investment && commitment < deal.minimum_investment) {
      return NextResponse.json({
        error: 'Below minimum investment',
        message: `Minimum investment is ${deal.minimum_investment}`
      }, { status: 400 })
    }

    if (deal.maximum_investment && commitment > deal.maximum_investment) {
      return NextResponse.json({
        error: 'Exceeds maximum investment',
        message: `Maximum investment is ${deal.maximum_investment}`
      }, { status: 400 })
    }

    // Check if subscription already exists
    const { data: existingSub } = await serviceSupabase
      .from('subscriptions')
      .select('id, status')
      .eq('deal_id', deal_id)
      .eq('investor_id', client_investor_id)
      .not('status', 'in', '(cancelled,rejected)')
      .maybeSingle()

    if (existingSub) {
      return NextResponse.json({
        error: 'Subscription already exists',
        message: 'Client already has a subscription for this deal.',
        subscription_id: existingSub.id,
        status: existingSub.status
      }, { status: 400 })
    }

    // Create the subscription as proxy
    const now = new Date().toISOString()
    const { data: subscription, error: subError } = await serviceSupabase
      .from('subscriptions')
      .insert({
        deal_id,
        vehicle_id: deal.vehicle_id,
        investor_id: client_investor_id,
        commitment,
        funded_amount: 0,
        status: 'pending',
        stock_type,
        notes,
        // Proxy-specific fields
        submitted_by_proxy: true,
        proxy_user_id: user.id,
        proxy_commercial_partner_id: cpLink.commercial_partner_id,
        proxy_authorization_doc_id,
        created_at: now,
        updated_at: now
      })
      .select()
      .single()

    if (subError) {
      console.error('Error creating proxy subscription:', subError)
      // Check if it's a missing column error
      if (subError.message?.includes('submitted_by_proxy')) {
        // Fallback without proxy fields if columns don't exist yet
        const { data: fallbackSub, error: fallbackError } = await serviceSupabase
          .from('subscriptions')
          .insert({
            deal_id,
            vehicle_id: deal.vehicle_id,
            investor_id: client_investor_id,
            commitment,
            funded_amount: 0,
            status: 'pending',
            stock_type,
            notes: `${notes || ''}\n[Submitted by proxy: ${commercialPartner?.name} via ${user.email}]`.trim(),
            created_at: now,
            updated_at: now
          })
          .select()
          .single()

        if (fallbackError) {
          return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
        }

        // Log audit event with proxy info
        await serviceSupabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'proxy_subscription_created',
          entity_type: 'subscription',
          entity_id: fallbackSub.id,
          details: {
            deal_id,
            deal_name: deal.name,
            client_investor_id,
            client_name: clientInvestor.legal_name,
            commitment,
            commercial_partner_id: cpLink.commercial_partner_id,
            commercial_partner_name: commercialPartner?.name
          },
          created_at: now
        })

        return NextResponse.json({
          success: true,
          subscription_id: fallbackSub.id,
          message: `Subscription submitted on behalf of ${clientInvestor.legal_name}`,
          proxy_mode: true,
          client: {
            id: client_investor_id,
            name: clientInvestor.legal_name
          },
          deal: {
            id: deal_id,
            name: deal.name
          },
          commitment
        })
      }
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    // Log audit event
    await serviceSupabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'proxy_subscription_created',
      entity_type: 'subscription',
      entity_id: subscription.id,
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
        title: 'Subscription Submitted',
        message: `${commercialPartner?.name} has submitted a subscription of ${commitment.toLocaleString()} for ${deal.name} on your behalf.`,
        link: '/versoholdings/tasks',
        metadata: {
          type: 'proxy_subscription',
          subscription_id: subscription.id,
          deal_id,
          commercial_partner_id: cpLink.commercial_partner_id
        }
      }))

      await serviceSupabase.from('investor_notifications').insert(notifications)
    }

    return NextResponse.json({
      success: true,
      subscription_id: subscription.id,
      message: `Subscription submitted on behalf of ${clientInvestor.legal_name}`,
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
    const formattedClients = [
      // Clients from commercial_partner_clients with linked investors
      ...(cpClients || [])
        .filter(c => c.investor)
        .map(c => ({
          id: (c.investor as any).id,
          legal_name: (c.investor as any).legal_name || c.client_name,
          type: (c.investor as any).type || c.client_type,
          kyc_status: (c.investor as any).kyc_status,
          client_record_id: c.id // Include the client record ID for reference
        })),
      // Legacy clients directly linked to CP
      ...uniqueLegacyClients.map(lc => ({
        id: lc.id,
        legal_name: lc.legal_name,
        type: lc.type,
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
