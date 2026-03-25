import { NextRequest, NextResponse } from 'next/server'

import { requireMarketingAdmin } from '@/lib/dashboard-marketing/auth'
import {
  isSupportedMarketingDocument,
  finalizePresignedMarketingDocument,
} from '@/lib/dashboard-marketing/documents'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MARKETING_DOCUMENT_BUCKET = process.env.STORAGE_BUCKET_NAME || 'documents'
const MARKETING_DOCUMENT_PREFIX = 'marketing/documents'

/**
 * POST — Step 1: Generate a presigned upload URL for direct browser-to-storage upload.
 * Only JSON metadata is sent through the serverless function; the actual file
 * goes directly to Supabase Storage, bypassing the Vercel body-size limit.
 */
export async function POST(request: NextRequest) {
  const auth = await requireMarketingAdmin()
  if (auth.response) return auth.response
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { fileName, mimeType, fileSize } = await request.json()

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 })
    }

    if (!isSupportedMarketingDocument(fileName, mimeType)) {
      return NextResponse.json(
        { error: 'Document uploads must use a PDF or Word file (.pdf, .doc, .docx)' },
        { status: 400 }
      )
    }

    // 500 MB max for marketing documents
    const maxSize = 500 * 1024 * 1024
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 500 MB' },
        { status: 400 }
      )
    }

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileKey = `${MARKETING_DOCUMENT_PREFIX}/${Date.now()}-${sanitizedName}`

    const serviceSupabase = createServiceClient()
    const { data, error } = await (serviceSupabase as any).storage
      .from(MARKETING_DOCUMENT_BUCKET)
      .createSignedUploadUrl(fileKey)

    if (error) {
      console.error('[marketing/presigned-upload] Presigned URL error:', error)
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      fileKey,
      token: data.token,
    })
  } catch (error) {
    console.error('[marketing/presigned-upload] Error:', error)
    return NextResponse.json({ error: 'Unexpected error creating upload URL' }, { status: 500 })
  }
}

/**
 * PUT — Step 3: Finalize the upload after the browser has uploaded directly to storage.
 * Downloads the uploaded file from storage, generates a cover image, and returns
 * all document metadata needed by the marketing card form.
 */
export async function PUT(request: NextRequest) {
  const auth = await requireMarketingAdmin()
  if (auth.response) return auth.response
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { fileKey, fileName, mimeType } = await request.json()

    if (!fileKey || !fileName) {
      return NextResponse.json(
        { error: 'fileKey and fileName are required' },
        { status: 400 }
      )
    }

    const serviceSupabase = createServiceClient() as any

    // Download the file that was uploaded via presigned URL
    const { data: fileData, error: downloadError } = await serviceSupabase.storage
      .from(MARKETING_DOCUMENT_BUCKET)
      .download(fileKey)

    if (downloadError || !fileData) {
      console.error('[marketing/presigned-upload] File not found after upload:', downloadError)
      return NextResponse.json({ error: 'Uploaded file not found in storage' }, { status: 404 })
    }

    const bytes = new Uint8Array(await fileData.arrayBuffer())

    // Generate cover image and preview metadata
    const payload = await finalizePresignedMarketingDocument({
      supabase: serviceSupabase,
      fileKey,
      fileName,
      mimeType: mimeType || 'application/octet-stream',
      bytes,
    })

    return NextResponse.json({ success: true, ...payload })
  } catch (error) {
    console.error('[marketing/presigned-upload] Finalize error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to finalize upload' },
      { status: 500 }
    )
  }
}
