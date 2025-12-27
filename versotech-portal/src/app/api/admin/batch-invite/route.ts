import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getAppUrl } from '@/lib/signature/token'
import { sendEmail } from '@/lib/email/resend-service'

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
  arranger: 'arranger_entity_id',
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
            entityData.investor_type = 'individual'
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
          .select('id, email')
          .eq('email', invite.email)
          .single()

        if (existingProfile) {
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
          // Invite new user via Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
            invite.email,
            {
              data: {
                display_name: invite.display_name,
                role: 'multi_persona',
                title: invite.title,
              },
              redirectTo: `${appUrl}/auth/callback?portal=main`
            }
          )

          if (authError || !authData.user) {
            results.push({
              email: invite.email,
              success: false,
              error: authError?.message || 'Failed to invite user',
            })
            continue
          }

          // Create profile
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: invite.email,
            role: 'multi_persona',
            display_name: invite.display_name,
            title: invite.title,
            password_set: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          // Create junction record
          const junctionTable = JUNCTION_TABLES[entity_type]
          const entityIdColumn = ENTITY_ID_COLUMNS[entity_type]

          const junctionData: Record<string, unknown> = {
            user_id: authData.user.id,
            [entityIdColumn]: targetEntityId,
            role: role,
            is_primary: invite.is_primary,
            created_at: new Date().toISOString(),
          }

          await supabase.from(junctionTable).insert(junctionData)

          // Send welcome email
          await sendEmail({
            to: invite.email,
            subject: 'Welcome to VERSO Holdings - Your Account is Ready',
            html: generateWelcomeEmail(invite.display_name, entity_type, appUrl),
          })

          results.push({
            email: invite.email,
            success: true,
            user_id: authData.user.id,
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

function generateWelcomeEmail(displayName: string, entityType: string, appUrl: string): string {
  const entityLabel = entityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 30px; text-align: center; }
        .content { background: #f4f4f4; padding: 30px; }
        .button { background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: 600; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .features ul { margin: 10px 0; padding-left: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to VERSO Holdings</h1>
        </div>
        <div class="content">
          <h2>Hi ${displayName},</h2>
          <p>You've been invited to join the VERSO Holdings platform as a <strong>${entityLabel}</strong>.</p>

          <div class="features">
            <h3>What you can do:</h3>
            <ul>
              <li>Access exclusive investment opportunities</li>
              <li>Review and sign documents digitally</li>
              <li>Track your portfolio performance</li>
              <li>Communicate securely with our team</li>
            </ul>
          </div>

          <p>Check your email for a separate message with your login credentials, or click below to access the platform:</p>

          <a href="${appUrl}/login" class="button">Access VERSO Platform</a>

          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} VERSO Holdings. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
