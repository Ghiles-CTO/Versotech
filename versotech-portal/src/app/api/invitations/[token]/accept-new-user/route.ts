import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { logBlacklistMatches, screenAgainstBlacklist } from '@/lib/compliance/blacklist'
import { SignatoryEntityType, syncMemberSignatoryFromUserLink } from '@/lib/kyc/member-signatory-sync'
import { z } from 'zod'

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
// Note: ceo_users doesn't have a separate entity_id column (singleton pattern)
// Note: staff don't have a junction table
const ENTITY_ID_COLUMNS: Record<string, string> = {
  partner: 'partner_id',
  investor: 'investor_id',
  introducer: 'introducer_id',
  commercial_partner: 'commercial_partner_id',
  lawyer: 'lawyer_id',
  arranger: 'arranger_id',
  ceo: '', // CEO uses singleton pattern - no entity_id column
  staff: '' // Staff don't have entity_id - they're internal team
}

const SIGNATORY_ENTITY_TYPES = new Set<SignatoryEntityType>([
  'investor',
  'partner',
  'introducer',
  'lawyer',
  'commercial_partner',
  'arranger',
])

// Redirect URLs per entity type
const REDIRECT_URLS: Record<string, string> = {
  partner: '/versotech_main/partner-profile',
  investor: '/versotech_main/profile',
  introducer: '/versotech_main/introducer-profile',
  commercial_partner: '/versotech_main/commercial-partner-profile',
  lawyer: '/versotech_main/lawyer-profile',
  arranger: '/versotech_main/arranger-profile',
  ceo: '/versotech_main/ceo-profile',
  staff: '/versotech_main/dashboard' // Staff go to main dashboard
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

    const rollbackNewUser = async () => {
      await serviceSupabase
        .from('profiles')
        .delete()
        .eq('id', authData.user.id)
      await serviceSupabase.auth.admin.deleteUser(authData.user.id)
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
      // Prevent orphaned auth users without profile records.
      await rollbackNewUser()
      return NextResponse.json({
        error: 'Failed to create account profile. Please try again.'
      }, { status: 500 })
    }

    // Create the user-entity link
    // Since this invitation was CEO-approved before the email was sent,
    // the new member is automatically CEO-approved
    const userTable = USER_TABLES[invitation.entity_type]
    const entityIdColumn = ENTITY_ID_COLUMNS[invitation.entity_type]

    // Handle staff entity type separately - they don't have a junction table
    const invitationMetadata = (invitation.metadata as Record<string, any> | null) || {}
    const invitationIsPrimary = Boolean(invitationMetadata.is_primary)

    if (invitation.entity_type === 'staff') {
      // Staff: Update profile with staff role and create permissions
      const metadata = invitationMetadata

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
        .eq('id', authData.user.id)

      if (profileUpdateError) {
        console.error('Error updating staff profile:', profileUpdateError)
        await rollbackNewUser()
        return NextResponse.json({
          error: 'Failed to configure your staff access. Please ask support to resend your invitation.'
        }, { status: 500 })
      }

      // Create staff permissions from metadata
      const permissions = (metadata.permissions as string[]) || []
      if (permissions.length > 0) {
        const permissionRecords = permissions.map((permission: string) => ({
          user_id: authData.user.id,
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
        .eq('user_id', authData.user.id)
        .maybeSingle()

      if (ceoLookupError) {
        console.error('Error checking staff ceo_users link:', ceoLookupError)
        await rollbackNewUser()
        return NextResponse.json({
          error: 'Failed to configure your staff access. Please ask support to resend your invitation.'
        }, { status: 500 })
      }

      if (!existingCeoUser) {
        const { error: ceoUserError } = await serviceSupabase
          .from('ceo_users')
          .insert({
            user_id: authData.user.id,
            role: 'admin',
            is_primary: invitationIsPrimary,
            can_sign: true,
            title: metadata.title || invitation.role || 'Staff',
            created_by: invitation.invited_by,
            created_at: new Date().toISOString()
          })

        // Ignore duplicate key errors (race condition), fail on everything else.
        if (ceoUserError && ceoUserError.code !== '23505') {
          console.error('Error adding staff to ceo_users:', ceoUserError)
          await rollbackNewUser()
          return NextResponse.json({
            error: 'Failed to configure your staff access. Please ask support to resend your invitation.'
          }, { status: 500 })
        }
      }
    } else {
      // Non-staff entity types - create junction table records
      let insertData: Record<string, any>

      if (invitation.entity_type === 'ceo') {
        // CEO uses singleton pattern - no entity_id column
        insertData = {
          user_id: authData.user.id,
          role: invitation.role,
          is_primary: invitationIsPrimary,
          can_sign: invitation.is_signatory || false,
          title: invitation.role === 'admin' ? 'Administrator' : invitation.role
        }
      } else {
        // Standard entity types have entity_id columns
        insertData = {
          user_id: authData.user.id,
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

      const { error: junctionError } = await serviceSupabase
        .from(userTable)
        .insert(insertData)

      if (junctionError) {
        console.error('Error creating membership:', junctionError)
        // Prevent a half-created account (valid auth user but no entity access).
        await rollbackNewUser()

        return NextResponse.json({
          error: 'Failed to link your account to the invited entity. Please ask support to resend your invitation.'
        }, { status: 500 })
      }

      if (SIGNATORY_ENTITY_TYPES.has(invitation.entity_type as SignatoryEntityType)) {
        await syncMemberSignatoryFromUserLink({
          supabase: serviceSupabase,
          entityType: invitation.entity_type as SignatoryEntityType,
          entityId: invitation.entity_id,
          userId: authData.user.id,
          canSign: Boolean(invitation.is_signatory),
          userEmail: invitation.email,
        })
      }
    }

    // Screen new user against compliance blacklist (alert only, do not block)
    try {
      const matches = await screenAgainstBlacklist(serviceSupabase, {
        email: invitation.email,
        fullName: display_name,
        entityName: invitation.entity_name || null
      })

      await logBlacklistMatches({
        supabase: serviceSupabase,
        matches,
        context: 'signup',
        input: {
          email: invitation.email,
          fullName: display_name,
          entityName: invitation.entity_name || null
        },
        subjectLabel: display_name || invitation.email,
        matchedUserId: authData.user.id,
        matchedInvestorId: invitation.entity_type === 'investor' ? invitation.entity_id : null,
        relatedInvestorId: invitation.entity_type === 'investor' ? invitation.entity_id : null,
        actorId: invitation.invited_by || authData.user.id,
        actionLabel: 'alerted_on_signup'
      })
    } catch (error) {
      console.error('[signup blacklist] Screening failed:', error)
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
