import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'

// Helper to get user from either real auth or demo mode
async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (user) return { user, error: null }
  
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
  if (demoCookie) {
    const demoSession = parseDemoSession(demoCookie.value)
    if (demoSession) {
      return {
        user: {
          id: demoSession.userId,
          email: demoSession.email,
          user_metadata: { role: demoSession.role }
        },
        error: null
      }
    }
  }
  return { user: null, error: authError || new Error('No authentication found') }
}

// Validation schema for approval action
const approvalActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
  rejection_reason: z.string().optional()
}).refine(
  (data) => {
    // Require rejection_reason for reject action
    if (data.action === 'reject' && !data.rejection_reason) {
      return false
    }
    return true
  },
  {
    message: 'rejection_reason is required when rejecting an approval',
    path: ['rejection_reason']
  }
)

// Check if staff user has authority to approve this specific approval
function checkApprovalAuthority(
  profile: any,
  approval: any
): { authorized: boolean; reason?: string } {
  // staff_admin can approve anything
  if (profile.role === 'staff_admin') {
    return { authorized: true }
  }

  // Extract amount from entity_metadata if available
  let amount = 0
  if (approval.entity_metadata?.requested_amount) {
    amount = parseFloat(approval.entity_metadata.requested_amount)
  } else if (approval.entity_metadata?.amount) {
    amount = parseFloat(approval.entity_metadata.amount)
  }

  // staff_ops can approve <$50K
  if (profile.role === 'staff_ops') {
    if (amount < 50000) {
      return { authorized: true }
    }
    return {
      authorized: false,
      reason: 'Operations staff can only approve amounts under $50,000'
    }
  }

  // staff_rm can approve unlimited for assigned investors (standard requests)
  if (profile.role === 'staff_rm') {
    // Check if this RM is assigned to this approval
    if (approval.assigned_to === profile.id) {
      return { authorized: true }
    }
    return {
      authorized: false,
      reason: 'Relationship managers can only approve approvals assigned to them'
    }
  }

  return {
    authorized: false,
    reason: 'Insufficient permissions to approve this request'
  }
}

// Execute downstream actions when approval is approved
async function executeApprovalActions(
  supabase: any,
  approval: any,
  actorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const entityType = approval.entity_type
    const entityId = approval.entity_id
    const metadata = approval.entity_metadata || {}

    switch (entityType) {
      case 'commitment':
      case 'deal_commitment':
        // Create allocation from commitment
        const { error: commitmentError } = await supabase
          .from('deal_commitments')
          .update({ status: 'approved' })
          .eq('id', entityId)

        if (commitmentError) {
          console.error('Error approving commitment:', commitmentError)
          return { success: false, error: 'Failed to approve commitment' }
        }

        // Optionally create reservation or allocation here
        // This would call the inventory reservation function
        break

      case 'allocation':
        // Finalize allocation (call DB function if exists)
        const { error: allocationError } = await supabase
          .from('allocations')
          .update({
            status: 'approved',
            approved_by: actorId,
            approved_at: new Date().toISOString()
          })
          .eq('id', entityId)

        if (allocationError) {
          console.error('Error approving allocation:', allocationError)
          return { success: false, error: 'Failed to approve allocation' }
        }
        break

      case 'reservation':
        // Convert reservation to allocation
        const { error: reservationError } = await supabase
          .from('reservations')
          .update({ status: 'approved' })
          .eq('id', entityId)

        if (reservationError) {
          console.error('Error approving reservation:', reservationError)
          return { success: false, error: 'Failed to approve reservation' }
        }
        break

      case 'kyc_change':
        // Apply KYC changes to investor record
        if (metadata.kyc_updates && approval.related_investor_id) {
          const { error: kycError } = await supabase
            .from('investors')
            .update({
              ...metadata.kyc_updates,
              kyc_status: 'completed'
            })
            .eq('id', approval.related_investor_id)

          if (kycError) {
            console.error('Error applying KYC changes:', kycError)
            return { success: false, error: 'Failed to apply KYC changes' }
          }
        }
        break

      case 'withdrawal':
        // Mark withdrawal as approved
        // Actual withdrawal processing would be handled separately
        console.log('Withdrawal approved:', entityId)
        break

      default:
        console.log(`No downstream action defined for entity type: ${entityType}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error executing approval actions:', error)
    return { success: false, error: 'Failed to execute approval actions' }
  }
}

// Execute actions when approval is rejected
async function executeRejectionActions(
  supabase: any,
  approval: any,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create task for user to address rejection
    if (approval.requested_by) {
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          owner_user_id: approval.requested_by,
          owner_investor_id: approval.related_investor_id,
          kind: 'other',
          category: 'investment_setup',
          title: `Address rejected ${approval.entity_type} request`,
          description: `Your ${approval.entity_type} request was rejected. Reason: ${reason}`,
          priority: 'high',
          status: 'pending',
          due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })

      if (taskError) {
        console.error('Error creating rejection task:', taskError)
      }
    }

    // Update entity status if applicable
    const entityType = approval.entity_type
    const entityId = approval.entity_id

    if (entityType === 'deal_commitment') {
      await supabase
        .from('deal_commitments')
        .update({ status: 'rejected' })
        .eq('id', entityId)
    } else if (entityType === 'allocation') {
      await supabase
        .from('allocations')
        .update({ status: 'rejected' })
        .eq('id', entityId)
    } else if (entityType === 'reservation') {
      await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', entityId)
    }

    return { success: true }
  } catch (error) {
    console.error('Error executing rejection actions:', error)
    return { success: false, error: 'Failed to execute rejection actions' }
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Await params
    const { id: approvalId } = await params

    // Get authenticated user (supports both real auth and demo mode)
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get staff profile
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
      const { data: dbProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, display_name, title, email')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }
      profile = dbProfile
    }

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const validation = approvalActionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { action, notes, rejection_reason } = validation.data

    // Fetch approval with related data (use service client to bypass RLS for demo mode)
    const { data: approval, error: approvalError } = await serviceSupabase
      .from('approvals')
      .select(`
        *,
        requested_by_profile:requested_by (display_name, email),
        assigned_to_profile:assigned_to (display_name, email),
        related_deal:deals (id, name),
        related_investor:investors (id, legal_name)
      `)
      .eq('id', approvalId)
      .single()

    if (approvalError || !approval) {
      console.error('[Approval Action] Approval not found:', approvalId, approvalError)
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      )
    }

    // Check if already processed
    if (approval.status !== 'pending') {
      return NextResponse.json(
        { error: `Approval already ${approval.status}` },
        { status: 400 }
      )
    }

    // Check approval authority
    const authCheck = checkApprovalAuthority(profile, approval)
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.reason || 'Insufficient authority' },
        { status: 403 }
      )
    }

    // Update approval status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const updateData: any = {
      status: newStatus,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      notes: notes || approval.notes
    }

    if (action === 'reject') {
      updateData.rejection_reason = rejection_reason
    }

    const { data: updatedApproval, error: updateError } = await serviceSupabase
      .from('approvals')
      .update(updateData)
      .eq('id', approvalId)
      .select(`
        *,
        requested_by_profile:requested_by (display_name, email),
        assigned_to_profile:assigned_to (display_name, email),
        approved_by_profile:approved_by (display_name, email),
        related_deal:deals (id, name),
        related_investor:investors (id, legal_name)
      `)
      .single()

    if (updateError) {
      console.error('Approval update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update approval' },
        { status: 500 }
      )
    }

    // Execute downstream actions
    if (action === 'approve') {
      const actionResult = await executeApprovalActions(serviceSupabase, updatedApproval, user.id)
      if (!actionResult.success) {
        // Log warning but don't fail the approval
        console.warn('Approval succeeded but downstream actions failed:', actionResult.error)
      }
    } else {
      const rejectionResult = await executeRejectionActions(
        serviceSupabase,
        updatedApproval,
        rejection_reason || 'No reason provided'
      )
      if (!rejectionResult.success) {
        console.warn('Approval rejection succeeded but downstream actions failed:', rejectionResult.error)
      }
    }

    // Log in audit trail
    await auditLogger.log({
      actor_user_id: user.id,
      action: action === 'approve' ? AuditActions.APPROVE : AuditActions.REJECT,
      entity: 'approvals',
      entity_id: approvalId,
      metadata: {
        entity_type: approval.entity_type,
        target_entity_id: approval.entity_id,
        decision: action,
        decided_by: profile.display_name,
        notes: notes,
        rejection_reason: rejection_reason,
        investor: approval.related_investor?.legal_name,
        deal: approval.related_deal?.name
      }
    })

    return NextResponse.json({
      success: true,
      approval: updatedApproval,
      message: `${approval.entity_type} ${action}d successfully`
    })

  } catch (error) {
    console.error('Approval action API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
