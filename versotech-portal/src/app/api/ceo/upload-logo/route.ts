/**
 * CEO Logo API
 * POST /api/ceo/upload-logo - Upload Verso Capital logo
 *
 * Only CEO admins can upload the logo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const BUCKET = 'public-assets'
const LOGO_FOLDER = 'ceo-logo'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a CEO admin
    const { data: ceoUser, error: ceoUserError } = await serviceSupabase
      .from('ceo_users')
      .select('user_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (ceoUserError || !ceoUser) {
      return NextResponse.json({ error: 'Access denied. CEO membership required.' }, { status: 403 })
    }

    if (ceoUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin role required to upload logo' }, { status: 403 })
    }

    // Get CEO entity ID
    const { data: ceoEntity, error: entityError } = await serviceSupabase
      .from('ceo_entity')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (entityError || !ceoEntity) {
      return NextResponse.json({ error: 'CEO entity not found' }, { status: 404 })
    }

    // Get the file from form data
    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WEBP' },
        { status: 400 }
      )
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 2MB' },
        { status: 400 }
      )
    }

    // Create file path: ceo-logo/{entityId}/logo.{ext}
    const fileExt = file.type.split('/')[1]
    const filePath = `${LOGO_FOLDER}/${ceoEntity.id}/logo.${fileExt}`

    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Delete old logo if exists
    const { data: existingFiles } = await serviceSupabase
      .storage
      .from(BUCKET)
      .list(`${LOGO_FOLDER}/${ceoEntity.id}`)

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${LOGO_FOLDER}/${ceoEntity.id}/${f.name}`)
      await serviceSupabase.storage.from(BUCKET).remove(filesToDelete)
    }

    // Upload new logo
    const { error: uploadError } = await serviceSupabase
      .storage
      .from(BUCKET)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('[ceo/upload-logo] Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload logo', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = serviceSupabase
      .storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    // Update CEO entity with logo URL
    const { error: updateError } = await serviceSupabase
      .from('ceo_entity')
      .update({ logo_url: publicUrl, updated_by: user.id })
      .eq('id', ceoEntity.id)

    if (updateError) {
      console.error('[ceo/upload-logo] Update error:', updateError)
      await serviceSupabase.storage.from(BUCKET).remove([filePath])
      return NextResponse.json(
        { error: 'Failed to update CEO entity with logo URL', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      logo_url: publicUrl,
      message: 'Logo uploaded successfully'
    })
  } catch (error: any) {
    console.error('[ceo/upload-logo] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
