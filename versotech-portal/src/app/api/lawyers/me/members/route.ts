/**
 * Lawyer Entity Members API
 * GET /api/lawyers/me/members - List all members of the lawyer entity (law firm)
 * POST /api/lawyers/me/members - Add a new member
 *
 * Note: Lawyers are typically entity-type (law firms), so all lawyers get member support
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createMemberSchema, prepareMemberData } from '@/lib/schemas/member-kyc-schema'
import { syncUserSignatoryFromMember } from '@/lib/kyc/member-signatory-sync'

/**
 * GET /api/lawyers/me/members
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: lawyerUser, error: linkError } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !lawyerUser?.lawyer_id) {
      return NextResponse.json({ error: 'No lawyer profile found' }, { status: 404 })
    }

    const lawyerId = lawyerUser.lawyer_id

    const { data: lawyer, error: lawyerError } = await serviceSupabase
      .from('lawyers')
      .select('id, firm_name, display_name')
      .eq('id', lawyerId)
      .single()

    if (lawyerError || !lawyer) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 })
    }

    const { data: members, error: membersError } = await serviceSupabase
      .from('lawyer_members')
      .select('*')
      .eq('lawyer_id', lawyerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching lawyer members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({
      members: members || [],
      lawyer: {
        id: lawyer.id,
        firm_name: lawyer.firm_name,
        display_name: lawyer.display_name,
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/lawyers/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/lawyers/me/members
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: lawyerUser, error: linkError } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id, role, is_primary')
      .eq('user_id', user.id)
      .maybeSingle()

    if (linkError || !lawyerUser?.lawyer_id) {
      return NextResponse.json({ error: 'No lawyer profile found' }, { status: 404 })
    }

    const canManageMembers = lawyerUser.role === 'admin' || lawyerUser.is_primary === true
    if (!canManageMembers) {
      return NextResponse.json(
        { error: 'Only admin or primary users can manage members' },
        { status: 403 }
      )
    }

    const lawyerId = lawyerUser.lawyer_id

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
      entityType: 'lawyer',
    })

    const { data: newMember, error: insertError } = await serviceSupabase
      .from('lawyer_members')
      .insert({
        lawyer_id: lawyerId,
        ...memberData,
        effective_from: memberData.effective_from || new Date().toISOString().split('T')[0],
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating lawyer member:', insertError)
      return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
    }

    if (newMember?.id) {
      await syncUserSignatoryFromMember({
        supabase: serviceSupabase,
        entityType: 'lawyer',
        entityId: lawyerId,
        memberId: newMember.id,
      })
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/lawyers/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
