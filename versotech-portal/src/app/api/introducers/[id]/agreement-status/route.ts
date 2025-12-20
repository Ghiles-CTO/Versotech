import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/introducers/:id/agreement-status
 * Check if an introducer has a valid signed agreement
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id: introducerId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access or user is part of this introducer
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id
    })

    const hasStaffAccess = personas?.some(
      (p: { persona_type: string }) => p.persona_type === 'staff'
    ) || false

    const isIntroducerUser = personas?.some(
      (p: { persona_type: string; entity_id: string }) =>
        p.persona_type === 'introducer' && p.entity_id === introducerId
    ) || false

    if (!hasStaffAccess && !isIntroducerUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get introducer details
    const { data: introducer, error: introducerError } = await serviceSupabase
      .from('introducers')
      .select('id, legal_name, agreement_doc_id, agreement_expiry_date, status')
      .eq('id', introducerId)
      .single()

    if (introducerError || !introducer) {
      return NextResponse.json({ error: 'Introducer not found' }, { status: 404 })
    }

    // Get latest agreement
    const today = new Date().toISOString().split('T')[0]
    const { data: agreements } = await serviceSupabase
      .from('introducer_agreements')
      .select(`
        id,
        agreement_type,
        signed_date,
        effective_date,
        expiry_date,
        status,
        default_commission_bps,
        territory
      `)
      .eq('introducer_id', introducerId)
      .order('created_at', { ascending: false })

    const activeAgreement = agreements?.find(
      a => a.status === 'active' &&
           a.signed_date &&
           (!a.expiry_date || a.expiry_date >= today)
    )

    const hasValidAgreement = !!activeAgreement
    const isExpired = agreements?.some(
      a => a.signed_date && a.expiry_date && a.expiry_date < today
    ) || false

    return NextResponse.json({
      introducer_id: introducerId,
      introducer_name: introducer.legal_name,
      agreement_signed: hasValidAgreement,
      signed_at: activeAgreement?.signed_date || null,
      effective_date: activeAgreement?.effective_date || null,
      expiry_date: activeAgreement?.expiry_date || null,
      can_introduce: hasValidAgreement,
      status: hasValidAgreement ? 'active' : isExpired ? 'expired' : 'pending',
      agreement_details: activeAgreement ? {
        id: activeAgreement.id,
        type: activeAgreement.agreement_type,
        commission_bps: activeAgreement.default_commission_bps,
        territory: activeAgreement.territory
      } : null,
      message: hasValidAgreement
        ? 'Introducer has a valid signed agreement'
        : isExpired
          ? 'Introducer agreement has expired. Please renew.'
          : 'Introducer must sign fee agreement before introducing investors.'
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/introducers/:id/agreement-status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
