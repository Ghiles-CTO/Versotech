import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating approvals
const createApprovalSchema = z.object({
  entity_type: z.string().min(1, 'Entity type is required'),
  entity_id: z.string().uuid('Invalid entity ID'),
  action: z.enum(['approve', 'reject', 'revise']),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assigned_to: z.string().uuid('Invalid assignee ID').optional()
})

const updateApprovalSchema = z.object({
  action: z.enum(['approve', 'reject', 'revise']).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff (only staff can create approvals)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required to create approvals' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validation = createApprovalSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (validation.error as any).errors },
        { status: 400 }
      )
    }

    const { entity_type, entity_id, action, notes, priority, assigned_to } = validation.data

    // Verify the entity exists (basic check)
    let entityExists = false
    let entityName = ''
    
    switch (entity_type) {
      case 'deal_commitment':
        const { data: commitment } = await supabase
          .from('deal_commitments')
          .select('id, investors(legal_name)')
          .eq('id', entity_id)
          .single()
        entityExists = !!commitment
        entityName = (commitment?.investors as any)?.[0]?.legal_name || 'Unknown'
        break

      case 'deal_interest':
        const { data: interest } = await supabase
          .from('investor_deal_interest')
          .select('id, investors(legal_name)')
          .eq('id', entity_id)
          .single()
        entityExists = !!interest
        entityName = (interest?.investors as any)?.[0]?.legal_name || 'Unknown'
        break

      case 'deal_subscription':
        const { data: subscription } = await supabase
          .from('deal_subscription_submissions')
          .select('id, investors(legal_name)')
          .eq('id', entity_id)
          .single()
        entityExists = !!subscription
        entityName = (subscription?.investors as any)?.[0]?.legal_name || 'Unknown'
        break
        
      case 'allocation':
        const { data: allocation } = await supabase
          .from('allocations')
          .select('id, investors(legal_name)')
          .eq('id', entity_id)
          .single()
        entityExists = !!allocation
        entityName = (allocation?.investors as any)?.[0]?.legal_name || 'Unknown'
        break
        
      case 'document':
        const { data: document } = await supabase
          .from('documents')
          .select('id, type')
          .eq('id', entity_id)
          .single()
        entityExists = !!document
        entityName = document?.type || 'Unknown'
        break
        
      default:
        return NextResponse.json(
          { error: `Unsupported entity type: ${entity_type}` },
          { status: 400 }
        )
    }

    if (!entityExists) {
      return NextResponse.json(
        { error: `${entity_type} not found` },
        { status: 404 }
      )
    }

    // Create approval record
    const { data: approval, error: approvalError } = await serviceSupabase
      .from('approvals')
      .insert({
        entity_type,
        entity_id,
        action,
        notes,
        priority,
        assigned_to,
        requested_by: user.id,
        status: 'pending'
      })
      .select(`
        *,
        requested_by_profile:requested_by (
          display_name
        ),
        assigned_to_profile:assigned_to (
          display_name
        )
      `)
      .single()

    if (approvalError) {
      console.error('Approval creation error:', approvalError)
      return NextResponse.json(
        { error: 'Failed to create approval' },
        { status: 500 }
      )
    }

    // Log the approval creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'approvals',
      entity_id: approval.id,
      metadata: {
        entity_type,
        target_entity_id: entity_id,
        action,
        priority,
        assigned_to,
        requested_by: profile.display_name,
        entity_name: entityName
      }
    })

    return NextResponse.json({
      success: true,
      approval_id: approval.id,
      approval,
      message: `Approval request created for ${entity_type}: ${entityName}`
    })

  } catch (error) {
    console.error('Approval creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to view approvals with stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()
    const { searchParams } = new URL(request.url)

    // Get the authenticated user
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff (only staff can view approvals)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, display_name, email')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required to view approvals' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const status = searchParams.get('status') || 'pending'
    const entityType = searchParams.get('entity_type')
    const entityTypes = searchParams.get('entity_types')?.split(',').filter(Boolean) || []
    const assignedTo = searchParams.get('assigned_to')
    const priority = searchParams.get('priority')
    const priorities = searchParams.get('priorities')?.split(',').filter(Boolean) || []
    const relatedDealId = searchParams.get('related_deal_id')
    const relatedInvestorId = searchParams.get('related_investor_id')
    const overdueOnly = searchParams.get('overdue_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query with comprehensive joins (use service client to bypass RLS for demo mode)
    let query = serviceSupabase
      .from('approvals')
      .select(`
        *,
        requested_by_profile:requested_by (
          id,
          display_name,
          email,
          role
        ),
        assigned_to_profile:assigned_to (
          id,
          display_name,
          email,
          role
        ),
        approved_by_profile:approved_by (
          id,
          display_name,
          email,
          role
        ),
        related_deal:deals (
          id,
          name,
          status,
          deal_type,
          currency
        ),
        related_investor:investors (
          id,
          legal_name,
          kyc_status,
          type
        )
      `)
      .eq('status', status)

    // Apply filters
    if (entityType) {
      query = query.eq('entity_type', entityType)
    }
    if (entityTypes.length > 0) {
      query = query.in('entity_type', entityTypes)
    }
    if (assignedTo === 'me') {
      query = query.eq('assigned_to', profile.id)
    } else if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (priorities.length > 0) {
      query = query.in('priority', priorities)
    }
    if (relatedDealId) {
      query = query.eq('related_deal_id', relatedDealId)
    }
    if (relatedInvestorId) {
      query = query.eq('related_investor_id', relatedInvestorId)
    }
    if (overdueOnly) {
      query = query.lt('sla_breach_at', new Date().toISOString())
    }

    // Get total count with same filters (before pagination, use service client)
    let countQuery = serviceSupabase
      .from('approvals')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
    
    // Apply same filters to count query
    if (entityType) countQuery = countQuery.eq('entity_type', entityType)
    if (entityTypes.length > 0) countQuery = countQuery.in('entity_type', entityTypes)
    if (assignedTo === 'me') {
      countQuery = countQuery.eq('assigned_to', profile.id)
    } else if (assignedTo) {
      countQuery = countQuery.eq('assigned_to', assignedTo)
    }
    if (priority) countQuery = countQuery.eq('priority', priority)
    if (priorities.length > 0) countQuery = countQuery.in('priority', priorities)
    if (relatedDealId) countQuery = countQuery.eq('related_deal_id', relatedDealId)
    if (relatedInvestorId) countQuery = countQuery.eq('related_investor_id', relatedInvestorId)
    if (overdueOnly) countQuery = countQuery.lt('sla_breach_at', new Date().toISOString())

    const { count: totalCount } = await countQuery

    // Apply pagination and ordering
    const { data: approvals, error } = await query
      .order('sla_breach_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching approvals:', error)
      return NextResponse.json(
        { error: 'Failed to fetch approvals' },
        { status: 500 }
      )
    }

    // Get statistics using RPC function (use service client to bypass RLS)
    const { data: statsData, error: statsError } = await serviceSupabase
      .rpc('get_approval_stats', {
        p_staff_id: assignedTo === 'me' ? profile.id : null
      })
      .single()

    if (statsError) {
      console.warn('Error fetching approval stats:', statsError)
    }

    // Calculate counts for different statuses (use service client)
    const { data: counts } = await serviceSupabase
      .from('approvals')
      .select('status', { count: 'exact', head: true })

    return NextResponse.json({
      approvals: approvals || [],
      stats: statsData || {
        total_pending: 0,
        overdue_count: 0,
        avg_processing_time_hours: 0,
        approval_rate_24h: 0,
        total_approved_30d: 0,
        total_rejected_30d: 0,
        total_awaiting_info: 0
      },
      counts: {
        pending: approvals?.filter(a => a.status === 'pending').length || 0,
        approved: (statsData as any)?.total_approved_30d || 0,
        rejected: (statsData as any)?.total_rejected_30d || 0
      },
      total: totalCount || 0,
      pagination: {
        limit,
        offset,
        has_more: (totalCount || 0) > offset + limit
      },
      hasData: (approvals && approvals.length > 0) || false
    })

  } catch (error) {
    console.error('Approvals GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH endpoint to update approval status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required to update approvals' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { approval_id, ...updateData } = body
    
    const validation = updateApprovalSchema.safeParse(updateData)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (validation.error as any).errors },
        { status: 400 }
      )
    }

    if (!approval_id) {
      return NextResponse.json(
        { error: 'Approval ID is required' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updates: any = validation.data
    
    // If status is being set to approved/rejected, set decided_by and decided_at
    if (updates.status && ['approved', 'rejected'].includes(updates.status)) {
      updates.decided_by = user.id
      updates.decided_at = new Date().toISOString()
    }

    // Update the approval
    const { data: approval, error: updateError } = await serviceSupabase
      .from('approvals')
      .update(updates)
      .eq('id', approval_id)
      .select(`
        *,
        requested_by_profile:requested_by (
          display_name
        ),
        assigned_to_profile:assigned_to (
          display_name
        ),
        decided_by_profile:decided_by (
          display_name
        )
      `)
      .single()

    if (updateError) {
      console.error('Approval update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update approval' },
        { status: 500 }
      )
    }

    // Log the approval decision
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: 'approvals',
      entity_id: approval_id,
      metadata: {
        entity_type: approval.entity_type,
        target_entity_id: approval.entity_id,
        old_status: 'pending', // Could track this better
        new_status: approval.status,
        action: approval.action,
        decided_by: profile.display_name,
        notes: approval.notes
      }
    })

    return NextResponse.json({
      success: true,
      approval,
      message: `Approval ${approval.status} for ${approval.entity_type}`
    })

  } catch (error) {
    console.error('Approval update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
