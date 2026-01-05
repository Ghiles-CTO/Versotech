/**
 * CEO Member Removal API
 * DELETE /api/ceo/remove-member - Remove a member from Verso Capital CEO team
 *
 * Only CEO admins can remove members. Primary members cannot be removed.
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const removeSchema = z.object({
  user_id: z.string().uuid(),
})

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a CEO admin
    const { data: ceoUser, error: ceoUserError } = await serviceSupabase
      .from('ceo_users')
      .select('user_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (ceoUserError || !ceoUser) {
      return NextResponse.json({ error: 'Access denied. CEO membership required.' }, { status: 403 })
    }

    if (ceoUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin role required to remove members' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = removeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { user_id } = validation.data

    // Prevent self-removal
    if (user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the CEO team' },
        { status: 400 }
      )
    }

    // Check if target is a CEO member and not primary
    const { data: targetMember, error: targetError } = await serviceSupabase
      .from('ceo_users')
      .select('user_id, is_primary')
      .eq('user_id', user_id)
      .maybeSingle()

    if (targetError || !targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (targetMember.is_primary) {
      return NextResponse.json(
        { error: 'Cannot remove the primary CEO member' },
        { status: 400 }
      )
    }

    // Remove the member
    const { error: deleteError } = await serviceSupabase
      .from('ceo_users')
      .delete()
      .eq('user_id', user_id)

    if (deleteError) {
      console.error('[ceo/remove-member] Error removing member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Member removed successfully',
      removed_user_id: user_id,
    })
  } catch (error) {
    console.error('[ceo/remove-member] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
