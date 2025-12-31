/**
 * Commercial Partner Reconciliation Report API
 * GET /api/arrangers/me/reports/commercial-partner-reconciliation
 *
 * Returns commission data for reconciliation with optional CSV export and pagination.
 * Implements User Story Row 61: Generate reconciliation report (Commercial Partners)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/arrangers/me/reports/commercial-partner-reconciliation
 *
 * Query params:
 * - from_date: Start date (ISO format) - optional
 * - to_date: End date (ISO format) - optional
 * - commercial_partner_id: Filter by specific commercial partner - optional
 * - deal_id: Filter by specific deal - optional
 * - status: Filter by status - optional
 * - format: 'json' (default) or 'csv'
 * - limit: Number of records per page (default 50)
 * - offset: Pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get('from_date')
    const toDate = searchParams.get('to_date')
    const commercialPartnerId = searchParams.get('commercial_partner_id')
    const dealId = searchParams.get('deal_id')
    const status = searchParams.get('status')
    const format = searchParams.get('format') || 'json'
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query for count (without pagination)
    let countQuery = serviceSupabase
      .from('commercial_partner_commissions')
      .select('id', { count: 'exact', head: true })
      .eq('arranger_id', arrangerId)

    // Build query for data
    let query = serviceSupabase
      .from('commercial_partner_commissions')
      .select(`
        id,
        status,
        basis_type,
        rate_bps,
        base_amount,
        accrual_amount,
        currency,
        invoice_id,
        paid_at,
        payment_due_date,
        payment_reference,
        notes,
        created_at,
        updated_at,
        commercial_partner:commercial_partners(id, name, legal_name, contact_email),
        deal:deals(id, name, company_name),
        investor:investors(id, legal_name, display_name),
        fee_plan:fee_plans(id, name)
      `)
      .eq('arranger_id', arrangerId)
      .order('created_at', { ascending: false })

    // Apply filters to both queries
    if (fromDate) {
      query = query.gte('created_at', fromDate)
      countQuery = countQuery.gte('created_at', fromDate)
    }
    if (toDate) {
      const endDate = new Date(toDate)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt('created_at', endDate.toISOString())
      countQuery = countQuery.lt('created_at', endDate.toISOString())
    }
    if (commercialPartnerId) {
      query = query.eq('commercial_partner_id', commercialPartnerId)
      countQuery = countQuery.eq('commercial_partner_id', commercialPartnerId)
    }
    if (dealId) {
      query = query.eq('deal_id', dealId)
      countQuery = countQuery.eq('deal_id', dealId)
    }
    if (status) {
      query = query.eq('status', status)
      countQuery = countQuery.eq('status', status)
    }

    // Apply pagination for JSON (not CSV)
    if (format !== 'csv') {
      query = query.range(offset, offset + limit - 1)
    }

    // Execute queries
    const [{ data: commissions, error }, { count: totalCount }] = await Promise.all([
      query,
      countQuery,
    ])

    if (error) {
      console.error('[commercial-partner-reconciliation] Error fetching:', error)
      return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 })
    }

    // Transform data (normalize joined relations)
    const transformedCommissions = (commissions || []).map((c: any) => {
      const commercialPartner = Array.isArray(c.commercial_partner) ? c.commercial_partner[0] : c.commercial_partner
      const deal = Array.isArray(c.deal) ? c.deal[0] : c.deal
      const investor = Array.isArray(c.investor) ? c.investor[0] : c.investor
      const feePlan = Array.isArray(c.fee_plan) ? c.fee_plan[0] : c.fee_plan

      return {
        id: c.id,
        status: c.status,
        basis_type: c.basis_type,
        rate_bps: c.rate_bps,
        base_amount: c.base_amount,
        accrual_amount: c.accrual_amount,
        currency: c.currency,
        invoice_id: c.invoice_id,
        paid_at: c.paid_at,
        payment_due_date: c.payment_due_date,
        payment_reference: c.payment_reference,
        notes: c.notes,
        created_at: c.created_at,
        updated_at: c.updated_at,
        commercial_partner_id: commercialPartner?.id,
        commercial_partner_name: commercialPartner?.name || commercialPartner?.legal_name,
        commercial_partner_email: commercialPartner?.contact_email,
        deal_id: deal?.id,
        deal_name: deal?.name,
        deal_company: deal?.company_name,
        investor_id: investor?.id,
        investor_name: investor?.display_name || investor?.legal_name,
        fee_plan_id: feePlan?.id,
        fee_plan_name: feePlan?.name,
      }
    })

    // Calculate summary statistics
    const { data: allCommissions } = format !== 'csv' ? await serviceSupabase
      .from('commercial_partner_commissions')
      .select('status, accrual_amount, currency')
      .eq('arranger_id', arrangerId)
      .then(result => {
        let filtered = result.data || []
        return { data: filtered }
      }) : { data: transformedCommissions }

    const summary = {
      total_count: totalCount || transformedCommissions.length,
      total_amount: 0,
      by_status: {
        accrued: { count: 0, amount: 0 },
        invoice_requested: { count: 0, amount: 0 },
        invoiced: { count: 0, amount: 0 },
        paid: { count: 0, amount: 0 },
        cancelled: { count: 0, amount: 0 },
      },
      currency: 'USD',
    }

    ;(allCommissions || transformedCommissions).forEach((c: any) => {
      const amount = Number(c.accrual_amount) || 0
      summary.total_amount += amount
      if (c.currency) summary.currency = c.currency

      const statusKey = c.status as keyof typeof summary.by_status
      if (summary.by_status[statusKey]) {
        summary.by_status[statusKey].count++
        summary.by_status[statusKey].amount += amount
      }
    })

    // Return CSV if requested
    if (format === 'csv') {
      const csvHeaders = [
        'Commission ID',
        'Status',
        'Commercial Partner Name',
        'Commercial Partner Email',
        'Deal Name',
        'Company',
        'Investor Name',
        'Fee Plan',
        'Basis Type',
        'Rate (bps)',
        'Base Amount',
        'Commission Amount',
        'Currency',
        'Payment Due Date',
        'Paid At',
        'Payment Reference',
        'Created At',
        'Notes',
      ]

      const csvRows = transformedCommissions.map((c: any) => [
        c.id,
        c.status,
        c.commercial_partner_name || '',
        c.commercial_partner_email || '',
        c.deal_name || '',
        c.deal_company || '',
        c.investor_name || '',
        c.fee_plan_name || '',
        c.basis_type,
        c.rate_bps,
        c.base_amount || '',
        c.accrual_amount,
        c.currency,
        c.payment_due_date || '',
        c.paid_at || '',
        c.payment_reference || '',
        c.created_at,
        (c.notes || '').replace(/"/g, '""').replace(/\n/g, ' '),
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row =>
          row.map((cell: any) => {
            const str = String(cell)
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str}"`
            }
            return str
          }).join(',')
        ),
      ].join('\n')

      const dateRange = fromDate && toDate
        ? `_${fromDate}_to_${toDate}`
        : fromDate
        ? `_from_${fromDate}`
        : toDate
        ? `_to_${toDate}`
        : ''
      const filename = `commercial_partner_reconciliation${dateRange}_${new Date().toISOString().split('T')[0]}.csv`

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // Return JSON with pagination
    return NextResponse.json({
      data: transformedCommissions,
      summary,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        has_more: (totalCount || 0) > offset + limit,
      },
      filters: {
        from_date: fromDate,
        to_date: toDate,
        commercial_partner_id: commercialPartnerId,
        deal_id: dealId,
        status,
      },
    })
  } catch (error) {
    console.error('[commercial-partner-reconciliation] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
