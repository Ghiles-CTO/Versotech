import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    await requireStaffAuth()
    const body = await request.json()
    const { filters = {}, format: exportFormat = 'csv' } = body

    const supabase = await createClient()

    // Build query with filters
    let query = supabase
      .from('investors')
      .select(`
        id,
        legal_name,
        display_name,
        type,
        email,
        phone,
        country,
        country_of_incorporation,
        tax_residency,
        kyc_status,
        status,
        onboarding_status,
        aml_risk_rating,
        is_pep,
        is_sanctioned,
        created_at,
        primary_rm,
        profiles!investors_primary_rm_fkey (
          display_name,
          email
        )
      `)

    // Apply filters
    if (filters.search) {
      query = query.or(`legal_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    if (filters.kyc_status) {
      query = query.eq('kyc_status', filters.kyc_status)
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data: investors, error } = await query.order('legal_name')

    if (error) {
      console.error('Failed to fetch investors for export:', error)
      throw error
    }

    // Fetch capital metrics for each investor
    const investorIds = (investors || []).map(i => i.id)
    const { data: metricsData } = await supabase
      .rpc('get_investor_capital_summary', {
        p_investor_ids: investorIds
      })

    // Merge metrics with investor data
    const metricsMap = new Map(
      (metricsData || []).map((m: any) => [m.investor_id, m])
    )

    const enrichedData = (investors || []).map((investor: any) => {
      const metrics = metricsMap.get(investor.id) || {} as any
      return {
        legal_name: investor.legal_name,
        type: investor.type,
        email: investor.email || '',
        phone: investor.phone || '',
        country: investor.country || '',
        country_of_incorporation: investor.country_of_incorporation || '',
        tax_residency: investor.tax_residency || '',
        kyc_status: investor.kyc_status,
        status: investor.status,
        aml_risk_rating: investor.aml_risk_rating || '',
        is_pep: investor.is_pep,
        is_sanctioned: investor.is_sanctioned,
        rm_name: investor.profiles?.display_name || '',
        rm_email: investor.profiles?.email || '',
        total_commitment: Number(metrics.total_commitment) || 0,
        total_contributed: Number(metrics.total_contributed) || 0,
        unfunded_commitment: Number(metrics.unfunded_commitment) || 0,
        total_distributed: Number(metrics.total_distributed) || 0,
        current_nav: Number(metrics.current_nav) || 0,
        vehicle_count: Number(metrics.vehicle_count) || 0,
        created_at: investor.created_at
      }
    })

    // Generate CSV
    const headers = [
      'Investor Name',
      'Type',
      'Email',
      'Phone',
      'Country',
      'Country of Inc.',
      'Tax Residency',
      'KYC Status',
      'Status',
      'AML Risk',
      'PEP',
      'Sanctioned',
      'RM Name',
      'RM Email',
      'Total Commitment',
      'Total Contributed',
      'Unfunded',
      'Total Distributed',
      'Current NAV',
      'Vehicles',
      'Created Date'
    ]

    const formatCurrency = (val: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val)

    const rows = enrichedData.map(inv => [
      inv.legal_name,
      inv.type,
      inv.email,
      inv.phone,
      inv.country,
      inv.country_of_incorporation,
      inv.tax_residency,
      inv.kyc_status,
      inv.status,
      inv.aml_risk_rating,
      inv.is_pep ? 'Yes' : 'No',
      inv.is_sanctioned ? 'Yes' : 'No',
      inv.rm_name,
      inv.rm_email,
      formatCurrency(inv.total_commitment),
      formatCurrency(inv.total_contributed),
      formatCurrency(inv.unfunded_commitment),
      formatCurrency(inv.total_distributed),
      formatCurrency(inv.current_nav),
      inv.vehicle_count,
      format(new Date(inv.created_at), 'yyyy-MM-dd')
    ])

    // Build CSV with summary
    const csvContent = [
      'INVESTOR EXPORT',
      `Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
      `Total Investors: ${enrichedData.length}`,
      '',
      'SUMMARY',
      `Active Investors,${enrichedData.filter(i => i.status === 'active').length}`,
      `Pending KYC,${enrichedData.filter(i => i.kyc_status === 'pending').length}`,
      `Total Commitment,${formatCurrency(enrichedData.reduce((sum, i) => sum + i.total_commitment, 0))}`,
      `Total Contributed,${formatCurrency(enrichedData.reduce((sum, i) => sum + i.total_contributed, 0))}`,
      `Current NAV,${formatCurrency(enrichedData.reduce((sum, i) => sum + i.current_nav, 0))}`,
      '',
      'INVESTOR DETAILS',
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

    const filename = `investors-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Failed to export investors' },
      { status: 500 }
    )
  }
}
