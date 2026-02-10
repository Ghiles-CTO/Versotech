import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/staff/reconciliation/verifications
 *
 * Lists all reconciliation verifications with filters
 * Shows the status of bank transaction matches and their lawyer verification status
 */
export async function GET(request: NextRequest) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // pending, verified, discrepancy, ignored
    const dealId = searchParams.get('deal_id')
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const supabase = await createClient()

    let query = supabase
      .from('reconciliation_verifications')
      .select(`
        id,
        bank_transaction_id,
        subscription_id,
        invoice_id,
        deal_id,
        matched_amount,
        match_type,
        match_confidence,
        match_notes,
        status,
        discrepancy_type,
        discrepancy_notes,
        matched_at,
        matched_by,
        verified_at,
        verified_by,
        created_at,
        bank_transactions (
          id,
          amount,
          currency,
          counterparty,
          value_date,
          bank_reference,
          memo,
          status
        ),
        subscriptions (
          id,
          commitment,
          funded_amount,
          status,
          currency,
          investors (
            id,
            display_name,
            legal_name
          )
        ),
        invoices (
          id,
          invoice_number,
          total,
          paid_amount,
          status,
          currency
        ),
        deals (
          id,
          name
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (dealId) {
      query = query.eq('deal_id', dealId)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Failed to fetch verifications:', error)
      return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 })
    }

    // Fetch profiles for matched_by and verified_by users
    // (profiles.id = auth.users.id by convention, but no FK, so we query separately)
    const userIds = [
      ...(data || []).map((v: any) => v.matched_by).filter(Boolean),
      ...(data || []).map((v: any) => v.verified_by).filter(Boolean)
    ]

    type ProfileData = { id: string; email: string | null; display_name: string | null }
    let profileMap = new Map<string, ProfileData>()

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', [...new Set(userIds)])

      profileMap = new Map((profiles || []).map((p: ProfileData) => [p.id, p]))
    }

    // Enrich data with profile info
    const enrichedData = (data || []).map((v: any) => ({
      ...v,
      matched_by_profile: v.matched_by ? profileMap.get(v.matched_by) || null : null,
      verified_by_profile: v.verified_by ? profileMap.get(v.verified_by) || null : null
    }))

    // Get summary counts
    const { data: summaryCounts } = await supabase
      .from('reconciliation_verifications')
      .select('status')

    const summary = {
      total: summaryCounts?.length || 0,
      pending: summaryCounts?.filter(v => v.status === 'pending').length || 0,
      verified: summaryCounts?.filter(v => v.status === 'verified').length || 0,
      discrepancy: summaryCounts?.filter(v => v.status === 'discrepancy').length || 0,
      ignored: summaryCounts?.filter(v => v.status === 'ignored').length || 0
    }

    return NextResponse.json({
      data: enrichedData,
      summary,
      pagination: {
        offset,
        limit,
        total: count || enrichedData.length
      }
    })
  } catch (error: any) {
    console.error('Verifications list error:', error)
    return NextResponse.json({
      error: error?.message || 'Failed to list verifications'
    }, { status: 500 })
  }
}
