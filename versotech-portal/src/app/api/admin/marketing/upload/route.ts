import { Buffer } from 'node:buffer'
import { NextRequest, NextResponse } from 'next/server'

import { requireMarketingAdmin } from '@/lib/dashboard-marketing/auth'
import {
  isSupportedMarketingDocument,
  uploadMarketingDocumentAsset,
} from '@/lib/dashboard-marketing/documents'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const auth = await requireMarketingAdmin()
  if (auth.response) {
    return auth.response
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const mediaKind = (formData.get('media_kind') as string | null) ?? 'image'

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  if (!['image', 'video', 'document'].includes(mediaKind)) {
    return NextResponse.json({ error: 'Unsupported media kind' }, { status: 400 })
  }

  if (mediaKind === 'image' && !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Image uploads must use an image file' }, { status: 400 })
  }

  if (mediaKind === 'video' && !file.type.startsWith('video/')) {
    return NextResponse.json({ error: 'Video uploads must use a video file' }, { status: 400 })
  }

  const supabase = createServiceClient() as any

  if (mediaKind === 'document') {
    if (!isSupportedMarketingDocument(file.name, file.type)) {
      return NextResponse.json(
        {
          error: 'Document uploads must use a PDF or Word file (.pdf, .doc, .docx)',
        },
        { status: 400 }
      )
    }

    try {
      const payload = await uploadMarketingDocumentAsset({
        supabase,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        bytes: new Uint8Array(await file.arrayBuffer()),
      })

      return NextResponse.json({
        success: true,
        ...payload,
      })
    } catch (error) {
      console.error('[admin/marketing/upload] Failed to upload document asset:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to upload document' },
        { status: 500 }
      )
    }
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `marketing/${mediaKind}/${Date.now()}-${sanitizedName}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('public-assets')
    .upload(storagePath, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    console.error('[admin/marketing/upload] Failed to upload asset:', uploadError)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }

  const { data: publicData } = supabase.storage.from('public-assets').getPublicUrl(storagePath)

  return NextResponse.json({
    success: true,
    url: publicData?.publicUrl ?? null,
    path: storagePath,
  })
}
