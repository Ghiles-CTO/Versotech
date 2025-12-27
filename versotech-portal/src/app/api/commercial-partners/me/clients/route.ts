/**
 * Commercial Partner Client Management API
 * GET /api/commercial-partners/me/clients - List CP's clients
 * POST /api/commercial-partners/me/clients - Create new client
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createClientSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email().optional().nullable(),
  client_phone: z.string().optional().nullable(),
  client_type: z.enum(['individual', 'entity']).default('entity'),
  client_investor_id: z.string().uuid().optional().nullable(),
  created_for_deal_id: z.string().uuid().optional().nullable()
})

/**
 * GET /api/commercial-partners/me/clients
 * List all clients for the authenticated user's commercial partner
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's commercial partner
    const { data: cpLink } = await serviceSupabase
      .from('commercial_partner_users')
      .select('commercial_partner_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cpLink) {
      return NextResponse.json({ error: 'No commercial partner profile found' }, { status: 404 })
    }

    // Get query params for filtering
    const url = new URL(request.url)
    const activeOnly = url.searchParams.get('active') !== 'false'
    const search = url.searchParams.get('search')

    // Build query
    let query = serviceSupabase
      .from('commercial_partner_clients')
      .select(`
        id,
        client_name,
        client_email,
        client_phone,
        client_type,
        client_investor_id,
        is_active,
        created_at,
        updated_at,
        created_for_deal_id,
        investor:client_investor_id (
          id,
          legal_name,
          display_name,
          kyc_status
        ),
        deal:created_for_deal_id (
          id,
          name
        )
      `)
      .eq('commercial_partner_id', cpLink.commercial_partner_id)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (search) {
      query = query.or(`client_name.ilike.%${search}%,client_email.ilike.%${search}%`)
    }

    const { data: clients, error: clientsError } = await query

    if (clientsError) {
      console.error('[GET clients] Query error:', clientsError)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Get subscription counts for each client
    const clientsWithStats = await Promise.all(
      (clients || []).map(async (client) => {
        if (!client.client_investor_id) {
          return { ...client, subscription_count: 0, total_commitment: 0 }
        }

        const { data: subs } = await serviceSupabase
          .from('subscriptions')
          .select('id, commitment, currency')
          .eq('investor_id', client.client_investor_id)
          .eq('proxy_commercial_partner_id', cpLink.commercial_partner_id)

        const subscriptionCount = subs?.length || 0
        const totalCommitment = subs?.reduce((sum, s) => sum + (s.commitment || 0), 0) || 0

        return {
          ...client,
          subscription_count: subscriptionCount,
          total_commitment: totalCommitment
        }
      })
    )

    return NextResponse.json({
      clients: clientsWithStats,
      total_count: clientsWithStats.length
    })
  } catch (error) {
    console.error('[GET clients] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/commercial-partners/me/clients
 * Create a new client for the authenticated user's commercial partner
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's commercial partner
    const { data: cpLink } = await serviceSupabase
      .from('commercial_partner_users')
      .select('commercial_partner_id, can_execute_for_clients')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cpLink) {
      return NextResponse.json({ error: 'No commercial partner profile found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createClientSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { client_name, client_email, client_phone, client_type, client_investor_id, created_for_deal_id } = validation.data

    // Check for duplicate client name within same CP
    const { data: existingClient } = await serviceSupabase
      .from('commercial_partner_clients')
      .select('id')
      .eq('commercial_partner_id', cpLink.commercial_partner_id)
      .eq('client_name', client_name)
      .eq('is_active', true)
      .maybeSingle()

    if (existingClient) {
      return NextResponse.json(
        { error: 'A client with this name already exists' },
        { status: 409 }
      )
    }

    // If linking to existing investor, verify the investor exists
    if (client_investor_id) {
      const { data: investor } = await serviceSupabase
        .from('investors')
        .select('id, kyc_status')
        .eq('id', client_investor_id)
        .single()

      if (!investor) {
        return NextResponse.json(
          { error: 'Specified investor not found' },
          { status: 404 }
        )
      }
    }

    const now = new Date().toISOString()

    // Create the client
    const { data: newClient, error: createError } = await serviceSupabase
      .from('commercial_partner_clients')
      .insert({
        commercial_partner_id: cpLink.commercial_partner_id,
        client_name,
        client_email: client_email || null,
        client_phone: client_phone || null,
        client_type,
        client_investor_id: client_investor_id || null,
        created_for_deal_id: created_for_deal_id || null,
        is_active: true,
        created_at: now,
        created_by: user.id,
        updated_at: now
      })
      .select(`
        id,
        client_name,
        client_email,
        client_phone,
        client_type,
        client_investor_id,
        is_active,
        created_at
      `)
      .single()

    if (createError) {
      console.error('[POST clients] Create error:', createError)
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commercial_partner',
      action: 'client_created',
      entity_type: 'commercial_partner_client',
      entity_id: newClient.id,
      actor_id: user.id,
      action_details: {
        description: 'New client created',
        commercial_partner_id: cpLink.commercial_partner_id,
        client_name
      },
      timestamp: now
    })

    return NextResponse.json({
      success: true,
      client: newClient
    }, { status: 201 })
  } catch (error) {
    console.error('[POST clients] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
