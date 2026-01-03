import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Valid entity types
const VALID_ENTITY_TYPES = ['partner', 'investor', 'introducer', 'commercial_partner', 'lawyer', 'arranger'] as const
type EntityType = typeof VALID_ENTITY_TYPES[number]

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

// Tables that have an 'id' column (vs composite key)
// NOTE: All user tables use composite keys (entity_id + user_id), none have 'id'
const TABLES_WITH_ID: EntityType[] = []

// Tables that have signature_specimen_url column
const TABLES_WITH_SIGNATURE: EntityType[] = ['introducer', 'commercial_partner', 'lawyer']

/**
 * GET /api/members?entity_type=xxx&entity_id=xxx
 * Get all members of an entity
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
    const userTable = USER_TABLES[entity_type as EntityType]
    const entityIdColumn = ENTITY_ID_COLUMNS[entity_type as EntityType]

    // Verify user is a member of this entity
    // Note: We don't select 'id' because some tables use composite keys (partner_users, investor_users, arranger_users)
    const { data: membership } = await serviceSupabase
      .from(userTable)
      .select('role, is_primary')
      .eq('user_id', user.id)
      .eq(entityIdColumn, entity_id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this entity' },
        { status: 403 }
      )
    }

    // Build select query based on table schema
    const hasId = TABLES_WITH_ID.includes(entity_type as EntityType)
    const hasSignature = TABLES_WITH_SIGNATURE.includes(entity_type as EntityType)

    // Base columns that all tables have
    let selectColumns = `
      user_id,
      role,
      is_primary,
      can_sign,
      created_at,
      profiles:user_id (
        display_name,
        email,
        avatar_url
      )
    `

    // Add id column if table has it
    if (hasId) {
      selectColumns = `id,` + selectColumns
    }

    // Add signature column if table has it
    if (hasSignature) {
      selectColumns = selectColumns.replace('can_sign,', 'can_sign, signature_specimen_url,')
    }

    // Get all members with their profiles
    const { data: members, error: fetchError } = await serviceSupabase
      .from(userTable)
      .select(selectColumns)
      .eq(entityIdColumn, entity_id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching members:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    // Transform the data - handle optional fields based on table schema
    const transformedMembers = (members || []).map((member: any) => ({
      // Use id if available, otherwise generate from user_id + entity_id
      id: member.id || `${member.user_id}_${entity_id}`,
      user_id: member.user_id,
      role: member.role,
      is_primary: member.is_primary,
      can_sign: member.can_sign ?? false,
      signature_specimen_url: member.signature_specimen_url || null,
      created_at: member.created_at,
      profile: member.profiles ? {
        display_name: member.profiles.display_name,
        email: member.profiles.email,
        avatar_url: member.profiles.avatar_url
      } : null
    }))

    return NextResponse.json({
      members: transformedMembers,
      current_user: {
        role: membership.role,
        is_primary: membership.is_primary,
        can_manage: membership.is_primary || ['admin', 'owner'].includes(membership.role)
      }
    })

  } catch (error) {
    console.error('Error in GET /api/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
