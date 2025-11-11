import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { triggerWorkflow } from '@/lib/trigger-workflow'

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
        user.id,
        request,
        user
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
  actorId: string,
  request?: Request,
  user?: any
): Promise<{ success: boolean; error?: string; notificationData?: any }> {
  try {
    const entityType = approval.entity_type
    const entityId = approval.entity_id
    const metadata = approval.entity_metadata || {}

    switch (entityType) {
      case 'deal_commitment':
        // Auto-trigger Subscription Pack workflow for deal commitment approvals
        try {
          const { data: investorData } = await supabase
            .from('investors')
            .select('*')
            .eq('id', approval.related_investor_id)
            .single()

          const { data: dealData } = await supabase
            .from('deals')
            .select('*, vehicle:vehicles(*)')
            .eq('id', approval.related_deal_id)
            .single()

          if (investorData && dealData && user) {
            const subscriptionPayload = {
              investor_id: investorData.id,
              vehicle_id: dealData.vehicle_id,
              commitment_amount: metadata.requested_amount || metadata.commitment_amount || 0,
              include_ppm: true
            }

            console.log('🔔 Triggering Subscription Pack workflow:', { investor: investorData.legal_name })

            const result = await triggerWorkflow({
              workflowKey: 'generate-subscription-pack',
              payload: subscriptionPayload,
              entityType: 'deal_commitment_subscription',
              user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                title: user.title
              }
            })

            if (!result.success) {
              console.error('❌ Failed to trigger Subscription Pack workflow:', result.error)
            } else {
              console.log('✅ Subscription Pack workflow triggered successfully:', {
                investor: investorData.legal_name,
                workflow_run_id: result.workflow_run_id
              })
            }
          }
        } catch (subError) {
          console.error('Error triggering Subscription Pack workflow:', subError)
        }
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
      case 'deal_interest_nda':
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

        // Fetch deal interest details for NDA workflow
        const { data: dealInterest } = await supabase
          .from('investor_deal_interest')
          .select(`
            *,
            deal:deals!inner(
              id,
              name
            )
          `)
          .eq('id', entityId)
          .single()

        console.log('🔍 DEBUG: dealInterest:', dealInterest ? 'EXISTS' : 'NULL')

        if (dealInterest) {
          // Auto-trigger NDA workflow after interest approval
          try {
            // Fetch complete investor and deal data for NDA
            const { data: investorData } = await supabase
              .from('investors')
              .select('*, profiles!investors_created_by_fkey(display_name)')
              .eq('id', dealInterest.investor_id)
              .single()

            const { data: dealData } = await supabase
              .from('deals')
              .select('*, vehicle:vehicles(*)')
              .eq('id', dealInterest.deal_id)
              .single()

            console.log('🔍 DEBUG: Data check:', {
              hasInvestor: !!investorData,
              hasDeal: !!dealData,
              hasUser: !!user
            })

            if (investorData && dealData && user) {
              // Prepare NDA payload with all required fields
              const ndaPayload = {
                series_number: dealData.vehicle?.entity_code || 'VC206',
                project_description: dealData.vehicle?.name || 'VERSO Capital 2 SCSP Series 206',
                investment_description: dealData.name || dealData.description || 'Investment Opportunity',

                // Party A (Investor)
                party_a_name: investorData.legal_name || investorData.display_name,
                party_a_registered_address: investorData.registered_address || 'Address to be provided',
                party_a_city_country: investorData.city || `${investorData.country || 'Country to be provided'}`,
                party_a_representative_name: investorData.representative_name || 'Representative to be provided',
                party_a_representative_title: investorData.representative_title || 'Title to be provided',

                // Party B (VERSO)
                party_b_name: dealData.vehicle?.name || 'VERSO Capital 2 SCSP Series 206 ("VC206")',
                party_b_registered_address: '2, Avenue Charles de Gaulle – L-1653',
                party_b_city_country: dealData.vehicle?.domicile || 'Luxembourg, LU',
                party_b_representative_name: 'Julien Machot',
                party_b_representative_title: 'Managing Partner',

                // Execution details
                dataroom_email: investorData.email || 'email@required.com',
                execution_date: new Date().toISOString().split('T')[0],
                zoho_sign_document_id: '' // Auto-generated by n8n
              }

              // Trigger NDA workflow
              console.log('🔔 Triggering NDA workflow:', { investor: investorData.legal_name })

              const result = await triggerWorkflow({
                workflowKey: 'process-nda',
                payload: ndaPayload,
                entityType: 'deal_interest_nda',
                entityId: dealInterest.id,
                user: {
                  id: user.id,
                  email: user.email,
                  displayName: user.displayName,
                  role: user.role,
                  title: user.title
                }
              })

              if (!result.success) {
                console.error('❌ Failed to trigger NDA workflow:', result.error)
              } else {
                console.log('✅ NDA workflow triggered successfully:', {
                  investor: investorData.legal_name,
                  workflow_run_id: result.workflow_run_id
                })

                // Create TWO signature requests if n8n returned Google Drive file
                if (result.n8n_response) {
                  const googleDriveFile = Array.isArray(result.n8n_response)
                    ? result.n8n_response[0]
                    : result.n8n_response

                  try {
                    // Create investor signature request (PARTY A - left column)
                    const investorSigPayload = {
                      workflow_run_id: result.workflow_run_id,
                      investor_id: investorData.id,
                      signer_email: investorData.email,
                      signer_name: investorData.legal_name || investorData.display_name,
                      document_type: 'nda',
                      google_drive_file_id: googleDriveFile.id,
                      google_drive_url: googleDriveFile.webContentLink || googleDriveFile.webViewLink,
                      signer_role: 'investor',
                      signature_position: 'party_a'
                    }

                    console.log('🔍 Investor signature request payload:', investorSigPayload)

                    const investorSigResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/signature/request`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(investorSigPayload)
                    })

                    if (investorSigResponse.ok) {
                      const investorSigData = await investorSigResponse.json()
                      console.log('📧 Investor signature request created:', {
                        signature_request_id: investorSigData.signature_request_id,
                        signing_url: investorSigData.signing_url
                      })
                    } else {
                      console.error('Failed to create investor signature request:', await investorSigResponse.text())
                    }

                    // Create admin signature request (PARTY B - right column)
                    const adminSigPayload = {
                      workflow_run_id: result.workflow_run_id,
                      investor_id: investorData.id,
                      signer_email: 'cto@versoholdings.com',
                      signer_name: 'Julien Machot',
                      document_type: 'nda',
                      google_drive_file_id: googleDriveFile.id,
                      google_drive_url: googleDriveFile.webContentLink || googleDriveFile.webViewLink,
                      signer_role: 'admin',
                      signature_position: 'party_b'
                    }

                    console.log('🔍 Admin signature request payload:', adminSigPayload)

                    const adminSigResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/signature/request`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(adminSigPayload)
                    })

                    if (adminSigResponse.ok) {
                      const adminSigData = await adminSigResponse.json()
                      console.log('📧 Admin signature request created:', {
                        signature_request_id: adminSigData.signature_request_id,
                        signing_url: adminSigData.signing_url
                      })
                    } else {
                      console.error('Failed to create admin signature request:', await adminSigResponse.text())
                    }
                  } catch (sigError) {
                    console.error('Error creating signature requests:', sigError)
                    // Don't fail approval if signature request fails
                  }
                }
              }
            } else {
              console.log('⚠️ Skipping NDA workflow - missing data:', {
                hasInvestor: !!investorData,
                hasDeal: !!dealData,
                hasUser: !!user
              })
            }
          } catch (ndaError) {
            console.error('❌ Error triggering NDA workflow:', ndaError)
            // Don't fail the approval if NDA trigger fails
          }
        } else {
          console.log('⚠️ No deal interest found for entityId:', entityId)
        }
        break

      case 'data_room_access_extension':
        // Extend data room access by 7 days
        const { data: currentAccess } = await supabase
          .from('deal_data_room_access')
          .select('expires_at')
          .eq('id', entityId)
          .single()

        if (!currentAccess) {
          return { success: false, error: 'Access record not found' }
        }

        // Calculate new expiry: add 7 days to current expiry (not from now)
        const currentExpiry = new Date(currentAccess.expires_at)
        const newExpiry = new Date(currentExpiry)
        newExpiry.setDate(newExpiry.getDate() + 7)

        const { error: extendError } = await supabase
          .from('deal_data_room_access')
          .update({
            expires_at: newExpiry.toISOString(),
            notes: `Extended by 7 days upon approval on ${new Date().toLocaleDateString()}`
          })
          .eq('id', entityId)

        if (extendError) {
          console.error('Error extending data room access:', extendError)
          return { success: false, error: 'Failed to extend data room access' }
        }

        console.log('✅ Data room access extended:', {
          access_id: entityId,
          old_expiry: currentAccess.expires_at,
          new_expiry: newExpiry.toISOString()
        })
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

            // AUTO-TRIGGER SUBSCRIPTION PACK WORKFLOW
            try {
              const { data: investorData } = await supabase
                .from('investors')
                .select('*')
                .eq('id', submission.investor_id)
                .single()

              if (investorData && user) {
                const subscriptionPayload = {
                  investor_id: investorData.id,
                  vehicle_id: submission.deal.vehicle_id,
                  commitment_amount: submission.amount_requested || 0,
                  include_ppm: true
                }

                console.log('🔔 Triggering Subscription Pack workflow:', {
                  investor: investorData.legal_name,
                  deal: submission.deal.name
                })

                const result = await triggerWorkflow({
                  workflowKey: 'generate-subscription-pack',
                  payload: subscriptionPayload,
                  entityType: 'deal_subscription',
                  entityId: submission.id,
                  user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    role: user.role,
                    title: user.title
                  }
                })

                if (!result.success) {
                  console.error('❌ Failed to trigger Subscription Pack workflow:', result.error)
                } else {
                  console.log('✅ Subscription Pack workflow triggered successfully:', {
                    investor: investorData.legal_name,
                    workflow_run_id: result.workflow_run_id
                  })
                }
              }
            } catch (workflowError) {
              console.error('Error triggering Subscription Pack workflow:', workflowError)
              // Don't fail the approval if workflow trigger fails
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