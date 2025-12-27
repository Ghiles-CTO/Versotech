import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAuthenticatedUser } from '@/lib/api-auth'

/**
 * GET /api/invite/[token]
 * Validates an invite link token and returns deal info
 * Does NOT consume the invite - just validates it
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token || token.length !== 64) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 400 })
    }

    // Hash the token to look up in database
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const serviceSupabase = createServiceClient()

    // Look up the invite link
    const { data: inviteLink, error } = await serviceSupabase
      .from('invite_links')
      .select(`
        id,
        deal_id,
        role,
        expires_at,
        max_uses,
        used_count,
        deal:deal_id (
          id,
          name,
          status,
          vehicle:vehicle_id (
            name
          )
        )
      `)
      .eq('token_hash', tokenHash)
      .single()

    if (error || !inviteLink) {
      return NextResponse.json(
        { error: 'Invalid or expired invite link' },
        { status: 404 }
      )
    }

    // Validate expiry
    if (inviteLink.expires_at && new Date(inviteLink.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite link has expired' },
        { status: 410 }
      )
    }

    // Validate usage count
    if (inviteLink.max_uses && inviteLink.used_count >= inviteLink.max_uses) {
      return NextResponse.json(
        { error: 'This invite link has reached its maximum uses' },
        { status: 410 }
      )
    }

    // Validate deal_id exists (invite links can have NULL deal_id in edge cases)
    if (!inviteLink.deal_id) {
      return NextResponse.json(
        { error: 'This invite link is not associated with a deal' },
        { status: 400 }
      )
    }

    // Check deal is still active
    // Supabase returns relationships as objects when using .single(), but types may vary
    const dealData = inviteLink.deal as unknown
    const deal = dealData as { id: string; name: string; status: string; vehicle?: { name: string } | null } | null
    if (!deal) {
      return NextResponse.json(
        { error: 'The associated deal no longer exists' },
        { status: 410 }
      )
    }
    if (deal.status === 'closed') {
      return NextResponse.json(
        { error: 'This deal is no longer accepting new investors' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      valid: true,
      inviteLink: {
        id: inviteLink.id,
        role: inviteLink.role,
        deal: {
          id: deal.id,
          name: deal.name,
          vehicle_name: deal.vehicle?.name
        }
      }
    })

  } catch (error) {
    console.error('API /invite/[token] GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invite/[token]
 * Redeems an invite link for the authenticated user
 * Creates an investor interest record for the deal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const regularSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await params

    if (!token || token.length !== 64) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 400 })
    }

    // Hash the token to look up in database
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const serviceSupabase = createServiceClient()

    // Look up the invite link
    const { data: inviteLink, error } = await serviceSupabase
      .from('invite_links')
      .select(`
        id,
        deal_id,
        role,
        expires_at,
        max_uses,
        used_count,
        deal:deal_id (
          id,
          name,
          status
        )
      `)
      .eq('token_hash', tokenHash)
      .single()

    if (error || !inviteLink) {
      return NextResponse.json(
        { error: 'Invalid or expired invite link' },
        { status: 404 }
      )
    }

    // Validate expiry
    if (inviteLink.expires_at && new Date(inviteLink.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite link has expired' },
        { status: 410 }
      )
    }

    // Validate usage count
    if (inviteLink.max_uses && inviteLink.used_count >= inviteLink.max_uses) {
      return NextResponse.json(
        { error: 'This invite link has reached its maximum uses' },
        { status: 410 }
      )
    }

    // Validate deal_id exists
    if (!inviteLink.deal_id) {
      return NextResponse.json(
        { error: 'This invite link is not associated with a deal' },
        { status: 400 }
      )
    }

    // Check deal is still active
    const dealData = inviteLink.deal as unknown
    const deal = dealData as { id: string; name: string; status: string } | null
    if (!deal) {
      return NextResponse.json(
        { error: 'The associated deal no longer exists' },
        { status: 410 }
      )
    }
    if (deal.status === 'closed') {
      return NextResponse.json(
        { error: 'This deal is no longer accepting new investors' },
        { status: 410 }
      )
    }

    // Check if user already has interest in this deal
    const { data: existingInterest } = await serviceSupabase
      .from('investor_deal_interest')
      .select('id')
      .eq('investor_id', user.id)
      .eq('deal_id', inviteLink.deal_id)
      .maybeSingle()

    if (existingInterest) {
      return NextResponse.json({
        success: true,
        message: 'You already have access to this deal',
        redirect: `/versotech_main/opportunities/${inviteLink.deal_id}`
      })
    }

    // Create investor interest record
    const now = new Date().toISOString()
    const { error: interestError } = await serviceSupabase
      .from('investor_deal_interest')
      .insert({
        investor_id: user.id,
        deal_id: inviteLink.deal_id,
        status: 'pending',
        created_by: user.id,
        submitted_at: now,
        updated_at: now,
        is_post_close: false,
        notes: `Invited via link (role: ${inviteLink.role}, link_id: ${inviteLink.id})`
      })

    if (interestError) {
      console.error('Create interest error:', interestError)
      return NextResponse.json(
        { error: 'Failed to process invite' },
        { status: 500 }
      )
    }

    // Increment used_count
    await serviceSupabase
      .from('invite_links')
      .update({ used_count: (inviteLink.used_count || 0) + 1 })
      .eq('id', inviteLink.id)

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'investor_deal_interest',
      entity_id: inviteLink.deal_id,
      metadata: {
        deal_id: inviteLink.deal_id,
        invite_link_id: inviteLink.id,
        role: inviteLink.role,
        source: 'invite_link_redemption'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Invite redeemed successfully',
      redirect: `/versotech_main/opportunities/${inviteLink.deal_id}`
    })

  } catch (error) {
    console.error('API /invite/[token] POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
