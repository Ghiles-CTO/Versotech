import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getAppUrl } from '@/lib/signature/token'

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

// Input validation schema
const inviteEntityUserSchema = z.object({
  entity_type: z.enum(['investor', 'arranger', 'lawyer', 'introducer', 'partner', 'commercial_partner']),
  entity_id: z.string().uuid('Invalid entity ID'),
  email: z.string().email('Invalid email address'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  title: z.string().optional(),
  role: z.string().default('member'),
  is_primary: z.boolean().default(false),
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

    // Check if user has super_admin or manage_investors permission
    const { data: permissions } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .in('permission', ['super_admin', 'manage_investors'])

    if (!permissions || permissions.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = inviteEntityUserSchema.parse(body)

    const { entity_type, entity_id, email, display_name, title, role, is_primary, is_signatory, can_sign } = validatedData

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
      .eq('email', email)
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
        created_at: new Date().toISOString(),
      }

      // Add lawyer-specific fields
      if (entity_type === 'lawyer') {
        junctionData.is_signatory = is_signatory
        junctionData.can_sign = can_sign
      }

      const { error: linkError } = await supabase
        .from(junctionTable)
        .insert(junctionData)

      if (linkError) {
        console.error('Link creation error:', linkError)
        return NextResponse.json({ error: 'Failed to link user to entity' }, { status: 500 })
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
          email: email,
          role: role,
          is_primary: is_primary,
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

    // Send invitation via Supabase Auth for new user
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          display_name: display_name,
          role: 'multi_persona',
          title: title,
        },
        redirectTo: `${getAppUrl()}/auth/callback?portal=main`
      }
    )

    if (authError) {
      console.error('Auth invitation error:', authError)
      return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        role: 'multi_persona',
        display_name: display_name,
        title: title,
        password_set: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json({ error: 'User invited but profile creation failed' }, { status: 500 })
    }

    // Create junction record
    const junctionTable = JUNCTION_TABLES[entity_type]
    const entityIdColumn = ENTITY_ID_COLUMNS[entity_type]

    const junctionData: Record<string, unknown> = {
      user_id: authData.user.id,
      [entityIdColumn]: entity_id,
      role: role,
      is_primary: is_primary,
      created_at: new Date().toISOString(),
    }

    // Add lawyer-specific fields
    if (entity_type === 'lawyer') {
      junctionData.is_signatory = is_signatory
      junctionData.can_sign = can_sign
    }

    const { error: junctionError } = await supabase
      .from(junctionTable)
      .insert(junctionData)

    if (junctionError) {
      console.error('Junction record creation error:', junctionError)
      return NextResponse.json({ error: 'User invited but entity link failed' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      event_type: 'authorization',
      actor_id: user.id,
      action: 'entity_user_invited',
      entity_type: entity_type,
      entity_id: entity_id,
      action_details: {
        user_id: authData.user.id,
        email: email,
        display_name: display_name,
        role: role,
        is_primary: is_primary,
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      message: `User invited to ${entity_type.replace('_', ' ')}`,
      is_new_user: true,
    })
  } catch (error) {
    console.error('Entity invite error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
