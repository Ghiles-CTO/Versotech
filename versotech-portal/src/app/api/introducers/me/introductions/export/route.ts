import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/introducers/me/introductions/export
 *
 * Export introducer introductions as CSV
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

    // Get introducer entity for this user
    const { data: introducerLink } = await supabase
      .from('introducer_users')
      .select('introducer_id, introducers(id, legal_name, display_name)')
      .eq('user_id', user.id)
      .single()

    if (!introducerLink || !introducerLink.introducer_id) {
      return NextResponse.json({ error: 'No introducer profile found' }, { status: 403 })
    }

    const introducerRaw = introducerLink.introducers as unknown
    const introducer = (Array.isArray(introducerRaw) ? introducerRaw[0] : introducerRaw) as { id: string; legal_name: string; display_name: string | null }
    const introducerId = introducerLink.introducer_id

    // Rate limiting - check for recent export requests (1 per minute)
    const { data: recentExport } = await supabase
      .from('audit_logs')
      .select('timestamp')
      .eq('action', 'introducer_introductions_export')
      .eq('actor_id', user.id)
      .gte('timestamp', new Date(Date.now() - 60 * 1000).toISOString())
      .limit(1)

    if (recentExport && recentExport.length > 0) {
      return NextResponse.json(
        { error: 'Please wait 1 minute between export requests' },
        { status: 429 }
      )
    }

    // Parse query params
    const url = new URL(request.url)
    const fromDate = url.searchParams.get('from')
    const toDate = url.searchParams.get('to')

    // Get all introductions for this introducer
    let query = supabase
      .from('introductions')
      .select(`
        id,
        created_at,
        status,
        commission_amount,
        commission_currency,
        commission_paid_at,
        notes,
        investors (
          id,
          legal_name,
          display_name
        ),
        deals (
          id,
          name,
          status
        )
      `)
      .eq('introducer_id', introducerId)
      .order('created_at', { ascending: false })
      .limit(1000)

    if (fromDate) {
      query = query.gte('created_at', fromDate)
    }
    if (toDate) {
      query = query.lte('created_at', toDate)
    }

    const { data: introductions, error } = await query

    if (error) {
      console.error('Error fetching introductions:', error)
      return NextResponse.json({ error: 'Failed to fetch introductions' }, { status: 500 })
    }

    // Get subscription data for investors
    const investorIds = introductions?.map(i => (i.investors as any)?.id).filter(Boolean) || []
    let subscriptionData: Record<string, { commitment: number; status: string; currency: string }> = {}

    if (investorIds.length > 0) {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('investor_id, commitment, status, currency')
        .in('investor_id', investorIds)

      if (subs) {
        for (const sub of subs) {
          if (!subscriptionData[sub.investor_id] || sub.commitment > subscriptionData[sub.investor_id].commitment) {
            subscriptionData[sub.investor_id] = {
              commitment: sub.commitment || 0,
              status: sub.status || 'unknown',
              currency: sub.currency || 'EUR'
            }
          }
        }
      }
    }

    // Build CSV
    const csvHeaders = [
      'Date',
      'Investor Name',
      'Deal Name',
      'Deal Status',
      'Introduction Status',
      'Commitment Amount',
      'Currency',
      'Commission Amount',
      'Commission Currency',
      'Commission Paid',
      'Notes'
    ]

    // Helper to normalize join results
    function normalizeJoin<T>(value: T | T[] | null): T | null {
      if (!value) return null
      return Array.isArray(value) ? value[0] || null : value
    }

    const csvRows = introductions?.map(intro => {
      const investor = normalizeJoin(intro.investors as unknown as { id: string; legal_name: string; display_name: string | null } | { id: string; legal_name: string; display_name: string | null }[] | null)
      const deal = normalizeJoin(intro.deals as unknown as { id: string; name: string; status: string } | { id: string; name: string; status: string }[] | null)
      const sub = investor ? subscriptionData[investor.id] : null

      return [
        intro.created_at ? new Date(intro.created_at).toISOString().split('T')[0] : '',
        investor?.display_name || investor?.legal_name || 'Unknown',
        deal?.name || 'Unknown Deal',
        deal?.status || '',
        intro.status || 'pending',
        sub?.commitment || 0,
        sub?.currency || 'EUR',
        intro.commission_amount || 0,
        intro.commission_currency || 'EUR',
        intro.commission_paid_at ? new Date(intro.commission_paid_at).toISOString().split('T')[0] : 'Not Paid',
        (intro.notes || '').replace(/"/g, '""')
      ].map(val => `"${String(val)}"`)
    }) || []

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Summary
    const totalIntroductions = introductions?.length || 0
    const successfulIntroductions = introductions?.filter(i => i.status === 'converted' || i.status === 'allocated').length || 0
    const totalCommission = introductions?.reduce((sum, i) => sum + (i.commission_amount || 0), 0) || 0
    const paidCommission = introductions?.filter(i => i.commission_paid_at).reduce((sum, i) => sum + (i.commission_amount || 0), 0) || 0

    const summaryContent = `\n\n"Summary"\n"Total Introductions","${totalIntroductions}"\n"Successful Conversions","${successfulIntroductions}"\n"Conversion Rate","${totalIntroductions > 0 ? Math.round((successfulIntroductions / totalIntroductions) * 100) : 0}%"\n"Total Commission","${totalCommission}"\n"Paid Commission","${paidCommission}"\n"Pending Commission","${totalCommission - paidCommission}"`

    const fullCsv = csvContent + summaryContent
    const filename = `introductions-${introducer.display_name || introducer.legal_name}-${new Date().toISOString().split('T')[0]}.csv`

    // Log the export for rate limiting
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'introducer_introductions_export',
      event_type: 'export',
      action_details: { rows: introductions?.length || 0, introducer_id: introducerId },
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
    console.error('Introducer export error:', error)
    return NextResponse.json({ error: 'Failed to export introductions' }, { status: 500 })
  }
}
