import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ENTITY_CONFIGS: Record<string, {
  memberTable: string
  entityIdColumn: string
  submissionEntityIdColumn: string
  submissionMemberIdColumn: string
  userTable: string
}> = {
  investor: {
    memberTable: 'investor_members',
    entityIdColumn: 'investor_id',
    submissionEntityIdColumn: 'investor_id',
    submissionMemberIdColumn: 'investor_member_id',
    userTable: 'investor_users',
  },
  partner: {
    memberTable: 'partner_members',
    entityIdColumn: 'partner_id',
    submissionEntityIdColumn: 'partner_id',
    submissionMemberIdColumn: 'partner_member_id',
    userTable: 'partner_users',
  },
  introducer: {
    memberTable: 'introducer_members',
    entityIdColumn: 'introducer_id',
    submissionEntityIdColumn: 'introducer_id',
    submissionMemberIdColumn: 'introducer_member_id',
    userTable: 'introducer_users',
  },
  lawyer: {
    memberTable: 'lawyer_members',
    entityIdColumn: 'lawyer_id',
    submissionEntityIdColumn: 'lawyer_id',
    submissionMemberIdColumn: 'lawyer_member_id',
    userTable: 'lawyer_users',
  },
  commercial_partner: {
    memberTable: 'commercial_partner_members',
    entityIdColumn: 'commercial_partner_id',
    submissionEntityIdColumn: 'commercial_partner_id',
    submissionMemberIdColumn: 'commercial_partner_member_id',
    userTable: 'commercial_partner_users',
  },
  arranger: {
    memberTable: 'arranger_members',
    entityIdColumn: 'arranger_id',
    submissionEntityIdColumn: 'arranger_entity_id',
    submissionMemberIdColumn: 'arranger_member_id',
    userTable: 'arranger_users',
  },
}

/**
 * GET /api/me/member-kyc-snapshots?entityType=investor&entityId=xxx
 *
 * Returns the latest personal_info submission snapshot for each member
 * of the given entity. Used by the members tab to detect unsaved changes.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')

    if (!entityType || !entityId || !ENTITY_CONFIGS[entityType]) {
      return NextResponse.json({ error: 'Invalid entityType or entityId' }, { status: 400 })
    }

    const config = ENTITY_CONFIGS[entityType]
    const serviceSupabase = createServiceClient()

    // Verify user belongs to this entity
    const { data: entityUser } = await serviceSupabase
      .from(config.userTable)
      .select('user_id')
      .eq('user_id', user.id)
      .eq(config.entityIdColumn, entityId)
      .limit(1)
      .maybeSingle()

    if (!entityUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all active member IDs for this entity
    const { data: members } = await serviceSupabase
      .from(config.memberTable)
      .select('id')
      .eq(config.entityIdColumn, entityId)
      .eq('is_active', true)

    if (!members || members.length === 0) {
      return NextResponse.json({ snapshots: {} })
    }

    const memberIds = members.map(m => m.id)

    // Fetch latest personal_info submission for each member
    // We get all submissions and pick the latest per member client-side
    const { data: submissions } = await serviceSupabase
      .from('kyc_submissions')
      .select(`id, ${config.submissionMemberIdColumn}, metadata, submitted_at`)
      .eq(config.submissionEntityIdColumn, entityId)
      .eq('document_type', 'personal_info')
      .in(config.submissionMemberIdColumn, memberIds)
      .order('submitted_at', { ascending: false })

    // Build a map: memberId -> latest review_snapshot
    const snapshots: Record<string, Record<string, unknown>> = {}

    if (submissions) {
      for (const rawSub of submissions) {
        const sub = rawSub as unknown as Record<string, unknown>
        const memberId = sub[config.submissionMemberIdColumn] as string
        if (!memberId || snapshots[memberId]) continue // already have the latest

        const metadata = sub.metadata as Record<string, unknown> | null
        const reviewSnapshot = metadata?.review_snapshot
        if (reviewSnapshot && typeof reviewSnapshot === 'object' && !Array.isArray(reviewSnapshot)) {
          snapshots[memberId] = reviewSnapshot as Record<string, unknown>
        }
      }
    }

    return NextResponse.json({ snapshots })
  } catch (error) {
    console.error('Error in member-kyc-snapshots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
