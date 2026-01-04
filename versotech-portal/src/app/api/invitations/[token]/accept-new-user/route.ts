import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

// User-entity junction table mapping
const USER_TABLES: Record<string, string> = {
  partner: 'partner_users',
  investor: 'investor_users',
  introducer: 'introducer_users',
  commercial_partner: 'commercial_partner_users',
  lawyer: 'lawyer_users',
  arranger: 'arranger_users'
}

// Entity ID column names in user tables
const ENTITY_ID_COLUMNS: Record<string, string> = {
  partner: 'partner_id',
  investor: 'investor_id',
  introducer: 'introducer_id',
  commercial_partner: 'commercial_partner_id',
  lawyer: 'lawyer_id',
  arranger: 'arranger_id'
}

// Redirect URLs per entity type
const REDIRECT_URLS: Record<string, string> = {
  partner: '/versotech_main/partner-profile',
  investor: '/versotech_main/investor-profile',
  introducer: '/versotech_main/introducer-profile',
  commercial_partner: '/versotech_main/commercial-partner-profile',
  lawyer: '/versotech_main/lawyer-profile',
  arranger: '/versotech_main/arranger-profile'
}

// Validation schema
const acceptNewUserSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

/**
 * POST /api/invitations/[token]/accept-new-user
 *
 * Creates a new user account and accepts the invitation in one step.
 * Used when a new user (no existing account) clicks an invitation link.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ error: 'Invalid invitation link' }, { status: 400 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = acceptNewUserSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        error: validationResult.error.issues[0].message
      }, { status: 400 })
    }

    const { display_name, password } = validationResult.data
    const serviceSupabase = createServiceClient()

    // Get the invitation
    const { data: invitation, error: fetchError } = await serviceSupabase
      .from('member_invitations')
      .select('*')
      .eq('invitation_token', token)
      .maybeSingle()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      await serviceSupabase
        .from('member_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
    }

    // Check if already used
    if (invitation.status !== 'pending') {
      return NextResponse.json({
        error: `This invitation has already been ${invitation.status}`
      }, { status: 400 })
    }

    // Check if email already has an account
    const { data: existingProfile } = await serviceSupabase
      .from('profiles')
      .select('id')
      .eq('email', invitation.email.toLowerCase())
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({
        error: 'An account with this email already exists. Please sign in instead.',
        has_account: true
      }, { status: 400 })
    }

    // Create the user account
    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true, // Auto-confirm since they clicked invitation link
      user_metadata: {
        display_name: display_name,
        role: 'multi_persona'
      }
    })

    if (authError || !authData.user) {
      console.error('Error creating user:', authError)
      return NextResponse.json({
        error: authError?.message || 'Failed to create account'
      }, { status: 500 })
    }

    // Create profile record
    const { error: profileError } = await serviceSupabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: invitation.email.toLowerCase(),
        display_name: display_name,
        role: 'multi_persona',
        password_set: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // User is created but profile failed - try to continue
    }

    // Create the user-entity link
    const userTable = USER_TABLES[invitation.entity_type]
    const entityIdColumn = ENTITY_ID_COLUMNS[invitation.entity_type]

    const insertData: Record<string, any> = {
      user_id: authData.user.id,
      [entityIdColumn]: invitation.entity_id,
      role: invitation.role,
      is_primary: false,
      created_by: invitation.invited_by
    }

    // Add signatory fields if applicable
    if (invitation.is_signatory) {
      insertData.can_sign = true
    }

    const { error: junctionError } = await serviceSupabase
      .from(userTable)
      .insert(insertData)

    if (junctionError) {
      console.error('Error creating membership:', junctionError)
      // Continue - user can still login and may be linked manually
    }

    // Update invitation status
    await serviceSupabase
      .from('member_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: authData.user.id
      })
      .eq('id', invitation.id)

    // Log the event
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'authorization',
      actor_id: authData.user.id,
      action: 'invitation_accepted_new_user',
      entity_type: invitation.entity_type,
      entity_id: invitation.entity_id,
      action_details: {
        invitation_id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        is_signatory: invitation.is_signatory,
        invited_by: invitation.invited_by
      },
      timestamp: new Date().toISOString()
    })

    // Generate session for the new user
    // Note: We need to sign in the user to get session tokens
    const { data: signInData, error: signInError } = await serviceSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: invitation.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?portal=main`
      }
    })

    // Return success with redirect info
    const redirectUrl = REDIRECT_URLS[invitation.entity_type] || '/versotech_main/dashboard'

    return NextResponse.json({
      success: true,
      message: `Welcome to ${invitation.entity_name}!`,
      user_id: authData.user.id,
      is_signatory: invitation.is_signatory,
      redirect_url: redirectUrl,
      // Include login credentials for immediate sign-in
      credentials: {
        email: invitation.email,
        // Don't return password - user already knows it
      }
    })

  } catch (error) {
    console.error('Error in POST /api/invitations/[token]/accept-new-user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
