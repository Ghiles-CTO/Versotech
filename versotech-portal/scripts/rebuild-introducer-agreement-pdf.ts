/**
 * Rebuild final signed PDF for an introducer agreement by embedding all signed signatures.
 * Usage: npx tsx scripts/rebuild-introducer-agreement-pdf.ts <agreementId>
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { embedSignatureMultipleLocations } from '../src/lib/signature/pdf-processor'
import { detectAnchors, getPlacementsFromAnchors } from '../src/lib/signature/anchor-detector'

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const [agreementId] = process.argv.slice(2)

if (!agreementId) {
  console.error('Usage: npx tsx scripts/rebuild-introducer-agreement-pdf.ts <agreementId>')
  process.exit(1)
}

const parsePartyBIndex = (position: string) => {
  const match = position.match(/^party_b(?:_(\d+))?$/)
  if (!match) return null
  return match[1] ? parseInt(match[1], 10) : 1
}

const positionSortKey = (position: string) => {
  if (position === 'party_a') return 0
  const partyBIndex = parsePartyBIndex(position)
  if (partyBIndex !== null) return partyBIndex
  return 99
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data: agreement, error: agreementError } = await supabase
    .from('introducer_agreements')
    .select('id, pdf_url, signed_pdf_url, status')
    .eq('id', agreementId)
    .single()

  if (agreementError || !agreement) {
    console.error('Agreement not found:', agreementError)
    process.exit(1)
  }

  if (!agreement.pdf_url) {
    console.error('Agreement has no pdf_url')
    process.exit(1)
  }

  const { data: signatures, error: sigError } = await supabase
    .from('signature_requests')
    .select('id, signature_data_url, signature_placements, signature_position, signer_name, signature_timestamp, status')
    .eq('introducer_agreement_id', agreementId)
    .eq('document_type', 'introducer_agreement')
    .eq('status', 'signed')
    .order('created_at', { ascending: true })

  if (sigError) {
    console.error('Failed to load signatures:', sigError)
    process.exit(1)
  }

  if (!signatures || signatures.length === 0) {
    console.error('No signed signatures found for this agreement')
    process.exit(1)
  }

  const missingData = signatures.filter(s => !s.signature_data_url)
  if (missingData.length > 0) {
    console.error('Missing signature_data_url for:', missingData.map(s => s.id).join(', '))
    process.exit(1)
  }

  const sortedSignatures = signatures
    .slice()
    .sort((a, b) => positionSortKey(a.signature_position) - positionSortKey(b.signature_position))

  const { data: basePdf, error: downloadError } = await supabase.storage
    .from('deal-documents')
    .download(agreement.pdf_url)

  if (downloadError || !basePdf) {
    console.error('Failed to download base PDF:', downloadError)
    process.exit(1)
  }

  let pdfBytes = new Uint8Array(await basePdf.arrayBuffer())

  let anchors: Awaited<ReturnType<typeof detectAnchors>> | null = null
  const needsAnchors = sortedSignatures.some(s => !s.signature_placements || (s.signature_placements as any[]).length === 0)

  if (needsAnchors) {
    anchors = await detectAnchors(pdfBytes)
    if (anchors.length === 0) {
      console.error('No anchors detected in base PDF')
      process.exit(1)
    }
  }

  for (const signature of sortedSignatures) {
    const placements = (signature.signature_placements as any[] | null) && (signature.signature_placements as any[]).length > 0
      ? (signature.signature_placements as any[])
      : anchors
        ? getPlacementsFromAnchors(anchors, signature.signature_position, 'introducer_agreement')
        : []

    if (!placements || placements.length === 0) {
      console.error(`No placements found for ${signature.signature_position} (${signature.id})`)
      process.exit(1)
    }

    pdfBytes = await embedSignatureMultipleLocations({
      pdfBytes,
      signatureDataUrl: signature.signature_data_url,
      placements,
      signerName: signature.signer_name,
      timestamp: signature.signature_timestamp ? new Date(signature.signature_timestamp) : new Date()
    })
  }

  const finalPath = `introducer-signed/${agreement.id}/final_${Date.now()}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('signatures')
    .upload(finalPath, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    console.error('Failed to upload final signed PDF:', uploadError)
    process.exit(1)
  }

  const { error: updateError } = await supabase
    .from('introducer_agreements')
    .update({
      signed_pdf_url: finalPath,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', agreement.id)

  if (updateError) {
    console.error('Failed to update introducer agreement with final PDF:', updateError)
    process.exit(1)
  }

  console.log('✅ Rebuilt final signed PDF:', finalPath)
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
