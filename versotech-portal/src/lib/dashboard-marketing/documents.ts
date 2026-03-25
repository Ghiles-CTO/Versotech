import { Buffer } from 'node:buffer'
import { existsSync } from 'node:fs'
import path from 'node:path'

import {
  DOMMatrix as CanvasDOMMatrix,
  ImageData as CanvasImageData,
  Path2D as CanvasPath2D,
  createCanvas,
} from '@napi-rs/canvas'
import sharp from 'sharp'

import {
  buildOfficePreviewUrl,
  getOfficePreviewType,
} from '@/lib/documents/office-viewer'
import { convertOfficePreviewToPdf } from '@/lib/gotenberg/office-preview'
import type { DocumentUrlResponse } from '@/types/document-viewer.types'

const MARKETING_DOCUMENT_BUCKET = process.env.STORAGE_BUCKET_NAME || 'documents'
const MARKETING_DOCUMENT_PREFIX = 'marketing/documents'
const MARKETING_DOCUMENT_PREVIEW_PREFIX = 'marketing/previews'
const PREVIEW_SIGNED_URL_TTL_SECONDS = 900
const COVER_SIGNED_URL_TTL_SECONDS = 3600
const COVER_WIDTH = 1280
const COVER_HEIGHT = 800

const MARKETING_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const MARKETING_DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx'])

type ServiceSupabaseClient = {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        body: Uint8Array | Buffer,
        options: { contentType: string; upsert: boolean }
      ): Promise<{ error: { message?: string } | null }>
      createSignedUrl(
        path: string,
        expiresIn: number
      ): Promise<{ data: { signedUrl?: string } | null; error: { message?: string } | null }>
      remove(paths: string[]): Promise<{ error: { message?: string } | null }>
    }
  }
}

type MarketingDocumentRow = {
  id: string
  document_storage_path: string | null
  document_file_name: string | null
  document_mime_type: string | null
}

let pdfjsPromise: Promise<any> | null = null

function ensurePdfjsPolyfills() {
  const g = globalThis as any

  if (typeof g.DOMMatrix === 'undefined') {
    g.DOMMatrix = CanvasDOMMatrix
  }

  if (typeof g.ImageData === 'undefined') {
    g.ImageData = CanvasImageData
  }

  if (typeof g.Path2D === 'undefined') {
    g.Path2D = CanvasPath2D
  }
}

function resolvePdfjsWorkerSrc() {
  const candidates = [
    process.env.PDFJS_WORKER_SRC,
    path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'),
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

function loadPdfjs() {
  ensurePdfjsPolyfills()

  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs').then((pdfjs) => {
      const workerSrc = resolvePdfjsWorkerSrc()
      if (workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
      }

      return pdfjs
    })
  }

  return pdfjsPromise
}

function getFileExtension(fileName: string | null | undefined) {
  return fileName?.split('.').pop()?.toLowerCase() || ''
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function isSupportedMarketingDocument(
  fileName: string | null | undefined,
  mimeType: string | null | undefined
) {
  const extension = getFileExtension(fileName)
  const normalizedMimeType = (mimeType || '').toLowerCase()

  if (!MARKETING_DOCUMENT_EXTENSIONS.has(extension)) {
    return false
  }

  if (!normalizedMimeType || normalizedMimeType === 'application/octet-stream') {
    return true
  }

  return MARKETING_DOCUMENT_MIME_TYPES.has(normalizedMimeType)
}

export function getMarketingDocumentPreviewType(
  fileName: string | null | undefined,
  mimeType: string | null | undefined
) {
  const extension = getFileExtension(fileName)

  if (extension === 'pdf' || mimeType === 'application/pdf') {
    return 'pdf'
  }

  return getOfficePreviewType(fileName, mimeType) ?? 'docx'
}

async function createSignedUrl(
  supabase: ServiceSupabaseClient,
  path: string,
  expiresIn: number
) {
  const { data, error } = await supabase.storage
    .from(MARKETING_DOCUMENT_BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Failed to create signed URL')
  }

  return data.signedUrl
}

async function renderPdfCoverImage(pdfBytes: Uint8Array) {
  const pdfjs = await loadPdfjs()
  const loadingTask = pdfjs.getDocument({
    data: pdfBytes,
    useSystemFonts: true,
    disableFontFace: true,
  })
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 2 })
  const canvas = createCanvas(
    Math.ceil(viewport.width),
    Math.ceil(viewport.height)
  )
  const context = canvas.getContext('2d')

  await page.render({
    canvasContext: context as any,
    viewport,
  }).promise

  const rasterizedPage = Buffer.from(canvas.toBuffer('image/png'))

  return sharp(rasterizedPage)
    .flatten({ background: '#ffffff' })
    .resize(COVER_WIDTH, COVER_HEIGHT, {
      fit: 'cover',
      position: 'north',
    })
    .jpeg({
      quality: 88,
      chromaSubsampling: '4:4:4',
    })
    .toBuffer()
}

async function buildDocumentCoverImage(args: {
  bytes: Uint8Array
  fileName: string
  mimeType: string
}) {
  const { bytes, fileName, mimeType } = args
  const previewType = getMarketingDocumentPreviewType(fileName, mimeType)
  const pdfBytes =
    previewType === 'pdf'
      ? bytes
      : await convertOfficePreviewToPdf({
          bytes,
          fileName,
          mimeType,
        })

  return renderPdfCoverImage(pdfBytes)
}

export async function uploadMarketingDocumentAsset(args: {
  supabase: ServiceSupabaseClient
  fileName: string
  mimeType: string
  bytes: Uint8Array
}) {
  const { supabase, fileName, mimeType, bytes } = args
  const safeFileName = sanitizeFileName(fileName)
  const documentStoragePath = `${MARKETING_DOCUMENT_PREFIX}/${Date.now()}-${safeFileName}`
  const previewFileName = safeFileName.replace(/\.[^.]+$/, '') || 'document'
  const documentPreviewStoragePath = `${MARKETING_DOCUMENT_PREVIEW_PREFIX}/${Date.now()}-${previewFileName}.jpg`

  const { error: uploadDocumentError } = await supabase.storage
    .from(MARKETING_DOCUMENT_BUCKET)
    .upload(documentStoragePath, Buffer.from(bytes), {
      contentType: mimeType,
      upsert: false,
    })

  if (uploadDocumentError) {
    throw new Error(uploadDocumentError.message || 'Failed to upload document')
  }

  const previewType = getMarketingDocumentPreviewType(fileName, mimeType)
  const signedDocumentUrl = await createSignedUrl(
    supabase,
    documentStoragePath,
    PREVIEW_SIGNED_URL_TTL_SECONDS
  )
  const previewUrl =
    previewType === 'pdf'
      ? signedDocumentUrl
      : buildOfficePreviewUrl(signedDocumentUrl)

  // Cover image generation is non-fatal — large PDFs can fail to render
  let coverStoragePath: string | null = null
  let coverSignedUrl: string | null = null

  try {
    const coverBytes = await buildDocumentCoverImage({
      bytes,
      fileName,
      mimeType,
    })

    const { error: uploadPreviewError } = await supabase.storage
      .from(MARKETING_DOCUMENT_BUCKET)
      .upload(documentPreviewStoragePath, coverBytes, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (!uploadPreviewError) {
      coverStoragePath = documentPreviewStoragePath
      coverSignedUrl = await createSignedUrl(
        supabase,
        documentPreviewStoragePath,
        COVER_SIGNED_URL_TTL_SECONDS
      )
    } else {
      console.warn(
        `[marketing-docs] Cover upload failed for "${fileName}":`,
        uploadPreviewError.message
      )
    }
  } catch (coverError) {
    console.warn(
      `[marketing-docs] Cover generation failed for "${fileName}":`,
      coverError instanceof Error ? coverError.message : coverError
    )
  }

  return {
    document_storage_path: documentStoragePath,
    document_file_name: fileName,
    document_mime_type: mimeType,
    document_preview_storage_path: coverStoragePath,
    document_preview_url: previewUrl,
    document_preview_strategy:
      previewType === 'pdf' ? 'direct' : 'office_embed',
    document_preview_type: previewType,
    image_url: coverSignedUrl,
  }
}

/**
 * Finalize a marketing document that was uploaded via presigned URL.
 * The document is already in storage at `fileKey`; this function generates
 * the cover image and preview metadata without re-uploading the document.
 */
export async function finalizePresignedMarketingDocument(args: {
  supabase: ServiceSupabaseClient
  fileKey: string
  fileName: string
  mimeType: string
  bytes: Uint8Array
}) {
  const { supabase, fileKey, fileName, mimeType, bytes } = args
  const safeFileName = sanitizeFileName(fileName)
  const previewFileName = safeFileName.replace(/\.[^.]+$/, '') || 'document'
  const documentPreviewStoragePath = `${MARKETING_DOCUMENT_PREVIEW_PREFIX}/${Date.now()}-${previewFileName}.jpg`

  const previewType = getMarketingDocumentPreviewType(fileName, mimeType)
  const signedDocumentUrl = await createSignedUrl(
    supabase,
    fileKey,
    PREVIEW_SIGNED_URL_TTL_SECONDS
  )
  const previewUrl =
    previewType === 'pdf'
      ? signedDocumentUrl
      : buildOfficePreviewUrl(signedDocumentUrl)

  // Cover image generation is non-fatal
  let coverStoragePath: string | null = null
  let coverSignedUrl: string | null = null

  try {
    const coverBytes = await buildDocumentCoverImage({
      bytes,
      fileName,
      mimeType,
    })

    const { error: uploadPreviewError } = await supabase.storage
      .from(MARKETING_DOCUMENT_BUCKET)
      .upload(documentPreviewStoragePath, coverBytes, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (!uploadPreviewError) {
      coverStoragePath = documentPreviewStoragePath
      coverSignedUrl = await createSignedUrl(
        supabase,
        documentPreviewStoragePath,
        COVER_SIGNED_URL_TTL_SECONDS
      )
    } else {
      console.warn(
        `[marketing-docs] Cover upload failed for "${fileName}":`,
        uploadPreviewError.message
      )
    }
  } catch (coverError) {
    console.warn(
      `[marketing-docs] Cover generation failed for "${fileName}":`,
      coverError instanceof Error ? coverError.message : coverError
    )
  }

  return {
    document_storage_path: fileKey,
    document_file_name: fileName,
    document_mime_type: mimeType,
    document_preview_storage_path: coverStoragePath,
    document_preview_url: previewUrl,
    document_preview_strategy:
      previewType === 'pdf' ? 'direct' : 'office_embed',
    document_preview_type: previewType,
    image_url: coverSignedUrl,
  }
}

export async function resolveMarketingDocumentCoverUrl(
  supabase: ServiceSupabaseClient,
  path: string | null | undefined
) {
  if (!path) return null

  return createSignedUrl(supabase, path, COVER_SIGNED_URL_TTL_SECONDS)
}

export async function buildMarketingDocumentPreviewResponse(args: {
  supabase: ServiceSupabaseClient
  card: MarketingDocumentRow
  mode: 'preview' | 'download'
}): Promise<DocumentUrlResponse> {
  const { supabase, card, mode } = args

  if (
    !card.document_storage_path ||
    !card.document_file_name ||
    !card.document_mime_type
  ) {
    throw new Error('Marketing document metadata is incomplete')
  }

  const signedDocumentUrl = await createSignedUrl(
    supabase,
    card.document_storage_path,
    PREVIEW_SIGNED_URL_TTL_SECONDS
  )
  const previewType = getMarketingDocumentPreviewType(
    card.document_file_name,
    card.document_mime_type
  )
  const isPreviewMode = mode === 'preview'
  const shouldUseOfficeEmbed = isPreviewMode && previewType !== 'pdf'
  const responseUrl = shouldUseOfficeEmbed
    ? buildOfficePreviewUrl(signedDocumentUrl)
    : signedDocumentUrl
  const previewStrategy = shouldUseOfficeEmbed ? 'office_embed' : 'direct'

  return {
    download_url: responseUrl,
    url: responseUrl,
    mode,
    preview_strategy: previewStrategy,
    document: {
      id: card.id,
      name: card.document_file_name,
      type: previewType,
      preview_strategy: previewStrategy,
    },
    expires_in_seconds: PREVIEW_SIGNED_URL_TTL_SECONDS,
  }
}
