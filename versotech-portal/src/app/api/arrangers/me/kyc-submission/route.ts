/**
 * Legacy arranger KYC submission endpoint.
 *
 * Kept for backward compatibility with older clients. It now delegates to the
 * unified generic entity KYC submit flow used by all personas.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { POST as submitEntityKyc } from '@/app/api/me/entity-kyc/submit/route'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()
    const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Not an arranger user' }, { status: 403 })
    }

    const delegatedRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'arranger',
        entityId: arrangerUser.arranger_id,
      }),
    })

    return submitEntityKyc(delegatedRequest)
  } catch (error) {
    console.error('[arranger-kyc-submission] Error delegating submit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()
    const { data: arrangerUser } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Not an arranger user' }, { status: 403 })
    }

    const { data: arranger } = await serviceSupabase
      .from('arranger_entities')
      .select('id, kyc_status, kyc_submitted_at, kyc_approved_at, kyc_expires_at, account_approval_status')
      .eq('id', arrangerUser.arranger_id)
      .maybeSingle()

    if (!arranger) {
      return NextResponse.json({ error: 'Arranger not found' }, { status: 404 })
    }

    return NextResponse.json({
      kyc_status: arranger.kyc_status,
      submitted_at: arranger.kyc_submitted_at,
      approved_at: arranger.kyc_approved_at,
      expires_at: arranger.kyc_expires_at,
      account_approval_status: arranger.account_approval_status,
      deprecated: true,
      message: 'Use /api/me/entity-kyc/submit for new integrations.',
    })
  } catch (error) {
    console.error('[arranger-kyc-submission] Status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
