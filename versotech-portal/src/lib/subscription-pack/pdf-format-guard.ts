import { PDFDocument } from 'pdf-lib'

const A4_WIDTH_PT = 595
const A4_HEIGHT_PT = 842
const A4_TOLERANCE_PT = 2

export type PageSize = {
  width: number
  height: number
}

function isA4Page(size: PageSize): boolean {
  return (
    Math.abs(size.width - A4_WIDTH_PT) <= A4_TOLERANCE_PT &&
    Math.abs(size.height - A4_HEIGHT_PT) <= A4_TOLERANCE_PT
  )
}

export async function getFirstPageSize(pdfBuffer: Buffer): Promise<PageSize> {
  const doc = await PDFDocument.load(pdfBuffer)
  const firstPage = doc.getPages()[0]
  const { width, height } = firstPage.getSize()
  return { width, height }
}

export async function assertSubscriptionPackPdfIsA4(
  pdfBuffer: Buffer,
  context: 'approval' | 'regenerate'
): Promise<PageSize> {
  const size = await getFirstPageSize(pdfBuffer)

  if (!isA4Page(size)) {
    throw new Error(
      `[SUBPACK ${context.toUpperCase()}] Non-A4 PDF received from n8n renderer: ${size.width}x${size.height}. ` +
      'Fix n8n Render PDF node (preferCssPageSize=true, paperWidth=8.27, paperHeight=11.69).'
    )
  }

  return size
}

