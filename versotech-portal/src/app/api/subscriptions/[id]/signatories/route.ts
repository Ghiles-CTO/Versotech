import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveSubscriptionSigners } from '@/lib/subscriptions/signatory-resolution'

/**
 * GET /api/subscriptions/[id]/signatories
 * Get available signatories for a subscription (staff only)
 * Returns members who are marked as authorized signatories for the investor entity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: subscriptionId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify staff access
  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'
  if (!isStaff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const serviceSupabase = createServiceClient()

  // Get subscription with investor and deal details
  const { data: subscription, error: subError } = await serviceSupabase
    .from('subscriptions')
    .select(`
      id,
      investor_id,
      deal_id,
      investor:investors(
        id,
        legal_name,
        display_name,
        email,
        type
      ),
      deal:deals(
        id,
        arranger_entity_id
      )
    `)
    .eq('id', subscriptionId)
    .single()

  if (subError || !subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  // Fetch arranger info if deal has an arranger
  let arranger = null
  const dealData = Array.isArray(subscription.deal)
    ? subscription.deal[0]
    : subscription.deal

  if (dealData?.arranger_entity_id) {
    // Note: arranger_entities has no 'company_name' column - use legal_name only
    const { data: arrangerEntity } = await serviceSupabase
      .from('arranger_entities')
      .select('id, legal_name')
      .eq('id', dealData.arranger_entity_id)
      .single()

    if (arrangerEntity) {
      arranger = {
        id: arrangerEntity.id,
        company_name: arrangerEntity.legal_name, // Map legal_name to company_name for backward compat
        legal_name: arrangerEntity.legal_name
      }
    }
  }

  // Supabase may return array for joined relations - extract first item
  const investorData = Array.isArray(subscription.investor)
    ? subscription.investor[0]
    : subscription.investor

  const investor = investorData as {
    id: string
    legal_name: string | null
    display_name: string | null
    email: string | null
    type: string | null
  } | null

  let resolved
  try {
    resolved = await resolveSubscriptionSigners({
      supabase: serviceSupabase,
      investorId: subscription.investor_id,
      investorType: investor?.type,
      investorName: investor?.legal_name || investor?.display_name || 'Investor',
      investorEmail: investor?.email,
    })
  } catch (error) {
    console.error('Error fetching signatories:', error)
    return NextResponse.json({ error: 'Failed to fetch signatories' }, { status: 500 })
  }

  return NextResponse.json({
    signatories: resolved.signers.map((signer) => ({
      id: signer.id,
      full_name: signer.full_name,
      email: signer.email,
      role: signer.role,
      role_title: signer.role_title,
      is_signatory: signer.is_signatory,
      is_primary: signer.is_primary,
    })),
    investor_type: investor?.type,
    requires_multi_signatory: resolved.requires_multi_signatory,
    has_designated_signatories: resolved.has_designated_signatories,
    arranger,
    validation_errors: resolved.issues,
  })
}
