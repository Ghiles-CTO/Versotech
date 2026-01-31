import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkCeoOnlyAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasCeoAccess = await checkCeoOnlyAccess(user.id)
    if (!hasCeoAccess) {
      return NextResponse.json({ error: 'CEO access required' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()

    const { data: memberships, error: membershipsError } = await serviceSupabase
      .from('deal_memberships')
      .select('investor_id, role, user_id, referred_by_entity_id, referred_by_entity_type')
      .eq('deal_id', dealId)

    if (membershipsError) {
      console.error('Error fetching deal members:', membershipsError)
      return NextResponse.json({ error: 'Failed to fetch deal members' }, { status: 500 })
    }

    const excludedRoles = new Set(['lawyer', 'arranger', 'verso_staff'])
    const validMembers = (memberships || []).filter(
      (m: any) => !excludedRoles.has(m.role)
    )

    const investorIds = Array.from(
      new Set(validMembers.map((m: any) => m.investor_id).filter(Boolean))
    )

    const partnerIds = new Set<string>()
    const introducerIds = new Set<string>()
    const commercialPartnerIds = new Set<string>()
    const introducerUserIds = new Set<string>()
    const partnerUserIds = new Set<string>()
    const commercialPartnerUserIds = new Set<string>()

    validMembers.forEach((m: any) => {
      if (m.referred_by_entity_type === 'partner' && m.referred_by_entity_id) {
        partnerIds.add(m.referred_by_entity_id)
      }
      if (m.referred_by_entity_type === 'introducer' && m.referred_by_entity_id) {
        introducerIds.add(m.referred_by_entity_id)
      }
      if (m.referred_by_entity_type === 'commercial_partner' && m.referred_by_entity_id) {
        commercialPartnerIds.add(m.referred_by_entity_id)
      }
      if (m.role === 'introducer' && m.user_id) {
        introducerUserIds.add(m.user_id)
      }
      if (m.role === 'partner' && m.user_id) {
        partnerUserIds.add(m.user_id)
      }
      if (m.role === 'commercial_partner_proxy' && m.user_id) {
        commercialPartnerUserIds.add(m.user_id)
      }
    })

    const [introducerUsersRes, partnerUsersRes, commercialPartnerUsersRes] =
      await Promise.all([
        introducerUserIds.size
          ? serviceSupabase
              .from('introducer_users')
              .select('introducer_id, user_id')
              .in('user_id', Array.from(introducerUserIds))
          : Promise.resolve({ data: [] }),
        partnerUserIds.size
          ? serviceSupabase
              .from('partner_users')
              .select('partner_id, user_id')
              .in('user_id', Array.from(partnerUserIds))
          : Promise.resolve({ data: [] }),
        commercialPartnerUserIds.size
          ? serviceSupabase
              .from('commercial_partner_users')
              .select('commercial_partner_id, user_id')
              .in('user_id', Array.from(commercialPartnerUserIds))
          : Promise.resolve({ data: [] }),
      ])

    const introducerUserIdsResolved = new Set(
      (introducerUsersRes as any).data?.map((row: any) => row.introducer_id).filter(Boolean) || []
    )
    const partnerUserIdsResolved = new Set(
      (partnerUsersRes as any).data?.map((row: any) => row.partner_id).filter(Boolean) || []
    )
    const commercialPartnerUserIdsResolved = new Set(
      (commercialPartnerUsersRes as any).data
        ?.map((row: any) => row.commercial_partner_id)
        .filter(Boolean) || []
    )

    introducerUserIdsResolved.forEach(id => introducerIds.add(id))
    partnerUserIdsResolved.forEach(id => partnerIds.add(id))
    commercialPartnerUserIdsResolved.forEach(id => commercialPartnerIds.add(id))

    const [investorsRes, partnersRes, introducersRes, commercialPartnersRes] =
      await Promise.all([
        investorIds.length
          ? serviceSupabase
              .from('investors')
              .select('id, display_name, legal_name, email')
              .in('id', investorIds)
          : Promise.resolve({ data: [] }),
        partnerIds.size
          ? serviceSupabase
              .from('partners')
              .select('id, name, legal_name, contact_name, contact_email')
              .in('id', Array.from(partnerIds))
          : Promise.resolve({ data: [] }),
        introducerIds.size
          ? serviceSupabase
              .from('introducers')
              .select('id, display_name, legal_name, email')
              .in('id', Array.from(introducerIds))
          : Promise.resolve({ data: [] }),
        commercialPartnerIds.size
          ? serviceSupabase
              .from('commercial_partners')
              .select('id, name, legal_name, contact_email')
              .in('id', Array.from(commercialPartnerIds))
          : Promise.resolve({ data: [] }),
      ])

    const participants = new Map<string, any>()

    ;(investorsRes as any).data?.forEach((inv: any) => {
      const name = inv.display_name || inv.legal_name || inv.email || 'Investor'
      participants.set(`investor:${inv.id}`, {
        id: inv.id,
        display_name: name,
        email: inv.email || '',
        entity_type: 'investor',
      })
    })

    ;(partnersRes as any).data?.forEach((partner: any) => {
      const name = partner.name || partner.legal_name || partner.contact_name || 'Partner'
      participants.set(`partner:${partner.id}`, {
        id: partner.id,
        display_name: name,
        email: partner.contact_email || '',
        entity_type: 'partner',
      })
    })

    ;(introducersRes as any).data?.forEach((intro: any) => {
      const name = intro.display_name || intro.legal_name || intro.email || 'Introducer'
      participants.set(`introducer:${intro.id}`, {
        id: intro.id,
        display_name: name,
        email: intro.email || '',
        entity_type: 'introducer',
      })
    })

    ;(commercialPartnersRes as any).data?.forEach((cp: any) => {
      const name = cp.name || cp.legal_name || 'Commercial Partner'
      participants.set(`commercial_partner:${cp.id}`, {
        id: cp.id,
        display_name: name,
        email: cp.contact_email || '',
        entity_type: 'commercial_partner',
      })
    })

    return NextResponse.json({
      investors: Array.from(participants.values()),
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/deals/:id/investors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
