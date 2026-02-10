import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { triggerWorkflow } from '@/lib/trigger-workflow'

const STAFF_ROLES = ['staff_admin', 'staff_ops', 'staff_rm', 'ceo']

/**
 * Generate termsheet filename with standardized format:
 * {VEHICLE_CODE} - INDICATIVE TERM SHEET - {COMPANY_NAME} - {MMM YYYY}.pdf
 * Example: VC215 - INDICATIVE TERM SHEET - ANTHROPIC - JAN 2026.pdf
 */
function generateTermsheetFilename(
  vehicleCode: string,
  companyName: string,
  termSheetDate: string | null,
  fallbackDate: Date
): string {
  const effectiveDate = termSheetDate ? new Date(termSheetDate) : fallbackDate
  const dateForFormat = isNaN(effectiveDate.getTime()) ? fallbackDate : effectiveDate
  const monthYear = dateForFormat
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase()
  const cleanVehicleCode = (vehicleCode?.trim() || 'VCXXX').toUpperCase()
  const cleanCompanyName = (companyName?.trim().replace(/\s+/g, ' ') || 'INVESTMENT').toUpperCase()
  return `${cleanVehicleCode} - INDICATIVE TERM SHEET - ${cleanCompanyName} - ${monthYear}.pdf`
}

/**
 * Format date for display in termsheet
 */
function formatDate(
  dateStr: string | null,
  format: 'long' | 'short' = 'long'
): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format number with thousand separators
 */
function formatNumber(num: number | null): string {
  if (num === null || num === undefined) return ''
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num)
}

function formatPrice(value: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function deriveIssuerAndVehicleFromName(vehicleName: string | null, entityCode: string | null) {
  const rawName = (vehicleName || '').trim()
  if (!rawName) {
    return { issuer: '', vehicle: '' }
  }

  const seriesMatch = rawName.match(/\bseries\s+(.+)$/i)
  const seriesToken = seriesMatch?.[1]?.trim() || ''
  const baseName = seriesMatch ? rawName.slice(0, seriesMatch.index).trim() : rawName
  const entitySeries = entityCode?.match(/\d+/)?.[0] || ''

  const vehicleLabel = seriesToken
    ? `Series ${seriesToken}`
    : (entitySeries ? `Series ${entitySeries}` : '')

  const hasSarL = /s\.à\s?r\.l\.?/i.test(baseName)
  const issuer = baseName
    ? (hasSarL ? baseName : `${baseName} S.à r.l.`)
    : ''

  return { issuer, vehicle: vehicleLabel }
}

/**
 * Format datetime with timezone for validity date
 * Returns format like "June 13, 2025 5:00 PM Luxembourg time"
 */
function formatDateTimeWithTimezone(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const dateFormatted = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const timeFormatted = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  return `${dateFormatted} ${timeFormatted} Luxembourg time`
}

/**
 * Format subscription fee percentage with appropriate text
 * Returns empty string for null (row will be hidden)
 * Returns "Waived (instead of 2.00%)" for 0%, percentage for other values
 */
function formatSubscriptionFeeText(percent: number | null): string {
  if (percent === null || percent === undefined) return ''
  if (percent === 0) return 'Waived (instead of 2.00%)'
  return `${percent.toFixed(2)}%`
}

/**
 * Format interest confirmation combining date with time and text
 * Returns format like "By June 13, 2025 5:00 PM COB for firm commitments only"
 */
function formatInterestConfirmation(
  deadline: string | null,
  text: string | null
): string {
  if (!deadline) return ''
  const date = new Date(deadline)
  if (isNaN(date.getTime())) return ''

  // Format date portion
  const dateFormatted = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // Format time portion
  const timeFormatted = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const suffix = text || 'COB for firm commitments only'
  return `By ${dateFormatted} ${timeFormatted} ${suffix}`
}

/**
 * Format legal counsel with "(Lead Counsel)" suffix if not present
 */
function formatLegalCounsel(counsel: string | null): string {
  if (!counsel) return ''
  if (counsel.includes('Lead Counsel')) return counsel
  return `${counsel} ("Lead Counsel")`
}

/**
 * Append identifier in parentheses if not already present
 * Example: "ABC Company" + "Seller" → 'ABC Company ("Seller")'
 */
function appendIdentifier(text: string | null, identifier: string): string {
  if (!text) return ''
  const trimmed = text.trim()
  // Check if already has this identifier in brackets (case-insensitive)
  if (trimmed.includes(`("${identifier}")`) || trimmed.includes(`("${identifier.toUpperCase()}")`)) {
    return trimmed
  }
  return `${trimmed} ("${identifier}")`
}

/**
 * Format fee percentage with appropriate text
 * Database stores fees as actual percentages (2 = 2%, 25 = 25%)
 * Returns empty string for null (row will be hidden)
 * When fee is 0%, displays fixed "Waived (instead of X%)" text
 */
function formatFeeText(
  percent: number | null,
  feeType: 'management' | 'carry'
): string {
  if (percent === null || percent === undefined) return ''
  if (percent === 0) {
    return feeType === 'management'
      ? 'Waived (instead of 2.00% per annum)'
      : 'Waived (instead of 20.00% no hurdle rate, no applicable cap)'
  }
  // Use value directly - DB stores actual percentage (2 = 2%)
  const percentValue = percent.toFixed(2)
  return feeType === 'management'
    ? `${percentValue}% per annum`
    : `${percentValue}% (no hurdle rate)`
}

/**
 * POST /api/deals/[id]/fee-structures/[structureId]/generate
 *
 * Generates a term sheet PDF document by triggering the n8n workflow.
 * The generated PDF is stored in Supabase Storage and linked to the fee structure.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; structureId: string }> }
) {
  try {
    const { id: dealId, structureId } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Check authentication
    const {
      data: { user: authUser },
      error: authError
    } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Fetch fee structure
    const { data: feeStructure, error: fsError } = await serviceSupabase
      .from('deal_fee_structures')
      .select('*')
      .eq('id', structureId)
      .eq('deal_id', dealId)
      .single()

    if (fsError || !feeStructure) {
      console.error('Fee structure not found:', fsError)
      return NextResponse.json(
        { error: 'Term sheet not found' },
        { status: 404 }
      )
    }

    // Fetch deal data
    const { data: deal } = await serviceSupabase
      .from('deals')
      .select('id, name, company_name, company_logo_url, currency, vehicle_id')
      .eq('id', dealId)
      .single()

    // Fetch vehicle data if available
    let vehicleData = null
    if (deal?.vehicle_id) {
      const { data: vehicle } = await serviceSupabase
        .from('vehicles')
        .select('id, name, series_number, entity_code')
        .eq('id', deal.vehicle_id)
        .single()
      vehicleData = vehicle
    }

    const derived = deriveIssuerAndVehicleFromName(
      vehicleData?.name ?? null,
      vehicleData?.entity_code ?? null
    )

    const pricePerShareValue = feeStructure.price_per_share != null
      ? feeStructure.price_per_share
      : feeStructure.price_per_share_text
        ? Number(String(feeStructure.price_per_share_text).replace(/[^\d.]/g, ''))
        : null
    const pricePerShareDisplay = formatPrice(pricePerShareValue)

    const completionDateText = feeStructure.completion_date_text
      || (feeStructure.completion_date ? `By ${formatDate(feeStructure.completion_date)}` : '')

    // Build termsheet payload with all template variables
    const termsheetPayload = {
      // Branding
      company_logo_url: deal?.company_logo_url || '',

      // Header - use deal name as primary title
      term_sheet_title:
        deal?.name || deal?.company_name || feeStructure.transaction_type || 'Investment Opportunity',
      term_sheet_date: formatDate(feeStructure.term_sheet_date),

      // Static/default field (editable in term sheet form)
      to_description: feeStructure.to_description || 'Qualified, Professional and Institutional Investors only',

      // Core fields from deal_fee_structures
      transaction_type: feeStructure.transaction_type || '',
      opportunity_summary: feeStructure.opportunity_summary || '',
      issuer: appendIdentifier(
        feeStructure.issuer || derived.issuer,
        'Issuer'
      ),
      vehicle: appendIdentifier(
        feeStructure.vehicle || derived.vehicle,
        vehicleData?.entity_code || `VC${vehicleData?.series_number || 'XXX'}`
      ),
      series_number: vehicleData?.series_number || '',
      exclusive_arranger: appendIdentifier(
        feeStructure.exclusive_arranger ||
          'VERSO Management Limited, regulated by BVI FSC',
        'Arranger'
      ),
      purchaser: appendIdentifier(
        feeStructure.purchaser ||
          'Qualified Limited Partners and Institutional Clients',
        'Purchaser'
      ),
      seller: feeStructure.seller
        ? appendIdentifier(feeStructure.seller, 'Seller')
        : '',
      structure: feeStructure.structure || '',

      // Financial terms
      currency: deal?.currency || 'USD',
      allocation_up_to: formatNumber(feeStructure.allocation_up_to),
      price_per_share: pricePerShareDisplay,
      minimum_ticket: formatNumber(feeStructure.minimum_ticket),
      maximum_ticket: formatNumber(feeStructure.maximum_ticket),

      // Fee terms - fixed "Waived (instead of X%)" text when fee is 0%
      subscription_fee_text: formatSubscriptionFeeText(
        feeStructure.subscription_fee_percent
      ),
      management_fee_text: formatFeeText(
        feeStructure.management_fee_percent,
        'management'
      ),
      carried_interest_text: formatFeeText(
        feeStructure.carried_interest_percent,
        'carry'
      ),

      // Legal & Timeline
      legal_counsel: formatLegalCounsel(feeStructure.legal_counsel),
      interest_confirmation_text: formatInterestConfirmation(
        feeStructure.interest_confirmation_deadline,
        feeStructure.interest_confirmation_text
      ),
      capital_call_timeline:
        feeStructure.capital_call_timeline ||
        'No later than 3 days prior to confirmed Completion Date by Company with effective funds on Escrow Account (T-3)',
      completion_date_text: completionDateText,

      // Notes with defaults
      in_principle_approval_text:
        feeStructure.in_principle_approval_text ||
        'The Arranger has obtained approval for the present offering from the Issuer',
      subscription_pack_note:
        feeStructure.subscription_pack_note ||
        'The Issuer shall issue a Subscription Pack to be executed by the Purchaser',
      share_certificates_note:
        feeStructure.share_certificates_note ||
        'The Issuer shall provide the Purchasers Share Certificates and Statement of Holdings upon Completion',
      subject_to_change_note:
        feeStructure.subject_to_change_note ||
        'The content of the present term sheet remains indicative, subject to change',
      validity_date: formatDateTimeWithTimezone(feeStructure.validity_date),

      // Footer
      footer_arranger: 'VERSO Management',
      footer_date: formatDate(feeStructure.term_sheet_date, 'short'),

      // Metadata for tracking
      structure_id: structureId,
      deal_id: dealId
    }

    console.log('📄 [TERMSHEET] Triggering generation:', {
      deal_id: dealId,
      structure_id: structureId,
      title: termsheetPayload.term_sheet_title
    })

    // Trigger n8n workflow
    const result = await triggerWorkflow({
      workflowKey: 'generate-termsheet',
      payload: termsheetPayload,
      entityType: 'termsheet',
      entityId: structureId,
      user: {
        id: authUser.id,
        email: authUser.email || profile.email,
        displayName: profile.display_name,
        role: profile.role
      }
    })

    if (!result.success) {
      console.error('❌ [TERMSHEET] Workflow failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to generate termsheet' },
        { status: 500 }
      )
    }

    console.log('✅ [TERMSHEET] Workflow triggered:', {
      workflow_run_id: result.workflow_run_id
    })

    // Handle binary PDF response from n8n
    if (result.n8n_response) {
      try {
        const n8nResponse = result.n8n_response
        let pdfBuffer: Buffer

        // Extract binary data from various response formats
        if (n8nResponse.binary) {
          pdfBuffer = Buffer.from(n8nResponse.binary)
        } else if (n8nResponse.raw && typeof n8nResponse.raw === 'string') {
          pdfBuffer = Buffer.from(n8nResponse.raw, 'latin1')
        } else if (n8nResponse.data) {
          pdfBuffer = Buffer.from(n8nResponse.data, 'base64')
        } else {
          console.error('❌ [TERMSHEET] No binary data in response')
          return NextResponse.json(
            { error: 'No document data in response' },
            { status: 500 }
          )
        }

        // Verify PDF signature
        const signature = pdfBuffer.slice(0, 4).toString('hex')
        console.log('📄 [TERMSHEET] PDF signature:', signature, 'size:', pdfBuffer.length)

        // Generate filename
        const vehicleCode =
          vehicleData?.entity_code || `VC${vehicleData?.series_number || 'XXX'}`
        const companyName = deal?.company_name || deal?.name || 'INVESTMENT'
        const fileName = generateTermsheetFilename(
          vehicleCode,
          companyName,
          feeStructure.term_sheet_date,
          new Date()
        )

        // Delete old file if exists (to allow regeneration)
        if (feeStructure.term_sheet_attachment_key) {
          console.log('🗑️ [TERMSHEET] Deleting old file:', feeStructure.term_sheet_attachment_key)
          await serviceSupabase.storage
            .from('deal-documents')
            .remove([feeStructure.term_sheet_attachment_key])
        }

        // Upload to Supabase Storage (use service client to bypass RLS)
        const fileKey = `term-sheets/${dealId}/${structureId}/${fileName}`
        const { error: uploadError } = await serviceSupabase.storage
          .from('deal-documents')
          .upload(fileKey, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) {
          console.error('❌ [TERMSHEET] Upload failed:', uploadError)
          return NextResponse.json(
            { error: 'Document generated but failed to upload' },
            { status: 500 }
          )
        }

        console.log('✅ [TERMSHEET] Uploaded to storage:', fileKey)

        // Update deal_fee_structures with attachment key
        const { error: updateError } = await serviceSupabase
          .from('deal_fee_structures')
          .update({
            term_sheet_attachment_key: fileKey,
            updated_at: new Date().toISOString()
          })
          .eq('id', structureId)

        if (updateError) {
          console.error('⚠️ [TERMSHEET] Failed to update attachment key:', updateError)
        }

        // Mark workflow as completed now that document is stored
        if (result?.workflow_run_id) {
          await serviceSupabase.from('workflow_runs').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            result_doc_id: null // Term sheets don't have a documents record
          }).eq('id', result.workflow_run_id)
          console.log('✅ [TERMSHEET] Workflow run marked as completed')
        }

        // Create audit log
        await auditLogger.log({
          actor_user_id: authUser.id,
          action: AuditActions.CREATE,
          entity: AuditEntities.DOCUMENTS,
          entity_id: structureId,
          metadata: {
            type: 'termsheet_generated',
            deal_id: dealId,
            file_key: fileKey,
            file_size: pdfBuffer.length
          }
        })

        // Generate signed URL for immediate download
        const { data: signedUrlData } = await serviceSupabase.storage
          .from('deal-documents')
          .createSignedUrl(fileKey, 3600) // 1 hour expiry

        return NextResponse.json({
          success: true,
          message: 'Term sheet generated successfully',
          file_key: fileKey,
          download_url: signedUrlData?.signedUrl,
          workflow_run_id: result.workflow_run_id
        })
      } catch (docError) {
        console.error('❌ [TERMSHEET] Error processing document:', docError)
        return NextResponse.json(
          { error: 'Document generated but failed to process' },
          { status: 500 }
        )
      }
    }

    // Workflow triggered but no immediate response (async processing)
    return NextResponse.json({
      success: true,
      message: 'Generation workflow triggered',
      workflow_run_id: result.workflow_run_id
    })
  } catch (error) {
    console.error('❌ [TERMSHEET] Generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
