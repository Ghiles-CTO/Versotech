import { NextRequest, NextResponse } from 'next/server'
import { Buffer } from 'node:buffer'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const clientSupabase = await createClient()
  const serviceSupabase = createServiceClient()

  const {
    data: { user },
    error: authError
  } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role?.startsWith('staff_')) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const vehicleId = (formData.get('vehicle_id') as string | null) ?? 'new'

  if (!file) {
    return NextResponse.json({ error: 'Logo file is required' }, { status: 400 })
  }

  const bucket =
    process.env.NEXT_PUBLIC_VEHICLE_LOGO_BUCKET ||
    process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME ||
    process.env.DOCS_BUCKET ||
    'documents'
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `vehicle-logos/${vehicleId}/${timestamp}-${sanitizedName}`

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await serviceSupabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/png',
        upsert: false
      })

    if (uploadError) {
      console.error('[vehicles/logo-upload] Failed to upload logo', uploadError)
      return NextResponse.json(
        { error: `Failed to upload logo: ${uploadError.message || 'unknown storage error'}` },
        { status: 500 }
      )
    }

    let publicUrl: string | null = null

    try {
      const { data: publicData } = serviceSupabase.storage.from(bucket).getPublicUrl(storagePath)
      publicUrl = publicData?.publicUrl ?? null
    } catch (publicError) {
      console.warn('[vehicles/logo-upload] Failed to get public URL', publicError)
    }

    if (!publicUrl) {
      const { data: signedData, error: signedError } = await serviceSupabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365) // 1 year

      if (signedError || !signedData?.signedUrl) {
        console.error('[vehicles/logo-upload] Failed to create signed URL', signedError)
        return NextResponse.json(
          { error: `Failed to generate logo URL: ${signedError?.message || 'unknown error'}` },
          { status: 500 }
        )
      }

      publicUrl = signedData.signedUrl
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: storagePath
    })
  } catch (error) {
    console.error('[vehicles/logo-upload] Unexpected error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error while uploading logo' },
      { status: 500 }
    )
  }
}
