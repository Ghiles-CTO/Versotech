/**
 * Main signature system client
 *
 * This module provides the core business logic for signature request management.
 * All API routes should use these functions instead of implementing logic directly.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  generateSignatureToken,
  calculateTokenExpiry,
  isTokenExpired,
  generateSigningUrl,
  getAppUrl
} from './token'
import { SignatureStorageManager, downloadPDFFromUrl } from './storage'
import { embedSignatureInPDF, embedSignatureMultipleLocations } from './pdf-processor'
import { routeSignatureHandler } from './handlers'
import { detectAnchors, getPlacementsFromAnchors } from './anchor-detector'
import { calculateSubscriptionFeeEvents, createFeeEvents } from '../fees/subscription-fee-calculator'
import { createServiceClient } from '@/lib/supabase/server'
import type { SignaturePlacementRecord } from './types'
import {
  inspectSubscriptionSignatureWorkflowConfig,
  maybeReleaseDeferredInvestorRequests,
  shouldDelayFinalSignatureCompletion,
} from './staged-release'
import { canSignIntroducerAgreement } from './introducer-agreement-flow'
import { sendSignatureRequestEmail } from '@/lib/email/resend-service'
import { formatViewerDate } from '@/lib/format'
import type {
  CreateSignatureRequestParams,
  CreateSignatureRequestResult,
  SignatureRequestPublicView,
  SubmitSignatureParams,
  SubmitSignatureResult,
  SignatureRequestRecord
} from './types'

function normalizeCreateSignatureRequestError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || 'Unknown error')
  const lower = message.toLowerCase()

  if (
    lower.includes('sig_anchor') ||
    lower.includes('signature anchor') ||
    lower.includes('anchor_not_found') ||
    lower.includes('missing_anchors') ||
    lower.includes('pdf has no signature anchor markers') ||
    lower.includes('no signature anchors found')
  ) {
    return `Signature anchor detection failed: ${message}`
  }

  if (
    lower.includes('dommatrix') ||
    lower.includes('cannot polyfill') ||
    lower.includes('@napi-rs/canvas') ||
    lower.includes('pdf parsing error')
  ) {
    return `PDF parsing failed while preparing signature request: ${message}`
  }

  return message
}

function buildDuplicateInsertErrorMessage(params: CreateSignatureRequestParams): string {
  if (params.document_id) {
    return `A signature request already exists for ${params.signer_role} at position ${params.signature_position} on this document`
  }

  if (params.workflow_run_id) {
    return `A signature request already exists for ${params.signer_role} at position ${params.signature_position} on this workflow`
  }

  return 'A duplicate signature request already exists'
}

function normalizeSignatureRequestInsertError(
  error: unknown,
  params: CreateSignatureRequestParams
): string {
  const candidate = error as { code?: string; message?: string; details?: string; hint?: string } | null
  const combined = [
    candidate?.message,
    candidate?.details,
    candidate?.hint,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (
    candidate?.code === '23505' ||
    combined.includes('duplicate key') ||
    combined.includes('already exists') ||
    combined.includes('signature_requests_document_signer') ||
    combined.includes('signature_requests_workflow_signer')
  ) {
    return buildDuplicateInsertErrorMessage(params)
  }

  return normalizeCreateSignatureRequestError(error)
}

/**
 * Create a new signature request
 *
 * This function:
 * 1. Generates a secure signing token
 * 2. Downloads PDF from Google Drive if provided
 * 3. Uploads unsigned PDF to storage
 * 4. Creates signature_requests database record
 * 5. Returns signing URL for the signer
 */
export async function createSignatureRequest(
  params: CreateSignatureRequestParams,
  supabase: SupabaseClient
): Promise<CreateSignatureRequestResult> {
  console.log('\n🔵 [SIGNATURE] createSignatureRequest() called')
  console.log('📋 [SIGNATURE] Params:', {
    workflow_run_id: params.workflow_run_id,
    investor_id: params.investor_id,
    signer_email: params.signer_email,
    signer_name: params.signer_name,
    document_type: params.document_type,
    signer_role: params.signer_role,
    signature_position: params.signature_position,
    has_google_drive_url: !!params.google_drive_url
  })

  try {
    const {
      workflow_run_id,
      investor_id,
      signer_email,
      signer_name,
      document_type,
      google_drive_file_id,
      google_drive_url,
      signer_role,
      signature_position
    } = params

    // Validate required fields
    // Note: workflow_run_id is optional for manually uploaded documents
    if (
      !investor_id ||
      !signer_email ||
      !signer_name ||
      !document_type ||
      !signer_role ||
      !signature_position
    ) {
      console.log('❌ [SIGNATURE] Validation failed: Missing required fields')
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    if (document_type === 'certificate') {
      console.log('⛔ [SIGNATURE] Certificate signature requests are disabled')
      return {
        success: false,
        error: 'Certificate signatures are deprecated. Certificates are published directly with embedded signatures.'
      }
    }

    console.log('✅ [SIGNATURE] Validation passed')

    // Validate app URL is configured BEFORE creating any database records
    try {
      getAppUrl()
      console.log('✅ [SIGNATURE] App URL configured')
    } catch (error) {
      console.error('❌ [SIGNATURE] App URL not configured:', error)
      return {
        success: false,
        error: 'Application URL not configured. Cannot generate signing links.'
      }
    }

    // DUPLICATE PREVENTION: Check for existing signature request before any operations
    // This protects ALL code paths that create signature requests (ready-for-signature, NDA approvals, direct API)
    console.log('🔍 [SIGNATURE] Checking for duplicate signature requests...')

    if (params.workflow_run_id) {
      // For n8n workflows: check (workflow_run_id, signer_role) pair
      const { data: existingWorkflow } = await supabase
        .from('signature_requests')
        .select('id, status')
        .eq('workflow_run_id', params.workflow_run_id)
        .eq('signer_role', signer_role)
        .in('status', ['pending', 'signed'])
        .limit(1)

      if (existingWorkflow && existingWorkflow.length > 0) {
        console.warn(`⚠️ [SIGNATURE] Duplicate prevention: Found existing ${signer_role} signature request for workflow ${params.workflow_run_id}`)
        return {
          success: false,
          error: `A signature request already exists for ${signer_role} on this workflow (status: ${existingWorkflow[0].status})`
        }
      }
    }

    if (params.document_id) {
      // For manual uploads: check (document_id, signer_role, signature_position) tuple
      // This allows multiple signatories with same role but different positions (party_a, party_a_2, etc.)
      let duplicateQuery = supabase
        .from('signature_requests')
        .select('id, status, signature_position')
        .eq('document_id', params.document_id)
        .eq('signer_role', signer_role)
        .in('status', ['pending', 'signed'])

      // If signature_position is provided, include it in duplicate check
      // This enables multi-signatory support (party_a vs party_a_2 are different)
      if (signature_position) {
        duplicateQuery = duplicateQuery.eq('signature_position', signature_position)
      }

      const { data: existingDocument } = await duplicateQuery.limit(1)

      if (existingDocument && existingDocument.length > 0) {
        console.warn(`⚠️ [SIGNATURE] Duplicate prevention: Found existing ${signer_role} (${signature_position}) signature request for document ${params.document_id}`)
        return {
          success: false,
          error: `A signature request already exists for ${signer_role} at position ${signature_position} on this document (status: ${existingDocument[0].status})`
        }
      }
    }

    console.log('✅ [SIGNATURE] No duplicate signature requests found')

    // Generate signing token and expiry
    const signing_token = generateSignatureToken()
    const token_expires_at = calculateTokenExpiry()
    console.log('🔑 [SIGNATURE] Generated token:', {
      token_length: signing_token.length,
      expires_at: token_expires_at.toISOString()
    })

    // Initialize storage manager
    const storage = new SignatureStorageManager(supabase)

    // Download and upload unsigned PDF if Google Drive URL provided
    let unsigned_pdf_path: string | null = null
    let unsigned_pdf_size: number | null = null

    if (google_drive_url) {
      console.log('📥 [SIGNATURE] Downloading PDF from Google Drive:', google_drive_url)
      try {
        const pdfBytes = await downloadPDFFromUrl(google_drive_url)
        console.log('✅ [SIGNATURE] PDF downloaded:', {
          size_bytes: pdfBytes.length,
          size_mb: (pdfBytes.length / 1024 / 1024).toFixed(2)
        })

        console.log('📤 [SIGNATURE] Uploading unsigned PDF to storage')
        const path = await storage.uploadUnsignedPDF(
          investor_id,
          signing_token,
          pdfBytes,
          {
            workflow_run_id: workflow_run_id || '',
            investor_id,
            document_type,
            google_drive_file_id: google_drive_file_id || ''
          }
        )

        unsigned_pdf_path = path
        unsigned_pdf_size = pdfBytes.length
        console.log('✅ [SIGNATURE] Unsigned PDF uploaded:', { path, size: pdfBytes.length })
      } catch (uploadError) {
        console.error('❌ [SIGNATURE] Error downloading/uploading PDF:', uploadError)
        // Continue without unsigned PDF - it will be downloaded from Google Drive at signing time
      }
    } else {
      console.log('⚠️ [SIGNATURE] No Google Drive URL provided, PDF will be fetched at signing time')
    }

    // Create signature request record
    console.log('💾 [SIGNATURE] Creating signature_requests database record')

    // Try to look up signer_user_id from email if not provided
    // This enables user-level signing verification for platform users
    let signer_user_id = params.signer_user_id
    if (!signer_user_id && signer_email) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', signer_email)
        .maybeSingle()

      if (userProfile?.id) {
        signer_user_id = userProfile.id
        console.log('👤 [SIGNATURE] Resolved signer_user_id from email:', signer_user_id)
      }
    }

    const insertData: any = {
      investor_id,
      signer_email,
      signer_name,
      document_type,
      signing_token,
      token_expires_at: token_expires_at.toISOString(),
      google_drive_file_id,
      google_drive_url,
      unsigned_pdf_path,
      unsigned_pdf_size,
      signer_role,
      signature_position,
      status: 'pending'
    }

    // Include signer_user_id for user-level signing verification
    if (signer_user_id) {
      insertData.signer_user_id = signer_user_id
      console.log('🔐 [SIGNATURE] Setting signer_user_id for verification:', signer_user_id)
    }

    // Only include workflow_run_id if provided (not all docs have workflow runs)
    if (workflow_run_id) {
      insertData.workflow_run_id = workflow_run_id
    }

    // Include member_id for entity investor signatories
    if (params.member_id) {
      insertData.member_id = params.member_id
      console.log('👤 [SIGNATURE] Setting member_id for entity signatory:', params.member_id)
    }

    // Include subscription_id and document_id if provided (for manual uploads)
    // Also look up deal_id from subscription for task linking
    let deal_id: string | null = params.deal_id ?? null

    // Fetch subscription and deal details for task context
    let subscriptionDetails: {
      commitment?: number
      currency?: string
      deal_name?: string
      company_name?: string
      series_name?: string
      investor_name?: string
    } = {}

    // If deal_id provided directly, fetch deal info for task context
    if (params.deal_id) {
      insertData.deal_id = params.deal_id
      console.log('📋 [SIGNATURE] Using provided deal_id:', deal_id)

      // Fetch deal info directly for task title/description
      const { data: deal } = await supabase
        .from('deals')
        .select('id, name, company_name, vehicle_id')
        .eq('id', params.deal_id)
        .single()

      if (deal) {
        subscriptionDetails.deal_name = deal.name || deal.company_name
        subscriptionDetails.company_name = deal.company_name
        console.log('📋 [SIGNATURE] Deal info for task:', { deal_name: subscriptionDetails.deal_name })

        if (deal.vehicle_id) {
          const { data: vehicle } = await supabase
            .from('vehicles')
            .select('name, investment_name, series_number')
            .eq('id', deal.vehicle_id)
            .maybeSingle()

          if (vehicle) {
            subscriptionDetails.series_name = vehicle.name
              || vehicle.investment_name
              || (vehicle.series_number ? `Series ${vehicle.series_number}` : undefined)
          }
        }
      }
    }

    if (params.subscription_id) {
      insertData.subscription_id = params.subscription_id

      // Look up subscription with deal and investor info
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
          deal_id,
          vehicle_id,
          commitment,
          currency,
          deal:deals!subscriptions_deal_id_fkey (
            id,
            name,
            company_name
          ),
          vehicle:vehicles!subscriptions_vehicle_id_fkey (
            id,
            name,
            investment_name,
            series_number,
            series_short_title
          ),
          investor:investors!subscriptions_investor_id_fkey (
            id,
            legal_name,
            display_name
          )
        `)
        .eq('id', params.subscription_id)
        .single()

      if (subscription) {
        if (subscription.deal_id && !deal_id) {
          deal_id = subscription.deal_id
          insertData.deal_id = deal_id
          console.log('📋 [SIGNATURE] Found deal_id from subscription:', deal_id)
        }

        // Store details for task creation
        // Note: Supabase returns relations as arrays in types, but single() makes them objects
        const deal = subscription.deal as any
        const vehicle = subscription.vehicle as any
        const investor = subscription.investor as any

        // Merge with any existing deal info (from direct deal_id lookup)
        subscriptionDetails = {
          ...subscriptionDetails,
          commitment: subscription.commitment,
          currency: subscription.currency || 'USD',
          deal_name: subscriptionDetails.deal_name || deal?.name || deal?.company_name,
          company_name: subscriptionDetails.company_name || deal?.company_name,
          series_name: subscriptionDetails.series_name
            || vehicle?.name
            || vehicle?.investment_name
            || (vehicle?.series_number ? `Series ${vehicle.series_number}` : undefined)
            || (vehicle?.series_short_title ? `Series ${vehicle.series_short_title}` : undefined),
          investor_name: investor?.display_name || investor?.legal_name
        }
        console.log('📋 [SIGNATURE] Subscription details for task:', subscriptionDetails)
      }
    }

    // If we still don't have investor name, fetch it directly
    if (!subscriptionDetails.investor_name && investor_id) {
      const { data: investorData } = await supabase
        .from('investors')
        .select('id, legal_name, display_name')
        .eq('id', investor_id)
        .single()

      if (investorData) {
        subscriptionDetails.investor_name = investorData.display_name || investorData.legal_name
        console.log('📋 [SIGNATURE] Fetched investor name directly:', subscriptionDetails.investor_name)
      }
    }
    if (params.document_id) {
      insertData.document_id = params.document_id
    }

    // Include total_party_a_signatories for multi-signatory positioning
    if (params.total_party_a_signatories) {
      insertData.total_party_a_signatories = params.total_party_a_signatories
      console.log('👥 [SIGNATURE] Multi-signatory mode:', params.total_party_a_signatories, 'Party A signers')
    }

    // MULTI-PAGE SIGNATURE PLACEMENTS
    // For subscription documents, detect anchor positions from the PDF
    // Each signer may need their signature on multiple pages (e.g., page 12 + page 40)
    // NO FALLBACK - if anchors aren't found, the document is broken and we FAIL LOUDLY
    if (document_type === 'subscription') {
      if (!params.document_id) {
        console.error('❌ [SIGNATURE] CRITICAL: No document_id provided for subscription signature')
        return {
          success: false,
          error: 'Subscription signature requires document_id for anchor detection'
        }
      }

      console.log('🔍 [SIGNATURE] Detecting signature anchors for document:', params.document_id)

      // Fetch PDF bytes from storage for anchor detection
      const pdfBytes = await fetchDocumentPdf(params.document_id, supabase)

      if (!pdfBytes) {
        console.error('❌ [SIGNATURE] CRITICAL: Could not fetch PDF for anchor detection')
        return {
          success: false,
          error: 'Failed to fetch PDF for signature anchor detection. Document may not exist in storage.'
        }
      }

      // Detect anchors in the PDF
      const anchors = await detectAnchors(pdfBytes)
      console.log(`📊 [SIGNATURE] Found ${anchors.length} total anchors in PDF`)

      if (anchors.length === 0) {
        console.error('❌ [SIGNATURE] CRITICAL: No SIG_ANCHOR markers found in PDF!')
        console.error('   This means the PDF was generated without anchor markers.')
        console.error('   The subscription pack template needs to be updated with anchors.')
        return {
          success: false,
          error: 'PDF has no signature anchor markers. Please regenerate the subscription pack.'
        }
      }

      // Get placements for this specific signer using anchor positions
      const placements = getPlacementsFromAnchors(anchors, signature_position)

      if (placements.length === 0) {
        console.error(`❌ [SIGNATURE] CRITICAL: No anchors found for position "${signature_position}"`)
        console.error(`   Available anchors: ${anchors.map(a => a.anchorId).join(', ')}`)
        return {
          success: false,
          error: `No signature anchors found for ${signature_position}. Available: ${anchors.map(a => a.anchorId).join(', ')}`
        }
      }

      // Validate expected placement counts for multi-page signatures
      // party_c (arranger) should have 2 placements: page 12 (main agreement) + page 39 (T&Cs)
      // party_b (issuer) should have 4 placements: page 2 (form) + page 3 (wire) + page 12 (main) + page 39 (T&Cs)
      // party_a (subscriber) should have 2 placements: page 2 (form) + page 12 (main)
      const expectedCounts: Record<string, number> = {
        'party_c': 2,  // Page 12 + Page 39
        'party_b': 4,  // Page 2 form + Page 3 wire + Page 12 main + Page 39 T&Cs
        'party_a': 2,  // Page 2 form + Page 12 main
      }
      const basePosition = signature_position.replace(/_\d+$/, '') as string
      const expectedCount = expectedCounts[basePosition] || 1

      if (placements.length < expectedCount) {
        console.warn(`⚠️ [SIGNATURE] Placement count warning: Found ${placements.length}/${expectedCount} placements for ${signature_position}`)
        console.warn(`   Expected ${expectedCount} placements but only found: ${placements.map(p => `page ${p.page}`).join(', ')}`)
        console.warn(`   This may indicate missing anchors in the PDF template`)
      } else {
        console.log(`✅ [SIGNATURE] All ${placements.length} expected placements found for ${signature_position}`)
      }

      insertData.signature_placements = placements
      console.log('📍 [SIGNATURE] Anchor-based signature placements:', {
        position: signature_position,
        count: placements.length,
        expected: expectedCount,
        placements: placements.map(p => `page ${p.page} at (${(p.x * 100).toFixed(1)}%, ${p.y.toFixed(0)}pt) - ${p.label}`).join(', ')
      })
    }

    const { data: signatureRequest, error: insertError } = await supabase
      .from('signature_requests')
      .insert(insertData)
      .select()
      .single()

    if (insertError || !signatureRequest) {
      console.error('❌ [SIGNATURE] Failed to create signature request:', insertError)
      return {
        success: false,
        error: normalizeSignatureRequestInsertError(insertError, params)
      }
    }

    console.log('✅ [SIGNATURE] Signature request record created:', {
      id: signatureRequest.id,
      status: signatureRequest.status
    })

    // Generate signing URL
    const signing_url = generateSigningUrl(signing_token)
    console.log('🔗 [SIGNATURE] Generated signing URL:', signing_url)

    // Send email with signing link using Resend
    console.log('📧 [SIGNATURE] Sending signature request email to:', signer_email)

    const emailResult = await sendSignatureRequestEmail({
      email: signer_email,
      signerName: signer_name,
      documentType: document_type,
      signingUrl: signing_url,
      expiresAt: token_expires_at.toISOString(),
      seriesName: subscriptionDetails.series_name,
      investmentCompany: subscriptionDetails.company_name || subscriptionDetails.deal_name
    })

    if (emailResult.success) {
      console.log('✅ [SIGNATURE] Email sent successfully:', emailResult.messageId)

      // Mark email as sent
      await supabase
        .from('signature_requests')
        .update({
          email_sent_at: new Date().toISOString()
        })
        .eq('id', signatureRequest.id)
    } else {
      console.error('❌ [SIGNATURE] Email send failed:', emailResult.error)

      // Don't fail the signature request creation, but log the error
      // Email failure is non-critical since users can access via tasks portal
      await supabase
        .from('signature_requests')
        .update({
          email_sent_at: null // Explicitly mark as not sent
        })
        .eq('id', signatureRequest.id)
    }

    // Create task for CEO/admin and arranger signatures to appear in VERSOSIGN
    // - CEO tasks: owned by ceo_entity_id (found via owner_ceo_entity_id)
    // - Arranger tasks: NOT owned by user (found via related_deal_id in arranger query)
    if (signer_role === 'admin' || signer_role === 'arranger') {
      console.log('📋 [SIGNATURE] Creating task for staff signature in VERSOSIGN')

      // Find the staff user by email (for logging/context, not ownership)
      const { data: staffProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('email', signer_email)
        .single()

      // For CEO/admin tasks, get the CEO entity ID for entity-based ownership
      // This allows ALL CEO members to see the task, not just one user
      let ceoEntityId: string | null = null
      if (signer_role === 'admin') {
        const { data: ceoEntity } = await supabase
          .from('ceo_entity')
          .select('id')
          .limit(1)
          .single()
        ceoEntityId = ceoEntity?.id || null
        console.log('📋 [SIGNATURE] CEO entity for task ownership:', ceoEntityId)
      }

      if (staffProfile && !profileError) {
        // Build rich task title and description with subscription/deal context
        const dealContext = subscriptionDetails.deal_name || subscriptionDetails.company_name
        const amountFormatted = subscriptionDetails.commitment
          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: subscriptionDetails.currency || 'USD', maximumFractionDigits: 0 }).format(subscriptionDetails.commitment)
          : null
        // For countersigner tasks: investor_name is the INVESTOR (subscriber), NOT the signer (CEO/arranger)
        // Don't fall back to signer_name as that would show the countersigner's name
        const investorContext = subscriptionDetails.investor_name
        const dateFormatted = formatViewerDate(new Date())

        console.log('📋 [SIGNATURE] Building staff task with context:', {
          dealContext,
          investorContext,
          amountFormatted,
          subscriptionDetails
        })

        // Create descriptive title: "Countersign SUBSCRIPTION - [Deal] - [Investor] ($Amount)"
        const titleParts = [`Countersign ${document_type.toUpperCase()}`]
        if (dealContext) titleParts.push(`- ${dealContext}`)
        if (investorContext) titleParts.push(`- ${investorContext}`)
        if (amountFormatted && document_type === 'subscription') titleParts.push(`(${amountFormatted})`)
        const richTitle = titleParts.join(' ')

        // Create detailed description with all context
        const descriptionParts = [`Review and countersign the ${document_type} document as ${signer_name}.`]
        if (dealContext) descriptionParts.push(`\n• Deal: ${dealContext}`)
        if (investorContext) descriptionParts.push(`\n• Investor: ${investorContext}`)
        if (amountFormatted) descriptionParts.push(`\n• Subscription Amount: ${amountFormatted}`)
        descriptionParts.push(`\n• Countersigner: ${signer_name}`)
        descriptionParts.push(`\n• Created: ${dateFormatted}`)
        const richDescription = descriptionParts.join('')

        // Task ownership based on role:
        // - CEO/admin: owner_ceo_entity_id (all CEO members see it)
        // - Arranger: NO owner (found via related_deal_id, not owner_user_id)
        //   This prevents arranger tasks from showing in staff VERSOSIGN view
        const taskOwnership = signer_role === 'admin' && ceoEntityId
          ? { owner_user_id: null, owner_ceo_entity_id: ceoEntityId }
          : { owner_user_id: null, owner_ceo_entity_id: null }  // Arranger: no ownership, use related_deal_id

        const { error: taskError } = await supabase.from('tasks').insert({
          ...taskOwnership,
          kind: 'countersignature',
          category: 'signatures',
          title: richTitle,
          description: richDescription,
          status: 'pending',
          priority: 'high',
          related_entity_type: 'signature_request',
          related_entity_id: signatureRequest.id,
          related_deal_id: deal_id,
          instructions: {
            type: 'signature',
            action_url: signing_url,
            signature_request_id: signatureRequest.id,
            document_type: document_type,
            investor_name: investorContext,
            deal_name: dealContext,
            amount: subscriptionDetails.commitment,
            currency: subscriptionDetails.currency,
            workflow_run_id: workflow_run_id,
            created_at: new Date().toISOString()
          }
        })

        if (taskError) {
          console.error('⚠️ [SIGNATURE] Failed to create task:', taskError)
        } else {
          console.log('✅ [SIGNATURE] Task created for VERSOSIGN:', {
            assignee: staffProfile.display_name,
            title: `Countersign ${document_type.toUpperCase()} for ${signer_name}`
          })
        }
      } else {
        console.warn('⚠️ [SIGNATURE] Could not find staff profile for:', signer_email)
      }
    }

    // Create task for investor signatures to appear in investor portal
    if (signer_role === 'investor') {
      console.log('📋 [SIGNATURE] Creating task for investor signature in investor portal')

      // Get ALL user accounts linked to this investor (for task visibility and notifications)
      const { data: investorUsers, error: investorUserError } = await supabase
        .from('investor_users')
        .select('user_id')
        .eq('investor_id', investor_id)

      const hasUserAccount = (investorUsers && investorUsers.length > 0) && !investorUserError
      console.log(`📋 [SIGNATURE] Found ${investorUsers?.length || 0} user(s) linked to investor`)

      // Build rich context from subscription details (used in both branches)
      const dealContext = subscriptionDetails.deal_name || subscriptionDetails.company_name
      const amountFormatted = subscriptionDetails.commitment
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: subscriptionDetails.currency || 'USD', maximumFractionDigits: 0 }).format(subscriptionDetails.commitment)
        : null
      const dateFormatted = formatViewerDate(new Date())
      const dueDate = formatViewerDate(token_expires_at)

      if (hasUserAccount) {
        // Investor has user account(s) - create task visible to ALL investor users
        // IMPORTANT: We set owner_investor_id but NOT owner_user_id
        // This allows any user linked to the investor to see and complete the task
        // (shared account model for entities)
        console.log('✅ [SIGNATURE] Investor has user account(s) - creating shared task')

        // Determine task kind and category based on document type
        // ALL signature tasks should be in 'signatures' category
        const taskKind = document_type === 'nda'
          ? 'deal_nda_signature'
          : document_type === 'subscription'
          ? 'subscription_pack_signature'
          : 'other'

        // All signature-related tasks go under 'signatures' category
        const category = 'signatures'

        // Include signatory name in title for multi-signatory entities
        const signatoryInfo = params.member_id ? ` (${signer_name})` : ''

        // Build rich title with deal context: "Sign Subscription Agreement - [Deal] ($Amount)"
        let title: string
        if (document_type === 'nda') {
          title = dealContext
            ? `Sign NDA${signatoryInfo} - ${dealContext}`
            : `Sign Non-Disclosure Agreement${signatoryInfo}`
        } else if (document_type === 'subscription') {
          const titleParts = [`Sign Subscription Pack${signatoryInfo}`]
          if (dealContext) titleParts.push(`- ${dealContext}`)
          if (amountFormatted) titleParts.push(`(${amountFormatted})`)
          title = titleParts.join(' ')
        } else {
          title = `Sign ${document_type.toUpperCase()} Document${signatoryInfo}`
        }

        // Build detailed description with all context
        const descriptionParts: string[] = []
        if (params.member_id) {
          descriptionParts.push(`Signatory ${signer_name} must review and sign the ${document_type} document.`)
        } else {
          descriptionParts.push(`Please review and sign the ${document_type} document.`)
        }
        if (dealContext) descriptionParts.push(`\n• Deal: ${dealContext}`)
        if (amountFormatted) descriptionParts.push(`\n• Subscription: ${amountFormatted}`)
        descriptionParts.push(`\n• Created: ${dateFormatted}`)
        descriptionParts.push(`\n• Due by: ${dueDate}`)
        if (params.member_id) {
          descriptionParts.push(`\n\nAny authorized user of this investor can complete this task.`)
        }
        const description = descriptionParts.join('')

        const { error: taskError } = await supabase.from('tasks').insert({
          owner_user_id: null, // NOT set - allows any investor user to see/complete
          owner_investor_id: investor_id, // All investor users can see this task
          kind: taskKind,
          category: category,
          title: title,
          description: description,
          status: 'pending',
          priority: 'high',
          related_entity_type: 'signature_request',
          related_entity_id: signatureRequest.id,
          related_deal_id: deal_id,
          due_at: token_expires_at.toISOString(),
          instructions: {
            type: 'signature',
            action_url: signing_url,
            signature_request_id: signatureRequest.id,
            document_type: document_type,
            deal_name: dealContext,
            amount: subscriptionDetails.commitment,
            currency: subscriptionDetails.currency,
            workflow_run_id: workflow_run_id,
            signer_name: signer_name,
            member_id: params.member_id || null,
            created_at: new Date().toISOString(),
            steps: [
              'Click "Start" to open the document',
              'Review the document carefully',
              'Draw or upload your signature',
              'Click "Submit Signature" to complete'
            ],
            requirements: [
              'Valid signature required',
              'Must be completed before expiration'
            ],
            estimated_time: '5-10 minutes'
          }
        })

        if (taskError) {
          console.error('⚠️ [SIGNATURE] Failed to create investor task:', taskError)
        } else {
          console.log('✅ [SIGNATURE] Investor task created:', {
            owner_investor_id: investor_id,
            title: title,
            kind: taskKind,
            shared_access: true // All investor users can see this task
          })

          // Create notifications for ALL users linked to this investor
          // This ensures everyone in the entity is notified about the signature request
          const daysRemaining = Math.floor((token_expires_at.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
          for (const investorUser of investorUsers || []) {
            // Build rich notification with deal context
            const notifTitle = dealContext
              ? `${document_type.toUpperCase()} Ready - ${dealContext}${params.member_id ? ` (${signer_name})` : ''}`
              : `${document_type.toUpperCase()} Ready for Signature${params.member_id ? ` - ${signer_name}` : ''}`

            const messageParts: string[] = []
            if (params.member_id) {
              messageParts.push(`Signatory ${signer_name} must sign the ${document_type} document.`)
            } else {
              messageParts.push(`Your ${document_type} document is ready for signature.`)
            }
            if (dealContext) messageParts.push(` Deal: ${dealContext}.`)
            if (amountFormatted) messageParts.push(` Amount: ${amountFormatted}.`)
            messageParts.push(` Please sign within ${daysRemaining} days.`)

            const { error: notificationError } = await supabase.from('investor_notifications').insert({
              user_id: investorUser.user_id,
              type: 'signature_required',
              title: notifTitle,
              message: messageParts.join(''),
              link: '/versotech_main/tasks',
              action_url: `/versotech_main/tasks`,
              metadata: {
                signature_request_id: signatureRequest.id,
                document_type: document_type,
                signer_name: signer_name,
                deal_name: dealContext,
                amount: subscriptionDetails.commitment,
                currency: subscriptionDetails.currency,
                member_id: params.member_id || null
              }
            })

            if (notificationError) {
              console.error('⚠️ [SIGNATURE] Failed to create notification for user:', investorUser.user_id, notificationError)
            }
          }
          console.log(`✅ [SIGNATURE] Notifications created for ${investorUsers?.length || 0} investor user(s)`)
        }
      } else {
        // Investor has NO user account - create manual follow-up task for staff
        console.log('⚠️ [SIGNATURE] Investor has no user account - creating manual follow-up task for staff')

        // Find a staff user to assign the follow-up task to (get first admin)
        const { data: adminUsers, error: adminError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .eq('role', 'staff_admin')
          .limit(1)

        const adminUserId = adminUsers?.[0]?.id

        if (adminUserId && !adminError) {
          // Build rich follow-up task with all context
          const followUpTitleParts = [`Manual Follow-up: ${document_type.toUpperCase()} for ${signer_name}`]
          if (dealContext) followUpTitleParts.push(`- ${dealContext}`)
          const followUpTitle = followUpTitleParts.join(' ')

          const followUpDescParts = [`Investor ${signer_name} does not have a user account.`]
          if (dealContext) followUpDescParts.push(`\n• Deal: ${dealContext}`)
          if (amountFormatted) followUpDescParts.push(`\n• Amount: ${amountFormatted}`)
          followUpDescParts.push(`\n• Email: ${signer_email}`)
          followUpDescParts.push(`\n\nManually send them the signature link.`)
          const followUpDescription = followUpDescParts.join('')

          const { error: followUpError } = await supabase.from('tasks').insert({
            owner_user_id: adminUserId,
            kind: 'other',
            category: 'signatures',
            title: followUpTitle,
            description: followUpDescription,
            status: 'pending',
            priority: 'high',
            related_entity_type: 'signature_request',
            related_entity_id: signatureRequest.id,
            related_deal_id: deal_id,
            instructions: {
              type: 'manual_follow_up',
              action_url: signing_url,
              investor_name: signer_name,
              investor_email: signer_email,
              document_type: document_type,
              deal_name: dealContext,
              amount: subscriptionDetails.commitment,
              currency: subscriptionDetails.currency,
              signature_request_id: signatureRequest.id,
              created_at: new Date().toISOString(),
              action_required: 'Send the signature link to the investor via email or other communication channel'
            }
          })

          if (followUpError) {
            console.error('⚠️ [SIGNATURE] Failed to create manual follow-up task:', followUpError)
            throw new Error(`Failed to create manual follow-up task: ${followUpError.message}`)
          } else {
            console.log('✅ [SIGNATURE] Manual follow-up task created for staff')
          }
        } else {
          console.error('⚠️ [SIGNATURE] Could not find admin user for manual follow-up task assignment')
          throw new Error('No admin user available to assign manual follow-up task. Signature request cannot be created without a way to notify staff.')
        }
      }
    }

    console.log('✅ [SIGNATURE] createSignatureRequest() completed successfully')
    console.log('📊 [SIGNATURE] Result:', {
      signature_request_id: signatureRequest.id,
      signer_email,
      signer_role,
      signature_position,
      signing_url,
      expires_at: token_expires_at.toISOString()
    })

    return {
      success: true,
      signature_request_id: signatureRequest.id,
      signing_url,
      expires_at: token_expires_at.toISOString()
    }
  } catch (error) {
    console.error('Signature request error:', error)
    return {
      success: false,
      error: normalizeCreateSignatureRequestError(error)
    }
  }
}

/**
 * Get signature request by token (public endpoint for signers)
 *
 * This function:
 * 1. Fetches signature request by token
 * 2. Validates token expiry and status
 * 3. Generates temporary signed URL for unsigned PDF
 * 4. Returns public view (no sensitive fields)
 */
export async function getSignatureRequest(
  token: string,
  supabase: SupabaseClient
): Promise<SignatureRequestPublicView | null> {
  try {
    if (!token) {
      throw new Error('Token is required')
    }

    // Fetch signature request by token
    const { data: signatureRequest, error } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('signing_token', token)
      .single()

    if (error || !signatureRequest) {
      throw new Error('Signature request not found')
    }

    // Check if token is expired
    if (isTokenExpired(signatureRequest.token_expires_at)) {
      // Update status to expired
      await supabase
        .from('signature_requests')
        .update({ status: 'expired' })
        .eq('id', signatureRequest.id)

      throw new Error('Signature token has expired')
    }

    // Check if already signed
    if (signatureRequest.status === 'signed') {
      throw new Error('Document has already been signed')
    }

    // Check if cancelled
    if (signatureRequest.status === 'cancelled') {
      throw new Error('Signature request has been cancelled')
    }

    // Get unsigned PDF URL if it exists
    let unsigned_pdf_url: string | null = null
    let success_redirect_path: string | null = null

    if (signatureRequest.unsigned_pdf_path) {
      const storage = new SignatureStorageManager(supabase)
      unsigned_pdf_url = await storage.getSignedUrl(
        signatureRequest.unsigned_pdf_path,
        3600
      ) // 1 hour expiry
    }

    if (signatureRequest.document_type === 'subscription') {
      let redirectDealId = signatureRequest.deal_id || null
      let redirectCycleId: string | null = null

      if (signatureRequest.subscription_id) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('deal_id, cycle_id')
          .eq('id', signatureRequest.subscription_id)
          .maybeSingle()

        redirectDealId = redirectDealId || subscription?.deal_id || null
        redirectCycleId = subscription?.cycle_id || null
      }

      if (redirectDealId) {
        const params = new URLSearchParams({ action: 'funding' })
        if (redirectCycleId) {
          params.set('cycle', redirectCycleId)
        }
        success_redirect_path = `/versotech_main/opportunities/${redirectDealId}?${params.toString()}`
      }
    }

    // Return public view
    return {
      id: signatureRequest.id,
      signer_name: signatureRequest.signer_name,
      signer_email: signatureRequest.signer_email,
      document_type: signatureRequest.document_type,
      unsigned_pdf_url,
      google_drive_url: signatureRequest.google_drive_url,
      status: signatureRequest.status,
      expires_at: signatureRequest.token_expires_at,
      verification_required: signatureRequest.verification_required || false,
      verification_completed_at: signatureRequest.verification_completed_at || null,
      success_redirect_path,
    }
  } catch (error) {
    console.error('Error fetching signature request:', error)
    return null
  }
}

/**
 * Submit signature (sign document)
 *
 * This function implements the complete signature submission flow:
 * 1. Validates token and status
 * 2. Implements progressive signing (multi-party documents)
 * 3. Downloads base PDF (unsigned or already-signed)
 * 4. Embeds signature using pdf-lib
 * 5. Uploads signed PDF
 * 6. Updates database with optimistic locking
 * 7. Commits subscription once investor signers complete (subscription packs)
 * 8. Checks if all signatures complete
 * 9. Executes post-signature handler if fully signed
 */
export async function submitSignature(
  params: SubmitSignatureParams,
  supabase: SupabaseClient,
  ipAddress: string = 'unknown',
  currentUserId?: string | null
): Promise<SubmitSignatureResult> {
  console.log('\n🟢 [SIGNATURE] submitSignature() called')
  console.log('📋 [SIGNATURE] Params:', {
    token_length: params.token?.length || 0,
    has_signature_data: !!params.signature_data_url,
    ip_address: ipAddress
  })

  // Declare at function scope so catch block can access for lock cleanup
  let signatureRequest: any = null
  let lockAcquired = false

  try {
    const { token, signature_data_url } = params

    if (!token || !signature_data_url) {
      console.log('❌ [SIGNATURE] Validation failed: Missing token or signature data')
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    // Fetch signature request
    console.log('🔍 [SIGNATURE] Fetching signature request by token')
    const { data: fetchedRequest, error: fetchError } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('signing_token', token)
      .single()

    if (fetchError || !fetchedRequest) {
      console.log('❌ [SIGNATURE] Signature request not found:', fetchError)
      return {
        success: false,
        error: 'Signature request not found'
      }
    }

    // Assign to function-scoped variable
    signatureRequest = fetchedRequest

    console.log('✅ [SIGNATURE] Signature request found:', {
      id: signatureRequest.id,
      signer_email: signatureRequest.signer_email,
      signer_role: signatureRequest.signer_role,
      signature_position: signatureRequest.signature_position,
      status: signatureRequest.status,
      workflow_run_id: signatureRequest.workflow_run_id,
      document_id: signatureRequest.document_id,
      subscription_id: signatureRequest.subscription_id
    })

    // Validate token not expired
    if (isTokenExpired(signatureRequest.token_expires_at)) {
      console.log('❌ [SIGNATURE] Token expired:', signatureRequest.token_expires_at)
      await supabase
        .from('signature_requests')
        .update({ status: 'expired' })
        .eq('id', signatureRequest.id)

      return {
        success: false,
        error: 'Signature token has expired'
      }
    }

    // Validate not already signed
    if (signatureRequest.status === 'signed') {
      console.log('❌ [SIGNATURE] Document already signed')
      return {
        success: false,
        error: 'Document has already been signed'
      }
    }

    if (
      signatureRequest.document_type === 'introducer_agreement' &&
      signatureRequest.introducer_agreement_id &&
      (signatureRequest.signer_role === 'admin' ||
        signatureRequest.signer_role === 'arranger' ||
        signatureRequest.signer_role === 'introducer')
    ) {
      const { data: introducerAgreement, error: introducerAgreementError } = await supabase
        .from('introducer_agreements')
        .select('id, status, arranger_id')
        .eq('id', signatureRequest.introducer_agreement_id)
        .maybeSingle()

      if (introducerAgreementError || !introducerAgreement) {
        console.error('❌ [SIGNATURE] Introducer agreement not found for signature request:', introducerAgreementError)
        return {
          success: false,
          error: 'Introducer agreement not found'
        }
      }

      const normalizedSignerRole =
        signatureRequest.signer_role === 'introducer'
          ? 'introducer'
          : signatureRequest.signer_role === 'arranger'
            ? 'arranger'
            : 'admin'

      if (
        !canSignIntroducerAgreement(
          introducerAgreement.status,
          normalizedSignerRole,
          !!introducerAgreement.arranger_id
        )
      ) {
        const errorMessage =
          normalizedSignerRole === 'introducer'
            ? 'Cannot sign yet. The internal side must sign first.'
            : 'Cannot sign this agreement yet. It is not ready for internal signature.'

        console.log('❌ [SIGNATURE] Introducer agreement signing blocked by workflow state:', {
          agreement_status: introducerAgreement.status,
          signer_role: normalizedSignerRole,
          agreement_id: introducerAgreement.id,
        })

        return {
          success: false,
          error: errorMessage
        }
      }
    }

    // USER VERIFICATION: Ensure the authenticated user is the designated signer
    // This prevents URL sharing attacks where someone shares their signing link
    if (signatureRequest.signer_user_id) {
      // This signature request is assigned to a specific platform user
      if (!currentUserId) {
        console.log('❌ [SIGNATURE] User verification failed: No authenticated user but signer_user_id is set')
        return {
          success: false,
          error: 'Please log in to sign this document. This signature request is assigned to a specific user.'
        }
      }
      if (currentUserId !== signatureRequest.signer_user_id) {
        console.log('❌ [SIGNATURE] User verification failed: Current user does not match designated signer', {
          current_user_id: currentUserId,
          expected_signer_user_id: signatureRequest.signer_user_id
        })
        return {
          success: false,
          error: 'You are not authorized to sign this document. It is assigned to another user.'
        }
      }
      console.log('✅ [SIGNATURE] User verification passed - current user matches designated signer')
    }

    // OTP VERIFICATION: For external signers, require email verification
    if (signatureRequest.verification_required && !signatureRequest.verification_completed_at) {
      console.log('❌ [SIGNATURE] OTP verification required but not completed')
      return {
        success: false,
        error: 'Email verification required before signing. Please complete the verification process.'
      }
    }

    // PROGRESSIVE SIGNING ORDER ENFORCEMENT
    // COMPANY SIGNS FIRST: party_a (investors) cannot sign until party_b (company) has signed
    // This ensures the company approves the document before investors sign
    if (signatureRequest.document_type === 'subscription' && signatureRequest.signature_position?.startsWith('party_a')) {
      console.log('🔍 [SIGNATURE] Checking if company (party_b) has signed first (progressive signing)...')

      // Find party_b signature request for the same document (company/arranger/CEO)
      const { data: partyBRequests } = await supabase
        .from('signature_requests')
        .select('id, status, signer_name, signature_position')
        .eq('document_id', signatureRequest.document_id)
        .like('signature_position', 'party_b%')

      if (partyBRequests && partyBRequests.length > 0) {
        // Check if party_b (company) has NOT signed yet
        const unsignedPartyB = partyBRequests.find(req => req.status !== 'signed')

        if (unsignedPartyB) {
          console.log('❌ [SIGNATURE] Progressive signing violation: company has not signed yet:', unsignedPartyB.signer_name)
          return {
            success: false,
            error: `Cannot sign yet. The company (${unsignedPartyB.signer_name}) must sign before you.`
          }
        }

        console.log('✅ [SIGNATURE] Progressive signing check passed - company (party_b) has signed')
      } else {
        console.log('⚠️ [SIGNATURE] No party_b (company) signature found - allowing party_a to sign (legacy flow)')
      }
    }

    console.log('✅ [SIGNATURE] Validation passed - token valid and not yet signed')

    // PROGRESSIVE SIGNING: Acquire workflow-level lock to prevent race conditions
    let lockAttempts = 0
    const maxLockAttempts = 20  // Increased from 10 to 20 for better UX
    const baseRetryDelayMs = 500
    const maxRetryDelayMs = 3000  // Cap at 3 seconds

    if (signatureRequest.workflow_run_id) {
      console.log('🔒 [SIGNATURE] Attempting to acquire workflow lock for:', signatureRequest.workflow_run_id)

      while (!lockAcquired && lockAttempts < maxLockAttempts) {
        lockAttempts++

        // Try to acquire lock by updating a lock field
        const { data: lockResult, error: lockError } = await supabase
          .from('workflow_runs')
          .update({
            signing_in_progress: true,
            signing_locked_by: signatureRequest.id,
            signing_locked_at: new Date().toISOString()
          })
          .eq('id', signatureRequest.workflow_run_id)
          .is('signing_in_progress', null)  // Only acquire if not already locked
          .select('id')
          .single()

        if (lockResult && !lockError) {
          lockAcquired = true
          console.log(`✅ [SIGNATURE] Workflow lock acquired (attempt ${lockAttempts})`)
        } else {
          // Exponential backoff: 500ms, 1000ms, 1500ms, 2000ms, 2500ms, 3000ms, 3000ms...
          // Total max wait time: ~30 seconds (much better for concurrent signing UX)
          const delay = Math.min(baseRetryDelayMs * lockAttempts, maxRetryDelayMs)
          console.log(`⏳ [SIGNATURE] Workflow locked by another signer, waiting ${delay}ms... (attempt ${lockAttempts}/${maxLockAttempts})`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      if (!lockAcquired) {
        console.error('❌ [SIGNATURE] Failed to acquire workflow lock after', maxLockAttempts, 'attempts')
        return {
          success: false,
          error: 'Another party is currently signing this document. Please wait a moment and try again.'
        }
      }
    }

    // PROGRESSIVE SIGNING: Check if another signer has already signed
    // This enables signature chaining - each subsequent signer signs the previous signer's PDF
    let pdfBytes: Uint8Array | null = null
    const storage = new SignatureStorageManager(supabase)

    // Check for existing signatures by workflow_run_id (for n8n workflows like NDA)
    if (signatureRequest.workflow_run_id) {
      console.log('🔄 [SIGNATURE] Checking for progressive signing in workflow:', signatureRequest.workflow_run_id)
      // Get all other signature requests for this workflow
      const { data: otherSignatures } = await supabase
        .from('signature_requests')
        .select('id, status, signed_pdf_path, signer_role, signer_name')
        .eq('workflow_run_id', signatureRequest.workflow_run_id)
        .neq('id', signatureRequest.id)
        .eq('status', 'signed')
        .order('created_at', { ascending: false }) // Most recent first (has all previous signatures)

      // If another party already signed, use their signed PDF as base
      if (otherSignatures && otherSignatures.length > 0) {
        const mostRecentSigned = otherSignatures[0]

        console.log('✅ [SIGNATURE] Found existing signature - progressive signing active')
        console.log('📥 [SIGNATURE] Loading already-signed PDF from', mostRecentSigned.signer_name)

        if (mostRecentSigned.signed_pdf_path) {
          pdfBytes = await storage.downloadPDF(mostRecentSigned.signed_pdf_path)
          console.log('✅ [SIGNATURE] Downloaded already-signed PDF:', {
            size_bytes: pdfBytes.length,
            from_signer: mostRecentSigned.signer_name
          })
        }
      } else {
        console.log('ℹ️ [SIGNATURE] No other signatures found in workflow - this is the first signature')
      }
    }

    const chainSource = signatureRequest.document_id
      ? { field: 'document_id', value: signatureRequest.document_id, label: 'document_id' }
      : signatureRequest.document_type === 'introducer_agreement' && signatureRequest.introducer_agreement_id
        ? { field: 'introducer_agreement_id', value: signatureRequest.introducer_agreement_id, label: 'introducer_agreement_id' }
        : signatureRequest.document_type === 'placement_agreement' && signatureRequest.placement_agreement_id
          ? { field: 'placement_agreement_id', value: signatureRequest.placement_agreement_id, label: 'placement_agreement_id' }
          : null

    // DEBUG: Log state before chain check
    console.log('🔍 [SIGNATURE] Pre-chain check state:', {
      pdfBytes_already_set: !!pdfBytes,
      pdfBytes_size: pdfBytes?.length || 0,
      document_id: signatureRequest.document_id,
      document_id_type: typeof signatureRequest.document_id,
      chain_source: chainSource?.label || null,
      will_run_chain_query: !pdfBytes && !!chainSource
    })

    // Check for existing signatures by document/agreements (progressive signing)
    if (!pdfBytes && chainSource) {
      console.log(`🔄 [SIGNATURE] Checking for progressive signing by ${chainSource.label}:`, chainSource.value)
      console.log('🔍 [SIGNATURE] Current request ID:', signatureRequest.id)

      // Get all other signature requests for this document that have been signed
      const { data: otherSignatures, error: chainError } = await supabase
        .from('signature_requests')
        .select('id, status, signed_pdf_path, signer_role, signer_name, signature_position, updated_at')
        .eq(chainSource.field, chainSource.value)
        .neq('id', signatureRequest.id)
        .eq('status', 'signed')
        .order('updated_at', { ascending: false }) // Most recently SIGNED first (has all previous signatures)

      console.log('📊 [SIGNATURE] Chain query result:', {
        found: otherSignatures?.length || 0,
        error: chainError?.message || null,
        signatures: otherSignatures?.map(s => ({ name: s.signer_name, position: s.signature_position, status: s.status }))
      })

      if (otherSignatures && otherSignatures.length > 0) {
        // Use the most recently signed PDF as the base - it contains all previous signatures
        const mostRecentSigned = otherSignatures[0]

        console.log('✅ [SIGNATURE] Found existing signature(s) on document - progressive signing active')
        console.log('📥 [SIGNATURE] Loading already-signed PDF from', mostRecentSigned.signer_name, `(${mostRecentSigned.signature_position})`)
        console.log('📊 [SIGNATURE] Total previous signatures:', otherSignatures.length)

        if (mostRecentSigned.signed_pdf_path) {
          pdfBytes = await storage.downloadPDF(mostRecentSigned.signed_pdf_path)
          console.log('✅ [SIGNATURE] Downloaded already-signed PDF:', {
            size_bytes: pdfBytes.length,
            from_signer: mostRecentSigned.signer_name,
            position: mostRecentSigned.signature_position,
            contains_signatures: otherSignatures.length
          })
        }
      } else {
        console.log('ℹ️ [SIGNATURE] No other signatures found on document - this is the first signature')
      }
    }

    // If no other signature exists, download unsigned PDF
    if (!pdfBytes) {
      console.log('📄 [SIGNATURE] Loading unsigned PDF')

      if (signatureRequest.unsigned_pdf_path) {
        console.log('📥 [SIGNATURE] Downloading from Supabase Storage:', signatureRequest.unsigned_pdf_path)
        pdfBytes = await storage.downloadPDF(signatureRequest.unsigned_pdf_path)
        console.log('✅ [SIGNATURE] Downloaded unsigned PDF from storage:', {
          size_bytes: pdfBytes.length
        })
      } else if (signatureRequest.google_drive_url) {
        console.log('📥 [SIGNATURE] Downloading from Google Drive:', signatureRequest.google_drive_url)
        pdfBytes = await downloadPDFFromUrl(signatureRequest.google_drive_url)
        console.log('✅ [SIGNATURE] Downloaded unsigned PDF from Google Drive:', {
          size_bytes: pdfBytes.length
        })
      } else {
        console.log('❌ [SIGNATURE] No PDF source available')

        // Release lock before returning
        if (lockAcquired && signatureRequest.workflow_run_id) {
          await supabase
            .from('workflow_runs')
            .update({ signing_in_progress: null, signing_locked_by: null, signing_locked_at: null })
            .eq('id', signatureRequest.workflow_run_id)
            .eq('signing_locked_by', signatureRequest.id)
        }

        return {
          success: false,
          error: 'No PDF source available'
        }
      }
    }

    // Embed signature in PDF
    console.log('✍️ [SIGNATURE] Embedding signature into PDF')
    console.log('📐 [SIGNATURE] Signature details:', {
      signer_name: signatureRequest.signer_name,
      signature_position: signatureRequest.signature_position,
      document_type: signatureRequest.document_type,
      pdf_size_before: pdfBytes.length,
      has_stored_placements: !!signatureRequest.signature_placements
    })

    let signedPdfBytes: Uint8Array

    // Check if we have pre-calculated placements (subscription documents)
    const storedPlacements = signatureRequest.signature_placements as SignaturePlacementRecord[] | null

    if (storedPlacements && storedPlacements.length > 0) {
      // MULTI-PAGE SIGNING: Use stored placements to embed on ALL required pages
      console.log('📐 [SIGNATURE] Using stored placements for multi-page signing:', {
        placement_count: storedPlacements.length,
        pages: storedPlacements.map(p => `page ${p.page} (${p.label})`).join(', ')
      })

      signedPdfBytes = await embedSignatureMultipleLocations({
        pdfBytes,
        signatureDataUrl: signature_data_url,
        placements: storedPlacements,
        signerName: signatureRequest.signer_name,
        timestamp: new Date()
      })

      console.log('✅ [SIGNATURE] Signature embedded on', storedPlacements.length, 'page(s)')
    } else {
      // LEGACY SINGLE-PAGE SIGNING: Fall back to calculated position (NDA and other docs)
      console.log('📐 [SIGNATURE] No stored placements - using legacy single-page signing')

      // Import the legacy helper for non-subscription documents
      const { calculateSignaturePosition } = await import('./helpers')

      const position = calculateSignaturePosition(
        signatureRequest.signature_position,
        signatureRequest.total_party_a_signatories || 1,
        signatureRequest.document_type || 'nda'
      )

      console.log('📍 [SIGNATURE] Legacy position calculated:', {
        xPercent: (position.xPercent * 100).toFixed(1) + '%',
        yFromBottom: position.yFromBottom.toFixed(1) + 'pt'
      })

      signedPdfBytes = await embedSignatureInPDF({
        pdfBytes,
        signatureDataUrl: signature_data_url,
        signerName: signatureRequest.signer_name,
        signaturePosition: signatureRequest.signature_position,
        timestamp: new Date(),
        totalPartyASignatories: signatureRequest.total_party_a_signatories || 1,
        documentType: signatureRequest.document_type,
        pageNumber: -1,  // Last page for legacy documents
        xPercent: position.xPercent,
        yFromBottom: position.yFromBottom
      })
    }

    console.log('✅ [SIGNATURE] Signature embedded successfully:', {
      pdf_size_after: signedPdfBytes.length
    })

    // Upload signed PDF to storage
    console.log('📤 [SIGNATURE] Uploading signed PDF to storage')
    const signedPdfPath = await storage.uploadSignedPDF(
      signatureRequest.investor_id,
      token,
      signedPdfBytes,
      {
        workflow_run_id: signatureRequest.workflow_run_id || '',
        investor_id: signatureRequest.investor_id,
        document_type: signatureRequest.document_type,
        signed_at: new Date().toISOString(),
        signer_name: signatureRequest.signer_name,
        signer_email: signatureRequest.signer_email
      }
    )
    console.log('✅ [SIGNATURE] Signed PDF uploaded:', signedPdfPath)

    // Update signature request with optimistic locking
    console.log('💾 [SIGNATURE] Updating signature_requests record with optimistic lock')
    const { error: updateError, count } = await supabase
      .from('signature_requests')
      .update({
        status: 'signed',
        signature_data_url,
        signature_timestamp: new Date().toISOString(),
        signature_ip_address: ipAddress,
        signed_pdf_path: signedPdfPath,
        signed_pdf_size: signedPdfBytes.length
      }, { count: 'exact' })
      .eq('id', signatureRequest.id)
      .eq('status', 'pending') // Optimistic lock
      .select('id')

    if (updateError) {
      console.error('❌ [SIGNATURE] Failed to update signature request:', updateError)

      // Release lock before returning
      if (lockAcquired && signatureRequest.workflow_run_id) {
        await supabase
          .from('workflow_runs')
          .update({ signing_in_progress: null, signing_locked_by: null, signing_locked_at: null })
          .eq('id', signatureRequest.workflow_run_id)
          .eq('signing_locked_by', signatureRequest.id)
      }

      return {
        success: false,
        error: 'Failed to update signature status'
      }
    }

    // Check if update succeeded (race condition detection)
    if (count === 0) {
      console.error('❌ [SIGNATURE] Race condition: Signature request was already signed')

      // Release lock before returning
      if (lockAcquired && signatureRequest.workflow_run_id) {
        await supabase
          .from('workflow_runs')
          .update({ signing_in_progress: null, signing_locked_by: null, signing_locked_at: null })
          .eq('id', signatureRequest.workflow_run_id)
          .eq('signing_locked_by', signatureRequest.id)
      }

      return {
        success: false,
        error: 'This document has already been signed'
      }
    }

    console.log('✅ [SIGNATURE] Database record updated successfully - status set to "signed"')
    console.log('📊 [SIGNATURE] Signature submission complete:', {
      id: signatureRequest.id,
      signer_email: signatureRequest.signer_email,
      signer_role: signatureRequest.signer_role,
      signed_pdf_path: signedPdfPath,
      workflow_run_id: signatureRequest.workflow_run_id
    })

    // Auto-complete any related tasks
    console.log('🔍 [SIGNATURE] Looking for related tasks to auto-complete')
    const { data: relatedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, owner_user_id')
      .eq('related_entity_type', 'signature_request')
      .eq('related_entity_id', signatureRequest.id)
      .neq('status', 'completed')

    if (tasksError) {
      console.error('⚠️ [SIGNATURE] Failed to query related tasks:', tasksError)
    }

    if (relatedTasks && relatedTasks.length > 0) {
      console.log(`✅ [SIGNATURE] Found ${relatedTasks.length} task(s) to complete`)

      const completionTime = new Date().toISOString()
      const updates = {
        status: 'completed',
        completed_at: completionTime,
        completed_by: currentUserId || null,
        updated_at: completionTime
      }
      const taskIds = relatedTasks.map(task => task.id)

      const { data: completedWithUserClient, error: completeError } = await supabase
        .from('tasks')
        .update(updates)
        .in('id', taskIds)
        .in('status', ['pending', 'in_progress', 'overdue', 'blocked'])
        .select('id')

      const completedCount = completedWithUserClient?.length || 0

      if (completeError) {
        console.warn('⚠️ [SIGNATURE] User client failed to auto-complete tasks, retrying with service client:', completeError)
      }

      if (completeError || completedCount === 0) {
        try {
          const serviceClient = createServiceClient()
          const { data: completedWithServiceClient, error: serviceCompleteError } = await serviceClient
            .from('tasks')
            .update(updates)
            .in('id', taskIds)
            .in('status', ['pending', 'in_progress', 'overdue', 'blocked'])
            .select('id')

          if (serviceCompleteError) {
            console.error('⚠️ [SIGNATURE] Service client failed to auto-complete tasks:', serviceCompleteError)
          } else {
            console.log('✅ [SIGNATURE] Tasks auto-completed with service client:', completedWithServiceClient?.map(t => t.id) || [])
          }
        } catch (serviceError) {
          console.error('⚠️ [SIGNATURE] Service client auto-complete error:', serviceError)
        }
      } else {
        console.log('✅ [SIGNATURE] Tasks auto-completed:', relatedTasks.map(t => t.title))
      }
    } else {
      console.log('ℹ️ [SIGNATURE] No pending tasks found for this signature request')
    }

    const updatedSignatureRequest = {
      ...signatureRequest,
      status: 'signed',
      signed_pdf_path: signedPdfPath,
      signed_pdf_size: signedPdfBytes.length,
    } as SignatureRequestRecord

    await maybeReleaseDeferredInvestorRequests(
      updatedSignatureRequest,
      supabase,
      createSignatureRequest
    )

    // IMMEDIATELY update document file_key so signature is visible when viewing
    // This ensures users can see signatures before ALL signatories have signed
    if (signatureRequest.document_id) {
      console.log('📄 [SIGNATURE] Updating document to show signature immediately')

      // Get current signature status for this document
      const { data: docSignatures } = await supabase
        .from('signature_requests')
        .select('id, status, signer_role')
        .eq('document_id', signatureRequest.document_id)

      const totalSigs = docSignatures?.length || 1
      const signedSigs = docSignatures?.filter(s => s.status === 'signed').length || 1
      let allComplete = totalSigs === signedSigs

      const { data: documentState } = await supabase
        .from('documents')
        .select('signature_workflow_config')
        .eq('id', signatureRequest.document_id)
        .maybeSingle()

      const inspection = inspectSubscriptionSignatureWorkflowConfig(documentState?.signature_workflow_config)
      if (inspection.hasInternalFirstMode) {
        const existingInvestorCount = docSignatures?.filter((signature) =>
          signature.signer_role === 'investor' || signature.signer_role === 'authorized_signatory'
        ).length || 0

        allComplete = !inspection.hasInvalidInvestorSigners &&
          existingInvestorCount >= inspection.expectedInvestorSignerCount &&
          totalSigs === signedSigs
      }

      // CRITICAL: Copy signed PDF from 'signatures' bucket to 'deal-documents' bucket
      // The document download API expects files in 'deal-documents', not 'signatures'
      console.log('📦 [SIGNATURE] Copying signed PDF to deal-documents bucket')

      const signaturesBucket = process.env.SIGNATURES_BUCKET || 'signatures'
      const documentsBucket = 'deal-documents'

      // Download from signatures bucket
      const { data: signedPdfData, error: downloadError } = await supabase.storage
        .from(signaturesBucket)
        .download(signedPdfPath)

      if (downloadError || !signedPdfData) {
        console.error('⚠️ [SIGNATURE] Failed to download signed PDF for copy:', downloadError)
      } else {
        // Upload to deal-documents bucket with same path
        const { error: uploadError } = await supabase.storage
          .from(documentsBucket)
          .upload(signedPdfPath, signedPdfData, {
            contentType: 'application/pdf',
            upsert: true  // Overwrite if exists (progressive signing)
          })

        if (uploadError) {
          console.error('⚠️ [SIGNATURE] Failed to copy signed PDF to deal-documents:', uploadError)
        } else {
          console.log(`✅ [SIGNATURE] Signed PDF copied to ${documentsBucket}/${signedPdfPath}`)
        }
      }

      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({
          file_key: signedPdfPath,  // Point to latest signed PDF (now in deal-documents)
          file_size_bytes: signedPdfBytes.length,
          status: allComplete ? 'published' : 'pending_signature',
          signature_status: allComplete ? 'complete' : 'partial',
          updated_at: new Date().toISOString()
        })
        .eq('id', signatureRequest.document_id)

      if (docUpdateError) {
        console.error('⚠️ [SIGNATURE] Failed to update document file_key:', docUpdateError)
      } else {
        console.log(`✅ [SIGNATURE] Document updated - ${signedSigs}/${totalSigs} signatures, file_key now points to signed PDF`)
      }
    }

    // If this is a subscription pack, commit once ALL investor signers have signed
    await checkAndCommitSubscriptionIfInvestorComplete(
      updatedSignatureRequest,
      supabase
    )

    // Check if all signatures for this document/workflow are complete
    console.log('🔍 [SIGNATURE] Checking if all signatures are complete')
    await checkAndCompleteSignatures(
      updatedSignatureRequest,
      signedPdfPath,
      signedPdfBytes,
      supabase
    )

    // Release workflow lock
    if (lockAcquired && signatureRequest.workflow_run_id) {
      console.log('🔓 [SIGNATURE] Releasing workflow lock')
      await supabase
        .from('workflow_runs')
        .update({
          signing_in_progress: null,
          signing_locked_by: null,
          signing_locked_at: null
        })
        .eq('id', signatureRequest.workflow_run_id)
        .eq('signing_locked_by', signatureRequest.id)  // Only release if we own the lock
    }

    console.log('✅ [SIGNATURE] submitSignature() completed successfully\n')
    return {
      success: true,
      message: 'Signature submitted successfully',
      signed_pdf_path: signedPdfPath
    }
  } catch (error) {
    console.error('Signature submit error:', error)

    // Release workflow lock on error
    if (lockAcquired && signatureRequest?.workflow_run_id) {
      console.log('🔓 [SIGNATURE] Releasing workflow lock (error path)')
      await supabase
        .from('workflow_runs')
        .update({
          signing_in_progress: null,
          signing_locked_by: null,
          signing_locked_at: null
        })
        .eq('id', signatureRequest.workflow_run_id)
        .eq('signing_locked_by', signatureRequest.id)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Commit subscription once all investor signatories have signed.
 * This runs after EVERY signature and is idempotent.
 */
async function checkAndCommitSubscriptionIfInvestorComplete(
  signatureRequest: SignatureRequestRecord,
  supabase: SupabaseClient
): Promise<void> {
  if (signatureRequest.document_type !== 'subscription') {
    return
  }

  const subscriptionId = signatureRequest.subscription_id || null
  let resolvedSubscriptionId = subscriptionId

  if (!resolvedSubscriptionId) {
    const documentLookupId = signatureRequest.document_id || signatureRequest.workflow_run_id || null

    if (!documentLookupId) {
      console.warn('⚠️ [SIGNATURE] No subscription_id or document_id for subscription commit check')
      return
    }

    const { data: document } = await supabase
      .from('documents')
      .select('id, subscription_id')
      .eq('id', documentLookupId)
      .single()

    resolvedSubscriptionId = document?.subscription_id || null
  }

  if (!resolvedSubscriptionId) {
    console.warn('⚠️ [SIGNATURE] Unable to resolve subscription_id for commit check')
    return
  }

  const investorRoles = ['investor', 'authorized_signatory']
  const { data: investorSignatures, error: signaturesError } = await supabase
    .from('signature_requests')
    .select('id, status, signer_role')
    .eq('subscription_id', resolvedSubscriptionId)
    .eq('document_type', 'subscription')
    .in('signer_role', investorRoles)

  if (signaturesError) {
    console.error('❌ [SIGNATURE] Failed to fetch investor signatures for commit check:', signaturesError)
    return
  }

  if (!investorSignatures || investorSignatures.length === 0) {
    console.warn('⚠️ [SIGNATURE] No investor signatures found for subscription commit check')
    return
  }

  const allInvestorsSigned = investorSignatures.every(sig => sig.status === 'signed')
  if (!allInvestorsSigned) {
    console.log('⏳ [SIGNATURE] Not all investor signers have signed - skipping commit')
    return
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select(`
      id,
      status,
      commitment,
      currency,
      committed_at,
      signed_at,
      investor_id,
      vehicle_id,
      deal_id,
      fee_plan_id,
      investor:investors(
        id,
        legal_name,
        display_name,
        email,
        investor_users(user_id)
      ),
      vehicle:vehicles(id, name),
      deal:deals(id, name)
    `)
    .eq('id', resolvedSubscriptionId)
    .single()

  if (subscriptionError || !subscription) {
    console.error('❌ [SIGNATURE] Failed to fetch subscription for commit:', subscriptionError)
    return
  }

  const committedStatuses = ['committed', 'active', 'partially_funded', 'funded']
  const blockedStatuses = ['cancelled', 'closed']
  const commitEligibleStatuses = ['pending', 'draft', 'pending_signature']

  if (committedStatuses.includes(subscription.status)) {
    console.log('ℹ️ [SIGNATURE] Subscription already committed - skipping commit step')
    return
  }

  if (blockedStatuses.includes(subscription.status)) {
    console.warn(`⚠️ [SIGNATURE] Subscription ${resolvedSubscriptionId} is ${subscription.status} - skipping commit`)
    return
  }

  if (!commitEligibleStatuses.includes(subscription.status)) {
    console.warn(`⚠️ [SIGNATURE] Subscription ${resolvedSubscriptionId} has status '${subscription.status}' - skipping commit`)
    return
  }

  const now = new Date().toISOString()
  const contractDate = now.split('T')[0]
  const documentId = signatureRequest.document_id || signatureRequest.workflow_run_id || null

  const updatePayload: Record<string, string> = {
    status: 'committed',
    committed_at: now,
    signed_at: now,
    contract_date: contractDate,
    acknowledgement_notes: 'Subscription agreement signed by investor(s). Countersignature pending.'
  }

  if (documentId) {
    updatePayload.signed_doc_id = documentId
  }

  const { data: updatedSubscription, error: updateError } = await supabase
    .from('subscriptions')
    .update(updatePayload)
    .eq('id', resolvedSubscriptionId)
    .eq('status', subscription.status)
    .select()
    .single()

  if (!updatedSubscription && !updateError) {
    console.warn('⚠️ [SIGNATURE] Commit update skipped due to status change (race condition)')
    return
  }

  if (updateError) {
    console.error('❌ [SIGNATURE] Failed to commit subscription:', updateError)
    return
  }

  console.log('✅ [SIGNATURE] Subscription committed after investor signatures:', {
    subscription_id: resolvedSubscriptionId,
    previous_status: subscription.status,
    new_status: 'committed'
  })

  // Create fee events for committed subscription
  try {
    const { data: existingFeeEvents } = await supabase
      .from('fee_events')
      .select('id, fee_type, status, computed_amount')
      .eq('allocation_id', resolvedSubscriptionId)
      .in('status', ['accrued', 'invoiced', 'paid'])

    if (existingFeeEvents && existingFeeEvents.length > 0) {
      console.log('✅ [SIGNATURE] Fee events already exist, skipping creation:', {
        count: existingFeeEvents.length,
        types: existingFeeEvents.map((fe: { fee_type: string }) => fe.fee_type).join(', ')
      })
    } else {
      const feeCalcResult = await calculateSubscriptionFeeEvents(supabase, resolvedSubscriptionId)

      if (!feeCalcResult.success || !feeCalcResult.feeEvents || feeCalcResult.feeEvents.length === 0) {
        console.warn('⚠️ [SIGNATURE] No fee events calculated:', feeCalcResult.error)
      } else {
        const createResult = await createFeeEvents(
          supabase,
          resolvedSubscriptionId,
          subscription.investor_id,
          subscription.deal_id || null,
          subscription.fee_plan_id || null,
          feeCalcResult.feeEvents
        )

        if (createResult.success) {
          console.log('✅ [SIGNATURE] Fee events created:', {
            count: createResult.feeEventIds?.length,
            ids: createResult.feeEventIds
          })
        } else {
          console.error('❌ [SIGNATURE] Failed to create fee events:', createResult.error)
        }
      }
    }
  } catch (feeError) {
    console.error('❌ [SIGNATURE] Error creating fee events:', feeError)
  }

  // Complete investor signature task (subscription_pack_signature)
  const { data: investorTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('owner_investor_id', subscription.investor_id)
    .eq('kind', 'subscription_pack_signature')
    .eq('related_entity_id', resolvedSubscriptionId)
    .in('status', ['pending', 'in_progress'])

  if (investorTasks && investorTasks.length > 0) {
    for (const task of investorTasks) {
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: now,
          completion_notes: 'Subscription agreement signed by investor(s). Countersignature pending.'
        })
        .eq('id', task.id)

      if (taskError) {
        console.error('❌ [SIGNATURE] Failed to complete investor task:', task.id, taskError)
      } else {
        console.log('✅ [SIGNATURE] Investor signature task completed:', task.id)
      }
    }
  }

  // Audit log entry for commitment
  await supabase.from('audit_logs').insert({
    event_type: 'subscription',
    action: 'subscription_committed',
    entity_type: 'subscription',
    entity_id: resolvedSubscriptionId,
    actor_id: null,
    action_details: {
      description: 'Subscription agreement signed by investor(s) and status changed to committed',
      subscription_id: resolvedSubscriptionId,
      investor_id: subscription.investor_id,
      vehicle_id: subscription.vehicle_id,
      commitment: subscription.commitment,
      document_id: documentId,
      previous_status: subscription.status,
      new_status: 'committed'
    },
    timestamp: now
  })

  // Analytics event for commitment
  if (subscription.deal_id) {
    try {
      await supabase.from('deal_activity_events').insert({
        deal_id: subscription.deal_id,
        investor_id: subscription.investor_id,
        event_type: 'subscription_completed',
        payload: {
          subscription_id: resolvedSubscriptionId,
          signature_request_id: signatureRequest.id,
          commitment: subscription.commitment,
          currency: subscription.currency,
          document_id: documentId,
          vehicle_id: subscription.vehicle_id
        }
      })
      console.log('✅ [SIGNATURE] Analytics event logged: subscription_completed')
    } catch (eventError) {
      console.error('❌ [SIGNATURE] Failed to log analytics event:', eventError)
    }
  }
}

/**
 * Check if all signatures are complete and execute post-signature handler
 *
 * This function handles BOTH n8n-generated documents (with workflow_run_id)
 * and manually uploaded documents (with document_id)
 */
async function checkAndCompleteSignatures(
  signatureRequest: SignatureRequestRecord,
  signedPdfPath: string,
  signedPdfBytes: Uint8Array,
  supabase: SupabaseClient
): Promise<void> {
  try {
    let allSignatureRequests
    let fetchAllError
    let groupingType: 'workflow' | 'document' | 'unknown' = 'unknown'

    // Determine how to group signature requests
    if (signatureRequest.workflow_run_id) {
      // n8n-generated documents: group by workflow_run_id
      groupingType = 'workflow'
      console.log('🔍 [SIGNATURE] Grouping by workflow_run_id:', signatureRequest.workflow_run_id)

      const result = await supabase
        .from('signature_requests')
        .select('id, status, signer_role, signed_pdf_path')
        .eq('workflow_run_id', signatureRequest.workflow_run_id)
        .order('created_at', { ascending: true })

      allSignatureRequests = result.data
      fetchAllError = result.error
    } else if (signatureRequest.document_id) {
      // Manually uploaded documents: group by document_id
      groupingType = 'document'
      console.log('🔍 [SIGNATURE] Grouping by document_id:', signatureRequest.document_id)

      const result = await supabase
        .from('signature_requests')
        .select('id, status, signer_role, signed_pdf_path')
        .eq('document_id', signatureRequest.document_id)
        .order('created_at', { ascending: true })

      allSignatureRequests = result.data
      fetchAllError = result.error
    } else if (signatureRequest.introducer_agreement_id) {
      // Introducer agreements: group by introducer_agreement_id
      groupingType = 'introducer_agreement' as any
      console.log('🔍 [SIGNATURE] Grouping by introducer_agreement_id:', signatureRequest.introducer_agreement_id)

      const result = await supabase
        .from('signature_requests')
        .select('id, status, signer_role, signed_pdf_path')
        .eq('introducer_agreement_id', signatureRequest.introducer_agreement_id)
        .order('created_at', { ascending: true })

      allSignatureRequests = result.data
      fetchAllError = result.error
    } else {
      console.error('❌ [SIGNATURE] Cannot determine signature grouping - no workflow_run_id, document_id, or introducer_agreement_id')
      return
    }

    if (fetchAllError || !allSignatureRequests) {
      console.error('❌ [SIGNATURE] Failed to fetch all signature requests:', fetchAllError)
      return
    }

    console.log('📊 [SIGNATURE] Found signature requests:', {
      total: allSignatureRequests.length,
      signed: allSignatureRequests.filter(req => req.status === 'signed').length,
      pending: allSignatureRequests.filter(req => req.status === 'pending').length,
      grouping_type: groupingType
    })

    const shouldDelayCompletion = await shouldDelayFinalSignatureCompletion(
      signatureRequest,
      allSignatureRequests,
      supabase
    )

    if (shouldDelayCompletion) {
      console.log('⏳ [SIGNATURE] Waiting for staged investor signature requests to be released before final completion')
      return
    }

    const allSigned = allSignatureRequests.every((req) => req.status === 'signed')

    if (!allSigned) {
      console.log('⏳ [SIGNATURE] Not all signatures complete yet - waiting for remaining signatures')
      return
    }

    // All signatures collected!
    console.log('🎉 [SIGNATURE] All signatures collected!')

    const signedPaths = allSignatureRequests
      .filter((req) => req.signed_pdf_path)
      .reduce(
        (acc, req) => {
          acc[req.signer_role] = req.signed_pdf_path
          return acc
        },
        {} as Record<string, string>
      )

    // Update workflow_runs table if this is an n8n workflow
    if (groupingType === 'workflow' && signatureRequest.workflow_run_id) {
      console.log('📝 [SIGNATURE] Marking workflow as complete')
      await supabase
        .from('workflow_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          output_data: {
            all_signed: true,
            signed_pdf_paths: signedPaths,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', signatureRequest.workflow_run_id)

      console.log('✅ [SIGNATURE] Workflow marked complete:', {
        workflow_run_id: signatureRequest.workflow_run_id,
        signed_paths: signedPaths
      })
    } else {
      console.log('ℹ️ [SIGNATURE] No workflow to mark complete (manual upload)')
    }

    // Execute post-signature handler based on document_type
    console.log('🚀 [SIGNATURE] Executing post-signature handler for document_type:', signatureRequest.document_type)
    try {
      await routeSignatureHandler({
        signatureRequest,
        signedPdfPath,
        signedPdfBytes,
        supabase
      })

      console.log('✅ [SIGNATURE] Post-signature handler completed successfully')
    } catch (handlerError) {
      console.error('❌ [SIGNATURE] Post-signature handler failed:', handlerError)
      console.error('❌ [SIGNATURE] Handler error details:', handlerError instanceof Error ? handlerError.message : 'Unknown error')
      // Don't fail the signature submission if handler fails
    }
  } catch (error) {
    console.error('❌ [SIGNATURE] Error checking signature completion:', error)
  }
}

/**
 * Fetch PDF bytes from storage for a given document
 *
 * This helper retrieves the PDF file associated with a document record,
 * which is needed for anchor detection during signature request creation.
 *
 * @param documentId - The document UUID
 * @param supabase - Supabase client instance
 * @returns PDF bytes as Uint8Array, or null if not found
 */
async function fetchDocumentPdf(
  documentId: string,
  supabase: SupabaseClient
): Promise<Uint8Array | null> {
  try {
    // Get document record to find storage path
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('file_key')
      .eq('id', documentId)
      .single()

    if (docError || !doc) {
      console.warn('⚠️ [SIGNATURE] Document not found:', documentId, docError?.message)
      return null
    }

    // Use file_key for storage path
    const storagePath = doc.file_key
    if (!storagePath) {
      console.warn('⚠️ [SIGNATURE] No file_key found for document:', documentId)
      return null
    }

    console.log('📥 [SIGNATURE] Downloading PDF from:', storagePath)

    // Download from deal-documents bucket (where subscription packs are stored)
    const { data, error } = await supabase.storage
      .from('deal-documents')
      .download(storagePath)

    if (error || !data) {
      console.warn('⚠️ [SIGNATURE] Failed to download PDF:', error?.message)
      return null
    }

    const buffer = await data.arrayBuffer()
    console.log('✅ [SIGNATURE] PDF downloaded:', buffer.byteLength, 'bytes')
    return new Uint8Array(buffer)
  } catch (error) {
    console.error('❌ [SIGNATURE] Error fetching document PDF:', error)
    return null
  }
}
