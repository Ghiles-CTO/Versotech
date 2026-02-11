import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    await requireStaffAuth()
    const body = await request.json()
    const { subscription_ids, format = 'csv' } = body

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('subscriptions')
      .select(`
        id,
        subscription_number,
        commitment,
        currency,
        status,
        effective_date,
        funding_due_at,
        units,
        acknowledgement_notes,
        created_at,
        investor:investors (
          legal_name,
          type,
          country
        ),
        vehicle:vehicles (
          name,
          type,
          entity_code
        )
      `)
      .order('subscription_number', { ascending: true })

    // Filter by specific subscription IDs if provided
    if (subscription_ids && Array.isArray(subscription_ids) && subscription_ids.length > 0) {
      query = query.in('id', subscription_ids)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      console.error('Failed to fetch subscriptions for export:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions for export', details: error.message },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions to export' },
        { status: 400 }
      )
    }

    // Transform data
    const enrichedData = (subscriptions || []).map((sub: any) => ({
      subscription_number: sub.subscription_number || '',
      investor_name: sub.investor?.legal_name || '',
      investor_type: sub.investor?.type || '',
      investor_country: sub.investor?.country || '',
      vehicle_name: sub.vehicle?.name || '',
      vehicle_type: sub.vehicle?.type || '',
      vehicle_code: sub.vehicle?.entity_code || '',
      commitment: sub.commitment || 0,
      currency: sub.currency || 'USD',
      status: sub.status,
      effective_date: sub.effective_date,
      funding_due_at: sub.funding_due_at,
      units: sub.units || '',
      notes: sub.acknowledgement_notes || '',
      created_at: sub.created_at
    }))

    // Generate CSV
    const headers = [
      'Subscription #',
      'Investor Name',
      'Investor Type',
      'Investor Country',
      'Vehicle Name',
      'Vehicle Type',
      'Vehicle Code',
      'Commitment',
      'Currency',
      'Status',
      'Effective Date',
      'Funding Due',
      'Units',
      'Notes',
      'Created Date'
    ]

    const formatCurrency = (val: number, currency: string = 'USD') =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0
      }).format(val)

    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      return format(new Date(d.getTime() + d.getTimezoneOffset() * 60000), 'yyyy-MM-dd')
    }

    const rows = enrichedData.map(sub => [
      sub.subscription_number,
      sub.investor_name,
      sub.investor_type,
      sub.investor_country,
      sub.vehicle_name,
      sub.vehicle_type,
      sub.vehicle_code,
      formatCurrency(sub.commitment, sub.currency),
      sub.currency,
      sub.status,
      formatDate(sub.effective_date),
      formatDate(sub.funding_due_at),
      sub.units,
      sub.notes.replace(/"/g, '""'), // Escape quotes in notes
      formatDate(sub.created_at)
    ])

    // Build CSV with summary
    const totalCommitment = enrichedData.reduce((sum, s) => sum + s.commitment, 0)
    const statusCounts = enrichedData.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const csvContent = [
      'SUBSCRIPTIONS EXPORT',
      `Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
      `Total Subscriptions: ${enrichedData.length}`,
      '',
      'SUMMARY',
      `Total Subscriptions,${enrichedData.length}`,
      `Active,${statusCounts.active || 0}`,
      `Committed,${statusCounts.committed || 0}`,
      `Pending,${statusCounts.pending || 0}`,
      `Closed,${statusCounts.closed || 0}`,
      `Cancelled,${statusCounts.cancelled || 0}`,
      `Total Commitment,${formatCurrency(totalCommitment)}`,
      `Overdue,${enrichedData.filter(s => s.funding_due_at && new Date(s.funding_due_at) < new Date()).length}`,
      '',
      'SUBSCRIPTION DETAILS',
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          const cellStr = String(cell ?? '')
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',')
      )
    ].join('\n')

    const filename = `subscriptions-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Subscriptions export API error:', error)
    return NextResponse.json(
      { error: 'Failed to export subscriptions' },
      { status: 500 }
    )
  }
}
