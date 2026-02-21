import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Entity table mapping
const ENTITY_TABLES: Record<string, string> = {
  partner: 'partners',
  investor: 'investors',
  introducer: 'introducers',
  commercial_partner: 'commercial_partners',
  lawyer: 'lawyers',
  arranger: 'arranger_entities',
  ceo: 'ceo_entity',
  staff: '' // Staff don't have an entity table - they're internal team
}

// User-entity junction table mapping
const USER_TABLES: Record<string, string> = {
  partner: 'partner_users',
  investor: 'investor_users',
  introducer: 'introducer_users',
  commercial_partner: 'commercial_partner_users',
  lawyer: 'lawyer_users',
  arranger: 'arranger_users',
  ceo: 'ceo_users',
  staff: '' // Staff don't have a junction table - they're in profiles with role
}

// Entity ID column names in user tables
// Note: CEO uses singleton pattern - no entity_id column
// Note: Staff don't have a junction table
const ENTITY_ID_COLUMNS: Record<string, string> = {
  partner: 'partner_id',
  investor: 'investor_id',
  introducer: 'introducer_id',
  commercial_partner: 'commercial_partner_id',
  lawyer: 'lawyer_id',
  arranger: 'arranger_id',
  ceo: '', // CEO uses singleton pattern
  staff: '' // Staff don't have entity_id - they're internal team
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
        expires_at: invitation.expires_at,
        suggested_name: (invitation.metadata as Record<string, any> | null)?.display_name || null
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

    // Enforce that the signed-in account matches the invited email.
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.email || profile.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json({
        error: `This invitation was sent to ${invitation.email}. Please sign in with that email to continue.`
      }, { status: 403 })
    }

    // Check if user is already a member
    // Note: We select 'user_id' instead of 'id' because some tables use composite keys
    const userTable = USER_TABLES[invitation.entity_type]
    const entityIdColumn = ENTITY_ID_COLUMNS[invitation.entity_type]

    let existingMembership = null

    if (invitation.entity_type === 'staff') {
      // Staff: Check if user already has a staff role
      const { data } = await serviceSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      // Consider existing if they already have a staff role
      if (data?.role && ['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(data.role)) {
        existingMembership = data
      }
    } else if (invitation.entity_type === 'ceo') {
      // CEO uses singleton pattern - just check by user_id
      const { data } = await serviceSupabase
        .from(userTable)
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()
      existingMembership = data
    } else {
      // Standard entity types check by user_id and entity_id
      const { data } = await serviceSupabase
        .from(userTable)
        .select('user_id')
        .eq('user_id', user.id)
        .eq(entityIdColumn, invitation.entity_id)
        .maybeSingle()
      existingMembership = data
    }

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
        already_member: true,
        redirect_url: '/versotech_main/dashboard'
      })
    }

    // Handle staff entity type separately
    if (invitation.entity_type === 'staff') {
      // Staff: Update profile with staff role and create permissions
      const metadata = (invitation.metadata as Record<string, any>) || {}
      const { data: currentStaffProfile, error: currentStaffProfileError } = await serviceSupabase
        .from('profiles')
        .select('role, title, is_super_admin')
        .eq('id', user.id)
        .maybeSingle()

      if (currentStaffProfileError || !currentStaffProfile) {
        console.error('Error loading current staff profile state:', currentStaffProfileError)
        return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
      }

      const rollbackStaffProfile = async () => {
        const { error: rollbackError } = await serviceSupabase
          .from('profiles')
          .update({
            role: currentStaffProfile.role,
            title: currentStaffProfile.title ?? null,
            is_super_admin: currentStaffProfile.is_super_admin,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (rollbackError) {
          console.error('Failed to rollback staff profile update:', rollbackError)
        }
      }

      // Build update object - only include is_super_admin if explicitly set in metadata
      const profileUpdate: Record<string, any> = {
        role: invitation.role, // staff_admin, staff_ops, staff_rm, ceo
        title: metadata.title || invitation.role,
        updated_at: new Date().toISOString()
      }

      // Only set is_super_admin if explicitly provided in metadata
      if (typeof metadata.is_super_admin === 'boolean') {
        profileUpdate.is_super_admin = metadata.is_super_admin
      }

      // Update profile with staff role and metadata
      const { error: profileUpdateError } = await serviceSupabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)

      if (profileUpdateError) {
        console.error('Error updating staff profile:', profileUpdateError)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }

      // Create staff permissions from metadata
      const permissions = (metadata.permissions as string[]) || []
      if (permissions.length > 0) {
        const permissionRecords = permissions.map((permission: string) => ({
          user_id: user.id,
          permission: permission,
          granted_by: invitation.invited_by,
          granted_at: new Date().toISOString()
        }))

        const { error: permError } = await serviceSupabase
          .from('staff_permissions')
          .insert(permissionRecords)

        if (permError) {
          console.error('Error creating staff permissions:', permError)
          // Continue - staff can still be granted permissions manually
        }
      }

      // CRITICAL: Staff users must also be added to ceo_users for CEO entity access
      // This gives them the 'ceo' persona via get_user_personas() RPC
      // Check first to avoid duplicate key errors (user_id is primary key)
      const { data: existingCeoUser, error: ceoLookupError } = await serviceSupabase
        .from('ceo_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (ceoLookupError) {
        console.error('Error checking staff ceo_users link:', ceoLookupError)
        await rollbackStaffProfile()
        return NextResponse.json({ error: 'Failed to configure staff access' }, { status: 500 })
      }

      if (!existingCeoUser) {
        const { error: ceoUserError } = await serviceSupabase
          .from('ceo_users')
          .insert({
            user_id: user.id,
            role: 'admin',
            is_primary: false,
            can_sign: true,
            title: metadata.title || invitation.role || 'Staff',
            created_by: invitation.invited_by,
            created_at: new Date().toISOString()
          })

        // Ignore duplicate key errors (race condition), fail on everything else.
        if (ceoUserError && ceoUserError.code !== '23505') {
          console.error('Error adding staff to ceo_users:', ceoUserError)
          await rollbackStaffProfile()
          return NextResponse.json({ error: 'Failed to configure staff access' }, { status: 500 })
        }
      }
    } else {
      // Non-staff entity types - create junction table records
      let insertData: Record<string, any>

      const invitationMetadata = (invitation.metadata as Record<string, any> | null) || {}
      const invitationIsPrimary = Boolean(invitationMetadata.is_primary)

      if (invitation.entity_type === 'ceo') {
        // CEO uses singleton pattern - no entity_id column
        insertData = {
          user_id: user.id,
          role: invitation.role,
          is_primary: invitationIsPrimary,
          can_sign: invitation.is_signatory || false,
          title: invitation.role === 'admin' ? 'Administrator' : invitation.role
        }
      } else {
        // Standard entity types with entity_id and CEO approval
        insertData = {
          user_id: user.id,
          [entityIdColumn]: invitation.entity_id,
          role: invitation.role,
          is_primary: invitationIsPrimary,
          created_by: invitation.invited_by,
          // CEO pre-approved this member via the invitation approval workflow
          ceo_approval_status: 'approved',
          ceo_approved_at: new Date().toISOString()
        }

        // Add signatory fields if applicable
        if (invitation.is_signatory) {
          insertData.can_sign = true
        }
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
      investor: '/versotech_main/profile',
      introducer: '/versotech_main/introducer-profile',
      commercial_partner: '/versotech_main/commercial-partner-profile',
      lawyer: '/versotech_main/lawyer-profile',
      arranger: '/versotech_main/arranger-profile',
      ceo: '/versotech_main/ceo-profile',
      staff: '/versotech_main/dashboard' // Staff go to main dashboard
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
