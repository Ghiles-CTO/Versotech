/**
 * Introducer Entity Members API
 * GET /api/introducers/me/members - List all members of the introducer entity
 * POST /api/introducers/me/members - Add a new member
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createMemberSchema, prepareMemberData } from '@/lib/schemas/member-kyc-schema'
import { syncUserSignatoryFromMember } from '@/lib/kyc/member-signatory-sync'

/**
 * GET /api/introducers/me/members
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: introducerUser, error: linkError } = await serviceSupabase
      .from('introducer_users')
      .select('introducer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !introducerUser?.introducer_id) {
      return NextResponse.json({ error: 'No introducer profile found' }, { status: 404 })
    }

    const introducerId = introducerUser.introducer_id

    const { data: introducer, error: introducerError } = await serviceSupabase
      .from('introducers')
      .select('id, type, contact_name')
      .eq('id', introducerId)
      .single()

    if (introducerError || !introducer) {
      return NextResponse.json({ error: 'Introducer not found' }, { status: 404 })
    }

    if (introducer.type !== 'entity') {
      return NextResponse.json({
        members: [],
        message: 'Not an entity-type introducer'
      })
    }

    const { data: members, error: membersError } = await serviceSupabase
      .from('introducer_members')
      .select('*')
      .eq('introducer_id', introducerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching introducer members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
      introducer: {
        id: introducer.id,
        type: introducer.type,
        contact_name: introducer.contact_name,
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/introducers/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/introducers/me/members
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: introducerUser, error: linkError } = await serviceSupabase
      .from('introducer_users')
      .select('introducer_id, role, is_primary')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !introducerUser?.introducer_id) {
      return NextResponse.json({ error: 'No introducer profile found' }, { status: 404 })
    }

    const canManageMembers = introducerUser.role === 'admin' || introducerUser.is_primary === true
    if (!canManageMembers) {
      return NextResponse.json(
        { error: 'Only admin or primary users can manage members' },
        { status: 403 }
      )
    }

    const introducerId = introducerUser.introducer_id

    const { data: introducer, error: introducerError } = await serviceSupabase
      .from('introducers')
      .select('id, type')
      .eq('id', introducerId)
      .single()

    if (introducerError || !introducer) {
      return NextResponse.json({ error: 'Introducer not found' }, { status: 404 })
    }

    if (introducer.type !== 'entity') {
      return NextResponse.json({
        error: 'Members can only be added to entity-type introducers'
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
      entityType: 'introducer',
    })

    const { data: newMember, error: insertError } = await serviceSupabase
      .from('introducer_members')
      .insert({
        introducer_id: introducerId,
        ...memberData,
        effective_from: memberData.effective_from || new Date().toISOString().split('T')[0],
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating introducer member:', insertError)
      return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
    }

    if (newMember?.id) {
      await syncUserSignatoryFromMember({
        supabase: serviceSupabase,
        entityType: 'introducer',
        entityId: introducerId,
        memberId: newMember.id,
      })
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/introducers/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
