import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/partners/me/transactions/export
 *
 * Export partner transactions as CSV
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Get partner entity for this user
    // Note: partners table has 'name' not 'display_name'
    const { data: partnerLink } = await supabase
      .from('partner_users')
      .select('partner_id, partners(id, name, legal_name)')
      .eq('user_id', user.id)
      .single()

    if (!partnerLink || !partnerLink.partner_id) {
      return NextResponse.json({ error: 'No partner profile found' }, { status: 403 })
    }

    const partnerRaw = partnerLink.partners as unknown
    const partner = (Array.isArray(partnerRaw) ? partnerRaw[0] : partnerRaw) as { id: string; name: string; legal_name: string | null }
    const partnerId = partnerLink.partner_id

    // Rate limiting - check for recent export requests (1 per minute)
    const { data: recentExport } = await supabase
      .from('audit_logs')
      .select('timestamp')
      .eq('action', 'partner_transactions_export')
      .eq('actor_id', user.id)
      .gte('timestamp', new Date(Date.now() - 60 * 1000).toISOString())
      .limit(1)

    if (recentExport && recentExport.length > 0) {
      return NextResponse.json(
        { error: 'Please wait 1 minute between export requests' },
        { status: 429 }
      )
    }

    // Parse query params for filtering
    const url = new URL(request.url)
    const fromDate = url.searchParams.get('from')
    const toDate = url.searchParams.get('to')
    const status = url.searchParams.get('status')

    // Get all deal memberships where this partner referred investors
    // Note: deal_memberships has no 'created_at' column - use 'dispatched_at' instead
    let query = supabase
      .from('deal_memberships')
      .select(`
        deal_id,
        user_id,
        role,
        dispatched_at,
        deals (
          id,
          name,
          status
        ),
        profiles:user_id (
          display_name,
          email
        )
      `)
      .eq('referred_by_entity_type', 'partner')
      .eq('referred_by_entity_id', partnerId)
      .order('dispatched_at', { ascending: false })
      .limit(1000)

    if (fromDate) {
      query = query.gte('dispatched_at', fromDate)
    }
    if (toDate) {
      query = query.lte('dispatched_at', toDate)
    }

    const { data: referrals, error } = await query

    if (error) {
      console.error('Error fetching partner referrals:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    // Get subscription data for these referrals
    const referralUserIds = referrals?.map(r => r.user_id).filter(Boolean) || []

    let subscriptionData: Record<string, { commitment: number; status: string; currency: string }> = {}

    if (referralUserIds.length > 0) {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('investor_id, commitment, status, currency, investors!inner(investor_users!inner(user_id))')
        .in('investors.investor_users.user_id', referralUserIds)

      if (subs) {
        for (const sub of subs) {
          const invRaw = sub.investors as unknown
          const inv = (Array.isArray(invRaw) ? invRaw[0] : invRaw) as { investor_users: { user_id: string }[] } | null
          if (inv?.investor_users?.[0]?.user_id) {
            subscriptionData[inv.investor_users[0].user_id] = {
              commitment: sub.commitment || 0,
              status: sub.status || 'unknown',
              currency: sub.currency || 'EUR'
            }
          }
        }
      }
    }

    // Build CSV content
    const csvHeaders = [
      'Date',
      'Investor Name',
      'Investor Email',
      'Deal Name',
      'Deal Status',
      'Referral Status',
      'Commitment Amount',
      'Currency',
      'Subscription Status'
    ]

    // Helper to normalize join results
    function normalizeJoin<T>(value: T | T[] | null): T | null {
      if (!value) return null
      return Array.isArray(value) ? value[0] || null : value
    }

    const csvRows = referrals?.map(ref => {
      const deal = normalizeJoin(ref.deals as unknown as { id: string; name: string; status: string } | { id: string; name: string; status: string }[] | null)
      const profile = normalizeJoin(ref.profiles as unknown as { display_name: string | null; email: string | null } | { display_name: string | null; email: string | null }[] | null)
      const sub = subscriptionData[ref.user_id]

      return [
        ref.dispatched_at ? new Date(ref.dispatched_at).toISOString().split('T')[0] : '',
        profile?.display_name || 'Unknown',
        profile?.email || '',
        deal?.name || 'Unknown Deal',
        deal?.status || '',
        ref.dispatched_at ? 'Dispatched' : 'Pending',
        sub?.commitment || 0,
        sub?.currency || 'EUR',
        sub?.status || 'No subscription'
      ].map(val => `"${String(val).replace(/"/g, '""')}"`)
    }) || []

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Add summary row
    const totalCommitment = referrals?.reduce((sum, ref) => {
      const sub = subscriptionData[ref.user_id]
      return sum + (sub?.commitment || 0)
    }, 0) || 0

    const summaryContent = `\n\n"Summary"\n"Total Referrals","${referrals?.length || 0}"\n"Total Commitment","${totalCommitment}"`

    // Create response with CSV
    const fullCsv = csvContent + summaryContent
    const filename = `partner-transactions-${partner.name || partner.legal_name}-${new Date().toISOString().split('T')[0]}.csv`

    // Log the export for rate limiting
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'partner_transactions_export',
      event_type: 'export',
      action_details: { rows: referrals?.length || 0, partner_id: partnerId },
      timestamp: new Date().toISOString()
    })

    return new NextResponse(fullCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    })
  } catch (error) {
    console.error('Partner transaction export error:', error)
    return NextResponse.json({ error: 'Failed to export transactions' }, { status: 500 })
  }
}
