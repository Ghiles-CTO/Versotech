/**
 * PDF processing utilities for signature embedding
 *
 * Supports both:
 * - Single-page embedding (NDA and legacy documents)
 * - Multi-page embedding (subscription packs where signatures appear on multiple pages)
 */

import { PDFDocument, rgb } from 'pdf-lib'
import { SIGNATURE_CONFIG } from './config'
import { calculateSignaturePosition } from './helpers'
import type { EmbedSignatureParams, EmbedSignatureMultipleParams } from './types'

/**
 * Embed signature into PDF document
 *
 * This function:
 * 1. Loads the PDF document
 * 2. Decodes the signature image from data URL
 * 3. Embeds the signature at the appropriate position (party_a or party_b)
 * 4. Adds timestamp and signer name metadata below the signature
 * 5. Returns the signed PDF as bytes
 */
export async function embedSignatureInPDF(
  params: EmbedSignatureParams
): Promise<Uint8Array> {
  const {
    pdfBytes,
    signatureDataUrl,
    signerName,
    signaturePosition,
    timestamp = new Date(),
    totalPartyASignatories = 1, // Default for backwards compatibility
    pageNumber = -1, // -1 means last page
    xPercent: overrideXPercent,
    yFromBottom: overrideYFromBottom
  } = params

  // Load PDF document
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()

  // Select target page: -1 means last page, otherwise use 1-indexed page number
  const pageIndex = pageNumber === -1
    ? pages.length - 1
    : pageNumber - 1 // Convert 1-indexed to 0-indexed

  // Validate page number
  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new Error(
      `SIGNATURE_ERROR: Invalid page number ${pageNumber}. ` +
      `PDF has ${pages.length} pages (valid range: 1-${pages.length}).`
    )
  }

  const targetPage = pages[pageIndex]
  const { width, height } = targetPage.getSize()

  console.log(`📄 [SIGNATURE] Embedding on page ${pageIndex + 1} of ${pages.length} (${width.toFixed(0)}x${height.toFixed(0)}pt)`)

  // Convert base64 signature to PNG image (Node.js Buffer API)
  const base64Data = signatureDataUrl.split(',')[1]
  if (!base64Data) {
    throw new Error('Invalid signature data URL format')
  }
  const signatureImageBytes = Buffer.from(base64Data, 'base64')

  // Embed signature image
  const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

  // Signature dimensions from config
  const { signature: sigConfig } = SIGNATURE_CONFIG.pdf

  // Use override positions if provided, otherwise calculate from position string
  // Note: For subscription documents, positions should be passed from anchor detection
  let xPercent: number
  let yFromBottom: number

  if (overrideXPercent !== undefined && overrideYFromBottom !== undefined) {
    // Use anchor-detected or explicitly provided positions
    xPercent = overrideXPercent
    yFromBottom = overrideYFromBottom
    console.log(`📍 [SIGNATURE] Using provided position: x=${(xPercent * 100).toFixed(1)}%, y=${yFromBottom.toFixed(1)}pt`)
  } else {
    // Legacy fallback for non-subscription documents
    const calculatedPosition = calculateSignaturePosition(
      signaturePosition,
      totalPartyASignatories,
      params.documentType || 'nda'
    )
    xPercent = calculatedPosition.xPercent
    yFromBottom = calculatedPosition.yFromBottom
    console.log(`📍 [SIGNATURE] Using calculated position: x=${(xPercent * 100).toFixed(1)}%, y=${yFromBottom.toFixed(1)}pt`)
  }

  // Calculate actual X coordinate (percentage of page width, centered on signature)
  const signatureX = width * xPercent - sigConfig.width / 2

  // Calculate actual Y coordinate (from bottom of page)
  const signatureY = yFromBottom

  // Draw signature on target page
  targetPage.drawImage(signatureImage, {
    x: signatureX,
    y: signatureY,
    width: sigConfig.width,
    height: sigConfig.height
  })

  // Format signature timestamp
  const signatureDate = timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })

  const { metadata: metaConfig } = SIGNATURE_CONFIG.pdf

  // Add signature timestamp text below signature
  targetPage.drawText(`Signed: ${signatureDate}`, {
    x: signatureX,
    y: signatureY - metaConfig.timestampOffsetY,
    size: metaConfig.timestampFontSize,
    color: rgb(metaConfig.textColor.r, metaConfig.textColor.g, metaConfig.textColor.b)
  })

  // Add signer name below timestamp
  targetPage.drawText(`Signer: ${signerName}`, {
    x: signatureX,
    y: signatureY - metaConfig.signerNameOffsetY,
    size: metaConfig.timestampFontSize,
    color: rgb(metaConfig.textColor.r, metaConfig.textColor.g, metaConfig.textColor.b)
  })

  // Save modified PDF
  const signedPdfBytes = await pdfDoc.save()

  return new Uint8Array(signedPdfBytes)
}

/**
 * Embed signature into PDF document on MULTIPLE pages
 *
 * Used for subscription packs where each signer needs their signature on multiple pages:
 * - Subscribers: page 12 (main agreement) + page 40 (appendix)
 * - Issuer/Arranger: page 12 (main agreement) + page 39 (T&Cs)
 *
 * This function:
 * 1. Loads the PDF document
 * 2. Decodes the signature image from data URL
 * 3. For EACH placement in the array:
 *    - Embeds signature at the specified page and position
 *    - Adds timestamp and signer name below signature
 * 4. Returns the signed PDF with all placements applied
 */
export async function embedSignatureMultipleLocations(
  params: EmbedSignatureMultipleParams
): Promise<Uint8Array> {
  const {
    pdfBytes,
    signatureDataUrl,
    placements,
    signerName,
    timestamp = new Date()
  } = params

  if (!placements || placements.length === 0) {
    throw new Error('SIGNATURE_ERROR: No placements provided for multi-page embedding')
  }

  // Load PDF document
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  const totalPages = pages.length

  console.log(`📄 [MULTI-SIGN] PDF loaded: ${totalPages} pages, ${placements.length} placement(s) to embed for ${signerName}`)
  console.log(`📍 [MULTI-SIGN] Placement details:`, placements.map(p => ({
    page: p.page,
    label: p.label,
    x: `${(p.x * 100).toFixed(1)}%`,
    y: `${p.y.toFixed(0)}pt`
  })))

  // Convert base64 signature to PNG image (Node.js Buffer API)
  const base64Data = signatureDataUrl.split(',')[1]
  if (!base64Data) {
    throw new Error('Invalid signature data URL format')
  }
  const signatureImageBytes = Buffer.from(base64Data, 'base64')

  // Embed signature image once (reused across all pages)
  const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

  // Signature dimensions from config
  const { signature: sigConfig } = SIGNATURE_CONFIG.pdf
  const { metadata: metaConfig } = SIGNATURE_CONFIG.pdf

  // Format signature timestamp once (same for all placements)
  const signatureDate = timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })

  // Embed signature on each placement
  for (const placement of placements) {
    const pageIndex = placement.page - 1 // Convert 1-indexed to 0-indexed

    // Validate page number
    if (pageIndex < 0 || pageIndex >= totalPages) {
      console.error(`❌ [MULTI-SIGN] SKIPPING: Invalid page ${placement.page} (PDF has ${totalPages} pages)`)
      console.error(`   Placement: ${placement.label} for ${signerName}`)
      console.error(`   This suggests the PDF template may have fewer pages than expected`)
      continue
    }

    const targetPage = pages[pageIndex]
    const { width, height } = targetPage.getSize()

    // Calculate actual X coordinate (percentage of page width, centered on signature)
    const signatureX = width * placement.x - sigConfig.width / 2

    // Y coordinate is already in points from bottom
    const signatureY = placement.y

    // COMPACT LAYOUT DETECTION: Page 3 (wire_instructions) has Name:/Title: fields
    // immediately below the signature line. Use smaller font and tighter spacing
    // to prevent metadata from overflowing into those fields.
    const isCompactLayout = placement.label === 'wire_instructions'
    const metaFontSize = isCompactLayout ? 5 : metaConfig.timestampFontSize  // 5pt vs 7pt
    const timestampOffset = isCompactLayout ? 8 : metaConfig.timestampOffsetY  // 8pt vs 12pt
    const signerOffset = isCompactLayout ? 14 : metaConfig.signerNameOffsetY   // 14pt vs 22pt

    console.log(`📍 [MULTI-SIGN] Embedding on page ${placement.page} (${placement.label}):`, {
      x: `${(placement.x * 100).toFixed(1)}%`,
      y: `${placement.y}pt`,
      pageSize: `${width.toFixed(0)}x${height.toFixed(0)}pt`,
      compactLayout: isCompactLayout
    })

    // Draw signature on target page
    targetPage.drawImage(signatureImage, {
      x: signatureX,
      y: signatureY,
      width: sigConfig.width,
      height: sigConfig.height
    })

    // Add signature timestamp text below signature
    targetPage.drawText(`Signed: ${signatureDate}`, {
      x: signatureX,
      y: signatureY - timestampOffset,
      size: metaFontSize,
      color: rgb(metaConfig.textColor.r, metaConfig.textColor.g, metaConfig.textColor.b)
    })

    // Add signer name below timestamp
    targetPage.drawText(`Signer: ${signerName}`, {
      x: signatureX,
      y: signatureY - signerOffset,
      size: metaFontSize,
      color: rgb(metaConfig.textColor.r, metaConfig.textColor.g, metaConfig.textColor.b)
    })
  }

  console.log(`✅ [MULTI-SIGN] Signature embedded on ${placements.length} page(s)`)

  // Save modified PDF
  const signedPdfBytes = await pdfDoc.save()

  return new Uint8Array(signedPdfBytes)
}

/**
 * Validate PDF bytes
 */
export async function validatePDF(pdfBytes: Uint8Array): Promise<boolean> {
  try {
    await PDFDocument.load(pdfBytes)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get PDF page count
 */
export async function getPDFPageCount(pdfBytes: Uint8Array): Promise<number> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  return pdfDoc.getPageCount()
}

/**
 * Get PDF dimensions (width x height of first page)
 */
export async function getPDFDimensions(
  pdfBytes: Uint8Array
): Promise<{ width: number; height: number }> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  const firstPage = pages[0]
  return firstPage.getSize()
}
