/**
 * Legacy investor entity KYC endpoint.
 *
 * Kept for backward compatibility with older clients. It delegates to the
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
    const { data: investorUser, error: investorUserError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (investorUserError || !investorUser?.investor_id) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    const delegatedRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'investor',
        entityId: investorUser.investor_id,
      }),
    })

    return submitEntityKyc(delegatedRequest)
  } catch (error) {
    console.error('[investor-submit-entity-kyc] Error delegating submit:', error)
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
    const { data: investorUser } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!investorUser?.investor_id) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    const { data: investor } = await serviceSupabase
      .from('investors')
      .select('id, type, kyc_status, kyc_completed_at, account_approval_status')
      .eq('id', investorUser.investor_id)
      .maybeSingle()

    if (!investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    return NextResponse.json({
      kyc_status: investor.kyc_status,
      completed_at: investor.kyc_completed_at,
      account_approval_status: investor.account_approval_status,
      deprecated: true,
      message: 'Use /api/me/entity-kyc/submit for new integrations.',
    })
  } catch (error) {
    console.error('[investor-submit-entity-kyc] Status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

