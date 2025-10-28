import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/profiles/avatar
 * Upload or update user's avatar image
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the file from form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WEBP' },
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

    // Create file path: {userId}/avatar.{ext}
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Delete old avatar if exists
    const { data: existingFiles } = await supabase
      .storage
      .from('avatars')
      .list(user.id)

    if (existingFiles && existingFiles.length > 0) {
      // Delete all existing avatars for this user
      const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`)
      await supabase.storage.from('avatars').remove(filesToDelete)
    }

    // Upload new avatar
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload avatar', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update profile with avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile with avatar URL', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      avatar_url: publicUrl,
      message: 'Avatar uploaded successfully'
    })
  } catch (error: any) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profiles/avatar
 * Delete user's avatar
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // List and delete all files in user's avatar folder
    const { data: files } = await supabase
      .storage
      .from('avatars')
      .list(user.id)

    if (files && files.length > 0) {
      const filesToDelete = files.map(f => `${user.id}/${f.name}`)
      const { error: deleteError } = await supabase
        .storage
        .from('avatars')
        .remove(filesToDelete)

      if (deleteError) {
        return NextResponse.json(
          { error: 'Failed to delete avatar', details: deleteError.message },
          { status: 500 }
        )
      }
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting avatar:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
