import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { triggerWorkflow } from '@/lib/trigger-workflow'
import { convertDocxToPdf } from '@/lib/gotenberg/convert'

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
          entity_identifier
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

    // === KEY DIFFERENCE: Use subscription.commitment (source of truth) ===
    const amount = Number(subscription.commitment) || 0
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Subscription commitment amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Calculate subscription details using SUBSCRIPTION table values
    // Use subscription.price_per_share if set, otherwise fall back to fee structure
    const subscriptionPricePerShare = Number(subscription.price_per_share)
    const feeStructurePricePerShare = parseFloat(feeStructure.price_per_share_text?.replace(/[^\d.]/g, '') || '0')
    const pricePerShare = subscriptionPricePerShare > 0
      ? subscriptionPricePerShare
      : (feeStructurePricePerShare > 0 ? feeStructurePricePerShare : 1.00)

    // Use subscription.num_shares if set, otherwise calculate
    const numShares = Number(subscription.num_shares) > 0
      ? Number(subscription.num_shares)
      : Math.floor(amount / pricePerShare)

    const subscriptionFeeRate = Number(subscription.subscription_fee_percent) || feeStructure.subscription_fee_percent || 0
    const subscriptionFeeAmount = Number(subscription.subscription_fee_amount) || (amount * subscriptionFeeRate)
    const totalSubscriptionPrice = amount + subscriptionFeeAmount

    // Format dates
    const agreementDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const paymentDeadlineDays = feeStructure.payment_deadline_days || 10
    const paymentDeadlineDate = new Date(Date.now() + paymentDeadlineDays * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    // Determine subscriber info (use entity if entity subscription, otherwise investor)
    const investorData = subscription.investor
    // vehicleData already set above with fallback logic
    const dealData = subscription.deal

    const subscriberName = counterpartyEntity
      ? counterpartyEntity.legal_name
      : investorData.legal_name

    const subscriberType = counterpartyEntity
      ? counterpartyEntity.entity_type?.replace(/_/g, ' ').toUpperCase()
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
      ? `${counterpartyEntity.legal_name}, a ${counterpartyEntity.entity_type?.replace(/_/g, ' ')} with registered office at ${subscriberAddress}`
      : `${investorData.legal_name}, ${investorData.type || 'entity'} with registered office at ${investorData.registered_address || ''}`

    const subscriberTitle = counterpartyEntity?.representative_title || 'Authorized Representative'
    const subscriberRepName = counterpartyEntity?.representative_name || counterpartyEntity?.legal_name || investorData.legal_name

    // Build comprehensive subscription pack payload (same structure as initial generation)
    const subscriptionPayload = {
      // Series & Investment info
      series_number: vehicleData?.series_number || '',
      series_title: vehicleData?.investment_name || vehicleData?.name || '',
      series_short_title: vehicleData?.series_short_title || '',
      ultimate_investment: dealData?.company_name || dealData?.name || '',

      // Subscriber info
      subscriber_name: subscriberName,
      subscriber_type: subscriberType,
      subscriber_address: subscriberAddress,
      subscriber_block: subscriberBlock,
      subscriber_title: subscriberTitle,
      subscriber_representative_name: subscriberRepName,

      // Investment branding
      investment_logo_url: dealData?.company_logo_url || '',

      // Financial details - FROM SUBSCRIPTION TABLE (source of truth)
      certificates_count: numShares.toString(),
      price_per_share: pricePerShare.toFixed(2),
      subscription_amount: amount.toFixed(2),
      subscription_fee_rate: `${(subscriptionFeeRate * 100).toFixed(2)}%`,
      subscription_fee_amount: subscriptionFeeAmount.toFixed(2),
      subscription_fee_text: `${(subscriptionFeeRate * 100).toFixed(2)}% upfront subscription fee`,
      total_subscription_price: totalSubscriptionPrice.toFixed(2),

      // Currency
      currency_code: subscription.currency || dealData?.currency || 'USD',
      currency_long: (subscription.currency || dealData?.currency) === 'USD' ? 'United States Dollars' : (subscription.currency || dealData?.currency),

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
      wire_reference: feeStructure.wire_reference_format?.replace('{series}', vehicleData?.series_number || '') || `${vehicleData?.series_number}-${vehicleData?.series_short_title}`,
      wire_description: feeStructure.wire_description_format || `Escrow account for ${vehicleData?.name}`,
      wire_arranger: feeStructure.exclusive_arranger || 'VERSO Management Ltd',
      wire_contact_email: feeStructure.wire_contact_email || 'subscription@verso.capital',

      // Issuer info
      issuer_gp_name: vehicleData?.issuer_gp_name || 'VERSO Capital 2 GP SARL',
      issuer_gp_rcc_number: vehicleData?.issuer_gp_rcc_number || '',
      issuer_rcc_number: vehicleData?.issuer_rcc_number || '',
      issuer_website: vehicleData?.issuer_website || 'www.verso.capital',
      issuer_name: feeStructure.issuer_signatory_name || 'Alexandre Müller',
      issuer_title: feeStructure.issuer_signatory_title || 'Authorized Signatory',

      // Dates & deadlines
      agreement_date: agreementDate,
      payment_deadline_days: paymentDeadlineDays.toString(),
      payment_deadline_date: paymentDeadlineDate,
      issue_within_business_days: (feeStructure.issue_within_business_days || 5).toString(),

      // Recitals
      recital_b_html: feeStructure.recital_b_html || `(B) The Issuer intends to issue Certificates which shall track equity interests in ${dealData?.company_name || dealData?.name}, and the Subscriber intends to subscribe for ${numShares} Certificates.`,

      // Arranger
      arranger_name: feeStructure.arranger_person_name || 'Julien Machot',
      arranger_title: feeStructure.arranger_person_title || 'Director',

      // Regeneration flag (useful for N8N to know this is a regeneration)
      is_regeneration: true,
      original_subscription_id: subscriptionId
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

        // Verify DOCX signature
        const signature = docxBuffer.slice(0, 4).toString('hex')
        console.log('📄 Regenerated DOCX signature:', signature, 'size:', docxBuffer.length)

        // Prepare final output based on requested format
        let fileBuffer: Buffer
        let fileName: string
        let mimeType: string

        if (outputFormat === 'pdf') {
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
        } else {
          // Keep as DOCX
          fileBuffer = docxBuffer
          fileName = generateSubscriptionPackFilename(entityCode, investmentName, investorName, new Date(), 'docx')
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }

        console.log('📄 Final document:', { format: outputFormat, fileName, size: fileBuffer.length })

        // Upload to Supabase Storage with regenerated- prefix
        const fileKey = `subscriptions/${subscriptionId}/regenerated/${Date.now()}-${fileName}`
        const { error: uploadError } = await supabase.storage
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
          const { data: subFolder } = await supabase
            .from('document_folders')
            .select('id')
            .eq('vehicle_id', vehicleIdForFolder)
            .eq('name', 'Subscription Documents')
            .single()
          subscriptionFolderId = subFolder?.id || null
        }

        // Create document record
        const { data: docRecord, error: docError } = await supabase
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
            created_by: user.id
          })
          .select()
          .single()

        if (docError) {
          console.error('❌ Failed to create document record:', docError)
        } else {
          console.log('✅ Regenerated document record created:', docRecord.id)
        }

        // Update subscription pack_generated_at
        await supabase
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
