/**
 * Arranger Entity Members API
 * GET /api/arrangers/me/members - List all members of the arranger entity
 * POST /api/arrangers/me/members - Add a new member
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createMemberSchema, prepareMemberData, computeFullName } from '@/lib/schemas/member-kyc-schema'

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

    return NextResponse.json({
      members: members || [],
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
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'No arranger profile found' }, { status: 404 })
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
    const memberData = prepareMemberData(parsed.data, { computeFullName: true })

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

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/arrangers/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
