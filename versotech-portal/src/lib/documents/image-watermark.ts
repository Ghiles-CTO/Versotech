/**
 * Server-side image watermarking for data room documents.
 * Composites a repeating diagonal text watermark over images using sharp.
 */

import sharp from 'sharp'

interface ImageWatermarkOptions {
  email: string
  entityName?: string
}

/**
 * Apply a repeating diagonal watermark grid to an image.
 *
 * @param imageBytes - Raw image bytes from Supabase storage
 * @param opts       - Viewer email and optional entity name
 * @returns Watermarked image as a PNG buffer
 */
export async function applyImageWatermark(
  imageBytes: Uint8Array,
  opts: ImageWatermarkOptions
): Promise<Buffer> {
  const { email, entityName } = opts

  // Get image metadata to size the SVG overlay correctly
  const image = sharp(Buffer.from(imageBytes))
  const meta = await image.metadata()
  const width = meta.width ?? 800
  const height = meta.height ?? 600

  const line1 = email
  const line2 = entityName || ''

  // Build a repeating grid of diagonal text stamps in SVG.
  // The SVG covers 200%×200% of the image, centred, then rotated -35°
  // so the text fills every corner after rotation.
  const gridRows = 8
  const gridCols = 5
  const spacingX = Math.round((width * 2) / gridCols)
  const spacingY = Math.round((height * 2) / gridRows)

  const stamps: string[] = []
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const x = col * spacingX
      const y = row * spacingY
      stamps.push(`
        <text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif"
              font-size="18" font-weight="700" fill="#666666" opacity="0.12">
          ${escapeXml(line1)}
        </text>
        ${line2 ? `<text x="${x}" y="${y + 22}" font-family="Arial, Helvetica, sans-serif"
              font-size="14" font-weight="600" fill="#666666" opacity="0.12">
          ${escapeXml(line2)}
        </text>` : ''}
      `)
    }
  }

  // Overlay SVG dimensions: double the image size so rotation doesn't leave bare corners
  const svgW = width * 2
  const svgH = height * 2
  const centerX = svgW / 2
  const centerY = svgH / 2

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}">
      <g transform="rotate(-35 ${centerX} ${centerY})">
        ${stamps.join('')}
      </g>
    </svg>
  `

  const svgBuffer = Buffer.from(svg)

  return sharp(Buffer.from(imageBytes))
    .composite([{
      input: svgBuffer,
      blend: 'over',
      // Centre the larger overlay over the image
      left: -Math.round(width / 2),
      top: -Math.round(height / 2),
    }])
    .png()
    .toBuffer()
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
