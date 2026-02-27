import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getAppUrl } from '@/lib/signature/token'
import { sendInvitationEmail } from '@/lib/email/resend-service'

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

// Valid roles per entity type
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

const PROFILE_ROLE_BY_ENTITY: Record<string, string> = {
  investor: 'investor',
  arranger: 'arranger',
  lawyer: 'lawyer',
  introducer: 'introducer',
  partner: 'partner',
  commercial_partner: 'commercial_partner',
}

// Single invite schema
const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  title: z.string().optional(),
  role: z.string().optional(),
  is_primary: z.boolean().default(false),
})

// Batch invite schema
const batchInviteSchema = z.object({
  entity_type: z.enum(['investor', 'arranger', 'lawyer', 'introducer', 'partner', 'commercial_partner']),
  entity_id: z.string().uuid('Invalid entity ID').optional(), // Optional - if not provided, creates new entities
  create_entities: z.boolean().default(false), // If true, create new entity for each invite
  invites: z.array(inviteSchema).min(1, 'At least one invite required').max(100, 'Maximum 100 invites per batch'),
})

interface InviteResult {
  invitation_id?: string
  email: string
  success: boolean
  user_id?: string
  entity_id?: string
  is_new_user?: boolean
  error?: string
}

/**
 * Batch invite users to entities
 * Supports both:
 * 1. Inviting multiple users to the same entity
 * 2. Creating new entities for each user (for onboarding existing customers)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check permissions - CEO or super_admin required for batch operations
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: permissions } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['super_admin', 'manage_investors'])

    const isCEO = profile?.role === 'staff_admin' || profile?.role === 'ceo'
    const hasPermission = permissions && permissions.length > 0

    if (!isCEO && !hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions for batch operations' }, { status: 403 })
    }

    // Parse and validate request
    const body = await request.json()
    const validatedData = batchInviteSchema.parse(body)
    const { entity_type, entity_id, create_entities, invites } = validatedData

    // If linking to existing entity, verify it exists
    if (entity_id && !create_entities) {
      const entityTable = ENTITY_TABLES[entity_type]
      const { data: entity, error: entityError } = await supabase
        .from(entityTable)
        .select('id')
        .eq('id', entity_id)
        .single()

      if (entityError || !entity) {
        return NextResponse.json({ error: `${entity_type} entity not found` }, { status: 404 })
      }
    }

    const results: InviteResult[] = []
    const appUrl = getAppUrl()

    // Process each invite
    for (const invite of invites) {
      try {
        const role = invite.role || DEFAULT_ROLE_BY_ENTITY[entity_type]
        const validRoles = VALID_ROLES_BY_ENTITY[entity_type]

        if (!validRoles.includes(role)) {
          results.push({
            email: invite.email,
            success: false,
            error: `Invalid role '${role}' for ${entity_type}`,
          })
          continue
        }

        let targetEntityId = entity_id

        // Create new entity if requested
        if (create_entities || !entity_id) {
          const entityTable = ENTITY_TABLES[entity_type]

          // Build entity data based on type
          const entityData: Record<string, unknown> = {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          // Set entity-specific fields
          if (entity_type === 'investor') {
            entityData.legal_name = invite.display_name
            entityData.display_name = invite.display_name
            entityData.status = 'pending_kyc'
            entityData.type = 'individual'
          } else if (entity_type === 'partner') {
            entityData.legal_name = invite.display_name
            entityData.display_name = invite.display_name
            entityData.status = 'active'
            entityData.partner_type = 'co-investor'
          } else if (entity_type === 'introducer') {
            entityData.legal_name = invite.display_name
            entityData.display_name = invite.display_name
            entityData.status = 'active'
          } else {
            // Generic fields for other entity types
            entityData.name = invite.display_name
            entityData.status = 'active'
          }

          const { data: newEntity, error: createError } = await supabase
            .from(entityTable)
            .insert(entityData)
            .select('id')
            .single()

          if (createError || !newEntity) {
            results.push({
              email: invite.email,
              success: false,
              error: `Failed to create ${entity_type}: ${createError?.message || 'Unknown error'}`,
            })
            continue
          }

          targetEntityId = newEntity.id
        }

        // Check if user already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('email', invite.email)
          .maybeSingle()

        if (existingProfile) {
          const normalizedProfileRole = PROFILE_ROLE_BY_ENTITY[entity_type]
          const currentProfileRole = (existingProfile as { role?: string | null }).role ?? null
          if (normalizedProfileRole && (!currentProfileRole || currentProfileRole === 'multi_persona')) {
            const { error: roleUpdateError } = await supabase
              .from('profiles')
              .update({
                role: normalizedProfileRole,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingProfile.id)

            if (roleUpdateError) {
              results.push({
                email: invite.email,
                success: false,
                error: `Failed to normalize user role: ${roleUpdateError.message}`,
              })
              continue
            }
          }

          // Link existing user to entity
          const junctionTable = JUNCTION_TABLES[entity_type]
          const entityIdColumn = ENTITY_ID_COLUMNS[entity_type]

          // Check if already linked
          const { data: existingLink } = await supabase
            .from(junctionTable)
            .select('user_id')
            .eq('user_id', existingProfile.id)
            .eq(entityIdColumn, targetEntityId)
            .single()

          if (existingLink) {
            results.push({
              email: invite.email,
              success: false,
              error: 'User already linked to this entity',
            })
            continue
          }

          // Create junction record
          const junctionData: Record<string, unknown> = {
            user_id: existingProfile.id,
            [entityIdColumn]: targetEntityId,
            role: role,
            is_primary: invite.is_primary,
            created_at: new Date().toISOString(),
          }

          const { error: linkError } = await supabase
            .from(junctionTable)
            .insert(junctionData)

          if (linkError) {
            results.push({
              email: invite.email,
              success: false,
              error: `Failed to link user: ${linkError.message}`,
            })
            continue
          }

          results.push({
            email: invite.email,
            success: true,
            user_id: existingProfile.id,
            entity_id: targetEntityId,
            is_new_user: false,
          })
        } else {
          // CUSTOM INVITATION FLOW - uses member_invitations + Resend email
          const { data: inviterProfile } = await supabase
            .from('profiles').select('display_name, email').eq('id', user.id).single()
          const inviterName = inviterProfile?.display_name || inviterProfile?.email || 'V E R S O'

          // Check for existing pending invitation
          const { data: existingInv } = await supabase
            .from('member_invitations')
            .select('id')
            .eq('entity_type', entity_type)
            .eq('entity_id', targetEntityId)
            .eq('email', invite.email.toLowerCase())
            .eq('status', 'pending')
            .maybeSingle()

          if (existingInv) {
            results.push({ email: invite.email, success: false, error: 'Pending invitation already exists' })
            continue
          }

          // Create invitation record
          const { data: invitation, error: invErr } = await supabase
            .from('member_invitations')
            .insert({
              entity_type,
              entity_id: targetEntityId,
              entity_name: invite.display_name,
              email: invite.email.toLowerCase(),
              role: role,
              is_signatory: false,
              invited_by: user.id,
              invited_by_name: inviterName,
              status: 'pending',
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              sent_at: new Date().toISOString(),
              reminder_count: 0,
              last_reminded_at: null
            })
            .select()
            .single()

          if (invErr || !invitation) {
            console.error('Invitation error:', invErr)
            results.push({ email: invite.email, success: false, error: 'Failed to create invitation' })
            continue
          }

          // Send custom email via Resend
          const acceptUrl = `${appUrl}/invitation/accept?token=${invitation.invitation_token}`
          await sendInvitationEmail({
            email: invite.email,
            inviteeName: invite.display_name,
            entityName: invite.display_name,
            entityType: entity_type,
            role: role,
            inviterName: inviterName,
            acceptUrl: acceptUrl,
            expiresAt: invitation.expires_at
          })

          results.push({
            email: invite.email,
            success: true,
            invitation_id: invitation.id,
            entity_id: targetEntityId,
            is_new_user: true,
          })
        }
      } catch (inviteError) {
        results.push({
          email: invite.email,
          success: false,
          error: inviteError instanceof Error ? inviteError.message : 'Unknown error',
        })
      }
    }

    // Log batch operation
    await supabase.from('audit_logs').insert({
      event_type: 'authorization',
      actor_id: user.id,
      action: 'batch_invite',
      entity_type: entity_type,
      entity_id: entity_id || null,
      action_details: {
        total_invites: invites.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        create_entities: create_entities,
      },
      timestamp: new Date().toISOString(),
    })

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Batch invite completed: ${successCount} successful, ${failCount} failed`,
      total: invites.length,
      successful: successCount,
      failed: failCount,
      results,
    })
  } catch (error) {
    console.error('Batch invite error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
