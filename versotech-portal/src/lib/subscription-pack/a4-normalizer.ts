import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import path from 'path'
import { PDFDocument } from 'pdf-lib'
import { convertHtmlToPdf } from '@/lib/gotenberg/convert'

const A4_WIDTH_PT = 595
const A4_HEIGHT_PT = 842
const A4_TOLERANCE_PT = 2

type PageSize = {
  width: number
  height: number
}

type EnsureA4Params = {
  pdfBuffer: Buffer
  payload: Record<string, any>
  context: 'approval' | 'regenerate'
}

type EnsureA4Result = {
  pdfBuffer: Buffer
  wasNormalized: boolean
  originalSize: PageSize
  finalSize: PageSize
}

function isA4Page(size: PageSize): boolean {
  return (
    Math.abs(size.width - A4_WIDTH_PT) <= A4_TOLERANCE_PT &&
    Math.abs(size.height - A4_HEIGHT_PT) <= A4_TOLERANCE_PT
  )
}

async function getFirstPageSize(pdfBuffer: Buffer): Promise<PageSize> {
  const doc = await PDFDocument.load(pdfBuffer)
  const firstPage = doc.getPages()[0]
  const { width, height } = firstPage.getSize()
  return { width, height }
}

function getTemplateCandidates(): string[] {
  return [
    process.env.SUBSCRIPTION_PACK_TEMPLATE_PATH || '',
    path.join(process.cwd(), '../VERSO/VERSOsign/subscription_pack_template.html'),
    path.join(process.cwd(), 'VERSO/VERSOsign/subscription_pack_template.html'),
    path.join(process.cwd(), 'subscription_pack_template.html'),
  ].filter(Boolean)
}

async function loadSubscriptionPackTemplate(): Promise<string> {
  for (const candidate of getTemplateCandidates()) {
    if (!existsSync(candidate)) continue
    return readFile(candidate, 'utf8')
  }
  throw new Error('Subscription pack template not found')
}

function renderExpression(expression: string, payload: Record<string, any>): string {
  const withFallback = expression.match(/^\$json\.([a-zA-Z0-9_]+)\s*\|\|\s*'([^']*)'$/)
  if (withFallback) {
    const [, key, fallback] = withFallback
    const value = payload[key]
    return value === null || value === undefined || value === '' ? fallback : String(value)
  }

  const direct = expression.match(/^\$json\.([a-zA-Z0-9_]+)$/)
  if (direct) {
    const [, key] = direct
    const value = payload[key]
    return value === null || value === undefined ? '' : String(value)
  }

  return `{{ ${expression} }}`
}

function renderSubscriptionPackHtml(template: string, payload: Record<string, any>): string {
  return template.replace(/{{\s*([^}]+?)\s*}}/g, (_, expression: string) => {
    return renderExpression(expression.trim(), payload)
  })
}

export async function ensureSubscriptionPackA4Pdf({
  pdfBuffer,
  payload,
  context,
}: EnsureA4Params): Promise<EnsureA4Result> {
  const originalSize = await getFirstPageSize(pdfBuffer)

  if (isA4Page(originalSize)) {
    return {
      pdfBuffer,
      wasNormalized: false,
      originalSize,
      finalSize: originalSize,
    }
  }

  console.warn(`⚠️ [SUBPACK ${context.toUpperCase()}] Non-A4 PDF detected, regenerating with local A4 template:`, originalSize)

  try {
    const template = await loadSubscriptionPackTemplate()
    const renderedHtml = renderSubscriptionPackHtml(template, payload)
    const VERSO_HEADER_HTML = `<!DOCTYPE html>
<html><head>
<link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; text-align: center; }
  .verso-logo {
    font-family: 'League Spartan', Arial, sans-serif;
    font-weight: 700;
    font-size: 28pt;
    line-height: 1;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #000;
  }
</style>
</head>
<body><div class="verso-logo">VERSO</div></body>
</html>`

    const conversion = await convertHtmlToPdf(
      renderedHtml,
      'subscription_pack_template.html',
      {
        preferCssPageSize: true,
        printBackground: true,
        paperWidth: 8.27,
        paperHeight: 11.69,
        marginTop: 0.87,
        marginBottom: 0.47,
        marginLeft: 0.39,
        marginRight: 0.39,
        headerHtml: VERSO_HEADER_HTML,
      }
    )

    if (!conversion.success || !conversion.pdfBuffer) {
      console.error(`❌ [SUBPACK ${context.toUpperCase()}] A4 regeneration failed, keeping original PDF:`, conversion.error)
      return {
        pdfBuffer,
        wasNormalized: false,
        originalSize,
        finalSize: originalSize,
      }
    }

    const finalSize = await getFirstPageSize(conversion.pdfBuffer)
    if (!isA4Page(finalSize)) {
      console.error(`❌ [SUBPACK ${context.toUpperCase()}] Regenerated PDF is still not A4, keeping original PDF:`, finalSize)
      return {
        pdfBuffer,
        wasNormalized: false,
        originalSize,
        finalSize: originalSize,
      }
    }

    console.log(`✅ [SUBPACK ${context.toUpperCase()}] Rebuilt as A4 successfully:`, {
      from: originalSize,
      to: finalSize,
    })

    return {
      pdfBuffer: conversion.pdfBuffer,
      wasNormalized: true,
      originalSize,
      finalSize,
    }
  } catch (error) {
    console.error(`❌ [SUBPACK ${context.toUpperCase()}] Exception during A4 normalization, keeping original PDF:`, error)
    return {
      pdfBuffer,
      wasNormalized: false,
      originalSize,
      finalSize: originalSize,
    }
  }
}

