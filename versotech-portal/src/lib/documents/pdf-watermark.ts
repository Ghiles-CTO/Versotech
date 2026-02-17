/**
 * Server-side PDF watermarking for data room documents.
 * Burns a diagonal repeating watermark into every page so it persists in downloads.
 */

import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'

interface WatermarkText {
  line1: string
  line2?: string
}

/**
 * Apply a repeating diagonal watermark grid to every page of a PDF.
 *
 * @param pdfBytes  - Raw PDF bytes from Supabase storage
 * @param watermarkText - Line 1 (email) and optional line 2 (entity name)
 * @returns Watermarked PDF bytes
 */
export async function applyPdfWatermark(
  pdfBytes: Uint8Array,
  watermarkText: WatermarkText
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const fontSize = 10
  const opacity = 0.12
  const color = rgb(0.7, 0.7, 0.7)
  const rotation = degrees(-35)

  // Build watermark string
  const text = watermarkText.line2
    ? `${watermarkText.line1}  |  ${watermarkText.line2}`
    : watermarkText.line1

  const pages = pdfDoc.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()

    // Calculate spacing for the repeating grid
    const textWidth = font.widthOfTextAtSize(text, fontSize)
    const spacingX = textWidth + 80
    const spacingY = 120

    // Cover the page with a grid of diagonal watermarks.
    // Start from negative offsets to cover corners after rotation.
    const diagonal = Math.sqrt(width * width + height * height)

    for (let y = -diagonal * 0.3; y < diagonal; y += spacingY) {
      for (let x = -diagonal * 0.3; x < diagonal; x += spacingX) {
        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color,
          opacity,
          rotate: rotation,
        })
      }
    }
  }

  const watermarkedBytes = await pdfDoc.save()
  return new Uint8Array(watermarkedBytes)
}
