/**
 * Arranger Logo API
 * POST /api/arrangers/me/logo - Upload arranger entity logo
 * DELETE /api/arrangers/me/logo - Remove arranger entity logo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const BUCKET = 'public-assets'
const LOGO_FOLDER = 'arranger-logos'

/**
 * POST /api/arrangers/me/logo
 * Upload or update arranger's logo image
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find arranger entity for current user
    const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id, role, is_primary')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError || !arrangerUser?.arranger_id) {
      return NextResponse.json(
        { error: 'Arranger profile not found' },
        { status: 404 }
      )
    }

    if (arrangerUser.role !== 'admin' && !arrangerUser.is_primary) {
      return NextResponse.json(
        { error: 'Only admin or primary users can upload the arranger logo' },
        { status: 403 }
      )
    }

    const arrangerId = arrangerUser.arranger_id

    // Get the file from form data
    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
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
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 2MB' },
        { status: 400 }
      )
    }

    // Create file path: arranger-logos/{arrangerId}/logo.{ext}
    const fileExt = file.type.split('/')[1] // Get extension from mime type
    const filePath = `${LOGO_FOLDER}/${arrangerId}/logo.${fileExt}`

    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Delete old logo if exists
    const { data: existingFiles } = await serviceSupabase
      .storage
      .from(BUCKET)
      .list(`${LOGO_FOLDER}/${arrangerId}`)

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${LOGO_FOLDER}/${arrangerId}/${f.name}`)
      await serviceSupabase.storage.from(BUCKET).remove(filesToDelete)
    }

    // Upload new logo
    const { data: uploadData, error: uploadError } = await serviceSupabase
      .storage
      .from(BUCKET)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Logo upload error:', uploadError)
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

    // Update arranger entity with logo URL
    const { error: updateError } = await serviceSupabase
      .from('arranger_entities')
      .update({ logo_url: publicUrl })
      .eq('id', arrangerId)

    if (updateError) {
      console.error('Arranger update error:', updateError)
      // Try to clean up uploaded file
      await serviceSupabase.storage.from(BUCKET).remove([filePath])
      return NextResponse.json(
        { error: 'Failed to update arranger with logo URL', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      logo_url: publicUrl,
      message: 'Logo uploaded successfully'
    })
  } catch (error: any) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/arrangers/me/logo
 * Delete arranger's logo
 */
export async function DELETE() {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find arranger entity for current user
    const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id, role, is_primary')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError || !arrangerUser?.arranger_id) {
      return NextResponse.json(
        { error: 'Arranger profile not found' },
        { status: 404 }
      )
    }

    if (arrangerUser.role !== 'admin' && !arrangerUser.is_primary) {
      return NextResponse.json(
        { error: 'Only admin or primary users can remove the arranger logo' },
        { status: 403 }
      )
    }

    const arrangerId = arrangerUser.arranger_id

    // List and delete all files in arranger's logo folder
    const { data: files } = await serviceSupabase
      .storage
      .from(BUCKET)
      .list(`${LOGO_FOLDER}/${arrangerId}`)

    if (files && files.length > 0) {
      const filesToDelete = files.map(f => `${LOGO_FOLDER}/${arrangerId}/${f.name}`)
      const { error: deleteError } = await serviceSupabase
        .storage
        .from(BUCKET)
        .remove(filesToDelete)

      if (deleteError) {
        console.error('Logo delete error:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete logo file', details: deleteError.message },
          { status: 500 }
        )
      }
    }

    // Update arranger entity to remove logo URL
    const { error: updateError } = await serviceSupabase
      .from('arranger_entities')
      .update({ logo_url: null })
      .eq('id', arrangerId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update arranger profile', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Logo deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting logo:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
