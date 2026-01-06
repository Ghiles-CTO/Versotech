import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { triggerWorkflow } from '@/lib/trigger-workflow'
import { createSignatureRequest } from '@/lib/signature/client'
import { getCeoSigner } from '@/lib/staff/ceo-signer'
import { sendInvitationEmail } from '@/lib/email/resend-service'

/**
 * Generate subscription pack filename with standardized format:
 * {ENTITY_CODE} - SUBSCRIPTION PACK - {INVESTMENT_NAME} - {INVESTOR_NAME} - {DDMMYY}.docx
 *
 * Example: "VC206 - SUBSCRIPTION PACK - OPEN AI - Ghiless Business Ventures LLC - 121125.docx"
 */
function generateSubscriptionPackFilename(
  entityCode: string,
  investmentName: string,
  investorName: string,
  submittedAt: string | Date
): string {
  // Format date as DDMMYY
  const date = new Date(submittedAt)
  const day = date.getUTCDate().toString().padStart(2, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const year = date.getUTCFullYear().toString().slice(-2)
  const formattedDate = `${day}${month}${year}`

  // Clean up names (remove special chars, collapse multiple spaces)
  const cleanEntityCode = entityCode.trim()
  const cleanInvestmentName = investmentName.trim().replace(/\s+/g, ' ')
  const cleanInvestorName = investorName.trim().replace(/\s+/g, ' ')

  return `${cleanEntityCode} - SUBSCRIPTION PACK - ${cleanInvestmentName} - ${cleanInvestorName} - ${formattedDate}.docx`
}

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

    // Check if approval is already processed (preliminary check)
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

    // OPTIMISTIC LOCK: Only update if status is still 'pending'
    // This prevents race conditions where two staff members approve simultaneously
    const { data: updatedApproval, error: updateError, count } = await serviceSupabase
      .from('approvals')
      .update(updateData, { count: 'exact' })
      .eq('id', id)
      .eq('status', 'pending')  // ← OPTIMISTIC LOCK
      .select()
      .single()

    // Check if update succeeded (row was actually updated)
    if (count === 0 || !updatedApproval) {
      console.warn(`Approval ${id} was already processed by another user`)
      return NextResponse.json(
        { error: 'This approval was already processed by another user. Please refresh the page.' },
        { status: 409 }  // 409 Conflict
      )
    }

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

        // ROLLBACK: If entity logic fails, rollback approval to 'pending'
        console.error(`Entity approval failed for ${approval.entity_type}:`, result.error)
        console.log('Rolling back approval to pending status...')

        const { error: rollbackError } = await serviceSupabase
          .from('approvals')
          .update({
            status: 'pending',
            approved_by: null,
            approved_at: null,
            resolved_at: null,
            notes: `Auto-rollback: ${result.error}. Original approver: ${user.id}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (rollbackError) {
          console.error('CRITICAL: Rollback failed:', rollbackError)
          // Log to audit trail for manual intervention
          await auditLogger.log({
            actor_user_id: user.id,
            action: 'approval_rollback_failed',
            entity: 'approvals',
            entity_id: id,
            metadata: {
              original_error: result.error,
              rollback_error: rollbackError.message,
              severity: 'critical'
            }
          })

          // Return critical error - rollback failed
          return NextResponse.json(
            {
              success: false,
              error: `CRITICAL: Approval failed AND rollback failed. The approval may be in an inconsistent state. Manual intervention required. Contact support immediately with Approval ID: ${id}`,
              details: {
                approval_error: result.error,
                rollback_error: rollbackError.message,
                approval_id: id
              }
            },
            { status: 500 }
          )
        }

        // Rollback succeeded
        return NextResponse.json(
          {
            success: false,
            error: `Failed to process approval: ${result.error}. The approval has been rolled back to pending status. Please try again or contact support.`
          },
          { status: 500 }
        )
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
      action: action === 'approve' ? 'approval_approved' : 'approval_rejected',
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
              const ceoSigner = await getCeoSigner(supabase)
              if (!ceoSigner) {
                console.warn('[approvals] No CEO signer found, defaulting to approver profile')
              }

              const countersignerName = ceoSigner?.displayName || user.displayName || user.email?.split('@')[0] || 'Authorized Signatory'
              const countersignerTitle = ceoSigner?.title || 'Authorized Signatory'

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
                party_b_representative_name: countersignerName,
                party_b_representative_title: countersignerTitle,

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
                    // Skip signature workflow if no workflow_run_id
                    if (!result.workflow_run_id) {
                      console.warn('⚠️ No workflow_run_id available, skipping signature workflow creation')
                      break
                    }

                    // Create investor signature request (PARTY A - left column)
                    const investorSigPayload = {
                      workflow_run_id: result.workflow_run_id,
                      investor_id: investorData.id,
                      deal_id: dealInterest.deal_id,  // Link to deal for VERSOSign queries
                      signer_email: investorData.email,
                      signer_name: investorData.legal_name || investorData.display_name,
                      document_type: 'nda' as const,
                      google_drive_file_id: googleDriveFile.id,
                      google_drive_url: googleDriveFile.webContentLink || googleDriveFile.webViewLink,
                      signer_role: 'investor' as const,
                      signature_position: 'party_a' as const
                    }

                    console.log('🔍 Investor signature request payload:', investorSigPayload)

                    // Use direct function call instead of HTTP fetch
                    const investorSigResult = await createSignatureRequest(investorSigPayload, supabase)

                    if (investorSigResult.success) {
                      console.log('📧 Investor signature request created:', {
                        signature_request_id: investorSigResult.signature_request_id,
                        signing_url: investorSigResult.signing_url
                      })
                    } else {
                      console.error('Failed to create investor signature request:', investorSigResult.error)
                    }

                    // Create admin signature request (PARTY B - right column)
                    const adminSigPayload = {
                      workflow_run_id: result.workflow_run_id,
                      investor_id: investorData.id,
                      deal_id: dealInterest.deal_id,  // Link to deal for VERSOSign queries
                      signer_email: ceoSigner?.email || user.email,
                      signer_name: countersignerName,
                      document_type: 'nda' as const,
                      google_drive_file_id: googleDriveFile.id,
                      google_drive_url: googleDriveFile.webContentLink || googleDriveFile.webViewLink,
                      signer_role: 'admin' as const,
                      signature_position: 'party_b' as const
                    }

                    console.log('🔍 Admin signature request payload:', adminSigPayload)

                    // Use direct function call instead of HTTP fetch
                    const adminSigResult = await createSignatureRequest(adminSigPayload, supabase)

                    if (adminSigResult.success) {
                      console.log('📧 Admin signature request created:', {
                        signature_request_id: adminSigResult.signature_request_id,
                        signing_url: adminSigResult.signing_url
                      })
                    } else {
                      console.error('Failed to create admin signature request:', adminSigResult.error)
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
              currency,
              vehicle:vehicles(
                entity_code,
                investment_name,
                name
              )
            ),
            investor:investors!inner(
              display_name,
              legal_name
            )
          `)
          .eq('id', entityId)
          .single()

        if (submission && submission.deal?.vehicle_id) {
          // Extract amount from payload_json
          const amount = submission.payload_json?.amount || submission.payload_json?.subscription_amount || 0

          // Check if subscription already exists
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('investor_id', submission.investor_id)
            .eq('vehicle_id', submission.deal.vehicle_id)
            .eq('deal_id', submission.deal_id)
            .single()

          let subscriptionId = existingSub?.id

          if (!existingSub) {
            // Fetch deal's default fee plan to auto-link
            const { data: defaultFeePlan } = await supabase
              .from('fee_plans')
              .select('id')
              .eq('deal_id', submission.deal_id)
              .eq('is_default', true)
              .eq('is_active', true)
              .single()

            // Fetch fee structure BEFORE creating subscription to copy fee fields
            // This ensures the subscription record has the correct fee percentages for fee event calculation
            const { data: feeStructureForSub } = await supabase
              .from('deal_fee_structures')
              .select('subscription_fee_percent, management_fee_percent, carried_interest_percent, price_per_share_text, payment_deadline_days')
              .eq('deal_id', submission.deal_id)
              .eq('status', 'published')
              .maybeSingle()

            // Get latest valuation for fallback price_per_share
            const { data: latestValuation } = await supabase
              .from('valuations')
              .select('nav_per_unit')
              .eq('vehicle_id', submission.deal.vehicle_id)
              .order('as_of_date', { ascending: false })
              .limit(1)
              .maybeSingle()

            // Get fee components for management_fee_frequency and performance threshold
            let managementFeeFrequency: string | null = null
            let performanceFeeThreshold: number | null = null
            if (defaultFeePlan?.id) {
              const { data: feeComponents } = await supabase
                .from('fee_components')
                .select('kind, frequency, hurdle_rate_bps')
                .eq('fee_plan_id', defaultFeePlan.id)
                .in('kind', ['management', 'performance'])

              if (feeComponents) {
                const mgmtComponent = feeComponents.find((c: { kind: string; frequency?: string | null; hurdle_rate_bps?: number | null }) => c.kind === 'management')
                const perfComponent = feeComponents.find((c: { kind: string; frequency?: string | null; hurdle_rate_bps?: number | null }) => c.kind === 'performance')
                managementFeeFrequency = mgmtComponent?.frequency || null
                // Convert hurdle_rate_bps (basis points) to percentage
                performanceFeeThreshold = perfComponent?.hurdle_rate_bps
                  ? perfComponent.hurdle_rate_bps / 100
                  : null
              }
            }

            // Check for introduction (introducer linking)
            const { data: introduction } = await supabase
              .from('introductions')
              .select('id, introducer_id')
              .eq('prospect_investor_id', submission.investor_id)
              .eq('deal_id', submission.deal_id)
              .in('status', ['allocated', 'joined'])
              .maybeSingle()

            // Calculate price_per_share: parse from fee structure, fallback to valuation
            let pricePerShare: number | null = null
            if (feeStructureForSub?.price_per_share_text) {
              const parsed = parseFloat(feeStructureForSub.price_per_share_text.replace(/[^\d.]/g, ''))
              if (!isNaN(parsed) && parsed > 0) {
                pricePerShare = parsed
              }
            }
            if (pricePerShare === null && latestValuation?.nav_per_unit) {
              pricePerShare = latestValuation.nav_per_unit
            }

            // Calculate num_shares (draft - staff can adjust later)
            const numShares = pricePerShare ? Math.floor(amount / pricePerShare) : null

            // Pre-calculate subscription fee amount for fee events consistency
            // Normalize percent: if > 1, it's whole number format (2 = 2%), convert to decimal
            const feePercent = feeStructureForSub?.subscription_fee_percent || 0
            const normalizedPercent = feePercent > 1 ? feePercent / 100 : feePercent
            const subscriptionFeeAmount = normalizedPercent > 0
              ? amount * normalizedPercent
              : null

            // Calculate funding deadline
            const fundingDueAt = feeStructureForSub?.payment_deadline_days
              ? new Date(Date.now() + feeStructureForSub.payment_deadline_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              : null

            const { data: newSubscription, error: createSubError } = await supabase
              .from('subscriptions')
              .insert({
                investor_id: submission.investor_id,
                vehicle_id: submission.deal.vehicle_id,
                deal_id: submission.deal_id,
                fee_plan_id: defaultFeePlan?.id || null,
                commitment: amount,
                currency: submission.deal.currency || 'USD',
                status: 'pending',
                subscription_date: new Date().toISOString(),
                effective_date: submission.effective_date || new Date().toISOString(),
                acknowledgement_notes: `Approved from submission ${submission.id}. Awaiting subscription pack signature.`,
                // Copy fee fields from deal_fee_structures for fee event calculation
                subscription_fee_percent: feeStructureForSub?.subscription_fee_percent ?? null,
                management_fee_percent: feeStructureForSub?.management_fee_percent ?? null,
                performance_fee_tier1_percent: feeStructureForSub?.carried_interest_percent ?? null,
                // NEW: Populate additional fields for complete subscription record
                opportunity_name: submission.deal.vehicle?.investment_name || submission.deal.name,
                price_per_share: pricePerShare,
                num_shares: numShares,
                subscription_fee_amount: subscriptionFeeAmount,
                management_fee_frequency: managementFeeFrequency,
                performance_fee_tier1_threshold: performanceFeeThreshold,
                funding_due_at: fundingDueAt,
                introducer_id: introduction?.introducer_id || null,
                introduction_id: introduction?.id || null,
              })
              .select()
              .single()

            if (createSubError || !newSubscription) {
              console.error('Error creating subscription:', createSubError)
              return { success: false, error: 'Failed to create subscription' }
            }

            subscriptionId = newSubscription.id

            // Link subscription back to submission for easy lookup
            await supabase
              .from('deal_subscription_submissions')
              .update({ formal_subscription_id: subscriptionId })
              .eq('id', submission.id)
          }

            // AUTO-TRIGGER SUBSCRIPTION PACK WORKFLOW
            try {
              // Fetch all required data for subscription pack
              const { data: investorData } = await supabase
                .from('investors')
                .select('legal_name, type, registered_address, entity_identifier')
                .eq('id', submission.investor_id)
                .single()

              // Fetch counterparty entity if this is an entity subscription
              let counterpartyEntity = null
              if (submission.subscription_type === 'entity' && submission.counterparty_entity_id) {
                const { data: entityData } = await supabase
                  .from('investor_counterparty')
                  .select('*')
                  .eq('id', submission.counterparty_entity_id)
                  .single()
                counterpartyEntity = entityData
              }

              const { data: vehicleData } = await supabase
                .from('vehicles')
                .select('series_number, name, series_short_title, investment_name, issuer_gp_name, issuer_gp_rcc_number, issuer_rcc_number, issuer_website')
                .eq('id', submission.deal.vehicle_id)
                .single()

              const { data: feeStructure } = await supabase
                .from('deal_fee_structures')
                .select('*')
                .eq('deal_id', submission.deal_id)
                .eq('status', 'published')
                .maybeSingle()

              if (investorData && vehicleData && feeStructure && user) {
                // Calculate subscription details
                // Default to $1.00 per share if price_per_share_text is missing (makes certificate count = subscription amount)
                const parsedPrice = parseFloat(feeStructure.price_per_share_text?.replace(/[^\d.]/g, '') || '0')
                const pricePerShare = parsedPrice > 0 ? parsedPrice : 1.00
                if (!feeStructure.price_per_share_text || parsedPrice <= 0) {
                  console.warn('⚠️ [SUBSCRIPTION PACK] Missing price_per_share_text for deal:', submission.deal_id, '- defaulting to $1.00')
                }
                const certificatesCount = Math.floor(amount / pricePerShare)
                const subscriptionFeeRate = feeStructure.subscription_fee_percent || 0
                const subscriptionFeeAmount = amount * subscriptionFeeRate
                const totalSubscriptionPrice = amount + subscriptionFeeAmount

                // Format dates
                const agreementDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                const paymentDeadlineDays = feeStructure.payment_deadline_days || 10
                const paymentDeadlineDate = new Date(Date.now() + paymentDeadlineDays * 24 * 60 * 60 * 1000)
                  .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

                // Determine subscriber info (use entity if entity subscription, otherwise investor)
                const subscriberName = counterpartyEntity
                  ? counterpartyEntity.legal_name
                  : investorData.legal_name

                const subscriberType = counterpartyEntity
                  ? counterpartyEntity.entity_type.replace(/_/g, ' ').toUpperCase()
                  : (investorData.type || 'Corporate Entity')

                const subscriberAddress = counterpartyEntity && counterpartyEntity.registered_address
                  ? [
                      counterpartyEntity.registered_address.street,
                      [
                        counterpartyEntity.registered_address.city,
                        counterpartyEntity.registered_address.state,
                        counterpartyEntity.registered_address.postal_code
                      ].filter(Boolean).join(', '),
                      counterpartyEntity.registered_address.country
                    ].filter(Boolean).join(', ')
                  : (investorData.registered_address || '')

                const subscriberBlock = counterpartyEntity
                  ? `${counterpartyEntity.legal_name}, a ${counterpartyEntity.entity_type.replace(/_/g, ' ')} with registered office at ${subscriberAddress}`
                  : `${investorData.legal_name}, ${investorData.type || 'entity'} with registered office at ${investorData.registered_address || ''}`

                // Warn about incomplete address data (helps identify data quality issues)
                if (counterpartyEntity) {
                  const addr = counterpartyEntity.registered_address
                  if (!addr || !addr.street || !addr.country) {
                    console.warn('⚠️ [SUBSCRIPTION PACK] Entity has incomplete address:', {
                      entity: counterpartyEntity.legal_name,
                      missing: [!addr?.street && 'street', !addr?.country && 'country'].filter(Boolean)
                    })
                  }
                } else if (!investorData.registered_address) {
                  console.warn('⚠️ [SUBSCRIPTION PACK] Investor missing registered_address:', investorData.legal_name)
                }

                const subscriberTitle = counterpartyEntity && counterpartyEntity.representative_title
                  ? counterpartyEntity.representative_title
                  : 'Authorized Representative'

                // Representative name: prefer entity rep, fallback to entity name, then investor name
                const subscriberRepName = counterpartyEntity?.representative_name
                  || counterpartyEntity?.legal_name
                  || investorData.legal_name

                // Build comprehensive subscription pack payload
                const subscriptionPayload = {
                  // Series & Investment info
                  series_number: vehicleData.series_number || '',
                  series_title: vehicleData.investment_name || vehicleData.name,
                  series_short_title: vehicleData.series_short_title || '',
                  ultimate_investment: submission.deal.company_name || submission.deal.name,

                  // Subscriber info (entity if entity subscription, otherwise investor)
                  subscriber_name: subscriberName,
                  subscriber_type: subscriberType,
                  subscriber_address: subscriberAddress,
                  subscriber_block: subscriberBlock,
                  subscriber_title: subscriberTitle,
                  subscriber_representative_name: subscriberRepName,

                  // Investment branding
                  investment_logo_url: submission.deal.company_logo_url || '',

                  // Financial details
                  certificates_count: certificatesCount.toString(),
                  price_per_share: pricePerShare.toFixed(2),
                  subscription_amount: amount.toFixed(2),
                  subscription_fee_rate: `${(subscriptionFeeRate * 100).toFixed(2)}%`,
                  subscription_fee_amount: subscriptionFeeAmount.toFixed(2),
                  subscription_fee_text: `${(subscriptionFeeRate * 100).toFixed(2)}% upfront subscription fee`,
                  total_subscription_price: totalSubscriptionPrice.toFixed(2),

                  // Currency
                  currency_code: submission.deal.currency || 'USD',
                  currency_long: submission.deal.currency === 'USD' ? 'United States Dollars' : submission.deal.currency,

                  // Fee structures
                  management_fee_text: `${((feeStructure.management_fee_percent || 0) * 100).toFixed(2)}% of net asset value per annum, calculated and payable quarterly`,
                  performance_fee_text: `${((feeStructure.carried_interest_percent || 0) * 100).toFixed(2)}% performance fee on realized gains`,
                  escrow_fee_text: feeStructure.escrow_fee_text || 'As per escrow agreement',

                  // Legal clauses
                  management_fee_clause: feeStructure.management_fee_clause || `The Issuer shall charge a Management Fee of ${((feeStructure.management_fee_percent || 0) * 100).toFixed(2)}% per annum of the net asset value of the Series, calculated on a quarterly basis and payable quarterly in advance.`,
                  performance_fee_clause: feeStructure.performance_fee_clause || `The Issuer shall be entitled to a Performance Fee equal to ${((feeStructure.carried_interest_percent || 0) * 100).toFixed(2)}% of the net profits generated by the Series.`,

                  // Wire/Escrow instructions
                  wire_bank_name: feeStructure.wire_bank_name || 'Banque de Luxembourg',
                  wire_bank_address: feeStructure.wire_bank_address || '14, boulevard Royal, L-2449 Luxembourg, Grand Duchy of Luxembourg',
                  wire_account_holder: feeStructure.wire_account_holder || 'Elvinger Hoss Prussen - Escrow Account',
                  wire_escrow_agent: feeStructure.wire_escrow_agent || 'Elvinger Hoss Prussen',
                  wire_law_firm_address: feeStructure.wire_law_firm_address || '2 Place Winston Churchill, L-1340 Luxembourg, Grand Duchy of Luxembourg',
                  wire_iban: feeStructure.wire_iban || 'LU28 0019 4855 4447 1000',
                  wire_bic: feeStructure.wire_bic || 'BLUXLULL',
                  wire_reference: feeStructure.wire_reference_format?.replace('{series}', vehicleData.series_number || '') || `${vehicleData.series_number}-${vehicleData.series_short_title}`,
                  wire_description: feeStructure.wire_description_format || `Escrow account for ${vehicleData.name}`,
                  wire_arranger: feeStructure.exclusive_arranger || 'VERSO Management Ltd',
                  wire_contact_email: feeStructure.wire_contact_email || 'subscription@verso.capital',

                  // Issuer info
                  issuer_gp_name: vehicleData.issuer_gp_name || 'VERSO Capital 2 GP SARL',
                  issuer_gp_rcc_number: vehicleData.issuer_gp_rcc_number || '',
                  issuer_rcc_number: vehicleData.issuer_rcc_number || '',
                  issuer_website: vehicleData.issuer_website || 'www.verso.capital',
                  issuer_name: feeStructure.issuer_signatory_name || 'Alexandre Müller',
                  issuer_title: feeStructure.issuer_signatory_title || 'Authorized Signatory',

                  // Dates & deadlines
                  agreement_date: agreementDate,
                  payment_deadline_days: paymentDeadlineDays.toString(),
                  payment_deadline_date: paymentDeadlineDate,
                  issue_within_business_days: (feeStructure.issue_within_business_days || 5).toString(),

                  // Recitals
                  recital_b_html: feeStructure.recital_b_html || `(B) The Issuer intends to issue Certificates which shall track equity interests in ${submission.deal.company_name || submission.deal.name}, and the Subscriber intends to subscribe for ${certificatesCount} Certificates.`,

                  // Arranger
                  arranger_name: feeStructure.arranger_person_name || 'Julien Machot',
                  arranger_title: feeStructure.arranger_person_title || 'Director'
                }

                console.log('🔔 Triggering Subscription Pack workflow:', {
                  investor: investorData.legal_name,
                  deal: submission.deal.name,
                  series: vehicleData.series_number,
                  amount: amount
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

                  // Handle n8n response with binary file
                  if (result.n8n_response) {
                    try {
                      const n8nResponse = result.n8n_response
                      console.log('📦 n8n response structure:', Object.keys(n8nResponse))
                      console.log('📦 Full n8n response:', JSON.stringify(n8nResponse, null, 2))

                      // Extract data for filename generation
                      const entityCode = submission.deal?.vehicle?.entity_code || 'UNKNOWN'
                      const investmentName = submission.deal?.vehicle?.investment_name || 'INVESTMENT'
                      const investorName = submission.investor?.display_name || submission.investor?.legal_name || 'INVESTOR'
                      const submittedAt = submission.submitted_at

                      console.log('📝 Filename components:', { entityCode, investmentName, investorName, submittedAt })

                      // Check if response contains binary file data
                      let fileBuffer: Buffer
                      let fileName: string
                      let mimeType: string

                      if (n8nResponse.raw && typeof n8nResponse.raw === 'string') {
                        // Binary wrapped in { raw: "..." } format (from triggerWorkflow error handling)
                        // Use 'latin1' encoding to preserve binary data (1-to-1 byte mapping)
                        fileBuffer = Buffer.from(n8nResponse.raw, 'latin1')
                        fileName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, submittedAt)
                        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        console.log('✅ Received binary data in raw format, buffer size:', fileBuffer.length)
                      } else if (n8nResponse.binary) {
                        // Binary buffer format
                        fileBuffer = Buffer.from(n8nResponse.binary)
                        fileName = n8nResponse.filename || generateSubscriptionPackFilename(entityCode, investmentName, investorName, submittedAt)
                        mimeType = n8nResponse.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                      } else if (n8nResponse.data) {
                        // Base64 string format
                        fileBuffer = Buffer.from(n8nResponse.data, 'base64')
                        fileName = n8nResponse.filename || generateSubscriptionPackFilename(entityCode, investmentName, investorName, submittedAt)
                        mimeType = n8nResponse.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                      } else if (typeof n8nResponse === 'string') {
                        // Direct string format (n8n returns binary as string)
                        // Use 'latin1' encoding to preserve binary data (1-to-1 byte mapping)
                        fileBuffer = Buffer.from(n8nResponse, 'latin1')
                        fileName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, submittedAt)
                        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        console.log('✅ Received binary data as string, buffer size:', fileBuffer.length)
                      } else {
                        throw new Error('No binary data in n8n response')
                      }

                      // Verify file signature for Word documents (should be PK for ZIP/DOCX)
                      const signature = fileBuffer.slice(0, 4).toString('hex')
                      console.log('📄 Document file signature:', signature)
                      if (fileName.endsWith('.docx') && signature !== '504b0304') {
                        console.warn('⚠️ Warning: DOCX file signature mismatch. Expected: 504b0304, Got:', signature)
                        console.warn('⚠️ File may be corrupted. First 20 bytes:', fileBuffer.slice(0, 20).toString('hex'))
                      } else {
                        console.log('✅ File signature valid for', fileName)
                      }

                      // Upload to Supabase Storage (deal-documents bucket)
                      const fileKey = `subscriptions/${submission.id}/draft/${fileName}`
                      const { error: uploadError } = await supabase.storage
                        .from('deal-documents')
                        .upload(fileKey, fileBuffer, {
                          contentType: mimeType,
                          upsert: false
                        })

                      if (uploadError) {
                        console.error('❌ Failed to upload subscription pack:', uploadError)
                      } else {
                        console.log('✅ Subscription pack uploaded to storage:', fileKey)

                        // Look up the Subscription Documents folder for this vehicle
                        let subscriptionFolderId: string | null = null
                        if (submission.deal.vehicle_id) {
                          const { data: subFolder } = await supabase
                            .from('document_folders')
                            .select('id')
                            .eq('vehicle_id', submission.deal.vehicle_id)
                            .eq('name', 'Subscription Documents')
                            .single()
                          subscriptionFolderId = subFolder?.id || null
                        }

                        // Create document record linked to both submission and subscription
                        const { data: docRecord, error: docError } = await supabase
                          .from('documents')
                          .insert({
                            subscription_id: subscriptionId,
                            subscription_submission_id: submission.id,
                            deal_id: submission.deal_id,
                            vehicle_id: submission.deal.vehicle_id,
                            folder_id: subscriptionFolderId,
                            type: 'subscription_draft',
                            name: `Subscription Pack (Draft) - ${investmentName} - ${investorName}`,
                            file_key: fileKey,
                            mime_type: mimeType,
                            file_size_bytes: fileBuffer.length,
                            status: 'draft',
                            current_version: 1,
                            created_by: user.id
                          })
                          .select()
                          .single()

                        if (docError) {
                          console.error('❌ Failed to create document record:', docError)
                        } else {
                          console.log('✅ Subscription pack document created:', docRecord.id)

                          const packGeneratedAt = new Date().toISOString()
                          await supabase
                            .from('subscriptions')
                            .update({ pack_generated_at: packGeneratedAt })
                            .eq('id', subscriptionId)
                            .is('pack_generated_at', null)

                          // Update workflow_run with document_id in output_data
                          await supabase
                            .from('workflow_runs')
                            .update({
                              output_data: {
                                ...result.n8n_response,
                                document_id: docRecord.id,
                                file_key: fileKey
                              }
                            })
                            .eq('id', result.workflow_run_id)
                        }
                      }
                    } catch (docError) {
                      console.error('❌ Error processing subscription pack document:', docError)
                      // Don't fail the approval if document processing fails
                    }
                  }
                }
              }
            } catch (workflowError) {
              console.error('Error triggering Subscription Pack workflow:', workflowError)
              // Don't fail the approval if workflow trigger fails
            }

          return {
            success: true,
            notificationData: {
              type: 'subscription_approved',
              deal_name: submission.deal.name,
              amount: amount
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

      case 'sale_request':
        // Approve investor sale request - updates status to 'approved'
        // CEO can then work on finding a buyer
        const { error: saleApproveError } = await supabase
          .from('investor_sale_requests')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString()
          })
          .eq('id', entityId)

        if (saleApproveError) {
          console.error('Error approving sale request:', saleApproveError)
          return { success: false, error: 'Failed to approve sale request' }
        }

        console.log('Sale request approved:', entityId)
        break

      case 'gdpr_deletion_request':
        // GDPR Article 17 - Right to Erasure
        // Soft-delete user data and anonymize records
        const userId = entityId // entityId is the user_id for GDPR requests

        // Get user profile for audit
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email, display_name')
          .eq('id', userId)
          .single()

        if (!userProfile) {
          return { success: false, error: 'User profile not found' }
        }

        const anonymizedEmail = `deleted_${userId.substring(0, 8)}@anonymized.local`
        const anonymizedName = `Deleted User ${userId.substring(0, 8)}`

        // 1. Anonymize profile (soft delete)
        const { error: profileAnonymizeError } = await supabase
          .from('profiles')
          .update({
            display_name: anonymizedName,
            full_name: anonymizedName,
            email: anonymizedEmail,
            phone: null,
            avatar_url: null,
            is_active: false,
            metadata: {
              gdpr_deleted: true,
              deleted_at: new Date().toISOString(),
              original_email_hash: Buffer.from(userProfile.email || '').toString('base64').substring(0, 16),
              approved_by: actorId
            }
          })
          .eq('id', userId)

        if (profileAnonymizeError) {
          console.error('Error anonymizing profile:', profileAnonymizeError)
          return { success: false, error: 'Failed to anonymize profile' }
        }

        // 2. Anonymize investor record if exists
        const { data: investorUser } = await supabase
          .from('investor_users')
          .select('investor_id')
          .eq('user_id', userId)
          .single()

        if (investorUser?.investor_id) {
          await supabase
            .from('investors')
            .update({
              legal_name: anonymizedName,
              display_name: anonymizedName,
              email: anonymizedEmail,
              phone: null,
              registered_address: null,
              representative_name: null,
              is_deleted: true,
              deleted_at: new Date().toISOString()
            })
            .eq('id', investorUser.investor_id)
        }

        // 3. Clear notifications for this user
        await supabase
          .from('investor_notifications')
          .delete()
          .eq('user_id', userId)

        // 4. Anonymize audit logs actor name (keep logs for compliance but anonymize)
        await supabase
          .from('audit_logs')
          .update({
            action_details: supabase.rpc('jsonb_set', {
              target: 'action_details',
              path: '{actor_anonymized}',
              value: '"true"'
            })
          })
          .eq('actor_id', userId)

        // 5. Notify the user that deletion is complete
        // (They may still have access briefly until session expires)
        console.log('GDPR deletion completed for user:', userId)

        // Create audit log for GDPR deletion
        await auditLogger.log({
          actor_user_id: actorId,
          action: 'gdpr_deletion_completed',
          entity: 'profile',
          entity_id: userId,
          metadata: {
            original_email_hash: Buffer.from(userProfile.email || '').toString('base64').substring(0, 16),
            approval_id: approval.id,
            gdpr_article: '17'
          }
        })

        return {
          success: true,
          notificationData: {
            type: 'gdpr_deletion_completed',
            user_id: userId
          }
        }

      case 'arranger_profile_update':
        // Apply arranger profile update changes
        const requestedChanges = metadata.requested_changes || {}
        const arrangerEntityId = entityId

        // Build update object with only provided fields
        // Note: arranger_entities uses email/phone/address (not contact_email/contact_phone)
        const arrangerUpdates: Record<string, any> = {}
        if (requestedChanges.email) arrangerUpdates.email = requestedChanges.email
        if (requestedChanges.phone) arrangerUpdates.phone = requestedChanges.phone
        if (requestedChanges.address) arrangerUpdates.address = requestedChanges.address

        if (Object.keys(arrangerUpdates).length > 0) {
          arrangerUpdates.updated_at = new Date().toISOString()

          const { error: arrangerUpdateError } = await supabase
            .from('arranger_entities')
            .update(arrangerUpdates)
            .eq('id', arrangerEntityId)

          if (arrangerUpdateError) {
            console.error('Error updating arranger profile:', arrangerUpdateError)
            return { success: false, error: 'Failed to update arranger profile' }
          }
        }

        // Notify the arranger who requested the update
        if (approval.requested_by) {
          await supabase.from('investor_notifications').insert({
            user_id: approval.requested_by,
            investor_id: null,
            title: 'Profile Update Approved',
            message: 'Your profile update request has been approved and applied.',
            link: '/versotech_main/arranger-profile',
          })
        }

        return {
          success: true,
          notificationData: {
            type: 'arranger_profile_updated',
            arranger_id: arrangerEntityId
          }
        }

      case 'member_invitation':
        // CEO approved member invitation - now send the actual invitation email
        const invitationId = entityId

        // Get the invitation details
        const { data: invitation, error: inviteFetchError } = await supabase
          .from('member_invitations')
          .select('*')
          .eq('id', invitationId)
          .single()

        if (inviteFetchError || !invitation) {
          console.error('Error fetching invitation:', inviteFetchError)
          return { success: false, error: 'Member invitation not found' }
        }

        if (invitation.status !== 'pending_approval') {
          return { success: false, error: 'Invitation is not pending approval' }
        }

        // Update invitation status to 'pending' (ready for acceptance)
        // Reset expiry to 7 days from now since approval may have taken time
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const { error: inviteUpdateError } = await supabase
          .from('member_invitations')
          .update({
            status: 'pending',
            expires_at: newExpiresAt
          })
          .eq('id', invitationId)

        if (inviteUpdateError) {
          console.error('Error updating invitation status:', inviteUpdateError)
          return { success: false, error: 'Failed to update invitation status' }
        }

        // Send the invitation email
        const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitation/accept?token=${invitation.invitation_token}`

        const emailResult = await sendInvitationEmail({
          email: invitation.email,
          inviteeName: undefined,
          entityName: invitation.entity_name || metadata.entity_name || 'the organization',
          entityType: invitation.entity_type,
          role: invitation.role,
          inviterName: invitation.invited_by_name || 'A team member',
          acceptUrl: acceptUrl,
          expiresAt: newExpiresAt
        })

        if (!emailResult.success) {
          console.error('Failed to send invitation email:', emailResult.error)
          // Don't fail - invitation is approved, email can be resent
        }

        // Notify the inviter that their invitation was approved
        if (invitation.invited_by) {
          await supabase.from('investor_notifications').insert({
            user_id: invitation.invited_by,
            title: 'Member Invitation Approved',
            message: `Your invitation to ${invitation.email} has been approved and sent.`,
            type: 'member_invitation_approved',
            metadata: {
              invitation_id: invitationId,
              invitee_email: invitation.email,
              entity_type: invitation.entity_type
            }
          })
        }

        console.log('✅ Member invitation approved and email sent:', {
          invitation_id: invitationId,
          email: invitation.email,
          entity_type: invitation.entity_type,
          email_sent: emailResult.success
        })

        return {
          success: true,
          notificationData: {
            type: 'member_invitation_approved',
            invitation_id: invitationId,
            email: invitation.email,
            email_sent: emailResult.success
          }
        }

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

    if (entityType === 'sale_request') {
      await supabase
        .from('investor_sale_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', entityId)
    }

    if (entityType === 'gdpr_deletion_request') {
      // Notify user their deletion request was rejected
      await supabase
        .from('investor_notifications')
        .insert({
          user_id: entityId, // entityId is the user_id for GDPR requests
          title: 'Deletion Request Rejected',
          message: `Your account deletion request was rejected. Reason: ${reason || 'No reason provided'}`,
          type: 'gdpr_request_rejected',
          metadata: {
            approval_id: approval.id,
            rejection_reason: reason
          }
        })
    }

    if (entityType === 'arranger_profile_update') {
      // Notify arranger their profile update was rejected
      if (approval.requested_by) {
        await supabase.from('investor_notifications').insert({
          user_id: approval.requested_by,
          investor_id: null,
          title: 'Profile Update Rejected',
          message: `Your profile update request was rejected. ${reason ? `Reason: ${reason}` : ''}`,
          link: '/versotech_main/arranger-profile',
        })
      }
    }

    if (entityType === 'member_invitation') {
      // Update invitation status to 'rejected'
      await supabase
        .from('member_invitations')
        .update({
          status: 'rejected'
        })
        .eq('id', entityId)

      // Notify the inviter that their invitation was rejected
      if (approval.requested_by) {
        const metadata = approval.entity_metadata || {}
        await supabase.from('investor_notifications').insert({
          user_id: approval.requested_by,
          title: 'Member Invitation Rejected',
          message: `Your invitation to ${metadata.email || 'the user'} was rejected. ${reason ? `Reason: ${reason}` : ''}`,
          type: 'member_invitation_rejected',
          metadata: {
            invitation_id: entityId,
            invitee_email: metadata.email,
            entity_type: metadata.entity_type,
            rejection_reason: reason
          }
        })
      }
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
