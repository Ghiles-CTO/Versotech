import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
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

    const today = new Date()
    const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

    // Fetch KYC expiring
    const { data: kycExpiring } = await supabase
      .from('investors')
      .select('id, legal_name, kyc_expiry_date, kyc_status')
      .eq('status', 'active')
      .not('kyc_expiry_date', 'is', null)
      .gte('kyc_expiry_date', today.toISOString().split('T')[0])
      .lte('kyc_expiry_date', ninetyDaysFromNow.toISOString().split('T')[0])
      .order('kyc_expiry_date', { ascending: true })

    // Fetch accreditation expiring
    const { data: accreditationExpiring } = await supabase
      .from('investors')
      .select('id, legal_name, accreditation_expiry_date')
      .eq('status', 'active')
      .not('accreditation_expiry_date', 'is', null)
      .gte('accreditation_expiry_date', today.toISOString().split('T')[0])
      .lte('accreditation_expiry_date', ninetyDaysFromNow.toISOString().split('T')[0])
      .order('accreditation_expiry_date', { ascending: true })

    // Build alerts
    const alerts: Array<{
      id: string
      type: 'kyc_expiry' | 'accreditation_expiry' | 'unsigned_doc' | 'aml_flag'
      severity: 'critical' | 'high' | 'medium' | 'low'
      investor_id: string
      investor_name: string
      details: string
      due_date?: string
      days_until_due?: number
      created_at: string
    }> = []

    // Process KYC expiring
    kycExpiring?.forEach((investor) => {
      const expiryDate = new Date(investor.kyc_expiry_date)
      const daysUntil = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      let severity: 'critical' | 'high' | 'medium' = 'medium'
      if (daysUntil <= 7) severity = 'critical'
      else if (daysUntil <= 30) severity = 'high'

      alerts.push({
        id: `kyc-${investor.id}`,
        type: 'kyc_expiry',
        severity,
        investor_id: investor.id,
        investor_name: investor.legal_name || 'Unknown',
        details: `KYC documentation expires in ${daysUntil} days`,
        due_date: investor.kyc_expiry_date,
        days_until_due: daysUntil,
        created_at: new Date().toISOString(),
      })
    })

    // Process accreditation expiring
    accreditationExpiring?.forEach((investor) => {
      const expiryDate = new Date(investor.accreditation_expiry_date)
      const daysUntil = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      let severity: 'critical' | 'high' | 'medium' = 'medium'
      if (daysUntil <= 7) severity = 'critical'
      else if (daysUntil <= 30) severity = 'high'

      alerts.push({
        id: `accred-${investor.id}`,
        type: 'accreditation_expiry',
        severity,
        investor_id: investor.id,
        investor_name: investor.legal_name || 'Unknown',
        details: `Accreditation expires in ${daysUntil} days`,
        due_date: investor.accreditation_expiry_date,
        days_until_due: daysUntil,
        created_at: new Date().toISOString(),
      })
    })

    // Sort by severity and days until due
    alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
      if (severityDiff !== 0) return severityDiff
      return (a.days_until_due || 999) - (b.days_until_due || 999)
    })

    return NextResponse.json({
      success: true,
      data: {
        alerts,
      },
    })
  } catch (error) {
    console.error('Compliance alerts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
