import { createClient, createServiceClient } from '@/lib/supabase/server'
import { updateMemberSchema, prepareMemberData } from '@/lib/schemas/member-kyc-schema'
import { syncUserSignatoryFromMember } from '@/lib/kyc/member-signatory-sync'
import { MEMBER_KYC_PROFILE_FIELDS } from '@/lib/kyc/member-kyc-fields'
import { getMobilePhoneValidationError } from '@/lib/validation/phone-number'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ memberId: string }>
}

/**
 * GET /api/investors/me/members/[memberId]
 * Get a single member by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { memberId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id, role, is_primary')
      .eq('user_id', user.id)
    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorLinksWithAccess = investorLinks as Array<{
      investor_id: string
      role?: string | null
      is_primary?: boolean | null
    }>

    const investorIds = investorLinksWithAccess.map(link => link.investor_id)

    // Fetch member and verify ownership
    const { data: member, error: memberError } = await serviceSupabase
      .from('investor_members')
      .select('*')
      .eq('id', memberId)
      .in('investor_id', investorIds)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/investors/me/members/[memberId]
 * Update a member
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { memberId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id, role, is_primary')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorLinksWithAccess = investorLinks as Array<{
      investor_id: string
      role?: string | null
      is_primary?: boolean | null
    }>
    const investorIds = investorLinksWithAccess.map(link => link.investor_id)
    // Verify member belongs to user's investor
    const { data: existingMember } = await serviceSupabase
      .from('investor_members')
      .select('id, investor_id, email, kyc_status, phone_mobile')
      .eq('id', memberId)
      .in('investor_id', investorIds)
      .single()
    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const memberAccess = investorLinksWithAccess.find(
      link => link.investor_id === existingMember.investor_id
    )
    const canManageMembers = memberAccess?.role === 'admin' || memberAccess?.is_primary === true
    const isSelfMember =
      typeof existingMember.email === 'string' &&
      typeof user.email === 'string' &&
      existingMember.email.trim().toLowerCase() === user.email.trim().toLowerCase()

    if (!canManageMembers && !isSelfMember) {
      return NextResponse.json(
        { error: 'Only admin or primary users can manage members' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = updateMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const hasKycProfileFieldEdit = MEMBER_KYC_PROFILE_FIELDS.some((field) =>
      Object.prototype.hasOwnProperty.call(body, field)
    )

    if (hasKycProfileFieldEdit) {
      const effectivePhoneMobile =
        parsed.data.phone_mobile !== undefined
          ? parsed.data.phone_mobile
          : existingMember.phone_mobile
      const mobilePhoneError = getMobilePhoneValidationError(effectivePhoneMobile, true)
      if (mobilePhoneError) {
        return NextResponse.json(
          {
            error: mobilePhoneError,
            details: { fieldErrors: { phone_mobile: [mobilePhoneError] } },
          },
          { status: 400 }
        )
      }
    }

    // Only KYC-profile edits should reset KYC status.
    // Signatory/user-link updates are operational changes and must not invalidate KYC.
    const kycReset = hasKycProfileFieldEdit &&
      (existingMember.kyc_status === 'approved' || existingMember.kyc_status === 'submitted')
      ? { kyc_status: 'pending' as const, kyc_approved_at: null }
      : {}

    const updateData = prepareMemberData(parsed.data, {
      computeFullName: true,
      entityType: 'investor',
    })

    // Update member
    const { data: updatedMember, error: updateError } = await serviceSupabase
      .from('investor_members')
      .update({
        ...updateData,
        ...kycReset,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating member:', updateError)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    await syncUserSignatoryFromMember({
      supabase: serviceSupabase,
      entityType: 'investor',
      entityId: existingMember.investor_id,
      memberId,
    })

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/investors/me/members/[memberId]
 * Soft-delete a member (sets is_active = false)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const { memberId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id, role, is_primary')
      .eq('user_id', user.id)
    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorLinksWithAccess = investorLinks as Array<{
      investor_id: string
      role?: string | null
      is_primary?: boolean | null
    }>
    const investorIds = investorLinksWithAccess.map(link => link.investor_id)
    // Verify member belongs to user's investor
    const { data: existingMember } = await serviceSupabase
      .from('investor_members')
      .select('id, investor_id')
      .eq('id', memberId)
      .in('investor_id', investorIds)
      .single()
    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const memberAccess = investorLinksWithAccess.find(
      link => link.investor_id === existingMember.investor_id
    )
    const canManageMembers = memberAccess?.role === 'admin' || memberAccess?.is_primary === true
    if (!canManageMembers) {
      return NextResponse.json(
        { error: 'Only admin or primary users can manage members' },
        { status: 403 }
      )
    }

    // Soft delete - set is_active to false and effective_to date
    const { error: deleteError } = await serviceSupabase
      .from('investor_members')
      .update({
        is_active: false,
        effective_to: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error deleting member:', deleteError)
      return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
