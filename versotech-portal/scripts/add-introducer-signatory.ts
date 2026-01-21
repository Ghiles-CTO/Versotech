/**
 * One-off helper: add missing introducer signatory request + task
 * Usage: npx tsx scripts/add-introducer-signatory.ts <agreementId> <signerEmail> [signaturePosition]
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { SignatureStorageManager } from '../src/lib/signature/storage'
import { detectAnchors, getPlacementsFromAnchors } from '../src/lib/signature/anchor-detector'

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const [agreementId, signerEmail, signaturePositionArg] = process.argv.slice(2)

if (!agreementId || !signerEmail) {
  console.error('Usage: npx tsx scripts/add-introducer-signatory.ts <agreementId> <signerEmail> [signaturePosition]')
  process.exit(1)
}

const signaturePosition = signaturePositionArg || 'party_b_2'

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data: agreement, error: agreementError } = await supabase
    .from('introducer_agreements')
    .select(`
      id,
      deal_id,
      introducer_id,
      pdf_url,
      introducer:introducer_id (
        legal_name
      )
    `)
    .eq('id', agreementId)
    .single()

  if (agreementError || !agreement) {
    console.error('Agreement not found:', agreementError)
    process.exit(1)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('email', signerEmail)
    .single()

  if (profileError || !profile) {
    console.error('Signer profile not found:', profileError)
    process.exit(1)
  }

  const { data: existing } = await supabase
    .from('signature_requests')
    .select('id')
    .eq('introducer_agreement_id', agreementId)
    .eq('signer_email', signerEmail)
    .eq('signature_position', signaturePosition)
    .maybeSingle()

  if (existing?.id) {
    console.log('Signature request already exists:', existing.id)
    process.exit(0)
  }

  const { data: partyARequest } = await supabase
    .from('signature_requests')
    .select('signed_pdf_path, unsigned_pdf_path')
    .eq('introducer_agreement_id', agreementId)
    .eq('signature_position', 'party_a')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const basePdfPath = partyARequest?.signed_pdf_path || agreement.pdf_url

  if (!basePdfPath) {
    console.error('No base PDF path found for introducer agreement')
    process.exit(1)
  }

  const storage = new SignatureStorageManager(supabase)
  const pdfBytes = await storage.downloadPDF(basePdfPath)
  const anchors = await detectAnchors(pdfBytes)

  if (anchors.length === 0) {
    console.error('No anchors detected in PDF')
    process.exit(1)
  }

  const placements = getPlacementsFromAnchors(anchors, signaturePosition, 'introducer_agreement')

  if (placements.length === 0) {
    console.error(`No placements found for ${signaturePosition}`)
    process.exit(1)
  }

  const signingToken = crypto.randomBytes(32).toString('hex')
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 14)

  const { data: signatureRequest, error: sigReqError } = await supabase
    .from('signature_requests')
    .insert({
      document_type: 'introducer_agreement',
      introducer_agreement_id: agreement.id,
      introducer_id: agreement.introducer_id,
      deal_id: agreement.deal_id,
      investor_id: null,
      signer_email: profile.email,
      signer_name: profile.display_name || profile.email || 'Introducer',
      signer_role: 'introducer',
      signature_position: signaturePosition,
      status: 'pending',
      signing_token: signingToken,
      token_expires_at: expiryDate.toISOString(),
      unsigned_pdf_path: basePdfPath,
      signature_placements: placements,
    })
    .select('id')
    .single()

  if (sigReqError || !signatureRequest) {
    console.error('Failed to create signature request:', sigReqError)
    process.exit(1)
  }

  const { error: taskError } = await supabase
    .from('tasks')
    .insert({
      owner_user_id: profile.id,
      kind: 'countersignature',
      category: 'signatures',
      title: `Sign Fee Agreement - ${agreement.introducer?.legal_name || 'Introducer'}`,
      description: 'Review and sign the introducer fee agreement. (2 signatories required)',
      status: 'pending',
      priority: 'high',
      related_entity_type: 'signature_request',
      related_entity_id: signatureRequest.id,
      related_deal_id: agreement.deal_id,
      due_at: expiryDate.toISOString(),
      instructions: {
        type: 'signature',
        action_url: `/sign/${signingToken}`,
        signature_request_id: signatureRequest.id,
        document_type: 'introducer_agreement',
        agreement_id: agreement.id,
        introducer_name: agreement.introducer?.legal_name || 'Introducer',
      },
    })

  if (taskError) {
    console.error('Failed to create task:', taskError)
    process.exit(1)
  }

  console.log('Created introducer signature request:', signatureRequest.id)
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
