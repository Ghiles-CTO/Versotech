/**
 * Certificate Trigger Utility
 * Triggers certificate generation when subscription becomes active
 *
 * COMPREHENSIVE PAYLOAD: Sends ALL data n8n needs to generate the certificate
 * without requiring n8n to query the database.
 */

import { triggerWorkflow } from '@/lib/trigger-workflow'
import { convertHtmlToPdf } from '@/lib/gotenberg/convert'
import { SupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'

interface TriggerCertificateParams {
  supabase: SupabaseClient
  subscriptionId: string
  investorId: string
  vehicleId: string
  commitment: number
  fundedAmount: number
  shares?: number | null
  pricePerShare?: number | null
  profile: {
    id: string
    email?: string | null
    display_name?: string | null
    role?: string | null
    title?: string | null
  }
}

/**
 * Format date as "Month Day, Year" (e.g., "December 16, 2025")
 */
function formatCertificateDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Derive investor display name based on type
 * - Entity: use legal_name
 * - Individual: use "First Last" format
 */
function getInvestorDisplayName(investor: {
  type: string | null
  legal_name: string | null
  first_name: string | null
  last_name: string | null
}): string {
  if (investor.type === 'individual') {
    const firstName = investor.first_name?.trim() || ''
    const lastName = investor.last_name?.trim() || ''
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }
  }
  return investor.legal_name || 'Unknown Investor'
}

/**
 * Triggers certificate generation for a newly activated subscription
 * This is a fire-and-forget operation - failures are logged but don't block the caller
 *
 * IDEMPOTENCY: Will skip if subscription already has activated_at set
 */
export async function triggerCertificateGeneration({
  supabase,
  subscriptionId,
  investorId,
  vehicleId,
  commitment,
  fundedAmount,
  shares,
  pricePerShare,
  profile
}: TriggerCertificateParams): Promise<void> {
  try {
    // IDEMPOTENCY CHECK: Fetch subscription with all related data needed for certificate
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        status,
        activated_at,
        subscription_number,
        units,
        num_shares,
        deal_id,
        investor:investors!subscriptions_investor_id_fkey (
          id,
          legal_name,
          type,
          first_name,
          last_name
        ),
        vehicle:vehicles!subscriptions_vehicle_id_fkey (
          id,
          name,
          series_number,
          registration_number,
          logo_url,
          address
        ),
        deal:deals!subscriptions_deal_id_fkey (
          id,
          name,
          company_name,
          close_at,
          vehicle_id
        )
      `)
      .eq('id', subscriptionId)
      .single()

    if (fetchError || !subscription) {
      console.error(`❌ Subscription ${subscriptionId} not found:`, fetchError)
      return
    }

    // IDEMPOTENCY: Check if certificate already exists for this subscription
    // This prevents duplicate certificate generation on retry/re-run
    const { data: existingCert } = await supabase
      .from('documents')
      .select('id')
      .eq('subscription_id', subscriptionId)
      .eq('type', 'certificate')
      .limit(1)
      .maybeSingle()

    if (existingCert) {
      console.log(`ℹ️ Certificate already exists for subscription ${subscriptionId} (doc: ${existingCert.id}), skipping`)
      return
    }

    // Verify subscription status is 'active' or 'funded' (funded when called during activation)
    if (!['active', 'funded'].includes(subscription.status)) {
      console.warn(`⚠️ Cannot trigger certificate for subscription ${subscriptionId} - status is '${subscription.status}', expected 'active' or 'funded'`)
      return
    }

    // Get vehicle data - prefer subscription.vehicle, fall back to deal.vehicle
    // Type assertions needed due to Supabase query type inference treating joins as arrays
    type VehicleType = { id: string; name: string; series_number: string; registration_number: string; logo_url: string | null; address: string | null }
    let vehicleData = subscription.vehicle as unknown as VehicleType | null
    const dealData = subscription.deal as unknown as { id: string; name: string; company_name: string; close_at: string; vehicle_id: string } | null
    if (!vehicleData && dealData?.vehicle_id) {
      const { data: dealVehicle } = await supabase
        .from('vehicles')
        .select('id, name, series_number, registration_number, logo_url, address')
        .eq('id', dealData.vehicle_id)
        .single()
      vehicleData = dealVehicle as VehicleType | null
    }

    if (!vehicleData) {
      console.error(`❌ No vehicle found for subscription ${subscriptionId}`)
      return
    }

    // Fetch deal fee structure for product description (the "structure" field)
    // Also fetch termsheet completion_date for the certificate date
    let productDescription = ''
    let termsheetCompletionDate: Date | null = null

    if (subscription.deal_id) {
      // First, try to get the termsheet linked to this subscription via deal_memberships
      const { data: membership } = await supabase
        .from('deal_memberships')
        .select('term_sheet_id')
        .eq('deal_id', subscription.deal_id)
        .eq('investor_id', investorId)
        .maybeSingle()

      if (membership?.term_sheet_id) {
        // Get the termsheet's completion_date and structure
        const { data: termsheet } = await supabase
          .from('deal_fee_structures')
          .select('structure, completion_date')
          .eq('id', membership.term_sheet_id)
          .single()

        if (termsheet) {
          if (termsheet.structure) {
            productDescription = termsheet.structure
          }
          if (termsheet.completion_date) {
            termsheetCompletionDate = new Date(termsheet.completion_date)
          }
        }
      }

      // Fallback: if no termsheet found, get any published fee structure
      if (!productDescription) {
        const { data: feeStructure } = await supabase
          .from('deal_fee_structures')
          .select('structure, completion_date')
          .eq('deal_id', subscription.deal_id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (feeStructure?.structure) {
          productDescription = feeStructure.structure
        }
        if (!termsheetCompletionDate && feeStructure?.completion_date) {
          termsheetCompletionDate = new Date(feeStructure.completion_date)
        }
      }
    }

    // NOTE: activated_at is set by the caller (handleTermsheetClose/handleDealClose)
    // We no longer set it here to avoid the race condition where we'd skip certificate
    // generation because activated_at was already set by our own caller.

    // Build investor display name based on type
    // Type assertion needed due to Supabase query type inference
    type InvestorType = { type: string | null; legal_name: string | null; first_name: string | null; last_name: string | null }
    const investorData = subscription.investor as unknown as InvestorType | null
    const investorName = investorData
      ? getInvestorDisplayName(investorData)
      : 'Unknown Investor'

    // Get certificate date: prefer termsheet completion_date, fall back to deal close_at, then today
    const certificateDate = termsheetCompletionDate
      || (dealData?.close_at ? new Date(dealData.close_at) : new Date())

    // Determine logo type: VERSO Capital 2 uses text "VERSO" in League Spartan font
    const isVersoCapital2 = vehicleData.name?.toLowerCase().includes('verso capital 2') || false

    // Build comprehensive certificate payload
    const certificatePayload = {
      // === LOGO DATA ===
      // VERSO Capital 2 uses "VERSO" text in League Spartan font, others use logo image
      logo_type: isVersoCapital2 ? 'text' : 'image',
      logo_text: isVersoCapital2 ? 'VERSO' : '',
      logo_font: 'League Spartan',
      vehicle_logo_url: !isVersoCapital2 ? (vehicleData.logo_url || '') : '',

      // === CERTIFICATE NUMBER (format: VC{series_number}SH{subscription_number}) ===
      series_number: vehicleData.series_number || '',
      subscription_number: subscription.subscription_number || '',

      // === UNITS/CERTIFICATES ===
      units: subscription.units || subscription.num_shares || shares || 0,

      // === DATE (TERMSHEET COMPLETION DATE - formatted as "Month Day, Year") ===
      close_at: formatCertificateDate(certificateDate),

      // === ISSUER SECTION DATA ===
      vehicle_name: vehicleData.name || '',
      company_name: dealData?.company_name || dealData?.name || '',
      vehicle_registration_number: vehicleData.registration_number || '',

      // === CERTIFICATION TEXT DATA ===
      investor_name: investorName,
      num_shares: subscription.num_shares || shares || 0,
      structure: productDescription, // e.g., "Shares of Series B Preferred Stock of X.AI"

      // === SIGNATURE TABLE DATA (NO SIGNATURE IMAGES - handled via VERSOSign) ===
      vehicle_address: vehicleData.address || '',

      // Signatory names/titles for the signature blocks (images added later via VERSOSign)
      // Signatory 1 (LEFT) = CEO, signs first
      signatory_1_name: 'Mr Julien Machot',
      signatory_1_title: 'Managing Partner',
      signatory_1_signature_url: '', // EMPTY - signatures added via VERSOSign

      // Signatory 2 (RIGHT) = Second authorized signatory, signs after CEO
      signatory_2_name: 'G.A. Giles', // For testing - will be lawyer in production
      signatory_2_title: 'Authorized Signatory',
      signatory_2_signature_url: '', // EMPTY - signatures added via VERSOSign

      // === METADATA (useful for n8n workflow) ===
      subscription_id: subscriptionId,
      investor_id: investorId,
      vehicle_id: vehicleId,
      deal_id: subscription.deal_id || '',
      commitment_amount: commitment,
      funded_amount: fundedAmount,
      price_per_share: pricePerShare || null,
      certificate_date: certificateDate.toISOString().split('T')[0],
      include_watermark: false // Activated subscriptions get clean certificates
    }

    console.log('📜 Triggering Certificate Generation:', {
      subscription_id: subscriptionId,
      investor: investorName,
      certificate_number: `VC${vehicleData.series_number}SH${subscription.subscription_number}`,
      units: certificatePayload.units,
      logo_type: certificatePayload.logo_type,
      close_at: certificatePayload.close_at,
      vehicle_name: certificatePayload.vehicle_name,
      company_name: certificatePayload.company_name
    })

    // Trigger certificate generation workflow
    const result = await triggerWorkflow({
      workflowKey: 'generate-investment-certificate',
      payload: certificatePayload,
      entityType: 'subscription',
      entityId: subscriptionId,
      user: {
        id: profile.id,
        email: profile.email || '',
        displayName: profile.display_name || undefined,
        role: profile.role || 'staff_admin',
        title: profile.title || undefined
      }
    })

    if (!result.success) {
      console.warn(`⚠️ Certificate workflow not configured: ${result.error}`)
    } else {
      console.log(`✅ Certificate generation triggered for subscription ${subscriptionId}`)

      // === HANDLE PDF RESPONSE FROM N8N ===
      // Same pattern as introducer agreement (generate-agreement/route.ts)
      if (result.n8n_response) {
        try {
          const n8nResponse = result.n8n_response
          console.log('📦 n8n certificate response keys:', Object.keys(n8nResponse))

          // Extract PDF buffer from various response formats
          let pdfBuffer: Buffer | null = null

          if (n8nResponse.binary && Buffer.isBuffer(n8nResponse.binary)) {
            // Direct buffer from trigger-workflow.ts binary handling (Content-Type: application/pdf)
            pdfBuffer = n8nResponse.binary
            console.log('📄 Found PDF in binary format (direct buffer)')
          } else if (n8nResponse.data) {
            // n8n "data" field - could be Buffer, base64 string, or raw binary string
            if (Buffer.isBuffer(n8nResponse.data)) {
              // Direct Buffer
              pdfBuffer = n8nResponse.data
              console.log('📄 Found PDF in data (Buffer) format')
            } else if (typeof n8nResponse.data === 'string') {
              // String - check if it's raw PDF or base64
              if (n8nResponse.data.startsWith('%PDF')) {
                // Raw PDF binary as string (latin1 encoding)
                pdfBuffer = Buffer.from(n8nResponse.data, 'latin1')
                console.log('📄 Found PDF in data (raw binary string) format')
              } else {
                // Assume base64-encoded
                pdfBuffer = Buffer.from(n8nResponse.data, 'base64')
                console.log('📄 Found PDF in data (base64) format')
              }
            }
          } else if (n8nResponse.raw && typeof n8nResponse.raw === 'string') {
            // Latin1-encoded string (when Content-Type not set correctly)
            pdfBuffer = Buffer.from(n8nResponse.raw, 'latin1')
            console.log('📄 Found PDF in raw (latin1) format')
          } else if (typeof n8nResponse === 'string') {
            // Direct string response
            pdfBuffer = Buffer.from(n8nResponse, 'latin1')
            console.log('📄 Found PDF as direct string')
          } else if (n8nResponse.html && typeof n8nResponse.html === 'string') {
            // n8n returned HTML instead of PDF - convert locally using Gotenberg
            console.log('📄 n8n returned HTML, converting to PDF via portal Gotenberg...')
            const conversionResult = await convertHtmlToPdf(n8nResponse.html, 'certificate.html')
            if (conversionResult.success && conversionResult.pdfBuffer) {
              pdfBuffer = conversionResult.pdfBuffer
              console.log('✅ HTML converted to PDF via portal Gotenberg')
            } else {
              console.error('❌ Portal Gotenberg conversion failed:', conversionResult.error)
            }
          }

          if (pdfBuffer && pdfBuffer.length > 0) {
            // Verify PDF signature (PDF files start with %PDF)
            const signature = pdfBuffer.slice(0, 4).toString()
            console.log('📄 File signature:', signature, 'size:', pdfBuffer.length, 'bytes')

            if (signature !== '%PDF') {
              console.warn('⚠️ File does not appear to be a valid PDF (signature:', signature, ')')
            }

            // === NAMING PATTERN: VCXXXSHXXX - LASTNAME FIRSTNAME or ENTITY NAME ===
            // Format investor name based on type
            let formattedInvestorName: string
            if (investorData?.type === 'individual') {
              // For individuals: LASTNAME FIRSTNAME (uppercase)
              const lastName = (investorData.last_name || '').trim().toUpperCase()
              const firstName = (investorData.first_name || '').trim().toUpperCase()
              formattedInvestorName = `${lastName} ${firstName}`.trim() || 'UNKNOWN'
            } else {
              // For entities: ENTITY NAME (uppercase)
              formattedInvestorName = (investorData?.legal_name || 'UNKNOWN').toUpperCase()
            }
            // Sanitize for filename
            const safeInvestorName = formattedInvestorName
              .replace(/[^a-zA-Z0-9 ]/g, '')
              .substring(0, 50)
            const certificateNumber = `VC${vehicleData.series_number}SH${subscription.subscription_number}`
            const fileName = `${certificateNumber} - ${safeInvestorName}.pdf`

            // === STORAGE: subscriptions/{id}/certificates/{filename}.pdf ===
            const fileKey = `subscriptions/${subscriptionId}/certificates/${fileName}`
            const { error: uploadError } = await supabase.storage
              .from('deal-documents')
              .upload(fileKey, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
              })

            if (uploadError) {
              console.error('❌ Failed to upload certificate PDF:', uploadError)
            } else {
              console.log('✅ Certificate PDF uploaded:', fileKey)

              // === CREATE DOCUMENT RECORD ===
              // Find Subscription Documents folder for this vehicle
              let subscriptionFolderId: string | null = null
              if (vehicleId) {
                const { data: subFolder } = await supabase
                  .from('document_folders')
                  .select('id')
                  .eq('vehicle_id', vehicleId)
                  .eq('name', 'Subscription Documents')
                  .single()
                subscriptionFolderId = subFolder?.id || null
              }

              // Create document record with status 'pending_signature'
              const { data: document, error: docError } = await supabase
                .from('documents')
                .insert({
                  subscription_id: subscriptionId,
                  deal_id: subscription.deal_id,
                  vehicle_id: vehicleId,
                  folder_id: subscriptionFolderId,
                  type: 'certificate',
                  name: fileName,
                  file_key: fileKey,
                  mime_type: 'application/pdf',
                  file_size_bytes: pdfBuffer.length,
                  status: 'pending_signature', // Hidden from investor until signed
                  current_version: 1,
                  ready_for_signature: true,
                  created_by: profile.id
                })
                .select('id')
                .single()

              if (docError) {
                console.error('❌ Failed to create document record:', docError)
              } else {
                console.log('✅ Document record created:', document.id)

                // Mark workflow as completed now that document is stored
                if (result?.workflow_run_id) {
                  await supabase.from('workflow_runs').update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    result_doc_id: document.id
                  }).eq('id', result.workflow_run_id)
                  console.log('✅ Workflow run marked as completed')
                }

                // Update subscription with certificate path and document ID
                await supabase
                  .from('subscriptions')
                  .update({ certificate_pdf_path: fileKey })
                  .eq('id', subscriptionId)

                // === CREATE SIGNATURE WORKFLOW ===
                // Signature order: CEO signs FIRST (party_a, left), Second signatory signs SECOND (party_b, right)

                // Get CEO signer (signs FIRST - party_a, left position on certificate)
                const { data: ceoProfile } = await supabase
                  .from('profiles')
                  .select('id, email, display_name')
                  .eq('role', 'ceo')
                  .limit(1)
                  .single()

                const ceoSigner = ceoProfile ? {
                  user_id: ceoProfile.id,
                  email: ceoProfile.email || '',
                  name: ceoProfile.display_name || 'CEO'
                } : null

                // Get second signatory (signs SECOND - party_b, right position on certificate)
                // For now, use a designated staff member. Later this can be the assigned lawyer.
                let secondSigner: { user_id: string; email: string; name: string } | null = null

                // First try to get assigned lawyer for this deal
                if (subscription.deal_id) {
                  const { data: lawyerAssignment } = await supabase
                    .from('deal_lawyer_assignments')
                    .select(`
                      lawyer:lawyers!deal_lawyer_assignments_lawyer_id_fkey (
                        id,
                        legal_name,
                        email,
                        user_id
                      )
                    `)
                    .eq('deal_id', subscription.deal_id)
                    .limit(1)
                    .maybeSingle()

                  if (lawyerAssignment?.lawyer) {
                    const lawyer = lawyerAssignment.lawyer as unknown as { id: string; legal_name: string; email: string; user_id: string }
                    secondSigner = {
                      user_id: lawyer.user_id,
                      email: lawyer.email,
                      name: lawyer.legal_name
                    }
                  }
                }

                // Fallback: If no lawyer assigned, use G.A. Giles (CTO) as second signatory for testing
                if (!secondSigner) {
                  const { data: fallbackSigner } = await supabase
                    .from('profiles')
                    .select('id, email, display_name')
                    .eq('email', 'cto@versoholdings.com')
                    .single()

                  if (fallbackSigner) {
                    secondSigner = {
                      user_id: fallbackSigner.id,
                      email: fallbackSigner.email || '',
                      name: 'G.A. Giles' // Display name for certificate
                    }
                  }
                }

                // Create signature requests for both signers
                const tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

                // CEO signature (party_a) - signs FIRST (left position on certificate)
                if (ceoSigner) {
                  const ceoToken = crypto.randomBytes(32).toString('hex')
                  const { data: ceoSigRequest, error: ceoSigError } = await supabase
                    .from('signature_requests')
                    .insert({
                      investor_id: investorId,
                      document_id: document.id,
                      subscription_id: subscriptionId,
                      deal_id: subscription.deal_id,
                      document_type: 'certificate',
                      signer_email: ceoSigner.email,
                      signer_name: ceoSigner.name,
                      signer_role: 'ceo',
                      signature_position: 'party_a',
                      signing_token: ceoToken,
                      token_expires_at: tokenExpiry.toISOString(),
                      unsigned_pdf_path: fileKey,
                      unsigned_pdf_size: pdfBuffer.length,
                      status: 'pending',
                      created_by: profile.id
                    })
                    .select('id')
                    .single()

                  if (ceoSigError) {
                    console.error('❌ Failed to create CEO signature request:', ceoSigError)
                  } else {
                    console.log('✅ CEO signature request created (party_a, signs first)')

                    // Create task for CEO in VERSOSign
                    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/versotech_main/versosign?token=${ceoToken}`
                    const { error: ceoTaskError } = await supabase.from('tasks').insert({
                      owner_user_id: ceoSigner.user_id,
                      kind: 'countersignature',
                      category: 'compliance',
                      title: `Sign Certificate: ${investorName}`,
                      description: `Sign equity certificate for ${investorName} - ${dealData?.company_name || 'Investment'}`,
                      status: 'pending',
                      priority: 'high',
                      related_entity_type: 'signature_request',
                      related_entity_id: ceoSigRequest.id,
                      related_deal_id: subscription.deal_id,
                      due_at: tokenExpiry.toISOString(),
                      instructions: {
                        type: 'signature',
                        action_url: signingUrl,
                        signature_request_id: ceoSigRequest.id,
                        document_type: 'certificate',
                        investor_name: investorName,
                        signer_name: ceoSigner.name,
                        signer_role: 'ceo',
                        signature_position: 'party_a',
                        signing_order: 1
                      }
                    })

                    if (ceoTaskError) {
                      console.error('⚠️ Failed to create CEO task:', ceoTaskError)
                    } else {
                      console.log('✅ CEO VERSOSign task created')
                    }
                  }
                } else {
                  console.error('❌ No CEO found in system - this should never happen!')
                }

                // Second signatory (party_b) - signs SECOND (right position on certificate)
                if (secondSigner) {
                  const secondToken = crypto.randomBytes(32).toString('hex')
                  // Allowed signer_role values: investor, admin, lawyer, ceo
                  const signerRole = secondSigner.email.includes('lawyer') || secondSigner.name.toLowerCase().includes('lawyer') ? 'lawyer' : 'admin'
                  const { data: secondSigRequest, error: secondSigError } = await supabase
                    .from('signature_requests')
                    .insert({
                      investor_id: investorId,
                      document_id: document.id,
                      subscription_id: subscriptionId,
                      deal_id: subscription.deal_id,
                      document_type: 'certificate',
                      signer_email: secondSigner.email,
                      signer_name: secondSigner.name,
                      signer_role: signerRole,
                      signature_position: 'party_b',
                      signing_token: secondToken,
                      token_expires_at: tokenExpiry.toISOString(),
                      unsigned_pdf_path: fileKey,
                      unsigned_pdf_size: pdfBuffer.length,
                      status: 'pending',
                      created_by: profile.id
                    })
                    .select('id')
                    .single()

                  if (secondSigError) {
                    console.error('❌ Failed to create second signatory request:', secondSigError)
                  } else {
                    console.log(`✅ Second signatory request created (party_b, ${secondSigner.name})`)

                    // Create task for second signatory in VERSOSign
                    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/versotech_main/versosign?token=${secondToken}`
                    const { error: secondTaskError } = await supabase.from('tasks').insert({
                      owner_user_id: secondSigner.user_id,
                      kind: 'countersignature',
                      category: 'compliance',
                      title: `Sign Certificate: ${investorName}`,
                      description: `Sign equity certificate for ${investorName} - ${dealData?.company_name || 'Investment'}. Awaiting CEO signature first.`,
                      status: 'pending',
                      priority: 'high',
                      related_entity_type: 'signature_request',
                      related_entity_id: secondSigRequest.id,
                      related_deal_id: subscription.deal_id,
                      due_at: tokenExpiry.toISOString(),
                      instructions: {
                        type: 'signature',
                        action_url: signingUrl,
                        signature_request_id: secondSigRequest.id,
                        document_type: 'certificate',
                        investor_name: investorName,
                        signer_name: secondSigner.name,
                        signer_role: signerRole,
                        signature_position: 'party_b',
                        signing_order: 2,
                        requires_prior_signature: 'party_a'
                      }
                    })

                    if (secondTaskError) {
                      console.error('⚠️ Failed to create second signatory task:', secondTaskError)
                    } else {
                      console.log(`✅ Second signatory VERSOSign task created for ${secondSigner.name}`)
                    }
                  }
                } else {
                  console.warn('⚠️ No second signatory found - certificate will have only CEO signature')
                }

                console.log(`📜 Certificate workflow initiated: ${fileName}`)
                console.log(`   - Document ID: ${document.id}`)
                console.log(`   - Status: pending_signature (hidden from investor)`)
                console.log(`   - Awaiting: CEO (party_a) → Second Signatory (party_b) signatures`)
              }
            }
          } else {
            console.warn('⚠️ No binary PDF data found in n8n response')
          }
        } catch (pdfError) {
          console.error('❌ Error processing certificate PDF from n8n:', pdfError)
          // Don't fail - the subscription is activated, PDF can be regenerated
        }
      }
    }

    // Create notification for ALL investor users (not just first one)
    const { data: investorUsers, error: usersError } = await supabase
      .from('investor_users')
      .select('user_id')
      .eq('investor_id', investorId)

    if (usersError) {
      console.error(`❌ Failed to fetch investor users for notification:`, usersError)
    } else if (!investorUsers || investorUsers.length === 0) {
      console.warn(`⚠️ No investor_users found for investor ${investorId} - cannot create notification`)
    } else {
      // Create notifications for all users linked to this investor
      const notifications = investorUsers.map(iu => ({
        user_id: iu.user_id,
        investor_id: investorId,
        type: 'investment_activated',
        title: 'Investment Activated',
        message: 'Your investment is now active. Your equity certificate will be available shortly.',
        link: '/versotech_main/portfolio'
      }))

      const { error: notifError } = await supabase
        .from('investor_notifications')
        .insert(notifications)

      if (notifError) {
        console.error(`❌ Failed to create investor notifications:`, notifError)
      } else {
        console.log(`✅ Created ${notifications.length} notification(s) for investor ${investorId}`)
      }
    }

    // NOTIFY ASSIGNED LAWYERS about certificate issuance
    // First, get the deal_id from the subscription
    const { data: subWithDeal, error: subDealError } = await supabase
      .from('subscriptions')
      .select('deal_id')
      .eq('id', subscriptionId)
      .single()

    if (subDealError || !subWithDeal?.deal_id) {
      console.warn(`⚠️ Could not get deal_id for lawyer notification:`, subDealError)
    } else {
      // Get lawyers assigned to this deal
      const { data: lawyerAssignments, error: assignError } = await supabase
        .from('deal_lawyer_assignments')
        .select('lawyer_id')
        .eq('deal_id', subWithDeal.deal_id)

      if (assignError) {
        console.error(`❌ Failed to fetch lawyer assignments:`, assignError)
      } else if (lawyerAssignments && lawyerAssignments.length > 0) {
        const lawyerIds = lawyerAssignments.map((a: any) => a.lawyer_id)

        // Get lawyer users
        const { data: lawyerUsers, error: lawyerUsersError } = await supabase
          .from('lawyer_users')
          .select('user_id, lawyer_id')
          .in('lawyer_id', lawyerIds)

        if (lawyerUsersError) {
          console.error(`❌ Failed to fetch lawyer users:`, lawyerUsersError)
        } else if (lawyerUsers && lawyerUsers.length > 0) {
          // Get investor name for notification
          const { data: investorForNotif } = await supabase
            .from('investors')
            .select('display_name, legal_name')
            .eq('id', investorId)
            .single()

          const investorNameForNotif = investorForNotif?.display_name || investorForNotif?.legal_name || 'An investor'

          // Create notifications for lawyers
          const lawyerNotifications = lawyerUsers.map((lu: any) => ({
            user_id: lu.user_id,
            investor_id: null,
            type: 'certificate_issued',
            title: 'Certificate Issued',
            message: `Investment certificate issued for ${investorNameForNotif}. The subscription is now fully active.`,
            link: '/versotech_main/subscription-packs'
          }))

          const { error: lawyerNotifError } = await supabase
            .from('investor_notifications')
            .insert(lawyerNotifications)

          if (lawyerNotifError) {
            console.error(`❌ Failed to create lawyer notifications:`, lawyerNotifError)
          } else {
            console.log(`✅ Created ${lawyerNotifications.length} lawyer notification(s) for certificate issuance`)
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Certificate trigger failed for subscription ${subscriptionId}:`, error)
    // Don't throw - this is a non-critical operation
  }
}
