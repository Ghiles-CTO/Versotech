import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'
import { auditLogger, AuditEntities } from '@/lib/audit'

// Map entity types to their corresponding tables and ID columns
const ENTITY_TABLE_MAP: Record<string, { table: string; idColumn: string }> = {
  investor: { table: 'investor_users', idColumn: 'investor_id' },
  partner: { table: 'partner_users', idColumn: 'partner_id' },
  lawyer: { table: 'lawyer_users', idColumn: 'lawyer_id' },
  commercial_partner: { table: 'commercial_partner_users', idColumn: 'commercial_partner_id' },
  introducer: { table: 'introducer_users', idColumn: 'introducer_id' },
  arranger: { table: 'arranger_users', idColumn: 'arranger_id' },
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; entityId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check if user is super admin
    const hasAccess = await isSuperAdmin(supabase, user.id)
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id: targetUserId, entityId } = await params
    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get('type')

    if (!entityType || !ENTITY_TABLE_MAP[entityType]) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing entity type' },
        { status: 400 }
      )
    }

    const { table, idColumn } = ENTITY_TABLE_MAP[entityType]

    // Get the entity name for audit logging
    const entityTableName = entityType === 'investor' ? 'investors' :
                           entityType === 'partner' ? 'partners' :
                           entityType === 'lawyer' ? 'lawyers' :
                           entityType === 'commercial_partner' ? 'commercial_partners' :
                           entityType === 'introducer' ? 'introducers' :
                           entityType === 'arranger' ? 'arrangers' : null

    let entityName = 'Unknown Entity'
    if (entityTableName) {
      const { data: entityData } = await supabase
        .from(entityTableName)
        .select('legal_name, name')
        .eq('id', entityId)
        .single()

      if (entityData) {
        entityName = entityData.legal_name || entityData.name || entityName
      }
    }

    // Get user info for audit logging
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', targetUserId)
      .single()

    // Delete the association
    const { error: deleteError, count } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .eq('user_id', targetUserId)
      .eq(idColumn, entityId)

    if (deleteError) {
      console.error('[remove-entity] Delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to remove entity association' },
        { status: 500 }
      )
    }

    if (count === 0) {
      return NextResponse.json(
        { success: false, error: 'Entity association not found' },
        { status: 404 }
      )
    }

    // Log the action
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'entity_removed',
      entity: AuditEntities.USERS,
      entity_id: targetUserId,
      metadata: {
        target_email: targetUser?.email,
        target_name: targetUser?.display_name,
        entity_id: entityId,
        entity_type: entityType,
        entity_name: entityName,
      }
    })

    return NextResponse.json({
      success: true,
      data: { removed: true }
    })
  } catch (error) {
    console.error('[remove-entity] API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
