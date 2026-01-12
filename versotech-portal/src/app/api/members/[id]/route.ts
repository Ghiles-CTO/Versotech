import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Valid entity types
const VALID_ENTITY_TYPES = ['partner', 'investor', 'introducer', 'commercial_partner', 'lawyer', 'arranger'] as const
type EntityType = typeof VALID_ENTITY_TYPES[number]

// User-entity junction table mapping
const USER_TABLES: Record<EntityType, string> = {
  partner: 'partner_users',
  investor: 'investor_users',
  introducer: 'introducer_users',
  commercial_partner: 'commercial_partner_users',
  lawyer: 'lawyer_users',
  arranger: 'arranger_users'
}

// Entity ID column names in user tables
const ENTITY_ID_COLUMNS: Record<EntityType, string> = {
  partner: 'partner_id',
  investor: 'investor_id',
  introducer: 'introducer_id',
  commercial_partner: 'commercial_partner_id',
  lawyer: 'lawyer_id',
  arranger: 'arranger_id'
}

// Update member schema
const updateMemberSchema = z.object({
  entity_type: z.enum(VALID_ENTITY_TYPES),
  entity_id: z.string().uuid(),
  role: z.string().optional(),
  is_primary: z.boolean().optional(),
  can_sign: z.boolean().optional(),
})

/**
 * PATCH /api/members/[id]
 * Update a team member's role, signatory status, or primary status
 *
 * Note: [id] is the user_id of the member to update
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const parsed = updateMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { entity_type, entity_id, role, is_primary, can_sign } = parsed.data

    const serviceSupabase = createServiceClient()
    const userTable = USER_TABLES[entity_type]
    const entityIdColumn = ENTITY_ID_COLUMNS[entity_type]

    // Verify current user is a primary member or admin of this entity
    const { data: currentUserMembership } = await serviceSupabase
      .from(userTable)
      .select('role, is_primary')
      .eq('user_id', user.id)
      .eq(entityIdColumn, entity_id)
      .maybeSingle()

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: 'You are not a member of this entity' },
        { status: 403 }
      )
    }

    const canManage = currentUserMembership.is_primary ||
      ['admin', 'owner'].includes(currentUserMembership.role)

    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to manage members' },
        { status: 403 }
      )
    }

    // Prevent users from modifying their own primary status
    if (memberId === user.id && is_primary === false) {
      return NextResponse.json(
        { error: 'You cannot remove your own primary status' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: Record<string, any> = {}
    if (role !== undefined) updateData.role = role
    if (is_primary !== undefined) updateData.is_primary = is_primary
    if (can_sign !== undefined) updateData.can_sign = can_sign

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // If setting a new primary, unset the current primary first
    if (is_primary === true) {
      await serviceSupabase
        .from(userTable)
        .update({ is_primary: false })
        .eq(entityIdColumn, entity_id)
        .eq('is_primary', true)
    }

    // Update the member
    const { data: updatedMember, error: updateError } = await serviceSupabase
      .from(userTable)
      .update(updateData)
      .eq('user_id', memberId)
      .eq(entityIdColumn, entity_id)
      .select(`
        user_id,
        role,
        is_primary,
        can_sign,
        profiles:user_id (
          display_name,
          email,
          avatar_url
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating member:', updateError)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    return NextResponse.json({
      member: {
        id: `${updatedMember.user_id}_${entity_id}`,
        user_id: updatedMember.user_id,
        role: updatedMember.role,
        is_primary: updatedMember.is_primary,
        can_sign: updatedMember.can_sign ?? false,
        profile: updatedMember.profiles ? {
          display_name: (updatedMember.profiles as any).display_name,
          email: (updatedMember.profiles as any).email,
          avatar_url: (updatedMember.profiles as any).avatar_url
        } : null
      }
    })

  } catch (error) {
    console.error('Error in PATCH /api/members/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/members/[id]
 * Remove a team member from an entity
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entity_type = searchParams.get('entity_type')
    const entity_id = searchParams.get('entity_id')

    if (!entity_type || !entity_id) {
      return NextResponse.json(
        { error: 'Missing required params: entity_type, entity_id' },
        { status: 400 }
      )
    }

    if (!VALID_ENTITY_TYPES.includes(entity_type as EntityType)) {
      return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const userTable = USER_TABLES[entity_type as EntityType]
    const entityIdColumn = ENTITY_ID_COLUMNS[entity_type as EntityType]

    // Verify current user can manage members
    const { data: currentUserMembership } = await serviceSupabase
      .from(userTable)
      .select('role, is_primary')
      .eq('user_id', user.id)
      .eq(entityIdColumn, entity_id)
      .maybeSingle()

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: 'You are not a member of this entity' },
        { status: 403 }
      )
    }

    const canManage = currentUserMembership.is_primary ||
      ['admin', 'owner'].includes(currentUserMembership.role)

    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to remove members' },
        { status: 403 }
      )
    }

    // Prevent users from removing themselves
    if (memberId === user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the entity' },
        { status: 400 }
      )
    }

    // Check if member being removed is primary
    const { data: memberToRemove } = await serviceSupabase
      .from(userTable)
      .select('is_primary')
      .eq('user_id', memberId)
      .eq(entityIdColumn, entity_id)
      .maybeSingle()

    if (memberToRemove?.is_primary) {
      return NextResponse.json(
        { error: 'Cannot remove the primary contact. Transfer primary status first.' },
        { status: 400 }
      )
    }

    // Delete the member
    const { error: deleteError } = await serviceSupabase
      .from(userTable)
      .delete()
      .eq('user_id', memberId)
      .eq(entityIdColumn, entity_id)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in DELETE /api/members/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
