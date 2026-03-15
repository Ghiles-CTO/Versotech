import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getAppUrl } from '@/lib/signature/token'
import { sendInvitationEmail } from '@/lib/email/resend-service'
import { SignatoryEntityType, syncMemberSignatoryFromUserLink } from '@/lib/kyc/member-signatory-sync'
import {
  enrichMemberRecordFromInvitation,
  rollbackMemberRecordEnrichment,
} from '@/lib/invitations/entity-invitation'

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

const ENTITY_NAME_COLUMNS: Record<string, { select: string; primary: string; fallback?: string }> = {
  investor: { select: 'legal_name', primary: 'legal_name' },
  arranger: { select: 'legal_name', primary: 'legal_name' },
  lawyer: { select: 'firm_name, display_name', primary: 'firm_name', fallback: 'display_name' },
  introducer: { select: 'legal_name, display_name', primary: 'legal_name', fallback: 'display_name' },
  partner: { select: 'legal_name, name', primary: 'legal_name', fallback: 'name' },
  commercial_partner: { select: 'legal_name, name', primary: 'legal_name', fallback: 'name' },
}

const SIGNATORY_ENTITY_TYPES = new Set<SignatoryEntityType>([
  'investor',
  'partner',
  'introducer',
  'lawyer',
  'commercial_partner',
  'arranger',
])

// Single invite schema
const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  entity_name: z.string().optional(),
  title: z.string().optional(),
  role: z.string().optional(),
  is_primary: z.boolean().default(false),
  is_signatory: z.boolean().default(false),
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

    let sharedEntityName: string | null = null

    // If linking to existing entity, verify it exists
    if (entity_id && !create_entities) {
      const entityTable = ENTITY_TABLES[entity_type]
      const nameConfig = ENTITY_NAME_COLUMNS[entity_type]
      const { data: entity, error: entityError } = await supabase
        .from(entityTable)
        .select(`id, ${nameConfig.select}`)
        .eq('id', entity_id)
        .single()

      if (entityError || !entity) {
        return NextResponse.json({ error: `${entity_type} entity not found` }, { status: 404 })
      }

      const entityRecord = entity as unknown as Record<string, unknown>
      const primaryNameValue = entityRecord[nameConfig.primary]
      const fallbackNameValue = nameConfig.fallback ? entityRecord[nameConfig.fallback] : null
      const primaryName =
        typeof primaryNameValue === 'string' && primaryNameValue.trim().length > 0
          ? primaryNameValue
          : null
      const fallbackName =
        typeof fallbackNameValue === 'string' && fallbackNameValue.trim().length > 0
          ? fallbackNameValue
          : null

      sharedEntityName = primaryName || fallbackName || null
    }

    const results: InviteResult[] = []
    const appUrl = getAppUrl()

    // Process each invite
    for (const invite of invites) {
      try {
        const role = (invite.role || DEFAULT_ROLE_BY_ENTITY[entity_type]).trim().toLowerCase()
        const validRoles = VALID_ROLES_BY_ENTITY[entity_type]
        const normalizedEmail = invite.email.trim().toLowerCase()
        const normalizedDisplayName = invite.display_name.trim()
        const normalizedEntityName = invite.entity_name?.trim() || null
        const normalizedTitle = invite.title?.trim() || null
        const linkCanSign = Boolean(invite.is_signatory)

        if (!validRoles.includes(role)) {
          results.push({
            email: invite.email,
            success: false,
            error: `Invalid role '${role}' for ${entity_type}`,
          })
          continue
        }

        let targetEntityId = entity_id
        let targetEntityName = sharedEntityName || normalizedDisplayName

        // Create new entity if requested
        if (create_entities || !entity_id) {
          if (!normalizedEntityName || normalizedEntityName.length < 2) {
            results.push({
              email: invite.email,
              success: false,
              error: 'Entity name is required when creating a new entity',
            })
            continue
          }

          const entityTable = ENTITY_TABLES[entity_type]

          // Build entity data based on type
          const entityData: Record<string, unknown> = {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          // Set entity-specific fields
          if (entity_type === 'investor') {
            entityData.legal_name = normalizedEntityName
            entityData.display_name = normalizedEntityName
            entityData.status = 'active'
            entityData.type = 'entity'
            targetEntityName = normalizedEntityName
          } else if (entity_type === 'partner') {
            entityData.legal_name = normalizedEntityName
            entityData.name = normalizedEntityName
            entityData.type = 'entity'
            entityData.status = 'active'
            entityData.partner_type = 'co_investor'
            targetEntityName = normalizedEntityName
          } else if (entity_type === 'introducer') {
            entityData.legal_name = normalizedEntityName
            entityData.display_name = normalizedEntityName
            entityData.status = 'active'
            entityData.type = 'entity'
            targetEntityName = normalizedEntityName
          } else if (entity_type === 'lawyer') {
            entityData.firm_name = normalizedEntityName
            entityData.display_name = normalizedEntityName
            entityData.status = 'active'
            targetEntityName = normalizedEntityName
          } else if (entity_type === 'commercial_partner') {
            entityData.legal_name = normalizedEntityName
            entityData.name = normalizedEntityName
            entityData.type = 'entity'
            entityData.cp_type = 'other'
            entityData.status = 'active'
            targetEntityName = normalizedEntityName
          } else if (entity_type === 'arranger') {
            entityData.legal_name = normalizedEntityName
            entityData.status = 'active'
            targetEntityName = normalizedEntityName
          } else {
            // Generic fields for other entity types
            entityData.name = normalizedEntityName
            entityData.status = 'active'
            targetEntityName = normalizedEntityName
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
          .select('id, email, role, display_name, title')
          .eq('email', normalizedEmail)
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
            results.push({
              email: invite.email,
              success: false,
              error: `Failed to link user: ${linkError.message}`,
            })
            continue
          }

          let memberRollback = null
          try {
            const enrichmentResult = await enrichMemberRecordFromInvitation({
              supabase,
              entityType: entity_type as SignatoryEntityType,
              entityId: targetEntityId!,
              userId: existingProfile.id,
              userEmail: normalizedEmail,
              displayName: normalizedDisplayName || existingProfile.display_name || normalizedEmail,
              title: normalizedTitle || existingProfile.title || null,
              canSign: linkCanSign,
              createdBy: user.id,
            })

            memberRollback = enrichmentResult.rollback

            if (SIGNATORY_ENTITY_TYPES.has(entity_type as SignatoryEntityType)) {
              await syncMemberSignatoryFromUserLink({
                supabase,
                entityType: entity_type as SignatoryEntityType,
                entityId: targetEntityId!,
                userId: existingProfile.id,
                canSign: linkCanSign,
                userEmail: normalizedEmail,
              })
            }
          } catch (linkFinalizeError) {
            if (memberRollback) {
              try {
                await rollbackMemberRecordEnrichment({
                  supabase,
                  rollback: memberRollback,
                })
              } catch (rollbackError) {
                console.error('Failed to rollback member record during batch invite:', rollbackError)
              }
            }

            const { error: rollbackLinkError } = await supabase
              .from(junctionTable)
              .delete()
              .eq('user_id', existingProfile.id)
              .eq(entityIdColumn, targetEntityId)

            if (rollbackLinkError) {
              console.error('Failed to rollback user link during batch invite:', rollbackLinkError)
            }

            results.push({
              email: invite.email,
              success: false,
              error:
                linkFinalizeError instanceof Error
                  ? `Failed to finish linking user: ${linkFinalizeError.message}`
                  : 'Failed to finish linking user',
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
            .select('id, status')
            .eq('entity_type', entity_type)
            .eq('entity_id', targetEntityId)
            .eq('email', normalizedEmail)
            .in('status', ['pending', 'pending_approval'])
            .maybeSingle()

          if (existingInv) {
            results.push({
              email: invite.email,
              success: false,
              error:
                existingInv.status === 'pending_approval'
                  ? 'An invitation is already awaiting approval for this email'
                  : 'Pending invitation already exists',
            })
            continue
          }

          const invitationMetadata: Record<string, unknown> = {
            display_name: normalizedDisplayName,
            is_primary: Boolean(invite.is_primary),
            can_sign: linkCanSign,
          }

          if (normalizedTitle) {
            invitationMetadata.title = normalizedTitle
          }

          // Create invitation record
          const { data: invitation, error: invErr } = await supabase
            .from('member_invitations')
            .insert({
              entity_type,
              entity_id: targetEntityId,
              entity_name: targetEntityName,
              email: normalizedEmail,
              role: role,
              is_signatory: linkCanSign,
              invited_by: user.id,
              invited_by_name: inviterName,
              status: 'pending',
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              sent_at: new Date().toISOString(),
              reminder_count: 0,
              last_reminded_at: null,
              metadata: invitationMetadata,
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
            email: normalizedEmail,
            inviteeName: normalizedDisplayName,
            entityName: targetEntityName,
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
