import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { triggerWorkflow } from '@/lib/trigger-workflow'
import { createSignatureRequest } from '@/lib/signature/client'
import { getCeoSigner } from '@/lib/staff/ceo-signer'
import { sendInvitationEmail } from '@/lib/email/resend-service'
import { getAppUrl } from '@/lib/signature/token'
import { handleDealClose, handleTermsheetClose } from '@/lib/deals/deal-close-handler'
import { buildSubscriptionPackPayload } from '@/lib/subscription-pack/payload-builder'

const ACCOUNT_ACTIVATION_ENTITY_TABLES = [
  'investors',
  'partners',
  'lawyers',
  'introducers',
  'commercial_partners',
  'arranger_entities',
] as const

function resolveAccountActivationEntityTable(metadata: any): string | null {
  const entityTable = metadata?.entity_table
  if (!entityTable) {
    return null
  }
  return ACCOUNT_ACTIVATION_ENTITY_TABLES.includes(entityTable) ? entityTable : null
}

function getApprovalEntityLabel(entityType: string): string {
  const labels: Record<string, string> = {
    account_activation: 'account activation',
    deal_interest: 'data room access',
    deal_interest_nda: 'data room access',
    deal_subscription: 'subscription',
    investor_onboarding: 'onboarding',
    member_invitation: 'member invitation',
    sale_request: 'sale request',
    commission_invoice: 'commission invoice',
  }

  return labels[entityType] || entityType.replace(/_/g, ' ')
}

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

  return `${cleanEntityCode} - SUBSCRIPTION PACK - ${cleanInvestmentName} - ${cleanInvestorName} - ${formattedDate}`
}

/**
 * Determine file extension from mime type
 */
function getFileExtension(mimeType: string): string {
  if (mimeType === 'application/pdf') return '.pdf'
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx'
  if (mimeType.includes('word')) return '.docx'
  return '.pdf' // Default to PDF since that's our new output_format default
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
      let accountActivationSnapshot: {
        entityTable: string
        entityId: string
        accountApprovalStatus: string | null
        onboardingStatus?: string | null
      } | null = null

      if (approval.entity_type === 'account_activation') {
        const entityTable = resolveAccountActivationEntityTable(approval.entity_metadata || {})
        if (entityTable) {
          const selectColumns = entityTable === 'investors'
            ? 'account_approval_status, onboarding_status'
            : 'account_approval_status'
          const { data: snapshot } = await serviceSupabase
            .from(entityTable)
            .select(selectColumns)
            .eq('id', approval.entity_id)
            .maybeSingle()

          if (snapshot) {
            accountActivationSnapshot = {
              entityTable,
              entityId: approval.entity_id,
              accountApprovalStatus: (snapshot as any).account_approval_status ?? null,
              onboardingStatus: entityTable === 'investors' ? (snapshot as any).onboarding_status ?? null : undefined,
            }
          }
        }
      }

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
        const rollbackTimestamp = new Date().toISOString()

        if (accountActivationSnapshot) {
          const restorePayload: Record<string, unknown> = {
            account_approval_status: accountActivationSnapshot.accountApprovalStatus,
            updated_at: rollbackTimestamp,
          }

          if (accountActivationSnapshot.entityTable === 'investors') {
            restorePayload.onboarding_status = accountActivationSnapshot.onboardingStatus ?? null
          }

          const { error: entityRestoreError } = await serviceSupabase
            .from(accountActivationSnapshot.entityTable)
            .update(restorePayload)
            .eq('id', accountActivationSnapshot.entityId)

          if (entityRestoreError) {
            console.error('[AccountActivation] Failed restoring entity after approval failure', {
              approval_id: id,
              entity_table: accountActivationSnapshot.entityTable,
              entity_id: accountActivationSnapshot.entityId,
              error: entityRestoreError,
            })
          }
        }

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
            updated_at: rollbackTimestamp
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
      await handleEntityRejection(serviceSupabase, approval, rejection_reason || '', user.id)
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
      const approvalLabel = getApprovalEntityLabel(approval.entity_type)
      const notificationMessage = action === 'approve'
        ? `Your ${approvalLabel} request has been approved.`
        : `Your ${approvalLabel} request has been rejected${rejection_reason ? `: ${rejection_reason}` : '.'}`

      await serviceSupabase
        .from('investor_notifications')
        .insert({
          user_id: approval.requested_by,
          title: `${approvalLabel} ${action === 'approve' ? 'approved' : 'rejected'}`,
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

      case 'deal_close': {
        const { data: deal, error: closeDealError } = await supabase
          .from('deals')
          .select('id, name, close_at')
          .eq('id', entityId)
          .single()

        if (closeDealError || !deal) {
          console.error('Error loading deal for close approval:', closeDealError)
          return { success: false, error: 'Failed to load deal for closing' }
        }

        if (!deal.close_at) {
          return { success: false, error: 'Deal has no closing date set' }
        }

        const closingDate = new Date(deal.close_at)
        const closeResult = await handleDealClose(supabase, entityId, closingDate)

        if (!closeResult.success) {
          const message = closeResult.errors.length > 0
            ? closeResult.errors.join('; ')
            : 'Failed to process deal close'
          return { success: false, error: message }
        }

        return {
          success: true,
          notificationData: {
            type: 'deal_close_processed',
            deal_id: entityId,
            deal_name: deal.name
          }
        }
      }

      case 'termsheet_close': {
        // entity_id is the termsheet ID (deal_fee_structures.id)
        // This processes only subscriptions linked to this specific termsheet
        const termsheetCloseResult = await handleTermsheetClose(supabase, entityId)

        if (!termsheetCloseResult.success) {
          const message = termsheetCloseResult.errors.length > 0
            ? termsheetCloseResult.errors.join('; ')
            : 'Failed to process termsheet close'
          return { success: false, error: message }
        }

        return {
          success: true,
          notificationData: {
            type: 'termsheet_close_processed',
            termsheet_id: entityId,
            deal_id: termsheetCloseResult.dealId,
            subscriptions_activated: termsheetCloseResult.subscriptionsActivated,
            certificates_triggered: termsheetCloseResult.certificatesTriggered,
            commissions_created: termsheetCloseResult.commissionsCreated
          }
        }
      }

      case 'deal_interest':
      case 'deal_interest_nda': {
        // Fetch deal interest details for NDA workflow
        const { data: dealInterest, error: dealInterestError } = await supabase
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

        if (dealInterestError || !dealInterest) {
          console.error('Error loading deal interest for NDA workflow:', dealInterestError)
          return { success: false, error: 'Deal interest not found' }
        }

        const previousInterestStatus = dealInterest.status

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

            const missingNdaData: string[] = []
            if (!investorData) missingNdaData.push('investor')
            if (!dealData) missingNdaData.push('deal')
            if (!user) missingNdaData.push('approver')

            if (missingNdaData.length > 0) {
              console.warn('[NDA] Missing core data for NDA workflow:', missingNdaData)
              await supabase
                .from('investor_deal_interest')
                .update({
                  status: previousInterestStatus,
                  updated_at: new Date().toISOString()
                })
                .eq('id', entityId)

              return {
                success: false,
                error: `Missing NDA data: ${missingNdaData.join(', ')}`
              }
            }

            const ceoSigner = await getCeoSigner(supabase)
            if (!ceoSigner) {
              console.warn('[approvals] No CEO signer found, defaulting to approver profile')
            }

            const countersignerName = ceoSigner?.displayName || user.displayName || user.email?.split('@')[0] || 'Authorized Signatory'
            const countersignerTitle = ceoSigner?.title || 'Authorized Signatory'

            const vehicle = dealData.vehicle
            const vehicleName = vehicle?.name || 'Vehicle Name'
            const rawEntityCode = vehicle?.entity_code || ''
            const rawSeriesCode = vehicle?.series_short_title || ''
            const rawSeriesNumber = vehicle?.series_number || ''
            const seriesCode = rawSeriesCode || (rawEntityCode ? rawEntityCode.replace(/\d+/g, '') : '')
            const seriesNumber = rawSeriesNumber || (rawEntityCode ? rawEntityCode.replace(/\D+/g, '') : '')
            const derivedEntityCode = [seriesCode, seriesNumber].filter(Boolean).join('')
            const seriesEntityCode = rawEntityCode || derivedEntityCode || 'VC206'
            const projectSeriesLabel = [seriesCode, seriesNumber].filter(Boolean).join(' ')
            const projectDescription = `VERSO Capital 2 SCSP ${vehicleName}${projectSeriesLabel ? ` Series ${projectSeriesLabel}` : ''}${seriesEntityCode ? ` ("${seriesEntityCode}")` : ''}`
            const investmentName = dealData.name || dealData.description || vehicle?.investment_name || 'Investment Opportunity'

            const requestedByProfile = approval.requested_by_profile
            const isEntityInvestor = investorData.type && investorData.type !== 'individual'
            const partyAName = isEntityInvestor
              ? (investorData.legal_name || investorData.display_name)
              : (requestedByProfile?.display_name || investorData.legal_name || investorData.display_name)

            const residentialStreet = investorData.residential_street?.trim()
            const residentialLine2 = investorData.residential_line_2?.trim()
            const residentialPostal = investorData.residential_postal_code?.trim()
            const residentialAddress = [residentialStreet, residentialLine2, residentialPostal].filter(Boolean).join(', ')

            const partyARegisteredAddress = isEntityInvestor
              ? investorData.registered_address?.trim()
              : (residentialAddress || investorData.registered_address?.trim())

            const partyACity = isEntityInvestor
              ? investorData.city?.trim()
              : (investorData.residential_city?.trim() || investorData.city?.trim())
            const partyACountry = isEntityInvestor
              ? investorData.country?.trim()
              : (investorData.residential_country?.trim() || investorData.country?.trim())
            const partyACityCountry = [partyACity, partyACountry].filter(Boolean).join(' / ')

            const vehicleAddress = vehicle?.address || '2, Avenue Charles de Gaulle – L-1653'
            const vehicleDomicile = vehicle?.domicile || 'Luxembourg, LU'

            let managingPartnerName = countersignerName
            let managingPartnerTitle = countersignerTitle
            if (vehicle?.managing_partner_id) {
              const { data: managingPartner, error: managingPartnerError } = await supabase
                .from('profiles')
                .select('display_name, title')
                .eq('id', vehicle.managing_partner_id)
                .single()

              if (managingPartnerError) {
                console.warn('[approvals] Failed to load managing partner profile:', managingPartnerError.message)
              }

              if (managingPartner?.display_name) {
                managingPartnerName = managingPartner.display_name
              }
              if (managingPartner?.title) {
                managingPartnerTitle = managingPartner.title
              }
            }

            const now = new Date()
            const executionDate = `${String(now.getDate()).padStart(2, '0')} / ${String(now.getMonth() + 1).padStart(2, '0')} / ${now.getFullYear()}`

            // ========================================================
            // MULTI-SIGNATORY NDA SUPPORT
            // For entity investors: generate 1 NDA per authorized signatory
            // For individual investors: generate 1 NDA for the investor
            // ========================================================

            // Determine if this is an entity investor (has type and is not 'individual')
            console.log('👥 [NDA] Investor type detection:', {
              type: investorData.type,
              isEntity: isEntityInvestor
            })

            // Build list of signatories
            interface NdaSignatory {
              member_id: string | null
              full_name: string
              email: string
              title: string | null
            }

            let signatories: NdaSignatory[] = []

            if (isEntityInvestor) {
              // Load authorized signatories for entity investors
              const { data: members, error: membersError } = await supabase
                .from('investor_members')
                .select('id, full_name, email, role_title')
                .eq('investor_id', investorData.id)
                .eq('is_signatory', true)
                .eq('is_active', true)

              if (membersError) {
                console.warn('[NDA] Failed to load investor members:', membersError.message)
              }

              if (members && members.length > 0) {
                signatories = members.map((m: { id: string; full_name: string | null; email: string | null; role_title: string | null }) => ({
                  member_id: m.id,
                  full_name: m.full_name || '',
                  email: m.email || '',
                  title: m.role_title || null
                }))
                console.log(`👥 [NDA] Found ${signatories.length} authorized signatories for entity`)
              } else {
                // Fallback: use requestor if no signatories marked
                console.warn('[NDA] No signatories marked for entity, using requestor fallback')
                const fallbackName = requestedByProfile?.display_name || investorData.representative_name || investorData.legal_name || 'Authorized Representative'
                const fallbackEmail = requestedByProfile?.email || investorData.email || ''
                signatories = [{
                  member_id: null,
                  full_name: fallbackName,
                  email: fallbackEmail,
                  title: investorData.representative_title || 'Authorized Representative'
                }]
              }
            } else {
              // Individual investor - single signatory
              const fallbackName = requestedByProfile?.display_name || investorData.legal_name || investorData.display_name || 'Investor'
              const fallbackEmail = requestedByProfile?.email || investorData.email || ''
              signatories = [{
                member_id: null,
                full_name: fallbackName,
                email: fallbackEmail,
                title: null
              }]
              console.log('👤 [NDA] Individual investor - single signatory')
            }

            const missingFields: string[] = []

            if (!partyAName) missingFields.push('Party A name')
            if (!partyARegisteredAddress) missingFields.push('Party A registered address')
            if (!partyACityCountry) missingFields.push('Party A city/country')
            if (signatories.length === 0) missingFields.push('At least one signatory')

            signatories.forEach((signatory, index) => {
              if (!signatory.full_name) missingFields.push(`Signatory ${index + 1} name`)
              if (!signatory.email) missingFields.push(`Signatory ${index + 1} email`)
            })

            if (missingFields.length > 0) {
              console.error('[NDA] Missing required data:', missingFields)
              await supabase
                .from('investor_deal_interest')
                .update({
                  status: previousInterestStatus,
                  updated_at: new Date().toISOString()
                })
                .eq('id', entityId)

              return {
                success: false,
                error: `Missing NDA data: ${missingFields.join(', ')}`
              }
            }

            console.log(`🔔 [NDA] Processing ${signatories.length} NDA(s) for: ${investorData.legal_name}`)

            // Loop through each signatory and generate their NDA
            for (const signatory of signatories) {
              console.log(`📄 [NDA] Generating NDA for signatory: ${signatory.full_name} (${signatory.email})`)

              // Prepare NDA payload with signatory-specific fields
              const ndaPayload = {
                series_number: seriesNumber || seriesEntityCode,
                project_description: projectDescription,
                investment_description: investmentName,
                series_entity_code: seriesEntityCode,
                vehicle_name: vehicleName,
                series_code: seriesCode,
                series_numeric: seriesNumber,
                investment_name: investmentName,
                vehicle_managing_partner_name: managingPartnerName,
                vehicle_managing_partner_title: managingPartnerTitle,

                // Party A (Investor) - uses signatory-specific data
                party_a_name: partyAName,
                party_a_registered_address: partyARegisteredAddress,
                party_a_city_country: partyACityCountry,
                party_a_representative_name: signatory.full_name,
                party_a_representative_title: signatory.title || (isEntityInvestor ? 'Authorized Representative' : ''),
                is_entity_investor: isEntityInvestor,

                // Party B (VERSO) - use vehicle name directly (it's the legal entity name)
                party_b_name: vehicleName,
                party_b_registered_address: vehicleAddress,
                party_b_city_country: vehicleDomicile,
                party_b_representative_name: managingPartnerName,
                party_b_representative_title: managingPartnerTitle,

                // Execution details - uses signatory's email for data room
                dataroom_email: signatory.email,
                execution_date: executionDate,
                zoho_sign_document_id: '' // Auto-generated by n8n
              }

              // Trigger NDA workflow for this signatory
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
                console.error(`❌ [NDA] Failed to trigger NDA workflow for ${signatory.full_name}:`, result.error)
                continue // Try next signatory
              }

              console.log(`✅ [NDA] Workflow triggered for ${signatory.full_name}:`, {
                workflow_run_id: result.workflow_run_id
              })

              // Create signature requests if n8n returned Google Drive file
              if (result.n8n_response && result.workflow_run_id) {
                const googleDriveFile = Array.isArray(result.n8n_response)
                  ? result.n8n_response[0]
                  : result.n8n_response

                try {
                  // Create investor signature request (PARTY A) with member_id
                  const investorSigPayload = {
                    workflow_run_id: result.workflow_run_id,
                    investor_id: investorData.id,
                    member_id: signatory.member_id || undefined, // Track specific signatory
                    deal_id: dealInterest.deal_id,
                    signer_email: signatory.email,
                    signer_name: signatory.full_name,
                    document_type: 'nda' as const,
                    google_drive_file_id: googleDriveFile.id,
                    google_drive_url: googleDriveFile.webContentLink || googleDriveFile.webViewLink,
                    signer_role: 'investor' as const,
                    signature_position: 'party_a' as const
                  }

                  console.log('🔍 [NDA] Investor signature request:', {
                    signatory: signatory.full_name,
                    member_id: signatory.member_id
                  })

                  const investorSigResult = await createSignatureRequest(investorSigPayload, supabase)

                  if (investorSigResult.success) {
                    console.log(`📧 [NDA] Investor signature request created for ${signatory.full_name}`)
                  } else {
                    console.error(`Failed to create investor signature request for ${signatory.full_name}:`, investorSigResult.error)
                  }

                  // Create admin signature request (PARTY B) for this NDA document
                  const adminSigPayload = {
                    workflow_run_id: result.workflow_run_id,
                    investor_id: investorData.id,
                    deal_id: dealInterest.deal_id,
                    signer_email: ceoSigner?.email || user.email,
                    signer_name: countersignerName,
                    document_type: 'nda' as const,
                    google_drive_file_id: googleDriveFile.id,
                    google_drive_url: googleDriveFile.webContentLink || googleDriveFile.webViewLink,
                    signer_role: 'admin' as const,
                    signature_position: 'party_b' as const
                  }

                  const adminSigResult = await createSignatureRequest(adminSigPayload, supabase)

                  if (adminSigResult.success) {
                    console.log(`📧 [NDA] Admin signature request created for ${signatory.full_name}'s NDA`)
                  } else {
                    console.error(`Failed to create admin signature request:`, adminSigResult.error)
                  }
                } catch (sigError) {
                  console.error(`Error creating signature requests for ${signatory.full_name}:`, sigError)
                  // Continue to next signatory
                }
              } else {
                console.warn(`⚠️ [NDA] No workflow_run_id or n8n_response for ${signatory.full_name}`)
              }
            }

            console.log(`✅ [NDA] Completed processing ${signatories.length} NDA(s) for ${investorData.legal_name}`)
          } catch (ndaError) {
            console.error('❌ Error triggering NDA workflow:', ndaError)
            // Don't fail the approval if NDA trigger fails
          }
        } else {
          console.log('⚠️ No deal interest found for entityId:', entityId)
        }
        break
      }

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
              company_name,
              company_logo_url,
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

	          // Fetch deal's default fee plan to auto-link
	          const { data: defaultFeePlan } = await supabase
	            .from('fee_plans')
	            .select('id')
	            .eq('deal_id', submission.deal_id)
	            .eq('is_default', true)
	            .eq('is_active', true)
	            .single()

	          // Fetch fee structure before insert/update to keep subscription fields in sync
	          const { data: feeStructureForSub } = await supabase
	            .from('deal_fee_structures')
	            .select('subscription_fee_percent, management_fee_percent, carried_interest_percent, price_per_share_text, price_per_share, cost_per_share, payment_deadline_days')
	            .eq('deal_id', submission.deal_id)
	            .eq('status', 'published')
	            .order('created_at', { ascending: false })
	            .limit(1)
	            .single()

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

	          // Calculate price_per_share: use numeric field from fee structure, fallback to text parsing, then valuation
	          let pricePerShare: number | null = null
	          if (feeStructureForSub?.price_per_share != null && feeStructureForSub.price_per_share > 0) {
	            pricePerShare = feeStructureForSub.price_per_share
	          } else if (feeStructureForSub?.price_per_share_text) {
	            const parsed = parseFloat(feeStructureForSub.price_per_share_text.replace(/[^\d.]/g, ''))
	            if (!isNaN(parsed) && parsed > 0) {
	              pricePerShare = parsed
	            }
	          }
	          if (pricePerShare === null && latestValuation?.nav_per_unit) {
	            pricePerShare = latestValuation.nav_per_unit
	          }

	          const costPerShare: number | null = feeStructureForSub?.cost_per_share ?? null
	          const numShares = pricePerShare ? Math.floor(amount / pricePerShare) : null
	          const spreadPerShare = (pricePerShare !== null && costPerShare !== null && pricePerShare > 0 && costPerShare >= 0)
	            ? pricePerShare - costPerShare
	            : null
	          const spreadFeeAmount = (spreadPerShare !== null && numShares !== null && numShares > 0)
	            ? spreadPerShare * numShares
	            : null

	          // Normalize percent: if > 1, it's whole number format (2 = 2%), convert to decimal
	          const feePercent = feeStructureForSub?.subscription_fee_percent || 0
	          const normalizedPercent = feePercent > 1 ? feePercent / 100 : feePercent
	          const subscriptionFeeAmount = normalizedPercent > 0
	            ? amount * normalizedPercent
	            : null

	          const fundingDueAt = feeStructureForSub?.payment_deadline_days
	            ? new Date(Date.now() + feeStructureForSub.payment_deadline_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
	            : null

	          const subscriptionCurrency =
	            submission.deal.currency ||
	            submission.payload_json?.currency ||
	            submission.deal.vehicle?.currency ||
	            'USD'

	          const subscriptionPatch = {
	            fee_plan_id: defaultFeePlan?.id || null,
	            commitment: amount,
	            currency: subscriptionCurrency,
	            effective_date: submission.effective_date || new Date().toISOString(),
	            acknowledgement_notes: `Approved from submission ${submission.id}. Awaiting subscription pack signature.`,
	            // Copy fee fields from deal_fee_structures for fee event calculation
	            subscription_fee_percent: feeStructureForSub?.subscription_fee_percent ?? null,
	            management_fee_percent: feeStructureForSub?.management_fee_percent ?? null,
	            performance_fee_tier1_percent: feeStructureForSub?.carried_interest_percent ?? null,
	            opportunity_name: submission.deal.vehicle?.investment_name || submission.deal.name,
	            price_per_share: pricePerShare,
	            cost_per_share: costPerShare,
	            spread_per_share: spreadPerShare,
	            spread_fee_amount: spreadFeeAmount,
	            num_shares: numShares,
	            subscription_fee_amount: subscriptionFeeAmount,
	            management_fee_frequency: managementFeeFrequency,
	            performance_fee_tier1_threshold: performanceFeeThreshold,
	            funding_due_at: fundingDueAt,
	            introducer_id: introduction?.introducer_id || null,
	            introduction_id: introduction?.id || null,
	          }

	          if (!existingSub) {
	            const { data: newSubscription, error: createSubError } = await supabase
	              .from('subscriptions')
	              .insert({
	                investor_id: submission.investor_id,
	                vehicle_id: submission.deal.vehicle_id,
	                deal_id: submission.deal_id,
	                status: 'pending',
	                subscription_date: new Date().toISOString(),
	                ...subscriptionPatch,
	              })
	              .select()
	              .single()

	            if (createSubError || !newSubscription) {
	              console.error('Error creating subscription:', createSubError)
	              return { success: false, error: 'Failed to create subscription' }
	            }

	            subscriptionId = newSubscription.id
	          } else {
	            const { data: updatedSubscription, error: updateSubError } = await supabase
	              .from('subscriptions')
	              .update({
	                status: 'pending',
	                ...subscriptionPatch,
	              })
	              .eq('id', existingSub.id)
	              .select('id')
	              .single()

	            if (updateSubError || !updatedSubscription) {
	              console.error('Error refreshing existing subscription:', updateSubError)
	              return { success: false, error: 'Failed to update existing subscription' }
	            }

	            subscriptionId = updatedSubscription.id
	          }

	          // Link subscription back to submission for easy lookup
	          await supabase
	            .from('deal_subscription_submissions')
	            .update({ formal_subscription_id: subscriptionId })
	            .eq('id', submission.id)

            // AUTO-TRIGGER SUBSCRIPTION PACK WORKFLOW
            try {
              // Fetch all required data for subscription pack
              const { data: investorData } = await supabase
                .from('investors')
                .select('legal_name, display_name, type, registered_address, entity_identifier, id_number, id_type, residential_street, residential_line_2, residential_city, residential_state, residential_postal_code, residential_country')
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

              // Build signatories array for multi-signatory subscription packs
              // Each signatory includes a 'number' field for template display (1, 2, 3...)
              let signatories: { name: string; title: string; number: number }[] = []
              // Check BOTH: submission type OR investor's actual type (entity/institutional)
              const isEntityInvestor = submission.subscription_type === 'entity' ||
                                       investorData?.type === 'entity' ||
                                       investorData?.type === 'institutional'
              if (isEntityInvestor && submission.investor_id) {
                // For entity investors: get authorized signatories from investor_members
                const { data: members } = await supabase
                  .from('investor_members')
                  .select('id, full_name, email, role_title')
                  .eq('investor_id', submission.investor_id)
                  .eq('is_signatory', true)
                  .eq('is_active', true)

                if (members && members.length > 0) {
                  signatories = members.map((m: { full_name: string | null; role_title: string | null }, index: number) => ({
                    name: m.full_name || '',
                    title: m.role_title || 'Authorized Signatory',
                    number: index + 1
                  }))
                  console.log(`👥 [SUBSCRIPTION PACK] Found ${signatories.length} authorized signatories for entity`)
                } else {
                  // Fallback: use entity representative if no signatories marked
                  signatories = [{
                    name: counterpartyEntity?.representative_name || investorData?.legal_name || '',
                    title: counterpartyEntity?.representative_title || 'Authorized Representative',
                    number: 1
                  }]
                  console.warn('[SUBSCRIPTION PACK] No signatories marked, using representative fallback')
                }
              } else {
                // For individual investors: single signatory
                signatories = [{
                  name: investorData?.legal_name || '',
                  title: 'Investor',
                  number: 1
                }]
              }

              // Generate pre-rendered HTML for signatories (n8n doesn't support Handlebars {{#each}})
              // ANCHOR ID CONVENTION: First subscriber is 'party_a', subsequent are 'party_a_2', 'party_a_3', etc.
              const getAnchorId = (number: number, suffix?: string): string => {
                const base = number === 1 ? 'party_a' : `party_a_${number}`
                return suffix ? `${base}_${suffix}` : base
              }

              // ANCHOR CSS: Invisible anchors placed ON the signature line
              //
              // APPROACH:
              // - Keep anchors in the PDF text layer (for PDF.js extraction)
              // - Position anchors at the signature line using absolute positioning
              // - Use tiny white text so anchors remain invisible
              //
              // IMPORTANT: Anchors are now used for PAGE + Y placement (anchor-based Y).
              // Avoid off-page positioning so anchor Y is accurate.
              const ANCHOR_CSS = 'position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;'

              // Page 2 - Subscription Form: Subscriber signatures with anchors (right column)
              // Parent div needs position:relative for anchor's position:absolute to work
              const signatoriesFormHtml = signatories.map(s => `
            <div class="signature-block-inline" style="position:relative;margin-bottom: 0.5cm;">
                <div class="signature-line" style="position:relative;"><span style="${ANCHOR_CSS}">SIG_ANCHOR:${getAnchorId(s.number, 'form')}</span></div>
                Name: ${s.name}<br>
                Title: ${s.title}
            </div>`).join('')

              // Page 12 - Main Agreement: Subscriber signatures with anchors
              // Increased spacing: min-height 4cm, margin-top 3cm for ~85pt signature space
              // Parent div needs position:relative for anchor's position:absolute to work
              const signatoriesSignatureHtml = signatories.map(s => `
<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">
    <p><strong>The Subscriber</strong>, represented by Authorized Signatory ${s.number}</p>
    <div class="signature-line main-line" style="margin-top: 3cm; position:relative;"><span style="${ANCHOR_CSS}">SIG_ANCHOR:${getAnchorId(s.number)}</span></div>
    <p style="margin-top: 0.3cm;">Name: ${s.name}<br>
    Title: ${s.title}</p>
</div>`).join('')

              // Legacy: Keep signatoriesTableHtml for backwards compatibility (no anchors)
              const signatoriesTableHtml = signatories.map(s => `
            <div style="margin-bottom: 0.5cm;">
                <div class="signature-line"></div>
                Name: ${s.name}<br>
                Title: ${s.title}
            </div>`).join('')

              // NOTE: issuer and arranger signature HTML with anchors are generated after feeStructure is fetched

              const { data: vehicleData } = await supabase
                .from('vehicles')
                .select('series_number, name, series_short_title, investment_name, issuer_gp_name, issuer_gp_rcc_number, issuer_rcc_number, issuer_website')
                .eq('id', submission.deal.vehicle_id)
                .single()

              // NOTE: Use order().limit(1) instead of .maybeSingle() because deals can have multiple published fee structures
              const { data: feeStructure } = await supabase
                .from('deal_fee_structures')
                .select('*')
                .eq('deal_id', submission.deal_id)
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

              if (investorData && vehicleData && feeStructure && user) {
                // Get CEO signer dynamically (instead of hardcoded fallback)
                const ceoSigner = await getCeoSigner(supabase)
                const issuerName = ceoSigner?.displayName || feeStructure.issuer_signatory_name || ''
                const issuerTitle = ceoSigner?.title || feeStructure.issuer_signatory_title || 'Authorized Signatory'

                // Pre-rendered HTML for issuer (party_b) and arranger (party_c) signature blocks
                // These include SIG_ANCHOR markers for signature positioning
                // Page 12 - Main Agreement: Issuer signature with anchor
                // Increased spacing: min-height 4cm, margin-top 3cm for ~85pt signature space
                // Parent div needs position:relative for anchor's position:absolute to work
                const issuerSignatureHtml = `
<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">
    <p><strong>The Issuer, VERSO Capital 2 SCSP</strong>, duly represented by its general partner <strong>VERSO Capital 2 GP SARL</strong></p>
    <div class="signature-line main-line" style="margin-top: 3cm; position:relative;"><span style="${ANCHOR_CSS}">SIG_ANCHOR:party_b</span></div>
    <p style="margin-top: 0.3cm;">Name: ${issuerName}<br>
    Title: ${issuerTitle}</p>
</div>`

                // Page 12 - Main Agreement: Arranger signature with anchor
                // Increased spacing: min-height 4cm, margin-top 3cm for ~85pt signature space
                // Parent div needs position:relative for anchor's position:absolute to work
                const arrangerSignatureHtml = `
<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">
    <p><strong>The Attorney, Verso Management Ltd.</strong>, for the purpose of the powers granted under Clause 6</p>
    <div class="signature-line main-line" style="margin-top: 3cm; position:relative;"><span style="${ANCHOR_CSS}">SIG_ANCHOR:party_c</span></div>
    <p style="margin-top: 0.3cm;">Name: ${feeStructure.arranger_person_name || 'Julien Machot'}<br>
    Title: ${feeStructure.arranger_person_title || 'Director'}</p>
</div>`

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
                const { data: formalSubscription, error: formalSubscriptionError } = await supabase
                  .from('subscriptions')
                  .select('id, commitment, currency, price_per_share, num_shares, subscription_fee_percent, subscription_fee_amount')
                  .eq('id', subscriptionId)
                  .single()

                if (formalSubscriptionError || !formalSubscription) {
                  console.error('❌ Failed to load formal subscription for payload build:', formalSubscriptionError)
                  throw new Error('Formal subscription data is missing after approval.')
                }

                const built = buildSubscriptionPackPayload({
                  outputFormat: 'pdf',
                  subscription: formalSubscription,
                  investor: investorData,
                  deal: submission.deal,
                  vehicle: vehicleData,
                  feeStructure,
                  counterpartyEntity,
                  signatories,
                  issuerName,
                  issuerTitle,
                  arrangerName: feeStructure.arranger_person_name || 'Julien Machot',
                  arrangerTitle: feeStructure.arranger_person_title || 'Director',
                  signatoriesTableHtml,
                  signatoriesFormHtml,
                  signatoriesSignatureHtml,
                  issuerSignatureHtml,
                  arrangerSignatureHtml
                })

                const subscriptionPayload = built.payload

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

                      if (n8nResponse.binary) {
                        // Binary buffer format (preferred - from triggerWorkflow binary handling)
                        fileBuffer = Buffer.from(n8nResponse.binary)
                        mimeType = n8nResponse.mimeType || 'application/pdf'
                        const baseName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, submittedAt)
                        fileName = n8nResponse.filename || (baseName + getFileExtension(mimeType))
                        console.log('✅ Received binary data, buffer size:', fileBuffer.length, 'mimeType:', mimeType)
                      } else if (n8nResponse.raw && typeof n8nResponse.raw === 'string' && n8nResponse.raw.length > 0) {
                        // Binary wrapped in { raw: "..." } format (from triggerWorkflow text handling)
                        // Use 'latin1' encoding to preserve binary data (1-to-1 byte mapping)
                        fileBuffer = Buffer.from(n8nResponse.raw, 'latin1')
                        // Detect PDF from file signature
                        const sig = fileBuffer.slice(0, 4).toString('hex')
                        mimeType = sig === '25504446' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        const baseName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, submittedAt)
                        fileName = baseName + getFileExtension(mimeType)
                        console.log('✅ Received binary data in raw format, buffer size:', fileBuffer.length, 'detected mimeType:', mimeType)
                      } else if (n8nResponse.data) {
                        // Base64 string format
                        fileBuffer = Buffer.from(n8nResponse.data, 'base64')
                        mimeType = n8nResponse.mimeType || 'application/pdf'
                        const baseName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, submittedAt)
                        fileName = n8nResponse.filename || (baseName + getFileExtension(mimeType))
                      } else if (typeof n8nResponse === 'string' && n8nResponse.length > 0) {
                        // Direct string format (n8n returns binary as string)
                        fileBuffer = Buffer.from(n8nResponse, 'latin1')
                        // Detect PDF from file signature
                        const sig = fileBuffer.slice(0, 4).toString('hex')
                        mimeType = sig === '25504446' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        const baseName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, submittedAt)
                        fileName = baseName + getFileExtension(mimeType)
                        console.log('✅ Received binary data as string, buffer size:', fileBuffer.length, 'detected mimeType:', mimeType)
                      } else {
                        throw new Error('No binary data in n8n response')
                      }

                      // Verify file signature matches expected type
                      const signature = fileBuffer.slice(0, 4).toString('hex')
                      console.log('📄 Document file signature:', signature, '| Expected:', fileName.endsWith('.pdf') ? '25504446 (PDF)' : '504b0304 (DOCX)')

                      const isPdf = signature === '25504446' // %PDF
                      const isDocx = signature === '504b0304' // PK (ZIP)

                      if (fileName.endsWith('.pdf') && !isPdf) {
                        console.warn('⚠️ Warning: PDF file signature mismatch. Expected: 25504446, Got:', signature)
                      } else if (fileName.endsWith('.docx') && !isDocx) {
                        console.warn('⚠️ Warning: DOCX file signature mismatch. Expected: 504b0304, Got:', signature)
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
                        // Store countersigner info so we don't have to ask again at signing time
                        const countersignerName = issuerName
                        const countersignerTitle = issuerTitle

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
                            created_by: user.id,
                            // Countersigner info - stored at generation time, read at signing time
                            countersigner_type: 'ceo',
                            countersigner_name: countersignerName,
                            countersigner_title: countersignerTitle
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

                          // Update workflow_run with status completed and document reference
                          await supabase
                            .from('workflow_runs')
                            .update({
                              status: 'completed',
                              completed_at: new Date().toISOString(),
                              result_doc_id: docRecord.id,
                              output_data: {
                                ...result.n8n_response,
                                document_id: docRecord.id,
                                file_key: fileKey
                              }
                            })
                            .eq('id', result.workflow_run_id)

                          // Notify all CEO users that subscription pack is ready for signature
                          try {
                            const { data: ceoUsers } = await supabase
                              .from('ceo_users')
                              .select('user_id')

                            if (ceoUsers && ceoUsers.length > 0) {
                              const formattedAmount = new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: submission.deal.currency || 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }).format(amount)

                              const notifications = ceoUsers.map((ceoUser: { user_id: string }) => ({
                                user_id: ceoUser.user_id,
                                investor_id: null,
                                title: 'Subscription Pack Ready',
                                message: `${investorName} - ${submission.deal.name} (${formattedAmount}) - Ready to send for signature`,
                                link: `/versotech_main/subscriptions/${subscriptionId}`,
                                type: 'subscription_pack_ready',
                                deal_id: submission.deal_id,
                                created_by: user.id
                              }))

                              await supabase.from('investor_notifications').insert(notifications)
                              console.log(`📧 Notified ${ceoUsers.length} CEO user(s) about subscription pack ready`)
                            }
                          } catch (notifyError) {
                            // Don't fail the approval if notification fails
                            console.error('Failed to notify CEO users:', notifyError)
                          }
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

      case 'commission_invoice': {
        const commissionType = metadata.commission_type
        const commissionConfig: Record<string, { table: string }> = {
          introducer: { table: 'introducer_commissions' },
          partner: { table: 'partner_commissions' },
          'commercial-partner': { table: 'commercial_partner_commissions' },
          commercial_partner: { table: 'commercial_partner_commissions' },
        }

        const config = commissionConfig[commissionType]
        if (!config) {
          return { success: false, error: `Unsupported commission type: ${commissionType}` }
        }

        const { data: commission, error: commissionError } = await supabase
          .from(config.table)
          .select('id, status')
          .eq('id', entityId)
          .single()

        if (commissionError || !commission) {
          return { success: false, error: 'Commission not found' }
        }

        if (commission.status !== 'invoice_submitted') {
          return { success: false, error: `Commission status must be invoice_submitted (current: ${commission.status})` }
        }

        const { error: updateError } = await supabase
          .from(config.table)
          .update({
            status: 'invoiced',
            approved_by: actorId,
            approved_at: new Date().toISOString(),
            rejection_reason: null,
            rejected_by: null,
            rejected_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', entityId)

        if (updateError) {
          console.error('Error approving commission invoice:', updateError)
          return { success: false, error: 'Failed to approve commission invoice' }
        }
        break
      }

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
        const sentAt = new Date().toISOString()

        const { error: inviteUpdateError } = await supabase
          .from('member_invitations')
          .update({
            status: 'pending',
            expires_at: newExpiresAt,
            sent_at: sentAt,
            reminder_count: 0,
            last_reminded_at: null
          })
          .eq('id', invitationId)

        if (inviteUpdateError) {
          console.error('Error updating invitation status:', inviteUpdateError)
          return { success: false, error: 'Failed to update invitation status' }
        }

        // Send the invitation email
        const acceptUrl = `${getAppUrl()}/invitation/accept?token=${invitation.invitation_token}`

        console.log('[member_invitation] Sending invitation email:', {
          email: invitation.email,
          entityName: invitation.entity_name,
          acceptUrl: acceptUrl
        })

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
          console.error('[member_invitation] Failed to send invitation email:', emailResult.error)
          // Log more details for debugging
          console.error('[member_invitation] Email details:', {
            to: invitation.email,
            acceptUrl,
            entityType: invitation.entity_type
          })
          // Don't fail - invitation is approved, email can be resent
        } else {
          console.log('[member_invitation] Email sent successfully:', emailResult.messageId)
        }

        // Notify the inviter that their invitation was approved
        if (invitation.invited_by) {
          await supabase.from('investor_notifications').insert({
            user_id: invitation.invited_by,
            title: 'Member Invitation Approved',
            message: `Your invitation to ${invitation.email} has been approved and sent.`,
            type: 'member_invitation_approved',
            data: {
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

      case 'account_activation': {
        // Account activation approval - updates the entity's account_approval_status
        // The entity_table comes from metadata to support all 6 entity types
        const entityTable = resolveAccountActivationEntityTable(metadata)
        if (!entityTable) {
          console.error('[AccountActivation] Missing or invalid entity_table metadata', {
            approval_id: approval.id,
            entity_id: entityId,
            metadata,
          })
          return { success: false, error: 'Account activation metadata is missing entity target' }
        }

        const activationUpdateData: Record<string, unknown> = {
          account_approval_status: 'approved',
          updated_at: new Date().toISOString(),
        }
        if (entityTable === 'investors') {
          activationUpdateData.onboarding_status = 'completed'
        }

        const { error: activationError } = await supabase
          .from(entityTable)
          .update(activationUpdateData)
          .eq('id', entityId)

        if (activationError) {
          console.error('[AccountActivation] Failed to approve:', activationError)
          return { success: false, error: 'Failed to activate account' }
        }

        console.log(`[AccountActivation] Account approved: ${entityTable}.${entityId}`)

        return {
          success: true,
          notificationData: {
            type: 'account_activated',
            entity_id: entityId,
            entity_table: entityTable
          }
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
  reason: string,
  actorId: string
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

    if (entityType === 'deal_close') {
      // No side effects on rejection; deal remains open until re-approved.
      return
    }

    if (entityType === 'termsheet_close') {
      // No side effects on rejection; termsheet remains unprocessed until re-approved.
      // A new approval can be created by the cron job or manually.
      return
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

    if (entityType === 'commission_invoice') {
      const metadata = approval.entity_metadata || {}
      const commissionType = metadata.commission_type
      const commissionConfig: Record<string, { table: string; userTable: string; entityIdField: string; notificationType: string }> = {
        introducer: {
          table: 'introducer_commissions',
          userTable: 'introducer_users',
          entityIdField: 'introducer_id',
          notificationType: 'introducer_invoice_rejected',
        },
        partner: {
          table: 'partner_commissions',
          userTable: 'partner_users',
          entityIdField: 'partner_id',
          notificationType: 'partner_rejected',
        },
        'commercial-partner': {
          table: 'commercial_partner_commissions',
          userTable: 'commercial_partner_users',
          entityIdField: 'commercial_partner_id',
          notificationType: 'cp_invoice_rejected',
        },
        commercial_partner: {
          table: 'commercial_partner_commissions',
          userTable: 'commercial_partner_users',
          entityIdField: 'commercial_partner_id',
          notificationType: 'cp_invoice_rejected',
        },
      }

      const config = commissionConfig[commissionType]
      if (!config) {
        console.error('Unsupported commission type in rejection:', commissionType)
        return
      }

      // Update commission status to rejected
      await supabase
        .from(config.table)
        .update({
          status: 'rejected',
          rejection_reason: reason || null,
          rejected_by: actorId,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', entityId)

      // Send rejection notification to entity users
      // Fetch commission to get entity_id for user lookup
      const { data: commission } = await supabase
        .from(config.table)
        .select('*')
        .eq('id', entityId)
        .single()

      if (commission) {
        const commissionEntityId = commission[config.entityIdField]
        const { data: entityUsers } = await supabase
          .from(config.userTable)
          .select('user_id')
          .eq(config.entityIdField, commissionEntityId)

        if (entityUsers && entityUsers.length > 0) {
          const formattedAmount = metadata.amount && metadata.currency
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: metadata.currency,
              }).format(metadata.amount)
            : 'your commission'

          const notifications = entityUsers.map((eu: { user_id: string }) => ({
            user_id: eu.user_id,
            investor_id: null,
            title: 'Invoice Requires Changes',
            message: `Your invoice for ${formattedAmount} was rejected.${reason ? ` Reason: ${reason}` : ''} Please resubmit with corrections.`,
            link: '/versotech_main/my-commissions',
            type: config.notificationType,
          }))

          await supabase.from('investor_notifications').insert(notifications)
          console.log('[rejection] Sent', notifications.length, 'rejection notifications for', commissionType)
        }
      }
    }

    if (entityType === 'account_activation') {
      // Account activation rejection - updates the entity's account_approval_status to rejected
      const metadata = approval.entity_metadata || {}
      const entityTable = resolveAccountActivationEntityTable(metadata)

      if (entityTable) {
        await supabase
          .from(entityTable)
          .update({
            account_approval_status: 'rejected',
            account_rejection_reason: reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', entityId)

        console.log(`[AccountActivation] Account rejected: ${entityTable}.${entityId}`)
      } else {
        console.error('[AccountActivation] Missing or invalid entity_table metadata on rejection', {
          approval_id: approval.id,
          entity_id: entityId,
          metadata,
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
