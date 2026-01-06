import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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

  // Check if this is an entity-type investor
  const isEntityInvestor = investor?.type === 'entity' || investor?.type === 'institutional'

  // Always check for investor_members with is_signatory, even for 'individual' type
  // (handles cases where type is wrong or LLC/Corp is marked as individual)
  const { data: members, error: membersError } = await serviceSupabase
    .from('investor_members')
    .select('id, full_name, email, role, role_title, is_signatory')
    .eq('investor_id', subscription.investor_id)
    .eq('is_active', true)
    .order('is_signatory', { ascending: false })
    .order('full_name', { ascending: true })

  if (membersError) {
    console.error('Error fetching signatories:', membersError)
    return NextResponse.json({ error: 'Failed to fetch signatories' }, { status: 500 })
  }

  // Filter to only authorized signatories
  const authorizedSignatories = members?.filter(m => m.is_signatory) || []
  const hasDesignatedSignatories = authorizedSignatories.length > 0

  // Build response with signatories
  let signatories: Array<{
    id: string
    full_name: string
    email: string
    role: string
    role_title?: string
    is_signatory: boolean
    is_primary: boolean
  }> = []

  if (hasDesignatedSignatories) {
    // Use designated signatories from investor_members
    signatories = authorizedSignatories.map(m => ({
      id: m.id,
      full_name: m.full_name,
      email: m.email || '',
      role: m.role,
      role_title: m.role_title || undefined,
      is_signatory: m.is_signatory,
      is_primary: false
    }))
  } else if (!isEntityInvestor || (members?.length === 0)) {
    // No members or individual investor - use investor primary email
    if (investor?.email) {
      signatories = [{
        id: 'investor_primary',
        full_name: investor.legal_name || investor.display_name || 'Investor',
        email: investor.email,
        role: 'primary',
        role_title: 'Primary Contact',
        is_signatory: true,
        is_primary: true
      }]
    }
  }

  return NextResponse.json({
    signatories,
    investor_type: investor?.type,
    requires_multi_signatory: hasDesignatedSignatories && authorizedSignatories.length > 1,
    has_designated_signatories: hasDesignatedSignatories,
    arranger
  })
}
