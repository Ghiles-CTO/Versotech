/**
 * CEO Member Update API
 * PUT /api/ceo/update-member - Update a CEO member's role, title, or signing rights
 *
 * Only CEO admins can update members. Primary member cannot be changed.
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'member', 'viewer']).optional(),
  title: z.string().max(100).optional().nullable(),
  can_sign: z.boolean().optional(),
})

export async function PUT(request: NextRequest) {
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
      return NextResponse.json({ error: 'Admin role required to update members' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { user_id, role, title, can_sign } = validation.data

    // Check if target is a CEO member
    const { data: targetMember, error: targetError } = await serviceSupabase
      .from('ceo_users')
      .select('user_id, is_primary, role, title, can_sign')
      .eq('user_id', user_id)
      .maybeSingle()

    if (targetError || !targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Build update object
    const updateFields: Record<string, any> = {}

    if (role !== undefined) {
      // Cannot change primary member's role to non-admin
      if (targetMember.is_primary && role !== 'admin') {
        return NextResponse.json(
          { error: 'Cannot change primary member role from admin' },
          { status: 400 }
        )
      }
      updateFields.role = role
    }

    if (title !== undefined) {
      updateFields.title = title
    }

    if (can_sign !== undefined) {
      updateFields.can_sign = can_sign
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Update the member
    const { data: updatedMember, error: updateError } = await serviceSupabase
      .from('ceo_users')
      .update(updateFields)
      .eq('user_id', user_id)
      .select()
      .single()

    if (updateError) {
      console.error('[ceo/update-member] Error updating member:', updateError)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Member updated successfully',
      member: updatedMember,
    })
  } catch (error) {
    console.error('[ceo/update-member] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
