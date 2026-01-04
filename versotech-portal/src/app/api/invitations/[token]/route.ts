import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Entity table mapping
const ENTITY_TABLES: Record<string, string> = {
  partner: 'partners',
  investor: 'investors',
  introducer: 'introducers',
  commercial_partner: 'commercial_partners',
  lawyer: 'lawyers',
  arranger: 'arranger_entities'
}

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

/**
 * GET /api/invitations/[token]
 * Get invitation details (for the accept page)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ error: 'Invalid invitation link' }, { status: 400 })
    }

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
      return NextResponse.json({
        error: 'This invitation has expired',
        status: 'expired'
      }, { status: 400 })
    }

    // Check if already used
    if (invitation.status !== 'pending') {
      return NextResponse.json({
        error: `This invitation has already been ${invitation.status}`,
        status: invitation.status
      }, { status: 400 })
    }

    // Check if user is logged in
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if logged-in user's email matches
    let emailMatch = false
    if (user) {
      const { data: profile } = await serviceSupabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .maybeSingle()

      emailMatch = profile?.email?.toLowerCase() === invitation.email.toLowerCase()
    }

    // Check if the invited email already has an account (for showing correct UI)
    let emailHasAccount = false
    if (!user) {
      const { data: existingProfile } = await serviceSupabase
        .from('profiles')
        .select('id')
        .eq('email', invitation.email.toLowerCase())
        .maybeSingle()

      emailHasAccount = !!existingProfile
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        entity_type: invitation.entity_type,
        entity_name: invitation.entity_name,
        email: invitation.email,
        role: invitation.role,
        is_signatory: invitation.is_signatory,
        invited_by_name: invitation.invited_by_name,
        expires_at: invitation.expires_at
      },
      user_logged_in: !!user,
      email_match: emailMatch,
      user_email: user?.email,
      email_has_account: emailHasAccount
    })

  } catch (error) {
    console.error('Error in GET /api/invitations/[token]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/invitations/[token]
 * Accept the invitation
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

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to accept this invitation' }, { status: 401 })
    }

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

    // Verify email matches (optional - we can allow any logged-in user to accept)
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', user.id)
      .maybeSingle()

    // Uncomment if you want strict email matching:
    // if (profile?.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    //   return NextResponse.json({
    //     error: 'This invitation was sent to a different email address'
    //   }, { status: 403 })
    // }

    // Check if user is already a member
    // Note: We select 'user_id' instead of 'id' because some tables use composite keys
    const userTable = USER_TABLES[invitation.entity_type]
    const entityIdColumn = ENTITY_ID_COLUMNS[invitation.entity_type]

    const { data: existingMembership } = await serviceSupabase
      .from(userTable)
      .select('user_id')
      .eq('user_id', user.id)
      .eq(entityIdColumn, invitation.entity_id)
      .maybeSingle()

    if (existingMembership) {
      // Update invitation status
      await serviceSupabase
        .from('member_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by_user_id: user.id
        })
        .eq('id', invitation.id)

      return NextResponse.json({
        success: true,
        message: 'You are already a member of this entity',
        already_member: true
      })
    }

    // Create the user-entity link
    const insertData: Record<string, any> = {
      user_id: user.id,
      [entityIdColumn]: invitation.entity_id,
      role: invitation.role,
      is_primary: false,
      created_by: invitation.invited_by
    }

    // Add signatory fields if applicable
    if (invitation.is_signatory) {
      insertData.can_sign = true
    }

    const { error: insertError } = await serviceSupabase
      .from(userTable)
      .insert(insertData)

    if (insertError) {
      console.error('Error creating membership:', insertError)
      return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 })
    }

    // Update profile role if needed (for persona switching)
    // Check if user already has multiple personas
    const { data: existingProfile } = await serviceSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If user is just 'investor', upgrade to 'multi_persona'
    if (existingProfile?.role === 'investor') {
      await serviceSupabase
        .from('profiles')
        .update({ role: 'multi_persona' })
        .eq('id', user.id)
    }

    // Update invitation status
    await serviceSupabase
      .from('member_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: user.id
      })
      .eq('id', invitation.id)

    // Determine redirect URL based on entity type
    const redirectUrls: Record<string, string> = {
      partner: '/versotech_main/partner-profile',
      investor: '/versotech_main/investor-profile',
      introducer: '/versotech_main/introducer-profile',
      commercial_partner: '/versotech_main/commercial-partner-profile',
      lawyer: '/versotech_main/lawyer-profile',
      arranger: '/versotech_main/arranger-profile'
    }

    return NextResponse.json({
      success: true,
      message: `Welcome to ${invitation.entity_name}!`,
      is_signatory: invitation.is_signatory,
      redirect_url: redirectUrls[invitation.entity_type] || '/versotech_main/dashboard'
    })

  } catch (error) {
    console.error('Error in POST /api/invitations/[token]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
