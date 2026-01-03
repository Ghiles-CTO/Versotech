import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/partners/me/signature
 * Returns the current user's signature specimen URL for their partner entity
 */
export async function GET() {
  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Get the user's partner association with signature
    const { data: partnerUser, error: partnerError } = await serviceSupabase
      .from('partner_users')
      .select('signature_specimen_url, signature_specimen_uploaded_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (partnerError) {
      console.error('[partner-get-signature] Query error:', partnerError)
      return NextResponse.json({ error: 'Failed to fetch signature' }, { status: 500 })
    }

    if (!partnerUser) {
      return NextResponse.json({ error: 'Not a partner' }, { status: 403 })
    }

    return NextResponse.json({
      signature_url: partnerUser.signature_specimen_url || null,
      uploaded_at: partnerUser.signature_specimen_uploaded_at || null
    })

  } catch (error) {
    console.error('[partner-get-signature] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/partners/me/signature
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

    // Verify user is a partner
    const { data: partnerUser, error: partnerError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id, signature_specimen_url')
      .eq('user_id', user.id)
      .maybeSingle()

    if (partnerError || !partnerUser) {
      return NextResponse.json({ error: 'Not a partner' }, { status: 403 })
    }

    // Clear signature URL
    const { error: updateError } = await serviceSupabase
      .from('partner_users')
      .update({
        signature_specimen_url: null,
        signature_specimen_uploaded_at: null
      })
      .eq('user_id', user.id)
      .eq('partner_id', partnerUser.partner_id)

    if (updateError) {
      console.error('[partner-delete-signature] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to remove signature' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Signature specimen removed successfully'
    })

  } catch (error) {
    console.error('[partner-delete-signature] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
