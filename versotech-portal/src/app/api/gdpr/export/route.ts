/**
 * GDPR Data Export API
 * POST /api/gdpr/export
 *
 * Allows authenticated users to export their own personal data
 * Returns a JSON file with all their data across tables
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auditLogger } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get investor data if user is linked to an investor
    const { data: investorUser } = await supabase
      .from('investor_users')
      .select('investor_id, role, investors(*)')
      .eq('user_id', user.id)
      .single()

    // Get subscriptions if investor
    let subscriptions: any[] = []
    if (investorUser?.investor_id) {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('id, vehicle_id, deal_id, commitment, currency, status, created_at, subscription_date')
        .eq('investor_id', investorUser.investor_id)
        .order('created_at', { ascending: false })

      subscriptions = subs || []
    }

    // Get deal interests if investor
    let dealInterests: any[] = []
    if (investorUser?.investor_id) {
      const { data: interests } = await supabase
        .from('investor_deal_interest')
        .select('id, deal_id, status, notes, created_at')
        .eq('investor_id', investorUser.investor_id)
        .order('created_at', { ascending: false })

      dealInterests = interests || []
    }

    // Get activity logs for this user
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('event_type, action, timestamp, action_details')
      .eq('actor_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(100)

    // Get notifications
    const { data: notifications } = await supabase
      .from('investor_notifications')
      .select('type, title, message, created_at, read_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    // Get signature requests
    const { data: signatures } = await supabase
      .from('signature_requests')
      .select('document_type, status, signed_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Get any entity memberships (arranger, partner, etc.)
    const { data: entityMemberships } = await supabase
      .from('entity_members')
      .select('entity_id, role, is_primary, entities(legal_name, type)')
      .eq('user_id', user.id)

    // Get introducer data if user is linked to an introducer
    const { data: introducerUser } = await supabase
      .from('introducer_users')
      .select('introducer_id, role, introducers(*)')
      .eq('user_id', user.id)
      .maybeSingle()

    // Get introductions if introducer
    let introductions: any[] = []
    if (introducerUser?.introducer_id) {
      const { data: intros } = await supabase
        .from('introductions')
        .select('id, prospect_email, status, introduced_at, created_at')
        .eq('introducer_id', introducerUser.introducer_id)
        .order('created_at', { ascending: false })

      introductions = intros || []
    }

    // Get introducer commissions if introducer
    let introducerCommissions: any[] = []
    if (introducerUser?.introducer_id) {
      const { data: comms } = await supabase
        .from('introducer_commissions')
        .select('id, accrual_amount, currency, status, created_at, paid_at')
        .eq('introducer_id', introducerUser.introducer_id)
        .order('created_at', { ascending: false })

      introducerCommissions = comms || []
    }

    // Get introducer agreements if introducer
    let introducerAgreements: any[] = []
    if (introducerUser?.introducer_id) {
      const { data: agreements } = await supabase
        .from('introducer_agreements')
        .select('id, status, default_commission_bps, effective_date, expiry_date, signed_date')
        .eq('introducer_id', introducerUser.introducer_id)
        .order('created_at', { ascending: false })

      introducerAgreements = agreements || []
    }

    // Compile export data
    const exportData = {
      export_date: new Date().toISOString(),
      export_version: '1.1',
      user_id: user.id,
      email: user.email,
      profile: profile ? {
        full_name: profile.full_name || profile.display_name,
        phone: profile.phone,
        role: profile.role,
        created_at: profile.created_at,
        last_sign_in_at: profile.last_sign_in_at,
      } : null,
      investor_data: investorUser?.investors || null,
      subscriptions: subscriptions,
      deal_interests: dealInterests,
      entity_memberships: entityMemberships || [],
      // Introducer data (GDPR compliance)
      introducer_data: introducerUser?.introducers || null,
      introductions: introductions,
      introducer_commissions: introducerCommissions,
      introducer_agreements: introducerAgreements,
      activity_logs: auditLogs || [],
      notifications: notifications || [],
      signature_requests: signatures || [],
    }

    // Create audit log for this export
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'gdpr_data_export',
      entity: 'profile',
      entity_id: user.id,
      metadata: {
        description: 'User exported their personal data',
        tables_included: [
          'profiles',
          'investors',
          'subscriptions',
          'deal_interests',
          'entity_memberships',
          'introducers',
          'introductions',
          'introducer_commissions',
          'introducer_agreements',
          'audit_logs',
          'notifications',
          'signatures'
        ]
      }
    })

    // Return as downloadable JSON
    const fileName = `verso-data-export-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })

  } catch (error) {
    console.error('GDPR export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
