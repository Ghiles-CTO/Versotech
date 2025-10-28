import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { auditLogger, AuditActions } from '@/lib/audit'
import { trackDealEvent } from '@/lib/analytics'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

async function getPrimaryInvestorUserId(
  supabase: any,
  investorId: string
) {
  const { data, error } = await supabase
    .from('investor_users')
    .select('user_id')
    .eq('investor_id', investorId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) {
    console.error('Failed to resolve investor user', error)
    return null
  }

  return data?.[0]?.user_id ?? null
}

async function ensureInvestorTask(
  supabase: any,
  investorId: string | null,
  task: {
    owner_user_id: string | null
    kind: string
    category: string
    title: string
    description: string
    priority?: 'low' | 'medium' | 'high'
    related_entity_type?: string
    related_entity_id?: string
    deal_id?: string | null
    due_in_days?: number
    instructions?: Record<string, any>
  }
) {
  if (!investorId || !task.owner_user_id) return

  const dueAt = task.due_in_days
    ? new Date(Date.now() + task.due_in_days * 24 * 60 * 60 * 1000).toISOString()
    : null

  try {
    await supabase.from('tasks').insert({
      owner_user_id: task.owner_user_id,
      owner_investor_id: investorId,
      kind: task.kind,
      category: task.category,
      title: task.title,
      description: task.description,
      priority: task.priority ?? 'high',
      related_entity_type: task.related_entity_type ?? null,
      related_entity_id: task.related_entity_id ?? null,
      due_at: dueAt,
      instructions: task.instructions ?? null
    })
  } catch (error) {
    console.error('Failed to create investor task', error)
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

      case 'deal_interest': {
        const { error: interestError } = await supabase
          .from('investor_deal_interest')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString()
          })
          .eq('id', entityId)

        if (interestError) {
          console.error('Error approving deal interest:', interestError)
          return { success: false, error: 'Failed to approve deal interest' }
        }

        const ownerUserId = await getPrimaryInvestorUserId(supabase, approval.related_investor_id)
        await ensureInvestorTask(supabase, approval.related_investor_id, {
          owner_user_id: ownerUserId,
          kind: 'deal_nda_signature',
          category: 'investment_setup',
          title: `Sign NDA for ${approval.related_deal?.name ?? 'deal'}`,
          description: 'Please execute the NDA so we can open the data room for this opportunity.',
          related_entity_type: 'deal_interest',
          related_entity_id: approval.entity_id,
          deal_id: approval.related_deal_id,
          due_in_days: 3,
          instructions: {
            type: 'nda_sign',
            deal_id: approval.related_deal_id,
            interest_id: approval.entity_id
          }
        })

        if (ownerUserId) {
          try {
            await supabase.from('investor_notifications').insert({
              user_id: ownerUserId,
              investor_id: approval.related_investor_id,
              title: 'Interest approved',
              message: `Your interest in ${approval.related_deal?.name ?? 'this deal'} has been approved. Review and sign the NDA to unlock the data room.`,
              link: '/versoholdings/tasks',
              metadata: {
                type: 'deal_interest_approved',
                deal_id: approval.related_deal_id,
                approval_id: approval.id,
                interest_id: approval.entity_id
              }
            })
          } catch (notificationError) {
            console.error('Failed to create investor notification for interest approval', notificationError)
          }
        }

        try {
          await supabase.from('automation_webhook_events').insert({
            event_type: 'nda_generate_request',
            related_deal_id: approval.related_deal_id,
            related_investor_id: approval.related_investor_id,
            payload: {
              approval_id: approval.id,
              deal_id: approval.related_deal_id,
              investor_id: approval.related_investor_id,
              indicative_amount: metadata.indicative_amount ?? null,
              indicative_currency: metadata.indicative_currency ?? null,
              notes: metadata.notes ?? null
            }
          })
        } catch (eventError) {
          console.error('Failed to enqueue NDA generation event:', eventError)
        }

        if (process.env.AUTOMATION_NDA_GENERATE_URL) {
          try {
            await fetch(process.env.AUTOMATION_NDA_GENERATE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                approval_id: approval.id,
                deal_id: approval.related_deal_id,
                investor_id: approval.related_investor_id,
                indicative_amount: metadata.indicative_amount ?? null,
                indicative_currency: metadata.indicative_currency ?? null
              })
            })
          } catch (automationError) {
            console.error('Failed to trigger NDA automation webhook:', automationError)
          }
        }

        await trackDealEvent({
          supabase,
          dealId: approval.related_deal_id,
          investorId: approval.related_investor_id,
          eventType: 'deal_interest_approved',
          payload: {
            approval_id: approval.id,
            interest_id: approval.entity_id,
            indicative_amount: metadata.indicative_amount ?? null,
            indicative_currency: metadata.indicative_currency ?? null
          }
        })

        // TODO: invoke automation (nda_generate) once integration endpoint is available
        break
      }

      case 'deal_subscription': {
        const { error: subscriptionError } = await supabase
          .from('deal_subscription_submissions')
          .update({
            status: 'approved',
            decided_at: new Date().toISOString(),
            decided_by: actorId
          })
          .eq('id', entityId)

        if (subscriptionError) {
          console.error('Error approving subscription submission:', subscriptionError)
          return { success: false, error: 'Failed to approve subscription submission' }
        }

        const ownerUserId = await getPrimaryInvestorUserId(supabase, approval.related_investor_id)
        await ensureInvestorTask(supabase, approval.related_investor_id, {
          owner_user_id: ownerUserId,
          kind: 'investment_allocation_confirmation',
          category: 'investment_setup',
          title: `Confirm allocation for ${approval.related_deal?.name ?? 'deal'}`,
          description: 'Review the subscription pack and confirm the final allocation details.',
          related_entity_type: 'deal_subscription',
          related_entity_id: approval.entity_id,
          deal_id: approval.related_deal_id,
          due_in_days: 5,
          instructions: {
            type: 'subscription_review',
            deal_id: approval.related_deal_id,
            submission_id: approval.entity_id
          }
        })

        try {
          await supabase.from('automation_webhook_events').insert({
            event_type: 'subscription_pack_generate_request',
            related_deal_id: approval.related_deal_id,
            related_investor_id: approval.related_investor_id,
            payload: {
              approval_id: approval.id,
              deal_id: approval.related_deal_id,
              investor_id: approval.related_investor_id,
              submission_id: entityId,
              payload: metadata.payload ?? null
            }
          })
        } catch (eventError) {
          console.error('Failed to enqueue subscription pack event:', eventError)
        }

        if (process.env.AUTOMATION_SUBSCRIPTION_PACK_URL) {
          try {
            await fetch(process.env.AUTOMATION_SUBSCRIPTION_PACK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                approval_id: approval.id,
                deal_id: approval.related_deal_id,
                investor_id: approval.related_investor_id,
                submission_id: entityId
              })
            })
          } catch (automationError) {
            console.error('Failed to trigger subscription automation webhook:', automationError)
          }
        }

        await trackDealEvent({
          supabase,
          dealId: approval.related_deal_id,
          investorId: approval.related_investor_id,
          eventType: 'deal_subscription_approved',
          payload: {
            approval_id: approval.id,
            submission_id: approval.entity_id,
            amount: metadata.payload?.amount ?? null,
            currency: metadata.payload?.currency ?? null
          }
        })
        break
      }

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
    } else if (entityType === 'deal_interest') {
      await supabase
        .from('investor_deal_interest')
        .update({ status: 'rejected' })
        .eq('id', entityId)
    } else if (entityType === 'deal_subscription') {
      await supabase
        .from('deal_subscription_submissions')
        .update({ status: 'rejected', decided_at: new Date().toISOString(), decided_by: null })
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
        { error: 'Invalid request data', details: (validation.error as any).errors },
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
      action: AuditActions.UPDATE,
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
