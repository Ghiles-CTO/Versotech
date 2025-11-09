import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for bulk action requests
const bulkActionSchema = z.object({
  approval_ids: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
  rejection_reason: z.string().optional()
}).refine(
  (data) => {
    // rejection_reason required for reject action
    if (data.action === 'reject' && !data.rejection_reason) {
      return false
    }
    return true
  },
  { 
    message: 'rejection_reason is required when action is reject',
    path: ['rejection_reason']
  }
)

/**
 * Check if user has authority to approve/reject based on role and approval details
 */
function checkApprovalAuthority(
  profile: { id: string; role: string; title?: string },
  approval: any
): { canApprove: boolean; reason?: string } {
  const { role } = profile

  // Admins can approve anything
  if (role === 'staff_admin') {
    return { canApprove: true }
  }

  // Must be assigned to the approval or have senior role
  if (approval.assigned_to !== profile.id && role !== 'staff_admin') {
    return { canApprove: false, reason: 'Not assigned to this approval' }
  }

  // Role-based approval limits
  const approvalAmount = approval.entity_metadata?.requested_amount || 
                         approval.entity_metadata?.amount || 
                         0

  if (role === 'staff_ops') {
    // Ops can approve up to $50K
    if (approvalAmount > 50000) {
      return { canApprove: false, reason: 'Amount exceeds authority limit ($50K)' }
    }
  } else if (role === 'staff_rm') {
    // RMs can approve up to $500K
    if (approvalAmount > 500000) {
      return { canApprove: false, reason: 'Amount exceeds authority limit ($500K)' }
    }
  }

  return { canApprove: true }
}

/**
 * POST /api/approvals/bulk-action
 * Bulk approve or reject multiple approvals
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Authentication check (supports both real auth and demo mode)
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Staff role check
    let profile = null
    
    // For demo mode, create a mock profile from user metadata
    if (user.user_metadata?.role) {
      profile = {
        id: user.id,
        role: user.user_metadata.role,
        display_name: user.email?.split('@')[0] || 'Demo User',
        title: null,
        email: user.email
      }
    } else {
      // For real auth, fetch from database
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('id, role, display_name, title, email')
        .eq('id', user.id)
        .single()
      profile = dbProfile
    }

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required for bulk actions' },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validation = bulkActionSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: (validation.error as any).errors
        },
        { status: 400 }
      )
    }

    const { approval_ids, action, notes, rejection_reason } = validation.data

    // Fetch all approvals to validate (use service client to bypass RLS for demo mode)
    const { data: approvals, error: fetchError } = await serviceSupabase
      .from('approvals')
      .select('id, entity_type, entity_metadata, status, assigned_to, priority, created_at')
      .in('id', approval_ids)

    if (fetchError) {
      console.error('Error fetching approvals for bulk action:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch approvals' },
        { status: 500 }
      )
    }

    if (!approvals || approvals.length === 0) {
      return NextResponse.json(
        { error: 'No approvals found with provided IDs' },
        { status: 404 }
      )
    }

    // Track results for each approval
    const results: Array<{ id: string; success: boolean; error?: string }> = []

    // Process each approval
    for (const approval of approvals) {
      try {
        // Check if already processed
        if (approval.status !== 'pending') {
          results.push({
            id: approval.id,
            success: false,
            error: `Already ${approval.status}`
          })
          continue
        }

        // Check authority
        const authCheck = checkApprovalAuthority(profile, approval)
        if (!authCheck.canApprove) {
          results.push({
            id: approval.id,
            success: false,
            error: authCheck.reason || 'Insufficient authority'
          })
          continue
        }

        // Calculate processing time in hours
        const createdAt = new Date(approval.created_at)
        const nowDate = new Date()
        const processingTimeHours = (nowDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

        // Update approval status
        const newStatus = action === 'approve' ? 'approved' : 'rejected'
        const now = new Date().toISOString()
        const updateData: any = {
          status: newStatus,
          approved_by: user.id,
          approved_at: now,
          resolved_at: now,
          actual_processing_time_hours: Math.round(processingTimeHours * 100) / 100, // Round to 2 decimals
          notes: notes || null
        }

        if (action === 'reject') {
          updateData.rejection_reason = rejection_reason
        }

        const { error: updateError } = await serviceSupabase
          .from('approvals')
          .update(updateData)
          .eq('id', approval.id)
          .eq('status', 'pending') // Ensure still pending

        if (updateError) {
          console.error(`Error updating approval ${approval.id}:`, updateError)
          results.push({
            id: approval.id,
            success: false,
            error: updateError.message
          })
          continue
        }

        // If approved, trigger downstream actions based on entity_type
        if (action === 'approve') {
          try {
            // REMOVED: 'deal_commitment' case - table deleted
            if (approval.entity_type === 'reservation') {
              // Reservations deprecated - skip processing
              console.log('Skipping deprecated reservation approval:', approval.id)
            } else if (approval.entity_type === 'allocation') {
              // Update allocation status
              await serviceSupabase
                .from('allocations')
                .update({ 
                  status: 'approved',
                  approved_by: user.id,
                  approved_at: new Date().toISOString()
                })
                .eq('id', approval.entity_metadata?.entity_id || approval.id)
            }
          } catch (downstreamError) {
            console.error(`Downstream action failed for ${approval.id}:`, downstreamError)
            // Don't fail the approval, just log the error
          }
        }

        results.push({
          id: approval.id,
          success: true
        })

      } catch (err) {
        console.error(`Error processing approval ${approval.id}:`, err)
        results.push({
          id: approval.id,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    // Calculate summary
    const successfulResults = results.filter(r => r.success)
    const failedResults = results.filter(r => !r.success)

    return NextResponse.json({
      success: true,
      total: approval_ids.length,
      successful_count: successfulResults.length,
      failed_count: failedResults.length,
      results: results
    })

  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
