import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const subscribeSchema = z.object({
  commitment_amount: z.number().positive('Commitment amount must be positive'),
  vehicle_id: z.string().uuid('Invalid vehicle ID').optional()
})

/**
 * POST /api/investors/me/opportunities/:id/subscribe
 * Direct subscribe to an opportunity - creates subscription and triggers pack generation
 * This is the "direct subscribe" flow that skips optional early stages
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

    // Parse request body
    const body = await request.json()
    const validation = subscribeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { commitment_amount, vehicle_id: providedVehicleId } = validation.data

    // Get investor ID
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLinks[0].investor_id

    // Get deal details
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select('id, vehicle_id, minimum_investment, maximum_investment, status')
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Validate deal is open
    if (deal.status !== 'open' && deal.status !== 'allocation_pending') {
      return NextResponse.json({ error: 'Deal is not open for subscriptions' }, { status: 400 })
    }

    // Check if user is an entity user (partner, introducer, commercial_partner) who requires dispatch
    // Entity users can only subscribe to deals they've been explicitly dispatched to by CEO
    const { data: entityPersonas } = await serviceSupabase.rpc('get_user_personas', { p_user_id: user.id })

    const entityTypes = ['partner', 'introducer', 'commercial_partner']
    const isEntityUser = entityPersonas?.some((p: { persona_type: string }) => entityTypes.includes(p.persona_type))

    if (isEntityUser) {
      // Check if user has been dispatched to this deal
      const { data: dispatchedMembership } = await serviceSupabase
        .from('deal_memberships')
        .select('dispatched_at, role')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .not('dispatched_at', 'is', null)
        .single()

      if (!dispatchedMembership) {
        return NextResponse.json({
          error: 'You have not been authorized to invest in this deal. Please contact your relationship manager.'
        }, { status: 403 })
      }
    }

    const vehicleId = providedVehicleId || deal.vehicle_id
    if (!vehicleId) {
      return NextResponse.json({ error: 'No vehicle associated with this deal' }, { status: 400 })
    }

    // Validate commitment amount
    if (deal.minimum_investment && commitment_amount < deal.minimum_investment) {
      return NextResponse.json({
        error: `Minimum investment is ${deal.minimum_investment}`
      }, { status: 400 })
    }
    if (deal.maximum_investment && commitment_amount > deal.maximum_investment) {
      return NextResponse.json({
        error: `Maximum investment is ${deal.maximum_investment}`
      }, { status: 400 })
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await serviceSupabase
      .from('subscriptions')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .eq('investor_id', investorId)
      .single()

    if (existingSubscription) {
      return NextResponse.json({
        error: 'You already have a subscription for this opportunity'
      }, { status: 400 })
    }

    // Ensure deal membership exists (direct subscribe flow)
    // This is critical for journey tracking per Phase 3 plan
    const { data: existingMembership } = await serviceSupabase
      .from('deal_memberships')
      .select('*')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .single()

    if (!existingMembership) {
      // Create membership with viewed_at only (direct subscribe skips optional stages)
      await serviceSupabase
        .from('deal_memberships')
        .insert({
          deal_id: dealId,
          user_id: user.id,
          investor_id: investorId,
          role: 'investor',
          viewed_at: new Date().toISOString()
          // dispatched_at, interest_confirmed_at, nda_signed_at, data_room_granted_at = NULL
        })
    }

    // Create subscription
    const now = new Date().toISOString()
    const { data: subscription, error: subscriptionError } = await serviceSupabase
      .from('subscriptions')
      .insert({
        vehicle_id: vehicleId,
        investor_id: investorId,
        deal_id: dealId,
        commitment: commitment_amount,
        funded_amount: 0,
        status: 'pending',
        pack_generated_at: now, // Pack generated immediately (no draft step per Phase 3)
        pack_sent_at: now, // Pack sent immediately
        subscription_date: now,
        created_at: now
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    // Get authorized signatories
    const { data: signatories } = await serviceSupabase
      .from('investor_members')
      .select('id, full_name, email')
      .eq('investor_id', investorId)
      .eq('role', 'authorized_signatory')
      .eq('is_active', true)

    // Create signature requests for all signatories
    if (signatories && signatories.length > 0) {
      const crypto = await import('crypto')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

      const signatureRequests = signatories.map((sig, index) => ({
        subscription_id: subscription.id,
        investor_id: investorId,
        deal_id: dealId,
        signer_email: sig.email,
        signer_name: sig.full_name,
        signer_role: 'authorized_signatory',
        signature_position: `signatory_${index + 1}`,
        document_type: 'subscription',
        signing_token: crypto.randomBytes(32).toString('hex'),
        token_expires_at: expiresAt,
        status: 'pending',
        created_at: now,
        created_by: user.id
      }))

      const { error: sigReqError } = await serviceSupabase
        .from('signature_requests')
        .insert(signatureRequests)

      if (sigReqError) {
        console.warn('Could not create signature requests:', sigReqError)
      }
    }

    // Log audit event
    await serviceSupabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'subscription_created',
        entity_type: 'subscription',
        entity_id: subscription.id,
        details: {
          deal_id: dealId,
          investor_id: investorId,
          commitment_amount,
          direct_subscribe: true,
          signatories_count: signatories?.length || 0
        },
        created_at: now
      })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        commitment: subscription.commitment,
        pack_generated_at: subscription.pack_generated_at,
        pack_sent_at: subscription.pack_sent_at
      },
      signatories_notified: signatories?.length || 0
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/investors/me/opportunities/:id/subscribe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
