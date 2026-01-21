/**
 * Introducer Reconciliation Report API
 * GET /api/arrangers/me/reports/introducer-reconciliation
 *
 * Returns commission data for reconciliation with optional CSV export.
 * Implements User Story Row 41: Generate reconciliation report
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/arrangers/me/reports/introducer-reconciliation
 *
 * Query params:
 * - from_date: Start date (ISO format) - optional
 * - to_date: End date (ISO format) - optional
 * - introducer_id: Filter by specific introducer - optional
 * - deal_id: Filter by specific deal - optional
 * - status: Filter by status - optional
 * - format: 'json' (default) or 'csv'
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
    const introducerId = searchParams.get('introducer_id')
    const dealId = searchParams.get('deal_id')
    const status = searchParams.get('status')
    const format = searchParams.get('format') || 'json'
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query for count (without pagination)
    let countQuery = serviceSupabase
      .from('introducer_commissions')
      .select('id', { count: 'exact', head: true })
      .eq('arranger_id', arrangerId)

    // Build query for data
    let query = serviceSupabase
      .from('introducer_commissions')
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
        introducer:introducers(id, legal_name, email, contact_name),
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
      // Add one day to include the entire end date
      const endDate = new Date(toDate)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt('created_at', endDate.toISOString())
      countQuery = countQuery.lt('created_at', endDate.toISOString())
    }
    if (introducerId) {
      query = query.eq('introducer_id', introducerId)
      countQuery = countQuery.eq('introducer_id', introducerId)
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
      console.error('[introducer-reconciliation] Error fetching:', error)
      return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 })
    }

    // Transform data (normalize joined relations)
    const transformedCommissions = (commissions || []).map((c: any) => {
      const introducer = Array.isArray(c.introducer) ? c.introducer[0] : c.introducer
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
        introducer_id: introducer?.id,
        introducer_name: introducer?.legal_name,
        introducer_email: introducer?.email,
        introducer_contact: introducer?.contact_name,
        deal_id: deal?.id,
        deal_name: deal?.name,
        deal_company: deal?.company_name,
        investor_id: investor?.id,
        investor_name: investor?.display_name || investor?.legal_name,
        fee_plan_id: feePlan?.id,
        fee_plan_name: feePlan?.name,
      }
    })

    // Calculate summary statistics (from all matching records, not just current page)
    const { data: allCommissions } = format !== 'csv' ? await serviceSupabase
      .from('introducer_commissions')
      .select('status, accrual_amount, currency')
      .eq('arranger_id', arrangerId)
      .then(result => {
        // Return all commissions for accurate summary
        return { data: result.data || [] }
      }) : { data: transformedCommissions }

    const summary = {
      total_count: totalCount || transformedCommissions.length,
      total_amount: 0,
      by_status: {
        accrued: { count: 0, amount: 0 },
        invoice_requested: { count: 0, amount: 0 },
        invoice_submitted: { count: 0, amount: 0 },
        invoiced: { count: 0, amount: 0 },
        paid: { count: 0, amount: 0 },
        cancelled: { count: 0, amount: 0 },
        rejected: { count: 0, amount: 0 },
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
        'Introducer Name',
        'Introducer Email',
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
        c.introducer_name || '',
        c.introducer_email || '',
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
        // Escape notes for CSV (replace quotes and newlines)
        (c.notes || '').replace(/"/g, '""').replace(/\n/g, ' '),
      ])

      // Build CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row =>
          row.map((cell: any) => {
            // Wrap in quotes if contains comma, quote, or newline
            const str = String(cell)
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str}"`
            }
            return str
          }).join(',')
        ),
      ].join('\n')

      // Generate filename with date range
      const dateRange = fromDate && toDate
        ? `_${fromDate}_to_${toDate}`
        : fromDate
        ? `_from_${fromDate}`
        : toDate
        ? `_to_${toDate}`
        : ''
      const filename = `introducer_reconciliation${dateRange}.csv`

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
        introducer_id: introducerId,
        deal_id: dealId,
        status,
      },
    })
  } catch (error) {
    console.error('[introducer-reconciliation] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
