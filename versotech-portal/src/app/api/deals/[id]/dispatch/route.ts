import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const dispatchSchema = z.object({
  user_ids: z.array(z.string().uuid()).min(1, 'At least one user must be selected'),
  role: z.enum([
    'investor',
    'partner',
    'partner_investor',
    'introducer_investor',
    'commercial_partner_investor',
    'commercial_partner_proxy',
    'lawyer',
    'arranger'
  ]).default('investor')
})

/**
 * POST /api/deals/:id/dispatch
 * CEO/Staff dispatch users to a deal
 *
 * Creates deal_memberships with dispatched_at timestamp set.
 * This authorizes entity users (partners, introducers, etc.) to invest in the deal.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id
    })

    const hasStaffAccess = personas?.some(
      (p: { persona_type: string }) => p.persona_type === 'staff'
    ) || false

    if (!hasStaffAccess) {
      return NextResponse.json({ error: 'Forbidden: Staff access required' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = dispatchSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { user_ids, role } = validation.data

    // For introducer_investor role, verify all users have valid introducer agreements
    if (role === 'introducer_investor') {
      // Get introducer links for users being dispatched
      const { data: introducerLinks } = await serviceSupabase
        .from('introducer_users')
        .select('user_id, introducer_id')
        .in('user_id', user_ids)

      if (introducerLinks && introducerLinks.length > 0) {
        const introducerIds = [...new Set(introducerLinks.map(l => l.introducer_id))]

        // Check for valid signed agreements
        const today = new Date().toISOString().split('T')[0]
        const { data: validAgreements } = await serviceSupabase
          .from('introducer_agreements')
          .select('introducer_id, signed_date, expiry_date, status')
          .in('introducer_id', introducerIds)
          .eq('status', 'active')
          .not('signed_date', 'is', null)
          .or(`expiry_date.is.null,expiry_date.gte.${today}`)

        const introducersWithValidAgreement = new Set(
          (validAgreements || []).map(a => a.introducer_id)
        )

        // Find users whose introducer lacks valid agreement
        const usersWithoutValidAgreement = introducerLinks
          .filter(l => !introducersWithValidAgreement.has(l.introducer_id))
          .map(l => l.user_id)

        if (usersWithoutValidAgreement.length > 0) {
          // Get names for error message
          const { data: profiles } = await serviceSupabase
            .from('profiles')
            .select('id, display_name')
            .in('id', usersWithoutValidAgreement)

          const names = (profiles || []).map(p => p.display_name).join(', ')

          return NextResponse.json({
            error: 'Introducer agreement required',
            message: `Cannot dispatch users without signed introducer agreement: ${names}. The introducer must sign a fee agreement before being authorized to introduce investors to deals.`,
            users_blocked: usersWithoutValidAgreement
          }, { status: 400 })
        }
      }
    }

    // Verify deal exists
    const { data: deal, error: dealError } = await serviceSupabase
      .from('deals')
      .select('id, name, status')
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Check deal status allows dispatching
    if (deal.status === 'closed' || deal.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot dispatch to a closed or cancelled deal' },
        { status: 400 }
      )
    }

    // Get existing memberships to avoid duplicates
    const { data: existingMemberships } = await serviceSupabase
      .from('deal_memberships')
      .select('user_id')
      .eq('deal_id', dealId)
      .in('user_id', user_ids)

    const existingUserIds = new Set((existingMemberships || []).map(m => m.user_id))
    const newUserIds = user_ids.filter(id => !existingUserIds.has(id))

    if (newUserIds.length === 0) {
      return NextResponse.json(
        { error: 'All selected users are already members of this deal' },
        { status: 400 }
      )
    }

    // Get user profiles and investor links for the new users
    const { data: userProfiles } = await serviceSupabase
      .from('profiles')
      .select('id, email, display_name')
      .in('id', newUserIds)

    // Get investor_id for users who are investors
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('user_id, investor_id')
      .in('user_id', newUserIds)

    const investorIdMap = new Map(
      (investorLinks || []).map(l => [l.user_id, l.investor_id])
    )

    // Create memberships
    const now = new Date().toISOString()
    const membershipsToCreate = newUserIds.map(userId => ({
      deal_id: dealId,
      user_id: userId,
      investor_id: investorIdMap.get(userId) || null,
      role,
      invited_by: user.id,
      invited_at: now,
      dispatched_at: now // Key field that authorizes entity users
    }))

    const { data: createdMemberships, error: createError } = await serviceSupabase
      .from('deal_memberships')
      .insert(membershipsToCreate)
      .select()

    if (createError) {
      console.error('Error creating memberships:', createError)
      return NextResponse.json(
        { error: 'Failed to dispatch users to deal' },
        { status: 500 }
      )
    }

    // Log audit event
    await serviceSupabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'deal_dispatch',
        entity_type: 'deal',
        entity_id: dealId,
        details: {
          dispatched_users: newUserIds,
          role,
          skipped_existing: user_ids.length - newUserIds.length,
          deal_name: deal.name
        },
        created_at: now
      })

    // TODO: Send notifications to dispatched users
    // This could trigger an n8n workflow or send emails directly

    return NextResponse.json({
      success: true,
      dispatched_count: newUserIds.length,
      skipped_count: user_ids.length - newUserIds.length,
      memberships: createdMemberships
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/deals/:id/dispatch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/deals/:id/dispatch
 * Get dispatch status and available users for a deal
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id
    })

    const hasStaffAccess = personas?.some(
      (p: { persona_type: string }) => p.persona_type === 'staff'
    ) || false

    if (!hasStaffAccess) {
      return NextResponse.json({ error: 'Forbidden: Staff access required' }, { status: 403 })
    }

    // Get current memberships
    const { data: memberships } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        user_id,
        role,
        dispatched_at,
        profiles:user_id (
          id,
          display_name,
          email
        )
      `)
      .eq('deal_id', dealId)

    // Get available users not in the deal
    const existingUserIds = (memberships || []).map(m => m.user_id)

    const { data: availableUsers } = await serviceSupabase
      .from('profiles')
      .select('id, display_name, email, role')
      .in('role', ['investor', 'partner', 'introducer', 'commercial_partner', 'lawyer'])
      .not('id', 'in', existingUserIds.length > 0 ? `(${existingUserIds.join(',')})` : '()')
      .order('display_name')

    return NextResponse.json({
      deal_id: dealId,
      current_members: memberships || [],
      available_users: availableUsers || []
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/deals/:id/dispatch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
