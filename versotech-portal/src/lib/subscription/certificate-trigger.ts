/**
 * Certificate Trigger Utility
 * Triggers certificate generation when subscription becomes active
 *
 * COMPREHENSIVE PAYLOAD: Sends ALL data n8n needs to generate the certificate
 * without requiring n8n to query the database.
 */

import { triggerWorkflow } from '@/lib/trigger-workflow'
import { convertHtmlToPdf } from '@/lib/gotenberg/convert'
import { createInvestorNotification } from '@/lib/notifications'
import { getCeoSigner } from '@/lib/staff/ceo-signer'
import { SupabaseClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

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
  certificateDateOverride?: string | Date | null
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

function formatCertificateUnits(value: number | string | null | undefined): string {
  const numericValue =
    typeof value === 'string'
      ? Number(value.replace(/,/g, '').trim())
      : Number(value ?? 0)

  if (!Number.isFinite(numericValue)) return '0'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.trunc(numericValue))
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

function parseValidDate(input: string | Date | null | undefined): Date | null {
  if (!input) return null
  const date = input instanceof Date ? input : new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

function buildCertificateNumber(
  seriesNumber: string | null | undefined,
  subscriptionNumber: string | number | null | undefined,
  subscriptionId: string
): string {
  const normalizedSeriesNumber = normalizeCertificateSegment(seriesNumber) || '000'
  const normalizedSubscriptionNumber =
    normalizeCertificateSegment(subscriptionNumber) ||
    subscriptionId.replace(/-/g, '').slice(0, 8).toUpperCase()

  return `VC${normalizedSeriesNumber}SH${normalizedSubscriptionNumber}`
}

function normalizeCertificateSegment(value: string | number | null | undefined): string {
  const normalized = value == null ? '' : String(value).trim()
  if (!normalized) return ''

  const lower = normalized.toLowerCase()
  if (lower === 'null' || lower === 'undefined' || lower === 'nan') return ''

  return normalized
}

function extractSeriesNumberFromVehicleName(name: string | null | undefined): string {
  const normalizedName = (name || '').trim()
  if (!normalizedName) return ''

  // Handles patterns like "Series 600" in vehicle display names.
  const match = normalizedName.match(/\bseries\s+([a-z0-9-]+)\b/i)
  if (!match?.[1]) return ''

  return normalizeCertificateSegment(match[1])
}

class CertificateConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CertificateConfigurationError'
  }
}

interface CertificateSignatoryConfig {
  signatory1Name: string
  signatory1Title: string
  signatory1SignatureUrl: string
  signatory2Name: string
  signatory2Title: string
  signatory2SignatureUrl: string
}

function normalizeSignatureReference(value: string | null | undefined): string {
  const normalized = (value || '').trim()
  if (!normalized) return ''
  const lower = normalized.toLowerCase()
  if (lower === 'null' || lower === 'undefined' || lower === 'nan') return ''
  return normalized
}

function isDataUri(value: string): boolean {
  return value.startsWith('data:')
}

function isHttpUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://')
}

function inferImageMimeType(reference: string): string {
  const extension = path.extname(reference.split('?')[0]).toLowerCase()
  if (extension === '.png') return 'image/png'
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.webp') return 'image/webp'
  if (extension === '.svg') return 'image/svg+xml'
  return 'image/png'
}

function toDataUri(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}

function readPublicAssetAsDataUri(publicPath: string): string | null {
  const normalizedPath = publicPath.replace(/^\/+/, '')
  if (!normalizedPath) return null

  const absolutePath = path.resolve(process.cwd(), 'public', normalizedPath)
  if (!existsSync(absolutePath)) return null

  try {
    const buffer = readFileSync(absolutePath)
    return toDataUri(buffer, inferImageMimeType(absolutePath))
  } catch (error) {
    console.error(`❌ Failed to read public signature asset (${absolutePath}):`, error)
    return null
  }
}

async function readStoragePathAsDataUri(
  supabase: SupabaseClient,
  storagePath: string,
  preferredBucket?: string | null
): Promise<string | null> {
  const buckets = [
    ...(preferredBucket ? [preferredBucket] : []),
    'signatures',
    'documents',
    'public-assets',
  ]
  const uniqueBuckets = Array.from(new Set(buckets.filter(Boolean)))

  for (const bucket of uniqueBuckets) {
    const { data, error } = await supabase.storage.from(bucket).download(storagePath)
    if (error || !data) continue

    try {
      const buffer = Buffer.from(await data.arrayBuffer())
      const mimeType = data.type || inferImageMimeType(storagePath)
      return toDataUri(buffer, mimeType)
    } catch (downloadError) {
      console.error(`❌ Failed to convert storage image ${bucket}/${storagePath} to data URI:`, downloadError)
    }
  }

  return null
}

function parseSupabaseStorageUrl(url: string): { bucket: string; path: string } | null {
  try {
    const parsed = new URL(url)
    const match = parsed.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/)
    if (!match?.[1] || !match?.[2]) return null
    return { bucket: decodeURIComponent(match[1]), path: decodeURIComponent(match[2]) }
  } catch {
    return null
  }
}

async function convertSignatureReferenceToDataUri(
  supabase: SupabaseClient,
  reference: string | null | undefined
): Promise<string | null> {
  const normalized = normalizeSignatureReference(reference)
  if (!normalized) return null

  if (isDataUri(normalized)) return normalized

  if (normalized.startsWith('/')) {
    const publicAssetDataUri = readPublicAssetAsDataUri(normalized)
    if (publicAssetDataUri) return publicAssetDataUri
  }

  if (isHttpUrl(normalized)) {
    try {
      const response = await fetch(normalized)
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer())
        const mimeType = response.headers.get('content-type') || inferImageMimeType(normalized)
        return toDataUri(buffer, mimeType)
      }
    } catch (error) {
      console.warn(`⚠️ Failed to fetch signature URL (${normalized}), trying storage fallback:`, error)
    }

    const parsedStorage = parseSupabaseStorageUrl(normalized)
    if (parsedStorage) {
      return readStoragePathAsDataUri(supabase, parsedStorage.path, parsedStorage.bucket)
    }

    return null
  }

  return readStoragePathAsDataUri(supabase, normalized)
}

async function getPrimaryCeoSignatureReference(supabase: SupabaseClient): Promise<string> {
  const { data: ceoUser, error: ceoError } = await supabase
    .from('ceo_users')
    .select('user_id, can_sign, is_primary')
    .eq('can_sign', true)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (ceoError || !ceoUser?.user_id) {
    return ''
  }

  const { data: ceoProfile, error: profileError } = await supabase
    .from('profiles')
    .select('signature_specimen_url')
    .eq('id', ceoUser.user_id)
    .maybeSingle()

  if (profileError) return ''
  return normalizeSignatureReference(ceoProfile?.signature_specimen_url)
}

async function getLegalSignatureReference(
  supabase: SupabaseClient,
  dealId: string | null
): Promise<string> {
  if (dealId) {
    const { data: assignments } = await supabase
      .from('deal_lawyer_assignments')
      .select('lawyer_id')
      .eq('deal_id', dealId)

    const assignedLawyerIds = (assignments || []).map((a) => a.lawyer_id).filter(Boolean)

    if (assignedLawyerIds.length > 0) {
      const { data: assignedLawyerUsers } = await supabase
        .from('lawyer_users')
        .select('signature_specimen_url, can_sign, is_primary')
        .in('lawyer_id', assignedLawyerIds)
        .eq('can_sign', true)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true })

      const assignedSignature = assignedLawyerUsers
        ?.map((row) => normalizeSignatureReference(row.signature_specimen_url))
        .find(Boolean)
      if (assignedSignature) return assignedSignature
    }
  }

  const { data: globalLawyerUsers } = await supabase
    .from('lawyer_users')
    .select('signature_specimen_url, can_sign, is_primary')
    .eq('can_sign', true)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  const globalLawyerSignature = globalLawyerUsers
    ?.map((row) => normalizeSignatureReference(row.signature_specimen_url))
    .find(Boolean)
  if (globalLawyerSignature) return globalLawyerSignature

  // Final DB fallback: any non-primary CEO profile signature.
  const { data: secondaryCeoUsers } = await supabase
    .from('ceo_users')
    .select('user_id, is_primary')
    .eq('is_primary', false)
    .order('created_at', { ascending: true })

  const secondaryCeoIds = (secondaryCeoUsers || []).map((u) => u.user_id).filter(Boolean)
  if (secondaryCeoIds.length === 0) return ''

  const { data: secondaryProfiles } = await supabase
    .from('profiles')
    .select('id, signature_specimen_url')
    .in('id', secondaryCeoIds)

  return secondaryProfiles
    ?.map((row) => normalizeSignatureReference(row.signature_specimen_url))
    .find(Boolean) || ''
}

async function getCertificateSignatoryConfig(
  supabase: SupabaseClient,
  dealId: string | null
): Promise<CertificateSignatoryConfig> {
  const signatory1Name = 'Mr Julien Machot'
  const signatory1Title = 'Managing Partner'
  const signatory1SignatureRef = await getPrimaryCeoSignatureReference(supabase)
  const signatory1SignatureUrl = await convertSignatureReferenceToDataUri(supabase, signatory1SignatureRef)

  const signatory2Name = 'Mr Frederic Dupont'
  const signatory2Title = 'General Counsel'
  const signatory2SignatureRef = await getLegalSignatureReference(supabase, dealId)
  const signatory2SignatureUrl = await convertSignatureReferenceToDataUri(supabase, signatory2SignatureRef)

  const missing: string[] = []
  if (!signatory1SignatureUrl) {
    missing.push('CEO signature in DB (ceo_users + profiles.signature_specimen_url)')
  }
  if (!signatory2SignatureUrl) {
    missing.push('legal signer signature in DB (deal_lawyer_assignments/lawyer_users or secondary CEO profile signature)')
  }

  if (missing.length > 0) {
    throw new CertificateConfigurationError(
      `Missing certificate signature image data in database: ${missing.join(', ')}`
    )
  }

  const resolvedSignatory1SignatureUrl = signatory1SignatureUrl as string
  const resolvedSignatory2SignatureUrl = signatory2SignatureUrl as string

  return {
    signatory1Name,
    signatory1Title,
    signatory1SignatureUrl: resolvedSignatory1SignatureUrl,
    signatory2Name,
    signatory2Title,
    signatory2SignatureUrl: resolvedSignatory2SignatureUrl,
  }
}

/**
 * Triggers certificate generation for a newly activated subscription
 * Returns true when a certificate document is successfully published.
 * Returns false when generation is skipped or fails non-critically.
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
  profile,
  certificateDateOverride
}: TriggerCertificateParams): Promise<boolean> {
  let certificatePublished = false

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
      return false
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
      return false
    }

    // Verify subscription status is 'active' or 'funded' (funded when called during activation)
    if (!['active', 'funded'].includes(subscription.status)) {
      console.warn(`⚠️ Cannot trigger certificate for subscription ${subscriptionId} - status is '${subscription.status}', expected 'active' or 'funded'`)
      return false
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
      return false
    }

    // Fetch deal fee structure for product description
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
        // Get the termsheet completion date and product description
        const { data: termsheet } = await supabase
          .from('deal_fee_structures')
          .select('product_description, structure, completion_date')
          .eq('id', membership.term_sheet_id)
          .single()

        if (termsheet) {
          if (termsheet.product_description) {
            productDescription = termsheet.product_description
          } else if (termsheet.structure) {
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
          .select('product_description, structure, completion_date')
          .eq('deal_id', subscription.deal_id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (feeStructure?.product_description) {
          productDescription = feeStructure.product_description
        } else if (feeStructure?.structure) {
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
    const resolvedSeriesNumber =
      normalizeCertificateSegment(vehicleData.series_number) ||
      extractSeriesNumberFromVehicleName(vehicleData.name) ||
      '000'

    const certificateNumber = buildCertificateNumber(
      resolvedSeriesNumber,
      subscription.subscription_number,
      subscriptionId
    )
    const signatoryConfig = await getCertificateSignatoryConfig(supabase, subscription.deal_id || null)

    // Get certificate date:
    // - manual close: explicit override date from approval timestamp
    // - automatic close: termsheet completion_date
    // - fallback: deal close_at, then today
    const certificateDate = parseValidDate(certificateDateOverride)
      || termsheetCompletionDate
      || (dealData?.close_at ? new Date(dealData.close_at) : new Date())

    // Determine logo type: VERSO Capital 2 uses text "VERSO" in League Spartan font
    const isVersoCapital2 = vehicleData.name?.toLowerCase().includes('verso capital 2') || false
    const unitsValue = subscription.units || subscription.num_shares || shares || 0
    const numSharesValue = subscription.num_shares || shares || 0

    // Build comprehensive certificate payload
    const certificatePayload = {
      // === LOGO DATA ===
      // VERSO Capital 2 uses "VERSO" text in League Spartan font, others use logo image
      logo_type: isVersoCapital2 ? 'text' : 'image',
      logo_text: isVersoCapital2 ? 'VERSO' : '',
      logo_font: 'League Spartan',
      vehicle_logo_url: !isVersoCapital2 ? (vehicleData.logo_url || '') : '',

      // === CERTIFICATE NUMBER (format: VC{series_number}SH{subscription_number}) ===
      series_number: resolvedSeriesNumber,
      subscription_number:
        normalizeCertificateSegment(subscription.subscription_number) ||
        subscriptionId.replace(/-/g, '').slice(0, 8).toUpperCase(),

      // === UNITS/CERTIFICATES ===
      units: unitsValue,
      units_display: formatCertificateUnits(unitsValue),

      // === DATE (TERMSHEET COMPLETION DATE - formatted as "Month Day, Year") ===
      close_at: formatCertificateDate(certificateDate),

      // === ISSUER SECTION DATA ===
      vehicle_name: vehicleData.name || '',
      company_name: dealData?.company_name || dealData?.name || '',
      vehicle_registration_number: vehicleData.registration_number || '',

      // === CERTIFICATION TEXT DATA ===
      investor_name: investorName,
      num_shares: numSharesValue,
      num_shares_display: formatCertificateUnits(numSharesValue),
      structure: productDescription, // e.g., "Shares of Series B Preferred Stock of X.AI"

      // === SIGNATURE TABLE DATA (embedded static signature images) ===
      vehicle_address: vehicleData.address || '',

      // Signatory 1 (LEFT) = Managing partner / CEO
      signatory_1_name: signatoryConfig.signatory1Name,
      signatory_1_title: signatoryConfig.signatory1Title,
      signatory_1_signature_url: signatoryConfig.signatory1SignatureUrl,

      // Signatory 2 (RIGHT) = Generic legal counsel label (no individual identity)
      signatory_2_name: signatoryConfig.signatory2Name,
      signatory_2_title: signatoryConfig.signatory2Title,
      signatory_2_signature_url: signatoryConfig.signatory2SignatureUrl,

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
      certificate_number: certificateNumber,
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

              // Create document record as published (certificate already has embedded signatures)
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
                  status: 'published',
                  current_version: 1,
                  ready_for_signature: false,
                  is_published: true,
                  published_at: new Date().toISOString(),
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

                await supabase.from('audit_logs').insert({
                  event_type: 'certificate',
                  action: 'certificate_published',
                  entity_type: 'document',
                  entity_id: document.id,
                  action_details: {
                    subscription_id: subscriptionId,
                    investor_id: investorId,
                    generation_mode: 'embedded_signatures',
                    signed_positions: ['embedded_signatory_1', 'embedded_signatory_2'],
                    published_file_key: fileKey
                  },
                  timestamp: new Date().toISOString()
                })

                // Notify CEO that the certificate has been generated
                const ceoSigner = await getCeoSigner(supabase as any)
                if (ceoSigner?.id) {
                  try {
                    await createInvestorNotification({
                      userId: ceoSigner.id,
                      type: 'certificate_issued',
                      title: 'Certificate Generated',
                      message: `Certificate ${fileName} has been generated for ${investorName}.`,
                      link: '/versotech_main/documents',
                      sendEmailNotification: true,
                      dealId: subscription.deal_id ?? undefined,
                      extraMetadata: {
                        subscription_id: subscriptionId,
                        investor_id: investorId,
                        document_id: document.id,
                        certificate_file_name: fileName,
                      },
                    })
                    console.log(`✅ Notified CEO about generated certificate: ${document.id}`)
                  } catch (ceoNotificationError) {
                    console.error('⚠️ Failed to notify CEO about certificate generation:', ceoNotificationError)
                  }
                } else {
                  console.warn('⚠️ No CEO signer configured - skipping certificate generated CEO notification')
                }

                // Notify investor that certificate + statement are ready
                const { data: certInvestorUsers, error: certUsersError } = await supabase
                  .from('investor_users')
                  .select('user_id')
                  .eq('investor_id', investorId)

                if (certUsersError) {
                  console.error(`❌ Failed to fetch investor users for certificate_issued:`, certUsersError)
                } else if (!certInvestorUsers || certInvestorUsers.length === 0) {
                  console.warn(`⚠️ No investor_users found for investor ${investorId} - cannot create certificate_issued`)
                } else {
                  let certNotifiedCount = 0
                  for (const iu of certInvestorUsers) {
                    try {
                      await createInvestorNotification({
                        userId: iu.user_id,
                        investorId,
                        type: 'certificate_issued',
                        title: 'Share Certificate and Statement of Holdings',
                        message: 'Your share certificate and statement of holdings is now available in your portfolio documents.',
                        link: '/versotech_main/documents',
                        sendEmailNotification: true,
                        dealId: subscription.deal_id ?? undefined,
                      })
                      certNotifiedCount++
                    } catch (notificationError) {
                      console.error(`⚠️ Failed to create certificate_issued notification for user ${iu.user_id}:`, notificationError)
                    }
                  }
                  console.log(`✅ Created ${certNotifiedCount} certificate issued notification(s) for investor ${investorId}`)
                }

                certificatePublished = true
                console.log(`📜 Certificate published immediately with embedded signatures: ${fileName}`)
                console.log(`   - Document ID: ${document.id}`)
                console.log(`   - Status: published`)
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
      let createdCount = 0
      for (const iu of investorUsers) {
        try {
          await createInvestorNotification({
            userId: iu.user_id,
            investorId,
            type: 'investment_activated',
            title: 'Investment Is Confirmed',
            message: 'Your investment is now fully confirmed and can be reviewed under portfolio.',
            link: '/versotech_main/portfolio',
            sendEmailNotification: true,
            dealId: subscription.deal_id ?? undefined,
          })
          createdCount++
        } catch (notificationError) {
          console.error(`⚠️ Failed to create investment_activated notification for user ${iu.user_id}:`, notificationError)
        }
      }
      console.log(`✅ Created ${createdCount} investment activation notification(s) for investor ${investorId}`)
    }
    return certificatePublished
  } catch (error) {
    if (error instanceof CertificateConfigurationError) {
      console.error(`❌ Certificate generation blocked by configuration for subscription ${subscriptionId}:`, error.message)
      throw error
    }

    console.error(`❌ Certificate trigger failed for subscription ${subscriptionId}:`, error)
    // Don't throw for transient/non-config failures.
    return false
  }
}
