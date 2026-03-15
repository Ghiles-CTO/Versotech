import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createMemberSchema, prepareMemberData } from '@/lib/schemas/member-kyc-schema'
import { syncUserSignatoryFromMember } from '@/lib/kyc/member-signatory-sync'
import { getMobilePhoneValidationError } from '@/lib/validation/phone-number'
import { getMemberOverallKycStatusMap } from '@/lib/kyc/member-kyc-overall-status'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { resolveActiveInvestorLinkFromCookies } from '@/lib/kyc/active-investor-link'

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

    const cookieStore = await cookies()
    const { link: investorLink, error: investorLinkError } = await resolveActiveInvestorLinkFromCookies<{
      investor_id: string
    }>({
      supabase: serviceSupabase,
      userId: user.id,
      cookieStore,
      select: 'investor_id',
    })

    if (investorLinkError || !investorLink?.investor_id) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    // Check if any of the linked investors is an entity type
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('id, type, display_name')
      .eq('id', investorLink.investor_id)
      .maybeSingle()

    if (investorError) {
      console.error('Error fetching investor:', investorError)
      return NextResponse.json({ error: 'Failed to fetch investor info' }, { status: 500 })
    }

    if (!investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    if (!['entity', 'institutional'].includes(investor.type || '')) {
      return NextResponse.json({
        members: [],
        message: 'Not an entity-type investor'
      })
    }

    // Get members for entity-type investors
    const { data: members, error: membersError } = await serviceSupabase
      .from('investor_members')
      .select('*')
      .eq('investor_id', investor.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    const memberList = members || []
    const memberCurrentStatuses: Record<string, string | null> = Object.fromEntries(
      memberList.map((member) => [member.id, member.kyc_status ?? null])
    )
    const overallStatusMap: Record<string, string> = {}

    const memberIds = memberList.map((member) => member.id).filter(Boolean)
    if (memberIds.length > 0) {
      const investorStatusMap = await getMemberOverallKycStatusMap({
        supabase: serviceSupabase,
        entityType: 'investor',
        entityId: investor.id,
        memberIds,
        memberCurrentStatuses,
      })

      Object.assign(overallStatusMap, investorStatusMap)
    }

    const membersWithOverallStatus = memberList.map((member) => ({
      ...member,
      kyc_overall_status: overallStatusMap[member.id] || 'not_submitted',
    }))

    return NextResponse.json({
      members: membersWithOverallStatus,
      investors: [investor]
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

    const cookieStore = await cookies()
    const { link: investorLink, error: investorLinkError } = await resolveActiveInvestorLinkFromCookies<{
      investor_id: string
      role: string | null
      is_primary: boolean | null
    }>({
      supabase: serviceSupabase,
      userId: user.id,
      cookieStore,
      select: 'investor_id, role, is_primary',
    })

    if (investorLinkError || !investorLink?.investor_id) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

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

    const mobilePhoneError = getMobilePhoneValidationError(parsed.data.phone_mobile, true)
    if (mobilePhoneError) {
      return NextResponse.json(
        {
          error: mobilePhoneError,
          details: { fieldErrors: { phone_mobile: [mobilePhoneError] } },
        },
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

    if (newMember?.id) {
      await syncUserSignatoryFromMember({
        supabase: serviceSupabase,
        entityType: 'investor',
        entityId: investorId,
        memberId: newMember.id,
      })
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/investors/me/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
