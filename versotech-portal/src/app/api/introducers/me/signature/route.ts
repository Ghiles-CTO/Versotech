import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/introducers/me/signature
 * Returns the current user's signature specimen URL for their introducer entity
 */
export async function GET() {
  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Get the user's introducer association with signature
    const { data: introducerUser, error: introducerError } = await serviceSupabase
      .from('introducer_users')
      .select('signature_specimen_url, signature_specimen_uploaded_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (introducerError) {
      console.error('[introducer-get-signature] Query error:', introducerError)
      return NextResponse.json({ error: 'Failed to fetch signature' }, { status: 500 })
    }

    if (!introducerUser) {
      return NextResponse.json({ error: 'Not an introducer' }, { status: 403 })
    }

    return NextResponse.json({
      signature_url: introducerUser.signature_specimen_url || null,
      uploaded_at: introducerUser.signature_specimen_uploaded_at || null
    })

  } catch (error) {
    console.error('[introducer-get-signature] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/introducers/me/signature
 * Removes the current user's signature specimen
 */
export async function DELETE() {
  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Verify user is an introducer
    const { data: introducerUser, error: introducerError } = await serviceSupabase
      .from('introducer_users')
      .select('introducer_id, signature_specimen_url')
      .eq('user_id', user.id)
      .maybeSingle()

    if (introducerError || !introducerUser) {
      return NextResponse.json({ error: 'Not an introducer' }, { status: 403 })
    }

    // Clear signature URL
    const { error: updateError } = await serviceSupabase
      .from('introducer_users')
      .update({
        signature_specimen_url: null,
        signature_specimen_uploaded_at: null
      })
      .eq('user_id', user.id)
      .eq('introducer_id', introducerUser.introducer_id)

    if (updateError) {
      console.error('[introducer-delete-signature] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to remove signature' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Signature specimen removed successfully'
    })

  } catch (error) {
    console.error('[introducer-delete-signature] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
