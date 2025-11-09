import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, notes, rejection_reason } = body

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject.' },
        { status: 400 }
      )
    }

    // Check authentication
    const user = await requireStaffAuth()
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Get approval details with related data
    const { data: approval, error: fetchError } = await serviceSupabase
      .from('approvals')
      .select(`
        *,
        requested_by_profile:profiles!approvals_requested_by_fkey(id, display_name, email),
        related_investor:investors!approvals_related_investor_id_fkey(id, legal_name),
        related_deal:deals!approvals_related_deal_id_fkey(id, name)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !approval) {
      console.error('Approval fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      )
    }

    // Check if approval is already processed
    if (approval.status !== 'pending') {
      return NextResponse.json(
        { error: 'Approval has already been processed' },
        { status: 400 }
      )
    }

    // Start transaction
    const now = new Date().toISOString()
    let transactionError = null
    let transactionSuccess = true
    let notificationData = null

    // Calculate processing time in hours
    const createdAt = new Date(approval.created_at)
    const nowDate = new Date(now)
    const processingTimeHours = (nowDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    // Update approval status
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: user.id,
      approved_at: now,
      resolved_at: now,
      updated_at: now,
      actual_processing_time_hours: Math.round(processingTimeHours * 100) / 100 // Round to 2 decimals
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes
    }

    // Add rejection reason if rejecting
    if (action === 'reject' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    const { error: updateError } = await serviceSupabase
      .from('approvals')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('Approval update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update approval' },
        { status: 500 }
      )
    }

    // Handle entity-specific actions on approval
    if (action === 'approve') {
      const result = await handleEntityApproval(
        serviceSupabase,
        approval,
        user.id
      )

      if (!result.success) {
        transactionError = result.error
        transactionSuccess = false
      } else if (result.notificationData) {
        notificationData = result.notificationData
      }
    } else if (action === 'reject') {
      // Handle rejection
      await handleEntityRejection(serviceSupabase, approval, rejection_reason || '')
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: action === 'approve' ? AuditActions.APPROVE : AuditActions.REJECT,
      entity: 'approvals',
      entity_id: id,
      metadata: {
        entity_type: approval.entity_type,
        entity_id: approval.entity_id,
        notes,
        rejection_reason
      }
    })

    // Create notification for requester
    if (approval.requested_by) {
      const notificationMessage = action === 'approve'
        ? `Your ${approval.entity_type} request has been approved`
        : `Your ${approval.entity_type} request has been rejected`

      await serviceSupabase
        .from('investor_notifications')
        .insert({
          user_id: approval.requested_by,
          title: `${approval.entity_type} ${action}d`,
          message: notificationMessage,
          type: action === 'approve' ? 'approval_granted' : 'approval_rejected',
          metadata: {
            approval_id: id,
            entity_type: approval.entity_type,
            entity_id: approval.entity_id,
            rejection_reason: rejection_reason || undefined,
            notes: notes || undefined
          }
        })
    }

    return NextResponse.json({
      success: transactionSuccess,
      message: action === 'approve'
        ? 'Approval confirmed successfully'
        : 'Approval rejected successfully',
      error: transactionError,
      notificationData
    })
  } catch (error) {
    console.error('Approval action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle entity-specific approval actions
async function handleEntityApproval(
  supabase: any,
  approval: any,
  actorId: string
): Promise<{ success: boolean; error?: string; notificationData?: any }> {
  try {
    const entityType = approval.entity_type
    const entityId = approval.entity_id
    const metadata = approval.entity_metadata || {}

    switch (entityType) {
      // REMOVED: 'commitment' and 'deal_commitment' cases - tables deleted
      // The commitment workflow has been deprecated and replaced by
      // investor_deal_interest -> deal_subscription_submissions flow

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

      case 'investor_onboarding':
        // Update investor KYC status
        const { error: kycError } = await supabase
          .from('investors')
          .update({
            kyc_status: 'approved',
            kyc_approved_at: new Date().toISOString(),
            kyc_approved_by: actorId
          })
          .eq('id', entityId)

        if (kycError) {
          console.error('Error updating KYC status:', kycError)
          return { success: false, error: 'Failed to update KYC status' }
        }

        // Create user account for investor if doesn't exist
        if (metadata.email) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', metadata.email)
            .single()

          if (!existingProfile) {
            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'

            // Note: In production, this would trigger email verification
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                email: metadata.email,
                display_name: metadata.display_name || metadata.email.split('@')[0],
                role: 'investor',
                is_active: true,
                metadata: {
                  investor_id: entityId,
                  temp_password: tempPassword,
                  needs_password_reset: true
                }
              })

            if (profileError) {
              console.error('Error creating investor profile:', profileError)
              // Don't fail the approval, just log
            }

            // Link investor to the new profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', metadata.email)
              .single()

            if (newProfile) {
              await supabase
                .from('investor_users')
                .insert({
                  investor_id: entityId,
                  user_id: newProfile.id,
                  role: 'primary',
                  is_active: true
                })
            }
          }
        }
        break

      case 'deal':
        // Update deal status
        const { error: dealError } = await supabase
          .from('deals')
          .update({
            status: metadata.target_status || 'approved',
            approved_by: actorId,
            approved_at: new Date().toISOString()
          })
          .eq('id', entityId)

        if (dealError) {
          console.error('Error approving deal:', dealError)
          return { success: false, error: 'Failed to approve deal' }
        }
        break

      case 'deal_interest':
        // Update investor deal interest status
        const { error: interestError } = await supabase
          .from('investor_deal_interest')
          .update({
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', entityId)

        if (interestError) {
          console.error('Error approving deal interest:', interestError)
          return { success: false, error: 'Failed to approve deal interest' }
        }

        // Grant data room access automatically if deal has data room
        const { data: dealInterest } = await supabase
          .from('investor_deal_interest')
          .select(`
            *,
            deal:deals!inner(
              id,
              name,
              has_data_room
            )
          `)
          .eq('id', entityId)
          .single()

        if (dealInterest?.deal?.has_data_room) {
          // Check if access already exists
          const { data: existingAccess } = await supabase
            .from('deal_data_room_access')
            .select('id')
            .eq('deal_id', dealInterest.deal_id)
            .eq('investor_id', dealInterest.investor_id)
            .single()

          if (!existingAccess) {
            const { error: accessError } = await supabase
              .from('deal_data_room_access')
              .insert({
                deal_id: dealInterest.deal_id,
                investor_id: dealInterest.investor_id,
                granted_by: actorId,
                expires_at: metadata.data_room_expiry || null
              })

            if (accessError) {
              console.error('Error granting data room access:', accessError)
              // Don't fail the approval
            }
          }

          // Create task for NDA if required
          if (metadata.require_nda) {
            const { error: taskError } = await supabase
              .from('tasks')
              .insert({
                title: `Sign NDA for ${dealInterest.deal.name}`,
                description: `Please sign the NDA to access the data room for ${dealInterest.deal.name}`,
                entity_type: 'deal_nda',
                entity_id: dealInterest.deal_id,
                assigned_to: dealInterest.investor_id,
                owner_user_id: dealInterest.investor_id, // This would be the investor's user ID
                status: 'pending',
                priority: 'high',
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
              })

            if (taskError) {
              console.error('Error creating NDA task:', taskError)
              // Don't fail the approval
            }
          }

          return {
            success: true,
            notificationData: {
              type: 'data_room_access_granted',
              deal_name: dealInterest.deal.name
            }
          }
        }
        break

      case 'deal_subscription':
        // Update subscription submission status
        const { error: subError } = await supabase
          .from('deal_subscription_submissions')
          .update({
            status: 'approved',
            approved_by: actorId,
            approved_at: new Date().toISOString()
          })
          .eq('id', entityId)

        if (subError) {
          console.error('Error approving subscription submission:', subError)
          return { success: false, error: 'Failed to approve subscription submission' }
        }

        // Create formal subscription from submission
        const { data: submission } = await supabase
          .from('deal_subscription_submissions')
          .select(`
            *,
            deal:deals!inner(
              id,
              name,
              vehicle_id,
              currency
            )
          `)
          .eq('id', entityId)
          .single()

        if (submission && submission.deal?.vehicle_id) {
          // Check if subscription already exists
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('investor_id', submission.investor_id)
            .eq('vehicle_id', submission.deal.vehicle_id)
            .eq('deal_id', submission.deal_id)
            .single()

          if (!existingSub) {
            const { error: createSubError } = await supabase
              .from('subscriptions')
              .insert({
                investor_id: submission.investor_id,
                vehicle_id: submission.deal.vehicle_id,
                deal_id: submission.deal_id,
                commitment: submission.amount_requested,
                currency: submission.deal.currency || 'USD',
                status: 'pending_documentation',
                subscription_date: new Date().toISOString(),
                effective_date: submission.effective_date || new Date().toISOString(),
                acknowledgement_notes: `Approved from submission ${submission.id}`
              })

            if (createSubError) {
              console.error('Error creating subscription:', createSubError)
              return { success: false, error: 'Failed to create subscription' }
            }
          }

          return {
            success: true,
            notificationData: {
              type: 'subscription_approved',
              deal_name: submission.deal.name,
              amount: submission.amount_requested
            }
          }
        }
        break

      case 'document':
        // Update document status
        const { error: docError } = await supabase
          .from('documents')
          .update({
            status: 'approved',
            approved_by: actorId,
            approved_at: new Date().toISOString()
          })
          .eq('id', entityId)

        if (docError) {
          console.error('Error approving document:', docError)
          return { success: false, error: 'Failed to approve document' }
        }
        break

      case 'wire_instruction':
        // Update wire instruction status
        const { error: wireError } = await supabase
          .from('wire_instructions')
          .update({
            status: 'approved',
            approved_by: actorId,
            approved_at: new Date().toISOString()
          })
          .eq('id', entityId)

        if (wireError) {
          console.error('Error approving wire instruction:', wireError)
          return { success: false, error: 'Failed to approve wire instruction' }
        }
        break

      default:
        console.log(`No specific approval handler for entity type: ${entityType}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Entity approval handler error:', error)
    return { success: false, error: 'Failed to process entity approval' }
  }
}

// Handle entity-specific rejection actions
async function handleEntityRejection(
  supabase: any,
  approval: any,
  reason: string
): Promise<void> {
  try {
    const entityType = approval.entity_type
    const entityId = approval.entity_id

    // REMOVED: 'deal_commitment' case - table deleted

    if (entityType === 'deal_interest') {
      await supabase
        .from('investor_deal_interest')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', entityId)
    }

    if (entityType === 'deal_subscription') {
      await supabase
        .from('deal_subscription_submissions')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', entityId)
    }

    if (entityType === 'investor_onboarding') {
      await supabase
        .from('investors')
        .update({
          kyc_status: 'rejected',
          kyc_rejected_reason: reason,
          kyc_rejected_at: new Date().toISOString()
        })
        .eq('id', entityId)
    }

    if (entityType === 'allocation') {
      await supabase
        .from('allocations')
        .update({
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', entityId)
    }
  } catch (error) {
    console.error('Entity rejection handler error:', error)
    // Don't fail the rejection, just log
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireStaffAuth()
    const supabase = await createClient()

    // Soft delete the approval
    const { error } = await supabase
      .from('approvals')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Approval deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete approval' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approval deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}