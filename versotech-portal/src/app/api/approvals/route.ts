import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating approvals
const createApprovalSchema = z.object({
  entity_type: z.string().min(1, 'Entity type is required'),
  entity_id: z.string().uuid('Invalid entity ID'),
  action: z.enum(['approve', 'reject', 'revise']),
  notes: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
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
        { error: 'Invalid request data', details: validation.error.errors },
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
        entityName = commitment?.investors?.legal_name || 'Unknown'
        break
        
      case 'allocation':
        const { data: allocation } = await supabase
          .from('allocations')
          .select('id, investors(legal_name)')
          .eq('id', entity_id)
          .single()
        entityExists = !!allocation
        entityName = allocation?.investors?.legal_name || 'Unknown'
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

// GET endpoint to view approvals
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff (only staff can view approvals)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
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
    const assignedTo = searchParams.get('assigned_to')
    const priority = searchParams.get('priority')

    // Build query
    let query = supabase
      .from('approvals')
      .select(`
        *,
        requested_by_profile:requested_by (
          display_name,
          email
        ),
        assigned_to_profile:assigned_to (
          display_name,
          email
        ),
        decided_by_profile:decided_by (
          display_name,
          email
        )
      `)
      .eq('status', status)

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data: approvals, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching approvals:', error)
      return NextResponse.json(
        { error: 'Failed to fetch approvals' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      approvals: approvals || []
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
        { error: 'Invalid request data', details: validation.error.errors },
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
