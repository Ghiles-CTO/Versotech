import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Verify user is an arranger with signing permissions
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id, can_sign')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    if (!arrangerUser.can_sign) {
      return NextResponse.json({ error: 'You do not have signing permissions' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Please upload a PNG, JPEG, or WebP image.'
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB.'
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'png'
    const fileName = `arranger-signatures/${arrangerUser.arranger_id}/${user.id}_${Date.now()}.${fileExt}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('[arranger-upload-signature] Storage error:', uploadError)
      return NextResponse.json({
        error: 'Failed to upload file'
      }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    // Update arranger_users record with signature URL
    const { error: updateError } = await serviceSupabase
      .from('arranger_users')
      .update({
        signature_specimen_url: publicUrl,
        signature_specimen_uploaded_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('arranger_id', arrangerUser.arranger_id)

    if (updateError) {
      console.error('[arranger-upload-signature] Update error:', updateError)
      return NextResponse.json({
        error: 'Failed to save signature URL'
      }, { status: 500 })
    }

    return NextResponse.json({
      url: publicUrl,
      message: 'Signature specimen uploaded successfully'
    })

  } catch (error) {
    console.error('[arranger-upload-signature] Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Verify user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id, signature_specimen_url')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    // Clear signature URL
    const { error: updateError } = await serviceSupabase
      .from('arranger_users')
      .update({
        signature_specimen_url: null,
        signature_specimen_uploaded_at: null
      })
      .eq('user_id', user.id)
      .eq('arranger_id', arrangerUser.arranger_id)

    if (updateError) {
      console.error('[arranger-delete-signature] Update error:', updateError)
      return NextResponse.json({
        error: 'Failed to remove signature'
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Signature specimen removed successfully'
    })

  } catch (error) {
    console.error('[arranger-delete-signature] Error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
