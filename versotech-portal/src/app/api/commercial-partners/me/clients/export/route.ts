import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/commercial-partners/me/clients/export
 *
 * Export commercial partner client transactions as CSV
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

    // Get commercial partner entity for this user
    const { data: cpLink } = await supabase
      .from('commercial_partner_users')
      .select('commercial_partner_id, commercial_partners:commercial_partner_id(id, name, legal_name)')
      .eq('user_id', user.id)
      .single()

    if (!cpLink || !cpLink.commercial_partner_id) {
      return NextResponse.json({ error: 'No commercial partner profile found' }, { status: 403 })
    }

    const cpRaw = cpLink.commercial_partners as unknown
    const cp = (Array.isArray(cpRaw) ? cpRaw[0] : cpRaw) as { id: string; name: string; legal_name: string | null }
    const cpId = cpLink.commercial_partner_id

    // Rate limiting - check for recent export requests (1 per minute)
    const { data: recentExport } = await supabase
      .from('audit_logs')
      .select('timestamp')
      .eq('action', 'cp_client_transactions_export')
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

    // Get all clients for this commercial partner
    let query = supabase
      .from('commercial_partner_clients')
      .select(`
        id,
        client_name,
        client_email,
        client_type,
        client_investor_id,
        is_active,
        created_at,
        created_for_deal_id,
        deal:created_for_deal_id (
          id,
          name,
          status
        )
      `)
      .eq('commercial_partner_id', cpId)
      .order('created_at', { ascending: false })
      .limit(1000)

    if (fromDate) {
      query = query.gte('created_at', fromDate)
    }
    if (toDate) {
      query = query.lte('created_at', toDate)
    }

    const { data: clients, error } = await query

    if (error) {
      console.error('Error fetching CP clients:', error)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Get subscription data for clients that have investor IDs
    const clientInvestorIds = clients?.map(c => c.client_investor_id).filter(Boolean) || []

    let subscriptionData: Record<string, { commitment: number; status: string[]; currency: string; funded_amount: number }> = {}

    if (clientInvestorIds.length > 0) {
      // SECURITY FIX: Filter by proxy_commercial_partner_id to prevent data leakage
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('investor_id, commitment, funded_amount, status, currency')
        .in('investor_id', clientInvestorIds)
        .eq('proxy_commercial_partner_id', cpId)

      if (subs) {
        // AGGREGATION FIX: Sum multiple subscriptions per investor instead of overwriting
        for (const sub of subs) {
          if (!subscriptionData[sub.investor_id]) {
            subscriptionData[sub.investor_id] = {
              commitment: 0,
              funded_amount: 0,
              status: [],
              currency: sub.currency || 'EUR'
            }
          }
          subscriptionData[sub.investor_id].commitment += sub.commitment || 0
          subscriptionData[sub.investor_id].funded_amount += sub.funded_amount || 0
          subscriptionData[sub.investor_id].status.push(sub.status || 'unknown')
        }
      }
    }

    // Build CSV content
    const csvHeaders = [
      'Date Added',
      'Client Name',
      'Client Email',
      'Client Type',
      'Deal Name',
      'Deal Status',
      'Client Status',
      'Commitment Amount',
      'Funded Amount',
      'Currency',
      'Subscription Status'
    ]

    // Helper to normalize join results
    function normalizeJoin<T>(value: T | T[] | null): T | null {
      if (!value) return null
      return Array.isArray(value) ? value[0] || null : value
    }

    const csvRows = clients?.map(client => {
      const deal = normalizeJoin(client.deal as unknown as { id: string; name: string; status: string } | { id: string; name: string; status: string }[] | null)
      const sub = client.client_investor_id ? subscriptionData[client.client_investor_id] : null

      return [
        client.created_at ? new Date(client.created_at).toISOString().split('T')[0] : '',
        client.client_name || 'Unknown',
        client.client_email || '',
        client.client_type || 'individual',
        deal?.name || 'No Deal',
        deal?.status || '',
        client.is_active ? 'Active' : 'Inactive',
        sub?.commitment || 0,
        sub?.funded_amount || 0,
        sub?.currency || 'EUR',
        sub?.status?.join(', ') || 'No subscription'
      ].map(val => `"${String(val).replace(/"/g, '""')}"`)
    }) || []

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Add summary row
    const totalCommitment = clients?.reduce((sum, client) => {
      const sub = client.client_investor_id ? subscriptionData[client.client_investor_id] : null
      return sum + (sub?.commitment || 0)
    }, 0) || 0

    const totalFunded = clients?.reduce((sum, client) => {
      const sub = client.client_investor_id ? subscriptionData[client.client_investor_id] : null
      return sum + (sub?.funded_amount || 0)
    }, 0) || 0

    const activeClients = clients?.filter(c => c.is_active).length || 0

    const summaryContent = `\n\n"Summary"\n"Total Clients","${clients?.length || 0}"\n"Active Clients","${activeClients}"\n"Total Commitment","${totalCommitment}"\n"Total Funded","${totalFunded}"`

    // Create response with CSV
    const fullCsv = csvContent + summaryContent
    const filename = `client-transactions-${cp.name || cp.legal_name}-${new Date().toISOString().split('T')[0]}.csv`

    // Log the export for rate limiting
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'cp_client_transactions_export',
      event_type: 'export',
      action_details: { rows: clients?.length || 0, commercial_partner_id: cpId },
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
    console.error('CP client transaction export error:', error)
    return NextResponse.json({ error: 'Failed to export transactions' }, { status: 500 })
  }
}
