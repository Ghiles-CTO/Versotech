/**
 * PDF processing utilities for signature embedding
 */

import { PDFDocument, rgb } from 'pdf-lib'
import { SIGNATURE_CONFIG } from './config'
import type { EmbedSignatureParams } from './types'

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
    timestamp = new Date()
  } = params

  // Load PDF document
  const pdfDoc = await PDFDocument.load(pdfBytes)

  // Convert base64 signature to PNG image (Node.js Buffer API)
  const base64Data = signatureDataUrl.split(',')[1]
  if (!base64Data) {
    throw new Error('Invalid signature data URL format')
  }
  const signatureImageBytes = Buffer.from(base64Data, 'base64')

  // Embed signature image
  const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

  // Get last page (typically signature page)
  const pages = pdfDoc.getPages()
  const lastPage = pages[pages.length - 1]
  const { width, height } = lastPage.getSize()

  // Signature dimensions from config
  const { signature: sigConfig, table: tableConfig } = SIGNATURE_CONFIG.pdf

  // Calculate Y position for signature table
  // Standard PDF: 792pt tall, signature space: 50-230pt from bottom
  // Center signatures vertically in signature space
  const signatureY =
    tableConfig.bottom + tableConfig.height / 2 - sigConfig.height / 2

  // Calculate X position based on signature_position (two-column table)
  // PARTY A (left column): centered at 25% of page width
  // PARTY B (right column): centered at 75% of page width
  const xPercent = SIGNATURE_CONFIG.pdf.positions[signaturePosition].xPercent
  const signatureX = width * xPercent - sigConfig.width / 2

  // Draw signature on last page
  lastPage.drawImage(signatureImage, {
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
  lastPage.drawText(`Signed: ${signatureDate}`, {
    x: signatureX,
    y: signatureY - metaConfig.timestampOffsetY,
    size: metaConfig.timestampFontSize,
    color: rgb(metaConfig.textColor.r, metaConfig.textColor.g, metaConfig.textColor.b)
  })

  // Add signer name below timestamp
  lastPage.drawText(`Signer: ${signerName}`, {
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
