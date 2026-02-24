import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isStaffUser } from '@/lib/api-auth'
import { z } from 'zod'
import { getAppUrl } from '@/lib/signature/token'
import { sendInvitationEmail } from '@/lib/email/resend-service'
import { SignatoryEntityType, syncMemberSignatoryFromUserLink } from '@/lib/kyc/member-signatory-sync'

// Entity type to junction table mapping
const JUNCTION_TABLES: Record<string, string> = {
  investor: 'investor_users',
  arranger: 'arranger_users',
  lawyer: 'lawyer_users',
  introducer: 'introducer_users',
  partner: 'partner_users',
  commercial_partner: 'commercial_partner_users',
}

// Entity type to entity table mapping
const ENTITY_TABLES: Record<string, string> = {
  investor: 'investors',
  arranger: 'arranger_entities',
  lawyer: 'lawyers',
  introducer: 'introducers',
  partner: 'partners',
  commercial_partner: 'commercial_partners',
}

// Entity type to ID column mapping in junction tables
const ENTITY_ID_COLUMNS: Record<string, string> = {
  investor: 'investor_id',
  arranger: 'arranger_id',
  lawyer: 'lawyer_id',
  introducer: 'introducer_id',
  partner: 'partner_id',
  commercial_partner: 'commercial_partner_id',
}

const SIGNATORY_ENTITY_TYPES = new Set<SignatoryEntityType>([
  'investor',
  'partner',
  'introducer',
  'lawyer',
  'commercial_partner',
  'arranger',
])

// Valid roles per entity type (from database constraints)
const VALID_ROLES_BY_ENTITY: Record<string, string[]> = {
  investor: ['admin', 'member', 'viewer'],
  arranger: ['admin', 'member', 'viewer'],
  lawyer: ['admin', 'member', 'viewer'],
  partner: ['admin', 'member', 'viewer'],
  introducer: ['admin', 'contact', 'payment_contact', 'legal_contact'],
  commercial_partner: ['admin', 'contact', 'billing_contact', 'technical_contact'],
}

const DEFAULT_ROLE_BY_ENTITY: Record<string, string> = {
  investor: 'member',
  arranger: 'member',
  lawyer: 'member',
  partner: 'member',
  introducer: 'contact',
  commercial_partner: 'contact',
}

// Entity name columns vary by table
const ENTITY_NAME_COLUMNS: Record<string, { select: string; primary: string; fallback?: string }> = {
  investor: { select: 'legal_name', primary: 'legal_name' },
  arranger: { select: 'legal_name', primary: 'legal_name' },
  lawyer: { select: 'firm_name, display_name', primary: 'firm_name', fallback: 'display_name' },
  introducer: { select: 'legal_name', primary: 'legal_name' },
  partner: { select: 'legal_name, name', primary: 'legal_name', fallback: 'name' },
  commercial_partner: { select: 'legal_name, name', primary: 'legal_name', fallback: 'name' },
}

// Input validation schema
const inviteEntityUserSchema = z.object({
  entity_type: z.enum(['investor', 'arranger', 'lawyer', 'introducer', 'partner', 'commercial_partner']),
  entity_id: z.string().uuid('Invalid entity ID'),
  email: z.string().email('Invalid email address'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  title: z.string().nullable().optional(), // Allow null from client
  role: z.string().nullable().optional(), // Will use entity-specific default if not provided
  is_primary: z.boolean().default(true),
  is_signatory: z.boolean().optional().default(false),
  can_sign: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    // Use regular client for authentication (reads cookies)
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client for admin operations (bypasses RLS)
    const supabase = createServiceClient()

    // Keep invite authorization aligned with staff invite UX to avoid split behavior.
    const canInvite = await isStaffUser(authSupabase, user)
    if (!canInvite) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = inviteEntityUserSchema.parse(body)

    const { entity_type, entity_id, email, display_name, title, is_primary, is_signatory, can_sign } = validatedData
    const normalizedEmail = email.trim().toLowerCase()
    const linkCanSign = Boolean(is_signatory || can_sign)

    // Use entity-specific default role if not provided, and validate
    const role = validatedData.role || DEFAULT_ROLE_BY_ENTITY[entity_type]
    const validRoles = VALID_ROLES_BY_ENTITY[entity_type]
    if (!validRoles.includes(role)) {
      return NextResponse.json({
        error: `Invalid role '${role}' for ${entity_type}. Valid roles: ${validRoles.join(', ')}`
      }, { status: 400 })
    }

    // Check entity exists
    const entityTable = ENTITY_TABLES[entity_type]
    const { data: entity, error: entityError } = await supabase
      .from(entityTable)
      .select('id')
      .eq('id', entity_id)
      .single()

    if (entityError || !entity) {
      return NextResponse.json({ error: `${entity_type} entity not found` }, { status: 404 })
    }

    // Check if email already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (existingProfile) {
      // User exists - check if already linked to this entity
      const junctionTable = JUNCTION_TABLES[entity_type]
      const entityIdColumn = ENTITY_ID_COLUMNS[entity_type]

      const { data: existingLink } = await supabase
        .from(junctionTable)
        .select('user_id')
        .eq('user_id', existingProfile.id)
        .eq(entityIdColumn, entity_id)
        .single()

      if (existingLink) {
        return NextResponse.json({ error: 'User is already linked to this entity' }, { status: 400 })
      }

      // Link existing user to entity
      const junctionData: Record<string, unknown> = {
        user_id: existingProfile.id,
        [entityIdColumn]: entity_id,
        role: role,
        is_primary: is_primary,
        can_sign: linkCanSign,
        ceo_approval_status: 'approved',
        ceo_approved_at: new Date().toISOString(),
        created_by: user.id,
        created_at: new Date().toISOString(),
      }

      const { error: linkError } = await supabase
        .from(junctionTable)
        .insert(junctionData)

      if (linkError) {
        console.error('Link creation error:', linkError)
        return NextResponse.json({ error: 'Failed to link user to entity' }, { status: 500 })
      }

      if (SIGNATORY_ENTITY_TYPES.has(entity_type as SignatoryEntityType)) {
        await syncMemberSignatoryFromUserLink({
          supabase,
          entityType: entity_type as SignatoryEntityType,
          entityId: entity_id,
          userId: existingProfile.id,
          canSign: linkCanSign,
          userEmail: normalizedEmail,
        })
      }

      // Log the action
      await supabase.from('audit_logs').insert({
        event_type: 'authorization',
        actor_id: user.id,
        action: 'entity_user_linked',
        entity_type: entity_type,
        entity_id: entity_id,
        action_details: {
          user_id: existingProfile.id,
          email: normalizedEmail,
          role: role,
          is_primary: is_primary,
          is_signatory: linkCanSign,
        },
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        user_id: existingProfile.id,
        message: `Existing user linked to ${entity_type.replace('_', ' ')}`,
        is_new_user: false,
      })
    }

    // ============================================
    // CUSTOM INVITATION FLOW (replaces inviteUserByEmail)
    // ============================================

    // Get entity name for the invitation email
    const nameConfig = ENTITY_NAME_COLUMNS[entity_type]
    const { data: entityDetails, error: entityDetailsError } = await supabase
      .from(entityTable)
      .select(nameConfig.select)
      .eq('id', entity_id)
      .single()

    if (entityDetailsError || !entityDetails) {
      return NextResponse.json({ error: 'Failed to get entity details' }, { status: 500 })
    }

    const entityName = (entityDetails as any)[nameConfig.primary] ||
                       (nameConfig.fallback ? (entityDetails as any)[nameConfig.fallback] : null) ||
                       'Unknown Entity'

    // Get inviter's name
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .single()

    const inviterName = inviterProfile?.display_name || inviterProfile?.email || 'A team member'

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from('member_invitations')
      .select('id, status')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .eq('email', normalizedEmail)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingInvitation) {
      return NextResponse.json({
        error: 'A pending invitation already exists for this email. Use resend to send again.',
        existing_invitation_id: existingInvitation.id
      }, { status: 400 })
    }

    // Create invitation record (user account will be created when they accept)
    const { data: invitation, error: invitationError } = await supabase
      .from('member_invitations')
      .insert({
        entity_type,
        entity_id,
        entity_name: entityName,
        email: normalizedEmail,
        role: role,
        is_signatory: linkCanSign, // Map can_sign to is_signatory
        invited_by: user.id,
        invited_by_name: inviterName,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        sent_at: new Date().toISOString(),
        reminder_count: 0,
        last_reminded_at: null,
        metadata: {
          display_name,
          title: title || null,
          is_primary,
          can_sign: linkCanSign,
        }
      })
      .select()
      .single()

    if (invitationError || !invitation) {
      console.error('Invitation creation error:', invitationError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Construct accept URL
    const acceptUrl = `${getAppUrl()}/invitation/accept?token=${invitation.invitation_token}`

    // Send invitation email via Resend
    const emailResult = await sendInvitationEmail({
      email: normalizedEmail,
      inviteeName: display_name,
      entityName: entityName,
      entityType: entity_type,
      role: role,
      inviterName: inviterName,
      acceptUrl: acceptUrl,
      expiresAt: invitation.expires_at
    })

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error)
      try {
        await supabase.from('member_invitations').delete().eq('id', invitation.id)
      } catch (cleanupError) {
        console.error('Failed to cleanup invitation after email failure:', cleanupError)
      }
      return NextResponse.json(
        { error: 'Invitation email failed to send. Please verify the email domain and try again.' },
        { status: 502 }
      )
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      event_type: 'authorization',
      actor_id: user.id,
      action: 'entity_user_invited',
      entity_type: entity_type,
      entity_id: entity_id,
      action_details: {
        invitation_id: invitation.id,
        email: normalizedEmail,
        display_name: display_name,
        role: role,
        is_primary: is_primary,
        is_signatory: linkCanSign,
        email_sent: emailResult.success
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      invitation_id: invitation.id,
      message: `Invitation sent to ${normalizedEmail}`,
      is_new_user: true,
      email_sent: true,
      accept_url: acceptUrl // For debugging/testing
    })
  } catch (error) {
    console.error('Entity invite error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
