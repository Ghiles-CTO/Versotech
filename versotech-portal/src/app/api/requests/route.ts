import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating requests
const createRequestSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subject: z.string().min(1, 'Subject is required'),
  details: z.string().min(1, 'Details are required'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  investor_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional()
})

const updateRequestSchema = z.object({
  status: z.enum(['open', 'assigned', 'in_progress', 'ready', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  assigned_to: z.string().uuid().optional(),
  linked_workflow_run: z.string().uuid().optional(),
  result_doc_id: z.string().uuid().optional(),
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Parse query parameters
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const assignedToMe = searchParams.get('assigned_to_me') === 'true'
    const dealId = searchParams.get('deal_id')

    let query = supabase
      .from('request_tickets')
      .select(`
        *,
        investors:investor_id (
          legal_name
        ),
        deals:deal_id (
          name
        ),
        created_by_profile:created_by (
          display_name,
          email
        ),
        assigned_to_profile:assigned_to (
          display_name,
          email
        ),
        result_document:result_doc_id (
          id,
          type,
          file_key,
          created_at
        ),
        workflow_run:linked_workflow_run (
          id,
          status,
          created_at,
          updated_at
        )
      `)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (dealId) {
      query = query.eq('deal_id', dealId)
    }

    // Staff-specific filters
    if (profile.role.startsWith('staff_')) {
      if (assignedToMe) {
        query = query.eq('assigned_to', user.id)
      }
    }

    const { data: requests, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Requests fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const summary = {
      total: requests?.length || 0,
      open: requests?.filter(r => r.status === 'open').length || 0,
      assigned: requests?.filter(r => r.status === 'assigned').length || 0,
      inProgress: requests?.filter(r => r.status === 'in_progress').length || 0,
      ready: requests?.filter(r => r.status === 'ready').length || 0,
      closed: requests?.filter(r => r.status === 'closed').length || 0,
      assignedToMe: profile.role.startsWith('staff_') ? 
        requests?.filter(r => r.assigned_to === user.id && r.status !== 'closed').length || 0 : 0
    }

    // Log access
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: AuditEntities.REQUEST_TICKETS,
      entity_id: user.id,
      metadata: {
        endpoint: '/api/requests',
        role: profile.role,
        request_count: requests?.length || 0,
        filters: { status, category, assigned_to_me: assignedToMe, deal_id: dealId },
        summary
      }
    })

    return NextResponse.json({
      requests: requests || [],
      summary,
      hasData: (requests && requests.length > 0)
    })

  } catch (error) {
    console.error('Requests API error:', error)
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createRequestSchema.parse(body)

    // If investor_id is not provided and user is investor, get their investor ID
    let finalInvestorId = validatedData.investor_id
    
    if (!finalInvestorId) {
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (investorLinks) {
        finalInvestorId = investorLinks.investor_id
      }
    }

    // Create the request ticket
    const { data: requestTicket, error } = await supabase
      .from('request_tickets')
      .insert({
        category: validatedData.category,
        subject: validatedData.subject,
        details: validatedData.details,
        priority: validatedData.priority,
        investor_id: finalInvestorId,
        deal_id: validatedData.deal_id,
        created_by: user.id,
        status: 'open'
      })
      .select(`
        *,
        investors:investor_id (
          legal_name
        ),
        deals:deal_id (
          name
        ),
        created_by_profile:created_by (
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Request creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create request' },
        { status: 500 }
      )
    }

    // Auto-assign based on category (basic routing logic)
    let autoAssignTo: string | null = null
    
    // Get staff members who can handle this type of request
    const { data: staffMembers } = await supabase
      .from('profiles')
      .select('id, title, role')
      .like('role', 'staff_%')

    if (staffMembers && staffMembers.length > 0) {
      // Simple assignment logic based on category
      switch (validatedData.category.toLowerCase()) {
        case 'kyc':
        case 'compliance':
          autoAssignTo = staffMembers.find(s => s.title?.includes('compliance') || s.role === 'staff_ops')?.id
          break
        case 'documents':
        case 'reports':
          autoAssignTo = staffMembers.find(s => s.title?.includes('ops') || s.role === 'staff_ops')?.id
          break
        case 'performance':
        case 'investment':
          autoAssignTo = staffMembers.find(s => s.title?.includes('rm') || s.role === 'staff_rm')?.id
          break
        default:
          // Round-robin or least loaded assignment
          autoAssignTo = staffMembers[0]?.id
      }

      // Update assignment if found
      if (autoAssignTo) {
        await supabase
          .from('request_tickets')
          .update({ 
            assigned_to: autoAssignTo,
            status: 'assigned'
          })
          .eq('id', requestTicket.id)
      }
    }

    // Log creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.REQUEST_TICKETS,
      entity_id: requestTicket.id,
      metadata: {
        endpoint: '/api/requests',
        category: validatedData.category,
        subject: validatedData.subject,
        priority: validatedData.priority,
        investor_id: finalInvestorId,
        deal_id: validatedData.deal_id,
        auto_assigned_to: autoAssignTo
      }
    })

    return NextResponse.json(requestTicket, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Requests API POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
