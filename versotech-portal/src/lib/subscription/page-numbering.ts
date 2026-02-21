import { existsSync } from 'fs'
import path from 'path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const FOOTER_FONT_SIZE = 9
const FOOTER_Y_FROM_BOTTOM = 16
const FOOTER_ERASE_Y_FROM_BOTTOM = 0
const FOOTER_ERASE_WIDTH = 220
const FOOTER_ERASE_HEIGHT = 132

function ensurePdfjsPolyfills() {
  const g = globalThis as any

  if (typeof g.DOMMatrix === 'undefined') {
    g.DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0
      constructor(init?: any) {
        if (Array.isArray(init) && init.length >= 6) {
          ;[this.a, this.b, this.c, this.d, this.e, this.f] = init
        }
      }
      isIdentity = true
      inverse() { return new DOMMatrix() }
      multiply() { return new DOMMatrix() }
      scale() { return new DOMMatrix() }
      translate() { return new DOMMatrix() }
      transformPoint(p: any) { return p }
      static fromMatrix() { return new DOMMatrix() }
      static fromFloat32Array() { return new DOMMatrix() }
      static fromFloat64Array() { return new DOMMatrix() }
    }
  }

  if (typeof g.ImageData === 'undefined') {
    g.ImageData = class ImageData {
      width: number; height: number; data: Uint8ClampedArray
      constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.data = new Uint8ClampedArray(width * height * 4)
      }
    }
  }

  if (typeof g.Path2D === 'undefined') {
    g.Path2D = class Path2D {
      addPath() {}
      closePath() {}
      moveTo() {}
      lineTo() {}
      bezierCurveTo() {}
      quadraticCurveTo() {}
      arc() {}
      arcTo() {}
      rect() {}
    }
  }
}

async function resolvePdfjsWorkerSrc(): Promise<string | null> {
  const candidates = [
    process.env.PDFJS_WORKER_SRC,
    path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return candidates[0] || null
}

async function detectAppendixStartPage(pdfBytes: Uint8Array): Promise<number | null> {
  ensurePdfjsPolyfills()
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const workerSrc = await resolvePdfjsWorkerSrc()
  if (workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
  }

  const loadingTask = pdfjsLib.getDocument({
    data: pdfBytes,
    useSystemFonts: true,
    disableFontFace: true,
  })

  const pdf = await loadingTask.promise

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .toUpperCase()

    if (pageText.includes('FORM OF ACCESSION UNDERTAKING')) {
      return pageNum
    }
  }

  return null
}

export interface SubscriptionPageNumberingResult {
  pdfBuffer: Buffer
  totalPages: number
  numberedPages: number
  appendixStartPage: number | null
}

export async function applySubscriptionPackPageNumbers(
  input: Buffer | Uint8Array
): Promise<SubscriptionPageNumberingResult> {
  const pdfBytes = input instanceof Buffer
    ? new Uint8Array(input)
    : new Uint8Array(input)

  let appendixStartPage: number | null = null
  try {
    appendixStartPage = await detectAppendixStartPage(new Uint8Array(pdfBytes))
  } catch (error) {
    console.warn('⚠️ [PAGE-NUM] Appendix detection failed, numbering all pages:', error)
  }

  const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes))
  const pages = pdfDoc.getPages()
  const totalPages = pages.length
  const numberedPages = appendixStartPage && appendixStartPage > 1
    ? appendixStartPage - 1
    : totalPages

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  for (const page of pages) {
    page.drawRectangle({
      x: (page.getWidth() - FOOTER_ERASE_WIDTH) / 2,
      y: FOOTER_ERASE_Y_FROM_BOTTOM,
      width: FOOTER_ERASE_WIDTH,
      height: FOOTER_ERASE_HEIGHT,
      color: rgb(1, 1, 1),
    })
  }

  for (let i = 0; i < numberedPages; i++) {
    const page = pages[i]
    const pageLabel = String(i + 1)
    const textWidth = font.widthOfTextAtSize(pageLabel, FOOTER_FONT_SIZE)
    const x = (page.getWidth() - textWidth) / 2

    page.drawText(pageLabel, {
      x,
      y: FOOTER_Y_FROM_BOTTOM,
      size: FOOTER_FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
    })
  }

  return {
    pdfBuffer: Buffer.from(await pdfDoc.save()),
    totalPages,
    numberedPages,
    appendixStartPage,
  }
}
