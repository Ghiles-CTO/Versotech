/**
 * Lawyer Entity Member API (Individual)
 * GET /api/lawyers/me/members/[memberId] - Get member details
 * PATCH /api/lawyers/me/members/[memberId] - Update member
 * DELETE /api/lawyers/me/members/[memberId] - Soft-delete member
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updateMemberSchema, prepareMemberData } from '@/lib/schemas/member-kyc-schema'

interface RouteParams {
  params: Promise<{ memberId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { memberId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: lawyerUser } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!lawyerUser?.lawyer_id) {
      return NextResponse.json({ error: 'No lawyer profile found' }, { status: 404 })
    }

    const { data: member, error: memberError } = await serviceSupabase
      .from('lawyer_members')
      .select('*')
      .eq('id', memberId)
      .eq('lawyer_id', lawyerUser.lawyer_id)
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

export async function PATCH(request: Request, { params }: RouteParams) {
  const { memberId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: lawyerUser } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!lawyerUser?.lawyer_id) {
      return NextResponse.json({ error: 'No lawyer profile found' }, { status: 404 })
    }

    // Only admin users can update members
    if (lawyerUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin users can update members' }, { status: 403 })
    }

    const { data: existingMember } = await serviceSupabase
      .from('lawyer_members')
      .select('id')
      .eq('id', memberId)
      .eq('lawyer_id', lawyerUser.lawyer_id)
      .single()

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updateData = prepareMemberData(parsed.data, { computeFullName: true })

    const { data: updatedMember, error: updateError } = await serviceSupabase
      .from('lawyer_members')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating lawyer member:', updateError)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { memberId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: lawyerUser } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!lawyerUser?.lawyer_id) {
      return NextResponse.json({ error: 'No lawyer profile found' }, { status: 404 })
    }

    if (lawyerUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin users can delete members' }, { status: 403 })
    }

    const { data: existingMember } = await serviceSupabase
      .from('lawyer_members')
      .select('id')
      .eq('id', memberId)
      .eq('lawyer_id', lawyerUser.lawyer_id)
      .single()

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { error: deleteError } = await serviceSupabase
      .from('lawyer_members')
      .update({
        is_active: false,
        effective_to: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error deleting lawyer member:', deleteError)
      return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
