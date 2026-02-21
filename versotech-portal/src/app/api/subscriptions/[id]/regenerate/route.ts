import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { triggerWorkflow } from '@/lib/trigger-workflow'
import { convertDocxToPdf } from '@/lib/gotenberg/convert'
import { getCeoSigner } from '@/lib/staff/ceo-signer'
import { buildSubscriptionPackPayload } from '@/lib/subscription-pack/payload-builder'
import { applySubscriptionPackPageNumbers } from '@/lib/subscription/page-numbering'

const STAFF_ROLES = ['staff_admin', 'staff_ops', 'staff_rm', 'ceo']

/**
 * Generate subscription pack filename with standardized format:
 * {ENTITY_CODE} - SUBSCRIPTION PACK - {INVESTMENT_NAME} - {INVESTOR_NAME} - {DDMMYY}.{extension}
 */
function generateSubscriptionPackFilename(
  entityCode: string,
  investmentName: string,
  investorName: string,
  date: Date,
  format: 'docx' | 'pdf' = 'docx'
): string {
  const day = date.getUTCDate().toString().padStart(2, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const year = date.getUTCFullYear().toString().slice(-2)
  const formattedDate = `${day}${month}${year}`

  const cleanEntityCode = entityCode.trim()
  const cleanInvestmentName = investmentName.trim().replace(/\s+/g, ' ')
  const cleanInvestorName = investorName.trim().replace(/\s+/g, ' ')

  return `${cleanEntityCode} - SUBSCRIPTION PACK - ${cleanInvestmentName} - ${cleanInvestorName} - ${formattedDate}.${format}`
}

/**
 * POST /api/subscriptions/[id]/regenerate
 *
 * Regenerates a subscription pack using the CURRENT values from the subscriptions table.
 * This allows CEO to edit subscription details and regenerate the document with updated values.
 *
 * KEY DIFFERENCE from initial generation:
 * - Initial: Uses submission.payload_json.amount (staging data)
 * - Regenerate: Uses subscription.commitment (source of truth after edits)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subscriptionId } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Parse request body for format selection
    let outputFormat: 'docx' | 'pdf' = 'docx'
    try {
      const body = await request.json()
      if (body.format === 'pdf' || body.format === 'docx') {
        outputFormat = body.format
      }
    } catch {
      // No body or invalid JSON - use default format
    }
    console.log('📄 [REGENERATE] Requested output format:', outputFormat)

    // Check authentication
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name, email')
      .eq('id', authUser.id)
      .single()

    if (!profile || !STAFF_ROLES.includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Build user object for workflow trigger
    const user = {
      id: authUser.id,
      email: authUser.email || profile.email,
      displayName: profile.display_name,
      role: profile.role,
      title: ''
    }

    // Fetch subscription with ALL related data needed for the pack
    const { data: subscription, error: subError } = await serviceSupabase
      .from('subscriptions')
      .select(`
        *,
        investor:investors!subscriptions_investor_id_fkey (
          id,
          legal_name,
          display_name,
          type,
          registered_address,
          entity_identifier,
          id_number,
          id_type,
          residential_street,
          residential_line_2,
          residential_city,
          residential_state,
          residential_postal_code,
          residential_country
        ),
        vehicle:vehicles!subscriptions_vehicle_id_fkey (
          id,
          name,
          series_number,
          series_short_title,
          investment_name,
          entity_code,
          issuer_gp_name,
          issuer_gp_rcc_number,
          issuer_rcc_number,
          issuer_website
        ),
        deal:deals!subscriptions_deal_id_fkey (
          id,
          name,
          company_name,
          company_logo_url,
          currency,
          vehicle_id
        )
      `)
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      console.error('Error fetching subscription:', subError)
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Regeneration requires deal_id (subscription must have come from approval flow)
    if (!subscription.deal_id) {
      return NextResponse.json(
        { error: 'Cannot regenerate: subscription has no associated deal. Only subscriptions created through the approval workflow can be regenerated.' },
        { status: 400 }
      )
    }

    // Validate investor exists
    if (!subscription.investor) {
      return NextResponse.json(
        { error: 'Cannot regenerate: subscription has no associated investor.' },
        { status: 400 }
      )
    }

    // Get vehicle - prefer subscription.vehicle, fall back to deal.vehicle
    let vehicleData = subscription.vehicle
    if (!vehicleData && subscription.deal?.vehicle_id) {
      // Fetch vehicle from deal
      const { data: dealVehicle } = await serviceSupabase
        .from('vehicles')
        .select('id, name, series_number, series_short_title, investment_name, entity_code, issuer_gp_name, issuer_gp_rcc_number, issuer_rcc_number, issuer_website')
        .eq('id', subscription.deal.vehicle_id)
        .single()
      vehicleData = dealVehicle
    }

    if (!vehicleData) {
      return NextResponse.json(
        { error: 'Cannot regenerate: no vehicle found for this subscription.' },
        { status: 400 }
      )
    }

    // Fetch counterparty entity if linked via original submission
    let counterpartyEntity = null
    const { data: originalSubmission } = await serviceSupabase
      .from('deal_subscription_submissions')
      .select('id, subscription_type, counterparty_entity_id, submitted_at')
      .eq('formal_subscription_id', subscriptionId)
      .single()

    if (originalSubmission?.subscription_type === 'entity' && originalSubmission?.counterparty_entity_id) {
      const { data: entityData } = await serviceSupabase
        .from('investor_counterparty')
        .select('*')
        .eq('id', originalSubmission.counterparty_entity_id)
        .single()
      counterpartyEntity = entityData
    }

    // Build signatories array for multi-signatory subscription packs
    // Each signatory includes a 'number' field for template display (1, 2, 3...)
    let signatories: { name: string; title: string; number: number }[] = []
    // Check BOTH: submission type OR investor's actual type (entity/institutional)
    const isEntityInvestor = originalSubmission?.subscription_type === 'entity' ||
                             subscription.investor?.type === 'entity' ||
                             subscription.investor?.type === 'institutional'
    if (isEntityInvestor && subscription.investor_id) {
      // For entity investors: get authorized signatories from investor_members
      const { data: members } = await serviceSupabase
        .from('investor_members')
        .select('id, full_name, email, role_title')
        .eq('investor_id', subscription.investor_id)
        .eq('is_signatory', true)
        .eq('is_active', true)

      if (members && members.length > 0) {
        signatories = members.map((m: { full_name: string | null; role_title: string | null }, index: number) => ({
          name: m.full_name || '',
          title: m.role_title || 'Authorized Signatory',
          number: index + 1
        }))
        console.log(`👥 [REGENERATE] Found ${signatories.length} authorized signatories for entity`)
      } else {
        // Fallback: use entity representative if no signatories marked
        signatories = [{
          name: counterpartyEntity?.representative_name || subscription.investor?.legal_name || '',
          title: counterpartyEntity?.representative_title || 'Authorized Representative',
          number: 1
        }]
        console.warn('[REGENERATE] No signatories marked, using representative fallback')
      }
	    } else {
	      // For individual investors: single signatory
	      signatories = [{
	        name: subscription.investor?.legal_name || '',
	        title: '',
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
	                Name: ${s.name}${s.title ? `<br>Title: ${s.title}` : ''}
	            </div>`).join('')

    // Page 12 - Main Agreement: Subscriber signatures with anchors
    // Increased spacing: margin-bottom 1.5cm, min-height 4cm, margin-top 3cm on signature line
    // This provides ~85pt of space for signature image (50pt) + timestamp (12pt) + name (12pt) + buffer (10pt)
    // Parent div needs position:relative for anchor's position:absolute to work
    const signatoriesSignatureHtml = signatories.map(s => `
	<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">
	    <p><strong>The Subscriber</strong>, represented by Authorized Signatory ${s.number}</p>
	    <div class="signature-line main-line" style="margin-top: 3cm; position:relative;"><span style="${ANCHOR_CSS}">SIG_ANCHOR:${getAnchorId(s.number)}</span></div>
	    <p style="margin-top: 0.3cm;">Name: ${s.name}${s.title ? `<br>Title: ${s.title}` : ''}</p>
	</div>`).join('')

    // Legacy: Keep signatoriesTableHtml for backwards compatibility (no anchors)
	    const signatoriesTableHtml = signatories.map(s => `
	            <div style="margin-bottom: 0.5cm;">
	                <div class="signature-line"></div>
	                Name: ${s.name}${s.title ? `<br>Title: ${s.title}` : ''}
	            </div>`).join('')

    // Fetch fee structure for the deal (get most recent published one)
    const { data: feeStructure } = await serviceSupabase
      .from('deal_fee_structures')
      .select('*')
      .eq('deal_id', subscription.deal_id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!feeStructure) {
      return NextResponse.json(
        { error: 'No published fee structure found for this deal' },
        { status: 400 }
      )
    }

    // ============================================================
    // FETCH ACTUAL SIGNERS FROM DATABASE (no more hardcoded names!)
    // ============================================================

    // Get CEO signer for issuer block (party_b)
    const ceoSigner = await getCeoSigner(serviceSupabase)
    const issuerName = ceoSigner?.displayName || feeStructure.issuer_signatory_name || 'Julien Machot'
    const issuerTitle = ceoSigner?.title || feeStructure.issuer_signatory_title || 'Authorized Signatory'
    console.log('[REGENERATE] Issuer signer:', { name: issuerName, title: issuerTitle })

    // Get arranger signer for arranger block (party_c)
    let arrangerName = feeStructure.arranger_person_name || ''
    let arrangerTitle = feeStructure.arranger_person_title || 'Director'

    // Fetch arranger from deal's arranger entity
    const { data: dealForArranger } = await serviceSupabase
      .from('deals')
      .select('arranger_entity_id')
      .eq('id', subscription.deal_id)
      .single()

    if (dealForArranger?.arranger_entity_id) {
      // Get arranger user who can sign
      const { data: arrangerUser } = await serviceSupabase
        .from('arranger_users')
        .select('user_id, title')
        .eq('arranger_id', dealForArranger.arranger_entity_id)
        .eq('can_sign', true)
        .order('is_primary', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (arrangerUser?.user_id) {
        const { data: arrangerProfile } = await serviceSupabase
          .from('profiles')
          .select('display_name')
          .eq('id', arrangerUser.user_id)
          .single()

        if (arrangerProfile?.display_name) {
          arrangerName = arrangerProfile.display_name
          arrangerTitle = arrangerUser.title || arrangerTitle
          console.log('[REGENERATE] Arranger signer found:', { name: arrangerName, title: arrangerTitle })
        }
      }
    }

    // Hardcoded fallback if no arranger name found from any source
    // This ensures the arranger block is never empty
    if (!arrangerName) {
      arrangerName = 'Julien Machot'
      console.warn('[REGENERATE] Using hardcoded arranger fallback: Julien Machot')
    }
    console.log('[REGENERATE] Arranger signer:', { name: arrangerName, title: arrangerTitle })

    // DEBUG: Log the ANCHOR_CSS to verify it's correct
    console.log('[REGENERATE] ANCHOR_CSS:', ANCHOR_CSS)

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
    <p style="margin-top: 0.3cm;">Name: ${arrangerName}<br>
    Title: ${arrangerTitle}</p>
</div>`

    // DEBUG: Log the generated HTML to verify anchors are present
    console.log('[REGENERATE] ========== SIGNATURE HTML DEBUG ==========')
    console.log('[REGENERATE] ANCHOR_CSS used:', ANCHOR_CSS)
    console.log('[REGENERATE] issuerSignatureHtml contains party_b:', issuerSignatureHtml.includes('SIG_ANCHOR:party_b'))
    console.log('[REGENERATE] arrangerSignatureHtml contains party_c:', arrangerSignatureHtml.includes('SIG_ANCHOR:party_c'))
    console.log('[REGENERATE] arrangerSignatureHtml FULL:', arrangerSignatureHtml)
    console.log('[REGENERATE] ==========================================')

    const investorData = subscription.investor
    const dealData = subscription.deal

    let subscriptionPayload: Record<string, any>
    let amount = 0
    let numShares = 0
    let pricePerShare = 0

    try {
      const built = buildSubscriptionPackPayload({
        outputFormat,
        subscription,
        investor: investorData,
        deal: dealData,
        vehicle: vehicleData || {},
        feeStructure,
        counterpartyEntity,
        signatories,
        issuerName,
        issuerTitle,
        arrangerName,
        arrangerTitle,
        signatoriesTableHtml,
        signatoriesFormHtml,
        signatoriesSignatureHtml,
        issuerSignatureHtml,
        arrangerSignatureHtml,
        isRegeneration: true,
        originalSubscriptionId: subscriptionId,
      })

      subscriptionPayload = built.payload
      amount = built.computed.amount
      numShares = built.computed.numShares
      pricePerShare = built.computed.pricePerShare
    } catch (buildError) {
      return NextResponse.json(
        {
          error: buildError instanceof Error
            ? buildError.message
            : 'Failed to build subscription pack payload',
        },
        { status: 400 }
      )
    }

    console.log('🔄 Triggering Subscription Pack REGENERATION:', {
      subscription_id: subscriptionId,
      investor: investorData.legal_name,
      amount: amount,
      num_shares: numShares,
      price_per_share: pricePerShare
    })

    // Trigger N8N workflow
    const result = await triggerWorkflow({
      workflowKey: 'generate-subscription-pack',
      payload: subscriptionPayload,
      entityType: 'subscription_regeneration',
      entityId: subscriptionId,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        title: user.title
      }
    })

    if (!result.success) {
      console.error('❌ Failed to trigger Subscription Pack regeneration:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to trigger document generation' },
        { status: 500 }
      )
    }

    console.log('✅ Subscription Pack regeneration triggered:', {
      workflow_run_id: result.workflow_run_id
    })

    // Handle n8n response with binary file
    if (result.n8n_response) {
      try {
        const n8nResponse = result.n8n_response
        console.log('📦 n8n regeneration response structure:', Object.keys(n8nResponse))

        // Extract data for filename generation
        const entityCode = vehicleData?.entity_code || 'UNKNOWN'
        const investmentName = vehicleData?.investment_name || 'INVESTMENT'
        const investorName = investorData?.display_name || investorData?.legal_name || 'INVESTOR'

        // Check if response contains binary file data (N8N always returns DOCX)
        let docxBuffer: Buffer

        if (n8nResponse.raw && typeof n8nResponse.raw === 'string') {
          docxBuffer = Buffer.from(n8nResponse.raw, 'latin1')
        } else if (n8nResponse.binary) {
          docxBuffer = Buffer.from(n8nResponse.binary)
        } else if (n8nResponse.data) {
          docxBuffer = Buffer.from(n8nResponse.data, 'base64')
        } else if (typeof n8nResponse === 'string') {
          docxBuffer = Buffer.from(n8nResponse, 'latin1')
        } else {
          throw new Error('No binary data in n8n response')
        }

        // Check file signature to determine actual format
        // PDF signature: 25504446 (%PDF)
        // DOCX/ZIP signature: 504b0304 (PK)
        const signature = docxBuffer.slice(0, 4).toString('hex')
        const isPDF = signature === '25504446'
        const isDOCX = signature === '504b0304'
        console.log('📄 N8N response file signature:', signature, isPDF ? '(PDF)' : isDOCX ? '(DOCX)' : '(unknown)', 'size:', docxBuffer.length)

        // Prepare final output based on requested format
        let fileBuffer: Buffer
        let fileName: string
        let mimeType: string

        if (outputFormat === 'pdf') {
          if (isPDF) {
            // N8N already returned PDF - use directly without Gotenberg conversion
            console.log('✅ N8N returned PDF directly, skipping Gotenberg conversion')
            fileBuffer = docxBuffer
            fileName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, new Date(), 'pdf')
            mimeType = 'application/pdf'
          } else {
            // Convert DOCX to PDF using Gotenberg
            console.log('🔄 Converting DOCX to PDF via Gotenberg...')
            const docxFileName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, new Date(), 'docx')
            const conversionResult = await convertDocxToPdf(docxBuffer, docxFileName)

            if (!conversionResult.success || !conversionResult.pdfBuffer) {
              console.error('❌ Gotenberg conversion failed:', conversionResult.error)
              return NextResponse.json({
                error: 'Document generated but PDF conversion failed',
                details: conversionResult.error || 'Conversion service unavailable'
              }, { status: 500 })
            }

            console.log('✅ DOCX converted to PDF:', {
              docx_size: docxBuffer.length,
              pdf_size: conversionResult.pdfBuffer.length
            })

            fileBuffer = conversionResult.pdfBuffer
            fileName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, new Date(), 'pdf')
            mimeType = 'application/pdf'
          }
        } else {
          // Keep as DOCX
          fileBuffer = docxBuffer
          fileName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, new Date(), 'docx')
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }

        console.log('📄 Final document:', { format: outputFormat, fileName, size: fileBuffer.length })

        if (outputFormat === 'pdf') {
          const numberingResult = await applySubscriptionPackPageNumbers(fileBuffer)
          fileBuffer = numberingResult.pdfBuffer
          console.log('✅ Applied centered page numbers to regenerated subscription pack:', {
            total_pages: numberingResult.totalPages,
            numbered_pages: numberingResult.numberedPages,
            appendix_start_page: numberingResult.appendixStartPage
          })
        }

        // Upload to Supabase Storage with regenerated- prefix
        // Use service client to bypass RLS policies on storage bucket
        const fileKey = `subscriptions/${subscriptionId}/regenerated/${Date.now()}-${fileName}`
        const { error: uploadError } = await serviceSupabase.storage
          .from('deal-documents')
          .upload(fileKey, fileBuffer, {
            contentType: mimeType,
            upsert: false
          })

        if (uploadError) {
          console.error('❌ Failed to upload regenerated subscription pack:', uploadError)
          return NextResponse.json(
            { error: 'Document generated but failed to upload' },
            { status: 500 }
          )
        }

        console.log('✅ Regenerated subscription pack uploaded:', fileKey)

        // Look up the Subscription Documents folder
        let subscriptionFolderId: string | null = null
        const vehicleIdForFolder = subscription.vehicle_id || vehicleData?.id
        if (vehicleIdForFolder) {
          // Use limit(1).maybeSingle() to handle duplicates gracefully
          const { data: subFolder } = await serviceSupabase
            .from('document_folders')
            .select('id')
            .eq('vehicle_id', vehicleIdForFolder)
            .eq('name', 'Subscription Documents')
            .limit(1)
            .maybeSingle()
          subscriptionFolderId = subFolder?.id || null
          console.log('[REGENERATE] Folder lookup:', { vehicleIdForFolder, subscriptionFolderId })
        }

        // Create document record (use service client to bypass RLS)
        const { data: docRecord, error: docError } = await serviceSupabase
          .from('documents')
          .insert({
            subscription_id: subscriptionId,
            subscription_submission_id: originalSubmission?.id || null,
            deal_id: subscription.deal_id,
            vehicle_id: vehicleIdForFolder,
            folder_id: subscriptionFolderId,
            type: 'subscription_draft',
            name: `Subscription Pack (Regenerated) - ${investmentName} - ${investorName}`,
            file_key: fileKey,
            mime_type: mimeType,
            file_size_bytes: fileBuffer.length,
            status: 'draft',
            current_version: 1,
            created_by: user.id,
          })
          .select('id')
          .single()

        if (docError) {
          console.error('❌ Failed to create document record:', docError)
        } else {
          console.log('✅ Regenerated document record created:', docRecord.id)

          // Mark workflow as completed only if document was created successfully
          if (result?.workflow_run_id) {
            await serviceSupabase.from('workflow_runs').update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              result_doc_id: docRecord.id
            }).eq('id', result.workflow_run_id)
          }
        }

        // Update subscription pack_generated_at (use service client to bypass RLS)
        await serviceSupabase
          .from('subscriptions')
          .update({ pack_generated_at: new Date().toISOString() })
          .eq('id', subscriptionId)

        // Audit log
        await auditLogger.log({
          actor_user_id: user.id,
          action: AuditActions.UPDATE,
          entity: AuditEntities.SUBSCRIPTIONS,
          entity_id: subscriptionId,
          metadata: {
            type: 'subscription_pack_regenerated',
            amount: amount,
            num_shares: numShares,
            price_per_share: pricePerShare,
            document_id: docRecord?.id,
            output_format: outputFormat
          }
        })

        return NextResponse.json({
          success: true,
          message: `Subscription pack regenerated successfully as ${outputFormat.toUpperCase()}`,
          document_id: docRecord?.id,
          file_key: fileKey,
          format: outputFormat,
          workflow_run_id: result.workflow_run_id
        })
      } catch (docError) {
        console.error('❌ Error processing regenerated document:', docError)
        return NextResponse.json(
          { error: 'Document generated but failed to process' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Regeneration workflow triggered',
      workflow_run_id: result.workflow_run_id
    })

  } catch (error) {
    console.error('Regeneration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
