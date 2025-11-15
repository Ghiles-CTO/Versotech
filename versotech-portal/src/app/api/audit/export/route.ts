import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication and authorization
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is staff
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_ops'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get filter parameters from URL
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search')
  const riskLevel = searchParams.get('risk')
  const action = searchParams.get('action')
  const dateFrom = searchParams.get('from')
  const dateTo = searchParams.get('to')

  // Build query
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1000) // Max export limit

  // Apply filters
  if (search) {
    query = query.or(`actor_email.ilike.%${search}%,action.ilike.%${search}%,entity_type.ilike.%${search}%`)
  }

  if (riskLevel && riskLevel !== 'all') {
    query = query.eq('risk_level', riskLevel)
  }

  if (action && action !== 'all') {
    query = query.eq('action', action)
  }

  if (dateFrom) {
    query = query.gte('timestamp', new Date(dateFrom).toISOString())
  }

  if (dateTo) {
    query = query.lte('timestamp', new Date(dateTo).toISOString())
  }

  const { data: logs, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Convert to CSV
  const headers = [
    'ID',
    'Timestamp',
    'Actor',
    'Role',
    'Action',
    'Entity Type',
    'Entity ID',
    'Details',
    'IP Address',
    'Risk Level',
    'Compliance Flag'
  ]

  const csvRows = [
    headers.join(','),
    ...logs.map(log =>
      [
        log.id,
        new Date(log.timestamp).toISOString(),
        log.actor_email || '',
        log.actor_role || '',
        log.action,
        log.entity_type || '',
        log.entity_id || '',
        `"${(log.details || '').replace(/"/g, '""')}"`,
        log.ip_address || '',
        log.risk_level || '',
        log.compliance_flag ? 'true' : 'false'
      ].join(',')
    )
  ]

  const csv = csvRows.join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
