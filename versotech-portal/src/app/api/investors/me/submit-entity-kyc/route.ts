/**
 * Legacy investor entity KYC endpoint.
 *
 * Kept for backward compatibility with older clients. It delegates to the
 * unified generic entity KYC submit flow used by all personas.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { submitEntityKycForUser } from '@/app/api/me/entity-kyc/submit/route'
import { resolvePrimaryInvestorLink } from '@/lib/kyc/investor-link'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()
    const { link: investorUser, error: investorUserError } = await resolvePrimaryInvestorLink(
      serviceSupabase,
      user.id,
      'investor_id'
    )

    if (investorUserError || !investorUser?.investor_id) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    const result = await submitEntityKycForUser({
      serviceSupabase,
      userId: user.id,
      entityType: 'investor',
      entityId: investorUser.investor_id,
    })

    return NextResponse.json(result.payload, { status: result.status })
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
    const { link: investorUser } = await resolvePrimaryInvestorLink(
      serviceSupabase,
      user.id,
      'investor_id'
    )

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
