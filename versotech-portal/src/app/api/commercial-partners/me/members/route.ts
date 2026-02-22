/**
 * Commercial Partner Entity Members API
 * GET /api/commercial-partners/me/members - List all members
 * POST /api/commercial-partners/me/members - Add a new member
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createMemberSchema, prepareMemberData } from '@/lib/schemas/member-kyc-schema'

/**
 * GET /api/commercial-partners/me/members
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cpUser, error: linkError } = await serviceSupabase
      .from('commercial_partner_users')
      .select('commercial_partner_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !cpUser?.commercial_partner_id) {
      return NextResponse.json({ error: 'No commercial partner profile found' }, { status: 404 })
    }

    const cpId = cpUser.commercial_partner_id

    const { data: cp, error: cpError } = await serviceSupabase
      .from('commercial_partners')
      .select('id, type, contact_name, company_name')
      .eq('id', cpId)
      .single()

    if (cpError || !cp) {
      return NextResponse.json({ error: 'Commercial partner not found' }, { status: 404 })
    }

    if (cp.type !== 'entity') {
      return NextResponse.json({
        members: [],
        message: 'Not an entity-type commercial partner'
      })
    }

    const { data: members, error: membersError } = await serviceSupabase
      .from('commercial_partner_members')
      .select('*')
      .eq('commercial_partner_id', cpId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching commercial partner members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
      commercialPartner: {
        id: cp.id,
        type: cp.type,
        contact_name: cp.contact_name,
        company_name: cp.company_name,
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/commercial-partners/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/commercial-partners/me/members
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cpUser, error: linkError } = await serviceSupabase
      .from('commercial_partner_users')
      .select('commercial_partner_id, role, is_primary')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !cpUser?.commercial_partner_id) {
      return NextResponse.json({ error: 'No commercial partner profile found' }, { status: 404 })
    }

    const canManageMembers = cpUser.role === 'admin' || cpUser.is_primary === true
    if (!canManageMembers) {
      return NextResponse.json(
        { error: 'Only admin or primary users can manage members' },
        { status: 403 }
      )
    }

    const cpId = cpUser.commercial_partner_id

    const { data: cp, error: cpError } = await serviceSupabase
      .from('commercial_partners')
      .select('id, type')
      .eq('id', cpId)
      .single()

    if (cpError || !cp) {
      return NextResponse.json({ error: 'Commercial partner not found' }, { status: 404 })
    }

    if (cp.type !== 'entity') {
      return NextResponse.json({
        error: 'Members can only be added to entity-type commercial partners'
      }, { status: 400 })
    }

    const body = await request.json()
    const parsed = createMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const memberData = prepareMemberData(parsed.data, {
      computeFullName: true,
      entityType: 'commercial_partner',
    })

    const { data: newMember, error: insertError } = await serviceSupabase
      .from('commercial_partner_members')
      .insert({
        commercial_partner_id: cpId,
        ...memberData,
        effective_from: memberData.effective_from || new Date().toISOString().split('T')[0],
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating commercial partner member:', insertError)
      return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/commercial-partners/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
