import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating approvals
const createApprovalSchema = z.object({
  entity_type: z.string().min(1, 'Entity type is required'),
  entity_id: z.string().uuid('Valid entity ID is required'),
  action: z.enum(['approve', 'reject', 'revise']),
  assigned_to: z.string().uuid('Valid assignee ID is required'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  notes: z.string().optional()
})

const updateApprovalSchema = z.object({
  action: z.enum(['approve', 'reject', 'revise']).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  notes: z.string().optional()
})

export async function GET(request: Request) {
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

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const status = searchParams.get('status') || 'pending'
    const entityType = searchParams.get('entity_type')
    const assignedToMe = searchParams.get('assigned_to_me') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

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
      .order('created_at', { ascending: false })
      .limit(limit)

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    if (assignedToMe) {
      query = query.eq('assigned_to', user.id)
    }

    const { data: approvals, error } = await query

    if (error) {
      console.error('Approvals fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch approvals' },
        { status: 500 }
      )
    }

    // Get counts by status for dashboard
    const { data: statusCounts } = await supabase
      .from('approvals')
      .select('status')
      .eq('assigned_to', user.id)

    const counts = {
      pending: statusCounts?.filter(a => a.status === 'pending').length || 0,
      approved: statusCounts?.filter(a => a.status === 'approved').length || 0,
      rejected: statusCounts?.filter(a => a.status === 'rejected').length || 0
    }

    // Log access
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'approvals',
      entity_id: user.id,
      metadata: {
        endpoint: '/api/approvals',
        status_filter: status,
        entity_type_filter: entityType,
        assigned_to_me: assignedToMe,
        approval_count: approvals?.length || 0
      }
    })

    return NextResponse.json({
      approvals: approvals || [],
      counts,
      hasData: (approvals && approvals.length > 0)
    })

  } catch (error) {
    console.error('API /approvals GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServiceClient()
    
    // Get the authenticated user from regular client
    const regularSupabase = await createClient()
    const { data: { user }, error: authError } = await regularSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createApprovalSchema.parse(body)

    // Verify the assigned user exists and is staff
    const { data: assignee } = await supabase
      .from('profiles')
      .select('id, role, display_name')
      .eq('id', validatedData.assigned_to)
      .single()

    if (!assignee || !assignee.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Invalid assignee - must be a staff member' },
        { status: 400 }
      )
    }

    // Create the approval request
    const { data: approval, error } = await supabase
      .from('approvals')
      .insert({
        entity_type: validatedData.entity_type,
        entity_id: validatedData.entity_id,
        action: validatedData.action,
        requested_by: user.id,
        assigned_to: validatedData.assigned_to,
        priority: validatedData.priority,
        notes: validatedData.notes,
        status: 'pending'
      })
      .select(`
        *,
        requested_by_profile:requested_by (
          display_name,
          email
        ),
        assigned_to_profile:assigned_to (
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Approval creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create approval request' },
        { status: 500 }
      )
    }

    // Log creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'approvals',
      entity_id: approval.id,
      metadata: {
        endpoint: '/api/approvals',
        entity_type: validatedData.entity_type,
        entity_id: validatedData.entity_id,
        action: validatedData.action,
        assigned_to: validatedData.assigned_to,
        assignee_name: assignee.display_name,
        priority: validatedData.priority
      }
    })

    return NextResponse.json(approval, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /approvals POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
