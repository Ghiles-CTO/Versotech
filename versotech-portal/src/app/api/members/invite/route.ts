import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendInvitationEmail } from '@/lib/email/resend-service'

// Valid entity types for member invitations
const VALID_ENTITY_TYPES = ['partner', 'investor', 'introducer', 'commercial_partner', 'lawyer', 'arranger'] as const
type EntityType = typeof VALID_ENTITY_TYPES[number]

// Entity table mapping
const ENTITY_TABLES: Record<EntityType, string> = {
  partner: 'partners',
  investor: 'investors',
  introducer: 'introducers',
  commercial_partner: 'commercial_partners',
  lawyer: 'lawyers',
  arranger: 'arranger_entities'
}

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

// Entity name columns vary by table - specify which columns to select and use
const ENTITY_NAME_COLUMNS: Record<EntityType, { select: string; primary: string; fallback?: string }> = {
  partner: { select: 'legal_name, name', primary: 'legal_name', fallback: 'name' },
  investor: { select: 'legal_name', primary: 'legal_name' },
  introducer: { select: 'legal_name', primary: 'legal_name' },
  commercial_partner: { select: 'legal_name, name', primary: 'legal_name', fallback: 'name' },
  lawyer: { select: 'firm_name, display_name', primary: 'firm_name', fallback: 'display_name' },
  arranger: { select: 'legal_name', primary: 'legal_name' }
}

/**
 * POST /api/members/invite
 * Create a new member invitation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { entity_type, entity_id, email, role = 'member', is_signatory = false } = body

    // Validate required fields
    if (!entity_type || !entity_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: entity_type, entity_id, email' },
        { status: 400 }
      )
    }

    // Validate entity type
    if (!VALID_ENTITY_TYPES.includes(entity_type)) {
      return NextResponse.json(
        { error: `Invalid entity_type. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()

    // Verify user has permission to invite (must be admin/owner of the entity)
    const userTable = USER_TABLES[entity_type as EntityType]
    const entityIdColumn = ENTITY_ID_COLUMNS[entity_type as EntityType]

    const { data: userMembership, error: membershipError } = await serviceSupabase
      .from(userTable)
      .select('role, is_primary')
      .eq('user_id', user.id)
      .eq(entityIdColumn, entity_id)
      .maybeSingle()

    if (membershipError) {
      console.error('Error checking membership:', membershipError)
      return NextResponse.json({ error: 'Failed to verify permissions' }, { status: 500 })
    }

    if (!userMembership) {
      return NextResponse.json(
        { error: 'You are not a member of this entity' },
        { status: 403 }
      )
    }

    // Only admins/owners or primary contacts can invite
    const canInvite = userMembership.is_primary || ['admin', 'owner'].includes(userMembership.role)
    if (!canInvite) {
      return NextResponse.json(
        { error: 'Only administrators can invite new members' },
        { status: 403 }
      )
    }

    // Get entity name for the invitation email
    // Use entity-specific column names since tables have different schemas
    const entityTable = ENTITY_TABLES[entity_type as EntityType]
    const nameConfig = ENTITY_NAME_COLUMNS[entity_type as EntityType]

    const { data: entity, error: entityError } = await serviceSupabase
      .from(entityTable)
      .select(nameConfig.select)
      .eq('id', entity_id)
      .maybeSingle()

    if (entityError || !entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // Get entity name using the configured column names
    const entityName = (entity as any)[nameConfig.primary] ||
                       (nameConfig.fallback ? (entity as any)[nameConfig.fallback] : null) ||
                       'Unknown Entity'

    // Get inviter's name
    const { data: inviterProfile } = await serviceSupabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .maybeSingle()

    const inviterName = inviterProfile?.display_name || inviterProfile?.email || 'A team member'

    // Check if user is already a member
    const { data: existingUser } = await serviceSupabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      // Check if already a member of this entity
      // Note: We select 'user_id' instead of 'id' because some tables use composite keys
      const { data: existingMembership } = await serviceSupabase
        .from(userTable)
        .select('user_id')
        .eq('user_id', existingUser.id)
        .eq(entityIdColumn, entity_id)
        .maybeSingle()

      if (existingMembership) {
        return NextResponse.json(
          { error: 'This user is already a member of this entity' },
          { status: 400 }
        )
      }
    }

    // Check for existing pending or pending_approval invitation
    const { data: existingInvitation } = await serviceSupabase
      .from('member_invitations')
      .select('id, status')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .eq('email', email.toLowerCase())
      .in('status', ['pending', 'pending_approval'])
      .maybeSingle()

    if (existingInvitation) {
      const statusMsg = existingInvitation.status === 'pending_approval'
        ? 'An invitation is already awaiting CEO approval for this email'
        : 'A pending invitation already exists for this email'
      return NextResponse.json(
        { error: statusMsg },
        { status: 400 }
      )
    }

    // Create the invitation with 'pending_approval' status
    // The database trigger will automatically create a CEO approval request
    const { data: invitation, error: insertError } = await serviceSupabase
      .from('member_invitations')
      .insert({
        entity_type,
        entity_id,
        entity_name: entityName,
        email: email.toLowerCase(),
        role,
        is_signatory,
        invited_by: user.id,
        invited_by_name: inviterName,
        status: 'pending_approval', // Changed: requires CEO approval before email is sent
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from approval
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating invitation:', insertError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // NOTE: Email is NOT sent here anymore
    // Email will be sent when CEO approves the invitation via /api/approvals/[id]/action
    // The approval is automatically created by the database trigger

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        is_signatory: invitation.is_signatory,
        status: 'pending_approval'
      },
      requires_approval: true,
      message: `Invitation request created for ${email}. Awaiting CEO approval before the invitation email is sent.`
    })

  } catch (error) {
    console.error('Error in POST /api/members/invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/members/invite?entity_type=xxx&entity_id=xxx
 * List invitations for an entity
 */
export async function GET(request: NextRequest) {
  try {
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

    // Verify user is a member of this entity
    // Note: We select 'user_id' instead of 'id' because some tables use composite keys
    const userTable = USER_TABLES[entity_type as EntityType]
    const entityIdColumn = ENTITY_ID_COLUMNS[entity_type as EntityType]

    const { data: membership } = await serviceSupabase
      .from(userTable)
      .select('user_id')
      .eq('user_id', user.id)
      .eq(entityIdColumn, entity_id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this entity' },
        { status: 403 }
      )
    }

    // Get invitations
    const { data: invitations, error: fetchError } = await serviceSupabase
      .from('member_invitations')
      .select('id, email, role, is_signatory, status, invited_by_name, expires_at, created_at, accepted_at, invitation_token')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching invitations:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    return NextResponse.json({ invitations: invitations || [] })

  } catch (error) {
    console.error('Error in GET /api/members/invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/members/invite?id=xxx
 * Cancel an invitation
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json({ error: 'Missing invitation id' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()

    // Get the invitation
    const { data: invitation, error: fetchError } = await serviceSupabase
      .from('member_invitations')
      .select('id, entity_type, entity_id, status, invited_by')
      .eq('id', invitationId)
      .maybeSingle()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (!['pending', 'pending_approval'].includes(invitation.status)) {
      return NextResponse.json(
        { error: 'Only pending invitations can be cancelled' },
        { status: 400 }
      )
    }

    // Verify user has permission (must be the inviter or an admin)
    const userTable = USER_TABLES[invitation.entity_type as EntityType]
    const entityIdColumn = ENTITY_ID_COLUMNS[invitation.entity_type as EntityType]

    const { data: membership } = await serviceSupabase
      .from(userTable)
      .select('role, is_primary')
      .eq('user_id', user.id)
      .eq(entityIdColumn, invitation.entity_id)
      .maybeSingle()

    const canCancel = invitation.invited_by === user.id ||
                      membership?.is_primary ||
                      ['admin', 'owner'].includes(membership?.role || '')

    if (!canCancel) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this invitation' },
        { status: 403 }
      )
    }

    // Cancel the invitation
    const { error: updateError } = await serviceSupabase
      .from('member_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)

    if (updateError) {
      console.error('Error cancelling invitation:', updateError)
      return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 })
    }

    // If there was a pending approval, cancel it too
    if (invitation.status === 'pending_approval') {
      await serviceSupabase
        .from('approvals')
        .update({ status: 'cancelled', resolved_at: new Date().toISOString() })
        .eq('entity_type', 'member_invitation')
        .eq('entity_id', invitationId)
        .eq('status', 'pending')
    }

    return NextResponse.json({ success: true, message: 'Invitation cancelled' })

  } catch (error) {
    console.error('Error in DELETE /api/members/invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
