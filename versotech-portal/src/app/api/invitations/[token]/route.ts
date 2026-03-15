import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { SignatoryEntityType, syncMemberSignatoryFromUserLink } from '@/lib/kyc/member-signatory-sync'
import {
  enrichMemberRecordFromInvitation,
  isExternalInvitationEntityType,
  normalizeInvitationMetadata,
  rollbackMemberRecordEnrichment,
} from '@/lib/invitations/entity-invitation'

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

const SIGNATORY_ENTITY_TYPES = new Set<SignatoryEntityType>([
  'investor',
  'partner',
  'introducer',
  'lawyer',
  'commercial_partner',
  'arranger',
])

const PROFILE_ROLE_BY_ENTITY: Record<string, string> = {
  partner: 'partner',
  investor: 'investor',
  introducer: 'introducer',
  commercial_partner: 'commercial_partner',
  lawyer: 'lawyer',
  arranger: 'arranger',
  ceo: 'ceo',
}

const STAFF_PROFILE_ROLES = ['staff_admin', 'staff_ops', 'staff_rm', 'ceo'] as const

function resolveProfileRoleFromInvitation(entityType: string, invitationRole: string | null | undefined): string | null {
  if (entityType === 'staff') {
    return typeof invitationRole === 'string' && invitationRole.length > 0 ? invitationRole : null
  }

  return PROFILE_ROLE_BY_ENTITY[entityType] ?? null
}

function getInvitationStatusError(status: string | null | undefined) {
  const normalizedStatus = (status || '').toLowerCase().trim()

  if (normalizedStatus === 'accepted') {
    return {
      error: 'This invitation has already been accepted. Please sign in.',
      status: 'accepted',
    }
  }

  if (normalizedStatus === 'expired') {
    return {
      error: 'This invitation has expired',
      status: 'expired',
    }
  }

  return {
    error: `This invitation has already been ${normalizedStatus || 'used'}`,
    status: normalizedStatus || 'used',
  }
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

    // Check if already used
    if (invitation.status !== 'pending') {
      return NextResponse.json(getInvitationStatusError(invitation.status), { status: 400 })
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({
        error: 'This invitation has expired',
        status: 'expired'
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

    // Check if already used
    if (invitation.status !== 'pending') {
      return NextResponse.json(getInvitationStatusError(invitation.status), { status: 400 })
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      await serviceSupabase
        .from('member_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json({ error: 'This invitation has expired', status: 'expired' }, { status: 400 })
    }

    const invitedProfileRole = resolveProfileRoleFromInvitation(invitation.entity_type, invitation.role)
    if (!invitedProfileRole) {
      return NextResponse.json({ error: 'Invalid invitation role configuration' }, { status: 400 })
    }

    const invitationMetadata = normalizeInvitationMetadata(invitation.metadata, {
      canSign: Boolean(invitation.is_signatory),
    })
    const invitationCanSign = invitationMetadata.canSign || Boolean(invitation.is_signatory)

    // Enforce that the signed-in account matches the invited email.
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('email, display_name, title, role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.email || profile.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json({
        error: `This invitation was sent to ${invitation.email}. Please sign in with that email to continue.`
      }, { status: 403 })
    }

    const rollbackSteps: Array<() => Promise<void>> = []
    const runRollbackSteps = async () => {
      for (const rollbackStep of [...rollbackSteps].reverse()) {
        try {
          await rollbackStep()
        } catch (rollbackError) {
          console.error('Failed to rollback invitation acceptance step:', rollbackError)
        }
      }
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
      const { error: existingStatusError } = await serviceSupabase
        .from('member_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by_user_id: user.id
        })
        .eq('id', invitation.id)

      if (existingStatusError) {
        console.error('Error accepting already-linked invitation:', existingStatusError)
        return NextResponse.json({ error: 'Failed to finalize invitation' }, { status: 500 })
      }

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
        role: invitedProfileRole, // staff_admin, staff_ops, staff_rm, ceo
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

      rollbackSteps.push(rollbackStaffProfile)

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

        if (!ceoUserError) {
          rollbackSteps.push(async () => {
            const { error: rollbackCeoUserError } = await serviceSupabase
              .from('ceo_users')
              .delete()
              .eq('user_id', user.id)

            if (rollbackCeoUserError) {
              console.error('Failed to rollback ceo_users link for staff invitation:', rollbackCeoUserError)
            }
          })
        }
      }
    } else {
      // Non-staff entity types - create junction table records
      let insertData: Record<string, any>

      const invitationIsPrimary = invitationMetadata.isPrimary

      if (invitation.entity_type === 'ceo') {
        // CEO uses singleton pattern - no entity_id column
        insertData = {
          user_id: user.id,
          role: invitation.role,
          is_primary: invitationIsPrimary,
          can_sign: invitationCanSign,
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
        insertData.can_sign = invitationCanSign
      }

      const { error: insertError } = await serviceSupabase
        .from(userTable)
        .insert(insertData)

      if (insertError) {
        console.error('Error creating membership:', insertError)
        return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 })
      }

      rollbackSteps.push(async () => {
        let deleteQuery = serviceSupabase
          .from(userTable)
          .delete()
          .eq('user_id', user.id)

        if (invitation.entity_type !== 'ceo') {
          deleteQuery = deleteQuery.eq(entityIdColumn, invitation.entity_id)
        }

        const { error: rollbackMembershipError } = await deleteQuery
        if (rollbackMembershipError) {
          console.error('Failed to rollback invitation membership link:', rollbackMembershipError)
        }
      })

      if (isExternalInvitationEntityType(invitation.entity_type)) {
        try {
          const enrichmentResult = await enrichMemberRecordFromInvitation({
            supabase: serviceSupabase,
            entityType: invitation.entity_type,
            entityId: invitation.entity_id,
            userId: user.id,
            userEmail: profile?.email || invitation.email,
            displayName: profile?.display_name || invitationMetadata.displayName || invitation.email,
            title: invitationMetadata.title,
            canSign: invitationCanSign,
            createdBy: invitation.invited_by,
          })

          if (enrichmentResult.rollback) {
            rollbackSteps.push(async () => {
              await rollbackMemberRecordEnrichment({
                supabase: serviceSupabase,
                rollback: enrichmentResult.rollback,
              })
            })
          }
        } catch (enrichmentError) {
          console.error('Error enriching member record during invitation acceptance:', enrichmentError)
          await runRollbackSteps()
          return NextResponse.json({ error: 'Failed to finish invitation setup' }, { status: 500 })
        }
      }

      if (SIGNATORY_ENTITY_TYPES.has(invitation.entity_type as SignatoryEntityType)) {
        try {
          await syncMemberSignatoryFromUserLink({
            supabase: serviceSupabase,
            entityType: invitation.entity_type as SignatoryEntityType,
            entityId: invitation.entity_id,
            userId: user.id,
            canSign: invitationCanSign,
            userEmail: profile?.email || invitation.email,
          })
        } catch (signatorySyncError) {
          console.error('Error syncing signatory status during invitation acceptance:', signatorySyncError)
          await runRollbackSteps()
          return NextResponse.json({ error: 'Failed to finish invitation setup' }, { status: 500 })
        }
      }

      // Normalize legacy role label only when safe:
      // - Remove stale multi_persona
      // - Fill missing role
      // - Promote CEO invitees to ceo when they are not already staff
      const currentRole = profile.role as string | null
      const isStaffProfileRole = STAFF_PROFILE_ROLES.includes((currentRole || '') as (typeof STAFF_PROFILE_ROLES)[number])
      const shouldNormalizeLegacyRole = !currentRole || currentRole === 'multi_persona'
      const shouldPromoteToCeoRole = invitation.entity_type === 'ceo' && !isStaffProfileRole
      const shouldBackfillDisplayName =
        !profile.display_name && Boolean(invitationMetadata.displayName)
      const shouldBackfillTitle =
        !profile.title && Boolean(invitationMetadata.title)

      const profileUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (shouldNormalizeLegacyRole || shouldPromoteToCeoRole) {
        profileUpdate.role = invitedProfileRole
      }

      if (shouldBackfillDisplayName && invitationMetadata.displayName) {
        profileUpdate.display_name = invitationMetadata.displayName
      }

      if (shouldBackfillTitle && invitationMetadata.title) {
        profileUpdate.title = invitationMetadata.title
      }

      if (Object.keys(profileUpdate).length > 1) {
        const { error: normalizeRoleError } = await serviceSupabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', user.id)

        if (normalizeRoleError) {
          console.error('Error normalizing profile after invitation acceptance:', normalizeRoleError)
          await runRollbackSteps()
          return NextResponse.json({ error: 'Failed to normalize profile' }, { status: 500 })
        }

        rollbackSteps.push(async () => {
          const { error: rollbackProfileError } = await serviceSupabase
            .from('profiles')
            .update({
              role: profile.role,
              display_name: profile.display_name,
              title: profile.title,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          if (rollbackProfileError) {
            console.error('Failed to rollback profile after invitation acceptance error:', rollbackProfileError)
          }
        })
      }
    }

    // Update invitation status
    const { error: invitationStatusError } = await serviceSupabase
      .from('member_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: user.id
      })
      .eq('id', invitation.id)

    if (invitationStatusError) {
      console.error('Error finalizing invitation status:', invitationStatusError)
      await runRollbackSteps()
      return NextResponse.json({ error: 'Failed to finalize invitation' }, { status: 500 })
    }

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
