import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check if user is super admin
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'super_admin')
      .single()

    if (!permission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type')
    const format = searchParams.get('format') || 'csv'
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const kycStatus = searchParams.get('kyc_status')

    if (!type) {
      return NextResponse.json({ error: 'Export type is required' }, { status: 400 })
    }

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'investors': {
        let query = supabase
          .from('investors')
          .select(
            'id, legal_name, email, type, status, kyc_status, kyc_expiry_date, country, created_at'
          )
          .order('created_at', { ascending: false })

        if (kycStatus && kycStatus !== 'all') {
          query = query.eq('kyc_status', kycStatus)
        }

        const { data: investors } = await query
        data = investors || []
        filename = 'investors-export'
        break
      }

      case 'subscriptions': {
        let query = supabase
          .from('subscriptions')
          .select(
            `
            id,
            subscription_date,
            commitment,
            funded_amount,
            current_nav,
            status,
            investors (legal_name),
            vehicles (name)
          `
          )
          .order('subscription_date', { ascending: false })

        if (from) {
          query = query.gte('subscription_date', from)
        }
        if (to) {
          query = query.lte('subscription_date', to)
        }

        const { data: subscriptions } = await query
        data = (subscriptions || []).map((s: any) => ({
          id: s.id,
          subscription_date: s.subscription_date,
          investor: s.investors?.legal_name,
          vehicle: s.vehicles?.name,
          commitment: s.commitment,
          funded_amount: s.funded_amount,
          current_nav: s.current_nav,
          status: s.status,
        }))
        filename = 'subscriptions-export'
        break
      }

      case 'deals': {
        const { data: deals } = await supabase
          .from('deals')
          .select(
            'id, name, status, target_amount, minimum_investment, target_close_date, created_at'
          )
          .order('created_at', { ascending: false })

        data = deals || []
        filename = 'deals-export'
        break
      }

      case 'fee-events': {
        let query = supabase
          .from('fee_events')
          .select(
            `
            id,
            fee_type,
            computed_amount,
            created_at,
            subscriptions (
              investors (legal_name),
              vehicles (name)
            )
          `
          )
          .order('created_at', { ascending: false })

        if (from) {
          query = query.gte('created_at', from)
        }
        if (to) {
          query = query.lte('created_at', to)
        }

        const { data: fees } = await query
        data = (fees || []).map((f: any) => ({
          id: f.id,
          fee_type: f.fee_type,
          computed_amount: f.computed_amount,
          created_at: f.created_at,
          investor: f.subscriptions?.investors?.legal_name,
          vehicle: f.subscriptions?.vehicles?.name,
        }))
        filename = 'fee-events-export'
        break
      }

      case 'audit-logs': {
        let query = supabase
          .from('audit_logs')
          .select(
            `
            id,
            action,
            entity_type,
            entity_id,
            created_at,
            profiles!audit_logs_actor_id_fkey (display_name, email)
          `
          )
          .order('created_at', { ascending: false })
          .limit(1000)

        if (from) {
          query = query.gte('created_at', from)
        }
        if (to) {
          query = query.lte('created_at', to)
        }

        const { data: logs } = await query
        data = (logs || []).map((l: any) => ({
          id: l.id,
          action: l.action,
          entity_type: l.entity_type,
          entity_id: l.entity_id,
          created_at: l.created_at,
          user: l.profiles?.display_name || l.profiles?.email,
        }))
        filename = 'audit-logs-export'
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    // Log the export action
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'data_export',
      entity_type: 'export',
      entity_id: type,
      after_value: { format, from, to, record_count: data.length },
    })

    // Generate CSV
    if (format === 'csv') {
      if (data.length === 0) {
        return new NextResponse('No data to export', {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          },
        })
      }

      const headers = Object.keys(data[0])
      const csvRows = [headers.join(',')]

      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          const stringValue = String(value)
          // Escape quotes and wrap in quotes if contains comma or quote
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
        csvRows.push(values.join(','))
      })

      const csvContent = csvRows.join('\n')

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      })
    }

    // JSON format
    if (format === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      })
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
