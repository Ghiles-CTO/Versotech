/**
 * Arranger Entity Member API (Individual)
 * GET /api/arrangers/me/members/[memberId] - Get member details
 * PATCH /api/arrangers/me/members/[memberId] - Update member
 * DELETE /api/arrangers/me/members/[memberId] - Soft-delete member
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updateMemberSchema, prepareMemberData } from '@/lib/schemas/member-kyc-schema'

interface RouteParams {
  params: Promise<{ memberId: string }>
}

/**
 * GET /api/arrangers/me/members/[memberId]
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

    // Get arranger ID for this user
    const { data: arrangerUser } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'No arranger profile found' }, { status: 404 })
    }

    // Fetch member and verify ownership
    const { data: member, error: memberError } = await serviceSupabase
      .from('arranger_members')
      .select('*')
      .eq('id', memberId)
      .eq('arranger_id', arrangerUser.arranger_id)
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
 * PATCH /api/arrangers/me/members/[memberId]
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

    // Get arranger ID
    const { data: arrangerUser } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'No arranger profile found' }, { status: 404 })
    }

    // Verify member belongs to user's arranger
    const { data: existingMember } = await serviceSupabase
      .from('arranger_members')
      .select('id')
      .eq('id', memberId)
      .eq('arranger_id', arrangerUser.arranger_id)
      .single()

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
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

    // Prepare update data
    const updateData = prepareMemberData(parsed.data, { computeFullName: true })

    // Update member
    const { data: updatedMember, error: updateError } = await serviceSupabase
      .from('arranger_members')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating arranger member:', updateError)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/arrangers/me/members/[memberId]
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

    // Get arranger ID
    const { data: arrangerUser } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'No arranger profile found' }, { status: 404 })
    }

    // Verify member belongs to user's arranger
    const { data: existingMember } = await serviceSupabase
      .from('arranger_members')
      .select('id')
      .eq('id', memberId)
      .eq('arranger_id', arrangerUser.arranger_id)
      .single()

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Soft delete
    const { error: deleteError } = await serviceSupabase
      .from('arranger_members')
      .update({
        is_active: false,
        effective_to: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error deleting arranger member:', deleteError)
      return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
