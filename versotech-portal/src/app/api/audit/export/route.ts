import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  ADMIN_CASE_EXPORT_LIMIT,
  ADMIN_CASE_PDF_EXPORT_LIMIT,
  adminCasesToCsv,
  buildAdminCasesPdf,
  listAdminCases,
} from '@/lib/audit/admin-cases'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authSupabase = await createClient()

  // Check authentication and authorization
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is staff
  const { data: profile } = await authSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_ops', 'ceo'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get filter parameters from URL
  const searchParams = request.nextUrl.searchParams
  const dataset = searchParams.get('dataset') || 'system'
  const format = searchParams.get('format') || 'csv'
  const search = searchParams.get('search')
  const riskLevel = searchParams.get('risk')
  const action = searchParams.get('action')
  const dateFrom = searchParams.get('from')
  const dateTo = searchParams.get('to')

  if (dataset === 'cases') {
    const serviceSupabase = createServiceClient()
    const caseFilters = {
      search: searchParams.get('q'),
      status: searchParams.get('status'),
      assignedTo: searchParams.get('agent'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      escalatedOnly: searchParams.get('escalated') === 'true',
      resolution: searchParams.get('resolution'),
      priority: searchParams.get('priority'),
      category: searchParams.get('category'),
      limit: format === 'pdf' ? ADMIN_CASE_PDF_EXPORT_LIMIT : ADMIN_CASE_EXPORT_LIMIT,
    }

    const result = await listAdminCases(serviceSupabase, caseFilters)
    const filenameBase = `admin-cases-${new Date().toISOString().split('T')[0]}`

    if (format === 'pdf') {
      const pdfBuffer = await buildAdminCasesPdf(result.cases, caseFilters)
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filenameBase}.pdf"`,
        },
      })
    }

    const csv = adminCasesToCsv(result.cases)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
      },
    })
  }

  const supabase = createServiceClient()

  // Build query
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1000)

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

  const formatActionDetails = (value: unknown) => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      if (typeof record.summary === 'string' && record.summary.trim().length > 0) {
        return record.summary.trim()
      }
      if (typeof record.reason === 'string' && record.reason.trim().length > 0) {
        return record.reason.trim()
      }
      return JSON.stringify(record)
    }
    return String(value)
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
        `"${formatActionDetails(log.action_details).replace(/"/g, '""')}"`,
        String(log.ip_address || ''),
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
