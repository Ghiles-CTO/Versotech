import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/lawyers/me/signature
 * Returns the current user's signature specimen URL for their lawyer entity
 */
export async function GET() {
  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Get the user's lawyer association with signature
    const { data: lawyerUser, error: lawyerError } = await serviceSupabase
      .from('lawyer_users')
      .select('signature_specimen_url, signature_specimen_uploaded_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (lawyerError) {
      console.error('[lawyer-get-signature] Query error:', lawyerError)
      return NextResponse.json({ error: 'Failed to fetch signature' }, { status: 500 })
    }

    if (!lawyerUser) {
      return NextResponse.json({ error: 'Not a lawyer' }, { status: 403 })
    }

    return NextResponse.json({
      signature_url: lawyerUser.signature_specimen_url || null,
      uploaded_at: lawyerUser.signature_specimen_uploaded_at || null
    })

  } catch (error) {
    console.error('[lawyer-get-signature] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/lawyers/me/signature
 * Removes the current user's signature specimen from storage and database
 */
export async function DELETE() {
  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Verify user is a lawyer and get current signature URL
    const { data: lawyerUser, error: lawyerError } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id, signature_specimen_url')
      .eq('user_id', user.id)
      .maybeSingle()

    if (lawyerError || !lawyerUser) {
      return NextResponse.json({ error: 'Not a lawyer' }, { status: 403 })
    }

    // Delete file from storage if exists
    if (lawyerUser.signature_specimen_url) {
      // Extract storage path from public URL
      // URL format: https://{project}.supabase.co/storage/v1/object/public/signatures/{path}
      const urlParts = lawyerUser.signature_specimen_url.split('/signatures/')
      if (urlParts.length > 1) {
        const storagePath = urlParts[1]
        const { error: storageError } = await serviceSupabase.storage
          .from('signatures')
          .remove([storagePath])

        if (storageError) {
          console.error('[lawyer-delete-signature] Storage cleanup error:', storageError)
          // Continue anyway - DB cleanup is more important
        }
      }
    }

    // Clear signature URL in database
    const { error: updateError } = await serviceSupabase
      .from('lawyer_users')
      .update({
        signature_specimen_url: null,
        signature_specimen_uploaded_at: null
      })
      .eq('user_id', user.id)
      .eq('lawyer_id', lawyerUser.lawyer_id)

    if (updateError) {
      console.error('[lawyer-delete-signature] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to remove signature' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Signature specimen removed successfully'
    })

  } catch (error) {
    console.error('[lawyer-delete-signature] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
