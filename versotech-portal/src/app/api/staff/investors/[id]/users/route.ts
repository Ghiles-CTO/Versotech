import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAppUrl } from '@/lib/signature/token'

/**
 * POST /api/staff/investors/[id]/users
 * Add a user to an investor (invite or link existing user)
 * Authentication: Staff only
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Use service client for data operations
    const supabase = createServiceClient()

    const body = await request.json()
    const { email, user_id } = body

    // Check if investor exists
    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, legal_name')
      .eq('id', id)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    let targetUserId: string
    let isNewInvite = false

    // If user_id is provided (existing user selected), use it directly
    if (user_id) {
      // Check if already linked
      const { data: existingLink } = await supabase
        .from('investor_users')
        .select('investor_id, user_id')
        .eq('investor_id', id)
        .eq('user_id', user_id)
        .single()

      if (existingLink) {
        return NextResponse.json(
          { error: 'User is already linked to this investor' },
          { status: 409 }
        )
      }

      targetUserId = user_id
    } else if (email && email.includes('@')) {
      // Email provided - check if user exists or invite
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email, display_name, role')
        .eq('email', email.toLowerCase())
        .single()

      if (existingUser) {
        // User exists - check if already linked
        const { data: existingLink } = await supabase
          .from('investor_users')
          .select('investor_id, user_id')
          .eq('investor_id', id)
          .eq('user_id', existingUser.id)
          .single()

        if (existingLink) {
          return NextResponse.json(
            { error: 'User is already linked to this investor' },
            { status: 409 }
          )
        }

        targetUserId = existingUser.id
      } else {
        isNewInvite = true
        // User doesn't exist - send invite via Supabase Auth
        try {
          const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
            email,
            {
              data: {
                display_name: email.split('@')[0],
                role: 'investor'
              },
              redirectTo: `${getAppUrl()}/versoholdings/dashboard`
            }
          )

          if (inviteError || !inviteData.user) {
            console.error('Invite user error:', inviteError)
            return NextResponse.json(
              { error: 'Failed to send invitation email' },
              { status: 500 }
            )
          }

          targetUserId = inviteData.user.id

          // Create profile for the invited user
          await supabase
            .from('profiles')
            .insert({
              id: targetUserId,
              email: email.toLowerCase(),
              display_name: email.split('@')[0],
              role: 'investor'
            })
            .single()
        } catch (inviteErr) {
          console.error('Supabase invite error:', inviteErr)
          return NextResponse.json(
            { error: 'Failed to send invitation. User may already exist in auth system.' },
            { status: 500 }
          )
        }
      }
    } else {
      return NextResponse.json({ error: 'Either user_id or email is required' }, { status: 400 })
    }

    // Create the investor_users link
    const { error: linkError } = await supabase
      .from('investor_users')
      .insert({
        investor_id: id,
        user_id: targetUserId
      })

    if (linkError) {
      console.error('Link user to investor error:', linkError)
      return NextResponse.json({ error: 'Failed to link user to investor' }, { status: 500 })
    }

    // Note: Onboarding tasks are created automatically by database trigger
    // 'investor_users_create_onboarding_tasks' which fires AFTER INSERT on investor_users table
    // See: supabase/migrations/20251123000000_fix_onboarding_tasks_automation.sql

    // Revalidate the detail page
    revalidatePath(`/versotech/staff/investors/${id}`)

    return NextResponse.json(
      {
        message: isNewInvite
          ? 'Invitation sent and user linked to investor'
          : 'User linked to investor successfully',
        user_id: targetUserId,
        invited: isNewInvite
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API /staff/investors/[id]/users POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
