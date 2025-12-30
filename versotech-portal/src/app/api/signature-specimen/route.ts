/**
 * Signature Specimen API
 * User Story 0.1.1 Row 2: "As a User, I want to save Signature Specimen in the User profile"
 *
 * GET /api/signature-specimen - Get current user's signature specimen
 * POST /api/signature-specimen - Upload/update signature specimen
 * DELETE /api/signature-specimen - Remove signature specimen
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/signature-specimen
 * Returns the current user's signature specimen URL
 */
export async function GET() {
  const supabase = await createClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get signature URL from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('signature_specimen_url')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Failed to fetch signature' }, { status: 500 })
    }

    // If there's a signature URL, generate a signed URL for access
    let signedUrl = null
    if (profile?.signature_specimen_url) {
      // Extract the path from the stored URL (format: signatures/{user_id}/signature.png)
      const storagePath = profile.signature_specimen_url

      const { data: signedData, error: signError } = await supabase
        .storage
        .from('signatures')
        .createSignedUrl(storagePath, 3600) // 1 hour expiry

      if (!signError && signedData) {
        signedUrl = signedData.signedUrl
      }
    }

    return NextResponse.json({
      signature_url: signedUrl,
      has_signature: !!profile?.signature_specimen_url
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/signature-specimen:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/signature-specimen
 * Upload a new signature specimen
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('signature') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PNG, JPEG, or WebP' },
        { status: 400 }
      )
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB' },
        { status: 400 }
      )
    }

    // Get current signature to delete old file if exists
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('signature_specimen_url')
      .eq('id', user.id)
      .single()

    // Delete old signature if exists
    if (currentProfile?.signature_specimen_url) {
      await supabase.storage
        .from('signatures')
        .remove([currentProfile.signature_specimen_url])
    }

    // Generate unique filename
    const fileExt = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'webp'
    const fileName = `${user.id}/signature_${Date.now()}.${fileExt}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload new signature using service client (bypasses RLS for reliable upload)
    const { data: uploadData, error: uploadError } = await serviceSupabase
      .storage
      .from('signatures')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading signature:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload signature' },
        { status: 500 }
      )
    }

    // Update profile with new signature URL (store the path, not the full URL)
    const { error: updateError } = await serviceSupabase
      .from('profiles')
      .update({
        signature_specimen_url: uploadData.path,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      // Try to clean up the uploaded file
      await serviceSupabase.storage.from('signatures').remove([uploadData.path])
      return NextResponse.json(
        { error: 'Failed to save signature' },
        { status: 500 }
      )
    }

    // Generate signed URL for immediate use
    const { data: signedData } = await supabase
      .storage
      .from('signatures')
      .createSignedUrl(uploadData.path, 3600)

    return NextResponse.json({
      message: 'Signature saved successfully',
      signature_url: signedData?.signedUrl || null,
      path: uploadData.path
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/signature-specimen:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/signature-specimen
 * Remove the user's signature specimen
 */
export async function DELETE() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current signature path
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('signature_specimen_url')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    if (!profile?.signature_specimen_url) {
      return NextResponse.json({ message: 'No signature to delete' })
    }

    // Delete the file from storage
    const { error: deleteError } = await serviceSupabase
      .storage
      .from('signatures')
      .remove([profile.signature_specimen_url])

    if (deleteError) {
      console.error('Error deleting signature file:', deleteError)
      // Continue anyway to clear the URL from profile
    }

    // Clear signature URL from profile
    const { error: updateError } = await serviceSupabase
      .from('profiles')
      .update({
        signature_specimen_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ error: 'Failed to remove signature' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Signature removed successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/signature-specimen:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
