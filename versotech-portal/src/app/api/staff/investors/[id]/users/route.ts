import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'
import { revalidatePath } from 'next/cache'

// Helper to get user from either real auth or demo mode
async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (user) return { user, error: null, isDemo: false }
  
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
  if (demoCookie) {
    const demoSession = parseDemoSession(demoCookie.value)
    if (demoSession) {
      return {
        user: {
          id: demoSession.id,
          email: demoSession.email,
          role: demoSession.role
        },
        error: null,
        isDemo: true
      }
    }
  }
  return { user: null, error: authError || new Error('No authentication found'), isDemo: false }
}

/**
 * POST /api/staff/investors/[id]/users
 * Add a user to an investor (invite or link existing user)
 * Authentication: Staff only
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
    const supabase = demoCookie ? createServiceClient() : await createClient()

    // Check authentication
    const { user, error: authError, isDemo } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    let role: string
    if (isDemo) {
      role = user.role
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = profile?.role as string
    }

    if (!role || !role.startsWith('staff_')) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email, user_id } = body

    // Check if investor exists
    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, legal_name')
      .eq('id', params.id)
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
        .eq('investor_id', params.id)
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
          .eq('investor_id', params.id)
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
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/versoholdings/dashboard`
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
        investor_id: params.id,
        user_id: targetUserId
      })

    if (linkError) {
      console.error('Link user to investor error:', linkError)
      return NextResponse.json({ error: 'Failed to link user to investor' }, { status: 500 })
    }

    // Revalidate the detail page
    revalidatePath(`/versotech/staff/investors/${params.id}`)

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
