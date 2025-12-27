/**
 * Commercial Partner Client Detail API
 * GET /api/commercial-partners/me/clients/[id] - Get client details
 * PATCH /api/commercial-partners/me/clients/[id] - Update client
 * DELETE /api/commercial-partners/me/clients/[id] - Soft delete client
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateClientSchema = z.object({
  client_name: z.string().min(1).optional(),
  client_email: z.string().email().optional().nullable(),
  client_phone: z.string().optional().nullable(),
  client_type: z.enum(['individual', 'entity']).optional(),
  client_investor_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().optional()
})

/**
 * GET /api/commercial-partners/me/clients/[id]
 * Get details for a specific client
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: clientId } = await params
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

    // Get client with all related data
    const { data: client, error: clientError } = await serviceSupabase
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
          email,
          kyc_status,
          type
        ),
        deal:created_for_deal_id (
          id,
          name,
          status
        )
      `)
      .eq('id', clientId)
      .eq('commercial_partner_id', cpLink.commercial_partner_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get subscriptions for this client via CP proxy
    let subscriptions: any[] = []
    if (client.client_investor_id) {
      const { data: subs } = await serviceSupabase
        .from('subscriptions')
        .select(`
          id,
          status,
          commitment,
          currency,
          funded_amount,
          signed_at,
          funded_at,
          activated_at,
          created_at,
          deal:deal_id (
            id,
            name,
            company_name
          )
        `)
        .eq('investor_id', client.client_investor_id)
        .eq('proxy_commercial_partner_id', cpLink.commercial_partner_id)
        .order('created_at', { ascending: false })

      subscriptions = subs || []
    }

    return NextResponse.json({
      client: {
        ...client,
        subscriptions,
        subscription_count: subscriptions.length,
        total_commitment: subscriptions.reduce((sum, s) => sum + (s.commitment || 0), 0)
      }
    })
  } catch (error) {
    console.error('[GET client] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/commercial-partners/me/clients/[id]
 * Update a client
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: clientId } = await params
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

    // Verify client belongs to this CP
    const { data: existingClient } = await serviceSupabase
      .from('commercial_partner_clients')
      .select('id')
      .eq('id', clientId)
      .eq('commercial_partner_id', cpLink.commercial_partner_id)
      .single()

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateClientSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const updateData = validation.data
    const now = new Date().toISOString()

    // If updating investor link, verify investor exists
    if (updateData.client_investor_id) {
      const { data: investor } = await serviceSupabase
        .from('investors')
        .select('id')
        .eq('id', updateData.client_investor_id)
        .single()

      if (!investor) {
        return NextResponse.json(
          { error: 'Specified investor not found' },
          { status: 404 }
        )
      }
    }

    // Update the client
    const { data: updatedClient, error: updateError } = await serviceSupabase
      .from('commercial_partner_clients')
      .update({
        ...updateData,
        updated_at: now
      })
      .eq('id', clientId)
      .eq('commercial_partner_id', cpLink.commercial_partner_id)
      .select()
      .single()

    if (updateError) {
      console.error('[PATCH client] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commercial_partner',
      action: 'client_updated',
      entity_type: 'commercial_partner_client',
      entity_id: clientId,
      actor_id: user.id,
      action_details: {
        description: 'Client updated',
        changes: Object.keys(updateData)
      },
      timestamp: now
    })

    return NextResponse.json({
      success: true,
      client: updatedClient
    })
  } catch (error) {
    console.error('[PATCH client] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/commercial-partners/me/clients/[id]
 * Soft delete a client (set is_active = false)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: clientId } = await params
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

    // Verify client belongs to this CP and get name for audit
    const { data: existingClient } = await serviceSupabase
      .from('commercial_partner_clients')
      .select('id, client_name')
      .eq('id', clientId)
      .eq('commercial_partner_id', cpLink.commercial_partner_id)
      .single()

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const now = new Date().toISOString()

    // Soft delete - set is_active = false
    const { error: deleteError } = await serviceSupabase
      .from('commercial_partner_clients')
      .update({
        is_active: false,
        updated_at: now
      })
      .eq('id', clientId)
      .eq('commercial_partner_id', cpLink.commercial_partner_id)

    if (deleteError) {
      console.error('[DELETE client] Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commercial_partner',
      action: 'client_deactivated',
      entity_type: 'commercial_partner_client',
      entity_id: clientId,
      actor_id: user.id,
      action_details: {
        description: 'Client deactivated',
        client_name: existingClient.client_name
      },
      timestamp: now
    })

    return NextResponse.json({
      success: true,
      message: 'Client deactivated successfully'
    })
  } catch (error) {
    console.error('[DELETE client] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
