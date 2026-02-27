/**
 * CEO Member Invitation API
 * POST /api/ceo/invite-member - Invite a new member to Verso Capital CEO team
 *
 * If the user already exists in profiles, adds them directly to ceo_users.
 * Otherwise, creates an invitation for a new user.
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const STAFF_PROFILE_ROLES = ['staff_admin', 'staff_ops', 'staff_rm', 'ceo'] as const

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
  title: z.string().max(100).optional().nullable(),
  can_sign: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Admin role required to invite members' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = inviteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, role, title, can_sign } = validation.data

    // Check if user already exists in profiles
    const { data: existingProfile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('id, email, display_name, role')
      .ilike('email', email)
      .maybeSingle()

    if (profileError) {
      console.error('[ceo/invite-member] Error checking profile:', profileError)
      return NextResponse.json({ error: 'Failed to check user' }, { status: 500 })
    }

    if (existingProfile) {
      // User exists - check if already a CEO member
      const { data: existingMember } = await serviceSupabase
        .from('ceo_users')
        .select('user_id')
        .eq('user_id', existingProfile.id)
        .maybeSingle()

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a CEO member' },
          { status: 400 }
        )
      }

      // Add user directly to ceo_users
      const ceoMemberInsert: Record<string, unknown> = {
        user_id: existingProfile.id,
        role,
        can_sign,
        is_primary: false,
        created_by: user.id,
      }

      if (typeof title === 'string' && title.trim().length > 0) {
        ceoMemberInsert.title = title.trim()
      }

      const { data: newMember, error: insertError } = await serviceSupabase
        .from('ceo_users')
        .insert(ceoMemberInsert)
        .select()
        .single()

      if (insertError) {
        console.error('[ceo/invite-member] Error adding member:', insertError)
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
      }

      const currentProfileRole = (existingProfile as { role?: string | null }).role ?? null
      const isStaffProfileRole = STAFF_PROFILE_ROLES.includes((currentProfileRole || '') as (typeof STAFF_PROFILE_ROLES)[number])
      if (!isStaffProfileRole) {
        const { error: roleUpdateError } = await serviceSupabase
          .from('profiles')
          .update({
            role: 'ceo',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProfile.id)

        if (roleUpdateError) {
          console.error('[ceo/invite-member] Error normalizing profile role:', roleUpdateError)
          await serviceSupabase
            .from('ceo_users')
            .delete()
            .eq('user_id', existingProfile.id)
          return NextResponse.json({ error: 'Failed to normalize user role' }, { status: 500 })
        }
      }

      return NextResponse.json({
        message: `${existingProfile.display_name || email} has been added to the CEO team`,
        added_directly: true,
        member: {
          user_id: existingProfile.id,
          email: existingProfile.email,
          display_name: existingProfile.display_name,
          role,
          title,
          can_sign,
        },
      })
    }

    // User doesn't exist - create invitation
    // For now, we'll use a simple approach: store pending invitation in a metadata table
    // or send an invitation email. Since this is for internal Verso Capital team,
    // we'll assume new users need to sign up first.

    return NextResponse.json(
      {
        error: 'User not found. Please ask them to create an account first, then try again.',
        email,
        suggestion: 'The user needs to register on the platform before they can be added to the CEO team.'
      },
      { status: 400 }
    )

  } catch (error) {
    console.error('[ceo/invite-member] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
