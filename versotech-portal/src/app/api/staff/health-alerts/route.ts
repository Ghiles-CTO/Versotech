import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { addDays, isPast, isWithinInterval, subDays } from 'date-fns'

interface HealthAlert {
  id: string
  type: 'overdue_funding' | 'missing_documents' | 'pending_review' | 'kyc_expiring' | 'contract_expiring'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  entity_type: 'subscription' | 'investor' | 'document'
  entity_id: string
  entity_name: string
  action_url?: string
  action_label?: string
  created_at: string
  dismissed_at?: string | null
}

export async function GET(request: NextRequest) {
  try {
    await requireStaffAuth()
    const { searchParams } = new URL(request.url)
    const showDismissed = searchParams.get('dismissed') === 'true'

    const supabase = await createClient()
    const alerts: HealthAlert[] = []

    // 1. Check for overdue funding
    const { data: overdueSubscriptions } = await supabase
      .from('subscriptions')
      .select(`
        id,
        subscription_number,
        commitment,
        funding_due_at,
        investor:investors (legal_name)
      `)
      .not('funding_due_at', 'is', null)
      .eq('status', 'active')

    overdueSubscriptions?.forEach((sub: any) => {
      if (sub.funding_due_at && isPast(new Date(sub.funding_due_at))) {
        const daysPast = Math.floor(
          (new Date().getTime() - new Date(sub.funding_due_at).getTime()) / (1000 * 60 * 60 * 24)
        )

        alerts.push({
          id: `overdue-${sub.id}`,
          type: 'overdue_funding',
          severity: daysPast > 7 ? 'critical' : 'warning',
          title: 'Overdue Funding',
          description: `Funding was due ${daysPast} days ago. Expected commitment: $${new Intl.NumberFormat().format(sub.commitment)}`,
          entity_type: 'subscription',
          entity_id: sub.id,
          entity_name: `${sub.investor?.legal_name || 'Unknown'} - ${sub.subscription_number || ''}`,
          action_url: `/versotech/staff/subscriptions`,
          action_label: 'View Subscription',
          created_at: new Date().toISOString(),
          dismissed_at: null
        })
      }
    })

    // 2. Check for missing documents
    const { data: missingDocsSubscriptions } = await supabase
      .from('subscriptions')
      .select(`
        id,
        subscription_number,
        documents_complete,
        investor:investors (legal_name)
      `)
      .eq('status', 'active')
      .eq('documents_complete', false)

    missingDocsSubscriptions?.forEach((sub: any) => {
      alerts.push({
        id: `missing-docs-${sub.id}`,
        type: 'missing_documents',
        severity: 'warning',
        title: 'Missing Documents',
        description: 'Required subscription documents are incomplete',
        entity_type: 'subscription',
        entity_id: sub.id,
        entity_name: `${sub.investor?.legal_name || 'Unknown'} - ${sub.subscription_number || ''}`,
        action_url: `/versotech/staff/subscriptions`,
        action_label: 'Upload Documents',
        created_at: new Date().toISOString(),
        dismissed_at: null
      })
    })

    // 3. Check for pending reviews
    const { data: pendingSubscriptions } = await supabase
      .from('subscriptions')
      .select(`
        id,
        subscription_number,
        created_at,
        investor:investors (legal_name)
      `)
      .eq('status', 'pending')

    pendingSubscriptions?.forEach((sub: any) => {
      const daysPending = Math.floor(
        (new Date().getTime() - new Date(sub.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysPending > 2) {
        alerts.push({
          id: `pending-${sub.id}`,
          type: 'pending_review',
          severity: daysPending > 5 ? 'warning' : 'info',
          title: 'Pending Review',
          description: `Subscription has been pending for ${daysPending} days`,
          entity_type: 'subscription',
          entity_id: sub.id,
          entity_name: `${sub.investor?.legal_name || 'Unknown'} - ${sub.subscription_number || ''}`,
          action_url: `/versotech/staff/subscriptions`,
          action_label: 'Review',
          created_at: new Date().toISOString(),
          dismissed_at: null
        })
      }
    })

    // 4. Check for expiring KYC
    const { data: expiringKYC } = await supabase
      .from('investors')
      .select('id, legal_name, kyc_expiry_date')
      .not('kyc_expiry_date', 'is', null)
      .eq('status', 'active')

    expiringKYC?.forEach((investor: any) => {
      if (investor.kyc_expiry_date) {
        const expiryDate = new Date(investor.kyc_expiry_date)
        const daysUntilExpiry = Math.floor(
          (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
          alerts.push({
            id: `kyc-expiring-${investor.id}`,
            type: 'kyc_expiring',
            severity: daysUntilExpiry <= 7 ? 'critical' : 'warning',
            title: 'KYC Expiring Soon',
            description: `KYC documentation expires in ${daysUntilExpiry} days`,
            entity_type: 'investor',
            entity_id: investor.id,
            entity_name: investor.legal_name,
            action_url: `/versotech/staff/investors/${investor.id}`,
            action_label: 'Update KYC',
            created_at: new Date().toISOString(),
            dismissed_at: null
          })
        }
      }
    })

    // Sort by severity and date
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    alerts.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
      if (severityDiff !== 0) return severityDiff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json({
      alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length
      }
    })
  } catch (error) {
    console.error('Health alerts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch health alerts' },
      { status: 500 }
    )
  }
}
