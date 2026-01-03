import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/commercial-partners/me/signature
 * Returns the current user's signature specimen URL for their commercial partner entity
 */
export async function GET() {
  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Get the user's commercial partner association with signature
    const { data: cpUser, error: cpError } = await serviceSupabase
      .from('commercial_partner_users')
      .select('signature_specimen_url, signature_specimen_uploaded_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (cpError) {
      console.error('[cp-get-signature] Query error:', cpError)
      return NextResponse.json({ error: 'Failed to fetch signature' }, { status: 500 })
    }

    if (!cpUser) {
      return NextResponse.json({ error: 'Not a commercial partner' }, { status: 403 })
    }

    return NextResponse.json({
      signature_url: cpUser.signature_specimen_url || null,
      uploaded_at: cpUser.signature_specimen_uploaded_at || null
    })

  } catch (error) {
    console.error('[cp-get-signature] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/commercial-partners/me/signature
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

    // Verify user is a commercial partner
    const { data: cpUser, error: cpError } = await serviceSupabase
      .from('commercial_partner_users')
      .select('commercial_partner_id, signature_specimen_url')
      .eq('user_id', user.id)
      .maybeSingle()

    if (cpError || !cpUser) {
      return NextResponse.json({ error: 'Not a commercial partner' }, { status: 403 })
    }

    // Clear signature URL
    const { error: updateError } = await serviceSupabase
      .from('commercial_partner_users')
      .update({
        signature_specimen_url: null,
        signature_specimen_uploaded_at: null
      })
      .eq('user_id', user.id)
      .eq('commercial_partner_id', cpUser.commercial_partner_id)

    if (updateError) {
      console.error('[cp-delete-signature] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to remove signature' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Signature specimen removed successfully'
    })

  } catch (error) {
    console.error('[cp-delete-signature] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
