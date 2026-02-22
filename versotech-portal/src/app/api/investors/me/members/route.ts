import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createMemberSchema, prepareMemberData } from '@/lib/schemas/member-kyc-schema'
import { NextResponse } from 'next/server'

/**
 * GET /api/investors/me/members
 * Fetch all members of the current investor entity
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks, error: linksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (linksError || !investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Check if any of the linked investors is an entity type
    const { data: investors, error: investorsError } = await serviceSupabase
      .from('investors')
      .select('id, type, display_name')
      .in('id', investorIds)
      .in('type', ['entity', 'institutional'])

    if (investorsError) {
      console.error('Error fetching investors:', investorsError)
      return NextResponse.json({ error: 'Failed to fetch investor info' }, { status: 500 })
    }

    if (!investors || investors.length === 0) {
      return NextResponse.json({
        members: [],
        message: 'Not an entity-type investor'
      })
    }

    // Get members for entity-type investors
    const entityInvestorIds = investors.map(i => i.id)
    const { data: members, error: membersError } = await serviceSupabase
      .from('investor_members')
      .select('*')
      .in('investor_id', entityInvestorIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
      investors: investors
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/investors/me/members
 * Add a new member to the investor entity
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get primary investor ID for this user
    const { data: investorLinks, error: linksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id, role, is_primary')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)

    if (linksError || !investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorLink = investorLinks[0]
    const canManageMembers = investorLink.role === 'admin' || investorLink.is_primary === true
    if (!canManageMembers) {
      return NextResponse.json(
        { error: 'Only admin or primary users can manage members' },
        { status: 403 }
      )
    }

    const investorId = investorLink.investor_id

    // Verify investor is entity type
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('id, type')
      .eq('id', investorId)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    if (!['entity', 'institutional'].includes(investor.type || '')) {
      return NextResponse.json({
        error: 'Members can only be added to entity-type investors'
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

    const memberData = prepareMemberData(parsed.data, {
      computeFullName: true,
      entityType: 'investor',
    })

    // Create new member with all fields
    const { data: newMember, error: insertError } = await serviceSupabase
      .from('investor_members')
      .insert({
        investor_id: investorId,
        ...memberData,
        effective_from: memberData.effective_from || new Date().toISOString().split('T')[0],
        created_by: user.id,
        kyc_status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating member:', insertError)
      return NextResponse.json(
        { error: 'Failed to create member', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/investors/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
