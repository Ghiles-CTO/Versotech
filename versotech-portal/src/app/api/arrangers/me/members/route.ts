/**
 * Arranger Entity Members API
 * GET /api/arrangers/me/members - List all members of the arranger entity
 * POST /api/arrangers/me/members - Add a new member
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createMemberSchema, prepareMemberData } from '@/lib/schemas/member-kyc-schema'
import { syncUserSignatoryFromMember } from '@/lib/kyc/member-signatory-sync'
import { getMemberOverallKycStatusMap } from '@/lib/kyc/member-kyc-overall-status'

/**
 * GET /api/arrangers/me/members
 * Fetch all members of the current arranger entity
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get arranger ID for this user
    const { data: arrangerUser, error: linkError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'No arranger profile found' }, { status: 404 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Check if arranger is entity type
    const { data: arranger, error: arrangerError } = await serviceSupabase
      .from('arranger_entities')
      .select('id, type, legal_name')
      .eq('id', arrangerId)
      .single()

    if (arrangerError || !arranger) {
      return NextResponse.json({ error: 'Arranger not found' }, { status: 404 })
    }

    if (arranger.type !== 'entity') {
      return NextResponse.json({
        members: [],
        message: 'Not an entity-type arranger'
      })
    }

    // Get members
    const { data: members, error: membersError } = await serviceSupabase
      .from('arranger_members')
      .select('*')
      .eq('arranger_id', arrangerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching arranger members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    const memberList = members || []
    const memberCurrentStatuses: Record<string, string | null> = Object.fromEntries(
      memberList.map((member) => [member.id, member.kyc_status ?? null])
    )
    const memberIds = memberList.map((member) => member.id).filter(Boolean)
    const overallStatusMap = await getMemberOverallKycStatusMap({
      supabase: serviceSupabase,
      entityType: 'arranger',
      entityId: arrangerId,
      memberIds,
      memberCurrentStatuses,
    })

    const membersWithOverallStatus = memberList.map((member) => ({
      ...member,
      kyc_overall_status: overallStatusMap[member.id] || 'not_submitted',
    }))

    return NextResponse.json({
      members: membersWithOverallStatus,
      arranger: {
        id: arranger.id,
        type: arranger.type,
        legal_name: arranger.legal_name,
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/arrangers/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/arrangers/me/members
 * Add a new member to the arranger entity
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get arranger ID
    const { data: arrangerUser, error: linkError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id, role, is_primary')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'No arranger profile found' }, { status: 404 })
    }

    const canManageMembers = arrangerUser.role === 'admin' || arrangerUser.is_primary === true
    if (!canManageMembers) {
      return NextResponse.json(
        { error: 'Only admin or primary users can manage members' },
        { status: 403 }
      )
    }

    const arrangerId = arrangerUser.arranger_id

    // Verify arranger is entity type
    const { data: arranger, error: arrangerError } = await serviceSupabase
      .from('arranger_entities')
      .select('id, type')
      .eq('id', arrangerId)
      .single()

    if (arrangerError || !arranger) {
      return NextResponse.json({ error: 'Arranger not found' }, { status: 404 })
    }

    if (arranger.type !== 'entity') {
      return NextResponse.json({
        error: 'Members can only be added to entity-type arrangers'
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
      entityType: 'arranger',
    })

    // Create new member
    const { data: newMember, error: insertError } = await serviceSupabase
      .from('arranger_members')
      .insert({
        arranger_id: arrangerId,
        ...memberData,
        effective_from: memberData.effective_from || new Date().toISOString().split('T')[0],
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating arranger member:', insertError)
      return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
    }

    if (newMember?.id) {
      await syncUserSignatoryFromMember({
        supabase: serviceSupabase,
        entityType: 'arranger',
        entityId: arrangerId,
        memberId: newMember.id,
      })
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/arrangers/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
