/**
 * Partner Entity Members API
 * GET /api/partners/me/members - List all members of the partner entity
 * POST /api/partners/me/members - Add a new member
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createMemberSchema, prepareMemberData } from '@/lib/schemas/member-kyc-schema'
import { syncUserSignatoryFromMember } from '@/lib/kyc/member-signatory-sync'

/**
 * GET /api/partners/me/members
 * Fetch all members of the current partner entity
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get partner ID for this user
    const { data: partnerUser, error: linkError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !partnerUser?.partner_id) {
      return NextResponse.json({ error: 'No partner profile found' }, { status: 404 })
    }

    const partnerId = partnerUser.partner_id

    // Check if partner is entity type
    const { data: partner, error: partnerError } = await serviceSupabase
      .from('partners')
      .select('id, type, contact_name')
      .eq('id', partnerId)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    if (partner.type !== 'entity') {
      return NextResponse.json({
        members: [],
        message: 'Not an entity-type partner'
      })
    }

    // Get members
    const { data: members, error: membersError } = await serviceSupabase
      .from('partner_members')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching partner members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
      partner: {
        id: partner.id,
        type: partner.type,
        contact_name: partner.contact_name,
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/partners/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/partners/me/members
 * Add a new member to the partner entity
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get partner ID
    const { data: partnerUser, error: linkError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id, role, is_primary')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !partnerUser?.partner_id) {
      return NextResponse.json({ error: 'No partner profile found' }, { status: 404 })
    }

    const canManageMembers = partnerUser.role === 'admin' || partnerUser.is_primary === true
    if (!canManageMembers) {
      return NextResponse.json(
        { error: 'Only admin or primary users can manage members' },
        { status: 403 }
      )
    }

    const partnerId = partnerUser.partner_id

    // Verify partner is entity type
    const { data: partner, error: partnerError } = await serviceSupabase
      .from('partners')
      .select('id, type')
      .eq('id', partnerId)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    if (partner.type !== 'entity') {
      return NextResponse.json({
        error: 'Members can only be added to entity-type partners'
      }, { status: 400 })
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = createMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Prepare member data
    const memberData = prepareMemberData(parsed.data, {
      computeFullName: true,
      entityType: 'partner',
    })

    // Create new member
    const { data: newMember, error: insertError } = await serviceSupabase
      .from('partner_members')
      .insert({
        partner_id: partnerId,
        ...memberData,
        effective_from: memberData.effective_from || new Date().toISOString().split('T')[0],
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating partner member:', insertError)
      return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
    }

    if (newMember?.id) {
      await syncUserSignatoryFromMember({
        supabase: serviceSupabase,
        entityType: 'partner',
        entityId: partnerId,
        memberId: newMember.id,
      })
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/partners/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
